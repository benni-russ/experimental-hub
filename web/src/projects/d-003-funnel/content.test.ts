import { describe, expect, it } from 'vitest';
import { ECONOMY, SCENARIOS, SOURCES, applyLifts, computeFunnel, kpis } from '../../experience/funnel';
import { allText, checkStructure } from '../contentChecks';
import { meta } from './content';
import { TRANSITIONS, runScenario } from './insights';

const text = allText(meta);
// Reiner Text ohne Code-Aufgaben: Intro, Quiz, Reflexion, Karten.
const plain = [
  meta.intro.text,
  ...meta.quiz.flatMap((q) => [q.prompt, q.explanation, ...(q.type === 'choice' ? q.options : [])]),
  ...meta.reflection.map((r) => r.prompt),
  ...meta.cards.flatMap((c) => [c.front, c.back]),
].join('\n');
const choice = (id: string) => {
  const q = meta.quiz.find((x) => x.id === id);
  if (q?.type !== 'choice') throw new Error(`${id} ist keine Auswahlfrage`);
  return q;
};
const card = (n: number) => meta.cards.find((c) => c.id === `D-003-card-0${n}`)!.back;
const de = (n: number, digits = 2) => new Intl.NumberFormat('de-DE', { maximumFractionDigits: digits }).format(n);
const pct = (share: number, digits = 2) => `${de(share * 100, digits)} %`;
const euro = (v: number) => `${de(Math.round(v), 0)} €`;

const base = computeFunnel(SOURCES);
const start = kpis(base, ECONOMY);

describe('D-003 Inhalte: Aufbau', () => {
  it('Umfang und IDs stimmen', () => {
    expect(checkStructure(meta, { quiz: 4, reflection: [2, 3], cards: [6, 8] })).toEqual([]);
  });

  it('gehört zu Experience, baut auf A-004 auf, führt zu A-001, die Schätzfrage ist die erste', () => {
    expect(meta.id).toBe('D-003');
    expect(meta.slug).toBe('funnel');
    expect(meta.track).toBe('experience');
    expect(meta.kind).toBe('project');
    expect(meta.buildsOn).toEqual(['A-004']);
    expect(meta.leadsTo).toEqual(['A-001']);
    expect(meta.quiz.map((q) => q.id)).toEqual(['D-003-quiz-01', 'D-003-quiz-02', 'D-003-quiz-03', 'D-003-quiz-04']);
    expect(meta.intro.estimateQuestionId).toBe('D-003-quiz-01');
  });

  it('drei Code-Aufgaben mit Vorlage, zwei Tipps und Musterlösung', () => {
    expect(meta.codeTasks?.map((t) => t.id)).toEqual(['D-003-code-01', 'D-003-code-02', 'D-003-code-03']);
    const names = ['stepRates', 'revenuePerVisit', 'compareKpis'];
    meta.codeTasks?.forEach((task, i) => {
      expect(task.hints).toHaveLength(2);
      expect(task.starter).toContain('// dein Code');
      expect(task.starter.trimEnd()).toMatch(new RegExp(`return \\{ ${names[i]} \\};$`));
      expect(task.solution.trimEnd()).toMatch(new RegExp(`return \\{ ${names[i]} \\};$`));
      expect(task.prompt).toContain(`\`${names[i]}(`);
    });
  });

  it('keine Branchenzahlen, keine Werkzeug- oder Shopnamen, keine absoluten Versprechen', () => {
    expect(text).not.toMatch(/Google|Analytics|GA4|Shopify|Amazon|Branchen|immer mehr Umsatz|garantiert/i);
  });

  it('Quiz und Karten setzen keine Backticks', () => {
    expect(plain).not.toContain('`');
  });
});

describe('D-003 Inhalte: Antwortpositionen', () => {
  it('die richtige Option steht nicht immer an derselben Stelle', () => {
    const idx = ['D-003-quiz-02', 'D-003-quiz-03', 'D-003-quiz-04'].map((id) => choice(id).correctIndex);
    expect(idx).toEqual([1, 0, 3]);
  });
});

describe('D-003 Inhalte: zitierte Zahlen', () => {
  it('Schätzfrage: 10.000 × 0,5⁴ = 625, einer von 16', () => {
    expect(625).toBe(10000 * 0.5 ** 4);
    expect(10000 / 625).toBe(16);
    const q = meta.quiz[0];
    if (q?.type !== 'estimate') throw new Error('keine Schätzfrage');
    expect(q.answer).toBe(625);
    expect(q.tolerance).toBe(0.25);
    expect(q.unit).toBe('Käufe');
    expect(q.prompt).toBe('10.000 Besuche, an jedem der 4 Übergänge geht die Hälfte verloren. Schätz: Wie viele kaufen?');
    expect(meta.intro.text).toContain('10.000 Besuche, an jedem der 4 Übergänge geht die Hälfte verloren. Wie viele kaufen?');
    expect(TRANSITIONS).toHaveLength(4);
    const halves = [0, 1, 2, 3, 4].map((i) => de(10000 * 0.5 ** i, 0));
    expect(q.explanation).toContain(`Jeder Übergang halbiert: ${halves.slice(0, 4).join(', ')} und schließlich ${halves[4]}.`);
    expect(q.explanation).toContain('also nur einer von 16 Besuchen');
  });

  it('Ausgangslage: 20.000 Besuche, rund 520 Käufe, 2,6 %', () => {
    expect(start.visits).toBe(20000);
    expect(Math.round(start.orders)).toBe(520);
    expect(pct(start.conversionRate)).toBe('2,6 %');
    expect(meta.intro.text).toContain('20.000 Besuche, aber nur rund 520 Käufe');
    expect(meta.quiz[0]?.explanation).toContain('Von 20.000 Besuchen kaufen rund 520, etwa 2,6 %');
  });

  it('Rabatt: 15 %, CR 2,6 → 2,91 %, Rohertrag 16.583 → 10.538 €', () => {
    const { after, comparison, economy } = runScenario('discount');
    expect(economy.discount).toBe(0.15);
    expect(comparison.changes.conversionRate.direction).toBe('up');
    expect(comparison.changes.grossProfit.direction).toBe('down');
    expect(choice('D-003-quiz-02').prompt).toContain('Rabattcode über 15 % für alle');
    expect(choice('D-003-quiz-02').explanation).toContain(
      `steigt die Conversion Rate von ${pct(start.conversionRate)} auf ${pct(after.conversionRate)}, der Rohertrag fällt aber von ${euro(start.grossProfit)} auf ${euro(after.grossProfit)}`,
    );
    expect(choice('D-003-quiz-02').explanation).toContain('2,91 %');
    expect(choice('D-003-quiz-02').explanation).toContain('erfunden');
  });

  it('Social: 0,54 %, 5.000 → 10.000 Besuche, CR 2,19 %, Umsatz steigt', () => {
    const { after, comparison, sources } = runScenario('socialCampaign');
    const social = SOURCES.find((s) => s.id === 'social')!;
    expect(social.visits).toBe(5000);
    expect(sources.find((s) => s.id === 'social')!.visits).toBe(10000);
    expect(sources.filter((s) => s.id !== 'social').map((s) => s.visits)).toEqual(SOURCES.filter((s) => s.id !== 'social').map((s) => s.visits));
    expect(after.visits).toBe(25000);
    expect(comparison.changes.revenue.direction).toBe('up');
    expect(choice('D-003-quiz-03').explanation).toContain(
      `Social kauft in der Demo nur zu ${pct(base.bySource.social.overall)}, der Schnitt liegt bei ${pct(start.conversionRate)}. Kommen statt 5.000 nun 10.000 Besuche aus Social, sinkt die Gesamtquote auf ${pct(after.conversionRate)}`,
    );
    expect(card(5)).toContain(`${de(after.visits, 0)} statt ${de(start.visits, 0)} Besuche, Conversion Rate ${pct(after.conversionRate)} statt ${pct(start.conversionRate)}, Umsatz höher`);
    expect(choice('D-003-quiz-03').explanation).toContain('A-004');
  });

  it('+10 % an einem Übergang: 1,1-mal, rund 52 Käufe mehr; Quoten 14 % und 63 %', () => {
    for (let i = 0; i < 4; i++) {
      const lifts: [number, number, number, number] = [0, 0, 0, 0];
      lifts[i] = 0.1;
      const after = kpis(computeFunnel(applyLifts(SOURCES, lifts)), ECONOMY);
      expect(after.orders / start.orders).toBeCloseTo(1.1, 9);
      expect(Math.round(after.orders - start.orders)).toBe(52);
    }
    expect(Math.round(base.rates[1]! * 100)).toBe(14);
    expect(Math.round(base.rates[3]! * 100)).toBe(63);
    expect(Math.min(...base.rates)).toBe(base.rates[1]);
    expect(Math.max(...base.rates)).toBe(base.rates[3]);
    const q = choice('D-003-quiz-04');
    expect(q.explanation).toContain('Bei rund 520 Käufen sind das etwa 52 mehr.');
    expect(q.explanation).toContain('Bei einer Quote von 14 % sind 10 % mehr etwas anderes als bei 63 %.');
    expect(q.options).toContain('Alle gleich viel, jeder bringt 10 % mehr Käufe.');
  });

  it('Übergangsquoten der Karte multiplizieren sich zur Conversion Rate', () => {
    const shown = base.rates.map((r) => pct(r, 1));
    expect(shown).toEqual(['54,8 %', '13,7 %', '55,1 %', '62,6 %']);
    expect(card(2)).toContain(`${shown.join(' × ')} ergibt rund ${pct(start.conversionRate)}`);
    expect(base.rates.reduce((p, r) => p * r, 1)).toBeCloseTo(base.overall, 12);
  });

  it('größtes Leck: Produktseite → Warenkorb, 10.950 → 1.505', () => {
    expect(base.biggestLeak).toBe(1);
    expect(TRANSITIONS[base.biggestLeak]).toBe('Produktseite → Warenkorb');
    expect(card(3)).toContain(`In der Demo ist es ${TRANSITIONS[base.biggestLeak]}: Von ${de(base.counts[1]!, 0)} auf der Produktseite legen nur ${de(base.counts[2]!, 0)}`);
    expect(base.counts[1]).toBe(10950);
    expect(base.counts[2]).toBe(1505);
  });

  it('absolut gegen relativ: 2,6 % × 1,1 = 2,86 %, 0,26 Prozentpunkte', () => {
    expect(Math.round(2.6 * 1.1 * 100) / 100).toBe(2.86);
    expect(Math.round((2.86 - 2.6) * 100) / 100).toBe(0.26);
    expect(pct(start.conversionRate)).toBe('2,6 %');
    expect(card(4)).toContain('von 2,6 % relativ um 10 %, liegt sie bei 2,86 %. Absolut sind das nur 0,26 Prozentpunkte.');
  });

  it('Rohertrag: Marge 40 %, Versand 4,90 €, Bestellwert 92 €', () => {
    expect(ECONOMY).toMatchObject({ margin: 0.4, shippingCost: 4.9, averageOrderValue: 92 });
    expect(card(7)).toContain('eine Marge von 40 %, 4,90 € Versand je Bestellung und einen Bestellwert von 92 €');
  });

  it('jedes Szenario ist als erfunden gekennzeichnet', () => {
    for (const s of SCENARIOS) expect(s.description).toContain('Effekte erfunden');
  });

  it('der reine Text nennt nur geprüfte Zahlen', () => {
    // Dezimalzahlen zerfallen am Komma und Tausenderpunkt: 2,6 in 2 und 6, 10.000 in 10 und 000 usw.
    // 004 stammt aus dem Verweis auf A-004.
    expect([...new Set(plain.match(/\d+/g))].sort()).toEqual(
      [
        '0', '000', '004', '1', '10', '13', '14', '15', '16', '19', '2', '20', '25', '250', '26', '4', '40', '5', '500', '505', '52',
        '520', '538', '54', '55', '583', '6', '62', '625', '63', '7', '8', '86', '90', '91', '92', '950',
      ].sort(),
    );
  });
});
