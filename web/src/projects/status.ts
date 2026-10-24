import type { ContentMeta, StateResponse } from '@hub/shared';

export type ProjectStatus = 'open' | 'started' | 'done';

export const STATUS_TEXT: Record<ProjectStatus, string> = {
  open: 'Offen',
  started: 'Begonnen',
  done: 'Durchgearbeitet',
};

/**
 * Abgeleitet, nicht gespeichert: offen ohne Fortschrittseintrag, begonnen nach
 * dem ersten Öffnen, durchgearbeitet wenn alle Reflexionsfragen beantwortet
 * sind. Ohne Reflexionsfragen wird nie automatisch „durchgearbeitet“.
 */
export function projectStatus(meta: ContentMeta, state: StateResponse): ProjectStatus {
  if (!state.progress.some((p) => p.projectId === meta.id)) return 'open';
  if (meta.reflection.length === 0) return 'started';
  const answered = new Set(state.answeredReflections.map((a) => a.questionId));
  return meta.reflection.every((r) => answered.has(r.id)) ? 'done' : 'started';
}
