import {
  FIXES,
  REFERENCE,
  THRESHOLDS,
  fieldResults,
  percentile75,
  rateMetric,
  simulateLoad,
  type FixId,
  type LoadResult,
  type MetricName,
  type Rating,
  type Shift,
  type VitalsFixes,
} from '../../experience/vitals';

// Erkenntnisse der Demo als reine Logik. Alle Sätze rechnen aus demselben Modell wie Kacheln,
// Zeitleiste und Feldreihe; insights.test.ts prüft sie über alle 128 Schalterstände.

export type VitalsInsight = 'clsWorseByLcpFix' | 'fixWithoutEffect' | 'allGood';

export const METRICS: MetricName[] = ['lcp', 'cls', 'inp'];

export const METRIC_NAME: Record<MetricName, string> = { lcp: 'LCP', cls: 'CLS', inp: 'INP' };

export const RATING_WORD: Record<Rating, string> = { good: 'gut', needsImprovement: 'verbessern', poor: 'schlecht' };

export const SHIFT_SOURCE: Record<Shift['source'], string> = { font: 'Schrift', banner: 'Banner', image: 'Bild' };

const NUMBER = new Intl.NumberFormat('de-DE', { maximumFractionDigits: 3 });

/** Zahl deutsch, höchstens drei Stellen nach dem Komma, ohne Nullen am Ende. */
export function formatNumber(value: number): string {
  return NUMBER.format(value);
}

/** Wert einer Kennzahl mit Einheit: „4,53 s“, „0,17“, „576 ms“. */
export function formatMetric(name: MetricName, value: number): string {
  const unit = THRESHOLDS[name].unit;
  return unit ? `${formatNumber(value)} ${unit}` : formatNumber(value);
}

/** „gut bis 2,5 s · schlecht über 4 s“ aus THRESHOLDS. */
export function thresholdText(name: MetricName): string {
  const t = THRESHOLDS[name];
  return `gut bis ${formatMetric(name, t.good)} · schlecht über ${formatMetric(name, t.poor)}`;
}

const result = (fixes: VitalsFixes): LoadResult => simulateLoad(fixes, REFERENCE);
const START = (): LoadResult => result({});

/** Die Verschiebungen eines Ladevorgangs aus den Ereignissen. */
export function shiftsOf(load: LoadResult): Shift[] {
  return load.events.flatMap((e) => (e.type === 'shift' ? [{ time: e.time, value: e.value, source: e.source }] : []));
}

/**
 * Die Verschiebungen im größten Sitzungsfenster, nach denselben Regeln wie clsFromShifts:
 * neues Fenster bei Lücke ab 1 s oder wenn das Fenster länger als 5 s würde.
 */
export function largestWindow(shifts: Shift[]): Shift[] {
  const sorted = [...shifts].sort((a, b) => a.time - b.time);
  let best: Shift[] = [];
  let bestSum = 0;
  let current: Shift[] = [];
  let sum = 0;
  sorted.forEach((s, i) => {
    const start = current[0]?.time ?? s.time;
    const last = current[current.length - 1]?.time ?? s.time;
    if (i === 0 || s.time - last >= 1 || s.time - start > 5) {
      current = [];
      sum = 0;
    }
    current.push(s);
    sum += s.value;
    if (sum > bestSum) {
      bestSum = sum;
      best = [...current];
    }
  });
  return best;
}

/** „Schrift 0,05 + Banner 0,12“ */
export function windowText(shifts: Shift[]): string {
  return shifts.map((s) => `${SHIFT_SOURCE[s.source]} ${formatNumber(s.value)}`).join(' + ');
}

/** Ändert das Gegenmittel allein (gegen den Start) seine Zielkennzahl nicht? */
export function withoutEffectAlone(id: FixId): boolean {
  const target = FIXES.find((f) => f.id === id)!.targets;
  return result({ [id]: true })[target] === START()[target];
}

/**
 * Ohne Wirkung im gezeigten Stand: eingeschaltet, allein gegen den Start ohne Wirkung und auch im
 * gezeigten Stand mit und ohne es dieselbe Zielkennzahl. Die zweite Bedingung bindet den Kasten an
 * die angezeigten Werte (mit allen Gegenmitteln zählt „Bildmaße angeben“ sehr wohl).
 */
export function withoutEffectNow(id: FixId, fixes: VitalsFixes): boolean {
  if (!fixes[id] || !withoutEffectAlone(id)) return false;
  const target = FIXES.find((f) => f.id === id)!.targets;
  return result({ ...fixes, [id]: false })[target] === result(fixes)[target];
}

/** Erkenntnisse zum Stand `fixes`, verglichen mit dem Start {} auf dem Referenzprofil. */
export function vitalsInsights(fixes: VitalsFixes): VitalsInsight[] {
  const now = result(fixes);
  const start = START();
  const out: VitalsInsight[] = [];
  if (now.cls > start.cls) out.push('clsWorseByLcpFix');
  if (FIXES.some((f) => withoutEffectNow(f.id, fixes))) out.push('fixWithoutEffect');
  if (METRICS.every((m) => rateMetric(m, now[m]) === 'good')) out.push('allGood');
  return out;
}

export interface InsightContent {
  title: string;
  text: string;
}

const quote = (label: string) => `„${label}“`;
const listLabels = (labels: string[]) =>
  labels.length <= 1 ? (labels[0] ?? '') : `${labels.slice(0, -1).join(', ')} und ${labels[labels.length - 1]}`;

/** Titel und Text eines Erkenntnis-Kastens, gerechnet aus dem gezeigten Stand. */
export function insightContent(insight: VitalsInsight, fixes: VitalsFixes): InsightContent {
  const now = result(fixes);
  const start = START();

  if (insight === 'clsWorseByLcpFix') {
    const lcpFixes = FIXES.filter((f) => f.targets === 'lcp' && fixes[f.id]).map((f) => quote(f.label));
    return {
      title: 'Ein LCP-Gegenmittel macht den CLS schlechter',
      text:
        `Der CLS liegt jetzt bei ${formatMetric('cls', now.cls)}, im Start bei ${formatMetric('cls', start.cls)}. ` +
        `Eingeschaltet ${lcpFixes.length === 1 ? 'ist' : 'sind'} ${listLabels(lcpFixes)}: Das Bild erscheint früher ` +
        `(LCP ${formatMetric('lcp', now.lcp)} statt ${formatMetric('lcp', start.lcp)}). ` +
        `Damit rücken Verschiebungen zusammen, die vorher getrennt lagen. Im größten Sitzungsfenster stehen jetzt ` +
        `${windowText(largestWindow(shiftsOf(now)))}, und gezählt wird die Summe.`,
    };
  }

  if (insight === 'fixWithoutEffect') {
    const parts = FIXES.filter((f) => withoutEffectNow(f.id, fixes)).map((f) => {
      const alone = result({ [f.id]: true });
      const name = METRIC_NAME[f.targets];
      let text =
        `${quote(f.label)} ändert den ${name} nicht: Start ${formatMetric(f.targets, start[f.targets])}, ` +
        `nur mit diesem Gegenmittel ${formatMetric(f.targets, alone[f.targets])}, in deinem Stand mit und ohne es ` +
        `${formatMetric(f.targets, now[f.targets])}.`;
      if (f.targets === 'cls') {
        text +=
          ` Seine Verschiebung fällt zwar weg, aber das größte Sitzungsfenster ist ein anderes: ` +
          `${windowText(largestWindow(shiftsOf(now)))}.`;
      }
      return text;
    });
    return { title: 'Ein Gegenmittel ohne Wirkung auf die Zahl', text: parts.join(' ') };
  }

  return {
    title: 'Alle drei gut, im Labor',
    text:
      `Auf dem Referenzprofil ${REFERENCE.label} sind LCP ${formatMetric('lcp', now.lcp)}, CLS ${formatMetric('cls', now.cls)} ` +
      `und INP ${formatMetric('inp', now.inp)} gut. Ob das für echte Besuche gilt, zeigt der Vergleich mit dem Feld weiter unten.`,
  };
}

export interface FieldMetric {
  metric: MetricName;
  values: number[];
  p75: number;
  reference: number;
  rating: Rating;
  referenceRating: Rating;
}

/** Die 20 Feldbesuche je Kennzahl mit 75. Perzentil und dem Wert des Referenzprofils. */
export function fieldMetrics(fixes: VitalsFixes): FieldMetric[] {
  const visits = fieldResults(fixes);
  const ref = result(fixes);
  return METRICS.map((metric) => {
    const values = visits.map((v) => v[metric]);
    const p75 = percentile75(values);
    return { metric, values, p75, reference: ref[metric], rating: rateMetric(metric, p75), referenceRating: rateMetric(metric, ref[metric]) };
  });
}

const compare = (reference: number, p75: number) =>
  reference < p75 ? 'besser als' : reference > p75 ? 'schlechter als' : 'gleich wie';

/** Text des Erkenntnis-Kastens Labor gegen Feld, gerechnet aus fieldMetrics. */
export function fieldInsightText(fixes: VitalsFixes): string {
  const rows = fieldMetrics(fixes).map(
    (m) =>
      `${METRIC_NAME[m.metric]} im Labor ${formatMetric(m.metric, m.reference)} (${RATING_WORD[m.referenceRating]}), ` +
      `im Feld ${formatMetric(m.metric, m.p75)} (${RATING_WORD[m.rating]}), das Labor also ${compare(m.reference, m.p75)} das Feld`,
  );
  return (
    `Bewertet wird nicht dein schneller Rechner, sondern das 75. Perzentil echter Besuche: Mindestens drei von vier Besuchen sind ` +
    `so gut oder besser. Hier: ${rows.join('; ')}.`
  );
}
