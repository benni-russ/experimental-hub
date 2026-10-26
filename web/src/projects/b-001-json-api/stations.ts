// Der Weg von fetch() zum fertigen Objekt, Station für Station. Alles läuft
// echt: echte Response-Objekte aus createFakeFetch, echtes text(), echtes
// JSON.parse. Fehlermeldungen kommen unverändert von der JavaScript-Laufzeit.
import { createFakeFetch, type FakeRoute } from '../../http/fakeFetch';
import { BROKEN_JSON, PRODUCTS_JSON } from './products';

export type CaseId = 'ok' | 'broken-json' | 'not-found' | 'empty' | 'wrong-type';
export type StationId = 'request' | 'response' | 'text' | 'parse' | 'object';

export interface StationState {
  id: StationId;
  status: 'done' | 'failed' | 'skipped';
  /** request: Startzeile; response: Status, ok, Content-Type je Zeile; text: der Rohtext; parse/object: Kurzbefund */
  detail: string;
  /** echte Fehlermeldung der Laufzeit, nur bei failed */
  error?: string;
}

export const STATION_IDS: StationId[] = ['request', 'response', 'text', 'parse', 'object'];

export const DEMO_URL = 'https://api.beispiel.test/products';

const JSON_TYPE = { 'content-type': 'application/json; charset=utf-8' };

// Je Fall die Antwort des Servers auf GET /products. „404“ hat keine Route:
// createFakeFetch antwortet dann wie ein echter Server mit einer HTML-Seite.
const ROUTES: Record<CaseId, FakeRoute[]> = {
  ok: [{ method: 'GET', path: '/products', respond: () => ({ status: 200, headers: JSON_TYPE, body: PRODUCTS_JSON }) }],
  'broken-json': [
    { method: 'GET', path: '/products', respond: () => ({ status: 200, headers: JSON_TYPE, body: BROKEN_JSON }) },
  ],
  'not-found': [],
  empty: [{ method: 'GET', path: '/products', respond: () => ({ status: 204 }) }],
  'wrong-type': [
    {
      method: 'GET',
      path: '/products',
      respond: () => ({ status: 200, headers: { 'content-type': 'text/plain; charset=utf-8' }, body: PRODUCTS_JSON }),
    },
  ],
};

export function demoFetch(caseId: CaseId): ReturnType<typeof createFakeFetch> {
  return createFakeFetch(ROUTES[caseId]);
}

const errorMessage = (err: unknown) => (err instanceof Error ? err.message : String(err));

/** Kurzbeschreibung eines geparsten Werts, z. B. „Array mit 6 Einträgen“. */
export function describeValue(value: unknown): string {
  if (Array.isArray(value)) return `Array mit ${value.length} ${value.length === 1 ? 'Eintrag' : 'Einträgen'}`;
  if (value === null) return 'null';
  if (typeof value === 'object') {
    const n = Object.keys(value).length;
    return `Objekt mit ${n} ${n === 1 ? 'Schlüssel' : 'Schlüsseln'}`;
  }
  return typeof value;
}

export async function walkStations(caseId: CaseId): Promise<{ stations: StationState[]; value?: unknown }> {
  const stations: StationState[] = [];
  // Reißt die Kette, sind alle noch fehlenden Stationen übersprungen.
  const rest = () =>
    STATION_IDS.slice(stations.length).map((id): StationState => ({ id, status: 'skipped', detail: '' }));

  const { fetch } = demoFetch(caseId);
  const requestLine = `GET ${DEMO_URL}`;
  let res: Response;
  try {
    res = await fetch(DEMO_URL);
  } catch (err) {
    stations.push({ id: 'request', status: 'failed', detail: requestLine, error: errorMessage(err) });
    return { stations: [...stations, ...rest()] };
  }
  stations.push({ id: 'request', status: 'done', detail: requestLine });

  const contentType = res.headers.get('content-type');
  stations.push({
    id: 'response',
    status: 'done',
    detail: [
      `${res.status} ${res.statusText}`.trimEnd(),
      `ok: ${res.ok}`,
      `Content-Type: ${contentType ?? '(keiner)'}`,
    ].join('\n'),
  });

  let text: string;
  try {
    text = await res.text();
  } catch (err) {
    stations.push({ id: 'text', status: 'failed', detail: '', error: errorMessage(err) });
    return { stations: [...stations, ...rest()] };
  }
  stations.push({ id: 'text', status: 'done', detail: text });

  let value: unknown;
  try {
    value = JSON.parse(text);
  } catch (err) {
    const name = err instanceof Error ? err.name : 'Error';
    stations.push({ id: 'parse', status: 'failed', detail: `JSON.parse wirft ${name}`, error: errorMessage(err) });
    return { stations: [...stations, ...rest()] };
  }
  stations.push({ id: 'parse', status: 'done', detail: 'JSON.parse klappt' });
  stations.push({ id: 'object', status: 'done', detail: describeValue(value) });
  return { stations, value };
}
