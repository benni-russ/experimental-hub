import type { CheckModule } from './types';

// Prüfmodule je Code-Aufgabe, nachgeladen erst im Worker. Jedes Projekt
// ergänzt hier pro Aufgabe eine Zeile, z. B.
// 'B-001-code-01': () => import('../projects/b-001-…/checks'),
export const CHECKS: Record<string, () => Promise<{ default: CheckModule }>> = {
  // Entwicklungsbeispiel; fehlt in `projects` im Produktionsbuild (siehe registry.test.ts).
  '000-code-01': () => import('../projects/000-sample/code/01.checks'),
};
