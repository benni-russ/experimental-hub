import { describe, expect, it } from 'vitest';
import { CATALOG } from '../personalization/catalog';
import {
  ALT_CHOICES,
  BARRIERS,
  PRODUCT,
  announce,
  audit,
  buildPage,
  headingOutline,
  isFixed,
  tabOrder,
  type BarrierId,
  type Fixes,
  type PageNode,
} from './productPage';

const AUTO: BarrierId[] = ['contrast', 'alt', 'label', 'heading', 'linkText'];
const GOOD_ALT = 'Laufschuh Wolkenläufer Pro in Blau, seitlich';

/** Behebung einer einzelnen Barriere (bei `alt` der gute Text). */
const fix = (id: BarrierId): Fixes => (id === 'alt' ? { alt: GOOD_ALT } : { [id]: true });
const ALL: Fixes = { ...Object.fromEntries(BARRIERS.map((b) => [b.id, true])), alt: GOOD_ALT } as Fixes;
const ids = (page: PageNode[] = buildPage({})) => audit(page).map((a) => a.barrierId).sort();

describe('Barrieren und Produkt', () => {
  it('hat genau 8 Barrieren, 5 davon automatisch erkennbar', () => {
    expect(BARRIERS).toHaveLength(8);
    expect(BARRIERS.filter((b) => b.automatic)).toHaveLength(5);
  });
  it('jede elementId gibt es auf der Seite', () => {
    const nodeIds = buildPage({}).map((n) => n.id);
    for (const b of BARRIERS) expect(nodeIds).toContain(b.elementId);
  });
  it('Produkt stammt aus dem Katalog', () => {
    const p01 = CATALOG.find((p) => p.id === 'P01')!;
    expect(PRODUCT).toBe(p01);
    const page = buildPage({});
    expect(page.find((n) => n.kind === 'heading')!.text).toBe(p01.title);
    expect(page.find((n) => n.kind === 'price')!.text).toBe('139,90 €');
  });
  it('Alternativtexte: nur einer ist gut', () => {
    expect(ALT_CHOICES.map((c) => c.text)).toEqual(['Bild', 'IMG_2041.jpg', GOOD_ALT]);
    expect(ALT_CHOICES.filter((c) => c.good).map((c) => c.text)).toEqual([GOOD_ALT]);
  });
});

describe('audit', () => {
  it('findet im Startstand genau die 5 automatischen Barrieren', () => {
    expect(ids()).toEqual([...AUTO].sort());
  });
  it('jede einzeln behobene Barriere verschwindet, sonst bleibt alles gleich', () => {
    for (const b of BARRIERS) {
      const expected = AUTO.filter((a) => a !== b.id).sort();
      expect(ids(buildPage(fix(b.id)))).toEqual(expected);
    }
  });
  it('alle Behebungen ergeben []', () => {
    expect(audit(buildPage(ALL))).toEqual([]);
  });
  it('arbeitet regelbasiert, nicht über barrierId', () => {
    const page = buildPage({}).map((n) => ({ ...n, barrierId: undefined }));
    expect(ids(page)).toEqual([...AUTO].sort());
  });
  it('Alternativtext-Falle: jede Wahl beruhigt audit, nur die gute gilt als behoben', () => {
    for (const c of ALT_CHOICES) {
      const fixes: Fixes = { alt: c.text };
      expect(ids(buildPage(fixes))).not.toContain('alt');
      expect(isFixed('alt', fixes)).toBe(c.good);
    }
    expect(isFixed('alt', {})).toBe(false);
  });
  it('mit allen Behebungen ist audit für jede Alternativtext-Wahl leer', () => {
    for (const c of ALT_CHOICES) expect(audit(buildPage({ ...ALL, alt: c.text }))).toEqual([]);
  });
  describe('Regeln an synthetischen Knoten', () => {
    const base: PageNode = { id: 'x', kind: 'paragraph', text: '', element: 'p', focusable: false, focusVisible: false };
    const link = (text: string): PageNode => ({ ...base, kind: 'link', element: 'a', text, focusable: true });
    it('unklare Linktexte, unabhängig von Groß-/Kleinschreibung und Leerraum', () => {
      for (const t of ['mehr', 'Klicken Sie hier', ' Weiter ', 'HIER']) {
        expect(audit([link(t)]).map((a) => a.barrierId)).toEqual(['linkText']);
      }
      expect(audit([link('Größentabelle ansehen')])).toEqual([]);
    });
    it('Kontrast: 4,5 und darüber besteht, darunter nicht', () => {
      const t = (color: string): PageNode => ({ ...base, text: 'a', color, background: '#ffffff' });
      expect(audit([t('#767676')])).toEqual([]); // 4,54 : 1
      expect(audit([t('#777777')]).map((a) => a.barrierId)).toEqual(['contrast']); // 4,48 : 1
    });
    it('leerer alt-Text gilt als vorhanden (dekoratives Bild)', () => {
      const img: PageNode = { ...base, kind: 'image', element: 'img', alt: '' };
      expect(audit([img])).toEqual([]);
      expect(audit([{ ...img, alt: undefined }]).map((a) => a.barrierId)).toEqual(['alt']);
    });
  });
  it('isFixed für die übrigen Barrieren', () => {
    expect(isFixed('contrast', {})).toBe(false);
    expect(isFixed('contrast', { contrast: true })).toBe(true);
  });
});

describe('tabOrder', () => {
  it('Warenkorb-div ist nicht erreichbar, der echte Knopf schon', () => {
    expect(tabOrder(buildPage({}))).not.toContain('cart');
    expect(tabOrder(buildPage({ divButton: true }))).toContain('cart');
  });
  it('Größen sind je ein eigener Stopp', () => {
    const order = tabOrder(buildPage({}));
    expect(order).toContain('sizes-40');
    expect(order).toContain('sizes-45');
    expect(order).not.toContain('sizes');
  });
  it('ausverkaufte Größen bleiben Stopps, bis sie deaktiviert werden', () => {
    expect(tabOrder(buildPage({}))).toContain('sizes-42');
    const fixed = tabOrder(buildPage({ colorOnly: true }));
    expect(fixed).not.toContain('sizes-42');
    expect(fixed).not.toContain('sizes-45');
    expect(fixed).toContain('sizes-40');
  });
});

describe('headingOutline', () => {
  it('Start: h1 dann h4 mit Sprung', () => {
    const o = headingOutline(buildPage({}));
    expect(o.map((h) => h.level)).toEqual([1, 4]);
    expect(o.map((h) => h.skipped)).toEqual([false, true]);
  });
  it('nach der Behebung kein Sprung', () => {
    const o = headingOutline(buildPage({ heading: true }));
    expect(o.map((h) => h.level)).toEqual([1, 2]);
    expect(o.some((h) => h.skipped)).toBe(false);
  });
});

describe('announce', () => {
  const texts = (f: Fixes) => announce(buildPage(f)).map((a) => a.text);
  it('Startstand', () => {
    const t = texts({});
    expect(t).toContain('Link, Nordlicht Sport');
    expect(t).toContain('Überschrift Ebene 1, Wolkenläufer Pro Laufschuh');
    expect(t).toContain('Bild, ohne Beschreibung');
    expect(t).toContain('Eingabefeld, ohne Beschriftung');
    expect(t).toContain('Link, hier');
    expect(t).toContain('In den Warenkorb');
    expect(t).not.toContain('Knopf, In den Warenkorb');
    expect(t).toContain('Knopf, 42');
    expect(t.some((x) => x.includes('ausverkauft'))).toBe(false);
  });
  it('nach den Behebungen', () => {
    expect(texts({ alt: GOOD_ALT })).toContain(`Bild, ${GOOD_ALT}`);
    expect(texts({ label: true })).toContain('Eingabefeld, Menge');
    expect(texts({ divButton: true })).toContain('Knopf, In den Warenkorb');
    expect(texts({ linkText: true })).toContain('Link, Größentabelle ansehen');
  });
  it('ausverkaufte Größen werden nach colorOnly angesagt', () => {
    const t = texts({ colorOnly: true });
    expect(t).toContain('Knopf, 42, ausverkauft, nicht verfügbar');
    expect(t).toContain('Knopf, 45, ausverkauft, nicht verfügbar');
    expect(t).toContain('Knopf, 40');
  });
});

describe('Behebungen im Knotenmodell', () => {
  const get = (f: Fixes, id: string) => buildPage(f).find((n) => n.id === id)!;
  it('Kontrast, Fokus, Zustandsanzeige', () => {
    expect(get({}, 'note').color).toBe('#9a9a9a');
    expect(get({ contrast: true }, 'note').color).toBe('#595959');
    expect(buildPage({}).filter((n) => n.focusable).every((n) => !n.focusVisible)).toBe(true);
    expect(buildPage({ focus: true }).filter((n) => n.focusable).every((n) => n.focusVisible)).toBe(true);
    expect(get({}, 'sizes').stateShownBy).toBe('color');
    expect(get({ colorOnly: true }, 'sizes').stateShownBy).toBe('colorTextAndDisabled');
  });
});
