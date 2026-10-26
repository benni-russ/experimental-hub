// Gefälschtes fetch ohne Netzwerk: liefert echte Response-Objekte.
// Läuft im Browser, im Worker und in Node, nutzt nur Web-Globals.
import { STATUS_TEXT } from './rawHttp';

export interface FakeRoute {
  method: string;
  path: string; // z. B. '/products/:id'
  respond(req: {
    params: Record<string, string>;
    query: URLSearchParams;
    headers: Headers;
    body: string | null;
  }): { status: number; headers?: Record<string, string>; body?: string };
}

export interface LoggedRequest {
  method: string;
  url: string;
  headers: Record<string, string>;
  body: string | null;
}

const BASE = 'https://api.beispiel.test';
const NOT_FOUND_HTML = '<!doctype html><title>404</title><h1>Nicht gefunden</h1>';

// Header-Namen klein, Reihenfolge wie übergeben (Headers würde sortieren).
function collectHeaders(init: HeadersInit | undefined): Record<string, string> {
  const out: Record<string, string> = {};
  if (!init) return out;
  const set = (name: string, value: string) => {
    out[name.toLowerCase()] = value;
  };
  if (init instanceof Headers) init.forEach((value, name) => set(name, value));
  else if (Array.isArray(init)) for (const [name, value] of init) set(name, value);
  else for (const [name, value] of Object.entries(init)) set(name, value);
  return out;
}

function matchPath(pattern: string, path: string): Record<string, string> | null {
  const p = pattern.split('/');
  const a = path.split('/');
  if (p.length !== a.length) return null;
  const params: Record<string, string> = {};
  for (let i = 0; i < p.length; i++) {
    const seg = p[i] ?? '';
    const actual = a[i] ?? '';
    if (seg.startsWith(':')) {
      try {
        params[seg.slice(1)] = decodeURIComponent(actual);
      } catch {
        return null;
      }
    } else if (seg !== actual) return null;
  }
  return params;
}

export function createFakeFetch(
  routes: FakeRoute[],
  options: { failNetwork?: boolean | (() => boolean) } = {},
): { fetch: (input: string, init?: RequestInit) => Promise<Response>; log: LoggedRequest[] } {
  const log: LoggedRequest[] = [];

  const fakeFetch = async (input: string, init?: RequestInit): Promise<Response> => {
    const url = new URL(input, BASE);
    const method = (init?.method ?? 'GET').toUpperCase();
    const headers = collectHeaders(init?.headers);
    const body = typeof init?.body === 'string' ? init.body : null;
    log.push({ method, url: url.href, headers, body });

    const fail = options.failNetwork;
    if (typeof fail === 'function' ? fail() : fail) throw new TypeError('Failed to fetch');

    if (url.origin === BASE) {
      for (const route of routes) {
        if (route.method.toUpperCase() !== method) continue;
        const params = matchPath(route.path, url.pathname);
        if (!params) continue;
        const out = route.respond({ params, query: url.searchParams, headers: new Headers(headers), body });
        if (out.status === 204) return new Response(null, { status: 204, statusText: STATUS_TEXT[204], headers: out.headers });
        return new Response(out.body ?? '', {
          status: out.status,
          statusText: STATUS_TEXT[out.status] ?? '',
          headers: out.headers,
        });
      }
    }
    return new Response(NOT_FOUND_HTML, {
      status: 404,
      statusText: STATUS_TEXT[404],
      headers: { 'content-type': 'text/html' },
    });
  };

  return { fetch: fakeFetch, log };
}
