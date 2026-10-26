// @vitest-environment jsdom
import { act, StrictMode, type ReactNode } from 'react';
import { createRoot, type Root } from 'react-dom/client';
import { renderToStaticMarkup } from 'react-dom/server';
import { afterEach, beforeAll, describe, expect, it } from 'vitest';
import Demo from './Demo';
import { Matrix, verdict } from './Matrix';
import { MUTANT_IDS, MUTANTS } from './mutants';
import { killMatrix, PRESET_TESTS, type MatrixRow } from './presetTests';

(globalThis as { IS_REACT_ACT_ENVIRONMENT?: boolean }).IS_REACT_ACT_ENVIRONMENT = true;

let root: Root | null = null;
let host: HTMLElement | null = null;
let matrix: Record<string, MatrixRow> = {};

beforeAll(async () => {
  matrix = await killMatrix(PRESET_TESTS);
});

async function render(node: ReactNode) {
  host = document.createElement('div');
  document.body.append(host);
  root = createRoot(host);
  await act(async () => root!.render(<StrictMode>{node}</StrictMode>));
  return host;
}

afterEach(async () => {
  await act(async () => root?.unmount());
  host?.remove();
  root = null;
  host = null;
});

const byId = (...ids: string[]) => PRESET_TESTS.filter((t) => ids.includes(t.id));

describe('verdict', () => {
  it('zählt die erwischten Varianten der eingeschalteten Tests', () => {
    expect(verdict(matrix, PRESET_TESTS)).toEqual({ caught: 4, total: 4, text: '4 von 4 Fehlervarianten erwischt' });
    expect(verdict(matrix, byId('purchase-no-id', 'name-dash', 'one-cent')).text).toBe('3 von 4 Fehlervarianten erwischt');
    expect(verdict(matrix, byId('runs-through')).text).toBe('0 von 4 Fehlervarianten erwischt');
    expect(verdict(matrix, [])).toEqual({ caught: 0, total: 4, text: 'Kein Test eingeschaltet: 0 von 4 Fehlervarianten erwischt' });
  });

  it('ein Test, der am Original scheitert, zählt nicht als Treffer', () => {
    const red = { id: 'red', name: 'rot', fn: () => undefined };
    const row = { original: false, 'no-tolerance': false, 'ignore-quantity': false, 'lax-name': false, 'no-transaction-id': false };
    expect(verdict({ red: row }, [red]).caught).toBe(0);
  });
});

describe('Matrix', () => {
  it('ist eine echte Tabelle mit Spalten- und Zeilenköpfen', async () => {
    const el = await render(<Matrix matrix={matrix} tests={PRESET_TESTS} />);
    const table = el.querySelector('table')!;
    expect(table).not.toBeNull();
    expect(table.closest('.testing-table-wrap')).not.toBeNull();
    const cols = [...table.querySelectorAll('thead th')].map((th) => [th.getAttribute('scope'), th.textContent]);
    expect(cols).toEqual([
      ['col', 'Test'],
      ['col', 'Original'],
      ...MUTANT_IDS.map((id) => ['col', MUTANTS[id].label]),
    ]);
    const rows = [...table.querySelectorAll('tbody tr')];
    expect(rows).toHaveLength(10);
    for (const row of rows) expect(row.querySelector('th')?.getAttribute('scope')).toBe('row');
  });

  it('Zellen tragen Zeichen und Text, nicht nur Farbe', async () => {
    const el = await render(<Matrix matrix={matrix} tests={byId('valid-purchase')} />);
    const cells = [...el.querySelectorAll('tbody td')].map((td) => td.textContent);
    // Original, no-tolerance, ignore-quantity, lax-name, no-transaction-id
    expect(cells).toEqual(['✓ bestanden', '✓ bestanden', '✗ erwischt', '✓ bestanden', '✓ bestanden']);
  });

  it('markiert Tests, die keine Variante erwischen', async () => {
    const el = await render(<Matrix matrix={matrix} tests={byId('runs-through', 'name-dash')} />);
    const heads = [...el.querySelectorAll('tbody th')].map((th) => th.textContent ?? '');
    const head = (id: string) => heads.find((h) => h.startsWith(byId(id)[0]!.name))!;
    expect(head('runs-through')).toContain('erwischt nichts');
    expect(head('name-dash')).not.toContain('erwischt nichts');
  });

  it('zeigt die Fazitzeile live aus den eingeschalteten Tests', async () => {
    const el = await render(<Matrix matrix={matrix} tests={byId('purchase-no-id', 'name-dash', 'one-cent')} />);
    expect(el.querySelector('[aria-live="polite"]')?.textContent).toBe('3 von 4 Fehlervarianten erwischt');
  });
});

describe('Demo', () => {
  it('kündigt den Ladezustand als Status an', () => {
    // Ohne Effekte (Server-Rendering) bleibt der Zustand vor dem Ergebnis von killMatrix stehen.
    const html = renderToStaticMarkup(<Demo />);
    expect(html).toContain('role="status">Tests laufen …</p>');
  });

  it('zeigt zehn Schalter und schaltet Zeilen und Fazit um', async () => {
    const el = await render(<Demo />);
    // killMatrix ist asynchron; ein paar Mikroaufgaben abwarten.
    await act(async () => {
      await new Promise((r) => setTimeout(r, 0));
    });
    const switches = [...el.querySelectorAll('[role="switch"]')];
    expect(switches).toHaveLength(10);
    expect(el.querySelectorAll('tbody tr')).toHaveLength(10);
    expect(el.querySelector('[aria-live="polite"]')?.textContent).toBe('4 von 4 Fehlervarianten erwischt');

    // Den einzigen Test für transaction_id abschalten.
    const target = switches.find((s) => s.textContent?.includes('ohne transaction_id'))!;
    await act(async () => (target as HTMLElement).click());
    expect(target.getAttribute('aria-checked')).toBe('false');
    expect(el.querySelectorAll('tbody tr')).toHaveLength(9);
    expect(el.querySelector('[aria-live="polite"]')?.textContent).toBe('3 von 4 Fehlervarianten erwischt');
  });
});
