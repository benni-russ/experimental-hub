// Nachgebaute Produkt-API für die Code-Aufgaben. Läuft im Prüf-Worker:
// nur Web-Globals, nichts aus React.
import { createFakeFetch, type FakeRoute } from '../../../http/fakeFetch';
import { BROKEN_JSON, PRODUCTS_JSON } from '../products';

const BASE = 'https://api.beispiel.test';
const JSON_TYPE = { 'content-type': 'application/json; charset=utf-8' };
const NOT_FOUND_HTML = '<!doctype html><title>404</title><h1>Nicht gefunden</h1>';

const ROUTES: FakeRoute[] = [
  { method: 'GET', path: '/products', respond: () => ({ status: 200, headers: JSON_TYPE, body: PRODUCTS_JSON }) },
  {
    method: 'GET',
    path: '/missing',
    respond: () => ({ status: 404, headers: { 'content-type': 'text/html' }, body: NOT_FOUND_HTML }),
  },
  { method: 'GET', path: '/broken', respond: () => ({ status: 200, headers: JSON_TYPE, body: BROKEN_JSON }) },
];

/**
 * Frisches fetch je Aufruf: `/products` 200, `/missing` 404 mit HTML,
 * `/broken` 200 mit kaputtem JSON, `/offline` Netzwerkausfall.
 */
export function createProductApi(): ReturnType<typeof createFakeFetch> {
  // fakeFetch prüft failNetwork synchron vor dem ersten await; der Pfad der
  // gerade gestarteten Anfrage ist also der, um den es geht.
  let currentPath = '';
  const fake = createFakeFetch(ROUTES, { failNetwork: () => currentPath === '/offline' });
  const fetch = (input: string, init?: RequestInit) => {
    try {
      currentPath = new URL(String(input), BASE).pathname;
    } catch {
      currentPath = '';
    }
    return fake.fetch(input, init);
  };
  return { fetch, log: fake.log };
}
