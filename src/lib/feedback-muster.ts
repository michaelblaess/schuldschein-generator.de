import type { Eintrag } from './feedback';

/**
 * Musterdaten für die Vorschau im Dev-Server, aus feedback-dienst/docs/musterdaten.json.
 * Wird nur im DEV-Zweig von src/scripts/feedback.ts geladen und fehlt im Produktionsbuild.
 */
export const FEEDBACK_MUSTER: Eintrag[] = [
  {
    "id": 9001,
    "datum": "2026-11-18",
    "sprache": "de",
    "art": "lob",
    "text": "Genau das, was ich gesucht habe. Danke!",
    "name": "Sabine"
  },
  {
    "id": 9002,
    "datum": "2026-11-16",
    "sprache": "de",
    "art": "fehler",
    "text": "Auf dem Handy springt beim Umschalten auf dunkel die Seite kurz nach oben. Passiert bei mir mit Firefox auf Android, mit Chrome nicht. Sonst läuft alles gut.",
    "name": null
  },
  {
    "id": 9003,
    "datum": "2026-11-12",
    "sprache": "en",
    "art": "vorschlag",
    "text": "Would be great to have a short summary at the top of each page.\nSomething like three bullet points, so people in a hurry get the gist.\nThe details below are fine as they are.\nThanks for keeping it free and without sign-up.",
    "name": "Tom"
  },
  {
    "id": 9004,
    "datum": "2026-11-05",
    "sprache": "de",
    "art": "vorschlag",
    "text": "Ich habe die Seite inzwischen dreimal benutzt und finde sie sehr übersichtlich. Zwei Ideen hätte ich trotzdem.\n\nErstens: Eine Druckansicht, die ohne Kopf und Fuß auskommt, wäre praktisch. Manche Drucker schneiden sonst den Rand ab.\n\nZweitens: Eine kurze Erklärung, was man tun kann, wenn etwas schiefgeht. Zum Beispiel, wenn sich jemand nicht meldet oder etwas nicht zurückkommt. Kein langer Text, nur ein paar Sätze mit einem Hinweis, wo man weiterlesen kann.\n\nSiehe auch https://example.org/hilfe, dort ist das ähnlich gelöst.\n\nAnsonsten: weiter so, und danke für die Mühe!",
    "name": "Jürgen M."
  },
  {
    "id": 9005,
    "datum": "2026-10-28",
    "sprache": "de",
    "art": "lob",
    "text": "Kurz und knapp: <b>super</b> & schnell. (Dieser Eintrag prüft nebenbei, dass HTML als Text erscheint.)",
    "name": "Max <script>"
  }
];
