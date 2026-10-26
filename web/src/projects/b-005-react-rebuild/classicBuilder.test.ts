// @vitest-environment jsdom
import { afterEach, describe, expect, it } from 'vitest';
import { validateEvent } from '../b-004-ga4-event-builder/validateEvent';
import { CATALOG, cartReducer, EMPTY_CART, euro, type CartAction, type CartState } from './cart';
import { classicWrites, DEMO_SEQUENCE, mountClassic } from './classicBuilder';

const [cup, tin] = CATALOG;

/** Alle Schreibzugriffe einer Folge von Eingaben, beginnend beim leeren Warenkorb. */
function writesFor(actions: CartAction[]): string[] {
  let state: CartState = EMPTY_CART;
  const lines: string[] = [];
  for (const action of actions) {
    lines.push(...classicWrites(state, action));
    state = cartReducer(state, action);
  }
  return lines;
}

const roots: HTMLElement[] = [];
function mount(forgetTotal = false) {
  const root = document.createElement('div');
  document.body.append(root);
  roots.push(root);
  const log: string[] = [];
  const dispose = mountClassic(root, (line) => log.push(line), { forgetTotal });
  return { root, log, dispose };
}

afterEach(() => {
  for (const r of roots.splice(0)) r.remove();
});

function click(root: HTMLElement, selector: string) {
  const button = root.querySelector<HTMLButtonElement>(selector);
  if (!button) throw new Error(`Kein Knopf ${selector}`);
  button.click();
}

const quantityOf = (root: HTMLElement, id: string) =>
  Number(root.querySelector(`li[data-item-id="${id}"] [data-role="quantity"]`)?.textContent);

/** Spielt eine Aktion so ab, wie ein Mensch sie anklicken würde. */
function perform(root: HTMLElement, action: CartAction) {
  if (action.type === 'add') {
    expect(action.item.quantity).toBe(1);
    click(root, `button[data-action="add"][data-item-id="${action.item.item_id}"]`);
  } else if (action.type === 'remove') {
    click(root, `li[data-item-id="${action.item_id}"] button[data-action="remove"]`);
  } else {
    const current = quantityOf(root, action.item_id);
    const dir = action.quantity === current + 1 ? 'increase' : action.quantity === current - 1 ? 'decrease' : null;
    if (!dir) throw new Error('setQuantity nur in Einerschritten');
    click(root, `li[data-item-id="${action.item_id}"] button[data-action="${dir}"]`);
  }
}

const totalText = (root: HTMLElement) => root.querySelector('[data-role="total"]')?.textContent;
const eventOf = (root: HTMLElement) => JSON.parse(root.querySelector('[data-role="event"]')?.textContent ?? 'null');

describe('DEMO_SEQUENCE', () => {
  it('drei Eingaben: Becher, Teedose, Becher auf zwei', () => {
    expect(DEMO_SEQUENCE).toEqual([
      { type: 'add', item: { ...cup, quantity: 1 } },
      { type: 'add', item: { ...tin, quantity: 1 } },
      { type: 'setQuantity', item_id: cup!.item_id, quantity: 2 },
    ]);
  });
});

describe('classicWrites', () => {
  it('neues Item in leeren Warenkorb: Zeile, Hinweis, Summe, Event', () => {
    expect(classicWrites(EMPTY_CART, DEMO_SEQUENCE[0]!)).toEqual([
      'Zeile „Kaffeebecher“ eingefügt',
      'Hinweis „Warenkorb leer“ ausgeblendet',
      `Summe neu geschrieben: ${euro(12.5)}`,
      'Event-Text neu geschrieben',
    ]);
  });

  it('gleiche item_id: Menge statt neuer Zeile', () => {
    const state = cartReducer(EMPTY_CART, DEMO_SEQUENCE[0]!);
    expect(classicWrites(state, DEMO_SEQUENCE[0]!)).toEqual([
      'Menge bei „Kaffeebecher“ auf 2 geschrieben',
      `Summe neu geschrieben: ${euro(25)}`,
      'Event-Text neu geschrieben',
    ]);
  });

  it('letztes Item entfernt: Zeile weg, Hinweis wieder da', () => {
    const state = cartReducer(EMPTY_CART, DEMO_SEQUENCE[0]!);
    const expected = [
      'Zeile „Kaffeebecher“ entfernt',
      'Hinweis „Warenkorb leer“ eingeblendet',
      `Summe neu geschrieben: ${euro(0)}`,
      'Event-Text neu geschrieben',
    ];
    expect(classicWrites(state, { type: 'remove', item_id: cup!.item_id })).toEqual(expected);
    expect(classicWrites(state, { type: 'setQuantity', item_id: cup!.item_id, quantity: 0 })).toEqual(expected);
  });

  it('unbekannte item_id: kein Schreibzugriff', () => {
    expect(classicWrites(EMPTY_CART, { type: 'remove', item_id: 'X' })).toEqual([]);
    expect(classicWrites(EMPTY_CART, { type: 'setQuantity', item_id: 'X', quantity: 2 })).toEqual([]);
  });

  it('die drei Beispiel-Eingaben ergeben zehn Schreibzugriffe', () => {
    expect(writesFor(DEMO_SEQUENCE)).toHaveLength(10);
  });
});

describe('mountClassic', () => {
  it('führt genau die Schreibzugriffe aus classicWrites aus, in derselben Reihenfolge', () => {
    const { root, log } = mount();
    for (const action of DEMO_SEQUENCE) perform(root, action);
    expect(log).toEqual(writesFor(DEMO_SEQUENCE));
  });

  it('das DOM zeigt danach Zeilen, Menge, Summe und ein gültiges Event', () => {
    const { root } = mount();
    expect(root.querySelector('[data-role="empty"]')?.hasAttribute('hidden')).toBe(false);
    for (const action of DEMO_SEQUENCE) perform(root, action);
    expect([...root.querySelectorAll('li[data-item-id]')].map((li) => li.getAttribute('data-item-id'))).toEqual([
      cup!.item_id,
      tin!.item_id,
    ]);
    expect(quantityOf(root, cup!.item_id)).toBe(2);
    expect(totalText(root)).toBe(euro(34.99));
    expect(root.querySelector('[data-role="empty"]')?.hasAttribute('hidden')).toBe(true);
    const event = eventOf(root);
    expect(event.ecommerce.value).toBe(34.99);
    expect(validateEvent(event)).toEqual([]);
  });

  it('weitere Eingaben (Entfernen, Minus bis null) bleiben deckungsgleich mit classicWrites', () => {
    const { root, log } = mount();
    const more: CartAction[] = [
      ...DEMO_SEQUENCE,
      { type: 'add', item: { ...tin!, quantity: 1 } },
      { type: 'remove', item_id: tin!.item_id },
      { type: 'setQuantity', item_id: cup!.item_id, quantity: 1 },
      { type: 'setQuantity', item_id: cup!.item_id, quantity: 0 },
    ];
    for (const action of more) perform(root, action);
    expect(log).toEqual(writesFor(more));
    expect(root.querySelectorAll('li[data-item-id]')).toHaveLength(0);
    expect(totalText(root)).toBe(euro(0));
  });

  it('forgetTotal: nur der Schreibzugriff auf die Summe fällt weg, die Summe bleibt stehen', () => {
    const { root, log } = mount(true);
    for (const action of DEMO_SEQUENCE) perform(root, action);
    expect(log).toEqual(writesFor(DEMO_SEQUENCE).filter((l) => !l.startsWith('Summe')));
    expect(log).toHaveLength(7);
    expect(totalText(root)).toBe(euro(0));
    // Das Event liest seinen value aus der Summe im DOM und ist damit auch falsch.
    expect(validateEvent(eventOf(root)).map((i) => i.code)).toEqual(['value_mismatch']);
  });

  it('options wird bei jeder Eingabe neu gelesen', () => {
    const options = { forgetTotal: false };
    const root = document.createElement('div');
    roots.push(root);
    const log: string[] = [];
    mountClassic(root, (l) => log.push(l), options);
    perform(root, DEMO_SEQUENCE[0]!);
    options.forgetTotal = true;
    perform(root, DEMO_SEQUENCE[1]!);
    expect(totalText(root)).toBe(euro(12.5));
    expect(log.filter((l) => l.startsWith('Summe'))).toHaveLength(1);
  });

  it('dispose räumt auf: leerer Container, keine Reaktion mehr auf Klicks', () => {
    const { root, log, dispose } = mount();
    const addButton = root.querySelector<HTMLButtonElement>('button[data-action="add"]')!;
    dispose();
    expect(root.childNodes).toHaveLength(0);
    root.append(addButton);
    addButton.click();
    expect(log).toEqual([]);
  });

  it('zweimal montiert nach dispose (wie im StrictMode): keine doppelten Elemente', () => {
    const { root, dispose } = mount();
    dispose();
    mountClassic(root, () => {}, { forgetTotal: false });
    expect(root.querySelectorAll('[data-role="total"]')).toHaveLength(1);
    expect(root.querySelectorAll('button[data-action="add"]')).toHaveLength(CATALOG.length);
  });

  it('Knöpfe haben eindeutige Namen', () => {
    const { root } = mount();
    perform(root, DEMO_SEQUENCE[0]!);
    const names = [...root.querySelectorAll('button')].map((b) => b.getAttribute('aria-label') ?? b.textContent);
    expect(new Set(names).size).toBe(names.length);
    expect(names).toContain('Kaffeebecher: Menge erhöhen');
  });
});
