// axe-core auf allen Seiten, hell und dunkel, dazu seitlicher Ueberlauf bei 375 px.
// Aufruf: node tools/pruefe-barrierefreiheit.mjs http://localhost:4412
import { chromium } from 'playwright-core';
import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';

const basis = (process.argv[2] ?? 'http://localhost:4412').replace(/\/$/, '');
const cache = path.join(os.homedir(), 'AppData/Local/ms-playwright');
const shell = fs.readdirSync(cache).filter((d) => d.startsWith('chromium_headless_shell-')).sort().pop();
const exe = path.join(cache, shell, 'chrome-headless-shell-win64/chrome-headless-shell.exe');
const axe = fs.readFileSync(new URL('../node_modules/axe-core/axe.min.js', import.meta.url), 'utf8');
const seiten = ['/', '/vorlagen/', '/rechtslage/', '/fragen/', '/impressum/', '/datenschutz/', '/nutzungsbedingungen/', '/404.html',
  '/ueber/', '/en/', '/en/templates/', '/en/law/', '/en/faq/', '/en/about/', '/en/legal-notice/', '/en/privacy/', '/en/terms/', '/feedback/', '/en/feedback/'];

// Der Feedback-Dienst antwortet im Test nie echt, die Liste kommt aus dieser Attrappe
const dienst = (route) => route.fulfill({ status: 200, contentType: 'application/json', headers: { 'Access-Control-Allow-Origin': '*' },
  body: JSON.stringify({ ok: true, eintraege: [{ id: 1, datum: '2026-11-18', sprache: 'de', art: 'vorschlag', text: 'Eine Probe für die Prüfung.', name: 'Anna' }] }) });

let fehler = 0;
const browser = await chromium.launch({ executablePath: exe });
for (const schema of ['light', 'dark']) {
  const k = await browser.newContext({ viewport: { width: 1440, height: 1000 }, colorScheme: schema });
  await k.route('https://feedback.michaelblaess.de/**', dienst);
  const p = await k.newPage();
  for (const s of seiten) {
    await p.goto(`${basis}${s}`, { waitUntil: 'networkidle' });
    // Aufgeklappt pruefen, sonst sieht axe den Inhalt der Streifen nicht
    await p.evaluate(() => document.querySelectorAll('details').forEach((d) => { d.open = true; }));
    await p.addScriptTag({ content: axe });
    const r = await p.evaluate(() => window.axe.run(document, { runOnly: ['wcag2a', 'wcag2aa', 'wcag21aa', 'wcag22aa', 'best-practice'] }));
    if (r.violations.length) {
      fehler += r.violations.length;
      console.log(`FAIL ${schema} ${s}: ${r.violations.map((v) => `${v.id}(${v.nodes.length}: ${v.nodes[0].target.join(' ')})`).join(', ')}`);
    }
  }
  await k.close();
}
const m = await browser.newPage({ viewport: { width: 375, height: 800 } });
await m.route('https://feedback.michaelblaess.de/**', dienst);
for (const s of seiten) {
  await m.goto(`${basis}${s}`, { waitUntil: 'networkidle' });
  const breite = await m.evaluate(() => document.documentElement.scrollWidth);
  if (breite > 375) {
    fehler += 1;
    console.log(`FAIL 375px ${s}: ${breite} px breit`);
  }
}
await browser.close();
console.log(fehler ? `${fehler} Befund(e)` : `axe hell und dunkel sowie 375 px: ${seiten.length} Seiten ohne Befund`);
process.exit(fehler ? 1 : 0);
