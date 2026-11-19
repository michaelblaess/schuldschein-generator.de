# Schuldschein-Generator

<p align="center">
  <img src="docs/flags/gb.svg" height="13" alt=""> <a href="README.md">English</a> ·
  <img src="docs/flags/de.svg" height="13" alt=""> <b>Deutsch</b>
</p>

---

[![Lizenz](https://img.shields.io/badge/license-Apache_2.0-3b82f6)](LICENSE)
[![Astro](https://img.shields.io/badge/astro-7-3b82f6?logo=astro&logoColor=white)](https://astro.build/)
[![Letzter Commit](https://img.shields.io/github/last-commit/michaelblaess/schuldschein-generator?logo=git&logoColor=white&color=3b82f6)](https://github.com/michaelblaess/schuldschein-generator/commits/main)

Geld verleihen, aber richtig: ein Schuldschein nach deutschem Recht, auf einer Seite ausgefüllt, als PDF gespeichert oder gedruckt. Kostenlos, ohne Anmeldung, und was Du einträgst, verlässt den Browser nicht.

Live unter **[schuldschein-generator.de](https://schuldschein-generator.de)**, auf Deutsch und Englisch.

![Generator](docs/bilder/generator.png)

## Haftungshinweis

**Das ist keine Rechtsberatung.** Generator, Vorlagen und die Zusammenfassung der Rechtslage sind für einfache Darlehen unter Privatleuten gedacht. Ob ein Dokument im Einzelfall wirksam und passend ist, kann nur eine Anwältin oder ein Anwalt beurteilen. Die Software wird ohne jede Gewähr bereitgestellt, siehe [LICENSE](LICENSE). Nutzung auf eigene Verantwortung.

## Was er kann

- **Eine Seite, kein Assistent.** Die Pflichtangaben stehen auf einem Beleg im Stil eines Überweisungsträgers, mit einem Block je Person. Beim Schuldner sind Geburtsdatum und Ausweisnummer Pflicht, damit eindeutig ist, wer das Geld erhalten hat. Zinsen, Raten, Bankverbindungen, Zweck und Zeuge klappen nur bei Bedarf auf, und jeder Streifen zeigt auch zugeklappt, was eingestellt ist.
- **Live-Vorschau** des Schuldscheins, kompakt oder ausführlich, mit Betrag in Worten (Deutsch und Englisch, samt Cent).
- **PDF und Druck** direkt aus dem Browser. Das PDF enthält echten Text und echte Unterschriftslinien.
- **Vorlagen** auf eigener Seite: kompakt, ausführlich, Ratenzahlung und Quittung, als PDF und Word, mit Vorschau.
- **Rechtslage**: Gesetz nach Themen und 12 Urteile, jedes am 18.09.2026 im Volltext geprüft, mit Aktenzeichen und Link.
- **Häufige Fragen** mit der Grundlage jeder Antwort, zusätzlich als strukturierte Daten.
- **Hell und dunkel**, folgt dem System, bis Du wählst.
- **Datenschutz durch Bauart:** Eingaben werden nur mit dem Häkchen "merken" gespeichert, das Design erst nach Klick auf den Schalter, die Sprache steckt in der Adresse. Google Analytics wird nur mit Mess-Kennung eingebaut und lädt erst nach Einwilligung. Google reCAPTCHA lädt nur auf der Feedback-Seite und erst beim ersten Klick ins Formular.

## Bildschirmfotos

| Vorlagen | Rechtslage | Mobil, dunkel |
| --- | --- | --- |
| ![Vorlagen](docs/bilder/vorlagen.png) | ![Rechtslage](docs/bilder/rechtslage.png) | ![Mobil](docs/bilder/generator-mobil.png) |

## Technik

Astro 7 (statisch), Tailwind 4, TypeScript. `pdf-lib` für das PDF, `docx` für die Word-Vorlagen, `vanilla-cookieconsent` für den Einwilligungsbanner. Die Schriften liegen lokal über Fontsource (Barlow Semi Condensed, IBM Plex Mono).

Der Vertragstext hat genau eine Quelle, `src/lib/vertrag.ts`. Vorschau, Druck, PDF, Word und die leeren Vorlagen entstehen alle daraus und können deshalb nicht auseinanderlaufen.

```
src/
  lib/          Vertragstext, Betrag in Worten, Datum (§ 188 BGB), IBAN, Raten, PDF, Word, Rechtstexte
  components/   Generator, Vorlagen, Rechtslage, Fragen, Kopf, Fuß
  pages/        Deutsch unter /, Englisch unter /en/, Vorlagen als PDF und DOCX beim Bauen
  scripts/      der Generator im Browser
tests/          vitest für die reinen Funktionen
tools/          Smoketest, Barrierefreiheit, Erzeugung von Icons und Teilerbild
docs/           Designentwürfe, Codeprüfung der alten Fassung, Rechtsrecherche
```

## Feedback

Unter `/feedback/` können Besucher Lob, Fehler und Vorschläge hinterlassen. Das Formular in diesem Repo schickt die Einträge an einen eigenen Dienst unter `feedback.michaelblaess.de`, der auch die Feedback-Formulare zweier weiterer Seiten bedient. Dessen Quellcode ist bewusst nicht öffentlich. Der Grund ist der Spamschutz: Wer die Regeln kennt, nach denen ein Eintrag angenommen, markiert oder verworfen wird, kann sie gezielt umgehen. Deshalb stehen hier weder die Regeln noch ihre Grenzwerte.

Öffentlich sind nur das Formular und die Anzeige der freigegebenen Einträge. Zusätzlich schützt Google reCAPTCHA v3 das Formular. Es lädt erst beim ersten Klick ins Formular, nie beim bloßen Aufruf einer Seite. Was gespeichert wird und wie lange, steht in der Datenschutzerklärung der Seite.

## Entwicklung

```bash
npm install
npm run dev          # http://localhost:4321
npm test             # 48 Unit-Tests
npm run pruefen      # Tests, Build, Livegang-Gate, Browser-Smoketest, Barrierefreiheit
```

`npm run pruefen` braucht ein Playwright-Chromium unter `~/AppData/Local/ms-playwright`. Analytics bleibt aus, solange der Build ohne `PUBLIC_GA_ID` läuft.

## Deployment

GitHub Actions baut die Seite und lädt `dist/` per FTPS auf den Webspace. Jeder Push auf `main` deployt, ein Lauf von Hand (`workflow_dispatch`) kann den Zielordner vorher zusätzlich leeren. Der Workflow braucht die Repository-Secrets `FTP_HOST`, `FTP_USER` und `FTP_PASSWORD`. Weiterleitungen und Caching stehen in `public/.htaccess`.

## Lizenz

[Apache 2.0](LICENSE). Lizenzen von Drittsoftware in [NOTICE](NOTICE).
