import { describe, expect, it } from 'vitest';
import { FIXES, REFERENCE, THRESHOLDS, clsFromShifts, fieldResults, percentile75, rateMetric, simulateLoad } from '../../experience/vitals';
import { allText, checkStructure } from '../contentChecks';
import { meta } from './content';

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
const card = (n: number) => meta.cards.find((c) => c.id === `D-002-card-0${n}`)!.back;
const de = (n: number) => new Intl.NumberFormat('de-DE', { maximumFractionDigits: 3 }).format(n);
const start = simulateLoad({}, REFERENCE);
const compress = simulateLoad({ compress: true }, REFERENCE);

describe('D-002 Inhalte: Aufbau', () => {
  it('Umfang und IDs stimmen', () => {
    expect(checkStructure(meta, { quiz: 4, reflection: [2, 3], cards: [6, 8] })).toEqual([]);
  });

  it('gehört zu Experience, baut auf D-001 auf, führt zu D-003, die Schätzfrage ist die erste', () => {
    expect(meta.id).toBe('D-002');
    expect(meta.slug).toBe('web-vitals');
    expect(meta.track).toBe('experience');
    expect(meta.kind).toBe('project');
    expect(meta.buildsOn).toEqual(['D-001']);
    expect(meta.leadsTo).toEqual(['D-003']);
    expect(meta.quiz.map((q) => q.id)).toEqual(['D-002-quiz-01', 'D-002-quiz-02', 'D-002-quiz-03', 'D-002-quiz-04']);
    expect(meta.intro.estimateQuestionId).toBe('D-002-quiz-01');
  });

  it('drei Code-Aufgaben mit Vorlage, zwei Tipps und Musterlösung', () => {
    expect(meta.codeTasks?.map((t) => t.id)).toEqual(['D-002-code-01', 'D-002-code-02', 'D-002-code-03']);
    const names = ['rateMetric', 'percentile75', 'clsFromShifts'];
    meta.codeTasks?.forEach((task, i) => {
      expect(task.hints).toHaveLength(2);
      expect(task.starter).toContain('// dein Code');
      expect(task.starter.trimEnd()).toMatch(new RegExp(`return \\{ ${names[i]} \\};$`));
      expect(task.solution.trimEnd()).toMatch(new RegExp(`return \\{ ${names[i]} \\};$`));
      expect(task.prompt).toContain(`\`${names[i]}(`);
    });
  });

  it('nennt kein Prüfwerkzeug und verspricht nichts über Suchmaschinen', () => {
    expect(text).not.toMatch(/lighthouse|pagespeed|search console|crux|ranking/i);
    expect(text).not.toMatch(/Google/);
  });

  it('Quiz und Karten setzen keine Backticks', () => {
    expect(plain).not.toContain('`');
  });
});

describe('D-002 Inhalte: Antwortpositionen', () => {
  it('die richtige Option steht nicht immer an derselben Stelle', () => {
    const idx = ['D-002-quiz-02', 'D-002-quiz-03', 'D-002-quiz-04'].map((id) => choice(id).correctIndex);
    expect(idx).toEqual([1, 3, 0]);
  });
});

describe('D-002 Inhalte: zitierte Zahlen', () => {
  it('Schätzfrage: 2,4 MB bei 10 Mbit/s dauern 1,92 s', () => {
    expect(1.92).toBe((2.4 * 8) / 10);
    const q = meta.quiz[0];
    if (q?.type !== 'estimate') throw new Error('keine Schätzfrage');
    expect(q.answer).toBe(1.92);
    expect(q.tolerance).toBe(0.25);
    expect(q.unit).toBe('s');
    expect(q.prompt).toBe('Ein Produktbild hat 2,4 MB, die Leitung schafft 10 Mbit/s. Schätz: Wie viele Sekunden dauert allein das Bild?');
    expect(meta.intro.text).toContain('Ein Produktbild hat 2,4 MB, die Leitung schafft 10 Mbit/s.');
    expect(q.explanation).toContain(`Ein Byte hat 8 Bit, also sind 2,4 MB genau ${de(2.4 * 8)} Megabit. Bei 10 Mbit/s dauert das ${de(1.92)} s`);
  });

  it('Bild der Demo: 2400 KB bei 5 Mbit/s dauern ohne Wartezeit 3,84 s', () => {
    const image = start.resources.find((r) => r.id === 'image')!;
    expect(image.sizeKB).toBe(2400);
    // 625 KB/s sind 5 Mbit/s (1 KB = 8 Kilobit).
    expect((REFERENCE.bandwidthKBps * 8) / 1000).toBe(5);
    expect(image.end - image.start - REFERENCE.rttS).toBeCloseTo(3.84, 9);
    expect(meta.quiz[0]?.explanation).toContain('2400 KB groß und die Leitung schafft 5 Mbit/s: Allein die Übertragung dauert dort 3,84 s');
  });

  it('jede Grenzwertzahl im Text stimmt mit THRESHOLDS', () => {
    expect(THRESHOLDS.lcp).toMatchObject({ good: 2.5, poor: 4 });
    expect(THRESHOLDS.cls).toMatchObject({ good: 0.1, poor: 0.25 });
    expect(THRESHOLDS.inp).toMatchObject({ good: 200, poor: 500 });
    expect(card(1)).toContain(`gut bis ${de(THRESHOLDS.lcp.good)} s, schlecht über ${de(THRESHOLDS.lcp.poor)} s`);
    expect(card(2)).toContain(`gut bis ${de(THRESHOLDS.cls.good)}, schlecht über ${de(THRESHOLDS.cls.poor)}`);
    expect(card(3)).toContain(`gut bis ${THRESHOLDS.inp.good} ms, schlecht über ${THRESHOLDS.inp.poor} ms`);
    expect(choice('D-002-quiz-02').explanation).toContain(`Bis ${de(THRESHOLDS.cls.good)} gilt das als gut, über ${de(THRESHOLDS.cls.poor)} als schlecht.`);
    // Der Grenzwert selbst gehört zur besseren Stufe, wie im Text der Code-Aufgabe.
    expect(rateMetric('lcp', 2.5)).toBe('good');
    expect(meta.codeTasks?.[0]?.prompt).toContain("`rateMetric('lcp', 2.5)` ist `'good'`");
  });

  it('Tabellenwerte im Text kommen aus simulateLoad', () => {
    expect(start.lcp).toBe(4.53);
    expect(start.cls).toBe(0.17);
    expect(compress.lcp).toBe(1.17);
    expect(compress.cls).toBe(0.32);
    expect(card(6)).toContain(`LCP ${de(compress.lcp)} s statt ${de(start.lcp)} s, aber CLS ${de(compress.cls)} statt ${de(start.cls)}`);
    expect(choice('D-002-quiz-04').explanation).toContain(`steigt der CLS dann von ${de(start.cls)} auf ${de(compress.cls)}`);
    expect(FIXES.find((f) => f.id === 'compress')?.targets).toBe('lcp');
  });

  it('Feldzahlen: Referenz 4,53 s gegen das 75. Perzentil 6,975 s der 20 Besuche', () => {
    const visits = fieldResults({});
    expect(visits).toHaveLength(20);
    expect(percentile75(visits.map((v) => v.lcp))).toBe(6.975);
    expect(choice('D-002-quiz-03').explanation).toContain(
      `das Referenzprofil im Start einen LCP von ${de(start.lcp)} s, das 75. Perzentil der ${visits.length} Besuche liegt bei ${de(6.975)} s`,
    );
    // „Mindestens drei von vier Besuchen sind so gut oder besser.“
    for (const key of ['lcp', 'cls', 'inp'] as const) {
      const values = visits.map((v) => v[key]);
      expect(values.filter((v) => v <= percentile75(values)).length / values.length).toBeGreaterThanOrEqual(0.75);
    }
  });

  it('Sitzungsfenster: unter 1 s zusammen, höchstens 5 s', () => {
    expect(clsFromShifts([{ time: 0, value: 0.1 }, { time: 0.99, value: 0.1 }])).toBe(0.2);
    expect(clsFromShifts([{ time: 0, value: 0.1 }, { time: 1, value: 0.1 }])).toBe(0.1);
    expect(clsFromShifts([0, 0.9, 1.8, 2.7, 3.6, 4.5, 5.4].map((time) => ({ time, value: 0.1 })))).toBe(0.6);
    expect(card(4)).toContain('weniger als 1 s liegt, zählen zusammen; ein Fenster dauert höchstens 5 s');
    expect(card(6)).toContain('weniger als 1 s auseinander');
  });

  it('der reine Text nennt nur geprüfte Zahlen', () => {
    // Dezimalzahlen zerfallen am Komma: 2,4 in 2 und 4, 6,975 in 6 und 975 usw. 75 ist das Perzentil,
    // 2024 das Jahr, in dem INP den FID abgelöst hat.
    expect([...new Set(plain.match(/\d+/g))].sort()).toEqual(
      ['0', '1', '10', '17', '19', '2', '20', '200', '2024', '2400', '25', '3', '32', '4', '5', '500', '53', '6', '75', '8', '84', '92', '975'].sort(),
    );
  });
});
