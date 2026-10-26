import { describe, expect, it } from 'vitest';
import { demoServer, SCENARIOS, sendDraft, type RequestDraft, type ScenarioId } from './scenarios';

const EXPECTED: Record<Exclude<ScenarioId, 'overloaded'>, number> = {
  load: 200,
  'create-invalid': 400,
  'no-token': 401,
  unknown: 404,
};

const TOKEN: [string, string] = ['authorization', 'Bearer demo'];
const draft = (over: Partial<RequestDraft>): RequestDraft => ({
  method: 'GET',
  path: '/products/1',
  headers: [TOKEN],
  body: '',
  ...over,
});

describe('B-002 Szenarien gegen den nachgebauten Server', () => {
  for (const [id, status] of Object.entries(EXPECTED) as [keyof typeof EXPECTED, number][]) {
    it(`${id} liefert ${status}`, async () => {
      const res = await sendDraft(demoServer(), SCENARIOS[id].draft);
      expect(res.status).toBe(status);
    });
  }

  it('overloaded: erst 503, dann 500, dann wieder 503', async () => {
    const server = demoServer();
    const d = SCENARIOS.overloaded.draft;
    expect((await sendDraft(server, d)).status).toBe(503);
    expect((await sendDraft(server, d)).status).toBe(500);
    expect((await sendDraft(server, d)).status).toBe(503);
  });

  it('jede Instanz fängt wieder bei 503 an', async () => {
    const d = SCENARIOS.overloaded.draft;
    const a = demoServer();
    await sendDraft(a, d);
    expect((await sendDraft(demoServer(), d)).status).toBe(503);
  });

  it('fünf Szenarien mit Beschriftung', () => {
    expect(Object.keys(SCENARIOS).sort()).toEqual(['create-invalid', 'load', 'no-token', 'overloaded', 'unknown']);
    for (const s of Object.values(SCENARIOS)) expect(s.label).not.toBe('');
  });
});

describe('B-002 Regeln des Servers', () => {
  it('alles unter /products braucht den Token, jede Methode und jede Tiefe', async () => {
    for (const method of ['GET', 'POST', 'PUT', 'DELETE'] as const) {
      for (const path of ['/products', '/products/1', '/products/1/reviews']) {
        const res = await sendDraft(demoServer(), draft({ method, path, headers: [], body: '{"name":"x"}' }));
        expect(res.status, `${method} ${path}`).toBe(401);
      }
    }
  });

  it('ein falscher Token gilt nicht', async () => {
    const res = await sendDraft(demoServer(), draft({ headers: [['Authorization', 'Bearer falsch']] }));
    expect(res.status).toBe(401);
  });

  it('der Header-Name ist egal in welcher Schreibweise', async () => {
    const res = await sendDraft(demoServer(), draft({ headers: [['AUTHORIZATION', 'Bearer demo']] }));
    expect(res.status).toBe(200);
  });

  it('/stock braucht keinen Token', async () => {
    const res = await sendDraft(demoServer(), draft({ path: '/stock', headers: [] }));
    expect(res.status).toBe(503);
  });

  it('POST mit Namen legt an (201), ohne Namen oder mit kaputtem JSON nicht (400)', async () => {
    const post = (body: string) => sendDraft(demoServer(), draft({ method: 'POST', path: '/products', body }));
    expect((await post('{"name":"Lineal","price":2}')).status).toBe(201);
    expect((await post('{"price":2}')).status).toBe(400);
    expect((await post('{"name":""}')).status).toBe(400);
    expect((await post('{kaputt')).status).toBe(400);
    expect((await post('')).status).toBe(400);
  });

  it('GET /products/:id: bekanntes 200, unbekanntes 404, Liste 200', async () => {
    const get = (path: string) => sendDraft(demoServer(), draft({ path }));
    expect((await get('/products/2')).status).toBe(200);
    expect((await get('/products/99')).status).toBe(404);
    expect((await get('/products')).status).toBe(200);
  });

  it('unbekannte Pfade außerhalb von /products antworten 404', async () => {
    expect((await sendDraft(demoServer(), draft({ path: '/nirgends', headers: [] }))).status).toBe(404);
  });
});

describe('B-002 sendDraft', () => {
  it('liefert Rohtext von Anfrage und Antwort', async () => {
    const res = await sendDraft(demoServer(), SCENARIOS.load.draft);
    expect(res.rawRequest.startsWith('GET /products/1 HTTP/1.1\nhost: api.beispiel.test')).toBe(true);
    expect(res.rawRequest).toContain('authorization: Bearer demo');
    expect(res.rawResponse.startsWith('HTTP/1.1 200 OK')).toBe(true);
    expect(res.rawResponse).toContain('content-type: application/json');
  });

  it('Body nur bei POST und PUT, leere Header-Zeilen fallen weg', async () => {
    const server = demoServer();
    const get = await sendDraft(server, draft({ body: 'nicht senden', headers: [TOKEN, ['', 'x'], ['  ', 'y']] }));
    expect(get.rawRequest).not.toContain('nicht senden');
    expect(get.rawRequest).not.toContain(': x');
    const post = await sendDraft(server, draft({ method: 'POST', path: '/products', body: '{"name":"A"}' }));
    expect(post.rawRequest.endsWith('\n\n{"name":"A"}')).toBe(true);
  });

  it('ein kaputter Pfad meldet einen Fehler statt zu werfen', async () => {
    const res = await sendDraft(demoServer(), draft({ path: 'http://[kaputt' }));
    expect(res.status).toBeNull();
    expect(res.error).not.toBe('');
  });
});
