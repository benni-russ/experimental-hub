import { describe, expect, it } from 'vitest';
import { runChecks } from '../../../codeTask/runChecks';
import type { CheckModule, RunResult } from '../../../codeTask/types';
import { meta } from '../content';
import checks01 from './01.checks';
import checks02 from './02.checks';
import { createSequenceFetch } from './retryApi';

const MODULES: Record<string, CheckModule> = {
  'B-002-code-01': checks01,
  'B-002-code-02': checks02,
};

const failures = (r: RunResult) => (r.status === 'ok' ? r.results.filter((c) => !c.passed) : [r]);

describe('B-002 Code-Aufgaben', () => {
  it('es sind genau diese zwei', () => {
    expect(meta.codeTasks?.map((t) => t.id)).toEqual(['B-002-code-01', 'B-002-code-02']);
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

describe('B-002 Folge-Fetch für Aufgabe 2', () => {
  it('zählt Aufrufe im Log und hält den letzten Schritt', async () => {
    const api = createSequenceFetch([503, 200]);
    expect((await api.fetch('/item')).status).toBe(503);
    expect((await api.fetch('/item')).status).toBe(200);
    expect((await api.fetch('/item')).status).toBe(200);
    expect(api.log).toHaveLength(3);
  });

  it('Netzwerkausfall zählt als Aufruf und wirft', async () => {
    const api = createSequenceFetch(['netz', 200]);
    await expect(api.fetch('/item')).rejects.toThrow(TypeError);
    expect((await api.fetch('/item')).status).toBe(200);
    expect(api.log).toHaveLength(2);
  });

  it('zwei Instanzen teilen nichts', async () => {
    const a = createSequenceFetch([500, 200]);
    await a.fetch('/item');
    const b = createSequenceFetch([500, 200]);
    expect((await b.fetch('/item')).status).toBe(500);
  });
});

// Typische Fehler, die die Prüfungen erkennen sollen.
describe('B-002 Prüfungen erkennen typische Fehler', () => {
  const fails = async (module: CheckModule, code: string, name: RegExp) => {
    const r = await runChecks(module, code);
    expect(r.status).toBe('ok');
    const failed = r.status === 'ok' ? r.results.filter((c) => !c.passed).map((c) => c.name) : [];
    expect(failed.some((n) => name.test(n)), failed.join(' | ')).toBe(true);
  };

  it('Aufgabe 1: retry nur bei 5xx vergisst 429', async () => {
    await fails(
      checks01,
      [
        'function describeStatus(status) {',
        '  const h = Math.floor(status / 100);',
        "  const who = { 2: 'niemand', 4: 'Client', 5: 'Server' }[h];",
        '  if (!who) throw new Error("x");',
        '  return { klass: h + "xx", whoseFault: who, retry: h === 5 };',
        '}',
        'return { describeStatus };',
      ].join('\n'),
      /Clients/,
    );
  });

  it('Aufgabe 1: ohne Prüfung der Bereiche werfen 199 und 600 nicht', async () => {
    await fails(
      checks01,
      [
        'function describeStatus(status) {',
        '  const h = Math.floor(status / 100);',
        "  const who = h === 4 ? 'Client' : h === 5 ? 'Server' : 'niemand';",
        '  return { klass: h + "xx", whoseFault: who, retry: h === 5 || status === 429 };',
        '}',
        'return { describeStatus };',
      ].join('\n'),
      /werfen/,
    );
  });

  it('Aufgabe 1: eine feste Tabelle nur für die zehn Codes kennt 418 nicht', async () => {
    await fails(
      checks01,
      [
        'const TABLE = { 200: "2xx", 201: "2xx", 204: "2xx", 400: "4xx", 401: "4xx", 403: "4xx", 404: "4xx", 429: "4xx", 500: "5xx", 503: "5xx" };',
        'function describeStatus(status) {',
        '  const klass = TABLE[status];',
        '  if (!klass) throw new Error("x");',
        '  return { klass, whoseFault: klass === "2xx" ? "niemand" : klass === "4xx" ? "Client" : "Server", retry: klass === "5xx" || status === 429 };',
        '}',
        'return { describeStatus };',
      ].join('\n'),
      /außerhalb der Tabelle/,
    );
  });

  it('Aufgabe 2: wiederholt auch bei 404', async () => {
    await fails(
      checks02,
      [
        'async function fetchWithRetry(url, tries) {',
        '  let res;',
        '  for (let i = 0; i < tries; i++) {',
        '    res = await fetch(url);',
        '    if (res.ok) return res;',
        '  }',
        '  return res;',
        '}',
        'return { fetchWithRetry };',
      ].join('\n'),
      /404/,
    );
  });

  it('Aufgabe 2: ein Versuch zu viel', async () => {
    await fails(
      checks02,
      [
        'async function fetchWithRetry(url, tries) {',
        '  let res;',
        '  for (let i = 0; i <= tries; i++) {',
        '    res = await fetch(url);',
        '    if (res.status < 500) return res;',
        '  }',
        '  return res;',
        '}',
        'return { fetchWithRetry };',
      ].join('\n'),
      /immer `500`/i,
    );
  });

  it('Aufgabe 2: ohne try/catch scheitert der Netzwerkausfall', async () => {
    await fails(
      checks02,
      [
        'async function fetchWithRetry(url, tries) {',
        '  let res;',
        '  for (let i = 0; i < tries; i++) {',
        '    res = await fetch(url);',
        '    if (res.status < 500) return res;',
        '  }',
        '  return res;',
        '}',
        'return { fetchWithRetry };',
      ].join('\n'),
      /Netzwerkausfall, dann/,
    );
  });

  it('Aufgabe 2: gibt nach dem letzten Versuch nichts zurück', async () => {
    await fails(
      checks02,
      [
        'async function fetchWithRetry(url, tries) {',
        '  for (let i = 0; i < tries; i++) {',
        '    try {',
        '      const res = await fetch(url);',
        '      if (res.status < 500) return res;',
        '    } catch (e) {}',
        '  }',
        '}',
        'return { fetchWithRetry };',
      ].join('\n'),
      /immer `500`/i,
    );
  });

  it('Aufgabe 2: verschluckt den Netzwerkfehler am Ende', async () => {
    await fails(
      checks02,
      [
        'async function fetchWithRetry(url, tries) {',
        '  let res;',
        '  for (let i = 0; i < tries; i++) {',
        '    try {',
        '      res = await fetch(url);',
        '      if (res.status < 500) return res;',
        '    } catch (e) {}',
        '  }',
        '  return res;',
        '}',
        'return { fetchWithRetry };',
      ].join('\n'),
      /Immer Netzwerkausfall/,
    );
  });
});
