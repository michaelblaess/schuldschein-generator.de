// Smoketest mit echtem Browser gegen den Produktionsbuild.
// Aufruf: npx astro build && npx astro preview --port 4412 --background && node tools/smoketest.mjs http://localhost:4412
// Rueckgabewert 1, sobald eine Bedingung faellt.
import { chromium } from 'playwright-core';
import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';

const basis = (process.argv[2] ?? process.env.SMOKE_URL ?? 'http://localhost:4412').replace(/\/$/, '');
const cache = path.join(os.homedir(), 'AppData/Local/ms-playwright');
const shell = fs.readdirSync(cache).filter((d) => d.startsWith('chromium_headless_shell-')).sort().pop();
const exe = path.join(cache, shell, 'chrome-headless-shell-win64/chrome-headless-shell.exe');

let fehler = 0;
const pruefe = (ok, text) => {
  console.log(`${ok ? 'OK  ' : 'FAIL'} ${text}`);
  if (!ok) {
    fehler += 1;
  }
};

const browser = await chromium.launch({ executablePath: exe });
const kontext = await browser.newContext({ locale: 'de-DE', acceptDownloads: true });
// Der Feedback-Dienst ist der einzige erlaubte fremde Host. Im Test antwortet er nie echt,
// sondern ueber diese Attrappe, damit kein Lauf Eintraege oder Stempel beim Dienst erzeugt.
const FEEDBACK_HOST = 'feedback.michaelblaess.de';
const anDienst = [];
const gesendet = [];
let sendeAntwort = { status: 200, body: { ok: true, ergebnis: 'gesendet' } };
await kontext.route(`https://${FEEDBACK_HOST}/**`, async (route) => {
  const r = route.request();
  const url = new URL(r.url());
  anDienst.push(url.pathname);
  const json = (status, body) => route.fulfill({ status, contentType: 'application/json', headers: { 'Access-Control-Allow-Origin': '*', 'Access-Control-Allow-Headers': 'Content-Type' }, body: JSON.stringify(body) });
  if (r.method() === 'OPTIONS') {
    return route.fulfill({ status: 204, headers: { 'Access-Control-Allow-Origin': '*', 'Access-Control-Allow-Methods': 'GET, POST', 'Access-Control-Allow-Headers': 'Content-Type' } });
  }
  if (url.pathname === '/api/stempel.php') {
    return json(200, { ok: true, stempel: 'test-stempel' });
  }
  if (url.pathname === '/api/oeffentlich.php') {
    return json(200, { ok: true, eintraege: [{ id: 1, datum: '2026-11-18', sprache: 'de', art: 'lob', text: 'Gut <img src=x onerror="window.__xss2=1">', name: 'Anna' }] });
  }
  if (url.pathname === '/api/feedback.php') {
    gesendet.push(r.postDataJSON());
    return json(sendeAntwort.status, sendeAntwort.body);
  }
  return json(404, { ok: false });
});
// reCAPTCHA: nur mit Site-Key und erst nach dem Fokus. Der Stub ersetzt Googles Skript,
// damit kein Lauf Google erreicht. Ohne Key darf ueberhaupt keine Anfrage an Google gehen.
const RECAPTCHA_HOSTS = ['www.google.com', 'www.gstatic.com'];
const anGoogle = [];
await kontext.route(/^https:\/\/(www\.google\.com|www\.gstatic\.com)\//, (route) => {
  anGoogle.push(route.request().url());
  return route.fulfill({ status: 200, contentType: 'text/javascript',
    body: "window.grecaptcha = { ready: (f) => f(), execute: () => Promise.resolve('test-token') };" });
});
const seite = await kontext.newPage();
const konsole = [];
const fremd = [];
seite.on('pageerror', (e) => konsole.push(e.message));
// Der absichtlich provozierte 422 des Feedback-Dienstes landet als Netzfehler in der Konsole
let erwarte422 = false;
seite.on('console', (m) => m.type() === 'error' && !(erwarte422 && m.text().includes('status of 422')) && konsole.push(m.text()));
seite.on('request', (r) => {
  const url = new URL(r.url());
  // Eigener Host zaehlt nicht als fremd, sonst schlaegt die Pruefung gegen die Live-Seite falsch an
  if (url.hostname !== new URL(basis).hostname && url.hostname !== FEEDBACK_HOST && !RECAPTCHA_HOSTS.includes(url.hostname) && !url.protocol.startsWith('data') && !url.protocol.startsWith('blob')) {
    fremd.push(r.url());
  }
});

// Gegenprobe: laeuft ueberhaupt unsere Seite auf diesem Port?
await seite.goto(`${basis}/`, { waitUntil: 'networkidle' });
pruefe((await seite.title()).includes('Schuldschein-Generator'), `richtige Seite unter ${basis}`);

await seite.fill('#geber_name', 'Anna Berger');
await seite.fill('#geber_adresse', 'Lindenweg 12, 04109 Leipzig');
await seite.fill('#nehmer_name', 'Jonas <img src=x onerror="window.__xss=1">');
await seite.fill('#nehmer_adresse', 'Am Markt 3, 04109 Leipzig');
await seite.fill('#summe', '2.500,50');
await seite.fill('#zurueck', '2027-12-31');
pruefe((await seite.locator('#stand-titel').innerText()) !== 'Alles Nötige ist da', 'ohne Geburtsdatum und Ausweis des Schuldners nicht vollständig');
await seite.fill('#nehmer_geburt', '1986-11-02');
await seite.fill('#nehmer_ausweis', 'L01X00T47');
const text = await seite.locator('#dokument .blatt').innerText();
pruefe(text.includes('ein Darlehen über 2.500,50 EUR (in Worten: zweitausendfünfhundert Euro und fünfzig Cent) in bar erhalten zu haben.'), 'Betrag mit Cent in Worten im Vertrag');
pruefe(text.includes('Das Darlehen ist bis zum 31.12.2027 in einer Summe zurückzuzahlen.'), 'Rückzahlungsdatum im Vertrag');
pruefe(!text.includes('Gerichtsstand'), 'keine Gerichtsstandsklausel');
pruefe(text.includes('geboren am 02.11.1986, Ausweisnummer L01X00T47 (Darlehensnehmer/in)'), 'Geburtsdatum und Ausweis des Schuldners im Vertrag');
pruefe(/Vorlage © \d{4} Michael Blaess\./.test(text), 'Copyright im Dokumentfuß');
pruefe(text.includes('Jonas <img src=x onerror="window.__xss=1">'), 'Eingabe erscheint als Text');
pruefe(!(await seite.evaluate(() => window.__xss)), 'Eingabe wird nicht als HTML ausgeführt');
pruefe((await seite.locator('#stand-titel').innerText()) === 'Alles Nötige ist da', 'Pflichtzähler meldet vollständig');

// Die Datenschutzerklaerung behauptet: ohne Haekchen wird nichts gespeichert
const spuren = await seite.evaluate(() => ({ lokal: localStorage.length, sitzung: sessionStorage.length, cookies: document.cookie }));
pruefe(spuren.lokal === 0 && spuren.sitzung === 0 && spuren.cookies === '', `ohne Häkchen kein Speicher (${JSON.stringify(spuren)})`);

// Mit Haekchen gemerkt, nach dem Neuladen wieder da, ohne Haekchen wieder weg
await seite.check('#merken');
await seite.reload({ waitUntil: 'networkidle' });
pruefe((await seite.inputValue('#geber_name')) === 'Anna Berger', 'mit Häkchen nach dem Neuladen wieder da');
await seite.uncheck('#merken');
pruefe(await seite.evaluate(() => localStorage.getItem('schuldschein-eingaben') === null), 'Häkchen entfernen löscht den Speicher');

// Fehlerprüfung
await seite.fill('#summe', 'abc');
pruefe(await seite.locator('#summe-fehler').isVisible(), 'unsinniger Betrag zeigt einen Fehler');
await seite.fill('#summe', '2500');
await seite.locator('summary', { hasText: 'Bankverbindungen' }).click();
await seite.fill('#geber_iban', 'DE88370400440532013000');
pruefe(await seite.locator('#geber_iban-fehler').isVisible(), 'falsche IBAN zeigt einen Fehler');
await seite.fill('#geber_iban', 'DE89 3704 0044 0532 0130 00');
pruefe(!(await seite.locator('#geber_iban-fehler').isVisible()), 'richtige IBAN ohne Fehler');

// Raten und ausfuehrliche Fassung
await seite.locator('summary', { hasText: 'Rückzahlung in Raten' }).click();
await seite.selectOption('#rhythmus', 'monatlich');
await seite.fill('#erste', '2027-01-31');
await seite.locator('label', { hasText: 'Ausführlich' }).click();
const lang = await seite.locator('#dokument .blatt').innerText();
pruefe(lang.includes('12 monatlichen Raten') && lang.includes('28.02.2027'), 'Ratenplan mit § 188 BGB (31.01. -> 28.02.)');
pruefe(lang.includes('§ 7 Schlussbestimmungen'), 'ausführliche Fassung umgeschaltet');

// PDF
const [download] = await Promise.all([seite.waitForEvent('download'), seite.click('#pdf')]);
const pfad = await download.path();
const pdf = fs.readFileSync(pfad);
pruefe(pdf.subarray(0, 5).toString() === '%PDF-' && pdf.length > 2000, `PDF heruntergeladen (${download.suggestedFilename()}, ${pdf.length} Bytes)`);

// Englisch
await seite.goto(`${basis}/en/`, { waitUntil: 'networkidle' });
pruefe((await seite.getAttribute('html', 'lang')) === 'en', 'englische Seite mit lang="en"');
await seite.fill('#summe', '1000');
pruefe((await seite.locator('#dokument .blatt').innerText()).includes('in words: one thousand euros'), 'Betrag in Worten auf Englisch');

// Jede Seite laedt, der Weg ins Impressum ist ein Klick
for (const p of ['/vorlagen/', '/rechtslage/', '/fragen/', '/impressum/', '/datenschutz/', '/nutzungsbedingungen/',
  '/ueber/', '/en/templates/', '/en/law/', '/en/faq/', '/en/about/', '/en/legal-notice/', '/en/privacy/', '/en/terms/', '/feedback/', '/en/feedback/']) {
  const antwort = await seite.goto(`${basis}${p}`, { waitUntil: 'networkidle' });
  pruefe(antwort?.status() === 200, `${p} liefert 200`);
}
await seite.goto(`${basis}/fragen/`);
await seite.getByRole('link', { name: 'Impressum' }).click();
pruefe(seite.url().endsWith('/impressum/'), 'Impressum mit einem Klick erreichbar');

// Vorlagen: Download-Dateien existieren und sind echt
for (const datei of ['schuldschein-kompakt.pdf', 'schuldschein-kompakt.docx', 'quittung-rueckzahlung.pdf']) {
  const r = await seite.request.get(`${basis}/vorlagen/${datei}`);
  const kopf = (await r.body()).subarray(0, 4).toString('latin1');
  pruefe(r.status() === 200 && (kopf === '%PDF' || kopf.startsWith('PK')), `Vorlage ${datei}`);
}

// Dunkelmodus-Schalter
await seite.goto(`${basis}/`, { waitUntil: 'networkidle' });
const hell = await seite.evaluate(() => getComputedStyle(document.body).backgroundColor);
await seite.click('#theme-toggle');
const dunkel = await seite.evaluate(() => getComputedStyle(document.body).backgroundColor);
pruefe(hell !== dunkel, `Schalter wechselt das Design (${hell} -> ${dunkel})`);

// Auf dem Papier darf nichts eingefaerbt sein - "linie kurz" erbte einmal die Box ".kurz" der Rechtslage
await seite.goto(`${basis}/vorlagen/`, { waitUntil: 'networkidle' });
const bunt = await seite.evaluate(() => [...document.querySelectorAll('.mini .blatt .linie')]
  .filter((el) => getComputedStyle(el).backgroundColor !== 'rgba(0, 0, 0, 0)').length);
pruefe(bunt === 0, `Schreiblinien der Vorlagen ohne Hintergrund (${bunt} eingefärbt)`);

// Feedback ohne Site-Key: der Key wird fuer diesen Teil im ausgelieferten HTML geleert,
// damit der Fall "kein reCAPTCHA" geprueft bleibt, obwohl der echte Key gesetzt ist
await seite.route(`${basis}/feedback/`, async (route) => {
  const antwortHtml = await route.fetch();
  const html = (await antwortHtml.text()).replace(/data-recaptcha(?:="[^"]*")?(?=[\s>])/, 'data-recaptcha=""');
  await route.fulfill({ response: antwortHtml, body: html });
});
anGoogle.length = 0;

// Feedback: vor dem ersten Fokus geht nur die Liste an den Dienst, kein Stempel
anDienst.length = 0;
await seite.goto(`${basis}/feedback/`, { waitUntil: 'networkidle' });
pruefe(anDienst.length === 1 && anDienst[0] === '/api/oeffentlich.php', `vor dem Fokus nur die Liste vom Dienst (${anDienst.join(', ')})`);
pruefe((await seite.locator('#eintraege-liste li').count()) === 1, 'freigegebener Eintrag in der Liste');
pruefe((await seite.locator('#eintraege-liste li p').innerText()).includes('<img'), 'Eintrag erscheint als Text');
pruefe(!(await seite.evaluate(() => window.__xss2)), 'Eintrag wird nicht als HTML ausgeführt');
await seite.click('#fb-senden');
pruefe(await seite.locator('#fb-text-fehler').isVisible() && (await seite.getAttribute('#fb-text', 'aria-invalid')) === 'true', 'leeres Feedback zeigt den Textfehler');
pruefe(gesendet.length === 0, 'ungültiges Feedback geht nicht an den Dienst');
pruefe(anDienst.includes('/api/stempel.php'), 'Stempel nach dem ersten Fokus geholt');
await seite.locator('#fb-art label', { hasText: 'Fehler' }).click();
await seite.fill('#fb-text', 'Ein Test aus dem Smoketest.');
pruefe(await seite.isChecked('#fb-oeffentlich input[value="nein"]'), 'Veröffentlichen steht ohne Zutun auf Nein');
sendeAntwort = { status: 422, body: { ok: false, ergebnis: 'ungueltig', fehler: 'textlaenge' } };
erwarte422 = true;
await seite.click('#fb-senden');
await seite.locator('#fb-text-fehler').waitFor({ state: 'visible' });
await seite.waitForTimeout(200);
erwarte422 = false;
pruefe((await seite.getAttribute('#fb-text', 'aria-invalid')) === 'true', '422 textlaenge markiert das Textfeld');
sendeAntwort = { status: 200, body: { ok: true, ergebnis: 'gesendet' } };
await seite.locator('#fb-oeffentlich label', { hasText: 'Ja' }).click();
await seite.click('#fb-senden');
await seite.locator('#fb-meldung[data-art="ok"]').waitFor({ state: 'visible' });
const letzte = gesendet.at(-1) ?? {};
pruefe(letzte.site === 'schuldschein-generator.de' && letzte.art === 'fehler' && letzte.oeffentlich === 'ja' && letzte.stempel === 'test-stempel' && letzte.webseite === '' && !('recaptcha' in letzte),
  `Feedback mit allen Feldern gesendet (${JSON.stringify(letzte).slice(0, 120)})`);
pruefe((await seite.inputValue('#fb-text')) === '', 'Formular nach dem Senden geleert');
pruefe(await seite.isChecked('#fb-oeffentlich input[value="nein"]'), 'nach dem Senden steht Veröffentlichen wieder auf Nein');
pruefe(anGoogle.length === 0, `ohne Site-Key keine Anfrage an Google (${anGoogle.length})`);
pruefe(!(await seite.locator('.recaptcha-hinweis').isVisible()), 'ohne Site-Key kein reCAPTCHA-Hinweis');

// Mit Test-Key: der Key wird nur fuer diesen Test in das ausgelieferte HTML geschrieben
await seite.unroute(`${basis}/feedback/`);
await seite.route(`${basis}/feedback/`, async (route) => {
  const antwortHtml = await route.fetch();
  const html = (await antwortHtml.text()).replace(/data-recaptcha(?:="[^"]*")?(?=[\s>])/, 'data-recaptcha="test-key"');
  await route.fulfill({ response: antwortHtml, body: html });
});
anGoogle.length = 0;
await seite.goto(`${basis}/feedback/`, { waitUntil: 'networkidle' });
pruefe(anGoogle.length === 0, 'mit Site-Key vor dem Fokus keine Anfrage an Google');
pruefe(await seite.locator('.recaptcha-hinweis').isVisible(), 'mit Site-Key steht der Pflichttext unter dem Knopf');
await seite.locator('#fb-art label', { hasText: 'Lob' }).click();
await seite.waitForLoadState('networkidle');
pruefe(anGoogle.some((u) => u.includes('/recaptcha/api.js?render=test-key')), 'nach dem Fokus api.js mit Site-Key geladen');
await seite.fill('#fb-text', 'Ein Test mit reCAPTCHA-Token.');
await seite.click('#fb-senden');
await seite.locator('#fb-meldung[data-art="ok"]').waitFor({ state: 'visible' });
pruefe(gesendet.at(-1)?.recaptcha === 'test-token', `Token im JSON (${gesendet.at(-1)?.recaptcha})`);
pruefe((await seite.locator('script[src*="recaptcha/api.js"]').count()) === 1, 'reCAPTCHA-Skript genau einmal eingebunden');
await seite.unroute(`${basis}/feedback/`);

await seite.goto(`${basis}/en/feedback/?feedback=zu-viele#feedback`, { waitUntil: 'networkidle' });
pruefe((await seite.locator('#fb-meldung').innerText()).startsWith('Too many'), 'Rücksprung ohne JavaScript zeigt die Meldung');

pruefe(fremd.length === 0,`keine Anfrage an fremde Server${fremd.length ? `: ${fremd.slice(0, 3).join(', ')}` : ''}`);
pruefe(konsole.length === 0, `keine Fehler in der Konsole${konsole.length ? `: ${konsole.slice(0, 3).join(' | ')}` : ''}`);

await browser.close();
console.log(fehler ? `\n${fehler} Bedingung(en) verletzt` : '\nAlle Bedingungen erfüllt');
process.exit(fehler ? 1 : 0);
