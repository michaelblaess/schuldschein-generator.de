export type Sprache = 'de' | 'en';

export const SPRACHEN: Sprache[] = ['de', 'en'];

export type SeitenSchluessel = 'start' | 'vorlagen' | 'rechtslage' | 'fragen' | 'ueber' | 'impressum' | 'datenschutz' | 'nutzung';

/** Adresse jeder Seite je Sprache. Die Sprache haengt an der Adresse, nicht an einem Speicher. */
export const PFADE: Record<SeitenSchluessel, Record<Sprache, string>> = {
  start: { de: '/', en: '/en/' },
  vorlagen: { de: '/vorlagen/', en: '/en/templates/' },
  rechtslage: { de: '/rechtslage/', en: '/en/law/' },
  fragen: { de: '/fragen/', en: '/en/faq/' },
  ueber: { de: '/ueber/', en: '/en/about/' },
  impressum: { de: '/impressum/', en: '/en/legal-notice/' },
  datenschutz: { de: '/datenschutz/', en: '/en/privacy/' },
  nutzung: { de: '/nutzungsbedingungen/', en: '/en/terms/' },
};

export const DOMAIN = 'https://schuldschein-generator.de';

const TEXTE = {
  de: {
    marke: 'Schuldschein-Generator',
    'nav.start': 'Generator',
    'nav.github': 'Quellcode auf GitHub',
    'nav.vorlagen': 'Vorlagen',
    'nav.rechtslage': 'Rechtslage',
    'nav.fragen': 'Fragen',
    'nav.andereSprache': 'EN',
    'nav.andereSpracheLang': 'English',
    'nav.haupt': 'Hauptnavigation',
    'nav.recht': 'Rechtliches',
    'thema.dunkel': 'Dunkles Design',
    'thema.titelHell': 'Helles Design',
    'fuss.impressum': 'Impressum',
    'fuss.datenschutz': 'Datenschutz',
    'fuss.nutzung': 'Nutzungsbedingungen',
    'fuss.quellcode': 'Quellcode auf GitHub',
    'fuss.ueber': 'Über das Projekt',
    'consent.widerrufen': 'Cookie-Einstellungen',
    'haftung.kurz': 'Keine Rechtsberatung. Keine Haftung.',
    'haftung.lang': 'Der Vertrag passt für einfache Fälle unter Privatleuten. Bei hohen Beträgen, Sicherheiten oder Streit: lass ihn von einer Anwältin oder einem Anwalt prüfen.',
    'skip': 'Zum Inhalt springen',
    'consent.titel': 'Statistik erlauben?',
    'consent.text': 'Diese Seite misst mit Google Analytics, welche Seiten besucht und welche Dateien heruntergeladen oder gedruckt werden. Was Du in das Formular einträgst, erfährt Google nie. Ohne Deine Zustimmung wird nichts davon geladen und kein Cookie gesetzt. Du kannst die Entscheidung jederzeit unten auf jeder Seite ändern.',
    'consent.ja': 'Einverstanden',
    'consent.nein': 'Nur das Nötigste',
    'consent.details': 'Einstellungen',
    'consent.einstellungen.titel': 'Was gemessen wird',
    'consent.einstellungen.text': 'Es gibt keine Werbung, keine Weitergabe an Dritte und keine Profile. Gemessen wird nur, welche Seiten aufgerufen werden. Formularinhalte werden nie übertragen.',
    'consent.speichern': 'Auswahl speichern',
    'consent.notwendig.titel': 'Notwendig',
    'consent.notwendig.text': 'Deine Entscheidung über diesen Hinweis. Sie bleibt in Deinem Browser und wird nicht übertragen.',
    'consent.statistik.titel': 'Statistik',
    'consent.statistik.text': 'Google Analytics 4 zählt Seitenaufrufe und Zugriffsquellen. Dabei werden zwei Cookies gesetzt, die zwei Jahre gelten. Ohne diese Zustimmung wird das Skript gar nicht erst geladen.',
    'consent.spalte.name': 'Cookie',
    'consent.spalte.dauer': 'Gültig',
    'consent.zweiJahre': '2 Jahre',
  },
  en: {
    marke: 'Schuldschein-Generator',
    'nav.start': 'Generator',
    'nav.github': 'Source code on GitHub',
    'nav.vorlagen': 'Templates',
    'nav.rechtslage': 'The law',
    'nav.fragen': 'FAQ',
    'nav.andereSprache': 'DE',
    'nav.andereSpracheLang': 'Deutsch',
    'nav.haupt': 'Main navigation',
    'nav.recht': 'Legal',
    'thema.dunkel': 'Dark theme',
    'thema.titelHell': 'Light theme',
    'fuss.impressum': 'Legal notice',
    'fuss.datenschutz': 'Privacy',
    'fuss.nutzung': 'Terms of use',
    'fuss.quellcode': 'Source code on GitHub',
    'fuss.ueber': 'About',
    'consent.widerrufen': 'Cookie settings',
    'haftung.kurz': 'Not legal advice. No liability.',
    'haftung.lang': 'The agreement suits simple cases between private individuals. For large amounts, collateral or an existing dispute, have it checked by a lawyer.',
    'skip': 'Skip to content',
    'consent.titel': 'Allow statistics?',
    'consent.text': 'This site uses Google Analytics to see which pages are visited and which files are downloaded or printed. Google never learns what you type into the form. Without your consent none of it is loaded and no cookie is set. You can change your mind at any time at the bottom of every page.',
    'consent.ja': 'I agree',
    'consent.nein': 'Essentials only',
    'consent.details': 'Settings',
    'consent.einstellungen.titel': 'What is measured',
    'consent.einstellungen.text': 'There is no advertising, no sharing with third parties and no profiling. The only thing measured is which pages are opened. Form contents are never transmitted.',
    'consent.speichern': 'Save choice',
    'consent.notwendig.titel': 'Essential',
    'consent.notwendig.text': 'Your choice about this notice. It stays in your browser and is never transmitted.',
    'consent.statistik.titel': 'Statistics',
    'consent.statistik.text': 'Google Analytics 4 counts page views and traffic sources. It sets two cookies that last two years. Without this consent the script is not loaded at all.',
    'consent.spalte.name': 'Cookie',
    'consent.spalte.dauer': 'Expires',
    'consent.zweiJahre': '2 years',
  },
} as const;

export type TextSchluessel = keyof (typeof TEXTE)['de'];

/**
 * Liefert den Oberflächentext in der gewünschten Sprache.
 */
export function t(sprache: Sprache, schluessel: TextSchluessel): string {
  return TEXTE[sprache][schluessel];
}

/**
 * Pfad derselben Seite in der jeweils anderen Sprache, für Umschalter und hreflang.
 */
export function gegenstueck(schluessel: SeitenSchluessel, sprache: Sprache): string {
  return PFADE[schluessel][sprache === 'de' ? 'en' : 'de'];
}
