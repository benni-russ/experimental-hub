// Fiktive Besucher mit Merkmalen und Verlauf (Track C). Alle Namen sind erfunden.

export interface VisitorTraits {
  device: 'mobile' | 'desktop' | 'tablet';
  customer: 'new' | 'returning';
  source: 'newsletter' | 'search' | 'social' | 'direct';
  cart: 'empty' | 'filled';
}

export interface VisitorEvent {
  type: 'view' | 'cart' | 'purchase';
  productId: string;
  at: string; // ISO-Zeitpunkt
}

export interface Visitor {
  id: string;
  name: string;
  traits: VisitorTraits;
  events: VisitorEvent[];
}

// „Jetzt“ der Übung: feste Uhrzeit, damit alle Rechnungen reproduzierbar bleiben.
export const NOW = '2026-10-26T12:00:00Z';

const ev = (type: VisitorEvent['type'], productId: string, at: string): VisitorEvent => ({ type, productId, at });

export const VISITORS: Visitor[] = [
  {
    id: 'V1',
    name: 'Anna',
    traits: { device: 'mobile', customer: 'returning', source: 'newsletter', cart: 'filled' },
    events: [
      ev('purchase', 'P11', '2026-10-14T18:20:00Z'),
      ev('view', 'P07', '2026-10-19T07:45:00Z'),
      ev('cart', 'P22', '2026-10-21T20:10:00Z'),
      ev('view', 'P02', '2026-10-23T19:30:00Z'),
      ev('view', 'P01', '2026-10-25T21:05:00Z'),
    ],
  },
  {
    id: 'V2',
    name: 'Ben',
    traits: { device: 'desktop', customer: 'returning', source: 'search', cart: 'empty' },
    events: [
      ev('view', 'P14', '2026-10-02T12:00:00Z'),
      ev('view', 'P15', '2026-10-02T12:08:00Z'),
      ev('cart', 'P15', '2026-10-02T12:15:00Z'),
      ev('purchase', 'P15', '2026-10-03T09:30:00Z'),
      ev('view', 'P23', '2026-10-24T08:20:00Z'),
    ],
  },
  {
    id: 'V3',
    name: 'Clara',
    traits: { device: 'tablet', customer: 'new', source: 'social', cart: 'empty' },
    events: [
      ev('view', 'P09', '2026-10-25T16:40:00Z'),
      ev('view', 'P12', '2026-10-25T16:52:00Z'),
    ],
  },
  {
    id: 'V4',
    name: 'David',
    traits: { device: 'mobile', customer: 'returning', source: 'direct', cart: 'filled' },
    events: [
      ev('view', 'P05', '2026-09-30T06:30:00Z'),
      ev('view', 'P24', '2026-10-10T06:45:00Z'),
      ev('cart', 'P05', '2026-10-24T06:50:00Z'),
      ev('cart', 'P21', '2026-10-24T06:55:00Z'),
    ],
  },
  {
    id: 'V5',
    name: 'Eva',
    traits: { device: 'desktop', customer: 'returning', source: 'newsletter', cart: 'empty' },
    events: [
      ev('purchase', 'P19', '2026-10-08T19:00:00Z'),
      ev('view', 'P10', '2026-10-22T20:30:00Z'),
      ev('view', 'P16', '2026-10-25T07:10:00Z'),
    ],
  },
  {
    id: 'V6',
    name: 'Finn',
    traits: { device: 'mobile', customer: 'new', source: 'search', cart: 'empty' },
    events: [],
  },
];

// Beispielbesucher der Übungen: gemischter Verlauf über Jacken, Zubehör und
// Laufschuhe mit einem Kauf; zuletzt angesehen wurde ein lieferbarer Laufschuh.
export const EXAMPLE_VISITOR_ID = 'V1';
