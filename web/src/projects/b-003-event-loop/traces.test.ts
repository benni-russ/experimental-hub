import { describe, expect, it } from 'vitest';
import { runSnippet, SNIPPETS, sourceOrder } from './traces';

describe('B-003 Schnipsel', () => {
  it('es sind genau diese fünf, in dieser Reihenfolge', () => {
    expect(SNIPPETS.map((s) => s.id)).toEqual(['sync', 'timeout', 'promise', 'await', 'mixed']);
  });

  for (const snippet of SNIPPETS) {
    describe(snippet.id, () => {
      // Die Zeichnung darf nie von der Wirklichkeit abweichen.
      it('die letzte Konsole der Schritte ist die echte Ausgabe', async () => {
        const real = await runSnippet(snippet.code);
        expect(real.length).toBeGreaterThan(0);
        expect(snippet.steps.at(-1)?.console).toEqual(real);
      });

      it('jeder Schritt hängt höchstens eine Konsolenzeile an', () => {
        let before: string[] = [];
        for (const step of snippet.steps) {
          expect(step.console.slice(0, before.length)).toEqual(before);
          expect(step.console.length - before.length).toBeLessThanOrEqual(1);
          before = step.console;
        }
      });

      it('jede markierte Zeile liegt im Code', () => {
        const lineCount = snippet.code.split('\n').length;
        for (const step of snippet.steps) {
          expect(Number.isInteger(step.line)).toBe(true);
          expect(step.line).toBeGreaterThanOrEqual(1);
          expect(step.line).toBeLessThanOrEqual(lineCount);
        }
      });

      it('am Ende sind Call Stack und beide Queues leer, jeder Schritt erklärt sich', () => {
        const last = snippet.steps.at(-1)!;
        expect([last.stack, last.micro, last.macro]).toEqual([[], [], []]);
        for (const step of snippet.steps) expect(step.note.trim()).not.toBe('');
      });

      it('die Zeilen zum Ordnen sind dieselben wie die echte Ausgabe', async () => {
        const real = await runSnippet(snippet.code);
        expect([...sourceOrder(snippet.code)].sort()).toEqual([...real].sort());
        expect(new Set(real).size).toBe(real.length);
      });
    });
  }

  it('gemischt: sechs Ausgaben, eine im Timer, zwei aus then und nach await', async () => {
    const mixed = SNIPPETS.find((s) => s.id === 'mixed')!;
    expect(mixed.code.match(/console\.log\(/g)).toHaveLength(6);
    expect(mixed.code).toContain('setTimeout(');
    expect(mixed.code).toContain('.then(');
    expect(mixed.code).toContain('await ');
    expect(await runSnippet(mixed.code)).toEqual(['Start', 'vor await', 'Ende', 'then', 'nach await', 'Timer']);
  });
});

describe('runSnippet', () => {
  it('führt echt aus und wartet auf Timer', async () => {
    expect(await runSnippet("setTimeout(() => console.log('spät'), 0); console.log('früh');")).toEqual(['früh', 'spät']);
  });

  it('zwei Läufe teilen nichts', async () => {
    await runSnippet("console.log('a');");
    expect(await runSnippet("console.log('b');")).toEqual(['b']);
  });
});

describe('sourceOrder', () => {
  it('liest die Texte der console.log in Leserichtung', () => {
    expect(sourceOrder("setTimeout(() => {\n  console.log('B');\n}, 0);\nconsole.log('A');")).toEqual(['B', 'A']);
  });
});
