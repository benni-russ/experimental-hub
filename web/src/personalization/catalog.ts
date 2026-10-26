// Fiktive Shopdaten für Track C (Personalisierung). Alle Marken und Produkte sind erfunden.

export const CATEGORIES = ['Laufschuhe', 'Jacken', 'Rucksäcke', 'Zubehör'] as const;

export type Availability = 'in_stock' | 'out_of_stock';

export interface Product {
  id: string;
  title: string;
  category: string;
  brand: string;
  price: number; // in Euro
  availability: Availability;
  imageLink?: string;
  tags: string[];
  sales30d: number; // Verkäufe der letzten 30 Tage
  updatedAt: string; // ISO-Zeitpunkt
}

const img = (id: string) => `https://bilder.nordlicht-sport.example/${id.toLowerCase()}.jpg`;

export const CATALOG: Product[] = [
  // Laufschuhe
  { id: 'P01', title: 'Wolkenläufer Pro Laufschuh', category: 'Laufschuhe', brand: 'Nordlicht', price: 139.9, availability: 'in_stock', imageLink: img('P01'), tags: ['laufen', 'dämpfung', 'straße', 'leicht'], sales30d: 84, updatedAt: '2026-10-25T08:00:00Z' },
  { id: 'P02', title: 'Gipfeljäger Trail GTX', category: 'Laufschuhe', brand: 'Bergwind', price: 159.95, availability: 'in_stock', imageLink: img('P02'), tags: ['laufen', 'trail', 'wasserdicht', 'grip', 'robust'], sales30d: 47, updatedAt: '2026-10-24T14:30:00Z' },
  { id: 'P03', title: 'Feldweg Allround Trailschuh', category: 'Laufschuhe', brand: 'Bergwind', price: 109.9, availability: 'out_of_stock', imageLink: img('P03'), tags: ['laufen', 'trail', 'grip', 'robust'], sales30d: 31, updatedAt: '2026-10-23T09:15:00Z' },
  { id: 'P04', title: 'Stadtflitzer Light', category: 'Laufschuhe', brand: 'Kieselstein', price: 89.99, availability: 'in_stock', imageLink: img('P04'), tags: ['laufen', 'straße', 'leicht', 'atmungsaktiv'], sales30d: 62, updatedAt: '2026-10-22T10:00:00Z' },
  { id: 'P05', title: 'Marathon Carbon Wettkampfschuh', category: 'Laufschuhe', brand: 'Nordlicht', price: 219.0, availability: 'in_stock', imageLink: img('P05'), tags: ['laufen', 'straße', 'dämpfung', 'wettkampf', 'leicht'], sales30d: 18, updatedAt: '2026-10-25T16:45:00Z' },
  { id: 'P06', title: 'Regenläufer Shell', category: 'Laufschuhe', brand: 'Kieselstein', price: 124.5, availability: 'in_stock', imageLink: img('P06'), tags: ['laufen', 'wasserdicht', 'straße', 'dämpfung'], sales30d: 39, updatedAt: '2026-10-21T12:20:00Z' },
  // Jacken
  { id: 'P07', title: 'Sturmfalter Regenjacke', category: 'Jacken', brand: 'Bergwind', price: 129.0, availability: 'in_stock', imageLink: img('P07'), tags: ['wasserdicht', 'winddicht', 'leicht', 'atmungsaktiv'], sales30d: 71, updatedAt: '2026-10-25T07:30:00Z' },
  { id: 'P08', title: 'Felswand Hardshell', category: 'Jacken', brand: 'Gletscherblau', price: 249.9, availability: 'in_stock', imageLink: img('P08'), tags: ['wasserdicht', 'winddicht', 'robust', 'trail'], sales30d: 22, updatedAt: '2026-10-24T11:00:00Z' },
  { id: 'P09', title: 'Windspiel Softshelljacke', category: 'Jacken', brand: 'Kieselstein', price: 99.95, availability: 'in_stock', imageLink: img('P09'), tags: ['winddicht', 'atmungsaktiv', 'warm'], sales30d: 53, updatedAt: '2026-10-22T15:10:00Z' },
  { id: 'P10', title: 'Eisvogel Daunenjacke', category: 'Jacken', brand: 'Gletscherblau', price: 189.0, availability: 'out_of_stock', imageLink: img('P10'), tags: ['warm', 'leicht', 'winter', 'winddicht'], sales30d: 44, updatedAt: '2026-10-23T08:40:00Z' },
  { id: 'P11', title: 'Frühlicht Laufjacke', category: 'Jacken', brand: 'Nordlicht', price: 74.9, availability: 'in_stock', imageLink: img('P11'), tags: ['laufen', 'leicht', 'atmungsaktiv', 'reflektierend'], sales30d: 58, updatedAt: '2026-10-25T13:05:00Z' },
  { id: 'P12', title: 'Kaminfeuer Fleecejacke', category: 'Jacken', brand: 'Bergwind', price: 84.0, availability: 'in_stock', imageLink: img('P12'), tags: ['warm', 'atmungsaktiv', 'robust'], sales30d: 36, updatedAt: '2026-10-20T17:30:00Z' },
  // Rucksäcke
  { id: 'P13', title: 'Pfadfinder Trailweste 8 l', category: 'Rucksäcke', brand: 'Nordlicht', price: 99.0, availability: 'in_stock', imageLink: img('P13'), tags: ['laufen', 'trail', 'leicht', 'trinksystem'], sales30d: 27, updatedAt: '2026-10-24T09:50:00Z' },
  { id: 'P14', title: 'Tagwerk Rucksack 25 l', category: 'Rucksäcke', brand: 'Kieselstein', price: 69.95, availability: 'in_stock', imageLink: img('P14'), tags: ['tagestour', 'atmungsaktiv', 'robust'], sales30d: 66, updatedAt: '2026-10-22T08:25:00Z' },
  { id: 'P15', title: 'Almhütte Wanderrucksack 40 l', category: 'Rucksäcke', brand: 'Bergwind', price: 134.9, availability: 'in_stock', imageLink: img('P15'), tags: ['tagestour', 'robust', 'trail', 'wasserdicht'], sales30d: 29, updatedAt: '2026-10-23T14:15:00Z' },
  { id: 'P16', title: 'Radwechsel Pendlerrucksack', category: 'Rucksäcke', brand: 'Gletscherblau', price: 89.0, availability: 'in_stock', imageLink: img('P16'), tags: ['reflektierend', 'wasserdicht', 'leicht'], sales30d: 41, updatedAt: '2026-10-21T16:00:00Z' },
  { id: 'P17', title: 'Weitwanderer Trekkingrucksack 60 l', category: 'Rucksäcke', brand: 'Gletscherblau', price: 199.95, availability: 'out_of_stock', imageLink: img('P17'), tags: ['mehrtagestour', 'robust', 'trail', 'wasserdicht'], sales30d: 15, updatedAt: '2026-10-24T18:20:00Z' },
  { id: 'P18', title: 'Kurzstrecke Mini-Rucksack 12 l', category: 'Rucksäcke', brand: 'Nordlicht', price: 49.9, availability: 'in_stock', imageLink: img('P18'), tags: ['leicht', 'tagestour', 'laufen'], sales30d: 52, updatedAt: '2026-10-25T10:10:00Z' },
  // Zubehör
  { id: 'P19', title: 'Nachtschwärmer Stirnlampe', category: 'Zubehör', brand: 'Nordlicht', price: 39.95, availability: 'in_stock', imageLink: img('P19'), tags: ['reflektierend', 'nacht', 'leicht', 'laufen'], sales30d: 76, updatedAt: '2026-10-24T07:05:00Z' },
  { id: 'P20', title: 'Quellfrisch Trinkflasche 750 ml', category: 'Zubehör', brand: 'Kieselstein', price: 14.9, availability: 'in_stock', imageLink: img('P20'), tags: ['trinksystem', 'leicht', 'tagestour'], sales30d: 93, updatedAt: '2026-10-22T13:45:00Z' },
  { id: 'P21', title: 'Trittsicher Laufsocken 3er-Pack', category: 'Zubehör', brand: 'Bergwind', price: 24.9, availability: 'in_stock', tags: ['laufen', 'atmungsaktiv', 'leicht'], sales30d: 88, updatedAt: '2026-10-25T09:00:00Z' },
  { id: 'P22', title: 'Winterwärme Handschuhe', category: 'Zubehör', brand: 'Gletscherblau', price: 29.95, availability: 'in_stock', imageLink: img('P22'), tags: ['warm', 'winddicht', 'winter'], sales30d: 49, updatedAt: '2026-10-23T11:30:00Z' },
  { id: 'P23', title: 'Matschfest Gamaschen', category: 'Zubehör', brand: 'Bergwind', price: 34.0, availability: 'in_stock', imageLink: img('P23'), tags: ['wasserdicht', 'trail', 'robust'], sales30d: 12, updatedAt: '2026-10-21T10:40:00Z' },
  { id: 'P24', title: 'Taktgeber Pulsuhr', category: 'Zubehör', brand: 'Nordlicht', price: 179.0, availability: 'in_stock', imageLink: img('P24'), tags: ['laufen', 'wettkampf', 'robust'], sales30d: 23, updatedAt: '2026-10-26T01:15:00Z' },
];
