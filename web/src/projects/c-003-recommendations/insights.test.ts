import { describe, expect, it } from 'vitest';
import { PRESETS } from '../../personalization/recommend';
import { insightsFor } from './insights';

const none = { affinity: 0, popularity: 0, similarity: 0 };

describe('C-003 Erkenntnis-Kästen', () => {
  it('Besucher ohne Verlauf: Kaltstart', () => {
    expect(insightsFor(PRESETS.personal.weights, false)).toContain('coldStart');
  });

  it('Besucher mit Verlauf: kein Kaltstart', () => {
    expect(insightsFor(PRESETS.personal.weights, true)).not.toContain('coldStart');
  });

  it('Ähnlichkeit ab 80 Prozent Anteil: eintönig, darunter nicht', () => {
    expect(insightsFor(PRESETS.similar.weights, true)).toContain('monotone');
    expect(insightsFor({ affinity: 0.1, popularity: 0.15, similarity: 0.75 }, true)).not.toContain('monotone');
    // Der Anteil zählt, nicht der Rohwert: 0,8 allein ist 100 Prozent, dreimal 0,8 nur ein Drittel.
    expect(insightsFor({ affinity: 0, popularity: 0, similarity: 0.8 }, true)).toContain('monotone');
    expect(insightsFor({ affinity: 0.8, popularity: 0.8, similarity: 0.8 }, true)).not.toContain('monotone');
  });

  it('ohne Verlauf ist die Ähnlichkeit überall 0: kein „eintönig“, nur Kaltstart', () => {
    const r = insightsFor(PRESETS.similar.weights, false);
    expect(r).not.toContain('monotone');
    expect(r).toContain('coldStart');
  });

  it('alle Gewichte null: Hinweis, kein „eintönig“', () => {
    const r = insightsFor(none, true);
    expect(r).toContain('allZero');
    expect(r).not.toContain('monotone');
  });
});
