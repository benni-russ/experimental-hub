import type { CheckResult, RunResult } from './types';

export interface ResultView {
  /** Zeile über der Liste, z. B. „3 von 4 bestanden“ */
  summary: string;
  /** Zeile im Editor, die markiert wird */
  errorLine: number | null;
  allPassed: boolean;
  items: CheckResult[];
}

// Meldungen von Runner und Worker, die nicht vom Code der Lernenden stammen.
const ABORTED = new Set([
  'Unbekannte Aufgabe',
  'Die Prüfung konnte nicht gestartet werden.',
  'Die Prüfung konnte nicht geladen werden.',
]);

export function describeResult(result: RunResult): ResultView {
  if (result.status === 'timeout') {
    return { summary: 'Läuft zu lange – Endlosschleife oder zu lange Wartezeit?', errorLine: null, allPassed: false, items: [] };
  }
  if (result.status === 'error') {
    if (ABORTED.has(result.message)) {
      return { summary: `Die Prüfung ist abgebrochen: ${result.message}`, errorLine: null, allPassed: false, items: [] };
    }
    const syntax = result.message.match(/^Syntaxfehler: (.*)$/s);
    const line = result.line ?? null;
    let summary: string;
    if (syntax) summary = line === null ? result.message : `Syntaxfehler in Zeile ${line}: ${syntax[1]}`;
    else summary = line === null ? `Fehler: ${result.message}` : `Fehler in Zeile ${line}: ${result.message}`;
    return { summary, errorLine: line, allPassed: false, items: [] };
  }
  const passed = result.results.filter((r) => r.passed).length;
  return {
    summary: `${passed} von ${result.results.length} bestanden`,
    errorLine: null,
    allPassed: result.results.length > 0 && passed === result.results.length,
    items: result.results,
  };
}
