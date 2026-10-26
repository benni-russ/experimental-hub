import { describe, expect, it } from 'vitest';
import { SCENARIOS, SOURCES, compareKpis, type ScenarioId } from '../../experience/funnel';
import { calculateSampleSize } from '../a-001-mde/sampleSize';
import {
  BASE_FUNNEL,
  BASE_KPIS,
  NO_LIFTS,
  TRANSITIONS,
  cappedRates,
  formatChange,
  formatCount,
  formatEuro,
  formatLift,
  formatPercent,
  formatPercent1,
  funnelFor,
  liftAnnouncement,
  liftInsight,
  liftedState,
  overallLift,
  runScenario,
  scenarioAnnouncement,
  scenarioInsight,
  sourceAnnouncement,
  testSize,
  testSizeText,
  type Lifts,
} from './insights';

const IDS = SCENARIOS.map((s) => s.id);

describe('Formate', () => {
  it('Prozent, Euro, Anzahl und Regler', () => {
    expect(formatPercent(BASE_KPIS.conversionRate)).toBe('2,6 %');
    expect(formatEuro(BASE_KPIS.revenue)).toBe('47.825 €');
    expect(formatCount(BASE_KPIS.orders)).toBe('520');
    expect(formatLift(0.1)).toBe('+10 %');
    expect(formatLift(-0.5)).toBe('−50 %');
    expect(formatLift(0)).toBe('0 %');
    expect(formatLift(0.10000000000000009)).toBe('+10 %');
  });

  it('Änderung von 0 aus heißt „neu“, nicht „0 %“', () => {
    expect(formatChange({ before: 0, after: 10, change: 0, direction: 'up' })).toBe('neu');
    expect(formatChange({ before: 0, after: 0, change: 0, direction: 'same' })).toBe('0 %');
    expect(formatChange({ before: 100, after: 88, change: -0.12, direction: 'down' })).toBe('−12 %');
  });

  it('Übergänge heißen wie die Stufen', () => {
    expect(TRANSITIONS).toEqual(['Besuch → Produktseite', 'Produktseite → Warenkorb', 'Warenkorb → Kasse', 'Kasse → Kauf']);
  });
});

describe('scenarioInsight über alle Szenarien', () => {
  it.each(IDS)('%s nennt die Zahlen aus compareKpis und „Widerspruch“ genau bei conflict', (id: ScenarioId) => {
    const { comparison, scenario } = runScenario(id);
    const text = scenarioInsight(id);
    const c = comparison.changes;
    expect(text).toContain(formatPercent(c.conversionRate.before));
    expect(text).toContain(formatPercent(c.conversionRate.after));
    expect(text).toContain(formatEuro(c.revenue.before));
    expect(text).toContain(formatEuro(c.revenue.after));
    expect(text.includes('Widerspruch')).toBe(comparison.conflict);
    expect(text).toContain('erfunden');
    expect(scenario.description).toContain('Effekte erfunden');
    expect(text).not.toMatch(/NaN|undefined|Infinity/);
  });

  it('die erwarteten Zahlen und Richtungen', () => {
    expect(scenarioInsight('discount')).toContain('Mit 15 % Rabatt für alle steigt die Conversion Rate von 2,6 % auf 2,91 %. Aber der Umsatz fällt');
    expect(scenarioInsight('discount')).toContain('der Rohertrag fällt von 16.583 € auf 10.538 €');
    expect(scenarioInsight('discount')).toContain('der Umsatz fällt von 47.825 € auf 45.529 €');
    expect(scenarioInsight('freeShipping')).toContain('Mit der neuen Versandgrenze fällt die Conversion Rate von 2,6 % auf 2,5 %:');
    expect(scenarioInsight('freeShipping')).toContain('der Rohertrag steigt von 16.583 € auf 17.684 €');
    expect(scenarioInsight('freeShipping')).toContain('Dafür steigt der Bestellwert von 92,00 € auf 99,00 €, der Umsatz steigt');
    expect(scenarioInsight('socialCampaign')).toContain('Mit der Kampagne steigt die Zahl der Besuche von 20.000 auf 25.000.');
    expect(scenarioInsight('socialCampaign')).toContain('Die Conversion Rate fällt von 2,6 % auf 2,19 %');
    expect(scenarioInsight('socialCampaign')).toContain('der Umsatz pro Besuch fällt von 2,39 € auf 2,01 €');
    expect(scenarioInsight('guestCheckout')).toContain('der Rohertrag steigt von 16.583 € auf 19.070 €');
    expect(scenarioInsight('guestCheckout')).toContain('Damit steigt die Conversion Rate von 2,6 % auf 2,99 %, der Umsatz steigt');
    expect(scenarioInsight('guestCheckout')).toContain('Kasse → Kauf von 62,6 % auf 72 %.');
    expect(scenarioInsight('guestCheckout')).toContain('alle nach oben');
  });

  it('der Widerspruchssatz nennt genau die gegenläufigen Geldkennzahlen', () => {
    expect(scenarioInsight('discount')).toContain('Die Conversion Rate zeigt nach oben, der Umsatz und der Rohertrag zeigen nach unten.');
    expect(scenarioInsight('freeShipping')).toContain('Die Conversion Rate zeigt nach unten, der Umsatz und der Rohertrag zeigen nach oben.');
    expect(scenarioInsight('socialCampaign')).toContain('Die Conversion Rate zeigt nach unten, der Umsatz und der Rohertrag zeigen nach oben.');
  });

  it('Social nennt den Mischeffekt (der Link auf A-004 steht im Kasten), und Social hat wirklich die niedrigste Quote', () => {
    expect(scenarioInsight('socialCampaign')).toContain('Simpson-Paradox: ');
    expect(scenarioInsight('socialCampaign')).toContain(`(${formatPercent(BASE_FUNNEL.bySource.social.overall)})`);
    const lowest = Math.min(...SOURCES.map((s) => BASE_FUNNEL.bySource[s.id].overall));
    expect(BASE_FUNNEL.bySource.social.overall).toBe(lowest);
    for (const id of IDS.filter((x) => x !== 'socialCampaign')) expect(scenarioInsight(id)).not.toContain('A-004');
  });

  it('Gastbestellung nennt die Quote Kasse → Kauf vorher und nachher', () => {
    const { funnel } = runScenario('guestCheckout');
    expect(scenarioInsight('guestCheckout')).toContain(
      `Kasse → Kauf von ${formatPercent1(BASE_FUNNEL.rates[3]!)} auf ${formatPercent1(funnel.rates[3]!)}`,
    );
  });

  it('Ansage je Szenario mit Richtungswörtern', () => {
    expect(scenarioAnnouncement('discount')).toBe('15 % Rabatt: Conversion Rate steigt, Umsatz fällt, Rohertrag fällt. Widerspruch.');
    expect(scenarioAnnouncement('guestCheckout')).toBe('Kauf ohne Konto: Conversion Rate steigt, Umsatz steigt, Rohertrag steigt. Gleiche Richtung.');
  });
});

describe('liftInsight', () => {
  it('null, wenn alle Regler auf 0 stehen', () => {
    expect(liftInsight(NO_LIFTS)).toBeNull();
  });

  it.each([0, 1, 2, 3])('+10 %% an Übergang %i ergibt 10 %% mehr Käufe', (i) => {
    const lifts: Lifts = [0, 0, 0, 0];
    lifts[i] = 0.1;
    const text = liftInsight(lifts)!;
    expect(text).toContain('10 % mehr Käufe');
    expect(text).toContain(`${TRANSITIONS[i]} +10 %`);
    expect(text).toContain(`${formatCount(liftedState(lifts).kpis.orders)} statt 520`);
  });

  it('die beiden Fälle aus dem Plan', () => {
    expect(liftInsight([0.1, 0, 0, 0])).toContain('10 % mehr Käufe');
    expect(liftInsight([0, 0, 0, 0.1])).toContain('10 % mehr Käufe');
  });

  it('Faktoren multiplizieren sich, auch gegenläufig', () => {
    expect(liftInsight([0.1, 0.1, 0, 0])).toContain('1,1 × 1,1 = 1,21. Das ergibt 21 % mehr Käufe');
    expect(liftInsight([0.25, -0.2, 0, 0])).toContain('= 1. Das ergibt gleich viele Käufe');
    expect(liftInsight([-0.5, 0, 0, 0])).toContain('50 % weniger Käufe');
  });

  it('+50 % überall: Quoten stoßen an 100 %, der Text sagt es', () => {
    const text = liftInsight([0.5, 0.5, 0.5, 0.5])!;
    expect(text).toContain('Ohne Grenze wären das 406,3 % mehr Käufe');
    expect(text).toContain('nicht über 100 % steigen');
    expect(text).toContain(`${formatCount(liftedState([0.5, 0.5, 0.5, 0.5]).kpis.orders)} statt 520`);
  });

  it.each([
    [[0.5, 0, 0, 0] as Lifts, 'Besuch → Produktseite'],
    [[0, 0, 0, 0.5] as Lifts, 'Kasse → Kauf'],
  ])('%j: gekappt, also keine Gleichheit, sondern die Zahl ohne Grenze', (lifts) => {
    const text = liftInsight(lifts)!;
    expect(text).not.toContain('dieselbe Zahl');
    expect(text).toContain('Weil eine Quote nicht über 100 % steigen kann, sind es tatsächlich 48,4 % mehr Käufe');
    expect(text).toContain(
      `An ${TRANSITIONS[1]} und ${TRANSITIONS[2]} stößt keine Quote an 100 %; dort ergäbe dieselbe Änderung genau 50 % mehr Käufe.`,
    );
    for (const j of [1, 2]) {
      const other: Lifts = [0, 0, 0, 0];
      other[j] = 0.5;
      expect(overallLift(other)).toBeCloseTo(0.5, 9);
    }
  });

  it('[0, 0,5, 0, 0]: dieselbe Zahl nur dort, wo nichts gekappt wird', () => {
    const text = liftInsight([0, 0.5, 0, 0])!;
    expect(text).toContain('Das ergibt 50 % mehr Käufe');
    expect(text).toContain(
      `Dieselbe relative Änderung ergäbe an ${TRANSITIONS[2]} dieselbe Zahl, an ${TRANSITIONS[0]} und ${TRANSITIONS[3]} weniger, ` +
        'weil dort eine Quote an 100 % stößt.',
    );
    // Gegenprobe: +50 % an den gekappten Übergängen ergibt wirklich weniger.
    expect(overallLift([0.5, 0, 0, 0])).toBeLessThan(0.5);
    expect(overallLift([0, 0, 0, 0.5])).toBeLessThan(0.5);
  });

  it('[0, 0, 0,2, 0]: nichts gekappt, die Gleichheit stimmt für alle Übergänge', () => {
    const text = liftInsight([0, 0, 0.2, 0])!;
    expect(text).toContain('Dieselbe relative Änderung an einem anderen Übergang ergäbe dieselbe Zahl.');
    for (const j of [0, 1, 3]) {
      const other: Lifts = [0, 0, 0, 0];
      other[j] = 0.2;
      expect(overallLift(other)).toBeCloseTo(0.2, 9);
    }
  });

  it('Gleichheit wird über alle Einzelregler nur behauptet, wenn sie stimmt', () => {
    for (let step = -10; step <= 10; step++) {
      if (step === 0) continue;
      const lift = step / 20;
      const results = [0, 1, 2, 3].map((i) => {
        const l: Lifts = [0, 0, 0, 0];
        l[i] = lift;
        return overallLift(l);
      });
      for (let i = 0; i < 4; i++) {
        const l: Lifts = [0, 0, 0, 0];
        l[i] = lift;
        const text = liftInsight(l)!;
        const allSame = results.every((r) => Math.abs(r - lift) < 1e-9);
        expect(text.includes('an einem anderen Übergang ergäbe dieselbe Zahl')).toBe(allSame);
      }
    }
  });

  it('nennt die Zahl der gekappten Quoten', () => {
    expect(cappedRates([0.5, 0, 0, 0])).toBe(1);
    expect(cappedRates([0.5, 0, 0, 0.5])).toBe(2);
    expect(liftInsight([0.5, 0, 0, 0.5])).toContain('Weil zwei Quoten nicht über 100 % steigen können');
    expect(cappedRates([0.4, 0.5, 0.5, 0.4])).toBe(0);
  });
});

describe('Ränder der Regler (Review Focus 5)', () => {
  const edges: Lifts[] = [
    [-0.5, -0.5, -0.5, -0.5],
    [0.5, 0.5, 0.5, 0.5],
    [-0.5, 0.5, -0.5, 0.5],
    [0.5, -0.5, 0.5, -0.5],
  ];

  it.each(edges)('%j: keine NaN, keine Quote über 1, auch je Quelle', (...lifts) => {
    const l = lifts as unknown as Lifts;
    for (const source of ['all', ...SOURCES.map((s) => s.id)] as const) {
      const f = funnelFor(source, l);
      expect(f.counts.every(Number.isFinite)).toBe(true);
      expect(f.rates.every((r) => r >= 0 && r <= 1)).toBe(true);
      expect(f.overall).toBeLessThanOrEqual(1);
      expect(sourceAnnouncement(source, l)).not.toMatch(/NaN|undefined/);
    }
    for (const value of Object.values(liftedState(l).kpis)) expect(Number.isFinite(value)).toBe(true);
    expect(liftInsight(l)).not.toMatch(/NaN|undefined|Infinity/);
    expect(testSizeText(l)).not.toMatch(/NaN|undefined|Infinity/);
    for (let i = 0; i < 4; i++) expect(liftAnnouncement(l, i)).not.toMatch(/NaN|undefined/);
  });

  it('−50 % überall: kein Test, sondern ein Hinweis', () => {
    expect(overallLift([-0.5, -0.5, -0.5, -0.5])).toBeLessThan(0);
    expect(testSizeText([-0.5, -0.5, -0.5, -0.5])).toContain('Stell oben an mindestens einem Übergang eine Verbesserung ein.');
    expect(testSizeText(NO_LIFTS)).toContain('Stell oben an mindestens einem Übergang eine Verbesserung ein.');
    // +25 % und −20 % heben sich auf; Rechenreste zählen nicht als Verbesserung.
    expect(overallLift([0.25, -0.2, 0, 0])).toBe(0);
  });
});

describe('testSize', () => {
  it('rechnet wie calculateSampleSize mit α 0,05 und Power 0,8', () => {
    const direct = calculateSampleSize({ baseline: 2.6, mde: 2.6 * 0.1, alpha: 0.05, power: 0.8 })!;
    const weeks = Math.ceil((2 * direct.perVariant) / ((20000 * 12) / 52));
    expect(testSize(0.026, 0.1, 20000)).toEqual({ perVariant: direct.perVariant, weeks });
  });

  it('null bei Lift 0, negativ, ungültig oder neuer Quote ab 100 %', () => {
    expect(testSize(0.026, 0, 20000)).toBeNull();
    expect(testSize(0.026, -0.1, 20000)).toBeNull();
    expect(testSize(Number.NaN, 0.1, 20000)).toBeNull();
    expect(testSize(0.026, Number.POSITIVE_INFINITY, 20000)).toBeNull();
    expect(testSize(0.026, 0.1, 0)).toBeNull();
    expect(testSize(0, 0.1, 20000)).toBeNull();
    expect(testSize(0.6, 1, 20000)).toBeNull(); // p2 = 1,2
  });

  it('Satz mit den Zahlen des Funnels', () => {
    const lift = overallLift([0.1, 0, 0, 0]);
    const size = testSize(BASE_KPIS.conversionRate, lift, BASE_KPIS.visits)!;
    expect(size.weeks).toBe(Math.ceil((2 * size.perVariant) / ((20000 * 12) / 52)));
    expect(testSizeText([0.1, 0, 0, 0])).toBe(
      `Um +10 % relativ auf 2,6 % zu erkennen, braucht ein A/B-Test etwa ${formatCount(size.perVariant)} Besuche je Variante – ` +
        `bei 20.000 Besuchen im Monat rund ${size.weeks} Wochen.`,
    );
    // +50 % überall: kein NaN, die neue Quote liegt deutlich unter 100 %.
    expect(testSizeText([0.5, 0.5, 0.5, 0.5])).toMatch(/^Um \+\d+(,\d)? % relativ/);
  });
});

describe('Quelle und Ansagen', () => {
  it('alle Quellen = Start, einzelne Quelle = ihr eigener Funnel', () => {
    expect(funnelFor('all', NO_LIFTS).counts).toEqual(BASE_FUNNEL.counts);
    expect(funnelFor('social', NO_LIFTS).counts).toEqual(BASE_FUNNEL.bySource.social.counts);
    expect(sourceAnnouncement('all', NO_LIFTS)).toBe(
      'Alle Quellen: 20.000 Besuche, 520 Käufe, Conversion Rate 2,6 %, größter Verlust Produktseite → Warenkorb.',
    );
    expect(liftAnnouncement([0.1, 0, 0, 0], 0)).toBe(
      'Besuch → Produktseite +10 %: Käufe 572, Conversion Rate 2,86 %, größter Verlust Produktseite → Warenkorb.',
    );
  });

  it('Vergleich wie compareKpis im Kern', () => {
    for (const id of IDS) {
      const { after, comparison } = runScenario(id);
      expect(comparison).toEqual(compareKpis(BASE_KPIS, after));
    }
  });
});
