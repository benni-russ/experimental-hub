// Die absichtlich fehlerhafte Beispiel-Produktseite für D-001 als Knotenmodell.
// Reine Logik: Rendern übernimmt die Seite, geprüft wird hier.

import { CATALOG, type Product } from '../personalization/catalog';
import { contrastRatio, rateContrast } from './color';

export const PRODUCT: Product = CATALOG.find((p) => p.id === 'P01')!;

export type BarrierId = 'contrast' | 'alt' | 'label' | 'heading' | 'linkText' | 'divButton' | 'colorOnly' | 'focus';
export type Perspective = 'see' | 'hear' | 'keyboard' | 'vision';

export interface Barrier {
  id: BarrierId;
  title: string;
  elementId: string; // Knoten auf der Seite, an dem die Barriere hängt
  perspectiveHint: Perspective; // Perspektive, in der sie am ehesten auffällt
  hint: string;
  why: string;
  fixLabel: string;
  automatic: boolean; // von einem automatischen Prüfer erkennbar
}

export const BARRIERS: Barrier[] = [
  {
    id: 'contrast',
    title: 'Zu schwacher Kontrast',
    elementId: 'note',
    perspectiveHint: 'vision',
    hint: 'Der Hinweis unter dem Preis ist hellgrau auf Weiß.',
    why: 'Bei Sehschwäche, Sonnenlicht oder einem schlechten Bildschirm verschwindet heller Text auf hellem Grund.',
    fixLabel: 'Dunklere Textfarbe wählen',
    automatic: true,
  },
  {
    id: 'alt',
    title: 'Bild ohne Beschreibung',
    elementId: 'image',
    perspectiveHint: 'hear',
    hint: 'Das Produktbild hat keinen Alternativtext.',
    why: 'Wer die Seite vorgelesen bekommt, erfährt nicht, was auf dem Bild zu sehen ist.',
    fixLabel: 'Alternativtext wählen',
    automatic: true,
  },
  {
    id: 'label',
    title: 'Eingabefeld ohne Beschriftung',
    elementId: 'quantity',
    perspectiveHint: 'hear',
    hint: 'Das Mengenfeld hat nur einen Platzhalter, der beim Tippen verschwindet.',
    why: 'Ein Platzhalter ist keine Beschriftung: Er ist oft blass und wird nicht verlässlich vorgelesen.',
    fixLabel: 'Sichtbare Beschriftung „Menge“ ergänzen',
    automatic: true,
  },
  {
    id: 'heading',
    title: 'Überschrift springt eine Ebene',
    elementId: 'details',
    perspectiveHint: 'hear',
    hint: '„Produktdetails“ ist eine Überschrift der Ebene 4 direkt nach Ebene 1.',
    why: 'Die Überschriften geben die Gliederung vor; Sprünge machen sie lückenhaft und schwer zu überfliegen.',
    fixLabel: 'Auf Ebene 2 setzen',
    automatic: true,
  },
  {
    id: 'linkText',
    title: 'Linktext ohne Aussage',
    elementId: 'sizeChart',
    perspectiveHint: 'hear',
    hint: 'Der Link heißt nur „hier“.',
    why: 'Linklisten werden ohne Umgebungstext vorgelesen; „hier“ verrät dann nicht, wohin der Link führt.',
    fixLabel: 'Linktext „Größentabelle ansehen“ verwenden',
    automatic: true,
  },
  {
    id: 'divButton',
    title: 'Knopf, der keiner ist',
    elementId: 'cart',
    perspectiveHint: 'keyboard',
    hint: '„In den Warenkorb“ ist ein div ohne Rolle und ohne Tastaturbedienung.',
    why: 'Per Tastatur ist das Feld nicht erreichbar und für Vorleseprogramme kein Knopf. Das findet ein automatischer Prüfer nicht.',
    fixLabel: 'Echtes button-Element verwenden',
    automatic: false,
  },
  {
    id: 'colorOnly',
    title: 'Zustand nur über Farbe',
    elementId: 'sizes',
    perspectiveHint: 'vision',
    hint: 'Ausverkaufte Größen unterscheiden sich nur durch die Farbe (rot statt grün).',
    why: 'Wer Rot und Grün schlecht unterscheidet oder die Seite vorgelesen bekommt, erfährt die Verfügbarkeit nicht.',
    fixLabel: 'Durchstreichen, Wort „ausverkauft“ und deaktivieren',
    automatic: false,
  },
  {
    id: 'focus',
    title: 'Fokus unsichtbar',
    elementId: 'logo',
    perspectiveHint: 'keyboard',
    hint: 'Die Fokusmarkierung ist per CSS entfernt.',
    why: 'Wer mit der Tastatur navigiert, sieht nicht, wo er gerade ist.',
    fixLabel: 'Sichtbaren Fokusring wiederherstellen',
    automatic: false,
  },
];

export const ALT_CHOICES: { text: string; good: boolean }[] = [
  { text: 'Bild', good: false },
  { text: 'IMG_2041.jpg', good: false },
  { text: 'Laufschuh Wolkenläufer Pro in Blau, seitlich', good: true },
];

/** Behebungen: je Barriere `true`, bei `alt` der gewählte Text. */
export type Fixes = Partial<Record<Exclude<BarrierId, 'alt'>, true>> & { alt?: string };

export type NodeKind =
  | 'logoLink' | 'heading' | 'image' | 'price' | 'note' | 'sizes' | 'quantity' | 'cartButton' | 'paragraph' | 'link';

export interface SizeOption {
  size: number;
  available: boolean;
}

export interface PageNode {
  id: string;
  kind: NodeKind;
  text: string;
  level?: number;
  alt?: string;
  label?: string;
  placeholder?: string;
  element: 'a' | 'h1' | 'h2' | 'h4' | 'img' | 'p' | 'div' | 'button' | 'input' | 'fieldset';
  focusable: boolean;
  focusVisible: boolean;
  color?: string;
  background?: string;
  sizes?: SizeOption[];
  stateShownBy?: 'color' | 'colorTextAndDisabled';
  barrierId?: BarrierId;
}

/** Gilt die Barriere als behoben? Beim Alternativtext zählt nur die gute Beschreibung. */
export function isFixed(id: BarrierId, fixes: Fixes): boolean {
  if (id === 'alt') return ALT_CHOICES.some((c) => c.good && c.text === fixes.alt);
  return fixes[id] === true;
}

const SIZES: SizeOption[] = [40, 41, 42, 43, 44, 45].map((size) => ({ size, available: size !== 42 && size !== 45 }));

/** Die Seite im Stand der Behebungen. */
export function buildPage(fixes: Fixes): PageNode[] {
  const fv = fixes.focus === true; // Fokusring sichtbar
  const cartFixed = fixes.divButton === true;
  const headingFixed = fixes.heading === true;
  const sizeChartFixed = fixes.linkText === true;
  return [
    { id: 'logo', kind: 'logoLink', text: 'Nordlicht Sport', element: 'a', focusable: true, focusVisible: fv },
    { id: 'title', kind: 'heading', text: PRODUCT.title, level: 1, element: 'h1', focusable: false, focusVisible: false },
    {
      id: 'image', kind: 'image', text: '', element: 'img', focusable: false, focusVisible: false,
      alt: fixes.alt, barrierId: 'alt',
    },
    {
      id: 'price', kind: 'price', text: `${PRODUCT.price.toFixed(2).replace('.', ',')} €`,
      element: 'p', focusable: false, focusVisible: false,
    },
    {
      id: 'note', kind: 'note', text: 'inkl. MwSt., zzgl. Versand', element: 'p', focusable: false, focusVisible: false,
      color: fixes.contrast ? '#595959' : '#9a9a9a', background: '#ffffff', barrierId: 'contrast',
    },
    {
      id: 'sizes', kind: 'sizes', text: 'Größe', element: 'fieldset', focusable: true, focusVisible: fv,
      sizes: SIZES, stateShownBy: fixes.colorOnly ? 'colorTextAndDisabled' : 'color', barrierId: 'colorOnly',
    },
    {
      id: 'quantity', kind: 'quantity', text: '', element: 'input', focusable: true, focusVisible: fv,
      placeholder: 'Menge', label: fixes.label ? 'Menge' : undefined, barrierId: 'label',
    },
    {
      id: 'cart', kind: 'cartButton', text: 'In den Warenkorb', element: cartFixed ? 'button' : 'div',
      focusable: cartFixed, focusVisible: cartFixed && fv, barrierId: 'divButton',
    },
    {
      id: 'details', kind: 'heading', text: 'Produktdetails', level: headingFixed ? 2 : 4,
      element: headingFixed ? 'h2' : 'h4', focusable: false, focusVisible: false, barrierId: 'heading',
    },
    {
      id: 'description', kind: 'paragraph', text: 'Leichter Laufschuh mit weicher Dämpfung für die Straße.',
      element: 'p', focusable: false, focusVisible: false,
    },
    { id: 'sizeChartLabel', kind: 'paragraph', text: 'Größentabelle:', element: 'p', focusable: false, focusVisible: false },
    {
      id: 'sizeChart', kind: 'link', text: sizeChartFixed ? 'Größentabelle ansehen' : 'hier', element: 'a',
      focusable: true, focusVisible: fv, barrierId: 'linkText',
    },
  ];
}

export interface Announcement {
  nodeId: string;
  text: string;
}

/** Zeilen eines vereinfachten Screenreaders; Größen je eine Zeile mit der id `${nodeId}-${size}`. */
export function announce(page: PageNode[]): Announcement[] {
  const out: Announcement[] = [];
  for (const n of page) {
    switch (n.kind) {
      case 'logoLink':
      case 'link':
        out.push({ nodeId: n.id, text: `Link, ${n.text}` });
        break;
      case 'heading':
        out.push({ nodeId: n.id, text: `Überschrift Ebene ${n.level}, ${n.text}` });
        break;
      case 'image':
        out.push({ nodeId: n.id, text: n.alt ? `Bild, ${n.alt}` : 'Bild, ohne Beschreibung' });
        break;
      case 'quantity':
        out.push({ nodeId: n.id, text: n.label ? `Eingabefeld, ${n.label}` : 'Eingabefeld, ohne Beschriftung' });
        break;
      case 'cartButton':
        // Ein div hat keine Rolle: Es wird nur der Text gelesen.
        out.push({ nodeId: n.id, text: n.element === 'button' ? `Knopf, ${n.text}` : n.text });
        break;
      case 'sizes':
        for (const s of n.sizes ?? []) {
          const sold = !s.available && n.stateShownBy === 'colorTextAndDisabled';
          out.push({ nodeId: `${n.id}-${s.size}`, text: sold ? `Knopf, ${s.size}, ausverkauft, nicht verfügbar` : `Knopf, ${s.size}` });
        }
        break;
      default:
        out.push({ nodeId: n.id, text: n.text });
    }
  }
  return out;
}

/** Überschriftengliederung; `skipped` = Sprung um mehr als eine Ebene nach unten. */
export function headingOutline(page: PageNode[]): { nodeId: string; level: number; text: string; skipped: boolean }[] {
  let prev = 0;
  const out: { nodeId: string; level: number; text: string; skipped: boolean }[] = [];
  for (const n of page) {
    if (n.kind !== 'heading' || n.level === undefined) continue;
    out.push({ nodeId: n.id, level: n.level, text: n.text, skipped: n.level - prev > 1 });
    prev = n.level;
  }
  return out;
}

/** Tab-Reihenfolge: nur Fokussierbares; jede Größe ist ein eigener Stopp. */
export function tabOrder(page: PageNode[]): string[] {
  const out: string[] = [];
  for (const n of page) {
    if (!n.focusable) continue;
    if (n.kind === 'sizes') for (const s of n.sizes ?? []) out.push(`${n.id}-${s.size}`);
    else out.push(n.id);
  }
  return out;
}

const VAGUE_LINKS = ['hier', 'mehr', 'klicken sie hier', 'weiter'];

/** Regelbasierte Prüfung wie ein automatischer Prüfer: liest nur Eigenschaften, nie `barrierId`. */
export function audit(page: PageNode[]): { barrierId: BarrierId; message: string }[] {
  const found: { barrierId: BarrierId; message: string }[] = [];
  for (const n of page) {
    if (n.color && n.background) {
      const ratio = contrastRatio(n.color, n.background);
      if (rateContrast(ratio, false) === 'fail') {
        found.push({ barrierId: 'contrast', message: `Kontrast ${ratio.toFixed(2).replace('.', ',')} : 1 ist für normalen Text zu niedrig (mindestens 4,5 : 1).` });
      }
    }
    if (n.element === 'img' && n.alt === undefined) {
      found.push({ barrierId: 'alt', message: 'Bild ohne Alternativtext.' });
    }
    if (n.element === 'input' && !n.label) {
      found.push({ barrierId: 'label', message: 'Eingabefeld ohne Beschriftung.' });
    }
    if (n.kind === 'link' && VAGUE_LINKS.includes(n.text.trim().toLowerCase())) {
      found.push({ barrierId: 'linkText', message: `Linktext „${n.text}“ sagt nicht, wohin der Link führt.` });
    }
  }
  for (const h of headingOutline(page)) {
    if (h.skipped) found.push({ barrierId: 'heading', message: `Überschriftensprung zu Ebene ${h.level}: „${h.text}“.` });
  }
  const order = BARRIERS.map((b) => b.id);
  return found.sort((a, b) => order.indexOf(a.barrierId) - order.indexOf(b.barrierId));
}
