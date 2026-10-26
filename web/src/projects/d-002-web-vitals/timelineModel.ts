import { clampTime, type LoadResult, type VitalsFixes } from '../../experience/vitals';

// Reine Logik der Zeitleiste: welche Zeit gezeigt wird und wie die Strichskizze der Seite zu einem
// Zeitpunkt aussieht. Die Komponente zeichnet nur.

/** Gespeicherte Zeit: eine Zahl oder „am Ende“, das mit einem neuen Ende mitwandert. */
export type TimelineTime = number | 'end';

/**
 * Die gezeigte Zeit. Ändert sich `end` (Gegenmittel umgeschaltet, auch beim Abspielen), wird die
 * Zeit über clampTime auf [0, end] begrenzt: nie hinter dem Ende, nie NaN (Review Focus 3).
 */
export function shownTime(time: TimelineTime, end: number): number {
  return time === 'end' ? end : clampTime(time, end);
}

/** Ein Schritt beim Abspielen; am Ende bleibt die Zeit am Ende stehen. */
export function advance(time: TimelineTime, end: number, deltaS: number): { time: TimelineTime; done: boolean } {
  const next = shownTime(time, end) + Math.max(0, deltaS);
  return next >= end ? { time: 'end', done: true } : { time: next, done: false };
}

export interface PageBox {
  id: 'header' | 'banner' | 'heading' | 'image' | 'price' | 'button';
  y: number;
  height: number;
  /** schon gezeichnet (sonst nur reservierter Platz bzw. unsichtbar) */
  drawn: boolean;
  /** reservierter Platz ohne Inhalt, gestrichelt */
  reserved: boolean;
}

export interface PageState {
  painted: boolean;
  /** Webschrift geladen (vorher Ersatzschrift) */
  fontLoaded: boolean;
  headingLines: number;
  boxes: PageBox[];
  height: number;
}

// Maße der Skizze in SVG-Einheiten.
export const PAGE = { top: 8, gap: 5, header: 12, banner: 16, line: 8, image: 54, price: 7, button: 14 } as const;

const eventTime = (load: LoadResult, type: 'firstPaint' | 'lcp' | 'bannerInserted') => {
  const e = load.events.find((x) => x.type === type);
  return e && 'time' in e ? e.time : Infinity;
};

/** Zeitpunkt, an dem die Webschrift fertig geladen ist. */
export function fontTime(load: LoadResult): number {
  return load.resources.find((r) => r.id === 'font')?.end ?? Infinity;
}

/**
 * Die Seite zum Zeitpunkt `t`. Ohne Gegenmittel schieben drei Dinge den Inhalt: die Webschrift
 * (die Überschrift bricht in zwei Zeilen um), das eingefügte Banner und das Bild ohne Maße.
 */
export function pageAt(load: LoadResult, fixes: VitalsFixes, t: number): PageState {
  const painted = t >= eventTime(load, 'firstPaint');
  const fontLoaded = t >= fontTime(load);
  const bannerIn = t >= eventTime(load, 'bannerInserted');
  const imageIn = t >= eventTime(load, 'lcp');
  // Die Ersatzschrift ist schmaler: Die Überschrift passt in eine Zeile, bis die Webschrift kommt.
  // Mit passender Ersatzschrift hat sie von Anfang an dieselben zwei Zeilen.
  const headingLines = fixes.fontFallback || fontLoaded ? 2 : 1;

  const boxes: PageBox[] = [];
  let y = PAGE.top;
  const push = (id: PageBox['id'], height: number, drawn: boolean, reserved: boolean) => {
    boxes.push({ id, y, height, drawn, reserved });
    if (height > 0) y += height + PAGE.gap;
  };
  push('header', PAGE.header, painted, false);
  const bannerHeight = bannerIn || fixes.reserveSpace ? PAGE.banner : 0;
  push('banner', painted ? bannerHeight : 0, painted && bannerIn, painted && !bannerIn && Boolean(fixes.reserveSpace));
  push('heading', headingLines * PAGE.line, painted, false);
  const imageHeight = imageIn || fixes.dimensions ? PAGE.image : 0;
  push('image', painted ? imageHeight : 0, painted && imageIn, painted && !imageIn && Boolean(fixes.dimensions));
  push('price', PAGE.price, painted, false);
  push('button', PAGE.button, painted, false);
  return { painted, fontLoaded, headingLines, boxes, height: y };
}

/** Höhe der Skizze, wenn alles da ist: Sie ändert sich nicht über die Zeit. */
export function fullPageHeight(): number {
  return PAGE.top + PAGE.header + PAGE.banner + 2 * PAGE.line + PAGE.image + PAGE.price + PAGE.button + 6 * PAGE.gap;
}
