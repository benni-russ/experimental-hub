import { describe, expect, it } from 'vitest';
import { runChecks } from '../../../codeTask/runChecks';
import type { CheckModule, RunResult } from '../../../codeTask/types';
import { meta } from '../content';
import checks01 from './01.checks';

const MODULES: Record<string, CheckModule> = {
  'B-005-code-01': checks01,
};

const failures = (r: RunResult) => (r.status === 'ok' ? r.results.filter((c) => !c.passed) : [r]);

describe('B-005 Code-Aufgaben', () => {
  it('es ist genau diese eine', () => {
    expect(meta.codeTasks?.map((t) => t.id)).toEqual(['B-005-code-01']);
  });

  for (const task of meta.codeTasks ?? []) {
    const module = MODULES[task.id]!;

    it(`${task.id}: die Musterlösung besteht alle Prüfungen`, async () => {
      const r = await runChecks(module, task.solution);
      expect(r.status).toBe('ok');
      expect(failures(r)).toEqual([]);
    });

    it(`${task.id}: die Vorlage scheitert an mindestens einer Prüfung`, async () => {
      const r = await runChecks(module, task.starter);
      expect(r.status === 'ok' && r.results.some((c) => !c.passed)).toBe(true);
    });
  }
});

// Typische Fehler, die die Prüfungen erkennen sollen: Jede Variante ist die
// Musterlösung mit genau einer Änderung.
describe('B-005 Prüfungen erkennen typische Fehler', () => {
  const solution = meta.codeTasks?.[0]?.solution ?? '';
  const mutate = (from: string, to: string) => {
    expect(solution, `Musterlösung enthält ${from}`).toContain(from);
    return solution.replace(from, to);
  };
  const failedNames = async (code: string) => {
    const r = await runChecks(checks01, code);
    expect(r.status).toBe('ok');
    return r.status === 'ok' ? r.results.filter((c) => !c.passed).map((c) => c.name) : [];
  };
  const fails = async (code: string, name: RegExp) => {
    const failed = await failedNames(code);
    expect(failed.some((n) => name.test(n)), failed.join(' | ')).toBe(true);
  };

  it('add verändert den alten Zustand mit push', async () => {
    await fails(
      mutate('if (!existing) return { ...state, items: [...state.items, { ...action.item }] };', 'if (!existing) { state.items.push({ ...action.item }); return { ...state }; }'),
      /alte Zustand/,
    );
  });

  it('add legt bei gleicher item_id eine zweite Zeile an', async () => {
    await fails(mutate('if (!existing)', 'if (true)'), /gleicher `item_id`/);
  });

  it('add ersetzt die Menge, statt sie zu addieren', async () => {
    await fails(mutate('quantity: item.quantity + action.item.quantity', 'quantity: action.item.quantity'), /gleicher `item_id`/);
  });

  it('setQuantity ändert das Item direkt', async () => {
    await fails(
      mutate('item.item_id === action.item_id ? { ...item, quantity: action.quantity } : item', 'item.item_id === action.item_id ? Object.assign(item, { quantity: action.quantity }) : item'),
      /alte Zustand/,
    );
  });

  it('setQuantity 0 lässt das Item mit Menge 0 stehen', async () => {
    await fails(mutate('if (action.quantity <= 0)', 'if (false)'), /`setQuantity` mit `0`/);
  });

  it('remove entfernt nichts', async () => {
    await fails(mutate('item.item_id !== action.item_id)', 'true)'), /`remove`/);
  });

  it('toEvent ohne Rundung', async () => {
    await fails(mutate('Math.round(sum * 100) / 100', 'sum'), /Cent/);
  });

  it('toEvent zählt die Menge nicht', async () => {
    await fails(mutate('total + item.price * item.quantity', 'total + item.price'), /Summe/);
  });

  it('toEvent mit falschem Eventnamen', async () => {
    await fails(mutate("event: 'add_to_cart'", "event: 'add-to-cart'"), /Event hat/);
  });

  it('unbekannte Aktion wirft statt den Zustand zurückzugeben', async () => {
    await fails(mutate('default:\n      return state;', "default:\n      throw new Error('?');"), /unbekannte/);
  });

  it('eventReducer fehlt als Funktion', async () => {
    await fails(solution.replace('return { eventReducer, toEvent };', 'return { eventReducer: 1, toEvent };'), /`add`/);
  });
});
