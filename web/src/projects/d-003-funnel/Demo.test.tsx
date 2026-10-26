// @vitest-environment jsdom
import { act, StrictMode } from 'react';
import { createRoot, type Root } from 'react-dom/client';
import { MemoryRouter } from 'react-router';
import { afterEach, describe, expect, it } from 'vitest';
import { readFileSync } from 'node:fs';
import { join } from 'node:path';
import { SCENARIOS, SOURCES } from '../../experience/funnel';
import Demo from './Demo';
import { formatCount, liftAnnouncement, runScenario, scenarioAnnouncement, scenarioInsight, sourceAnnouncement, testSizeText } from './insights';

const css = readFileSync(join(__dirname, 'funnel.css'), 'utf8');
const tokens = readFileSync(join(__dirname, '../../design/tokens.css'), 'utf8');

(globalThis as { IS_REACT_ACT_ENVIRONMENT?: boolean }).IS_REACT_ACT_ENVIRONMENT = true;

let root: Root | null = null;
let host: HTMLElement | null = null;

async function render() {
  host = document.createElement('div');
  document.body.append(host);
  root = createRoot(host);
  await act(async () =>
    root!.render(
      <StrictMode>
        <MemoryRouter>
          <Demo />
        </MemoryRouter>
      </StrictMode>,
    ),
  );
  return host;
}

afterEach(async () => {
  await act(async () => root?.unmount());
  host?.remove();
  root = null;
  host = null;
});

const buttonByText = (el: HTMLElement, text: string) =>
  [...el.querySelectorAll<HTMLButtonElement>('button')].find((b) => b.textContent?.trim() === text)!;
const ranges = (el: HTMLElement) => [...el.querySelectorAll<HTMLInputElement>('.fn-sliders input[type="range"]')];
const counts = (el: HTMLElement) => [...el.querySelectorAll('.fn-step-head .fn-num')].map((n) => n.textContent);
const live = (el: HTMLElement, section: string) => el.querySelector(`[aria-labelledby="${section}"] [aria-live]`)!;

async function slide(input: HTMLInputElement, value: number) {
  await act(async () => {
    Object.getOwnPropertyDescriptor(HTMLInputElement.prototype, 'value')!.set!.call(input, String(value));
    input.dispatchEvent(new Event('input', { bubbles: true }));
  });
}

/** Alle Prozentzahlen in einem Text als Zahlen. */
const percents = (text: string) => [...text.matchAll(/(\d+(?:\.\d{3})*(?:,\d+)?) %/g)].map((m) => Number(m[1]!.replaceAll('.', '').replace(',', '.')));

describe('D-003 Demo: Funnel', () => {
  it('Start: fünf Balken, größter Verlust mit Zeichen und Wort, leere Live-Regionen', async () => {
    const el = await render();
    expect(counts(el)).toEqual(['20.000', '10.950', '1.505', '830', '520']);
    const leaks = [...el.querySelectorAll('.fn-leak')];
    expect(leaks).toHaveLength(1);
    expect(leaks[0]!.textContent).toContain('größter Verlust');
    expect(leaks[0]!.querySelector('svg')).not.toBeNull();
    // Am Übergang Produktseite → Warenkorb, also an der zweiten Stufe.
    expect(el.querySelectorAll('.fn-step')[1]!.querySelector('.fn-leak')).not.toBeNull();
    expect(el.querySelector('.fn-overall')!.textContent).toContain('2,6 %');
    const regions = [...el.querySelectorAll('[aria-live]')];
    expect(regions).toHaveLength(2);
    for (const r of regions) expect(r.textContent).toBe('');
  });

  it('Quellenumschalter: Social zeigt den eigenen Funnel und sagt ihn an, Fokus bleibt', async () => {
    const el = await render();
    const social = buttonByText(el, 'Social');
    social.focus();
    await act(async () => social.click());
    expect(social.getAttribute('aria-pressed')).toBe('true');
    expect(counts(el)).toEqual(['5.000', '2.000', '120', '54', '27']);
    expect(live(el, 'fn-h-lifts').textContent).toBe(sourceAnnouncement('social', [0, 0, 0, 0]));
    expect(document.activeElement).toBe(social);
    // Erneut drücken ändert nichts und sagt nichts Neues an.
    await act(async () => social.click());
    expect(live(el, 'fn-h-lifts').textContent).toBe(sourceAnnouncement('social', [0, 0, 0, 0]));
    for (const s of SOURCES) {
      await act(async () => buttonByText(el, s.label).click());
      expect(el.querySelectorAll('.fn-leak')).toHaveLength(1);
    }
  });
});

describe('D-003 Demo: Regler', () => {
  it('vier Regler −50 … +50 in Schritten von 5, Wert als „+10 %“ angesagt', async () => {
    const el = await render();
    const r = ranges(el);
    expect(r).toHaveLength(4);
    for (const input of r) {
      expect(input.min).toBe('-50');
      expect(input.max).toBe('50');
      expect(input.step).toBe('5');
    }
    expect(el.textContent).toContain('von −50 % bis +50 %');
    expect(el.textContent).toContain('Keine Quote steigt über 100 %.');
    await slide(r[0]!, 10);
    expect(r[0]!.getAttribute('aria-valuetext')).toBe('+10 %');
    expect(el.querySelector('.fn-kpis')!.textContent).toContain('572');
    expect(el.querySelector('.fn-kpis')!.textContent).toContain('Start: 520');
    expect(live(el, 'fn-h-lifts').textContent).toBe(liftAnnouncement([0.1, 0, 0, 0], 0));
    expect(el.querySelector('.fn-lifts .insight')!.textContent).toContain('10 % mehr Käufe');
    expect(el.querySelector('.fn-test-result')!.textContent).toBe(testSizeText([0.1, 0, 0, 0]));
  });

  it('ohne Regler kein Multiplikations-Kasten und ein Hinweis statt Testdauer', async () => {
    const el = await render();
    expect(el.querySelector('.fn-lifts .insight')).toBeNull();
    expect(el.querySelector('.fn-test-result')!.textContent).toContain('Stell oben an mindestens einem Übergang eine Verbesserung ein.');
  });

  it.each([-50, 50])('alle Regler auf %i: keine NaN, keine Quote über 100 %%', async (value) => {
    const el = await render();
    for (const input of ranges(el)) await slide(input, value);
    for (const s of ['all', ...SOURCES.map((x) => x.label)]) {
      if (s !== 'all') await act(async () => buttonByText(el, s).click());
      const text = el.textContent ?? '';
      expect(text).not.toMatch(/NaN|undefined|Infinity/);
      const shown = [...el.querySelectorAll('.fn-transition, .fn-overall')].flatMap((t) => percents(t.textContent ?? ''));
      expect(shown.length).toBeGreaterThan(0);
      for (const p of shown) expect(p).toBeLessThanOrEqual(100);
    }
    const result = el.querySelector('.fn-test-result')!.textContent ?? '';
    if (value < 0) expect(result).toContain('Stell oben an mindestens einem Übergang eine Verbesserung ein.');
    else expect(result).toMatch(/^Um \+[\d.,]+ % relativ auf 2,6 % zu erkennen, braucht ein A\/B-Test etwa [\d.]+ Besuche je Variante/);
  });

  it('„Alle Regler auf 0“ setzt zurück, sagt es an und lässt den Fokus auf dem Knopf', async () => {
    const el = await render();
    await slide(ranges(el)[1]!, 20);
    const reset = buttonByText(el, 'Alle Regler auf 0');
    reset.focus();
    await act(async () => reset.click());
    expect(ranges(el).map((r) => r.value)).toEqual(['0', '0', '0', '0']);
    expect(counts(el)).toEqual(['20.000', '10.950', '1.505', '830', '520']);
    expect(live(el, 'fn-h-lifts').textContent).toBe(`Alle Regler auf 0. ${sourceAnnouncement('all', [0, 0, 0, 0])}`);
    expect(document.activeElement).toBe(reset);
    // Danach meldet derselbe Regler denselben Wert wieder.
    await slide(ranges(el)[1]!, 20);
    expect(live(el, 'fn-h-lifts').textContent).toBe(liftAnnouncement([0, 0.2, 0, 0], 1));
  });

  it('Stichprobe verweist auf A-001', async () => {
    const el = await render();
    const link = el.querySelector<HTMLAnchorElement>('.fn-test a')!;
    expect(link.getAttribute('href')).toBe('/projekt/A-001');
    expect(el.querySelector('.fn-test')!.textContent).toContain('α 0,05 und Power 0,8');
  });
});

describe('D-003 Demo: Szenarien', () => {
  it.each(SCENARIOS.map((s) => s.id))('%s: Tabelle, Richtungen mit Wort, Widerspruch und Erkenntnis passen zusammen', async (id) => {
    const el = await render();
    const { scenario, comparison } = runScenario(id);
    const button = buttonByText(el, scenario.label);
    button.focus();
    await act(async () => button.click());
    expect(button.getAttribute('aria-pressed')).toBe('true');
    expect(document.activeElement).toBe(button);

    const region = el.querySelector('.fn-table')!;
    expect(region.classList.contains('table-scroll')).toBe(true);
    expect(region.getAttribute('tabindex')).toBe('0');
    expect(region.getAttribute('role')).toBe('region');
    const rows = [...region.querySelectorAll('tbody tr')];
    expect(rows).toHaveLength(7);
    for (const row of rows) {
      const tag = row.querySelector('.fn-direction')!;
      expect(tag.querySelector('svg')).not.toBeNull();
      expect(tag.textContent?.trim()).toMatch(/^(steigt|fällt|gleich)$/);
    }
    expect(rows[2]!.textContent).toContain(comparison.changes.conversionRate.direction === 'up' ? 'steigt' : 'fällt');

    const scenarios = el.querySelector('.fn-scenarios')!;
    expect(scenarios.querySelector('.fn-invented')!.textContent).toBe('Effekte erfunden');
    expect(scenarios.querySelector('.fn-conflict') !== null).toBe(comparison.conflict);
    expect(scenarios.querySelector('.fn-agree') !== null).toBe(!comparison.conflict);
    expect(scenarios.querySelector('.insight')!.textContent).toContain(scenarioInsight(id));
    const a004 = scenarios.querySelector<HTMLAnchorElement>('.insight a');
    expect(a004?.getAttribute('href') ?? null).toBe(id === 'socialCampaign' ? '/projekt/A-004' : null);

    // Rabatt ist vorausgewählt: dann bleibt die Ansage leer.
    expect(live(el, 'fn-h-scenarios').textContent).toBe(id === 'discount' ? '' : scenarioAnnouncement(id));
    expect(el.textContent).not.toMatch(/NaN|undefined/);
  });

  it('Tabelle zeigt gerundete Vorher-Werte des Starts', async () => {
    const el = await render();
    const cells = [...el.querySelectorAll('.fn-table tbody tr')].map((r) => r.querySelectorAll('td')[0]!.textContent);
    expect(cells).toEqual(['20.000', '520', '2,6 %', '92,00 €', '47.825 €', '2,39 €', '16.583 €']);
    expect(formatCount(runScenario('socialCampaign').after.visits)).toBe('25.000');
  });

  it('CSS nutzt nur vorhandene Tokens', () => {
    const used = [...new Set(css.match(/var\(--[a-z0-9-]+/g)?.map((v) => v.slice(4)))];
    for (const name of used) expect(tokens, name).toContain(`${name}:`);
  });
});
