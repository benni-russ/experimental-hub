import { describe, expect, it } from 'vitest';
import { allText, checkStructure } from '../contentChecks';
import { meta } from './content';
import { runSnippet, SNIPPETS } from './traces';

const text = allText(meta);
const mixed = SNIPPETS.find((s) => s.id === 'mixed')!;
const choice = (id: string) => {
  const q = meta.quiz.find((x) => x.id === id);
  if (q?.type !== 'choice') throw new Error(`${id} ist keine Auswahlfrage`);
  return q;
};

describe('B-003 Inhalte: Aufbau', () => {
  it('Umfang und IDs stimmen', () => {
    expect(checkStructure(meta, { quiz: 4, reflection: [2, 3], cards: [5, 8] })).toEqual([]);
  });

  it('baut auf B-001 und B-002 auf, führt zu B-004, die Schätzfrage ist die erste', () => {
    expect(meta.id).toBe('B-003');
    expect(meta.buildsOn).toEqual(['B-001', 'B-002']);
    expect(meta.leadsTo).toEqual(['B-004']);
    expect(meta.quiz.map((q) => q.id)).toEqual(['B-003-quiz-01', 'B-003-quiz-02', 'B-003-quiz-03', 'B-003-quiz-04']);
    expect(meta.intro.estimateQuestionId).toBe('B-003-quiz-01');
  });

  it('zwei Code-Aufgaben mit Vorlage, zwei Tipps und Musterlösung', () => {
    expect(meta.codeTasks?.map((t) => t.id)).toEqual(['B-003-code-01', 'B-003-code-02']);
    for (const t of meta.codeTasks ?? []) {
      expect(t.hints).toHaveLength(2);
      expect(t.starter.trimEnd()).toMatch(/return \{ \w+ \};$/);
      expect(t.solution.trimEnd()).toMatch(/return \{ \w+ \};$/);
    }
    expect(meta.codeTasks?.[0]?.starter).toContain('// dein Code');
  });

  it('Aufgabe 1 zeigt das gemischte Beispiel wörtlich als Kommentar', () => {
    const starter = meta.codeTasks?.[0]?.starter ?? '';
    for (const line of mixed.code.split('\n')) expect(starter).toContain(`// ${line}`);
  });

  it('Aufgabe 2: Die Vorlage gibt B A C aus, die Musterlösung A B C', async () => {
    const task = meta.codeTasks?.[1];
    const body = (code: string) => `${code.replace('return { run };', '')}\nrun();`;
    expect(await runSnippet(body(task?.starter ?? ''))).toEqual(['B', 'A', 'C']);
    expect(await runSnippet(body(task?.solution ?? ''))).toEqual(['A', 'B', 'C']);
    expect(text).toContain('`B`, `A`, `C`');
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

describe('B-003 Inhalte: zitierte Zahlen und Reihenfolgen', () => {
  // Jede Zahl im Text steht hier; jede wird unten nachgerechnet oder geprüft.
  it('der Text nennt nur geprüfte Zahlen', () => {
    const numbers = [...new Set(text.match(/\d+/g))].sort();
    // 0: setTimeout mit 0 ms
    expect(numbers).toEqual(['0']);
  });

  it('Schätzfrage: Die Ausgabe aus setTimeout steht im gemischten Beispiel an sechster Stelle', async () => {
    const real = await runSnippet(mixed.code);
    expect(real).toHaveLength(6);
    const position = real.indexOf('Timer') + 1;
    expect(position).toBe(6);
    const q = meta.quiz[0];
    expect(q?.type === 'estimate' && q.answer).toBe(position);
    expect(q?.type === 'estimate' && q.tolerance).toBe(0);
    expect(q?.type === 'estimate' && q.unit).toBe('. Zeile');
    expect(q?.prompt).toBe('An welcher Stelle erscheint im gemischten Beispiel die Ausgabe aus setTimeout?');
    expect(text).toContain('sechs Ausgaben');
    expect(text).toContain('an sechster Stelle');
    // Die Erklärung zählt den synchronen Teil und die Microtasks in echter Reihenfolge auf.
    expect(q?.explanation).toContain(real.slice(0, 3).join(', '));
    expect(q?.explanation).toContain(real.slice(3, 5).join(' und '));
    // Im Code steht der Timer an zweiter Stelle.
    expect(mixed.code.split('\n').filter((l) => l.includes('console.log'))[1]).toContain('Timer');
    expect(q?.explanation).toContain('an zweiter Stelle');
  });

  it('Quiz 2: Die richtige Option ist die echte Ausgabe', async () => {
    const q = choice('B-003-quiz-02');
    const snippet = "console.log('A'); setTimeout(() => console.log('B'), 0); Promise.resolve().then(() => console.log('C')); console.log('D');";
    expect(q.prompt).toContain(snippet);
    const real = await runSnippet(snippet);
    expect(q.options[q.correctIndex]).toBe(real.join(', '));
    expect(new Set(q.options).size).toBe(q.options.length);
  });

  it('Quiz 3: Eine Kette von Microtasks hält einen wartenden Timer auf', async () => {
    const q = choice('B-003-quiz-03');
    expect(q.options[q.correctIndex]).toContain('nie');
    // Begrenzte Kette statt Endlosschleife: Der Timer läuft erst, wenn alle tausend fertig sind.
    const real = await runSnippet(
      [
        "setTimeout(() => console.log('Timer'), 0);",
        'let n = 0;',
        'const next = () => { n += 1; if (n < 1000) Promise.resolve().then(next); else console.log(String(n)); };',
        'Promise.resolve().then(next);',
      ].join('\n'),
    );
    expect(real).toEqual(['1000', 'Timer']);
  });

  it('Quiz 4: Nach await läuft zuerst der Aufrufer weiter', async () => {
    const q = choice('B-003-quiz-04');
    expect(q.options[q.correctIndex]).toContain('Microtask');
    const awaitSnippet = SNIPPETS.find((s) => s.id === 'await')!;
    expect(await runSnippet(awaitSnippet.code)).toEqual(['A', 'B', 'C', 'D']);
  });

  it('then vor setTimeout, auch wenn setTimeout zuerst im Code steht', async () => {
    expect(await runSnippet("setTimeout(() => console.log('T'), 0); Promise.resolve().then(() => console.log('P'));")).toEqual([
      'P',
      'T',
    ]);
    expect(text).toContain('obwohl setTimeout zuerst im Code steht');
  });
});
