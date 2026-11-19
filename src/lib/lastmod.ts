import { execFileSync } from 'node:child_process';
import type { SeitenSchluessel } from './i18n';

/** Was jede Seite beeinflusst, neben ihrer eigenen Datei. */
const GEMEINSAM = ['src/layouts', 'src/components/Kopf.astro', 'src/components/Fuss.astro', 'src/lib/i18n.ts', 'src/styles'];

const QUELLEN: Record<SeitenSchluessel, string[]> = {
  start: ['src/pages/index.astro', 'src/pages/en/index.astro', 'src/components/Generator.astro', 'src/lib/vertrag.ts', 'src/lib/texte-generator.ts', 'src/scripts'],
  vorlagen: ['src/pages/vorlagen', 'src/pages/en/templates', 'src/components/VorlagenSeite.astro', 'src/lib/vorlagen.ts', 'src/lib/vertrag.ts'],
  rechtslage: ['src/pages/rechtslage', 'src/pages/en/law', 'src/components/RechtslageSeite.astro', 'src/lib/rechtslage.ts', 'src/lib/basiszins.ts'],
  fragen: ['src/pages/fragen', 'src/pages/en/faq', 'src/components/FragenSeite.astro', 'src/lib/fragen.ts'],
  ueber: ['src/pages/ueber', 'src/pages/en/about', 'src/components/UeberSeite.astro'],
  impressum: ['src/pages/impressum', 'src/pages/en/legal-notice', 'src/lib/recht.ts'],
  datenschutz: ['src/pages/datenschutz', 'src/pages/en/privacy', 'src/lib/recht.ts'],
  nutzung: ['src/pages/nutzungsbedingungen', 'src/pages/en/terms', 'src/lib/recht.ts'],
  feedback: ['src/pages/feedback', 'src/pages/en/feedback', 'src/components/FeedbackSeite.astro', 'src/lib/feedback.ts', 'src/scripts/feedback.ts'],
};

/**
 * Datum der jüngsten Änderung einer Seite laut Git, als JJJJ-MM-TT.
 * Nicht das Build-Datum: ein lastmod, das bei jedem Bau springt, verwirft Google.
 * Braucht die volle Historie, im CI also checkout mit fetch-depth: 0.
 */
export function lastmod(seite: SeitenSchluessel): string {
  try {
    const iso = execFileSync('git', ['log', '-1', '--format=%cI', '--', ...QUELLEN[seite], ...GEMEINSAM], { encoding: 'utf8' }).trim();
    if (iso) {
      return iso.slice(0, 10);
    }
  } catch {
    // Ohne Git (etwa in einem Export ohne .git) gilt der letzte Commit gar nicht, dann heute
  }
  return new Date().toISOString().slice(0, 10);
}
