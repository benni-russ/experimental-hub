// Der nachgebaute Server und die fünf Schnellwahl-Szenarien der Demo.
// Läuft ohne Netzwerk über createFakeFetch.
import { createFakeFetch, type FakeRoute } from '../../http/fakeFetch';
import { formatRawRequest, formatRawResponse } from '../../http/rawHttp';

export type ScenarioId = 'load' | 'create-invalid' | 'no-token' | 'unknown' | 'overloaded';

export interface RequestDraft {
  method: 'GET' | 'POST' | 'PUT' | 'DELETE';
  path: string;
  headers: [string, string][];
  body: string;
}

const TOKEN: [string, string] = ['authorization', 'Bearer demo'];
const ACCEPT: [string, string] = ['accept', 'application/json'];
const JSON_HEADER: [string, string] = ['content-type', 'application/json'];

export const SCENARIOS: Record<ScenarioId, { label: string; draft: RequestDraft }> = {
  load: {
    label: 'Produkt laden',
    draft: { method: 'GET', path: '/products/1', headers: [ACCEPT, TOKEN], body: '' },
  },
  'create-invalid': {
    label: 'Anlegen ohne Name',
    draft: { method: 'POST', path: '/products', headers: [JSON_HEADER, TOKEN], body: '{\n  "price": 3.5\n}' },
  },
  'no-token': {
    label: 'Ohne Token',
    draft: { method: 'GET', path: '/products/1', headers: [ACCEPT], body: '' },
  },
  unknown: {
    label: 'Unbekanntes Produkt',
    draft: { method: 'GET', path: '/products/99', headers: [ACCEPT, TOKEN], body: '' },
  },
  overloaded: {
    label: 'Server überlastet',
    draft: { method: 'GET', path: '/stock', headers: [ACCEPT], body: '' },
  },
};

const PRODUCTS = [
  { id: 1, name: 'Notizbuch', price: 4.5 },
  { id: 2, name: 'Bleistift', price: 0.8 },
];

const JSON_TYPE = { 'content-type': 'application/json' };
const json = (status: number, data: unknown, headers: Record<string, string> = {}) => ({
  status,
  headers: { ...JSON_TYPE, ...headers },
  body: JSON.stringify(data, null, 2),
});
const problem = (status: number, error: string, headers?: Record<string, string>) => json(status, { error }, headers);

/** Gültig ist ein JSON-Objekt mit nicht leerem `name`. */
function parseProduct(body: string | null): Record<string, unknown> | null {
  try {
    const data: unknown = JSON.parse(body ?? '');
    if (typeof data !== 'object' || data === null || Array.isArray(data)) return null;
    const name = (data as Record<string, unknown>).name;
    return typeof name === 'string' && name.trim() !== '' ? (data as Record<string, unknown>) : null;
  } catch {
    return null;
  }
}

type Respond = FakeRoute['respond'];

/** Alles unter /products prüft zuerst den Token, dann erst Pfad und Inhalt. */
function productsRespond(method: string): Respond {
  return ({ params, headers, body }) => {
    if (headers.get('authorization') !== 'Bearer demo') {
      return problem(401, 'Nicht angemeldet. Sende den Header Authorization: Bearer demo.', {
        'www-authenticate': 'Bearer',
      });
    }
    const hasId = params.id !== undefined;
    if (params.rest !== undefined) return problem(404, 'Diesen Pfad gibt es nicht.');
    if (!hasId) {
      if (method === 'GET') return json(200, PRODUCTS);
      if (method === 'POST') {
        const data = parseProduct(body);
        if (!data) return problem(400, 'Das Feld "name" fehlt oder der Body ist kein gültiges JSON.');
        return json(201, { id: PRODUCTS.length + 1, ...data }, { location: `/products/${PRODUCTS.length + 1}` });
      }
      return problem(404, 'Diesen Pfad gibt es nicht.');
    }
    const product = PRODUCTS.find((p) => String(p.id) === params.id);
    if (!product) return problem(404, `Produkt ${params.id} gibt es nicht.`);
    if (method === 'GET') return json(200, product);
    if (method === 'DELETE') return { status: 204 };
    if (method === 'PUT') {
      const data = parseProduct(body);
      if (!data) return problem(400, 'Das Feld "name" fehlt oder der Body ist kein gültiges JSON.');
      return json(200, { ...data, id: product.id });
    }
    return problem(404, 'Diesen Pfad gibt es nicht.');
  };
}

/**
 * Frischer Server je Aufruf. `GET /stock` antwortet abwechselnd 503 und 500,
 * angefangen mit 503; der Zähler gehört zu dieser Instanz.
 */
export function demoServer(): ReturnType<typeof createFakeFetch> {
  const routes: FakeRoute[] = [];
  for (const method of ['GET', 'POST', 'PUT', 'DELETE']) {
    for (const path of ['/products', '/products/:id', '/products/:id/:rest']) {
      routes.push({ method, path, respond: productsRespond(method) });
    }
  }
  let stockCalls = 0;
  routes.push({
    method: 'GET',
    path: '/stock',
    respond: () => {
      stockCalls++;
      return stockCalls % 2 === 1
        ? problem(503, 'Der Server ist gerade überlastet.', { 'retry-after': '2' })
        : problem(500, 'Interner Fehler im Lager.');
    },
  });
  return createFakeFetch(routes);
}

export interface SendResult {
  /** null, wenn die Anfrage gar nicht erst losging */
  status: number | null;
  rawRequest: string;
  rawResponse: string;
  error: string;
}

/** Schickt den Entwurf an den Server; nur POST und PUT senden den Body. */
export async function sendDraft(server: ReturnType<typeof createFakeFetch>, draft: RequestDraft): Promise<SendResult> {
  const hasBody = draft.method === 'POST' || draft.method === 'PUT';
  const headers = draft.headers.filter(([name]) => name.trim() !== '').map(([n, v]): [string, string] => [n.trim(), v]);
  try {
    const res = await server.fetch(draft.path, {
      method: draft.method,
      headers,
      body: hasBody ? draft.body : undefined,
    });
    const text = await res.text();
    return {
      status: res.status,
      rawRequest: formatRawRequest(server.log[server.log.length - 1]!),
      rawResponse: formatRawResponse(res, text),
      error: '',
    };
  } catch (err) {
    const detail = err instanceof Error ? err.message : String(err);
    return { status: null, rawRequest: '', rawResponse: '', error: `Die Anfrage ging nicht los: ${detail}` };
  }
}
