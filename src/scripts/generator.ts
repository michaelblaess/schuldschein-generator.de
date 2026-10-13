import { leseBetrag } from '../lib/betrag';
import { heute, leseIso, vergleiche } from '../lib/datum';
import { zeichneDokument } from '../lib/dokument-dom';
import type { Sprache } from '../lib/i18n';
import { istGueltigeIban } from '../lib/iban';
import type { Rhythmus } from '../lib/raten';
import { GT } from '../lib/texte-generator';
import { erzeugeVertrag, leereAngaben, type Angaben, type Auszahlung, type Fassung } from '../lib/vertrag';
import { betragInWorten } from '../lib/zahlwort';

const SPEICHER = 'schuldschein-eingaben';

/** Alle Felder, die gemerkt werden koennen. Radios und Haekchen werden gesondert behandelt. */
const TEXTFELDER = [
  'geber_name', 'nehmer_name', 'geber_adresse', 'nehmer_adresse', 'summe', 'zurueck', 'zinssatz', 'rhythmus', 'erste',
  'geber_geburt', 'geber_ausweis', 'nehmer_geburt', 'nehmer_ausweis', 'geber_iban', 'nehmer_iban', 'zweck',
  'zeuge_name', 'zeuge_adresse', 'zeuge_geburt', 'zeuge_ausweis',
];

function feld(id: string): HTMLInputElement {
  return document.getElementById(id) as HTMLInputElement;
}

function wert(id: string): string {
  return feld(id)?.value.trim() ?? '';
}

function gewaehlt(name: string): string {
  return (document.querySelector(`input[name="${name}"]:checked`) as HTMLInputElement | null)?.value ?? '';
}

/** Liest einen Zinssatz wie "2,5" oder "2.5". Leer ist zinslos, Unsinn ist null. */
function leseZins(eingabe: string): number | null | 'fehler' {
  if (!eingabe) {
    return null;
  }
  const zahl = Number(eingabe.replace(/,/g, '.').replace(/%/g, '').trim());
  return Number.isFinite(zahl) && zahl >= 0 && zahl < 100 ? zahl : 'fehler';
}

function zeigeFehler(id: string, text: string): void {
  const f = feld(id);
  const box = document.getElementById(`${id}-fehler`);
  if (!f || !box) {
    return;
  }
  f.setAttribute('aria-invalid', text ? 'true' : 'false');
  box.textContent = text;
  box.hidden = !text;
}

function sprich(s: Sprache): string {
  return s === 'de' ? 'de-DE' : 'en-GB';
}

/**
 * Verbindet Formular, Vorschau, Leiste und Speicher. Wird einmal beim Laden aufgerufen.
 */
export function starteGenerator(): void {
  const wurzel = document.getElementById('generator');
  if (!wurzel) {
    return;
  }
  const sprache = (wurzel.dataset.sprache === 'en' ? 'en' : 'de') as Sprache;
  const g = GT[sprache];
  const blatt = document.querySelector<HTMLElement>('#dokument .blatt');
  const merken = feld('merken');
  let letzteAngaben: Angaben = leereAngaben();
  let letzteFassung: Fassung = 'kompakt';

  const lade = () => {
    try {
      const roh = localStorage.getItem(SPEICHER);
      if (!roh) {
        return;
      }
      const daten = JSON.parse(roh) as Record<string, string>;
      for (const id of TEXTFELDER) {
        if (typeof daten[id] === 'string' && feld(id)) {
          feld(id).value = daten[id];
        }
      }
      feld('unbefristet').checked = daten.unbefristet === '1';
      for (const name of ['auszahlung', 'fassung']) {
        const radio = document.querySelector<HTMLInputElement>(`input[name="${name}"][value="${daten[name]}"]`);
        if (radio) {
          radio.checked = true;
        }
      }
      merken.checked = true;
    } catch {
      // Gesperrter oder kaputter Speicher: dann eben mit leerem Formular
    }
  };

  const speichere = () => {
    try {
      if (!merken.checked) {
        localStorage.removeItem(SPEICHER);
        return;
      }
      const daten: Record<string, string> = {};
      for (const id of TEXTFELDER) {
        daten[id] = feld(id)?.value ?? '';
      }
      daten.unbefristet = feld('unbefristet').checked ? '1' : '';
      daten.auszahlung = gewaehlt('auszahlung');
      daten.fassung = gewaehlt('fassung');
      localStorage.setItem(SPEICHER, JSON.stringify(daten));
    } catch {
      // Ohne Speicher geht nichts verloren ausser dem Merken
    }
  };

  const aktualisiere = () => {
    const a = leereAngaben();
    const heuteTag = heute();
    a.geber.name = wert('geber_name');
    a.geber.adresse = wert('geber_adresse');
    a.nehmer.name = wert('nehmer_name');
    a.nehmer.adresse = wert('nehmer_adresse');
    a.geber.geburt = leseIso(wert('geber_geburt'));
    a.nehmer.geburt = leseIso(wert('nehmer_geburt'));
    a.geber.ausweis = wert('geber_ausweis');
    a.nehmer.ausweis = wert('nehmer_ausweis');
    a.zweck = wert('zweck');
    a.zeuge = { name: wert('zeuge_name'), adresse: wert('zeuge_adresse'), geburt: leseIso(wert('zeuge_geburt')), ausweis: wert('zeuge_ausweis') };
    a.auszahlung = (gewaehlt('auszahlung') || 'bar') as Auszahlung;
    a.rhythmus = (wert('rhythmus') || 'einmal') as Rhythmus;

    // Betrag
    const summeText = wert('summe');
    a.cent = summeText ? leseBetrag(summeText) : null;
    zeigeFehler('summe', summeText && a.cent === null ? g.fehlerBetrag : '');
    const worte = document.getElementById('summe-worte');
    if (worte) {
      worte.textContent = a.cent ? betragInWorten(a.cent, sprache) : '';
    }

    // Rueckzahlung
    a.unbefristet = feld('unbefristet').checked;
    const zurueckFeld = feld('zurueck');
    zurueckFeld.disabled = a.unbefristet;
    zurueckFeld.required = !a.unbefristet;
    a.zurueck = a.unbefristet ? null : leseIso(wert('zurueck'));
    zeigeFehler('zurueck', a.zurueck && vergleiche(a.zurueck, heuteTag) < 0 ? g.fehlerVergangen : '');
    a.ersteRate = leseIso(wert('erste'));
    zeigeFehler('erste', a.ersteRate && a.zurueck && vergleiche(a.ersteRate, a.zurueck) > 0 ? g.fehlerRaten : '');

    // Zinsen
    const zins = leseZins(wert('zinssatz'));
    zeigeFehler('zinssatz', zins === 'fehler' ? g.fehlerZins : '');
    a.zinssatz = zins === 'fehler' ? null : zins;

    // IBAN
    for (const id of ['geber_iban', 'nehmer_iban']) {
      const iban = wert(id);
      zeigeFehler(id, iban && !istGueltigeIban(iban) ? g.fehlerIban : '');
    }
    a.geber.iban = istGueltigeIban(wert('geber_iban')) ? wert('geber_iban') : '';
    a.nehmer.iban = istGueltigeIban(wert('nehmer_iban')) ? wert('nehmer_iban') : '';

    // Zusammenfassungen der Streifen, damit man auch zugeklappt sieht, was gilt
    const setze = (schluessel: string, text: string) => {
      const el = document.querySelector(`[data-zusammenfassung="${schluessel}"]`);
      if (el) {
        el.textContent = text;
      }
    };
    setze('zinsen', a.zinssatz ? `${a.zinssatz.toLocaleString(sprich(sprache))}${g.proJahr}` : g.zinslos);
    setze('raten', a.rhythmus === 'monatlich' ? g.monatlich : a.rhythmus === 'vierteljaehrlich' ? g.vierteljaehrlich : g.einmal);
    setze('bank', a.geber.iban || a.nehmer.iban ? g.angegeben : g.nichtAngegeben);
    setze('zweck', a.zweck ? g.angegeben : g.nichtAngegeben);
    setze('zeuge', a.zeuge.name || g.keine);

    // Pflichtangaben: jede Pruefung ein Kaestchen in der Leiste
    const pflicht: { ok: boolean; name: string }[] = [
      { ok: !!a.geber.name, name: g.pflicht.geber_name },
      { ok: !!a.geber.adresse, name: g.pflicht.geber_adresse },
      { ok: !!a.nehmer.name, name: g.pflicht.nehmer_name },
      { ok: !!a.nehmer.adresse, name: g.pflicht.nehmer_adresse },
      { ok: !!a.nehmer.geburt, name: g.pflicht.nehmer_geburt },
      { ok: !!a.nehmer.ausweis, name: g.pflicht.nehmer_ausweis },
      { ok: !!a.cent, name: g.pflicht.summe },
      { ok: a.unbefristet || !!a.zurueck, name: g.pflicht.zurueck },
    ];
    if (a.rhythmus !== 'einmal') {
      pflicht.push({ ok: !!a.ersteRate, name: g.pflicht.erste });
    }
    const erledigt = pflicht.filter((p) => p.ok).length;
    const fehlend = pflicht.filter((p) => !p.ok).map((p) => p.name);
    const kaestchen = document.getElementById('fortschritt');
    if (kaestchen) {
      kaestchen.replaceChildren(...pflicht.map((_, i) => {
        const k = document.createElement('span');
        k.className = i < erledigt ? 'voll' : '';
        return k;
      }));
      kaestchen.setAttribute('aria-valuemax', String(pflicht.length));
      kaestchen.setAttribute('aria-valuenow', String(erledigt));
    }
    const titel = document.getElementById('stand-titel');
    const text = document.getElementById('stand-text');
    if (titel && text) {
      titel.textContent = fehlend.length === 0 ? g.allesDa : `${erledigt}${g.von}${pflicht.length}${g.pflichtangaben}`;
      text.textContent = fehlend.length === 0 ? g.jetzt : `${g.fehlt}${fehlend.join(', ')}`;
    }

    letzteFassung = (gewaehlt('fassung') || 'kompakt') as Fassung;
    letzteAngaben = a;
    if (blatt) {
      zeichneDokument(blatt, erzeugeVertrag(a, letzteFassung, sprache));
    }
    speichere();
  };

  lade();
  aktualisiere();
  document.addEventListener('input', aktualisiere);
  document.addEventListener('change', aktualisiere);

  document.getElementById('leeren')?.addEventListener('click', () => {
    for (const id of TEXTFELDER) {
      if (feld(id)) {
        feld(id).value = id === 'rhythmus' ? 'einmal' : '';
      }
    }
    feld('unbefristet').checked = false;
    for (const name of ['auszahlung', 'fassung']) {
      const erstes = document.querySelector<HTMLInputElement>(`input[name="${name}"]`);
      if (erstes) {
        erstes.checked = true;
      }
    }
    aktualisiere();
    feld('geber_name').focus();
  });

  document.getElementById('drucken')?.addEventListener('click', () => window.print());

  const pdfKnopf = document.getElementById('pdf') as HTMLButtonElement | null;
  pdfKnopf?.addEventListener('click', async () => {
    pdfKnopf.disabled = true;
    pdfKnopf.textContent = pdfKnopf.dataset.laeuft ?? '';
    try {
      // Erst beim Klick laden: pdf-lib ist gross und wird nur hier gebraucht
      const { erzeugePdf } = await import('../lib/pdf');
      const bausteine = erzeugeVertrag(letzteAngaben, letzteFassung, sprache);
      const bytes = await erzeugePdf(bausteine, g.datei);
      const name = [g.datei, letzteAngaben.nehmer.name]
        .filter(Boolean)
        .join('_')
        .normalize('NFD')
        .replace(/[̀-ͯ]/g, '')
        .replace(/[^A-Za-z0-9_.-]+/g, '-');
      const url = URL.createObjectURL(new Blob([bytes as BlobPart], { type: 'application/pdf' }));
      const a = document.createElement('a');
      a.href = url;
      a.download = `${name}.pdf`;
      document.body.append(a);
      a.click();
      a.remove();
      setTimeout(() => URL.revokeObjectURL(url), 5000);
    } finally {
      pdfKnopf.disabled = false;
      pdfKnopf.textContent = pdfKnopf.dataset.text ?? '';
    }
  });
}

