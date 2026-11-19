import {
  FEEDBACK_API,
  FEEDBACK_SITE,
  RECAPTCHA_AKTION,
  RECAPTCHA_SKRIPT,
  formatiereFeedbackDatum,
  leseRuecksprung,
  pruefeFeedback,
  type Art,
  type Eintrag,
  type FeedbackEingabe,
  type FeedbackTexte,
  type FeldFehler,
} from '../lib/feedback';
import type { Sprache } from '../lib/i18n';

/** Welches Feld zu welchem Fehlerschlüssel gehört: Element mit aria-invalid und die Fehlerzeile. */
const FELD_ZU_FEHLER: Record<Exclude<FeldFehler, 'site'>, { feld: string; zeile: string }> = {
  art: { feld: 'fb-art', zeile: 'fb-art-fehler' },
  textlaenge: { feld: 'fb-text', zeile: 'fb-text-fehler' },
  namelaenge: { feld: 'fb-name', zeile: 'fb-name-fehler' },
  mail: { feld: 'fb-mail', zeile: 'fb-mail-fehler' },
  oeffentlich: { feld: 'fb-oeffentlich', zeile: 'fb-oeffentlich-fehler' },
};

/** Was reCAPTCHA v3 nach dem Laden unter window.grecaptcha bereitstellt. */
interface Grecaptcha {
  ready(fertig: () => void): void;
  execute(sitekey: string, optionen: { action: string }): Promise<string>;
}

/** Wie lange auf Skript und Token gewartet wird, bevor ohne Token gesendet wird. */
const RECAPTCHA_GEDULD_MS = 10000;

let recaptchaLaden: Promise<boolean> | null = null;

/**
 * Bindet das Skript von reCAPTCHA genau einmal ein.
 * @param sitekey Öffentlicher Site-Key.
 * @returns true, wenn das Skript geladen ist, sonst false.
 */
function ladeRecaptcha(sitekey: string): Promise<boolean> {
  if (!recaptchaLaden) {
    recaptchaLaden = new Promise<boolean>((fertig) => {
      const skript = document.createElement('script');
      skript.src = `${RECAPTCHA_SKRIPT}${encodeURIComponent(sitekey)}`;
      skript.async = true;
      skript.onload = () => fertig(true);
      skript.onerror = () => {
        // Beim naechsten Fokus erneut versuchen
        recaptchaLaden = null;
        skript.remove();
        fertig(false);
      };
      document.head.append(skript);
    });
  }
  return recaptchaLaden;
}

/**
 * Holt direkt vor dem Senden ein frisches Token, weil Tokens nach zwei Minuten verfallen.
 * Jeder Fehler ergibt ein leeres Token, der Dienst entscheidet dann.
 * @param sitekey Öffentlicher Site-Key.
 * @returns Das Token oder ein leerer Text.
 */
async function holeRecaptchaToken(sitekey: string): Promise<string> {
  const versuch = (async () => {
    if (!(await ladeRecaptcha(sitekey))) {
      return '';
    }
    const g = (window as unknown as { grecaptcha?: Grecaptcha }).grecaptcha;
    if (!g) {
      return '';
    }
    await new Promise<void>((fertig) => g.ready(fertig));
    return await g.execute(sitekey, { action: RECAPTCHA_AKTION });
  })();
  const geduld = new Promise<string>((fertig) => setTimeout(() => fertig(''), RECAPTCHA_GEDULD_MS));
  try {
    return await Promise.race([versuch, geduld]);
  } catch {
    return '';
  }
}

function element<T extends HTMLElement>(id: string): T {
  return document.getElementById(id) as T;
}

/**
 * Startet Formular und Liste der Feedback-Seite.
 * Ohne das Formular auf der Seite passiert nichts.
 */
export function starteFeedback(): void {
  const form = document.getElementById('feedback');
  if (!(form instanceof HTMLFormElement)) {
    return;
  }
  const sprache = (form.dataset.sprache === 'en' ? 'en' : 'de') as Sprache;
  const texte = JSON.parse(form.dataset.texte ?? '{}') as FeedbackTexte;
  // Der Site-Key kommt aus RECAPTCHA_SITEKEY ueber das Formular, leer heisst kein reCAPTCHA
  const sitekey = (form.dataset.recaptcha ?? '').trim();
  if (sitekey) {
    document.querySelectorAll<HTMLElement>('[data-recaptcha-hinweis]').forEach((el) => {
      el.hidden = false;
    });
  }
  // Mit Skript prueft das Skript, die Browserpruefung bleibt fuer den Weg ohne JavaScript
  form.noValidate = true;

  const knopf = element<HTMLButtonElement>('fb-senden');
  const meldung = element<HTMLParagraphElement>('fb-meldung');
  const stempelFeld = form.elements.namedItem('stempel') as HTMLInputElement;

  const zeigeMeldung = (text: string, art: 'ok' | 'fehler'): void => {
    meldung.textContent = text;
    meldung.dataset.art = art;
    meldung.hidden = false;
  };
  const versteckeMeldung = (): void => {
    meldung.hidden = true;
    meldung.textContent = '';
  };

  const setzeFehler = (fehler: FeldFehler[]): void => {
    for (const [schluessel, ziel] of Object.entries(FELD_ZU_FEHLER)) {
      const aktiv = fehler.includes(schluessel as FeldFehler);
      const feld = element(ziel.feld);
      const zeile = element(ziel.zeile);
      if (aktiv) {
        feld.setAttribute('aria-invalid', 'true');
        zeile.textContent = texte.feld[schluessel as FeldFehler];
        zeile.hidden = false;
      } else {
        feld.removeAttribute('aria-invalid');
        zeile.textContent = '';
        zeile.hidden = true;
      }
    }
  };

  const fokussiereErstenFehler = (fehler: FeldFehler[]): void => {
    const erster = fehler.find((f) => f !== 'site') as Exclude<FeldFehler, 'site'> | undefined;
    if (!erster) {
      return;
    }
    const feld = element(FELD_ZU_FEHLER[erster].feld);
    // Bei einer Wahlgruppe den ersten Knopf fokussieren, die Gruppe selbst ist nicht fokussierbar
    const ziel = feld.matches('input, textarea') ? feld : feld.querySelector<HTMLInputElement>('input');
    ziel?.focus();
  };

  // Stempel erst beim ersten Fokus holen, damit ein blosser Seitenaufruf nichts an den Dienst schickt
  let stempelAnfrage: Promise<void> | null = null;
  const holeStempel = (): Promise<void> => {
    if (!stempelAnfrage) {
      stempelAnfrage = fetch(FEEDBACK_API.stempel, { credentials: 'omit' })
        .then((r) => r.json())
        .then((daten: { ok?: boolean; stempel?: string }) => {
          if (daten.ok && typeof daten.stempel === 'string') {
            stempelFeld.value = daten.stempel;
          }
        })
        .catch(() => {
          // Ohne Stempel entscheidet der Dienst, der Fehler zeigt sich dann beim Senden
          stempelAnfrage = null;
        });
    }
    return stempelAnfrage;
  };
  form.addEventListener('focusin', () => {
    void holeStempel();
    if (sitekey) {
      void ladeRecaptcha(sitekey);
    }
  });

  const lies = (name: string): string => {
    const wert = new FormData(form).get(name);
    return typeof wert === 'string' ? wert : '';
  };

  form.addEventListener('submit', async (ereignis) => {
    ereignis.preventDefault();
    versteckeMeldung();
    const eingabe: FeedbackEingabe = {
      art: lies('art'),
      text: lies('text'),
      name: lies('name'),
      mail: lies('mail'),
      oeffentlich: lies('oeffentlich'),
    };
    const fehler = pruefeFeedback(eingabe);
    setzeFehler(fehler);
    if (fehler.length) {
      fokussiereErstenFehler(fehler);
      return;
    }

    knopf.disabled = true;
    knopf.textContent = texte.sendet;
    try {
      await holeStempel();
      const token = sitekey ? await holeRecaptchaToken(sitekey) : '';
      const antwort = await fetch(FEEDBACK_API.senden, {
        method: 'POST',
        credentials: 'omit',
        headers: { 'Content-Type': 'application/json', Accept: 'application/json' },
        body: JSON.stringify({
          site: FEEDBACK_SITE,
          sprache,
          art: eingabe.art,
          text: eingabe.text.trim(),
          name: eingabe.name.trim(),
          mail: eingabe.mail.trim(),
          oeffentlich: eingabe.oeffentlich,
          stempel: stempelFeld.value,
          webseite: lies('webseite'),
          ...(token ? { recaptcha: token } : {}),
        }),
      });
      const daten = (await antwort.json().catch(() => ({}))) as { ergebnis?: string; fehler?: string };
      if (antwort.ok && daten.ergebnis === 'gesendet') {
        form.reset();
        // Der Stempel gilt fuer eine Einsendung, beim naechsten Fokus gibt es einen neuen
        stempelAnfrage = null;
        setzeFehler([]);
        zeigeMeldung(texte.gesendet, 'ok');
        meldung.focus();
      } else if (antwort.status === 422 && daten.fehler && daten.fehler !== 'site' && daten.fehler in FELD_ZU_FEHLER) {
        const feldFehler = [daten.fehler as FeldFehler];
        setzeFehler(feldFehler);
        fokussiereErstenFehler(feldFehler);
      } else if (antwort.status === 429) {
        zeigeMeldung(texte.zuViele, 'fehler');
      } else {
        zeigeMeldung(texte.fehler, 'fehler');
      }
    } catch {
      zeigeMeldung(texte.fehler, 'fehler');
    } finally {
      knopf.disabled = false;
      knopf.textContent = texte.senden;
    }
  });

  // Rueckweg ohne JavaScript: der Dienst haengt das Ergebnis an die Adresse
  const ruecksprung = leseRuecksprung(location.search);
  if (ruecksprung) {
    if (ruecksprung.ergebnis === 'gesendet') {
      zeigeMeldung(texte.gesendet, 'ok');
    } else if (ruecksprung.ergebnis === 'zu-viele') {
      zeigeMeldung(texte.zuViele, 'fehler');
    } else if (ruecksprung.ergebnis === 'ungueltig' && ruecksprung.grund && ruecksprung.grund !== 'site') {
      setzeFehler([ruecksprung.grund]);
      zeigeMeldung(texte.feld[ruecksprung.grund], 'fehler');
    } else {
      zeigeMeldung(texte.fehler, 'fehler');
    }
    // Ohne den Parameter zeigt ein Neuladen die Meldung nicht noch einmal
    history.replaceState(null, '', `${location.pathname}#feedback`);
    meldung.scrollIntoView({ block: 'center' });
  }

  void ladeEintraege(sprache, texte);
}

/**
 * Holt die freigegebenen Einträge vom Dienst. Im Dev-Server stattdessen die Musterdaten,
 * damit die Liste in der Vorschau gefüllt ist. Der DEV-Zweig fällt im Produktionsbuild weg.
 * @returns Die Antwort im Format von oeffentlich.php.
 */
async function holeEintraege(): Promise<{ ok?: boolean; eintraege?: Eintrag[] }> {
  if (import.meta.env.DEV) {
    const { FEEDBACK_MUSTER } = await import('../lib/feedback-muster');
    return { ok: true, eintraege: FEEDBACK_MUSTER };
  }
  const antwort = await fetch(FEEDBACK_API.oeffentlich, { credentials: 'omit' });
  if (!antwort.ok) {
    throw new Error(String(antwort.status));
  }
  return (await antwort.json()) as { ok?: boolean; eintraege?: Eintrag[] };
}

/**
 * Lädt die freigegebenen Einträge und baut die Liste nur aus Textknoten,
 * weil es fremder Inhalt ist.
 * @param sprache Sprache der Seite, bestimmt das Datumsformat.
 * @param texte Bezeichnungen der Arten.
 */
async function ladeEintraege(sprache: Sprache, texte: FeedbackTexte): Promise<void> {
  const bereich = element<HTMLElement>('eintraege');
  const liste = element<HTMLUListElement>('eintraege-liste');
  const leer = element<HTMLParagraphElement>('eintraege-leer');
  const ladefehler = element<HTMLParagraphElement>('eintraege-fehler');
  const zahl = element<HTMLSpanElement>('eintraege-zahl');
  const linien = element<HTMLDivElement>('eintraege-linien');
  bereich.hidden = false;
  try {
    const daten = await holeEintraege();
    if (!daten.ok || !Array.isArray(daten.eintraege)) {
      throw new Error('Antwort unbrauchbar');
    }
    liste.replaceChildren(...daten.eintraege.map((e) => baueEintrag(e, sprache, texte)));
    const anzahl = daten.eintraege.length;
    liste.hidden = anzahl === 0;
    leer.hidden = anzahl !== 0;
    // Leere Schreiblinien wie auf einem nicht ausgefuellten Beleg
    linien.hidden = anzahl !== 0;
    zahl.textContent = anzahl === 1 ? texte.zahlEins : texte.zahlViele.replace('{n}', String(anzahl));
    zahl.hidden = anzahl === 0;
  } catch {
    liste.hidden = true;
    leer.hidden = true;
    ladefehler.hidden = false;
    linien.hidden = false;
    zahl.hidden = true;
  }
}

/**
 * Baut einen Listeneintrag mit createElement und textContent, nie mit innerHTML.
 * @param e Der Eintrag vom Dienst.
 * @param sprache Sprache der Seite.
 * @param texte Bezeichnungen der Arten.
 * @returns Das fertige Listenelement.
 */
function baueEintrag(e: Eintrag, sprache: Sprache, texte: FeedbackTexte): HTMLLIElement {
  const li = document.createElement('li');
  li.className = 'urteil feedback-eintrag';
  const meta = document.createElement('div');
  meta.className = 'meta';
  const art = document.createElement('b');
  art.textContent = texte.arten[e.art as Art] ?? String(e.art);
  const datum = document.createElement('span');
  datum.textContent = formatiereFeedbackDatum(String(e.datum), sprache);
  meta.append(art, datum);
  const name = typeof e.name === 'string' ? e.name.trim() : '';
  if (name) {
    const wer = document.createElement('span');
    wer.textContent = name;
    meta.append(wer);
  }
  const text = document.createElement('p');
  text.textContent = String(e.text);
  // Der Eintrag kann in der anderen Sprache geschrieben sein
  if (e.sprache === 'de' || e.sprache === 'en') {
    text.lang = e.sprache;
  }
  li.append(meta, text);
  return li;
}
