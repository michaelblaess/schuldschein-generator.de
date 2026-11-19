import { zaehlungAktiv } from './analytics';
import type { Sprache } from './i18n';

/*
 * Impressum, Datenschutz und Nutzungsbedingungen. Muster aus happy-watches.de/web/src/lib/recht.ts:
 * Abschnitte haengen an der Konfiguration. Ohne Mess-Kennung beschreibt die Erklaerung weder
 * Einwilligungsbanner noch Analytics, mit Kennung beschreibt sie beides.
 * Absaetze duerfen einfaches HTML enthalten, sie sind eigener Text und kommen nie aus Eingaben.
 */

export interface RechtsAbschnitt {
  titel: string;
  absaetze: string[];
  liste?: string[];
  nurMitZaehlung?: boolean;
  nurOhneZaehlung?: boolean;
}

export interface RechtsSeite {
  titel: string;
  beschreibung: string;
  stand: string;
  abschnitte: RechtsAbschnitt[];
}

type Zweisprachig = Record<Sprache, RechtsSeite>;

const adresse = 'Michael Blaess<br />Kurze Str. 2<br />15345 Rehfelde';
const mail = '<a href="mailto:info@schuldschein-generator.de">info@schuldschein-generator.de</a>';
const hoster = 'ALL-INKL.COM - Neue Medien Münnich, Inhaber René Münnich, Hauptstraße 68, 02742 Friedersdorf';
const quellcode = '<a href="https://github.com/michaelblaess/schuldschein-generator">github.com/michaelblaess/schuldschein-generator</a>';

export const IMPRESSUM: Zweisprachig = {
  de: {
    titel: 'Impressum',
    beschreibung: 'Impressum von schuldschein-generator.de, einem privaten, kostenlosen Angebot.',
    stand: 'Stand: 18.09.2026',
    abschnitte: [
      { titel: 'Angaben gemäß § 5 DDG', absaetze: [`${adresse}<br />Deutschland`] },
      { titel: 'Kontakt', absaetze: [`E-Mail: ${mail}`] },
      {
        titel: 'Privates Angebot',
        absaetze: [
          'Diese Seite ist ein privates, kostenloses Projekt ohne gewerbliche Absicht. Es gibt keine Werbung, keine Provisionen und keine kostenpflichtigen Leistungen.',
        ],
      },
      {
        titel: 'Keine Rechtsberatung',
        absaetze: [
          '<strong>Der Generator, die Vorlagen und alle Texte auf dieser Seite sind keine Rechtsberatung und ersetzen sie nicht.</strong> Sie helfen, eine einfache Vereinbarung unter Privatleuten festzuhalten. Ob ein Dokument im Einzelfall wirksam, vollständig und passend ist, kann nur eine Anwältin oder ein Anwalt beurteilen. Die Nutzung erfolgt auf eigene Verantwortung.',
          'Die Zusammenfassung der Rechtslage und die Urteile sind nach bestem Wissen zusammengestellt und mit Datum versehen. Gesetze und Rechtsprechung ändern sich, eine Gewähr für Richtigkeit und Aktualität wird nicht übernommen.',
        ],
      },
      {
        titel: 'Haftung für Links',
        absaetze: [
          'Diese Seite verlinkt auf Gesetzestexte, Gerichtsentscheidungen und andere externe Seiten. Für deren Inhalte sind ausschließlich die jeweiligen Betreiber verantwortlich. Zum Zeitpunkt der Verlinkung waren keine Rechtsverstöße erkennbar.',
        ],
      },
      {
        titel: 'Urheberrecht',
        absaetze: [
          `Texte, Gestaltung und Logo dieser Seite stammen von Michael Blaess. Der Quellcode steht unter der Apache-2.0-Lizenz und ist öffentlich einsehbar: ${quellcode}. Die erzeugten Schuldscheine und die heruntergeladenen Vorlagen darfst Du für Deine eigenen Vereinbarungen frei verwenden.`,
        ],
      },
      {
        titel: 'Marken',
        absaetze: [
          'Microsoft Word und GitHub sind Marken der Microsoft Corporation, Google Analytics ist eine Marke der Google LLC. Die Namen werden nur beschreibend verwendet, um Dateiformate und eingesetzte Dienste zu benennen. Es besteht keine Verbindung zu den Markeninhabern. Diese Seite ist ein privates Angebot und handelt nicht im geschäftlichen Verkehr.',
        ],
      },
      {
        titel: 'Verbraucherschlichtung',
        absaetze: ['Ich bin nicht bereit und nicht verpflichtet, an Streitbeilegungsverfahren vor einer Verbraucherschlichtungsstelle teilzunehmen.'],
      },
    ],
  },
  en: {
    titel: 'Legal notice',
    beschreibung: 'Legal notice for schuldschein-generator.de, a private, free service.',
    stand: 'Last updated: 18 September 2026',
    abschnitte: [
      { titel: 'Information according to § 5 DDG', absaetze: [`${adresse}<br />Germany`] },
      { titel: 'Contact', absaetze: [`Email: ${mail}`] },
      {
        titel: 'A private site',
        absaetze: ['This site is a private, free project with no commercial intent. There is no advertising, no commission and no paid service.'],
      },
      {
        titel: 'Not legal advice',
        absaetze: [
          '<strong>The generator, the templates and all texts on this site are not legal advice and do not replace it.</strong> They help to record a simple agreement between private individuals. Only a lawyer can judge whether a document is valid, complete and suitable in a particular case. You use this site at your own risk.',
          'The summary of the law and the court decisions have been compiled to the best of my knowledge and are dated. Statutes and case law change, so no guarantee is given that they are correct and up to date.',
        ],
      },
      {
        titel: 'Liability for links',
        absaetze: ['This site links to statutes, court decisions and other external pages. Their operators alone are responsible for their content. No violations were apparent at the time of linking.'],
      },
      {
        titel: 'Copyright',
        absaetze: [
          `Texts, design and logo of this site are by Michael Blaess. The source code is licensed under Apache 2.0 and publicly available: ${quellcode}. You may freely use the promissory notes you create and the templates you download for your own agreements.`,
        ],
      },
      {
        titel: 'Trademarks',
        absaetze: [
          'Microsoft Word and GitHub are trademarks of Microsoft Corporation, Google Analytics is a trademark of Google LLC. The names are used descriptively only, to refer to file formats and services used. There is no affiliation with the trademark owners. This site is a private, non-commercial service.',
        ],
      },
      {
        titel: 'Consumer dispute resolution',
        absaetze: ['I am neither willing nor obliged to take part in dispute resolution proceedings before a consumer arbitration board.'],
      },
    ],
  },
};

export const DATENSCHUTZ: Zweisprachig = {
  de: {
    titel: 'Datenschutzerklärung',
    beschreibung: 'Datenschutzerklärung von schuldschein-generator.de: Formulareingaben bleiben im Browser, Server-Logs, Speicher nur auf Wunsch.',
    stand: 'Stand: 19.11.2026',
    abschnitte: [
      {
        titel: 'Das Wichtigste zuerst',
        nurOhneZaehlung: true,
        absaetze: [
          'Was Sie in den Generator eintragen, wird ausschließlich in Ihrem Browser verarbeitet und nie an diesen Server oder an Dritte geschickt. Auch das PDF entsteht in Ihrem Browser. Es gibt keine Reichweitenmessung, keine Werbung und keine Benutzerkonten und deshalb auch keinen Einwilligungsbanner. Was Sie über das Feedback-Formular schicken, wird dagegen gespeichert, siehe Abschnitt "Feedback". Auf der Feedback-Seite lädt das Formular beim ersten Klick Google reCAPTCHA gegen Spam, siehe Abschnitt "Google reCAPTCHA".',
        ],
      },
      {
        titel: 'Das Wichtigste zuerst',
        nurMitZaehlung: true,
        absaetze: [
          'Was Sie in den Generator eintragen, wird ausschließlich in Ihrem Browser verarbeitet und nie an diesen Server oder an Dritte geschickt, auch nicht an Google. Auch das PDF entsteht in Ihrem Browser. Nur wenn Sie zustimmen, misst Google Analytics, welche Seiten besucht und welche Vorlagen heruntergeladen werden und ob ein Schuldschein als PDF gespeichert oder gedruckt wird. Es gibt keine Werbung und keine Benutzerkonten. Was Sie über das Feedback-Formular schicken, wird dagegen gespeichert, siehe Abschnitt "Feedback". Auf der Feedback-Seite lädt das Formular beim ersten Klick Google reCAPTCHA gegen Spam, siehe Abschnitt "Google reCAPTCHA".',
        ],
      },
      {
        titel: 'Verantwortlicher',
        absaetze: [`${adresse}<br />Deutschland`, `Kontakt: ${mail}`, 'Ein Datenschutzbeauftragter ist nicht erforderlich.'],
      },
      {
        titel: 'Hosting und Server-Logdateien',
        absaetze: [
          `Diese Seite liegt bei ${hoster}. Beim Aufruf speichert der Server automatisch, was Ihr Browser übermittelt: IP-Adresse, Datum und Uhrzeit, aufgerufene Adresse, vorher besuchte Seite, Browser und Betriebssystem. Diese Daten braucht der Betrieb für Technik, Sicherheit und Fehlersuche. Rechtsgrundlage ist Art. 6 Abs. 1 lit. f DSGVO.`,
          zaehlungAktiv
            ? 'Schriften und Bilder liegen auf demselben Server, externe Schriftarten werden nicht nachgeladen. Externe Skripte lädt die Seite nur in zwei Fällen: Google Analytics nach Ihrer Einwilligung und Google reCAPTCHA auf der Feedback-Seite nach dem ersten Klick in das Formular (siehe unten). Die Feedback-Seite lädt zusätzlich Daten von feedback.michaelblaess.de (siehe Abschnitt "Feedback").'
            : 'Schriften und Bilder liegen auf demselben Server, externe Schriftarten werden nicht nachgeladen. Ein externes Skript lädt nur die Feedback-Seite, nämlich Google reCAPTCHA nach dem ersten Klick in das Formular (siehe unten). Die Feedback-Seite lädt zusätzlich Daten von feedback.michaelblaess.de (siehe Abschnitt "Feedback").',
        ],
      },
      {
        titel: 'Formulareingaben und PDF',
        absaetze: [
          'Namen, Anschriften, Beträge und alle anderen Angaben im Generator verlassen Ihr Gerät nicht. Die Vorschau, das PDF und der Ausdruck werden vollständig im Browser erzeugt. Es gibt keine Stelle, an der diese Daten auf dem Server ankommen könnten.',
        ],
      },
      {
        titel: 'Speicher im Browser (Local Storage)',
        absaetze: [
          'Diese Seite legt nur dann etwas im Speicher Ihres Browsers ab, wenn Sie es ausdrücklich auslösen:',
        ],
        liste: [
          '<code>thema</code>: Ihre Wahl hell oder dunkel, erst nachdem Sie den Schalter benutzt haben.',
          '<code>schuldschein-eingaben</code>: Ihre Formulareingaben, nur wenn Sie das Häkchen "Eingaben auf diesem Gerät merken" setzen. Nehmen Sie es wieder heraus oder leeren das Formular, wird der Eintrag gelöscht.',
        ],
      },
      {
        titel: 'Cookies und Einwilligung',
        nurMitZaehlung: true,
        absaetze: [
          'Der Einwilligungsbanner läuft vollständig auf diesem Server, es wird dafür kein Dienst eines Drittanbieters geladen. Verwendet wird die quelloffene Bibliothek vanilla-cookieconsent.',
          'Ihre Entscheidung wird im Cookie <code>cc_cookie</code> gespeichert, damit die Frage nicht bei jedem Aufruf erneut kommt. Es gilt sechs Monate, enthält keine Kennung Ihrer Person und wird nicht übertragen. Rechtsgrundlage ist Art. 6 Abs. 1 lit. f DSGVO.',
          'Solange Sie nicht zustimmen, wird Google Analytics nicht geladen und kein Analytics-Cookie gesetzt. Davon unabhängig lädt die Feedback-Seite nach dem ersten Klick in das Formular Google reCAPTCHA, siehe Abschnitt "Google reCAPTCHA". Sie können Ihre Entscheidung jederzeit über "Cookie-Einstellungen" unten auf jeder Seite ändern.',
        ],
      },
      {
        titel: 'Google Analytics',
        nurMitZaehlung: true,
        absaetze: [
          'Mit Ihrer Einwilligung nutzt diese Seite Google Analytics 4 von Google Ireland Limited, Gordon House, Barrow Street, Dublin 4, Irland, um auszuwerten, welche Seiten besucht und welche Vorlagen heruntergeladen werden und ob ein Schuldschein als PDF gespeichert oder gedruckt wird. Das Skript wird erst nach Ihrer Zustimmung zur Kategorie Statistik geladen, vorher geht keine Anfrage an Google Analytics. Dabei werden die Cookies <code>_ga</code> und <code>_ga_</code> mit der Mess-Kennung gesetzt, die zwei Jahre gelten. Formularinhalte werden nie übermittelt. Google Signale und Werbefunktionen sind abgeschaltet. Rechtsgrundlage ist Art. 6 Abs. 1 lit. a DSGVO, Sie können die Einwilligung jederzeit widerrufen. Mehr in der <a href="https://policies.google.com/privacy">Datenschutzerklärung von Google</a>.',
        ],
      },
      {
        titel: 'Feedback',
        absaetze: [
          'Über die Seite <a href="/feedback/">Feedback</a> können Sie Lob, Fehler und Vorschläge schicken. Das Formular sendet Ihre Angaben an einen eigenen Dienst unter feedback.michaelblaess.de, der ebenfalls bei ALL-INKL in Deutschland liegt und vom selben Verantwortlichen betrieben wird. Gespeichert werden das Datum, die gewählte Art, Ihr Text und, falls angegeben, Ihr Name und Ihre Mailadresse. Ihre IP-Adresse wird nicht gespeichert. Zum Schutz vor Spam wird für einen Tag ein Prüfwert gebildet, der sich nicht auf die IP-Adresse zurückrechnen lässt. Rechtsgrundlage ist Art. 6 Abs. 1 lit. f DSGVO, das berechtigte Interesse liegt darin, Rückmeldungen zur Seite zu erhalten und Missbrauch abzuwehren.',
          `Veröffentlicht wird Ihr Text nur, wenn Sie das im Formular ausdrücklich wählen, und erst nach Prüfung. Dann erscheinen Text, Art, Datum und, falls angegeben, Ihr Name auf der Feedback-Seite. Ihre Mailadresse wird nie veröffentlicht. Rechtsgrundlage für die Veröffentlichung ist Ihre Einwilligung nach Art. 6 Abs. 1 lit. a DSGVO, die Sie jederzeit über ${mail} widerrufen können.`,
          `Alle Einträge werden nach zwölf Monaten automatisch gelöscht, auf Wunsch über ${mail} auch früher. Beim Aufruf der Feedback-Seite lädt Ihr Browser die veröffentlichten Einträge von feedback.michaelblaess.de, beim ersten Klick in das Formular zusätzlich einen Prüfwert gegen Spam. Dabei fallen dort Server-Logdateien an wie im Abschnitt "Hosting und Server-Logdateien" beschrieben.`,
        ],
      },
      {
        titel: 'Google reCAPTCHA',
        absaetze: [
          'Auf der Feedback-Seite lädt Ihr Browser beim ersten Klick in das Formular Google reCAPTCHA v3 von Google Ireland Limited, Gordon House, Barrow Street, Dublin 4, Irland. reCAPTCHA prüft, ob eine Einsendung von einem Menschen oder von einem automatisierten Programm stammt. Dafür erhält Google Daten wie Ihre IP-Adresse, Angaben zu Browser und Gerät sowie Informationen zur Nutzung der Seite und kann Cookies setzen oder auslesen, etwa <code>_GRECAPTCHA</code>. Dabei können Daten an die Google LLC in den USA übermittelt werden, die nach dem EU-US Data Privacy Framework zertifiziert ist.',
          'Der Feedback-Dienst schickt zur Prüfung nur das von reCAPTCHA erzeugte Token an Google, nicht Ihre IP-Adresse.',
          'Rechtsgrundlage ist Art. 6 Abs. 1 lit. f DSGVO, das berechtigte Interesse liegt darin, das Formular vor automatisierten Masseneinsendungen (Spam) zu schützen. Ohne Klick in das Formular lädt die Seite nichts von reCAPTCHA. Mehr in der <a href="https://policies.google.com/privacy">Datenschutzerklärung von Google</a>.',
        ],
      },
      {
        titel: 'E-Mail',
        absaetze: ['Wenn Sie mir schreiben, speichere ich Ihre Angaben, um die Anfrage zu beantworten. Sie werden ohne Ihre Einwilligung nicht weitergegeben.'],
      },
      {
        titel: 'Ihre Rechte',
        absaetze: ['Nach der DSGVO (Art. 15 bis 21 und Art. 77) haben Sie das Recht auf:'],
        liste: [
          'Auskunft über die zu Ihnen gespeicherten Daten',
          'Berichtigung unrichtiger Daten',
          'Löschung',
          'Einschränkung der Verarbeitung',
          'Datenübertragbarkeit',
          'Widerspruch gegen die Verarbeitung',
          'Beschwerde bei einer Datenschutz-Aufsichtsbehörde',
        ],
      },
      {
        titel: 'Verschlüsselung',
        absaetze: ['Diese Seite wird ausschließlich über HTTPS ausgeliefert.'],
      },
      {
        titel: 'Änderungen',
        absaetze: ['Diese Erklärung wird angepasst, sobald sich an der Seite oder an eingesetzten Diensten etwas ändert. Es gilt die hier veröffentlichte Fassung.'],
      },
    ],
  },
  en: {
    titel: 'Privacy policy',
    beschreibung: 'Privacy policy of schuldschein-generator.de: form entries stay in your browser, server logs, storage only on request.',
    stand: 'Last updated: 19 November 2026',
    abschnitte: [
      {
        titel: 'The short version',
        nurOhneZaehlung: true,
        absaetze: [
          'Whatever you enter in the generator is processed only in your browser and never sent to this server or to anyone else. The PDF is created in your browser too. There is no audience measurement, no advertising and no user accounts, and therefore no consent banner. What you send through the feedback form, however, is stored, see "Feedback". On the feedback page the form loads Google reCAPTCHA against spam on your first click, see "Google reCAPTCHA".',
        ],
      },
      {
        titel: 'The short version',
        nurMitZaehlung: true,
        absaetze: [
          'Whatever you enter in the generator is processed only in your browser and never sent to this server or to anyone else, Google included. The PDF is created in your browser too. Only if you agree does Google Analytics measure which pages are visited, which templates are downloaded and whether a promissory note is saved as PDF or printed. There is no advertising and there are no user accounts. What you send through the feedback form, however, is stored, see "Feedback". On the feedback page the form loads Google reCAPTCHA against spam on your first click, see "Google reCAPTCHA".',
        ],
      },
      {
        titel: 'Controller',
        absaetze: [`${adresse}<br />Germany`, `Contact: ${mail}`, 'A data protection officer is not required.'],
      },
      {
        titel: 'Hosting and server log files',
        absaetze: [
          `This site is hosted by ${hoster}, Germany. When a page is requested, the server automatically stores what your browser transmits: IP address, date and time, requested address, referring page, browser and operating system. This is needed for technical operation, security and troubleshooting. The legal basis is Art. 6(1)(f) GDPR.`,
          zaehlungAktiv
            ? 'Fonts and images are served from the same server, no external fonts are loaded. External scripts are loaded in two cases only: Google Analytics after your consent and Google reCAPTCHA on the feedback page after your first click into the form (see below). The feedback page also loads data from feedback.michaelblaess.de (see "Feedback").'
            : 'Fonts and images are served from the same server, no external fonts are loaded. Only the feedback page loads an external script, namely Google reCAPTCHA after your first click into the form (see below). The feedback page also loads data from feedback.michaelblaess.de (see "Feedback").',
        ],
      },
      {
        titel: 'Form entries and PDF',
        absaetze: ['Names, addresses, amounts and all other details in the generator never leave your device. The preview, the PDF and the printout are created entirely in the browser. There is no point at which this data could reach the server.'],
      },
      {
        titel: 'Browser storage (local storage)',
        absaetze: ['This site only stores something in your browser when you explicitly trigger it:'],
        liste: [
          '<code>thema</code>: your light or dark choice, only after you have used the switch.',
          '<code>schuldschein-eingaben</code>: your form entries, only if you tick "Remember my entries on this device". Untick it or clear the form and the entry is deleted.',
        ],
      },
      {
        titel: 'Cookies and consent',
        nurMitZaehlung: true,
        absaetze: [
          'The consent banner runs entirely on this server, no third-party service is loaded for it. It uses the open-source library vanilla-cookieconsent.',
          'Your choice is stored in the cookie <code>cc_cookie</code> so the question does not return on every visit. It lasts six months, holds no identifier of you and is not transmitted. The legal basis is Art. 6(1)(f) GDPR.',
          'As long as you have not agreed, Google Analytics is not loaded and no analytics cookie is set. Independently of this, the feedback page loads Google reCAPTCHA after your first click into the form, see "Google reCAPTCHA". You can change your decision at any time via "Cookie settings" at the bottom of every page.',
        ],
      },
      {
        titel: 'Google Analytics',
        nurMitZaehlung: true,
        absaetze: [
          'With your consent this site uses Google Analytics 4 by Google Ireland Limited, Gordon House, Barrow Street, Dublin 4, Ireland, to see which pages are visited, which templates are downloaded and whether a promissory note is saved as PDF or printed. The script is only loaded after you consent to the statistics category, before that no request goes to Google Analytics. It sets the cookies <code>_ga</code> and <code>_ga_</code> followed by the measurement id, lasting two years. Form contents are never transmitted. Google signals and advertising features are switched off. The legal basis is Art. 6(1)(a) GDPR, and you can withdraw consent at any time. See the <a href="https://policies.google.com/privacy">Google privacy policy</a>.',
        ],
      },
      {
        titel: 'Feedback',
        absaetze: [
          'On the <a href="/en/feedback/">feedback</a> page you can send praise, bug reports and suggestions. The form sends your details to a separate service at feedback.michaelblaess.de, which is also hosted by ALL-INKL in Germany and run by the same controller. We store the date, the type you chose, your text and, if given, your name and email address. Your IP address is not stored. To protect against spam, a check value is formed for one day that cannot be traced back to the IP address. The legal basis is Art. 6(1)(f) GDPR, the legitimate interest being to receive feedback on the site and to prevent abuse.',
          `Your text is only published if you explicitly choose that in the form, and only after review. Then the text, type, date and, if given, your name appear on the feedback page. Your email address is never published. The legal basis for publication is your consent under Art. 6(1)(a) GDPR, which you can withdraw at any time via ${mail}.`,
          `All entries are deleted automatically after twelve months, or earlier on request via ${mail}. When you open the feedback page, your browser loads the published entries from feedback.michaelblaess.de, and on the first click into the form also a spam check value. Server log files are created there as described under "Hosting and server log files".`,
        ],
      },
      {
        titel: 'Google reCAPTCHA',
        absaetze: [
          'On the feedback page, your browser loads Google reCAPTCHA v3 by Google Ireland Limited, Gordon House, Barrow Street, Dublin 4, Ireland, on your first click into the form. reCAPTCHA checks whether a submission comes from a human or from an automated program. For this, Google receives data such as your IP address, browser and device information and information about how you use the page, and may set or read cookies such as <code>_GRECAPTCHA</code>. Data may be transferred to Google LLC in the USA, which is certified under the EU-US Data Privacy Framework.',
          'For verification, the feedback service sends only the token created by reCAPTCHA to Google, not your IP address.',
          'The legal basis is Art. 6(1)(f) GDPR, the legitimate interest being to protect the form against automated mass submissions (spam). Without a click into the form, nothing from reCAPTCHA is loaded. See the <a href="https://policies.google.com/privacy">Google privacy policy</a>.',
        ],
      },
      {
        titel: 'Email',
        absaetze: ['If you write to me, I store your details to answer your enquiry. They are not passed on without your consent.'],
      },
      {
        titel: 'Your rights',
        absaetze: ['Under the GDPR (Art. 15 to 21 and Art. 77) you have the right to:'],
        liste: [
          'access the data stored about you',
          'correction of inaccurate data',
          'erasure',
          'restriction of processing',
          'data portability',
          'object to processing',
          'lodge a complaint with a data protection authority',
        ],
      },
      {
        titel: 'Encryption',
        absaetze: ['This site is served over HTTPS only.'],
      },
      {
        titel: 'Changes',
        absaetze: ['This policy is updated whenever the site or the services it uses change. The version published here applies.'],
      },
    ],
  },
};

export const NUTZUNG: Zweisprachig = {
  de: {
    titel: 'Nutzungsbedingungen',
    beschreibung: 'Nutzungsbedingungen von schuldschein-generator.de: kostenlos, keine Rechtsberatung, Haftung.',
    stand: 'Stand: 18.09.2026',
    abschnitte: [
      {
        titel: 'Was diese Seite ist',
        absaetze: ['schuldschein-generator.de ist ein kostenloses, privates Angebot. Du kannst damit im Browser einen Schuldschein für ein Darlehen unter Privatleuten erstellen, ausdrucken oder als PDF speichern und leere Vorlagen herunterladen. Es gibt keine Anmeldung und keinen Anspruch darauf, dass die Seite jederzeit erreichbar ist.'],
      },
      {
        titel: 'Deine Verantwortung',
        absaetze: ['Für die Richtigkeit Deiner Angaben bist Du selbst verantwortlich. Die erzeugten Dokumente sind Muster. Lies sie vor dem Unterschreiben vollständig durch und passe sie an, wenn sie nicht zu Deiner Vereinbarung passen.'],
      },
      {
        titel: 'Keine Rechtsberatung',
        absaetze: ['<strong>Generator, Vorlagen und Texte sind keine Rechtsberatung.</strong> Bei hohen Beträgen, Sicherheiten, Unternehmen als Beteiligten oder bestehendem Streit lass Dich von einer Anwältin oder einem Anwalt beraten.'],
      },
      {
        titel: 'Haftung',
        absaetze: [
          'Für Schäden aus der Nutzung dieser Seite hafte ich nur bei Vorsatz und grober Fahrlässigkeit. Das gilt nicht für Schäden aus der Verletzung von Leben, Körper oder Gesundheit und nicht, soweit das Gesetz zwingend etwas anderes vorschreibt.',
        ],
      },
      {
        titel: 'Änderungen',
        absaetze: ['Funktionen und Inhalte können sich jederzeit ändern, das Angebot kann eingestellt werden.'],
      },
      {
        titel: 'Anwendbares Recht',
        absaetze: ['Es gilt deutsches Recht.'],
      },
    ],
  },
  en: {
    titel: 'Terms of use',
    beschreibung: 'Terms of use of schuldschein-generator.de: free, not legal advice, liability.',
    stand: 'Last updated: 18 September 2026',
    abschnitte: [
      {
        titel: 'What this site is',
        absaetze: ['schuldschein-generator.de is a free, private service. You can use it in your browser to create a promissory note for a loan between private individuals, print it or save it as a PDF, and download blank templates. There is no sign-up and no entitlement to the site being available at all times.'],
      },
      {
        titel: 'Your responsibility',
        absaetze: ['You are responsible for the accuracy of your details. The documents created are samples. Read them in full before signing and adjust them if they do not match your agreement.'],
      },
      {
        titel: 'Not legal advice',
        absaetze: ['<strong>The generator, templates and texts are not legal advice.</strong> For large amounts, collateral, businesses as parties or an existing dispute, consult a lawyer.'],
      },
      {
        titel: 'Liability',
        absaetze: ['I am only liable for damage arising from the use of this site in cases of intent and gross negligence. This does not apply to injury to life, body or health, nor where the law mandatorily provides otherwise.'],
      },
      {
        titel: 'Changes',
        absaetze: ['Features and content may change at any time, and the service may be discontinued.'],
      },
      {
        titel: 'Applicable law',
        absaetze: ['German law applies.'],
      },
    ],
  },
};
