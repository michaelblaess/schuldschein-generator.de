import { BASISZINS } from './basiszins';
import type { SeitenSchluessel, Sprache } from './i18n';

/*
 * Haeufige Fragen. Jede Antwort mit rechtlichem Inhalt nennt ihre Grundlage, die
 * Aussagen stammen aus docs/recherche-rechtslage.md. Sichtbare Seite und die
 * strukturierten Daten fuer Suchmaschinen werden beide hieraus gebaut.
 */

export interface Frage {
  frage: string;
  antwort: string;
  grundlage?: string;
  /** Verweis auf eine andere Seite, optional mit Anker. */
  link?: { seite: SeitenSchluessel; anker?: string; text: string };
}

export interface Gruppe {
  titel: string;
  fragen: Frage[];
}

const vDe = BASISZINS.verzug.toLocaleString('de-DE');
const vEn = BASISZINS.verzug.toLocaleString('en-GB');

export const FRAGEN: Record<Sprache, Gruppe[]> = {
  de: [
    {
      titel: 'Vor dem Unterschreiben',
      fragen: [
        { frage: 'Muss der Schuldschein zum Notar?', antwort: 'Nein. Für ein Darlehen unter Privatleuten schreibt das Gesetz keine Form vor.', link: { seite: 'rechtslage', anker: 'form', text: 'Form und Unterschrift' } },
        { frage: 'Ist ein Schuldschein dasselbe wie ein Darlehensvertrag?', antwort: 'Nicht ganz. Der Darlehensvertrag ist die Vereinbarung selbst: Eine Seite gibt Geld, die andere zahlt es zurück. Der Schuldschein ist die Urkunde über diese Schuld. Im Alltag meinen beide Wörter meist dasselbe Blatt Papier. Was Du hier ausfüllst, hält die Vereinbarung fest und wird am besten von beiden unterschrieben.', grundlage: '§ 488 BGB, § 371 BGB' },
        { frage: 'Reicht es, das PDF per Mail zu schicken?', antwort: 'Nein. Druckt ihn aus und unterschreibt ihn beide von Hand. Nur eine unterschriebene Urkunde beweist vor Gericht voll. Für ein Schuldanerkenntnis ist die elektronische Form sogar ausdrücklich ausgeschlossen.', grundlage: '§ 416 ZPO, § 781 BGB' },
        { frage: 'Wer muss unterschreiben?', antwort: 'Mindestens die Person, die sich das Geld leiht. Besser unterschreibt Ihr beide, und zwar auf zwei Exemplaren, eines für jede Seite.' },
        { frage: 'Bar oder per Überweisung?', antwort: 'Überweisung ist leichter nachzuweisen. In einem Fall vor dem OLG Köln genügte eine Überweisung kurz nach dem Vertrag als Beweis, obwohl im Verwendungszweck nicht "Darlehen" stand.', grundlage: 'OLG Köln, 16 U 106/16' },
        { frage: 'Brauchen wir eine Zeugin oder einen Zeugen?', antwort: 'Vorgeschrieben ist das nicht. Bei Bargeld kann eine Zeugin später bestätigen, dass das Geld übergeben wurde.' },
        { frage: 'Können wir einen Gerichtsstand festlegen?', antwort: 'In aller Regel nicht. Privatleute dürfen das nur in Ausnahmen, etwa wenn der Streit schon da ist. Deshalb fehlt die Klausel im Generator.', grundlage: '§ 38 ZPO' },
      ],
    },
    {
      titel: 'Zinsen und Steuern',
      fragen: [
        { frage: 'Muss ich Zinsen verlangen?', antwort: 'Nein. Zinsen gibt es nur, wenn Ihr sie vereinbart. Der Generator schreibt dann ausdrücklich "zinslos" in den Vertrag.', grundlage: '§ 488 BGB' },
        { frage: 'Wie hoch dürfen die Zinsen sein?', antwort: 'Eine feste Grenze gibt es nicht. Sittenwidrig hohe Zinsen machen den Vertrag aber nichtig, das wird im Einzelfall geprüft.', grundlage: '§ 138 BGB' },
        { frage: 'Muss ich die Zinsen versteuern?', antwort: 'Grundsätzlich ja. Zinsen aus einem privaten Darlehen sind Einkünfte aus Kapitalvermögen.', grundlage: '§ 20 Abs. 1 Nr. 7 EStG' },
        { frage: 'Ist ein zinsloses Darlehen in der Familie eine Schenkung?', antwort: 'Der Zinsvorteil kann als Schenkung zählen. Es gelten Freibeträge, für Kinder zum Beispiel 400.000 Euro innerhalb von zehn Jahren. Bei großen Summen lohnt eine Steuerberatung.', grundlage: 'BFH, II R 20/22, § 16 ErbStG' },
      ],
    },
    {
      titel: 'Rückzahlung und Streit',
      fragen: [
        { frage: 'Was, wenn wir keinen Rückzahlungstermin haben?', antwort: 'Dann wird das Geld erst fällig, wenn eine Seite kündigt. Die Frist beträgt drei Monate.', grundlage: '§ 488 Abs. 3 BGB' },
        { frage: 'Wann verjährt die Forderung?', antwort: 'Nach drei Jahren, gerechnet ab Ende des Jahres, in dem sie fällig wurde. Ohne festen Termin beginnt das erst nach der Kündigung. Jede Ratenzahlung setzt die Frist neu in Gang.', grundlage: 'BGH, IX ZR 129/17, § 212 BGB' },
        { frage: 'Was passiert, wenn zu spät gezahlt wird?', antwort: `Wer den vereinbarten Termin verpasst, gerät in Verzug, ohne dass eine Mahnung nötig ist. Dann fallen Verzugszinsen an, derzeit ${vDe} % pro Jahr.`, grundlage: '§§ 286, 288 BGB, Basiszins der Bundesbank' },
        { frage: 'Was tun nach der Rückzahlung?', antwort: 'Wer zurückgezahlt hat, bekommt eine Quittung und den Schuldschein zurück.', grundlage: '§§ 368, 371 BGB', link: { seite: 'vorlagen', text: 'Vorlage für die Quittung' } },
        { frage: 'Die andere Seite sagt, es war ein Geschenk. Was jetzt?', antwort: 'Genau dafür ist der Schuldschein da. Ohne ihn muss derjenige, der das Geld zurückwill, beweisen, dass es kein Geschenk war, und das gelingt oft nicht.', grundlage: 'BGH, X ZR 150/11' },
      ],
    },
    {
      titel: 'Zu dieser Seite',
      fragen: [
        { frage: 'Werden meine Eingaben gespeichert?', antwort: 'Nur wenn Du das Häkchen "Eingaben auf diesem Gerät merken" setzt, und dann nur in Deinem Browser. An uns oder Dritte werden sie nie geschickt. Mit "Formular leeren" löschst Du sie.' },
        { frage: 'Was erfährt Google Analytics?', antwort: 'Nur wenn Du Statistik erlaubst: welche Seiten besucht wurden. Was Du einträgst, erfährt Google nie. Ohne Zustimmung wird Google gar nicht erst geladen.' },
        { frage: 'Kostet das etwas?', antwort: 'Nein. Generator und Vorlagen sind kostenlos und ohne Anmeldung.' },
        { frage: 'Ist der Vertrag rechtssicher?', antwort: 'Das kann kein Generator versprechen. Der Vertrag deckt einfache Fälle ab. Bei hohen Beträgen, Sicherheiten oder Streit lass ihn von einer Anwältin oder einem Anwalt prüfen.' },
      ],
    },
  ],
  en: [
    {
      titel: 'Before signing',
      fragen: [
        { frage: 'Does the promissory note need a notary?', antwort: 'No. German law prescribes no form for a loan between private individuals.', link: { seite: 'rechtslage', anker: 'form', text: 'Form and signature' } },
        { frage: 'Is a promissory note the same as a loan agreement?', antwort: 'Not quite. The loan agreement is the arrangement itself: one side hands over money, the other pays it back. The promissory note (Schuldschein) is the document recording that debt. In everyday use both words usually mean the same sheet of paper. What you fill in here records the arrangement and is best signed by both.', grundlage: '§ 488 BGB, § 371 BGB' },
        { frage: 'Is it enough to send the PDF by email?', antwort: 'No. Print it and both sign it by hand. Only a signed document is full evidence in court. For an acknowledgement of debt, electronic form is even expressly excluded.', grundlage: '§ 416 ZPO, § 781 BGB' },
        { frage: 'Who has to sign?', antwort: 'At least the person borrowing the money. Better still, you both sign, on two copies, one for each of you.' },
        { frage: 'Cash or bank transfer?', antwort: 'A transfer is easier to prove. In one case before the Higher Regional Court Cologne, a transfer shortly after the agreement was enough as proof, even though the reference did not say "loan".', grundlage: 'OLG Köln, 16 U 106/16' },
        { frage: 'Do we need a witness?', antwort: 'It is not required. With cash, a witness can later confirm that the money was handed over.' },
        { frage: 'Can we agree on a place of jurisdiction?', antwort: 'Usually not. Private individuals may only do so in exceptional cases, for example once a dispute already exists. That is why the generator leaves the clause out.', grundlage: '§ 38 ZPO' },
      ],
    },
    {
      titel: 'Interest and tax',
      fragen: [
        { frage: 'Do I have to charge interest?', antwort: 'No. Interest is only owed if you agree on it. The generator then states "interest-free" in the agreement.', grundlage: '§ 488 BGB' },
        { frage: 'How high may the interest be?', antwort: 'There is no fixed cap. An extortionate rate, however, makes the agreement void, which is decided case by case.', grundlage: '§ 138 BGB' },
        { frage: 'Do I have to pay tax on the interest?', antwort: 'Generally yes. In Germany, interest from a private loan counts as investment income.', grundlage: '§ 20(1) No. 7 EStG' },
        { frage: 'Is an interest-free loan within the family a gift?', antwort: 'The interest saved can count as a gift. Tax-free allowances apply, for children for example EUR 400,000 within ten years. For large sums, tax advice is worthwhile.', grundlage: 'Federal Fiscal Court, II R 20/22, § 16 ErbStG' },
      ],
    },
    {
      titel: 'Repayment and disputes',
      fragen: [
        { frage: 'What if we have no repayment date?', antwort: 'Then the money only falls due when one side gives notice. The notice period is three months.', grundlage: '§ 488(3) BGB' },
        { frage: 'When does the claim become time-barred?', antwort: 'After three years, counted from the end of the year in which it fell due. Without a fixed date that only starts after notice. Every instalment restarts the period.', grundlage: 'Federal Court of Justice, IX ZR 129/17, § 212 BGB' },
        { frage: 'What happens if payment is late?', antwort: `Whoever misses the agreed date is in default, without a reminder being needed. Default interest then applies, currently ${vEn} % per year.`, grundlage: '§§ 286, 288 BGB, Bundesbank base rate' },
        { frage: 'What should we do after repayment?', antwort: 'Whoever paid back receives a receipt and gets the promissory note back.', grundlage: '§§ 368, 371 BGB', link: { seite: 'vorlagen', text: 'Receipt template' } },
        { frage: 'The other side says it was a gift. What now?', antwort: 'That is exactly what the promissory note is for. Without it, whoever wants the money back has to prove it was not a gift, and that often fails.', grundlage: 'Federal Court of Justice, X ZR 150/11' },
      ],
    },
    {
      titel: 'About this site',
      fragen: [
        { frage: 'Are my entries stored?', antwort: 'Only if you tick "Remember my entries on this device", and then only in your browser. They are never sent to us or anyone else. "Clear form" deletes them.' },
        { frage: 'What does Google Analytics learn?', antwort: 'Only if you allow statistics: which pages were visited. Google never learns what you enter. Without consent, Google is not loaded at all.' },
        { frage: 'Does it cost anything?', antwort: 'No. The generator and the templates are free and need no sign-up.' },
        { frage: 'Is the agreement legally watertight?', antwort: 'No generator can promise that. The agreement covers simple cases. For large amounts, collateral or a dispute, have it checked by a lawyer.' },
      ],
    },
  ],
};
