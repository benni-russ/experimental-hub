import { describe, expect, it } from 'vitest';
import { createFakeFetch, type FakeRoute } from './fakeFetch';
import { formatRawRequest, formatRawResponse } from './rawHttp';
import { STATUS_CODES } from './statusCodes';

const routes: FakeRoute[] = [
  {
    method: 'GET',
    path: '/products/:id',
    respond: (req) => ({
      status: 200,
      headers: { 'content-type': 'application/json' },
      body: JSON.stringify({ id: req.params.id, q: req.query.get('q') }),
    }),
  },
  { method: 'DELETE', path: '/products/:id', respond: () => ({ status: 204 }) },
  { method: 'POST', path: '/echo', respond: (req) => ({ status: 201, body: req.body ?? '' }) },
];

describe('createFakeFetch', () => {
  it('liefert Routenparameter und Query', async () => {
    const { fetch } = createFakeFetch(routes);
    const res = await fetch('/products/7?q=abc');
    expect(res.status).toBe(200);
    expect(await res.json()).toEqual({ id: '7', q: 'abc' });
  });

  it('löst absolute URLs der Basis auf', async () => {
    const { fetch } = createFakeFetch(routes);
    const res = await fetch('https://api.beispiel.test/products/3');
    expect(await res.json()).toEqual({ id: '3', q: null });
  });

  it('protokolliert Methode, URL, Header (klein) und Body', async () => {
    const { fetch, log } = createFakeFetch(routes);
    await fetch('/echo', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', Accept: 'text/plain' },
      body: '{"a":1}',
    });
    expect(log).toEqual([
      {
        method: 'POST',
        url: 'https://api.beispiel.test/echo',
        headers: { 'content-type': 'application/json', accept: 'text/plain' },
        body: '{"a":1}',
      },
    ]);
  });

  it('antwortet unbekannt mit 404 und HTML', async () => {
    const { fetch } = createFakeFetch(routes);
    const res = await fetch('/gibt-es-nicht');
    expect(res.status).toBe(404);
    expect(res.headers.get('content-type')).toBe('text/html');
    expect(await res.text()).toBe('<!doctype html><title>404</title><h1>Nicht gefunden</h1>');
  });

  it('behandelt fremde Hosts wie unbekannte Routen', async () => {
    const { fetch } = createFakeFetch(routes);
    expect((await fetch('https://anders.test/products/1')).status).toBe(404);
  });

  it('liefert bei 204 keinen Body', async () => {
    const { fetch } = createFakeFetch(routes);
    const res = await fetch('/products/1', { method: 'DELETE' });
    expect(res.status).toBe(204);
    expect(await res.text()).toBe('');
  });

  it('wirft bei Netzwerkausfall TypeError und protokolliert trotzdem', async () => {
    const { fetch, log } = createFakeFetch(routes, { failNetwork: true });
    await expect(fetch('/products/1')).rejects.toThrow(TypeError);
    await expect(fetch('/products/1')).rejects.toThrow('Failed to fetch');
    expect(log).toHaveLength(2);
  });

  it('wertet failNetwork als Funktion je Aufruf aus', async () => {
    let fail = true;
    const { fetch } = createFakeFetch(routes, { failNetwork: () => fail });
    await expect(fetch('/products/1')).rejects.toThrow(TypeError);
    fail = false;
    expect((await fetch('/products/1')).status).toBe(200);
  });
});

describe('formatRawRequest', () => {
  it('druckt Startzeile, host, Header und Leerzeile', () => {
    const raw = formatRawRequest({
      method: 'GET',
      url: 'https://api.beispiel.test/products/7',
      headers: { accept: 'application/json' },
      body: null,
    });
    expect(raw).toBe('GET /products/7 HTTP/1.1\nhost: api.beispiel.test\naccept: application/json\n\n');
  });

  it('hängt Query und Body an', () => {
    const raw = formatRawRequest({
      method: 'POST',
      url: 'https://api.beispiel.test/echo?x=1',
      headers: {},
      body: 'hallo',
    });
    expect(raw).toBe('POST /echo?x=1 HTTP/1.1\nhost: api.beispiel.test\n\nhallo');
  });
});

describe('formatRawResponse', () => {
  it('beginnt mit der Statuszeile', () => {
    const raw = formatRawResponse(
      { status: 404, statusText: '', headers: new Headers({ 'content-type': 'text/html' }) },
      '<h1>x</h1>',
    );
    expect(raw.startsWith('HTTP/1.1 404 Not Found')).toBe(true);
    expect(raw).toBe('HTTP/1.1 404 Not Found\ncontent-type: text/html\n\n<h1>x</h1>');
  });

  it('nutzt statusText der Antwort, wenn gesetzt', () => {
    const raw = formatRawResponse({ status: 200, statusText: 'Gut', headers: new Headers() }, '');
    expect(raw.startsWith('HTTP/1.1 200 Gut')).toBe(true);
  });
});

describe('STATUS_CODES', () => {
  it('hat zehn Einträge', () => {
    expect(STATUS_CODES.map((s) => s.status)).toEqual([200, 201, 204, 400, 401, 403, 404, 429, 500, 503]);
  });

  it('retry nur bei 429, 500, 503', () => {
    expect(STATUS_CODES.filter((s) => s.retry).map((s) => s.status)).toEqual([429, 500, 503]);
  });

  it('ordnet Klasse und Verantwortung zu', () => {
    for (const s of STATUS_CODES) {
      expect(s.klass).toBe(`${Math.floor(s.status / 100)}xx`);
      expect(s.whoseFault).toBe(s.klass === '2xx' ? 'niemand' : s.klass === '4xx' ? 'Client' : 'Server');
      expect(s.text.length).toBeGreaterThan(0);
    }
  });
});
