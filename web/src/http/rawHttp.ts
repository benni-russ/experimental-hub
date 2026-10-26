// Rohtext von HTTP-Anfragen und -Antworten, wie er über die Leitung ginge.
import type { LoggedRequest } from './fakeFetch';

// Englische Standardtexte; Node setzt statusText im Konstruktor nicht.
const STATUS_TEXT: Record<number, string> = {
  200: 'OK',
  201: 'Created',
  204: 'No Content',
  400: 'Bad Request',
  401: 'Unauthorized',
  403: 'Forbidden',
  404: 'Not Found',
  429: 'Too Many Requests',
  500: 'Internal Server Error',
  503: 'Service Unavailable',
};

export function formatRawRequest(req: LoggedRequest): string {
  const url = new URL(req.url);
  const lines = [`${req.method} ${url.pathname}${url.search} HTTP/1.1`, `host: ${url.host}`];
  for (const [name, value] of Object.entries(req.headers)) lines.push(`${name}: ${value}`);
  return `${lines.join('\n')}\n\n${req.body ?? ''}`;
}

export function formatRawResponse(
  res: { status: number; statusText: string; headers: Headers },
  body: string,
): string {
  const text = res.statusText || STATUS_TEXT[res.status] || '';
  const lines = [`HTTP/1.1 ${res.status} ${text}`.trimEnd()];
  res.headers.forEach((value, name) => lines.push(`${name}: ${value}`));
  return `${lines.join('\n')}\n\n${body}`;
}
