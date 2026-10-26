import type { CheckModule } from './types';

// Prüfmodule je Code-Aufgabe, nachgeladen erst im Worker. Jedes Projekt
// ergänzt hier pro Aufgabe eine Zeile, z. B.
// 'B-001-code-01': () => import('../projects/b-001-…/checks'),
export const CHECKS: Record<string, () => Promise<{ default: CheckModule }>> = {};
