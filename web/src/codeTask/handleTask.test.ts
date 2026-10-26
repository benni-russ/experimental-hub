import { describe, expect, it } from 'vitest';
import { handleTask } from './handleTask';
import type { CheckModule } from './types';

const mod: CheckModule = { exportsNeeded: [], checks: [{ name: 'immer grün', run() {} }] };

describe('handleTask', () => {
  it('meldet eine unbekannte Aufgabe', async () => {
    await expect(handleTask({}, 'x', '')).resolves.toEqual({ status: 'error', message: 'Unbekannte Aufgabe' });
  });

  it('erbt keine Namen aus Object.prototype', async () => {
    await expect(handleTask({}, 'toString', '')).resolves.toEqual({
      status: 'error',
      message: 'Unbekannte Aufgabe',
    });
    await expect(handleTask({}, 'constructor', '')).resolves.toEqual({
      status: 'error',
      message: 'Unbekannte Aufgabe',
    });
  });

  it('meldet einen Ladefehler des Prüfmoduls auf Deutsch', async () => {
    const checks = { t: () => Promise.reject(new Error('Failed to fetch dynamically imported module: /x.js')) };
    await expect(handleTask(checks, 't', '')).resolves.toEqual({
      status: 'error',
      message: 'Die Prüfung konnte nicht geladen werden.',
    });
  });

  it('führt die Prüfungen aus', async () => {
    const checks = { t: () => Promise.resolve({ default: mod }) };
    await expect(handleTask(checks, 't', 'return {};')).resolves.toEqual({
      status: 'ok',
      results: [{ name: 'immer grün', passed: true }],
    });
  });
});
