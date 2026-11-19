import { describe, expect, it } from 'vitest';
import { formatiereFeedbackDatum, leseRuecksprung, pruefeFeedback, type FeedbackEingabe } from '../src/lib/feedback';

const gueltig: FeedbackEingabe = { art: 'lob', text: 'Sehr hilfreiche Seite.', name: '', mail: '', oeffentlich: 'nein' };

describe('pruefeFeedback', () => {
  it('lässt gültige Eingaben durch', () => {
    expect(pruefeFeedback(gueltig)).toEqual([]);
    expect(pruefeFeedback({ ...gueltig, mail: 'anna@example.org', name: 'Anna' })).toEqual([]);
  });

  it('meldet jede verletzte Regel in Feldreihenfolge', () => {
    expect(pruefeFeedback({ art: '', text: 'kurz', name: 'x'.repeat(201), mail: 'keine-mail', oeffentlich: '' }))
      .toEqual(['art', 'textlaenge', 'namelaenge', 'mail', 'oeffentlich']);
  });

  it('zählt Zeichen nach dem Trimmen und je Codepoint', () => {
    expect(pruefeFeedback({ ...gueltig, text: '   neun Zei   ' })).toEqual(['textlaenge']);
    expect(pruefeFeedback({ ...gueltig, text: '😀'.repeat(2000) })).toEqual([]);
    expect(pruefeFeedback({ ...gueltig, text: 'a'.repeat(2001) })).toEqual(['textlaenge']);
  });
});

describe('formatiereFeedbackDatum', () => {
  it('schreibt das Datum je Sprache', () => {
    expect(formatiereFeedbackDatum('2026-11-19', 'de')).toBe('19.11.2026');
    expect(formatiereFeedbackDatum('2026-11-19', 'en')).toBe('19/11/2026');
    expect(formatiereFeedbackDatum('gestern', 'de')).toBe('gestern');
  });
});

describe('leseRuecksprung', () => {
  it('liest Ergebnis und Grund', () => {
    expect(leseRuecksprung('?feedback=ungueltig&grund=mail')).toEqual({ ergebnis: 'ungueltig', grund: 'mail' });
    expect(leseRuecksprung('?feedback=gesendet')).toEqual({ ergebnis: 'gesendet', grund: null });
    expect(leseRuecksprung('?feedback=quatsch')).toBeNull();
    expect(leseRuecksprung('')).toBeNull();
  });
});
