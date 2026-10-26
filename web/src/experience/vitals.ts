// Ladesimulator für D-002: ein stark vereinfachtes Modell, wie eine Seite lädt
// und wann sie sich bewegt. Reine Logik: Zeichnen übernimmt die Seite, geprüft wird hier.

export type MetricName = 'lcp' | 'cls' | 'inp';
export type Rating = 'good' | 'needsImprovement' | 'poor';

/** Web-Vitals-Grenzen (Referenz): bis `good` gut, bis `poor` verbesserungswürdig, darüber schlecht. */
export const THRESHOLDS: Record<MetricName, { good: number; poor: number; unit: 's' | '' | 'ms' }> = {
  lcp: { good: 2.5, poor: 4, unit: 's' },
  cls: { good: 0.1, poor: 0.25, unit: '' },
  inp: { good: 200, poor: 500, unit: 'ms' },
};

/** Der Grenzwert selbst gehört zur besseren Stufe. */
export function rateMetric(name: MetricName, value: number): Rating {
  const t = THRESHOLDS[name];
  if (value <= t.good) return 'good';
  if (value <= t.poor) return 'needsImprovement';
  return 'poor';
}

export type FixId = 'criticalCss' | 'preload' | 'compress' | 'fontFallback' | 'reserveSpace' | 'dimensions' | 'splitTask';

export const FIXES: { id: FixId; label: string; targets: MetricName }[] = [
  { id: 'criticalCss', label: 'Kritisches CSS zuerst', targets: 'lcp' },
  { id: 'preload', label: 'Produktbild vorladen', targets: 'lcp' },
  { id: 'compress', label: 'Produktbild komprimieren', targets: 'lcp' },
  { id: 'fontFallback', label: 'Passende Ersatzschrift', targets: 'cls' },
  { id: 'reserveSpace', label: 'Platz für das Banner reservieren', targets: 'cls' },
  { id: 'dimensions', label: 'Bildmaße angeben', targets: 'cls' },
  { id: 'splitTask', label: 'Aufgabe aufteilen', targets: 'inp' },
];

/** Gegenmittel; was fehlt, gilt als nicht angewendet. */
export type VitalsFixes = Partial<Record<FixId, boolean>>;

export interface Profile {
  id: string;
  label: string;
  bandwidthKBps: number;
  rttS: number;
  cpu: number; // Faktor auf die Rechenzeit, 1 = Referenz
}

export const REFERENCE: Profile = { id: 'phone4g', label: 'Handy, 4G', bandwidthKBps: 625, rttS: 0.15, cpu: 1 };

export const PROFILES: Profile[] = [
  { id: 'fiber', label: 'Desktop, Glasfaser', bandwidthKBps: 6250, rttS: 0.02, cpu: 0.5 },
  { id: 'cable', label: 'Desktop, Kabel', bandwidthKBps: 3125, rttS: 0.04, cpu: 0.7 },
  { id: 'wifi', label: 'Laptop, WLAN', bandwidthKBps: 1250, rttS: 0.06, cpu: 1 },
  REFERENCE,
  { id: 'phone4gSlow', label: 'Handy, mäßiges 4G', bandwidthKBps: 400, rttS: 0.2, cpu: 1.5 },
  { id: 'oldPhone', label: 'altes Handy, 4G', bandwidthKBps: 625, rttS: 0.15, cpu: 2 },
  { id: 'weak', label: 'Handy, schwaches Netz', bandwidthKBps: 250, rttS: 0.25, cpu: 2 },
  { id: 'edge', label: 'altes Handy, 3G', bandwidthKBps: 125, rttS: 0.4, cpu: 3 },
];

/** 20 feste Besuche (Profil-IDs), gemischt: 2 + 2 + 3 + 4 + 5 + 2 + 1 + 1. */
export const FIELD_VISITS: string[] = [
  'phone4g', 'fiber', 'phone4gSlow', 'wifi', 'phone4g',
  'phone4gSlow', 'cable', 'oldPhone', 'phone4gSlow', 'wifi',
  'phone4g', 'weak', 'phone4gSlow', 'cable', 'wifi',
  'phone4g', 'phone4gSlow', 'edge', 'fiber', 'oldPhone',
];

export interface Shift {
  time: number;
  value: number;
  source: 'font' | 'banner' | 'image';
}

export interface ResourceTiming {
  id: 'html' | 'css' | 'font' | 'script' | 'image';
  label: string;
  sizeKB: number;
  start: number;
  end: number;
  blocking: boolean;
}

export type TimelineEvent =
  | { type: 'firstPaint'; time: number }
  | { type: 'lcp'; time: number }
  | { type: 'shift'; time: number; value: number; source: Shift['source'] }
  | { type: 'longTask'; start: number; end: number }
  | { type: 'bannerInserted'; time: number };

export interface LoadResult {
  lcp: number;
  cls: number;
  inp: number;
  resources: ResourceTiming[];
  events: TimelineEvent[];
  end: number;
}

const round3 = (x: number) => Math.round(x * 1000) / 1000;

/** CLS nach Sitzungsfenstern; das größte Fenster zählt. */
export function clsFromShifts(shifts: { time: number; value: number }[]): number {
  const sorted = [...shifts].sort((a, b) => a.time - b.time);
  let best = 0;
  let sum = 0;
  let start = 0;
  let last = 0;
  sorted.forEach((s, i) => {
    // Neues Fenster bei Lücke ab 1 s oder wenn das Fenster länger als 5 s würde.
    if (i === 0 || s.time - last >= 1 || s.time - start > 5) {
      sum = 0;
      start = s.time;
    }
    sum += s.value;
    last = s.time;
    best = Math.max(best, sum);
  });
  return round3(best);
}

/** 75. Perzentil nach Rangmethode: sortiert, Stelle ⌈0,75 · n⌉ (1-basiert); leer ergibt 0. */
export function percentile75(values: number[]): number {
  if (values.length === 0) return 0;
  const sorted = [...values].sort((a, b) => a - b);
  return sorted[Math.ceil(0.75 * sorted.length) - 1]!;
}

export function simulateLoad(fixes: VitalsFixes, profile: Profile): LoadResult {
  // Jede Datei hat die volle Leitung: Ende = Start + RTT + Größe / Bandbreite.
  const fetch = (start: number, sizeKB: number) => start + profile.rttS + sizeKB / profile.bandwidthKBps;

  const htmlEnd = fetch(0, 30);
  const cssKB = fixes.criticalCss ? 15 : 120;
  const cssEnd = fetch(htmlEnd, cssKB);
  const firstPaint = cssEnd; // das CSS blockiert das Zeichnen
  const fontEnd = fetch(cssEnd, 80);
  const scriptEnd = fetch(htmlEnd, 400);
  const taskEnd = scriptEnd + 0.35 * profile.cpu;
  const imageKB = fixes.compress ? 300 : 2400;
  const imageStart = fixes.preload ? htmlEnd : cssEnd;
  const imageEnd = fetch(imageStart, imageKB);
  const imagePainted = Math.max(imageEnd, firstPaint);

  const shifts: Shift[] = [];
  if (!fixes.fontFallback) shifts.push({ time: fontEnd, value: 0.05, source: 'font' });
  if (!fixes.reserveSpace) shifts.push({ time: taskEnd, value: 0.12, source: 'banner' });
  if (!fixes.dimensions) shifts.push({ time: imagePainted, value: 0.15, source: 'image' });

  const resources: ResourceTiming[] = [
    { id: 'html', label: 'HTML', sizeKB: 30, start: 0, end: htmlEnd, blocking: false },
    { id: 'css', label: 'CSS', sizeKB: cssKB, start: htmlEnd, end: cssEnd, blocking: true },
    { id: 'font', label: 'Schrift', sizeKB: 80, start: cssEnd, end: fontEnd, blocking: false },
    { id: 'script', label: 'Script', sizeKB: 400, start: htmlEnd, end: scriptEnd, blocking: false },
    { id: 'image', label: 'Produktbild', sizeKB: imageKB, start: imageStart, end: imageEnd, blocking: false },
  ];

  const events: TimelineEvent[] = [
    { type: 'firstPaint', time: round3(firstPaint) },
    { type: 'longTask', start: round3(scriptEnd), end: round3(taskEnd) },
    { type: 'bannerInserted', time: round3(taskEnd) },
    { type: 'lcp', time: round3(imagePainted) },
    ...shifts.map((s) => ({ type: 'shift' as const, time: round3(s.time), value: s.value, source: s.source })),
  ];
  const timeOf = (e: TimelineEvent) => (e.type === 'longTask' ? e.start : e.time);
  events.sort((a, b) => timeOf(a) - timeOf(b));

  const inpMs = ((fixes.splitTask ? 0.04 : 0.56) * profile.cpu + 0.016) * 1000;

  return {
    lcp: round3(imagePainted),
    cls: clsFromShifts(shifts),
    inp: Math.round(inpMs),
    resources: resources.map((r) => ({ ...r, start: round3(r.start), end: round3(r.end) })),
    events,
    end: round3(Math.max(imagePainted, taskEnd, fontEnd) + 0.5),
  };
}

/** Die 20 Feldbesuche mit ihren Messwerten. */
export function fieldResults(fixes: VitalsFixes): { visit: number; profile: Profile; lcp: number; cls: number; inp: number }[] {
  return FIELD_VISITS.map((id, visit) => {
    const profile = PROFILES.find((p) => p.id === id) ?? REFERENCE;
    const { lcp, cls, inp } = simulateLoad(fixes, profile);
    return { visit, profile, lcp, cls, inp };
  });
}

/** Zeit auf die Achse [0, end] begrenzen. */
export function clampTime(time: number, end: number): number {
  return Math.min(Math.max(time, 0), end);
}
