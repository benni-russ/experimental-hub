// Quelltexte der fünf Schnipsel, getrennt von den Schritten in traces.ts:
// content.ts braucht nur den Code, und so landen die Schritte nicht im
// Hauptbündel.

export type SnippetId = 'sync' | 'timeout' | 'promise' | 'await' | 'mixed';

const code = (...lines: string[]) => lines.join('\n');

export const SNIPPET_CODE: Record<SnippetId, string> = {
  sync: code(
    "console.log('A');",
    'function greet() {',
    "  console.log('B');",
    '}',
    'greet();',
    "console.log('C');",
  ),
  timeout: code("console.log('A');", 'setTimeout(() => {', "  console.log('B');", '}, 0);', "console.log('C');"),
  promise: code(
    "console.log('A');",
    'Promise.resolve().then(() => {',
    "  console.log('B');",
    '});',
    "console.log('C');",
  ),
  await: code(
    'async function run() {',
    "  console.log('B');",
    '  await null;',
    "  console.log('D');",
    '}',
    "console.log('A');",
    'run();',
    "console.log('C');",
  ),
  mixed: code(
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
};
