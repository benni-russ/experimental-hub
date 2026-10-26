// @vitest-environment jsdom
import { describe, expect, it } from 'vitest';
import { allText, checkStructure } from '../contentChecks';
import { CATALOG, cartReducer, EMPTY_CART, euro, type CartState } from './cart';
import { classicWrites, DEMO_SEQUENCE, mountClassic } from './classicBuilder';
import { meta } from './content';

const text = allText(meta);
const choice = (id: string) => {
  const q = meta.quiz.find((x) => x.id === id);
  if (q?.type !== 'choice') throw new Error(`${id} ist keine Auswahlfrage`);
  return q;
};
const WORDS = ['null', 'eins', 'zwei', 'drei', 'vier', 'fünf', 'sechs'];

/** Schreibzugriffe je Beispiel-Eingabe, beginnend beim leeren Warenkorb */
function writesPerInput(): string[][] {
  let state: CartState = EMPTY_CART;
  return DEMO_SEQUENCE.map((action) => {
    const writes = classicWrites(state, action);
    state = cartReducer(state, action);
    return writes;
  });
}

describe('B-005 Inhalte: Aufbau', () => {
  it('Umfang und IDs stimmen', () => {
    expect(checkStructure(meta, { quiz: 4, reflection: [2, 3], cards: [5, 8] })).toEqual([]);
  });

  it('baut auf B-004 auf, führt zu B-006, die Schätzfrage ist die erste', () => {
    expect(meta.id).toBe('B-005');
    expect(meta.track).toBe('web');
    expect(meta.kind).toBe('project');
    expect(meta.buildsOn).toEqual(['B-004']);
    expect(meta.leadsTo).toEqual(['B-006']);
    expect(meta.quiz.map((q) => q.id)).toEqual(['B-005-quiz-01', 'B-005-quiz-02', 'B-005-quiz-03', 'B-005-quiz-04']);
    expect(meta.intro.estimateQuestionId).toBe('B-005-quiz-01');
  });

  it('eine Code-Aufgabe mit Vorlage, zwei Tipps und Musterlösung', () => {
    const task = meta.codeTasks?.[0];
    expect(meta.codeTasks?.map((t) => t.id)).toEqual(['B-005-code-01']);
    expect(task?.hints).toHaveLength(2);
    expect(task?.starter.trimEnd()).toMatch(/return \{ eventReducer, toEvent \};$/);
    expect(task?.solution.trimEnd()).toMatch(/return \{ eventReducer, toEvent \};$/);
    expect(task?.starter).toContain('// dein Code');
    for (const word of ["`{ type: 'add'", "`{ type: 'remove'", "`{ type: 'setQuantity'", '`toEvent(state)`', '`eventReducer(state, action)`']) {
      expect(task?.prompt).toContain(word);
    }
  });

  // Quiz, Karten, Reflexion und Einstieg zeigen Text ohne Formatierung.
  it('Backticks nur in Code-Aufgaben', () => {
    const plain = [
      meta.intro.text,
      meta.question,
      ...meta.quiz.flatMap((q) => [q.prompt, q.explanation, ...(q.type === 'choice' ? q.options : [])]),
      ...meta.reflection.map((r) => r.prompt),
      ...meta.cards.flatMap((c) => [c.front, c.back]),
    ].join('\n');
    expect(plain).not.toContain('`');
  });
});

describe('B-005 Inhalte: zitierte Zahlen', () => {
  // Jede Zahl im Text steht hier; jede wird unten nachgerechnet.
  it('der Text nennt nur geprüfte Zahlen', () => {
    const numbers = [...new Set(text.match(/\d+/g))].sort();
    expect(numbers).toEqual(
      [
        // Schätzfrage: zehn Schreibzugriffe
        '10',
        // Quiz 2: Die Summe bleibt bei 0,00 €; setQuantity mit 0
        '0',
        '00',
        // Tipp 2: Runden auf Cent
        '100',
      ].sort(),
    );
  });

  it('Schätzfrage: die Zahl der Schreibzugriffe ist aus classicWrites über DEMO_SEQUENCE berechnet', () => {
    const perInput = writesPerInput();
    const answer = perInput.reduce((n, writes) => n + writes.length, 0);
    expect(answer).toBe(10);

    const q = meta.quiz[0];
    expect(q?.type).toBe('estimate');
    if (q?.type !== 'estimate') return;
    expect(q.prompt).toBe('Wie oft schreibt der klassische Builder bei den drei Beispiel-Eingaben direkt ins DOM?');
    expect(q.answer).toBe(answer);
    expect(q.tolerance).toBe(0.25);
    expect(DEMO_SEQUENCE).toHaveLength(3);
    expect(q.prompt).toContain(`${WORDS[DEMO_SEQUENCE.length]} Beispiel-Eingaben`);

    // Die Erklärung zählt je Eingabe richtig.
    const [first, second, third] = perInput.map((w) => w.length);
    expect(q.explanation.startsWith(`${answer}.`)).toBe(true);
    expect(q.explanation).toContain(`Beim ersten Artikel sind es ${WORDS[first!]}`);
    expect(q.explanation).toContain(`bei der Teedose ${WORDS[second!]}`);
    expect(q.explanation).toContain(`beim Ändern der Menge noch einmal ${WORDS[third!]}`);
    expect(q.explanation).toContain('keinen einzigen');
  });

  it('der Einstieg beschreibt genau die drei Beispiel-Eingaben', () => {
    const [cupAdd, tinAdd, setQty] = DEMO_SEQUENCE;
    expect(cupAdd).toEqual({ type: 'add', item: { ...CATALOG[0]!, quantity: 1 } });
    expect(tinAdd).toEqual({ type: 'add', item: { ...CATALOG[1]!, quantity: 1 } });
    expect(setQty).toEqual({ type: 'setQuantity', item_id: CATALOG[0]!.item_id, quantity: 2 });
    expect(CATALOG[0]!.item_name).toBe('Kaffeebecher');
    expect(CATALOG[1]!.item_name).toBe('Teedose');
    expect(meta.intro.text).toContain('einen Kaffeebecher hinein, dann eine Teedose');
    expect(meta.intro.text).toContain(`beim Becher die Menge auf ${WORDS[2]}`);
  });

  it('Quiz 2: Mit dem Fehler erscheint die Zeile, die Summe bleibt bei 0,00 €', () => {
    const q = choice('B-005-quiz-02');
    const root = document.createElement('div');
    const dispose = mountClassic(root, () => {}, { forgetTotal: true });
    root.querySelector<HTMLButtonElement>(`button[data-action="add"][data-item-id="${CATALOG[1]!.item_id}"]`)!.click();
    expect(root.querySelectorAll('li[data-item-id]')).toHaveLength(1);
    expect(root.querySelector('[data-role="total"]')?.textContent).toBe(euro(0));
    dispose();
    expect(q.prompt).toContain('eine Teedose');
    expect(q.options[q.correctIndex]).toBe(`Die Zeile erscheint, die Summe bleibt bei ${euro(0)}.`);
    expect(new Set(q.options).size).toBe(q.options.length);
  });

  it('Quiz 3: Die richtige Option nennt alten Zustand und Aktion', () => {
    const q = choice('B-005-quiz-03');
    expect(q.options[q.correctIndex]).toContain('altem Zustand und Aktion');
  });

  it('Quiz 4: Die richtige Option nennt das fehlende neue Objekt', () => {
    const q = choice('B-005-quiz-04');
    expect(q.options[q.correctIndex]).toContain('kein neues Objekt');
  });

  it('setQuantity mit 0 entfernt, wie Karte und Aufgabe sagen', () => {
    const state = cartReducer(EMPTY_CART, DEMO_SEQUENCE[0]!);
    expect(cartReducer(state, { type: 'setQuantity', item_id: CATALOG[0]!.item_id, quantity: 0 }).items).toEqual([]);
    expect(text).toContain('Menge von 0 oder weniger');
    expect(meta.codeTasks?.[0]?.prompt).toContain('bei `0` oder weniger fällt das Item weg');
  });

  it('Tipp 2 rundet wie toEvent auf Cent', () => {
    expect(meta.codeTasks?.[0]?.hints[1]).toContain('Math.round(sum * 100) / 100');
    expect(meta.codeTasks?.[0]?.solution).toContain('Math.round(sum * 100) / 100');
  });
});

describe('B-005 Inhalte: Antwortpositionen', () => {
  // Das Quiz zeigt die Optionen in Quellreihenfolge; steht die richtige immer
  // an derselben Stelle, lässt sie sich erraten.
  it('die Auswahlfragen haben ihre richtige Antwort an verschiedenen Stellen', () => {
    const positions = meta.quiz.flatMap((q) => (q.type === 'choice' ? [q.correctIndex] : []));
    expect(positions.length).toBeGreaterThan(1);
    expect(new Set(positions).size).toBe(positions.length);
  });
});
