import { describe, expect, it } from 'vitest';
import { contrastRatio, rateContrast } from '../../experience/color';
import { BARRIERS, audit, buildPage } from '../../experience/productPage';
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
const de = (n: number, digits: number) => n.toFixed(digits).replace('.', ',');

describe('D-001 Inhalte: Aufbau', () => {
  it('Umfang und IDs stimmen', () => {
    expect(checkStructure(meta, { quiz: 4, reflection: [2, 3], cards: [6, 8] })).toEqual([]);
  });

  it('gehört zu Experience, baut auf nichts auf, führt zu D-002, die Schätzfrage ist die erste', () => {
    expect(meta.id).toBe('D-001');
    expect(meta.slug).toBe('accessibility');
    expect(meta.track).toBe('experience');
    expect(meta.kind).toBe('project');
    expect(meta.buildsOn).toEqual([]);
    expect(meta.leadsTo).toEqual(['D-002']);
    expect(meta.quiz.map((q) => q.id)).toEqual(['D-001-quiz-01', 'D-001-quiz-02', 'D-001-quiz-03', 'D-001-quiz-04']);
    expect(meta.intro.estimateQuestionId).toBe('D-001-quiz-01');
  });

  it('drei Code-Aufgaben mit Vorlage, zwei Tipps und Musterlösung', () => {
    expect(meta.codeTasks?.map((t) => t.id)).toEqual(['D-001-code-01', 'D-001-code-02', 'D-001-code-03']);
    const names = ['contrastRatio', 'checkHeadingOrder', 'checkAlt'];
    meta.codeTasks?.forEach((task, i) => {
      expect(task.hints).toHaveLength(2);
      expect(task.starter).toContain('// dein Code');
      expect(task.starter.trimEnd()).toMatch(new RegExp(`return \\{ ${names[i]} \\};$`));
      expect(task.solution.trimEnd()).toMatch(new RegExp(`return \\{ ${names[i]} \\};$`));
      expect(task.prompt).toContain(`\`${names[i]}(`);
    });
  });

  it('nennt einen automatischen Prüfer, kein Produkt, und verspricht nichts Rechtliches', () => {
    expect(text).toContain('ein automatischer Prüfer');
    expect(text).not.toMatch(/axe|lighthouse|wave/i);
    expect(text).not.toMatch(/rechtssicher|gesetzeskonform|garantiert barrierefrei/i);
  });
});

describe('D-001 Inhalte: Antwortpositionen', () => {
  it('die richtige Option steht nicht immer an derselben Stelle', () => {
    const idx = ['D-001-quiz-02', 'D-001-quiz-03', 'D-001-quiz-04'].map((id) => choice(id).correctIndex);
    expect(idx).toEqual([2, 0, 1]);
  });
});

describe('D-001 Inhalte: zitierte Zahlen', () => {
  const reported = audit(buildPage({})).length;
  const total = BARRIERS.length;

  it('Schätzfrage: 8 Barrieren, davon findet der Prüfer 5, die 3 übrigen nicht', () => {
    expect(total).toBe(8);
    expect(reported).toBe(5);
    expect(BARRIERS.filter((b) => b.automatic).length).toBe(reported);
    const q = meta.quiz[0];
    expect(q?.type === 'estimate' && q.answer).toBe(reported);
    expect(q?.type === 'estimate' && q.tolerance).toBe(0.25);
    expect(q?.type === 'estimate' && q.unit).toBe('Barrieren');
    expect(q?.prompt).toContain(`${total} Barrieren`);
    expect(meta.intro.text).toContain(`${total} Barrieren`);
    expect(q?.explanation).toContain(`findet ${reported}`);
    expect(q?.explanation).toContain(`Die ${total - reported} übrigen`);
  });

  it('Kontrast des Hinweistexts: etwa 2,8 : 1, Formel mit 0,05 und Bereich 1 bis 21', () => {
    expect(de(contrastRatio('#9a9a9a', '#ffffff'), 1)).toBe('2,8');
    expect(contrastRatio('#000000', '#ffffff')).toBe(21);
    expect(contrastRatio('#ffffff', '#ffffff')).toBe(1);
    expect(plain).toContain('etwa 2,8 : 1');
    expect(plain).toContain('plus 0,05');
    expect(plain).toContain('zwischen 1 und 21');
  });

  it('WCAG-Grenzen der Karte stimmen mit rateContrast überein', () => {
    expect(rateContrast(4.5, false)).toBe('AA');
    expect(rateContrast(4.49, false)).toBe('fail');
    expect(rateContrast(7, false)).toBe('AAA');
    expect(rateContrast(6.99, false)).toBe('AA');
    expect(rateContrast(3, true)).toBe('AA');
    expect(rateContrast(2.99, true)).toBe('fail');
    expect(rateContrast(4.5, true)).toBe('AAA');
    const card = meta.cards.find((c) => c.id === 'D-001-card-04')!.back;
    expect(card).toContain('4,5 : 1 für Stufe AA, 7 : 1 für AAA');
    expect(card).toContain('Großer Text: 3 : 1 und 4,5 : 1');
  });

  it('der reine Text nennt nur geprüfte Zahlen', () => {
    // 8 / 5 / 3 Barrieren, 2,8 : 1, Grenzen 4,5 / 7 / 3, 0,05, 1 bis 21, 200 %. Dezimalzahlen
    // zerfallen am Komma: 2,8 in 2 und 8, 4,5 in 4 und 5, 0,05 in 0 und 05.
    expect([...new Set(plain.match(/\d+/g))].sort()).toEqual(['0', '05', '1', '2', '200', '21', '3', '4', '5', '7', '8']);
    expect(plain).toContain('200 %');
  });

  it('Code-Aufgabe 1 nennt die Konstanten der Formel aus dem Kern', () => {
    const prompt = meta.codeTasks?.[0]?.prompt ?? '';
    for (const c of ['0.03928', '12.92', '0.055', '1.055', '2.4', '0.2126', '0.7152', '0.0722', '0.05', '255', '0.01']) {
      expect(prompt).toContain(c);
    }
  });

  it('Quiz und Karten setzen keine Backticks', () => {
    expect(plain).not.toContain('`');
  });
});
