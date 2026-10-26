import { describe, expect, it } from 'vitest';
import { VALID_PURCHASE } from '../b-004-ga4-event-builder/fixtures';
import { VALUE_TOLERANCE, validateEvent } from '../b-004-ga4-event-builder/validateEvent';
import { allText, checkStructure } from '../contentChecks';
import { meta } from './content';
import { MUTANT_IDS, MUTANTS } from './mutants';
import { killMatrix, PRESET_TESTS } from './presetTests';

const text = allText(meta);
const choice = (id: string) => {
  const q = meta.quiz.find((x) => x.id === id);
  if (q?.type !== 'choice') throw new Error(`${id} ist keine Auswahlfrage`);
  return q;
};
const WORDS = ['null', 'eins', 'zwei', 'drei', 'vier', 'fünf', 'sechs', 'sieben', 'acht', 'neun', 'zehn'];
const Words = WORDS.map((w) => w[0]!.toUpperCase() + w.slice(1));
const preset = (id: string) => PRESET_TESTS.find((t) => t.id === id)!;

/** Tests, die mindestens eine Variante erwischen, und solche, die keine erwischen */
async function split() {
  const matrix = await killMatrix(PRESET_TESTS);
  const catches = PRESET_TESTS.filter((t) => MUTANT_IDS.some((id) => matrix[t.id]![id] === false));
  const blind = PRESET_TESTS.filter((t) => !catches.includes(t));
  return { matrix, catches, blind };
}

describe('B-006 Inhalte: Aufbau', () => {
  it('Umfang und IDs stimmen', () => {
    expect(checkStructure(meta, { quiz: 4, reflection: [2, 3], cards: [5, 8] })).toEqual([]);
  });

  it('baut auf B-005 auf, ist das letzte Projekt im Pfad, die Schätzfrage ist die erste', () => {
    expect(meta.id).toBe('B-006');
    expect(meta.track).toBe('web');
    expect(meta.kind).toBe('project');
    expect(meta.buildsOn).toEqual(['B-005']);
    expect(meta.leadsTo).toEqual([]);
    expect(meta.quiz.map((q) => q.id)).toEqual(['B-006-quiz-01', 'B-006-quiz-02', 'B-006-quiz-03', 'B-006-quiz-04']);
    expect(meta.intro.estimateQuestionId).toBe('B-006-quiz-01');
  });

  it('eine Code-Aufgabe mit Vorlage, zwei Tipps und Musterlösung', () => {
    const task = meta.codeTasks?.[0];
    expect(meta.codeTasks?.map((t) => t.id)).toEqual(['B-006-code-01']);
    expect(task?.hints).toHaveLength(2);
    for (const word of ['`test(name, fn)`', '`expect(wert)`', '`toBe`', '`toEqual`', '`toThrow`', '`validateEvent`', '`VALID_PURCHASE`']) {
      expect(task?.prompt).toContain(word);
    }
  });

  it('die Vorlage enthält einen Test, der nie scheitert, und der Text erklärt ihn', () => {
    const task = meta.codeTasks![0]!;
    expect(task.starter).toContain('expect(true).toBe(true)');
    expect(task.starter.match(/test\(/g)).toHaveLength(1);
    expect(task.prompt).toContain('`expect(true).toBe(true)`');
    expect(task.prompt).toContain('erwischt deshalb nichts');
  });

  it('die Aufgabe nennt alle vier Varianten mit ihrer Beschriftung aus der Demo', () => {
    const prompt = meta.codeTasks![0]!.prompt.replaceAll('`', '');
    for (const id of MUTANT_IDS) expect(prompt).toContain(`„${MUTANTS[id].label}“`);
    expect(prompt).toContain(`${WORDS[MUTANT_IDS.length]} kaputte Fassungen`);
  });
});

describe('B-006 Inhalte: zitierte Zahlen', () => {
  // Jede Zahl im Text steht hier; jede wird unten nachgerechnet.
  it('der Text nennt nur geprüfte Zahlen', () => {
    const numbers = [...new Set(text.match(/\d+/g))].sort();
    expect(numbers).toEqual(
      [
        // Schätzfrage: sechs Tests erwischen mindestens eine Variante
        '6',
        // Name GA4 in der Aufgabe
        '4',
        // Tipp 1: value 35 liegt weniger als einen Cent neben der Summe
        '35',
      ].sort(),
    );
  });

  it('Schätzfrage: die Antwort ist aus killMatrix(PRESET_TESTS) berechnet', async () => {
    const { catches, blind } = await split();
    const q = meta.quiz[0];
    expect(q?.type).toBe('estimate');
    if (q?.type !== 'estimate') return;
    expect(q.prompt).toBe('Wie viele der zehn vorbereiteten Tests erwischen mindestens eine Fehlervariante?');
    expect(PRESET_TESTS).toHaveLength(10);
    expect(q.answer).toBe(catches.length);
    expect(q.answer).toBe(6);
    expect(q.tolerance).toBe(0.2);
    expect(q.explanation.startsWith(`${catches.length}.`)).toBe(true);
    expect(q.explanation).toContain(`${Words[blind.length]} Tests erwischen keine Variante`);
    // Die Erklärung nennt die vier blinden Tests beim Namen oder Inhalt.
    expect(blind.map((t) => t.id)).toEqual(['reserved-prefix', 'value-with-shipping', 'no-object', 'runs-through']);
    expect(q.explanation).toContain('Präfix google_');
    expect(q.explanation).toContain('value mit Versand');
    expect(q.explanation).toContain('überhaupt eine Liste');
    expect(q.explanation).toContain(`„${preset('runs-through').name}“`);
  });

  it('der Einstieg nennt zehn Tests und vier Varianten', () => {
    expect(meta.intro.text).toContain(`${WORDS[MUTANT_IDS.length]} absichtlich kaputten Fassungen`);
    expect(meta.intro.text).toContain(`${WORDS[PRESET_TESTS.length]} vorbereitete Prüfungen`);
    expect(meta.intro.text).toContain(`Wie viele der ${WORDS[PRESET_TESTS.length]} Prüfungen`);
  });

  it('Quiz 2: Der Test ohne Blick aufs Ergebnis besteht gegen jede Variante', async () => {
    const { matrix } = await split();
    const q = choice('B-006-quiz-02');
    expect(Object.values(matrix['runs-through']!).every(Boolean)).toBe(true);
    expect(q.prompt).toContain('expect(true).toBe(true)');
    expect(q.options[q.correctIndex]).toContain('auch, wenn sie kaputt ist');
  });

  it('Quiz 3: Nur die richtige Option erwischt die Variante „Menge ignoriert“', async () => {
    const { matrix } = await split();
    const q = choice('B-006-quiz-03');
    expect(q.prompt).toContain(`„${MUTANTS['ignore-quantity'].label}“`);
    // Jede Option ist der Name eines vorbereiteten Tests.
    const ids = q.options.map((o) => PRESET_TESTS.find((t) => `${t.name}.` === o)?.id);
    expect(ids.every(Boolean), q.options.join(' | ')).toBe(true);
    const caught = ids.map((id) => matrix[id!]!['ignore-quantity'] === false);
    expect(caught).toEqual(q.options.map((_, i) => i === q.correctIndex));
    // Der gültige Kauf enthält zwei Becher: Daran scheitert die Variante.
    expect(VALID_PURCHASE.ecommerce.items[0]!.quantity).toBe(2);
    expect(q.explanation).toContain('zwei Kaffeebecher');
  });

  it('Quiz 4: Ein Test, der am Original scheitert, „erwischt“ jede Variante', async () => {
    const q = choice('B-006-quiz-04');
    const matrix = await killMatrix([{ id: 'red', name: 'immer rot', fn: (api) => api.expect(1).toBe(2) }]);
    expect(Object.values(matrix.red!).every((passed) => !passed)).toBe(true);
    expect(q.options[q.correctIndex]).toContain('erwischt jede Variante');
  });

  it('Tipp 1: value 35 liegt weniger als einen Cent neben der Summe des gültigen Kaufs', () => {
    const hint = meta.codeTasks![0]!.hints[0]!;
    expect(hint).toContain('value: 35 }');
    const event = { ...VALID_PURCHASE, ecommerce: { ...VALID_PURCHASE.ecommerce, value: 35 } };
    const sum = VALID_PURCHASE.ecommerce.items.reduce((s, i) => s + i.price * i.quantity, 0);
    expect(35 - sum).toBeGreaterThan(0);
    expect(35 - sum).toBeLessThanOrEqual(VALUE_TOLERANCE + 1e-9);
    expect(validateEvent(event)).toEqual([]);
    expect(MUTANTS['no-tolerance'].validate(event)).not.toEqual([]);
    expect(meta.codeTasks![0]!.solution).toContain('value: 35 }');
  });

  it('Tipp 2: der gültige Kauf zählt die Menge schon mit', () => {
    expect(meta.codeTasks![0]!.hints[1]).toContain('zwei Kaffeebecher');
    expect(VALID_PURCHASE.ecommerce.items[0]).toMatchObject({ item_name: 'Kaffeebecher', quantity: 2 });
  });
});

describe('B-006 Inhalte: Antwortpositionen', () => {
  // Das Quiz zeigt die Optionen in Quellreihenfolge; steht die richtige immer
  // an derselben Stelle, lässt sie sich erraten.
  it('die Auswahlfragen haben ihre richtige Antwort an verschiedenen Stellen', () => {
    const positions = meta.quiz.flatMap((q) => (q.type === 'choice' ? [q.correctIndex] : []));
    expect(positions.length).toBeGreaterThan(1);
    expect(new Set(positions).size).toBe(positions.length);
  });
});
