import { describe, expect, it } from 'vitest';
import { CATALOG } from '../personalization/catalog';
import {
  ECONOMY,
  SCENARIOS,
  SOURCES,
  STEPS,
  applyLifts,
  compareKpis,
  computeFunnel,
  kpis,
  type ScenarioId,
} from './funnel';

const base = computeFunnel(SOURCES);
const baseKpis = kpis(base, ECONOMY);

function runScenario(id: ScenarioId) {
  const scenario = SCENARIOS.find((s) => s.id === id)!;
  const { sources, economy } = scenario.apply(SOURCES, ECONOMY);
  const funnel = computeFunnel(sources);
  const after = kpis(funnel, economy);
  return { sources, economy, funnel, after, cmp: compareKpis(baseKpis, after) };
}

describe('Grundmodell', () => {
  it('hat fünf Stufen und vier Quellen', () => {
    expect(STEPS.map((s) => s.id)).toEqual(['visit', 'product', 'cart', 'checkout', 'purchase']);
    expect(SOURCES).toHaveLength(4);
  });
  it('rechnet den Ausgangszustand', () => {
    expect(base.counts[0]).toBe(20000);
    expect(base.counts[4]).toBeCloseTo(519.8, 1);
    expect(base.overall).toBeCloseTo(0.02599, 5);
    expect(baseKpis.revenue).toBeCloseTo(47825, 0);
    expect(baseKpis.grossProfit).toBeCloseTo(16583, 0);
    expect(base.biggestLeak).toBe(1);
  });
  it('rechnet je Quelle', () => {
    expect(base.bySource.social.overall).toBeCloseTo(0.0054, 4);
    expect(base.bySource.newsletter.overall).toBeCloseTo(0.0588, 4);
  });
});

describe('Szenarien', () => {
  it('kennzeichnen ihre Effekte als erfunden', () => {
    for (const s of SCENARIOS) expect(s.description).toMatch(/erfunden/);
  });
  it('verändern die Eingaben nicht', () => {
    const copy = JSON.stringify([SOURCES, ECONOMY]);
    for (const s of SCENARIOS) s.apply(SOURCES, ECONOMY);
    expect(JSON.stringify([SOURCES, ECONOMY])).toBe(copy);
  });

  it('discount', () => {
    const { after, cmp } = runScenario('discount');
    expect(after.conversionRate * 100).toBeCloseTo(2.911, 3);
    expect(Math.round(after.revenue)).toBe(45529);
    expect(Math.round(after.grossProfit)).toBe(10538);
    expect(after.averageOrderValue).toBeCloseTo(78.2, 6);
    expect(cmp.conflict).toBe(true);
  });
  it('freeShipping', () => {
    const { after, cmp } = runScenario('freeShipping');
    expect(after.conversionRate * 100).toBeCloseTo(2.495, 3);
    expect(after.averageOrderValue).toBe(99);
    expect(Math.round(after.revenue)).toBe(49405);
    expect(Math.round(after.grossProfit)).toBe(17684);
    expect(cmp.conflict).toBe(true);
  });
  it('socialCampaign', () => {
    const { sources, after, cmp } = runScenario('socialCampaign');
    expect(after.visits).toBe(25000);
    expect(after.conversionRate * 100).toBeCloseTo(2.187, 3);
    expect(Math.round(after.revenue)).toBe(50309);
    expect(after.revenuePerVisit).toBeCloseTo(2.012, 3);
    expect(cmp.changes.revenuePerVisit.direction).toBe('down');
    expect(cmp.conflict).toBe(true);
    sources.forEach((s, i) => expect(s.rates).toEqual(SOURCES[i]!.rates));
  });
  it('kopiert die Quoten, statt sie zu teilen', () => {
    for (const scenario of SCENARIOS) {
      const { sources } = scenario.apply(SOURCES, ECONOMY);
      sources.forEach((s, i) => expect(s.rates).not.toBe(SOURCES[i]!.rates));
    }
  });
  it('guestCheckout', () => {
    const { after, cmp } = runScenario('guestCheckout');
    expect(after.conversionRate * 100).toBeCloseTo(2.989, 3);
    expect(Math.round(after.revenue)).toBe(54999);
    expect(cmp.conflict).toBe(false);
    for (const [key, change] of Object.entries(cmp.changes)) {
      expect(change.direction).toBe(key === 'averageOrderValue' || key === 'visits' ? 'same' : 'up');
    }
  });
});

describe('biggestLeak', () => {
  const single = (rates: [number, number, number, number]) => computeFunnel([{ id: 'search', label: 'x', visits: 100, rates }]);
  it('folgt dem größten absoluten Verlust', () => {
    const lifted = computeFunnel(applyLifts(SOURCES, [0, 10, -0.9, 0]));
    expect(lifted.biggestLeak).toBe(2);
  });
  it('nimmt bei Gleichstand den ersten Übergang', () => {
    expect(single([1, 0.5, 1, 0]).biggestLeak).toBe(1);
  });
  it('fällt ohne Besuche auf 0 zurück', () => {
    expect(computeFunnel(SOURCES.map((s) => ({ ...s, visits: 0 }))).biggestLeak).toBe(0);
  });
});

describe('applyLifts', () => {
  it.each([0, 1, 2, 3])('Übergang %i: +10 % ergibt 1,1 × Käufe', (i) => {
    const lifts: [number, number, number, number] = [0, 0, 0, 0];
    lifts[i] = 0.1;
    const lifted = computeFunnel(applyLifts(SOURCES, lifts));
    expect(lifted.counts[4]! / base.counts[4]!).toBeCloseTo(1.1, 6);
  });
  it('begrenzt Quoten auf höchstens 1', () => {
    const lifted = applyLifts(SOURCES, [0, 0, 0, 0.5]);
    expect(lifted[2]!.rates[3]).toBe(1); // 0,70 × 1,5 = 1,05
    expect(lifted.every((s) => s.rates.every((r) => r <= 1))).toBe(true);
  });
  it('begrenzt Quoten nach unten auf 0', () => {
    expect(applyLifts(SOURCES, [-2, -2, -2, -2])[0]!.rates).toEqual([0, 0, 0, 0]);
  });
  it('−50 % überall ergibt keine NaN und weiterhin Käufe', () => {
    const f = computeFunnel(applyLifts(SOURCES, [-0.5, -0.5, -0.5, -0.5]));
    expect(Number.isNaN(f.overall)).toBe(false);
    expect(f.counts.every((c) => !Number.isNaN(c))).toBe(true);
    expect(f.counts[4]).toBeGreaterThan(0);
  });
});

describe('kpis', () => {
  it('liefert bei 0 Besuchen nur Nullen statt NaN', () => {
    const empty = computeFunnel(SOURCES.map((s) => ({ ...s, visits: 0 })));
    expect(empty.rates.every((r) => r === 0)).toBe(true);
    const k = kpis(empty, ECONOMY);
    for (const v of Object.values(k)) expect(Number.isNaN(v)).toBe(false);
    expect(k.conversionRate).toBe(0);
    expect(k.revenuePerVisit).toBe(0);
  });
  it('rechnet den Bestellwert nach Rabatt', () => {
    expect(kpis(base, { ...ECONOMY, discount: 0.5 }).averageOrderValue).toBe(46);
  });
});

describe('compareKpis', () => {
  it('erkennt gleiche Werte als same', () => {
    const c = compareKpis(baseKpis, baseKpis);
    expect(c.conflict).toBe(false);
    expect(Object.values(c.changes).every((x) => x.direction === 'same' && x.change === 0)).toBe(true);
  });
  it('meldet keinen Konflikt, wenn eine Richtung same ist', () => {
    const c = compareKpis(baseKpis, { ...baseKpis, conversionRate: baseKpis.conversionRate * 2 });
    expect(c.conflict).toBe(false);
  });
});

describe('compareKpis, Konflikte und Nullen', () => {
  const k = (over: Partial<typeof baseKpis>) => ({ ...baseKpis, ...over });
  it('meldet einen Konflikt allein über den Rohertrag', () => {
    const c = compareKpis(baseKpis, k({ conversionRate: baseKpis.conversionRate * 1.1, grossProfit: baseKpis.grossProfit * 0.9 }));
    expect(c.changes.revenue.direction).toBe('same');
    expect(c.conflict).toBe(true);
  });
  it('meldet einen Konflikt allein über den Umsatz, wenn der Rohertrag mitzieht', () => {
    const c = compareKpis(
      baseKpis,
      k({ conversionRate: baseKpis.conversionRate * 1.1, revenue: baseKpis.revenue * 0.9, grossProfit: baseKpis.grossProfit * 1.1 }),
    );
    expect(c.changes.grossProfit.direction).toBe('up');
    expect(c.conflict).toBe(true);
  });
  it('ist bei einem Ausgangswert 0 up mit change 0', () => {
    const c = compareKpis(k({ revenue: 0 }), k({ revenue: 10 }));
    expect(c.changes.revenue).toMatchObject({ before: 0, after: 10, change: 0, direction: 'up' });
  });
});

describe('Querschnitt', () => {
  it('der Bestellwert liegt im Preisbereich des Katalogs', () => {
    const prices = CATALOG.map((p) => p.price);
    expect(ECONOMY.averageOrderValue).toBeGreaterThan(Math.min(...prices));
    expect(ECONOMY.averageOrderValue).toBeLessThan(Math.max(...prices));
  });
});
