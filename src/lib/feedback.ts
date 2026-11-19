import type { Sprache } from './i18n';

/** Basisadresse des Feedback-Dienstes, gemeinsam für alle drei Seiten. */
export const FEEDBACK_DIENST = 'https://feedback.michaelblaess.de';

/**
 * Öffentlicher Site-Key für Google reCAPTCHA v3. Leer heißt: kein reCAPTCHA, es wird nichts
 * von Google geladen und kein Token geschickt, der Dienst überspringt dann die Prüfung.
 */
export const RECAPTCHA_SITEKEY = '6Lf6hCguAAAAAGRZzRUtl85GnXdQSvEbjLhy8LRa';

/** Skript von reCAPTCHA v3, der Site-Key wird angehängt. */
export const RECAPTCHA_SKRIPT = 'https://www.google.com/recaptcha/api.js?render=';

/** Aktion, unter der reCAPTCHA die Einsendung bewertet. */
export const RECAPTCHA_AKTION = 'feedback';

/** Kennung dieser Seite beim Feedback-Dienst. */
export const FEEDBACK_SITE = 'schuldschein-generator.de';

/** Endpunkte des Dienstes. */
export const FEEDBACK_API = {
  stempel: `${FEEDBACK_DIENST}/api/stempel.php`,
  senden: `${FEEDBACK_DIENST}/api/feedback.php`,
  oeffentlich: `${FEEDBACK_DIENST}/api/oeffentlich.php?site=${encodeURIComponent(FEEDBACK_SITE)}`,
} as const;

export const ARTEN = ['lob', 'fehler', 'vorschlag'] as const;
export type Art = (typeof ARTEN)[number];

export const TEXT_MIN = 10;
export const TEXT_MAX = 2000;
export const NAME_MAX = 200;

/** Fehlerschlüssel, die der Dienst bei 422 zurückgibt und die die Prüfung im Browser ebenfalls kennt. */
export type FeldFehler = 'textlaenge' | 'mail' | 'art' | 'oeffentlich' | 'namelaenge' | 'site';

/** Ergebnis eines Sendeversuchs, so wie es auch im Rücksprung ?feedback= steht. */
export type Ergebnis = 'gesendet' | 'ungueltig' | 'zu-viele' | 'fehler';

/** Eingaben des Formulars, wie sie an den Dienst gehen. */
export interface FeedbackEingabe {
  art: string;
  text: string;
  name: string;
  mail: string;
  oeffentlich: string;
}

/** Ein freigegebener Eintrag aus oeffentlich.php. */
export interface Eintrag {
  id: number | string;
  datum: string;
  sprache: string;
  art: string;
  text: string;
  name: string | null;
}

/** Texte, die das Skript im Browser braucht. Sie kommen als JSON am Formular mit. */
export interface FeedbackTexte {
  arten: Record<Art, string>;
  /** Anzahl der Einträge in der Kopfzeile der Liste, "{n}" wird ersetzt. */
  zahlEins: string;
  zahlViele: string;
  senden: string;
  sendet: string;
  gesendet: string;
  zuViele: string;
  fehler: string;
  feld: Record<FeldFehler, string>;
}

const MAIL_MUSTER = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

/**
 * Zählt Zeichen wie der Dienst: nach dem Trimmen und je Codepoint, nicht je UTF-16-Einheit.
 * @param text Eingabe aus dem Textfeld.
 * @returns Anzahl der Zeichen.
 */
export function zeichenzahl(text: string): number {
  return Array.from(text.trim()).length;
}

/**
 * Prüft die Eingaben mit denselben Regeln wie der Dienst.
 * @param e Die Formularwerte.
 * @returns Alle verletzten Regeln in der Reihenfolge der Felder, leer bei gültiger Eingabe.
 */
export function pruefeFeedback(e: FeedbackEingabe): FeldFehler[] {
  const fehler: FeldFehler[] = [];
  if (!(ARTEN as readonly string[]).includes(e.art)) {
    fehler.push('art');
  }
  const laenge = zeichenzahl(e.text);
  if (laenge < TEXT_MIN || laenge > TEXT_MAX) {
    fehler.push('textlaenge');
  }
  if (zeichenzahl(e.name) > NAME_MAX) {
    fehler.push('namelaenge');
  }
  const mail = e.mail.trim();
  if (mail !== '' && !MAIL_MUSTER.test(mail)) {
    fehler.push('mail');
  }
  if (e.oeffentlich !== 'ja' && e.oeffentlich !== 'nein') {
    fehler.push('oeffentlich');
  }
  return fehler;
}

/**
 * Schreibt ein ISO-Datum so, wie die Seite Daten sonst zeigt: deutsch TT.MM.JJJJ, englisch TT/MM/JJJJ.
 * @param iso Datum als JJJJ-MM-TT.
 * @param sprache Sprache der Seite.
 * @returns Das formatierte Datum, bei unlesbarer Eingabe die Eingabe selbst.
 */
export function formatiereFeedbackDatum(iso: string, sprache: Sprache): string {
  const treffer = /^(\d{4})-(\d{2})-(\d{2})/.exec(iso);
  if (!treffer) {
    return iso;
  }
  const [, j, m, t] = treffer;
  return sprache === 'de' ? `${t}.${m}.${j}` : `${t}/${m}/${j}`;
}

/**
 * Liest das Ergebnis aus dem Rücksprung des Dienstes (ohne JavaScript abgeschickt).
 * @param suche Der Query-String der Seite, etwa location.search.
 * @returns Ergebnis und Grund oder null, wenn kein bekanntes Ergebnis drinsteht.
 */
export function leseRuecksprung(suche: string): { ergebnis: Ergebnis; grund: FeldFehler | null } | null {
  const p = new URLSearchParams(suche);
  const ergebnis = p.get('feedback');
  if (ergebnis !== 'gesendet' && ergebnis !== 'ungueltig' && ergebnis !== 'zu-viele' && ergebnis !== 'fehler') {
    return null;
  }
  const grund = p.get('grund');
  const bekannt: FeldFehler[] = ['textlaenge', 'mail', 'art', 'oeffentlich', 'namelaenge', 'site'];
  return { ergebnis, grund: bekannt.includes(grund as FeldFehler) ? (grund as FeldFehler) : null };
}
