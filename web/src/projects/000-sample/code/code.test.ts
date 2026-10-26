import { describe, expect, it } from 'vitest';
import { runChecks } from '../../../codeTask/runChecks';
import { meta } from '../content';
import checks from './01.checks';

const task = meta.codeTasks![0]!;

describe('000-sample Code-Aufgabe', () => {
  it('die Musterlösung besteht alle Prüfungen', async () => {
    const r = await runChecks(checks, task.solution);
    expect(r.status === 'ok' && r.results.every((c) => c.passed)).toBe(true);
  });

  it('die Vorlage scheitert an mindestens einer Prüfung', async () => {
    const r = await runChecks(checks, task.starter);
    expect(r.status === 'ok' && r.results.some((c) => !c.passed)).toBe(true);
  });
});
