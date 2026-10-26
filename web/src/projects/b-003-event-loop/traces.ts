// Fünf Schnipsel für den Event Loop Visualizer, je mit handgeschriebenen
// Schritten. traces.test.ts führt jeden Schnipsel echt aus und vergleicht die
// letzte Konsole der Schritte mit der echten Ausgabe. Kein React hier: Die
// Prüfmodule der Code-Aufgaben laden diese Datei im Worker.

export interface TraceStep {
  /** markierte Zeile im Code, ab 1 gezählt */
  line: number;
  /** Call Stack von unten nach oben */
  stack: string[];
  /** Microtask-Queue, vorne = als Nächstes dran */
  micro: string[];
  /** Macrotask-Queue, vorne = als Nächstes dran */
  macro: string[];
  /** Konsole nach diesem Schritt */
  console: string[];
  /** Erklärzeile zum Schritt */
  note: string;
}

export type SnippetId = 'sync' | 'timeout' | 'promise' | 'await' | 'mixed';

export interface Snippet {
  id: SnippetId;
  title: string;
  code: string;
  steps: TraceStep[];
}

const code = (...lines: string[]) => lines.join('\n');

const step = (
  line: number,
  stack: string[],
  micro: string[],
  macro: string[],
  console: string[],
  note: string,
): TraceStep => ({ line, stack, micro, macro, console, note });

const SCRIPT = 'Skript';

export const SNIPPETS: Snippet[] = [
  {
    id: 'sync',
    title: 'Synchron',
    code: code(
      "console.log('A');",
      'function greet() {',
      "  console.log('B');",
      '}',
      'greet();',
      "console.log('C');",
    ),
    steps: [
      step(1, [SCRIPT], [], [], ['A'], 'Das Skript liegt als Erstes auf dem Call Stack. Zeile 1 läuft sofort: A.'),
      step(5, [SCRIPT, 'greet()'], [], [], ['A'], 'Der Aufruf legt greet() oben auf den Call Stack.'),
      step(3, [SCRIPT, 'greet()'], [], [], ['A', 'B'], 'Gearbeitet wird immer oben auf dem Stapel: greet() gibt B aus.'),
      step(6, [SCRIPT], [], [], ['A', 'B', 'C'], 'greet() ist fertig und verlässt den Stack. Das Skript macht weiter: C.'),
      step(6, [], [], [], ['A', 'B', 'C'], 'Skript fertig, Stack leer. Ohne Warteschlangen ist die Reihenfolge einfach die Leserichtung.'),
    ],
  },
  {
    id: 'timeout',
    title: 'setTimeout',
    code: code("console.log('A');", 'setTimeout(() => {', "  console.log('B');", '}, 0);', "console.log('C');"),
    steps: [
      step(1, [SCRIPT], [], [], ['A'], 'Synchroner Code läuft sofort: A.'),
      step(
        2,
        [SCRIPT],
        [],
        ['Timer-Funktion'],
        ['A'],
        'setTimeout führt die Funktion nicht aus, sondern gibt sie ab. Nach 0 ms wartet sie in der Macrotask-Queue.',
      ),
      step(5, [SCRIPT], [], ['Timer-Funktion'], ['A', 'C'], 'Das Skript läuft weiter, ohne auf den Timer zu achten: C.'),
      step(
        5,
        [],
        [],
        ['Timer-Funktion'],
        ['A', 'C'],
        'Skript fertig, Stack leer, keine Microtasks. Erst jetzt holt die Event Loop die nächste Macrotask.',
      ),
      step(3, ['Timer-Funktion'], [], [], ['A', 'C', 'B'], 'Die Timer-Funktion kommt auf den Stack: B, als Letztes.'),
      step(4, [], [], [], ['A', 'C', 'B'], 'Alles abgearbeitet. 0 ms hieß nicht „sofort“, sondern „wenn alles andere fertig ist“.'),
    ],
  },
  {
    id: 'promise',
    title: 'Promise.then',
    code: code(
      "console.log('A');",
      'Promise.resolve().then(() => {',
      "  console.log('B');",
      '});',
      "console.log('C');",
    ),
    steps: [
      step(1, [SCRIPT], [], [], ['A'], 'Synchroner Code läuft sofort: A.'),
      step(
        2,
        [SCRIPT],
        ['then-Funktion'],
        [],
        ['A'],
        'Das Promise ist schon erfüllt. then führt die Funktion trotzdem nicht sofort aus: Sie kommt in die Microtask-Queue.',
      ),
      step(5, [SCRIPT], ['then-Funktion'], [], ['A', 'C'], 'Das Skript läuft weiter: C.'),
      step(5, [], ['then-Funktion'], [], ['A', 'C'], 'Skript fertig, Stack leer. Jetzt kommen die Microtasks dran.'),
      step(3, ['then-Funktion'], [], [], ['A', 'C', 'B'], 'Die then-Funktion kommt auf den Stack: B.'),
      step(4, [], [], [], ['A', 'C', 'B'], 'Alles abgearbeitet. Selbst ein erfülltes Promise antwortet erst nach dem synchronen Code.'),
    ],
  },
  {
    id: 'await',
    title: 'await',
    code: code(
      'async function run() {',
      "  console.log('B');",
      '  await null;',
      "  console.log('D');",
      '}',
      "console.log('A');",
      'run();',
      "console.log('C');",
    ),
    steps: [
      step(6, [SCRIPT], [], [], ['A'], 'Die Funktion ist nur angelegt, noch nicht aufgerufen. Zuerst Zeile 6: A.'),
      step(7, [SCRIPT, 'run()'], [], [], ['A'], 'Der Aufruf legt run() auf den Call Stack.'),
      step(2, [SCRIPT, 'run()'], [], [], ['A', 'B'], 'Bis zum ersten await läuft eine async-Funktion ganz normal: B.'),
      step(
        3,
        [SCRIPT],
        ['run() ab Zeile 4'],
        [],
        ['A', 'B'],
        'await: Der Rest von run() kommt später, als Microtask. run() verlässt den Stack, der Aufrufer macht weiter.',
      ),
      step(8, [SCRIPT], ['run() ab Zeile 4'], [], ['A', 'B', 'C'], 'Das Skript läuft weiter: C.'),
      step(8, [], ['run() ab Zeile 4'], [], ['A', 'B', 'C'], 'Skript fertig, Stack leer. Jetzt die Microtasks.'),
      step(4, ['run()'], [], [], ['A', 'B', 'C', 'D'], 'run() macht nach dem await weiter: D.'),
      step(5, [], [], [], ['A', 'B', 'C', 'D'], 'Alles abgearbeitet. await hat die Funktion in zwei Hälften geteilt.'),
    ],
  },
  {
    id: 'mixed',
    title: 'Alles gemischt',
    code: code(
      "console.log('Start');",
      'setTimeout(() => {',
      "  console.log('Timer');",
      '}, 0);',
      'Promise.resolve().then(() => {',
      "  console.log('then');",
      '});',
      'async function load() {',
      "  console.log('vor await');",
      '  await null;',
      "  console.log('nach await');",
      '}',
      'load();',
      "console.log('Ende');",
    ),
    steps: [
      step(1, [SCRIPT], [], [], ['Start'], 'Synchroner Code läuft sofort, Zeile für Zeile: Start.'),
      step(2, [SCRIPT], [], ['Timer-Funktion'], ['Start'], 'setTimeout gibt die Funktion ab. Nach 0 ms wartet sie in der Macrotask-Queue.'),
      step(
        5,
        [SCRIPT],
        ['then-Funktion'],
        ['Timer-Funktion'],
        ['Start'],
        'then auf einem erfüllten Promise: Die Funktion kommt in die Microtask-Queue.',
      ),
      step(
        13,
        [SCRIPT, 'load()'],
        ['then-Funktion'],
        ['Timer-Funktion'],
        ['Start'],
        'Die Funktion in Zeile 8 bis 12 ist nur angelegt. Erst der Aufruf legt load() auf den Call Stack.',
      ),
      step(
        9,
        [SCRIPT, 'load()'],
        ['then-Funktion'],
        ['Timer-Funktion'],
        ['Start', 'vor await'],
        'Bis zum ersten await läuft load() synchron: vor await.',
      ),
      step(
        10,
        [SCRIPT],
        ['then-Funktion', 'load() ab Zeile 11'],
        ['Timer-Funktion'],
        ['Start', 'vor await'],
        'await: Der Rest von load() stellt sich hinten in die Microtask-Queue, hinter die then-Funktion.',
      ),
      step(
        14,
        [SCRIPT],
        ['then-Funktion', 'load() ab Zeile 11'],
        ['Timer-Funktion'],
        ['Start', 'vor await', 'Ende'],
        'Das Skript läuft weiter: Ende.',
      ),
      step(
        14,
        [],
        ['then-Funktion', 'load() ab Zeile 11'],
        ['Timer-Funktion'],
        ['Start', 'vor await', 'Ende'],
        'Skript fertig, Stack leer. Jetzt kommen alle Microtasks dran, bevor irgendeine Macrotask darf.',
      ),
      step(
        6,
        ['then-Funktion'],
        ['load() ab Zeile 11'],
        ['Timer-Funktion'],
        ['Start', 'vor await', 'Ende', 'then'],
        'Die erste Microtask, die then-Funktion: then.',
      ),
      step(
        11,
        ['load()'],
        [],
        ['Timer-Funktion'],
        ['Start', 'vor await', 'Ende', 'then', 'nach await'],
        'Die zweite Microtask: load() macht nach dem await weiter.',
      ),
      step(
        3,
        ['Timer-Funktion'],
        [],
        [],
        ['Start', 'vor await', 'Ende', 'then', 'nach await', 'Timer'],
        'Die Microtask-Queue ist leer. Erst jetzt holt die Event Loop die Macrotask: Timer, ganz zum Schluss.',
      ),
      step(
        4,
        [],
        [],
        [],
        ['Start', 'vor await', 'Ende', 'then', 'nach await', 'Timer'],
        'Alles abgearbeitet. Der Timer stand im Code an zweiter Stelle und kam als Letzter.',
      ),
    ],
  },
];

/** Die Texte der console.log-Aufrufe in Leserichtung, z. B. als Ausgangsreihenfolge zum Schätzen. */
export function sourceOrder(source: string): string[] {
  return [...source.matchAll(/console\.log\('([^']*)'\)/g)].map((m) => m[1]!);
}

/** Wartezeit nach dem Lauf, damit Timer und Promises fertig werden */
const SETTLE_MS = 50;

/**
 * Führt einen Schnipsel wirklich aus und sammelt, was er mit console.log
 * ausgibt, auch das, was Timer und Promises später schreiben.
 */
export async function runSnippet(source: string): Promise<string[]> {
  const out: string[] = [];
  const consoleStub = { log: (...args: unknown[]) => void out.push(args.map(String).join(' ')) };
  (new Function('console', source) as (c: typeof consoleStub) => void)(consoleStub);
  await new Promise((resolve) => setTimeout(resolve, SETTLE_MS));
  return out;
}
