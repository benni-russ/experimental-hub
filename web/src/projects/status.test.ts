import { describe, expect, it } from 'vitest';
import type { ContentMeta } from '@hub/shared';
import type { StateResponse } from '@hub/shared';
import { projectStatus } from './status';

const meta = { id: 'A-001', reflection: [{ id: 'A-001-refl-01' }, { id: 'A-001-refl-02' }] } as ContentMeta;
const metaOhneReflexion = { id: 'A-002.1', reflection: [] } as unknown as ContentMeta;

const progress = (projectId: string) => ({ projectId, startedAt: '2026-10-24T10:00:00Z', lastOpenedAt: '2026-10-24T10:00:00Z' });
const state = (p: string[], answers: string[]): StateResponse => ({
  progress: p.map(progress),
  answeredReflections: answers.map((questionId) => ({ questionId, projectId: 'A-001' })),
  dueCount: 0,
});

describe('projectStatus', () => {
  it('offen ohne Fortschritt', () => expect(projectStatus(meta, state([], []))).toBe('open'));
  it('begonnen nach Öffnen', () => expect(projectStatus(meta, state(['A-001'], []))).toBe('started'));
  it('begonnen bei nur einer von zwei Reflexionen', () =>
    expect(projectStatus(meta, state(['A-001'], ['A-001-refl-01']))).toBe('started'));
  it('durchgearbeitet bei allen Reflexionen', () =>
    expect(projectStatus(meta, state(['A-001'], ['A-001-refl-01', 'A-001-refl-02']))).toBe('done'));
  it('veraltete Antwort-IDs zählen nicht', () =>
    expect(projectStatus(meta, state(['A-001'], ['A-001-refl-01', 'A-001-refl-99']))).toBe('started'));
  it('ohne Reflexionsfragen nie automatisch durchgearbeitet', () =>
    expect(projectStatus(metaOhneReflexion, state(['A-002.1'], []))).toBe('started'));
});
