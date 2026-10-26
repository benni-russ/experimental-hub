import { describe, expect, it } from 'vitest';
import { CATALOG } from '../../personalization/catalog';
import { PRESETS, rankProducts, type PresetId } from '../../personalization/recommend';
import { NOW, VISITORS } from '../../personalization/visitors';
import { insightsFor } from './insights';

const none = { affinity: 0, popularity: 0, similarity: 0 };
// Eine Liste mit vier Plätzen aus den angegebenen Kategorien (nur die Kategorie zählt).
const listOf = (...categories: string[]) => categories.map((category) => ({ product: { category } }));
const oneCategory = listOf('Laufschuhe', 'Laufschuhe', 'Laufschuhe', 'Jacken');
const mixed = listOf('Zubehör', 'Jacken', 'Laufschuhe', 'Rucksäcke');

describe('C-003 Erkenntnis-Kästen', () => {
  it('Besucher ohne Verlauf: Kaltstart', () => {
    expect(insightsFor(PRESETS.personal.weights, false, [])).toContain('coldStart');
  });

  it('Besucher mit Verlauf: kein Kaltstart', () => {
    expect(insightsFor(PRESETS.personal.weights, true, oneCategory)).not.toContain('coldStart');
  });

  it('Ähnlichkeit ab 80 Prozent Anteil: eintönig, darunter nicht', () => {
    expect(insightsFor(PRESETS.similar.weights, true, oneCategory)).toContain('monotone');
    expect(insightsFor({ affinity: 0.1, popularity: 0.15, similarity: 0.75 }, true, oneCategory)).not.toContain('monotone');
    // Der Anteil zählt, nicht der Rohwert: 0,8 allein ist 100 Prozent, dreimal 0,8 nur ein Drittel.
    expect(insightsFor({ affinity: 0, popularity: 0, similarity: 0.8 }, true, oneCategory)).toContain('monotone');
    expect(insightsFor({ affinity: 0.8, popularity: 0.8, similarity: 0.8 }, true, oneCategory)).not.toContain('monotone');
  });

  it('eintönig nur, wenn mindestens 3 der Plätze 1-4 dieselbe Kategorie haben', () => {
    expect(insightsFor(PRESETS.similar.weights, true, oneCategory)).toContain('monotone');
    expect(insightsFor(PRESETS.similar.weights, true, mixed)).not.toContain('monotone');
    expect(insightsFor(PRESETS.similar.weights, true, listOf('Zubehör', 'Jacken', 'Zubehör', 'Jacken'))).not.toContain('monotone');
    // Nur die ersten vier Plätze zählen.
    expect(insightsFor(PRESETS.similar.weights, true, listOf('Zubehör', 'Jacken', 'Laufschuhe', 'Rucksäcke', 'Jacken', 'Jacken', 'Jacken'))).not.toContain('monotone');
    expect(insightsFor(PRESETS.similar.weights, true, [])).not.toContain('monotone');
  });

  it('für jeden Besucher und jede Vorgabe stimmt der Kasten mit der echten Liste überein', () => {
    const options = { hideOutOfStock: true, hidePurchased: true, n: 8 };
    for (const v of VISITORS) {
      for (const id of Object.keys(PRESETS) as PresetId[]) {
        const weights = PRESETS[id].weights;
        const ranked = rankProducts(CATALOG, v, weights, options, NOW);
        const counts = new Map<string, number>();
        for (const r of ranked.slice(0, 4)) counts.set(r.product.category, (counts.get(r.product.category) ?? 0) + 1);
        const sameCategory = Math.max(0, ...counts.values()) >= 3;
        const share = weights.similarity / (weights.affinity + weights.popularity + weights.similarity);
        const expected = v.events.length > 0 && share >= 0.8 - 1e-9 && sameCategory;
        expect(insightsFor(weights, v.events.length > 0, ranked).includes('monotone'), `${v.name} ${id}`).toBe(expected);
      }
    }
  });

  it('ohne Verlauf ist die Ähnlichkeit überall 0: kein „eintönig“, nur Kaltstart', () => {
    const r = insightsFor(PRESETS.similar.weights, false, []);
    expect(r).not.toContain('monotone');
    expect(r).toContain('coldStart');
  });

  it('alle Gewichte null: Hinweis, kein „eintönig“', () => {
    const r = insightsFor(none, true, oneCategory);
    expect(r).toContain('allZero');
    expect(r).not.toContain('monotone');
  });
});
