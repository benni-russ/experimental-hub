import { describe, expect, it } from 'vitest';
import { expectEqual } from './assert';
import { runChecks } from './runChecks';
import type { CheckModule } from './types';

const call = (fn: unknown, n: number) => (fn as (n: number) => number)(n);

const doubleModule: CheckModule = {
  exportsNeeded: ['double'],
  checks: [{ name: 'verdoppelt 2', run: ({ exports }) => expectEqual(call(exports.double, 2), 4) }],
};

const MISSING = '`double` fehlt im `return { … }` am Ende.';

describe('runChecks', () => {
  it('besteht mit korrektem Code', async () => {
    const r = await runChecks(doubleModule, 'function double(n) { return n * 2 }\nreturn { double };');
    expect(r).toEqual({ status: 'ok', results: [{ name: 'verdoppelt 2', passed: true }] });
  });

  it('meldet erwartet/bekommen', async () => {
    const mod: CheckModule = {
      exportsNeeded: ['double'],
      checks: [{ name: 'drei', run: ({ exports }) => expectEqual(call(exports.double, 3), 6) }],
    };
    const r = await runChecks(mod, 'function double(n) { return n + 2 }\nreturn { double };');
    if (r.status !== 'ok') throw new Error('erwartet ok');
    expect(r.results[0]?.passed).toBe(false);
    expect(r.results[0]?.message).toContain('erwartet 6');
    expect(r.results[0]?.message).toContain('bekommen 5');
  });

  it('meldet fehlendes return', async () => {
    const r = await runChecks(doubleModule, 'function double(n) { return n * 2 }');
    expect(r).toEqual({
      status: 'ok',
      results: [{ name: 'verdoppelt 2', passed: false, message: MISSING }],
    });
  });

  it('meldet falsch benannten Export', async () => {
    const r = await runChecks(doubleModule, 'function double(n) { return n * 2 }\nreturn { duble: double };');
    expect(r).toEqual({
      status: 'ok',
      results: [{ name: 'verdoppelt 2', passed: false, message: MISSING }],
    });
  });

  it('meldet Syntaxfehler mit Zeile', async () => {
    const r = await runChecks(doubleModule, 'function double(n) {\n  return n * \n}');
    expect(r.status).toBe('error');
    if (r.status !== 'error') return;
    expect(r.message.startsWith('Syntaxfehler')).toBe(true);
    expect(r.line).toBe(2);
  });

  it('meldet Laufzeitfehler mit Zeile', async () => {
    const r = await runChecks(doubleModule, "throw new Error('kaputt');");
    expect(r).toEqual({ status: 'error', message: 'kaputt', line: 1 });
  });

  it('sammelt console.log', async () => {
    let logs: string[] = [];
    const mod: CheckModule = {
      exportsNeeded: [],
      checks: [{ name: 'log', run: (ctx) => void (logs = ctx.logs) }],
    };
    await runChecks(mod, "console.log('a', 1);");
    expect(logs).toEqual(['a 1']);
  });

  it('erzeugt Globals je Aufruf frisch', async () => {
    const mod: CheckModule = {
      exportsNeeded: [],
      globals: () => ({ fetch: () => 'fake' }),
      checks: [{ name: 'fetch da', run: () => undefined }],
    };
    const code = 'if (typeof fetch !== "function") throw new Error("weg"); fetch = null;';
    expect((await runChecks(mod, code)).status).toBe('ok');
    expect((await runChecks(mod, code)).status).toBe('ok');
  });

  it('rerun macht Globals sichtbar', async () => {
    let factor: unknown;
    const mod: CheckModule = {
      exportsNeeded: [],
      checks: [
        {
          name: 'rerun',
          run: async (ctx) => {
            const out = await ctx.rerun({ factor: 3 });
            factor = out.exports.factor;
          },
        },
      ],
    };
    await runChecks(mod, 'return { factor: typeof factor === "undefined" ? 0 : factor };');
    expect(factor).toBe(3);
  });
});
