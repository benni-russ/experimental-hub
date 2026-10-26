import { describe, expect, it } from 'vitest';
import { expectEqual } from './assert';
import { NETWORK_BLOCKED } from './network';
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
      globals: () => ({ fetch: Object.assign(() => 'fake', { used: false }) }),
      checks: [{ name: 'fetch da', run: () => undefined }],
    };
    // Nutzercode markiert den Fake und überschreibt ihn; ein zweiter Lauf darf davon nichts sehen.
    const code =
      'if (typeof fetch !== "function") throw new Error("weg"); if (fetch.used) throw new Error("benutzt"); fetch.used = true; fetch = null;';
    expect((await runChecks(mod, code)).status).toBe('ok');
    expect((await runChecks(mod, code)).status).toBe('ok');
  });

  it('rerun erzeugt die Globals frisch', async () => {
    const used: unknown[] = [];
    const mod: CheckModule = {
      exportsNeeded: [],
      globals: () => ({ fake: {} as Record<string, unknown> }),
      checks: [
        {
          name: 'rerun',
          run: async (ctx) => {
            const out = await ctx.rerun({});
            used.push(out.exports.before);
          },
        },
      ],
    };
    await runChecks(mod, 'const before = fake.used; fake.used = true; return { before };');
    expect(used).toEqual([undefined]);
  });

  it('meldet geerbte Namen als fehlend', async () => {
    const mod: CheckModule = {
      exportsNeeded: ['toString'],
      checks: [{ name: 'a', run: () => undefined }],
    };
    const r = await runChecks(mod, 'return {};');
    expect(r).toEqual({
      status: 'ok',
      results: [{ name: 'a', passed: false, message: '`toString` fehlt im `return { … }` am Ende.' }],
    });
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

  it('sperrt echte Netzwerkzugriffe mit lesbarer Meldung', async () => {
    const mod: CheckModule = { exportsNeeded: [], checks: [{ name: 'a', run: () => undefined }] };
    expect(await runChecks(mod, "fetch('https://example.org');")).toEqual({
      status: 'error',
      message: NETWORK_BLOCKED('fetch'),
      line: 1,
    });
    for (const code of ['new XMLHttpRequest();', "new WebSocket('wss://x');", "new EventSource('/x');", "importScripts('/x.js');", "indexedDB.open('x');", "caches.open('x');"]) {
      const r = await runChecks(mod, code);
      expect(r.status).toBe('error');
      if (r.status === 'error') expect(r.message).toMatch(/ist in dieser Übung gesperrt/);
    }
  });

  it('sperrt das Netz auch in Prüfungen, die rerun nutzen', async () => {
    let message = '';
    const mod: CheckModule = {
      exportsNeeded: ['load'],
      checks: [
        {
          name: 'a',
          run: async (ctx) => {
            const out = await ctx.rerun({});
            try {
              (out.exports.load as () => unknown)();
            } catch (err) {
              message = (err as Error).message;
            }
          },
        },
      ],
    };
    await runChecks(mod, "function load() { return fetch('/x'); }\nreturn { load };");
    expect(message).toBe(NETWORK_BLOCKED('fetch'));
  });

  it('ein fetch-Fake des Moduls schlägt die Sperre', async () => {
    let got: unknown;
    const mod: CheckModule = {
      exportsNeeded: ['value'],
      globals: () => ({ fetch: () => 'fake' }),
      checks: [{ name: 'a', run: ({ exports }) => void (got = exports.value) }],
    };
    await runChecks(mod, "return { value: fetch('/x') };");
    expect(got).toBe('fake');
  });
});
