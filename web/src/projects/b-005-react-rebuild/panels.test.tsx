// @vitest-environment jsdom
import { act, StrictMode, type ReactNode } from 'react';
import { createRoot, type Root } from 'react-dom/client';
import { afterEach, describe, expect, it } from 'vitest';
import { euro } from './cart';
import { ClassicPanel } from './ClassicPanel';
import { ReactPanel } from './ReactPanel';

(globalThis as { IS_REACT_ACT_ENVIRONMENT?: boolean }).IS_REACT_ACT_ENVIRONMENT = true;

let root: Root | null = null;
let host: HTMLElement | null = null;

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

async function click(el: Element | null) {
  if (!el) throw new Error('Element fehlt');
  await act(async () => (el as HTMLElement).click());
}

describe('ClassicPanel', () => {
  it('übersteht den doppelten Aufbau im StrictMode ohne doppeltes DOM', async () => {
    const el = await render(<ClassicPanel forgetTotal={false} />);
    expect(el.querySelectorAll('[data-role="total"]')).toHaveLength(1);
    expect(el.querySelectorAll('button[data-action="add"]')).toHaveLength(3);
  });

  it('zeigt die Schreibzugriffe der letzten Eingabe im Protokoll und kündigt sie an', async () => {
    const el = await render(<ClassicPanel forgetTotal={false} />);
    await click(el.querySelector('button[data-action="add"]'));
    const items = [...el.querySelectorAll('[data-role="protocol"] li')].map((li) => li.textContent);
    expect(items).toEqual([
      'Zeile „Kaffeebecher“ eingefügt',
      'Hinweis „Warenkorb leer“ ausgeblendet',
      `Summe neu geschrieben: ${euro(12.5)}`,
      'Event-Text neu geschrieben',
    ]);
    // Nur ein Durchlauf: Der StrictMode darf keinen zweiten Listener hinterlassen.
    expect(el.querySelector('[data-role="count"]')?.textContent).toContain('4');
    expect(el.querySelector('[aria-live="polite"]')?.textContent).toContain('4 Schreibzugriffe');
  });

  it('forgetTotal wirkt ab der nächsten Eingabe, ohne den Warenkorb zu leeren', async () => {
    host = document.createElement('div');
    document.body.append(host);
    root = createRoot(host);
    await act(async () => root!.render(<ClassicPanel forgetTotal={false} />));
    await click(host.querySelector('button[data-action="add"]'));
    await act(async () => root!.render(<ClassicPanel forgetTotal />));
    await click(host.querySelector('button[data-action="add"]'));
    expect(host.querySelector('[data-role="quantity"]')?.textContent).toBe('2');
    expect(host.querySelector('[data-role="total"]')?.textContent).toBe(euro(12.5));
  });
});

describe('ReactPanel', () => {
  it('Summe und Event kommen aus dem Zustand, das Protokoll zeigt Aktion → Zustand → Ansicht', async () => {
    const el = await render(<ReactPanel />);
    const add = (name: string) => el.querySelector(`button[aria-label^="${name} hinzufügen"]`);
    await click(add('Kaffeebecher'));
    await click(add('Teedose'));
    await click(el.querySelector('button[aria-label="Kaffeebecher: Menge erhöhen"]'));
    expect(el.querySelector('[data-role="react-total"]')?.textContent).toBe(euro(34.99));
    const event = JSON.parse(el.querySelector('[data-role="react-event"]')?.textContent ?? 'null');
    expect(event.ecommerce.value).toBe(34.99);
    const steps = [...el.querySelectorAll('[data-role="protocol"] li')].map((li) => li.textContent);
    expect(steps).toHaveLength(3);
    expect(steps[0]).toMatch(/^Aktion: setQuantity/);
    expect(el.querySelector('[data-role="count"]')?.textContent).toContain('0');
  });

  it('Entfernen nimmt die Zeile heraus und zeigt den Hinweis wieder', async () => {
    const el = await render(<ReactPanel />);
    await click(el.querySelector('button[aria-label^="Teesieb hinzufügen"]'));
    expect(el.textContent).not.toContain('Der Warenkorb ist leer.');
    await click(el.querySelector('button[aria-label="Teesieb entfernen"]'));
    expect(el.textContent).toContain('Der Warenkorb ist leer.');
    expect(el.querySelector('[data-role="react-total"]')?.textContent).toBe(euro(0));
  });
});
