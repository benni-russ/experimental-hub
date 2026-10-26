import { describe, expect, it } from 'vitest';
import { ATTRIBUTES, DEFAULT_ID, START_EXPERIENCES, allVisitorKinds, decide, reach } from '../../personalization/rules';
import { VISITORS } from '../../personalization/visitors';
import { allText, checkStructure } from '../contentChecks';
import { meta } from './content';

const text = allText(meta);
const choice = (id: string) => {
  const q = meta.quiz.find((x) => x.id === id);
  if (q?.type !== 'choice') throw new Error(`${id} ist keine Auswahlfrage`);
  return q;
};
const nameOf = (id: string) => START_EXPERIENCES.find((e) => e.id === id)?.name;

describe('C-001 Inhalte: Aufbau', () => {
  it('Umfang und IDs stimmen', () => {
    expect(checkStructure(meta, { quiz: 4, reflection: [2, 3], cards: [6, 8] })).toEqual([]);
  });

  it('gehört zu Personalization, baut auf nichts auf, führt zu C-002, die Schätzfrage ist die erste', () => {
    expect(meta.id).toBe('C-001');
    expect(meta.track).toBe('personalization');
    expect(meta.kind).toBe('project');
    expect(meta.buildsOn).toEqual([]);
    expect(meta.leadsTo).toEqual(['C-002']);
    expect(meta.quiz.map((q) => q.id)).toEqual(['C-001-quiz-01', 'C-001-quiz-02', 'C-001-quiz-03', 'C-001-quiz-04']);
    expect(meta.intro.estimateQuestionId).toBe('C-001-quiz-01');
  });
});

describe('C-001 Inhalte: zitierte Zahlen', () => {
  it('der Text nennt nur geprüfte Zahlen', () => {
    // 48 und die vier Wertezahlen 3, 2, 4, 2 aus der Schätzfrage; sonst keine Ziffern.
    expect([...new Set(text.match(/\d+/g))].sort()).toEqual(['2', '3', '4', '48']);
  });

  it('Schätzfrage: 48 Besucherarten aus 3, 2, 4 und 2 Werten', () => {
    const q = meta.quiz[0];
    const counts = ATTRIBUTES.map((a) => a.values.length);
    expect(counts).toEqual([3, 2, 4, 2]);
    expect(q?.prompt).toContain('3, 2, 4 und 2 Werten');
    expect(q?.type === 'estimate' && q.answer).toBe(allVisitorKinds().length);
    expect(q?.type === 'estimate' && q.answer).toBe(48);
    expect(q?.type === 'estimate' && q.tolerance).toBe(0.25);
    expect(q?.type === 'estimate' && q.unit).toBe('Besucherarten');
    expect(q?.explanation).toContain('48 Besucherarten');
    expect(q?.explanation).toContain('3 mal 2 mal 4 mal 2');
    expect(counts.reduce((a, b) => a * b, 1)).toBe(48);
  });
});

describe('C-001 Inhalte: Aussagen stimmen mit rules.ts überein', () => {
  it('Quiz 2: Neukunde mit gefülltem Warenkorb sieht bei „Erste passende“ die Warenkorb-Erinnerung', () => {
    const q = choice('C-001-quiz-02');
    expect(q.prompt).toContain(nameOf('cart-reminder'));
    expect(q.prompt).toContain(nameOf('free-shipping'));
    expect(q.options[q.correctIndex]).toBe(nameOf('cart-reminder'));
    const traits = { device: 'desktop', customer: 'new', source: 'search', cart: 'filled' } as const;
    expect(decide(START_EXPERIENCES, traits, 'priority').winnerId).toBe('cart-reminder');
    // Beide passen, nur die Reihenfolge entscheidet (gleich viele Bedingungen).
    const steps = decide(START_EXPERIENCES, traits, 'priority').steps;
    expect(steps.filter((s) => s.matched).map((s) => s.experienceId)).toContain('free-shipping');
    expect(START_EXPERIENCES.find((e) => e.id === 'cart-reminder')?.conditions).toHaveLength(1);
    expect(START_EXPERIENCES.find((e) => e.id === 'free-shipping')?.conditions).toHaveLength(1);
    expect(new Set(q.options).size).toBe(q.options.length);
  });

  it('Quiz 3: Der Newsletter-Rabatt wird von der Warenkorb-Erinnerung überdeckt', () => {
    const q = choice('C-001-quiz-03');
    expect(q.prompt).toContain(nameOf('newsletter-discount'));
    expect(q.prompt).toContain(nameOf('cart-reminder'));
    const discount = START_EXPERIENCES.find((e) => e.id === 'newsletter-discount');
    expect(discount?.conditions.map((c) => `${c.attribute}:${c.operator}:${c.value}`)).toContain('cart:is:filled');
    const r = reach(START_EXPERIENCES, 'priority')['newsletter-discount'];
    expect(r?.matches).toBeGreaterThan(0);
    expect(r?.wins).toBe(0);
    // Unter „Spezifischste“ gewinnt er dagegen, die Reihenfolge ist also die Ursache.
    expect(reach(START_EXPERIENCES, 'specificity')['newsletter-discount']?.wins).toBeGreaterThan(0);
    expect(q.options[q.correctIndex]).toContain('weiter oben');
  });

  it('Quiz 4: Der Standard gewinnt nur, wenn nichts anderes passt', () => {
    const q = choice('C-001-quiz-04');
    expect(q.options[q.correctIndex]).toContain('nichts anderes passt');
    const noMatch = { device: 'desktop', customer: 'returning', source: 'search', cart: 'empty' } as const;
    expect(decide(START_EXPERIENCES, noMatch, 'priority').winnerId).toBe(DEFAULT_ID);
    // Der Standard gewinnt bei genau den Besucherarten, bei denen kein Erlebnis passt.
    const nobody = allVisitorKinds().filter((k) => !decide(START_EXPERIENCES, k, 'priority').steps.some((s) => s.matched));
    expect(reach(START_EXPERIENCES, 'priority')[DEFAULT_ID]?.wins).toBe(nobody.length);
    expect(nobody.length).toBeGreaterThan(0);
  });

  it('Der Startstand hat Besucher, deren Gewinner von der Konfliktregel abhängt', () => {
    const changed = VISITORS.filter(
      (v) =>
        decide(START_EXPERIENCES, v.traits, 'priority').winnerId !== decide(START_EXPERIENCES, v.traits, 'specificity').winnerId,
    );
    expect(changed.length).toBeGreaterThan(0);
  });
});
