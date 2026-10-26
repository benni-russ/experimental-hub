// @vitest-environment jsdom
import { act, StrictMode } from 'react';
import { createRoot, type Root } from 'react-dom/client';
import { afterEach, describe, expect, it } from 'vitest';
import { readFileSync } from 'node:fs';
import { join } from 'node:path';
import Demo from './Demo';

// Vitest liest CSS-Importe als leer ein; deshalb die Datei direkt von der Platte.
const css = readFileSync(join(__dirname, 'accessibility.css'), 'utf8');

(globalThis as { IS_REACT_ACT_ENVIRONMENT?: boolean }).IS_REACT_ACT_ENVIRONMENT = true;

let root: Root | null = null;
let host: HTMLElement | null = null;

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
});

const buttons = (el: HTMLElement) => [...el.querySelectorAll('button')];
const byText = (el: HTMLElement, text: string) => buttons(el).find((b) => b.textContent?.trim() === text);
const byLabel = (el: HTMLElement, label: string) => buttons(el).find((b) => b.getAttribute('aria-label') === label);
const click = async (b: HTMLElement | undefined) => {
  expect(b).toBeDefined();
  await act(async () => b!.click());
};

describe('Suchspiel im Browser-Modell', () => {
  it('Suchmodus legt über jedes Element einen Knopf mit Namen', async () => {
    const el = await render();
    expect(el.querySelectorAll('.a11y-pick')).toHaveLength(0);
    await click(byText(el, 'Barrieren suchen'));
    const picks = [...el.querySelectorAll<HTMLButtonElement>('.a11y-pick')];
    expect(picks.length).toBeGreaterThanOrEqual(10);
    for (const p of picks) expect(p.getAttribute('aria-label')).toMatch(/^.+: .+ prüfen$/);
  });

  it('Fund, Behebung, Fokus auf der Ergebniszeile', async () => {
    const el = await render();
    await click(byText(el, 'Barrieren suchen'));
    const note = buttons(el).find((b) => b.getAttribute('aria-label')?.startsWith('Hinweistext:'));
    await click(note);
    const line = el.querySelector('.a11y-result-line');
    expect(line?.textContent).toContain('Gefunden: Zu schwacher Kontrast');
    expect(document.activeElement).toBe(line);
    expect(el.textContent).toContain('gefunden 1 von 8');

    await click(byText(el, 'Dunklere Textfarbe wählen'));
    const after = el.querySelector('.a11y-result-line');
    expect(after?.textContent).toContain('Behoben: Zu schwacher Kontrast.');
    expect(document.activeElement).toBe(after);
    expect(el.textContent).toContain('behoben 1 von 8');
  });

  it('ein Klick daneben: Hier ist nichts falsch', async () => {
    const el = await render();
    await click(byText(el, 'Barrieren suchen'));
    await click(buttons(el).find((b) => b.getAttribute('aria-label')?.startsWith('Preis:')));
    expect(el.querySelector('.a11y-result-line')?.textContent).toContain('Hier ist nichts falsch.');
  });

  it('nutzloser Alternativtext: gefunden, nicht behoben, mit eigenem Hinweis im Prüfer', async () => {
    const el = await render();
    await click(byText(el, 'Barrieren suchen'));
    await click(byLabel(el, 'Bild: Produktbild prüfen'));
    await click(byText(el, '„Bild“'));
    expect(el.querySelector('.a11y-result-line')?.textContent).toContain('Gefunden, nicht behoben.');
    await click(byText(el, 'Automatisch prüfen') ?? buttons(el).find((b) => b.textContent?.includes('prüfen lassen')));
    expect(el.textContent).toContain('Zufriedener Prüfer, nutzloser Text');
    expect(el.textContent).toContain('Der Prüfer findet 4 der 8 Barrieren.');
  });
});

describe('Fokus-Barriere im CSS', () => {
  it('outline: none steht nur in Regeln unter .a11y-sample', () => {
    const rules = [...css.replace(/\/\*[\s\S]*?\*\//g, '').matchAll(/([^{}]+)\{([^}]*)\}/g)];
    const offenders = rules.filter(([, , body]) => /outline\s*:\s*(none|0)/.test(body!)).map(([, sel]) => sel!.trim());
    expect(offenders.length).toBeGreaterThan(0);
    for (const sel of offenders) {
      for (const part of sel.split(',')) expect(part.trim()).toMatch(/^\.a11y-sample--nofocus\s.*:not\(\.a11y-pick\)/);
    }
  });
});
