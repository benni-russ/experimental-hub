import type { CheckModule } from './types';

// Prüfmodule je Code-Aufgabe, nachgeladen erst im Worker. Jedes Projekt
// ergänzt hier pro Aufgabe eine Zeile, z. B.
// 'B-001-code-01': () => import('../projects/b-001-…/checks'),
export const CHECKS: Record<string, () => Promise<{ default: CheckModule }>> = {
  // Entwicklungsbeispiel; fehlt in `projects` im Produktionsbuild (siehe registry.test.ts).
  '000-code-01': () => import('../projects/000-sample/code/01.checks'),
  'B-001-code-01': () => import('../projects/b-001-json-api/code/01.checks'),
  'B-001-code-02': () => import('../projects/b-001-json-api/code/02.checks'),
  'B-001-code-03': () => import('../projects/b-001-json-api/code/03.checks'),
  'B-002-code-01': () => import('../projects/b-002-http-requests/code/01.checks'),
  'B-002-code-02': () => import('../projects/b-002-http-requests/code/02.checks'),
  'B-003-code-01': () => import('../projects/b-003-event-loop/code/01.checks'),
  'B-003-code-02': () => import('../projects/b-003-event-loop/code/02.checks'),
  'B-004-code-01': () => import('../projects/b-004-ga4-event-builder/code/01.checks'),
  'B-005-code-01': () => import('../projects/b-005-react-rebuild/code/01.checks'),
  'B-006-code-01': () => import('../projects/b-006-testing-playground/code/01.checks'),
  'C-002-code-01': () => import('../projects/c-002-feed-inspector/code/01.checks'),
  'C-002-code-02': () => import('../projects/c-002-feed-inspector/code/02.checks'),
  'C-002-code-03': () => import('../projects/c-002-feed-inspector/code/03.checks'),
  'C-003-code-01': () => import('../projects/c-003-recommendations/code/01.checks'),
  'C-003-code-02': () => import('../projects/c-003-recommendations/code/02.checks'),
  'C-003-code-03': () => import('../projects/c-003-recommendations/code/03.checks'),
  'D-001-code-01': () => import('../projects/d-001-accessibility/code/01.checks'),
  'D-001-code-02': () => import('../projects/d-001-accessibility/code/02.checks'),
  'D-001-code-03': () => import('../projects/d-001-accessibility/code/03.checks'),
  'D-002-code-01': () => import('../projects/d-002-web-vitals/code/01.checks'),
  'D-002-code-02': () => import('../projects/d-002-web-vitals/code/02.checks'),
  'D-002-code-03': () => import('../projects/d-002-web-vitals/code/03.checks'),
};
