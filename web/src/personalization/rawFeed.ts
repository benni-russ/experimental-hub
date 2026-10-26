// Roher Produkt-Feed für die Feed-Prüfung (Track C): der Katalog als Kopie, gezielt
// verändert, plus vier Zusatzeinträge. Insgesamt 28 Einträge mit 8 Defekten auf
// 8 verschiedenen Einträgen.
import { CATALOG, type Product } from './catalog';

export const FEED_DATE = '2026-10-26T03:00:00Z';

type RawProduct = Record<string, unknown>;

const copyOf = (id: string): RawProduct => {
  const p = CATALOG.find((x) => x.id === id);
  if (!p) throw new Error(`Unbekanntes Produkt ${id}`);
  return { ...p, tags: [...p.tags] };
};

const extra = (p: Product): RawProduct => ({ ...p });

// Zusatzeinträge, je mit einem Defekt, hinter dem Katalogprodukt eingereiht.
const extras: Record<string, RawProduct | undefined> = {
  // Dublette: gleiche id wie P05, anderer Preis
  P05: { ...copyOf('P05'), price: 199.0, sales30d: 80, updatedAt: '2026-10-24T16:45:00Z' },
  // ohne price
  P09: (() => {
    const entry = extra({
      id: 'P25', title: 'Schneeflocke Stulpen', category: 'Zubehör', brand: 'Gletscherblau', price: 19.9,
      availability: 'in_stock', imageLink: 'https://bilder.nordlicht-sport.example/p25.jpg',
      tags: ['warm', 'winter', 'leicht'], sales30d: 14, updatedAt: '2026-10-24T10:00:00Z',
    });
    delete entry.price;
    return entry;
  })(),
  // Preis als Text mit Komma und Währungszeichen
  P14: {
    ...extra({
      id: 'P26', title: 'Gipfelrast Isomatte', category: 'Zubehör', brand: 'Bergwind', price: 49.9,
      availability: 'in_stock', imageLink: 'https://bilder.nordlicht-sport.example/p26.jpg',
      tags: ['mehrtagestour', 'leicht', 'robust'], sales30d: 9, updatedAt: '2026-10-23T10:00:00Z',
    }),
    price: '49,90 €',
  },
  // updatedAt 10 Tage vor FEED_DATE (veraltet)
  P18: extra({
    id: 'P27', title: 'Sommerwind Laufshirt', category: 'Jacken', brand: 'Kieselstein', price: 34.9,
    availability: 'in_stock', imageLink: 'https://bilder.nordlicht-sport.example/p27.jpg',
    tags: ['laufen', 'straße', 'leicht'], sales30d: 40, updatedAt: '2026-10-16T03:00:00Z',
  }),
};

const products: RawProduct[] = [];
for (const p of CATALOG) {
  const entry = copyOf(p.id);
  if (p.id === 'P02') entry.category = 'laufschuhe'; // reparierbar: Kleinschreibung
  if (p.id === 'P08') entry.category = 'Jacken '; // reparierbar: Leerzeichen am Ende
  if (p.id === 'P10') entry.availability = 'Out of Stock'; // reparierbar: andere Schreibweise (im Katalog ausverkauft)
  products.push(entry);
  const zusatz = extras[p.id];
  if (zusatz) products.push(zusatz);
}

export const RAW_FEED: string = JSON.stringify({ generatedAt: FEED_DATE, products }, null, 2);
