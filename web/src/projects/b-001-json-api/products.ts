// Erfundene Produktliste für Demo und Code-Aufgaben. Die Prüfmodule laufen im
// Worker und importieren diese Datei, deshalb hier nichts aus React.

export interface Product {
  id: number;
  name: string;
  /** Euro mit Cent */
  price: number;
  inStock: boolean;
}

// Absichtlich nicht nach Preis sortiert: Code-Aufgabe 2 soll das selbst tun.
export const PRODUCTS: Product[] = [
  { id: 1, name: 'Notizbuch', price: 4.5, inStock: true },
  { id: 2, name: 'Kugelschreiber', price: 1.2, inStock: true },
  { id: 3, name: 'Tasse', price: 8.9, inStock: false },
  { id: 4, name: 'Rucksack', price: 39.95, inStock: true },
  { id: 5, name: 'Schreibtischlampe', price: 24.99, inStock: false },
  { id: 6, name: 'Bleistift', price: 0.8, inStock: true },
];

/** Die Liste als JSON-Text, so wie ein Server sie schicken würde. */
export const PRODUCTS_JSON = JSON.stringify(PRODUCTS, null, 2);

/** Derselbe Text mit Komma nach dem letzten Eintrag: in JavaScript erlaubt, in JSON nicht. */
export const BROKEN_JSON = PRODUCTS_JSON.replace(/\n]$/, ',\n]');
