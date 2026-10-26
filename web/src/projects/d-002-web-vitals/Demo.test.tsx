// @vitest-environment jsdom
import { act, StrictMode } from 'react';
import { createRoot, type Root } from 'react-dom/client';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { readFileSync } from 'node:fs';
import { join } from 'node:path';
import { REFERENCE, simulateLoad } from '../../experience/vitals';
import Demo from './Demo';
import { AXIS_MAX, clippedCount } from './FieldStrip';
import { fieldMetrics } from './insights';

const css = readFileSync(join(__dirname, 'webVitals.css'), 'utf8');
const tokens = readFileSync(join(__dirname, '../../design/tokens.css'), 'utf8');

(globalThis as { IS_REACT_ACT_ENVIRONMENT?: boolean }).IS_REACT_ACT_ENVIRONMENT = true;

let root: Root | null = null;
let host: HTMLElement | null = null;

beforeEach(() => {
  // Bilder nach Zeitgeber, damit der Fühltest im Test deterministisch weiterläuft.
  vi.stubGlobal('requestAnimationFrame', (cb: FrameRequestCallback) => setTimeout(() => cb(performance.now()), 0) as unknown as number);
  vi.stubGlobal('cancelAnimationFrame', (id: number) => clearTimeout(id));
});

async function render() {
  host = document.createElement('div');
  document.body.append(host);
  root = createRoot(host);
  await act(async () => root!.render(<StrictMode><Demo /></StrictMode>));
  return host;
}

afterEach(async () => {
  await act(async () => root?.unmount());
  host?.remove();
  root = null;
  host = null;
  vi.unstubAllGlobals();
});

const switchByLabel = (el: HTMLElement, label: string) =>
  [...el.querySelectorAll<HTMLButtonElement>('[role="switch"]')].find((b) => b.textContent?.includes(label));
const tiles = (el: HTMLElement) => [...el.querySelectorAll('.wv-tile')].map((t) => t.textContent ?? '');

describe('D-002 Demo', () => {
  it('Start: Werte und Stufen mit Wort, Live-Regionen sind da und leer', async () => {
    const el = await render();
    const t = tiles(el);
    expect(t[0]).toContain('4,53 s');
    expect(t[0]).toContain('schlecht');
    expect(t[1]).toContain('0,17');
    expect(t[1]).toContain('verbessern');
    expect(t[2]).toContain('576 ms');
    expect(t[2]).toContain('schlecht');
    const live = [...el.querySelectorAll('[aria-live]')];
    expect(live.length).toBeGreaterThanOrEqual(2);
    for (const l of live) expect(l.textContent).toBe('');
    expect(el.querySelectorAll('.insight')).toHaveLength(1); // nur Labor gegen Feld
  });

  it('Produktbild komprimieren: LCP besser, CLS schlechter, Kasten und Ansage mit denselben Zahlen', async () => {
    const el = await render();
    await act(async () => switchByLabel(el, 'Produktbild komprimieren')!.click());
    const compress = simulateLoad({ compress: true }, REFERENCE);
    expect(compress).toMatchObject({ lcp: 1.17, cls: 0.32 });
    const t = tiles(el);
    expect(t[0]).toContain('1,17 s');
    expect(t[1]).toContain('0,32');
    expect(t[1]).toContain('schlecht');
    expect(el.textContent).toContain('Ein LCP-Gegenmittel macht den CLS schlechter');
    expect(el.textContent).toContain('Der CLS liegt jetzt bei 0,32, im Start bei 0,17.');
    const live = el.querySelector('.wv-section [aria-live]');
    expect(live?.textContent).toBe('LCP 1,17 s, gut; CLS 0,32, schlecht; INP 576 ms, schlecht.');
  });

  it('Alle Gegenmittel: alles gut, Hauptschalter an', async () => {
    const el = await render();
    await act(async () => switchByLabel(el, 'Alle Gegenmittel')!.click());
    expect(switchByLabel(el, 'Alle Gegenmittel')!.getAttribute('aria-checked')).toBe('true');
    const t = tiles(el);
    expect(t.every((x) => x.includes('gut'))).toBe(true);
    expect(el.textContent).toContain('Alle drei gut, im Labor');
  });

  it('Zeitleiste: Start am Ende, Regler auf 0 zeigt nichts Gezeichnetes, Ende wandert mit', async () => {
    const el = await render();
    const svg = () => el.querySelector('.wv-timeline-svg')!;
    expect(svg().getAttribute('aria-label')).toContain('bei 5,03 s von 5,03 s');
    expect(svg().getAttribute('aria-label')).toContain('Die Seite ist fertig.');
    const range = el.querySelector<HTMLInputElement>('.wv-timeline input[type="range"]')!;
    await act(async () => {
      const setter = Object.getOwnPropertyDescriptor(HTMLInputElement.prototype, 'value')!.set!;
      setter.call(range, '0');
      range.dispatchEvent(new Event('input', { bubbles: true }));
    });
    expect(svg().getAttribute('aria-label')).toContain('Noch ist nichts gezeichnet.');
    // Ende ändert sich: Zeit 0 bleibt 0, und am Ende Stehendes wandert mit.
    await act(async () => switchByLabel(el, 'Alle Gegenmittel')!.click());
    expect(svg().getAttribute('aria-label')).toContain('bei 0 s von 1,84 s');
    expect(svg().getAttribute('aria-label')).not.toMatch(/NaN/);
  });

  it('Fühltest: drei schnelle Klicks ergeben eine Messung, nie negativ', async () => {
    const el = await render();
    const button = [...el.querySelectorAll<HTMLButtonElement>('.wv-feel-buttons button')].find((b) => b.textContent === '50 ms blockieren')!;
    await act(async () => {
      button.click();
      button.click();
      button.click();
    });
    await act(async () => {
      await new Promise((r) => setTimeout(r, 20));
    });
    const runs = [...el.querySelectorAll('.wv-runs li')];
    expect(runs).toHaveLength(1);
    const ms = Number(runs[0]!.textContent!.match(/nach (\d+) ms/)![1]);
    expect(ms).toBeGreaterThanOrEqual(50);
    expect(el.querySelector('.wv-feel [aria-live]')?.textContent).toMatch(/^Messung 1: 50-ms-Aufgabe: nächstes Bild nach \d+ ms, (gut|verbessern|schlecht)\.$/);
    expect(el.querySelectorAll('.wv-feel-buttons button:disabled')).toHaveLength(0);
  });

  it('Wasserfall in eigenem Scrollbereich, Blockade mit Wort', async () => {
    const el = await render();
    const region = el.querySelector('.table-scroll')!;
    expect(region.getAttribute('tabindex')).toBe('0');
    expect(region.getAttribute('role')).toBe('region');
    expect(region.getAttribute('aria-label')).toBeTruthy();
    expect(region.textContent).toContain('blockiert das Zeichnen');
    expect(region.textContent).toContain('2.400 KB');
  });

  it('Feldreihe: abgeschnittene Werte werden genannt', async () => {
    const el = await render();
    for (const m of fieldMetrics({})) {
      const n = clippedCount(m);
      expect(n).toBe(m.values.filter((v) => v > AXIS_MAX[m.metric]).length);
    }
    const lcp = fieldMetrics({})[0]!;
    expect(lcp.p75).toBe(6.975);
    expect(el.textContent).toContain('75. Perzentil 6,975 s');
    expect(el.textContent).toContain('Referenz 4,53 s');
  });

  it('Beschriftungen der Zeichnungen bleiben in der Zeichnung, auch gestapelt', async () => {
    const el = await render();
    const check = () => {
      for (const svg of el.querySelectorAll('.wv-strip-svg, .wv-timeline-svg')) {
        const [, , w, h] = svg.getAttribute('viewBox')!.split(' ').map(Number);
        for (const t of svg.querySelectorAll('text')) {
          expect(Number(t.getAttribute('y'))).toBeGreaterThanOrEqual(8);
          expect(Number(t.getAttribute('y'))).toBeLessThanOrEqual(h!);
          expect(Number(t.getAttribute('x'))).toBeGreaterThanOrEqual(0);
          expect(Number(t.getAttribute('x'))).toBeLessThanOrEqual(w!);
        }
      }
    };
    check();
    await act(async () => switchByLabel(el, 'Produktbild komprimieren')!.click());
    check();
    await act(async () => switchByLabel(el, 'Alle Gegenmittel')!.click());
    check();
  });

  it('CSS nutzt nur vorhandene Tokens', () => {
    const used = [...new Set(css.match(/var\(--[a-z0-9-]+/g)?.map((v) => v.slice(4)))];
    for (const name of used) expect(tokens, name).toContain(`${name}:`);
  });
});

describe('D-002 Zeitleiste bei reduzierter Bewegung', () => {
  it('„Ans Ende springen“ ist am Ende als deaktiviert markiert, Fokus bleibt', async () => {
    vi.stubGlobal('matchMedia', (query: string) => ({
      matches: query.includes('reduce'),
      media: query,
      addEventListener: () => {},
      removeEventListener: () => {},
    }));
    const el = await render();
    const jump = () => [...el.querySelectorAll<HTMLButtonElement>('.wv-timeline button')].find((b) => b.textContent === 'Ans Ende springen')!;
    expect(jump()).toBeDefined();
    expect(jump().getAttribute('aria-disabled')).toBe('true');
    const range = el.querySelector<HTMLInputElement>('.wv-timeline input[type="range"]')!;
    await act(async () => {
      Object.getOwnPropertyDescriptor(HTMLInputElement.prototype, 'value')!.set!.call(range, '1');
      range.dispatchEvent(new Event('input', { bubbles: true }));
    });
    expect(jump().hasAttribute('aria-disabled')).toBe(false);
    expect(range.getAttribute('aria-valuetext')).toBe('1 s');
    jump().focus();
    await act(async () => jump().click());
    expect(document.activeElement).toBe(jump());
    expect(jump().getAttribute('aria-disabled')).toBe('true');
    expect(el.querySelector('.wv-timeline-svg')!.getAttribute('aria-label')).toContain('bei 5,03 s von 5,03 s');
  });
});
