// Feste Beispiel-Events für Demo, Tests und Code-Aufgabe. Jeder kaputte Fall
// weicht vom gültigen Vorbild an genau einer Stelle ab und erzeugt genau ein Issue
// (validateEvent.test.ts prüft das).

/** Ein gültiger Kauf: value ist die Summe aus price × quantity, ohne Versand. */
export const VALID_PURCHASE = {
  event: 'purchase',
  ecommerce: {
    transaction_id: 'T-10027',
    value: 34.99,
    shipping: 4.9,
    currency: 'EUR',
    items: [
      { item_id: 'SKU-101', item_name: 'Kaffeebecher', price: 12.5, quantity: 2 },
      { item_id: 'SKU-205', item_name: 'Teedose', price: 9.99, quantity: 1 },
    ],
  },
};

/** Ein gültiges add_to_cart: kein transaction_id, value ist der Wert der hinzugefügten Items. */
export const VALID_ADD_TO_CART = {
  event: 'add_to_cart',
  ecommerce: {
    value: 25,
    currency: 'EUR',
    items: [{ item_id: 'SKU-101', item_name: 'Kaffeebecher', price: 12.5, quantity: 2 }],
  },
};

export type BrokenId = 'price-string' | 'currency-missing' | 'value-mismatch' | 'name-dash' | 'purchase-no-id';

export const BROKEN: Record<BrokenId, object> = {
  // Der Preis kommt als Text an, etwa weil er aus einem Formularfeld gelesen wurde.
  'price-string': {
    event: 'purchase',
    ecommerce: {
      transaction_id: 'T-10027',
      value: 34.99,
      shipping: 4.9,
      currency: 'EUR',
      items: [
        { item_id: 'SKU-101', item_name: 'Kaffeebecher', price: 12.5, quantity: 2 },
        { item_id: 'SKU-205', item_name: 'Teedose', price: '9.99', quantity: 1 },
      ],
    },
  },
  'currency-missing': {
    event: 'purchase',
    ecommerce: {
      transaction_id: 'T-10027',
      value: 34.99,
      shipping: 4.9,
      items: [
        { item_id: 'SKU-101', item_name: 'Kaffeebecher', price: 12.5, quantity: 2 },
        { item_id: 'SKU-205', item_name: 'Teedose', price: 9.99, quantity: 1 },
      ],
    },
  },
  // value enthält den Versand: 34,99 + 4,90.
  'value-mismatch': {
    event: 'purchase',
    ecommerce: {
      transaction_id: 'T-10027',
      value: 39.89,
      shipping: 4.9,
      currency: 'EUR',
      items: [
        { item_id: 'SKU-101', item_name: 'Kaffeebecher', price: 12.5, quantity: 2 },
        { item_id: 'SKU-205', item_name: 'Teedose', price: 9.99, quantity: 1 },
      ],
    },
  },
  'name-dash': {
    event: 'add-to-cart',
    ecommerce: {
      value: 25,
      currency: 'EUR',
      items: [{ item_id: 'SKU-101', item_name: 'Kaffeebecher', price: 12.5, quantity: 2 }],
    },
  },
  'purchase-no-id': {
    event: 'purchase',
    ecommerce: {
      value: 34.99,
      shipping: 4.9,
      currency: 'EUR',
      items: [
        { item_id: 'SKU-101', item_name: 'Kaffeebecher', price: 12.5, quantity: 2 },
        { item_id: 'SKU-205', item_name: 'Teedose', price: 9.99, quantity: 1 },
      ],
    },
  },
};

/** Beschriftung der Schnellwahl in der Demo, in dieser Reihenfolge. */
export const BROKEN_LABELS: Record<BrokenId, string> = {
  'price-string': 'Preis als Text',
  'currency-missing': 'Währung fehlt',
  'value-mismatch': 'value ≠ Summe',
  'name-dash': 'Name mit Bindestrich',
  'purchase-no-id': 'Kauf ohne transaction_id',
};
