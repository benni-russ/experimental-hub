import type { ContentMeta } from '@hub/shared';

// Gemeinsame Prüfungen für die content.test.ts der Module. Jedes Modul ruft
// checkStructure mit seinem Umfang auf und sucht mit allText nach zitierten Zahlen.

export interface ContentSize {
  quiz: number;
  reflection: [number, number];
  cards: [number, number];
}

/** Alle Texte eines Moduls, mit Zeilenumbruch verbunden. */
export function allText(meta: ContentMeta): string {
  return [
    meta.intro.text,
    ...meta.quiz.flatMap((q) => [q.prompt, q.explanation, ...(q.type === 'choice' ? q.options : [])]),
    ...meta.reflection.map((r) => r.prompt),
    ...meta.cards.flatMap((c) => [c.front, c.back]),
    ...(meta.codeTasks ?? []).flatMap((t) => [t.title, t.prompt, ...t.hints]),
  ].join('\n');
}

/** Liste der Verstöße gegen den Aufbau; leer heißt in Ordnung. */
export function checkStructure(meta: ContentMeta, size: ContentSize): string[] {
  const problems: string[] = [];
  const id = meta.id;
  // Den Punkt in Einheiten-IDs (A-002.1) wörtlich nehmen.
  const idPattern = id.replaceAll('.', '\\.');

  const codeTasks = meta.codeTasks ?? [];
  const schemas: [string, RegExp, { id: string }[]][] = [
    ['Quizfrage', new RegExp(`^${idPattern}-quiz-\\d{2}$`), meta.quiz],
    ['Reflexion', new RegExp(`^${idPattern}-refl-\\d{2}$`), meta.reflection],
    ['Karte', new RegExp(`^${idPattern}-card-\\d{2}$`), meta.cards],
    ['Code-Aufgabe', new RegExp(`^${idPattern}-code-\\d{2}$`), codeTasks],
  ];
  for (const [label, pattern, items] of schemas) {
    for (const item of items) {
      if (!pattern.test(item.id)) problems.push(`${label} hat eine ungültige ID: ${item.id}`);
    }
  }

  const seen = new Set<string>();
  for (const item of [...meta.quiz, ...meta.reflection, ...meta.cards, ...codeTasks]) {
    if (seen.has(item.id)) problems.push(`ID doppelt vergeben: ${item.id}`);
    seen.add(item.id);
  }

  if (meta.quiz.length > 0) {
    const estimateId = `${id}-quiz-01`;
    if (meta.intro.estimateQuestionId !== estimateId) {
      problems.push(`Einstieg verweist nicht auf ${estimateId} (ist: ${meta.intro.estimateQuestionId ?? 'nichts'})`);
    }
    const estimate = meta.quiz.find((q) => q.id === estimateId);
    if (estimate?.type !== 'estimate') {
      problems.push(`${estimateId} ist keine Schätzfrage (Typ estimate)`);
    }
  }

  for (const q of meta.quiz) {
    if (q.type === 'choice' && correctIsGiveaway(q.options, q.correctIndex)) {
      problems.push(`${q.id}: Die richtige Option ist deutlich die längste und damit erratbar`);
    }
  }

  if (meta.quiz.length !== size.quiz) {
    problems.push(`Quizumfang ist ${meta.quiz.length}, erwartet ${size.quiz}`);
  }
  checkRange('Reflexionen', meta.reflection.length, size.reflection, problems);
  checkRange('Karten', meta.cards.length, size.cards, problems);

  // Quiz, Karten, Reflexion, Einstieg und Code-Titel zeigen reinen Text;
  // Backticks setzen nur Aufgabentext und Hinweise der Code-Aufgaben als Code.
  const plain: [string, string][] = [
    ['Einstieg', meta.intro.text],
    ['Kernfrage', meta.question],
    ...meta.quiz.flatMap((q): [string, string][] =>
      [q.prompt, q.explanation, ...(q.type === 'choice' ? q.options : [])].map((t) => [q.id, t]),
    ),
    ...meta.reflection.map((r): [string, string] => [r.id, r.prompt]),
    ...meta.cards.flatMap((c): [string, string][] => [
      [c.id, c.front],
      [c.id, c.back],
    ]),
  ];
  for (const [where, text] of plain) {
    if (text.includes('`')) problems.push(`Backtick im reinen Text: ${where}`);
  }
  for (const task of codeTasks) {
    if (task.title.includes('`')) problems.push(`Backtick im Titel der Code-Aufgabe ${task.id}`);
  }

  if (meta.kind === 'unit') {
    if (!meta.attachedTo) problems.push('Unit ohne attachedTo');
    if (meta.quiz.length > 0) problems.push('Unit mit Quizfragen, erwartet leeres quiz');
  }

  return problems;
}

/** Erratbar: die richtige Option ist strikt die längste und mehr als 1,3-mal so lang wie die zweitlängste. */
const GIVEAWAY_RATIO = 1.3;
function correctIsGiveaway(options: string[], correctIndex: number): boolean {
  const correct = options[correctIndex]?.length ?? 0;
  const longestOther = Math.max(0, ...options.filter((_, i) => i !== correctIndex).map((o) => o.length));
  return correct > longestOther && correct > GIVEAWAY_RATIO * longestOther;
}

function checkRange(label: string, count: number, [min, max]: [number, number], problems: string[]): void {
  if (count < min || count > max) {
    problems.push(`${label}: ${count}, erwartet ${min}–${max}`);
  }
}
