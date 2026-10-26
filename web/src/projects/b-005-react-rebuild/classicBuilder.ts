// Der Warenkorb-Builder „wie früher“: Vanilla-JS, das bei jeder Eingabe Felder
// aus dem DOM liest und die betroffenen Stellen von Hand neu schreibt. Was er
// schreibt, plant classicWrites als reine Funktion; mountClassic führt genau
// diese Schreibzugriffe aus und meldet jeden mit derselben Zeile ans Protokoll.

import { CATALOG, cartReducer, cartTotal, euro, type CartAction, type CartItem, type CartState } from './cart';

/** Die drei Beispiel-Eingaben der Schätzfrage: Becher, Teedose, Becher auf zwei. */
export const DEMO_SEQUENCE: CartAction[] = [
  { type: 'add', item: { ...CATALOG[0]!, quantity: 1 } },
  { type: 'add', item: { ...CATALOG[1]!, quantity: 1 } },
  { type: 'setQuantity', item_id: CATALOG[0]!.item_id, quantity: 2 },
];

/** Ein Schreibzugriff auf die sichtbare Seite */
type Write =
  | { kind: 'insertRow'; item: CartItem }
  | { kind: 'quantity'; item: CartItem }
  | { kind: 'removeRow'; item: CartItem }
  | { kind: 'empty'; visible: boolean }
  | { kind: 'total'; value: number }
  | { kind: 'event' };

/** Was ein klassischer Handler bei dieser Eingabe anfassen muss, in seiner Reihenfolge. */
function planWrites(state: CartState, action: CartAction): Write[] {
  const next = cartReducer(state, action);
  if (next === state) return [];
  const id = action.type === 'add' ? action.item.item_id : action.item_id;
  const before = state.items.find((item) => item.item_id === id);
  const after = next.items.find((item) => item.item_id === id);

  const writes: Write[] = [];
  if (!after && before) writes.push({ kind: 'removeRow', item: before });
  else if (after && !before) writes.push({ kind: 'insertRow', item: after });
  else if (after) writes.push({ kind: 'quantity', item: after });

  if (state.items.length === 0 && next.items.length > 0) writes.push({ kind: 'empty', visible: false });
  if (state.items.length > 0 && next.items.length === 0) writes.push({ kind: 'empty', visible: true });

  writes.push({ kind: 'total', value: cartTotal(next) });
  writes.push({ kind: 'event' });
  return writes;
}

function describe(write: Write): string {
  switch (write.kind) {
    case 'insertRow':
      return `Zeile „${write.item.item_name}“ eingefügt`;
    case 'quantity':
      return `Menge bei „${write.item.item_name}“ auf ${write.item.quantity} geschrieben`;
    case 'removeRow':
      return `Zeile „${write.item.item_name}“ entfernt`;
    case 'empty':
      return `Hinweis „Warenkorb leer“ ${write.visible ? 'eingeblendet' : 'ausgeblendet'}`;
    case 'total':
      return `Summe neu geschrieben: ${euro(write.value)}`;
    case 'event':
      return 'Event-Text neu geschrieben';
  }
}

/** Eine Zeile je DOM-Schreibzugriff, den der klassische Builder bei dieser Eingabe macht. */
export function classicWrites(state: CartState, action: CartAction): string[] {
  return planWrites(state, action).map(describe);
}

// ---------------------------------------------------------------------------
// Ab hier echtes DOM. Mit Absicht ohne Framework: Jede Stelle wird von Hand gelesen und geschrieben.

function el<K extends keyof HTMLElementTagNameMap>(
  tag: K,
  attrs: Record<string, string> = {},
  text?: string,
): HTMLElementTagNameMap[K] {
  const node = document.createElement(tag);
  for (const [k, v] of Object.entries(attrs)) node.setAttribute(k, v);
  if (text !== undefined) node.textContent = text;
  return node;
}

function buildRow(item: CartItem): HTMLLIElement {
  const row = el('li', {
    class: 'rebuild-row',
    'data-item-id': item.item_id,
    'data-item-name': item.item_name,
    'data-price': String(item.price),
  });
  const quantity = el('span', { class: 'rebuild-qty' });
  quantity.append(
    el('button', { type: 'button', class: 'btn btn-quiet rebuild-step', 'data-action': 'decrease', 'aria-label': `${item.item_name}: Menge verringern` }, '−'),
    el('span', { class: 'visually-hidden' }, 'Menge '),
    el('span', { class: 'rebuild-qty-value', 'data-role': 'quantity' }, String(item.quantity)),
    el('button', { type: 'button', class: 'btn btn-quiet rebuild-step', 'data-action': 'increase', 'aria-label': `${item.item_name}: Menge erhöhen` }, '+'),
  );
  row.append(
    el('span', { class: 'rebuild-row-name' }, item.item_name),
    el('span', { class: 'rebuild-row-price' }, `je ${euro(item.price)}`),
    quantity,
    el('button', { type: 'button', class: 'btn btn-quiet rebuild-remove', 'data-action': 'remove', 'aria-label': `${item.item_name} entfernen` }, 'Entfernen'),
  );
  return row;
}

/**
 * Baut den klassischen Builder in `root` und gibt eine Aufräumfunktion zurück.
 * `options` wird bei jeder Eingabe neu gelesen; `forgetTotal` lässt den
 * Schreibzugriff auf die Summe aus, wie ein vergessenes Update im echten Code.
 */
export function mountClassic(root: HTMLElement, log: (line: string) => void, options: { forgetTotal: boolean }): () => void {
  const add = el('div', { class: 'rebuild-add', role: 'group', 'aria-label': 'Artikel hinzufügen' });
  for (const item of CATALOG) {
    const button = el('button', {
      type: 'button',
      class: 'btn btn-secondary',
      'data-action': 'add',
      'data-item-id': item.item_id,
      'data-item-name': item.item_name,
      'data-price': String(item.price),
      'aria-label': `${item.item_name} hinzufügen, ${euro(item.price)}`,
    });
    button.append(el('span', { 'aria-hidden': 'true' }, '+ '), item.item_name);
    add.append(button);
  }
  const empty = el('p', { class: 'rebuild-empty', 'data-role': 'empty' }, 'Der Warenkorb ist leer.');
  const rows = el('ul', { class: 'rebuild-rows', 'aria-label': 'Warenkorb' });
  const totalLine = el('p', { class: 'rebuild-total' }, 'Summe: ');
  const total = el('output', { 'data-role': 'total' }, euro(0));
  totalLine.append(total);
  const event = el('pre', { class: 'rebuild-event', 'data-role': 'event', tabindex: '0', role: 'region', 'aria-label': 'Event-Text, klassisch' });
  root.replaceChildren(add, empty, rows, totalLine, event);

  const rowOf = (id: string) => [...rows.children].find((r) => (r as HTMLElement).dataset.itemId === id) as HTMLLIElement | undefined;

  /** Liest den Warenkorb aus den Zeilen im DOM: Der klassische Builder hat keinen anderen Speicher. */
  function readState(): CartState {
    return {
      items: [...rows.querySelectorAll<HTMLLIElement>('li[data-item-id]')].map((row) => ({
        item_id: row.dataset.itemId ?? '',
        item_name: row.dataset.itemName ?? '',
        price: Number(row.dataset.price),
        quantity: Number(row.querySelector('[data-role="quantity"]')?.textContent),
      })),
    };
  }

  /** Das Event entsteht aus dem DOM: Items aus den Zeilen, value aus der angezeigten Summe. */
  function writeEvent() {
    const value = Number((total.textContent ?? '').replace(' €', '').replace(',', '.'));
    event.textContent = JSON.stringify(
      { event: 'add_to_cart', ecommerce: { currency: 'EUR', value, items: readState().items } },
      null,
      2,
    );
  }

  function perform(write: Write) {
    switch (write.kind) {
      case 'insertRow':
        rows.append(buildRow(write.item));
        break;
      case 'quantity': {
        const cell = rowOf(write.item.item_id)?.querySelector('[data-role="quantity"]');
        if (cell) cell.textContent = String(write.item.quantity);
        break;
      }
      case 'removeRow': {
        const row = rowOf(write.item.item_id);
        // Der Fokus säße sonst auf einem Knopf, den es nicht mehr gibt.
        const hadFocus = row?.contains(document.activeElement) ?? false;
        row?.remove();
        if (hadFocus) add.querySelector('button')?.focus();
        break;
      }
      case 'empty':
        empty.hidden = !write.visible;
        break;
      case 'total':
        total.textContent = euro(write.value);
        break;
      case 'event':
        writeEvent();
        break;
    }
  }

  function onClick(e: Event) {
    const button = (e.target as Element | null)?.closest<HTMLButtonElement>('button[data-action]');
    if (!button || !root.contains(button)) return;
    // Feld gelesen: Was gemeint ist, steht nur im DOM.
    const data = button.dataset;
    const row = button.closest<HTMLLIElement>('li[data-item-id]');
    const id = row?.dataset.itemId ?? '';
    const quantity = Number(row?.querySelector('[data-role="quantity"]')?.textContent);
    let action: CartAction;
    switch (data.action) {
      case 'add':
        action = {
          type: 'add',
          item: { item_id: data.itemId ?? '', item_name: data.itemName ?? '', price: Number(data.price), quantity: 1 },
        };
        break;
      case 'increase':
        action = { type: 'setQuantity', item_id: id, quantity: quantity + 1 };
        break;
      case 'decrease':
        action = { type: 'setQuantity', item_id: id, quantity: quantity - 1 };
        break;
      case 'remove':
        action = { type: 'remove', item_id: id };
        break;
      default:
        return;
    }
    for (const write of planWrites(readState(), action)) {
      if (write.kind === 'total' && options.forgetTotal) continue;
      perform(write);
      log(describe(write));
    }
  }

  writeEvent();
  root.addEventListener('click', onClick);
  return () => {
    root.removeEventListener('click', onClick);
    root.replaceChildren();
  };
}
