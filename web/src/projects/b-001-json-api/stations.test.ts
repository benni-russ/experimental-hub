import { describe, expect, it } from 'vitest';
import { PRODUCTS } from './products';
import { demoFetch, walkStations, type StationId, type StationState } from './stations';

const byId = (stations: StationState[], id: StationId) => {
  const s = stations.find((x) => x.id === id);
  if (!s) throw new Error(`Station ${id} fehlt`);
  return s;
};

/** Den Rohtext eines Falls unabhängig von walkStations holen. */
async function rawText(caseId: Parameters<typeof demoFetch>[0]): Promise<string> {
  const res = await demoFetch(caseId).fetch('/products');
  return res.text();
}

/** Die echte Meldung von JSON.parse für diesen Text. */
function parseMessage(text: string): string {
  try {
    JSON.parse(text);
  } catch (err) {
    return (err as Error).message;
  }
  throw new Error('Text ließ sich parsen');
}

describe('walkStations', () => {
  it('alles gut: fünf Stationen in fester Reihenfolge, alle geschafft, Wert gleich PRODUCTS', async () => {
    const { stations, value } = await walkStations('ok');
    expect(stations.map((s) => s.id)).toEqual(['request', 'response', 'text', 'parse', 'object']);
    expect(stations.every((s) => s.status === 'done')).toBe(true);
    expect(value).toEqual(PRODUCTS);
    expect(byId(stations, 'response').detail).toContain('200');
    expect(byId(stations, 'response').detail).toContain('ok: true');
    expect(byId(stations, 'response').detail).toContain('application/json');
  });

  it('kaputtes JSON: JSON.parse scheitert mit der echten Meldung, Objekt übersprungen', async () => {
    const { stations, value } = await walkStations('broken-json');
    const captured = parseMessage(await rawText('broken-json'));
    expect(byId(stations, 'response').status).toBe('done');
    expect(byId(stations, 'text').status).toBe('done');
    expect(byId(stations, 'parse').status).toBe('failed');
    expect(byId(stations, 'parse').error).toBe(captured);
    expect(byId(stations, 'object').status).toBe('skipped');
    expect(value).toBeUndefined();
  });

  it('404 mit HTML: Antwort ist da (404, ok: false), Text ist HTML, JSON.parse scheitert', async () => {
    const { stations } = await walkStations('not-found');
    const response = byId(stations, 'response');
    expect(response.status).toBe('done');
    expect(response.detail).toContain('404');
    expect(response.detail).toContain('ok: false');
    const text = byId(stations, 'text');
    expect(text.status).toBe('done');
    expect(text.detail).toMatch(/^<!doctype html>/i);
    expect(byId(stations, 'parse').status).toBe('failed');
    expect(byId(stations, 'parse').error).toBe(parseMessage(text.detail));
    expect(byId(stations, 'object').status).toBe('skipped');
  });

  it('leere Antwort: 204, Rohtext leer, JSON.parse scheitert', async () => {
    const { stations } = await walkStations('empty');
    expect(byId(stations, 'response').detail).toContain('204');
    expect(byId(stations, 'response').detail).toContain('ok: true');
    expect(byId(stations, 'text').detail).toBe('');
    expect(byId(stations, 'parse').status).toBe('failed');
    expect(byId(stations, 'parse').error).toBe(parseMessage(''));
  });

  it('falscher Content-Type: text/plain, trotzdem alle geschafft', async () => {
    const { stations, value } = await walkStations('wrong-type');
    expect(byId(stations, 'response').detail).toContain('text/plain');
    expect(stations.every((s) => s.status === 'done')).toBe(true);
    expect(value).toEqual(PRODUCTS);
  });
});

describe('PRODUCTS', () => {
  it('sechs Produkte, Preise mit Cent, zwei nicht lieferbar', () => {
    expect(PRODUCTS).toHaveLength(6);
    expect(PRODUCTS.filter((p) => !p.inStock)).toHaveLength(2);
    for (const p of PRODUCTS) expect(Math.round(p.price * 100) / 100).toBe(p.price);
    expect(new Set(PRODUCTS.map((p) => p.id)).size).toBe(6);
  });
});
