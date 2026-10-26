import {
  ECONOMY,
  SCENARIOS,
  SOURCES,
  STEPS,
  applyLifts,
  compareKpis,
  computeFunnel,
  kpis,
  type Direction,
  type FunnelResult,
  type KpiChange,
  type Kpis,
  type ScenarioId,
  type SourceId,
} from '../../experience/funnel';
import { calculateSampleSize } from '../a-001-mde/sampleSize';

// Texte und Rechnungen der Demo als reine Logik. Jeder Satz rechnet aus demselben Modell wie Balken,
// Kennzahlen und Tabelle; insights.test.ts prüft sie über alle Szenarien und Reglerstände an den Rändern.

export type Lifts = [number, number, number, number];
export const NO_LIFTS: Lifts = [0, 0, 0, 0];

/** „Besuch → Produktseite“ usw., je Übergang. */
export const TRANSITIONS: string[] = STEPS.slice(1).map((s, i) => `${STEPS[i]!.label} → ${s.label}`);

export const DIRECTION_WORD: Record<Direction, string> = { up: 'steigt', down: 'fällt', same: 'gleich' };

const number = (digits: number) => new Intl.NumberFormat('de-DE', { maximumFractionDigits: digits });
const N0 = number(0);
const N1 = number(1);
const N2 = number(2);
const N3 = number(3);
const CENTS = new Intl.NumberFormat('de-DE', { minimumFractionDigits: 2, maximumFractionDigits: 2 });

/** Anzahl gerundet mit Tausenderpunkt: „20.000“, „520“. */
export const formatCount = (value: number) => N0.format(Math.round(value));
/** Anteil als Prozent, höchstens zwei Stellen: 0,02599 → „2,6 %“. */
export const formatPercent = (share: number) => `${N2.format(share * 100)} %`;
/** Anteil als Prozent mit höchstens einer Stelle: 0,5475 → „54,8 %“. */
export const formatPercent1 = (share: number) => `${N1.format(share * 100)} %`;
/** Euro ohne Cent: „47.825 €“. */
export const formatEuro = (value: number) => `${N0.format(Math.round(value))} €`;
/** Euro mit Cent: „2,39 €“. */
export const formatEuroCents = (value: number) => `${CENTS.format(value)} €`;
/** Faktor mit höchstens drei Stellen: „1,1“, „1,21“. */
export const formatFactor = (value: number) => N3.format(value);

/** Relative Änderung eines Reglers: „+10 %“, „−25 %“, „0 %“. */
export function formatLift(lift: number): string {
  const rounded = Math.round(lift * 1000) / 10;
  if (rounded === 0) return '0 %';
  return `${rounded > 0 ? '+' : '−'}${N1.format(Math.abs(rounded))} %`;
}

/** Änderung einer Kennzahl für die Tabelle; „neu“, wenn es vorher nichts gab. */
export function formatChange(change: KpiChange): string {
  if (change.before === 0 && change.direction !== 'same') return 'neu';
  return formatLift(change.change);
}

export interface KpiRow {
  key: keyof Kpis;
  label: string;
  /** mit Artikel, für Sätze: „die Conversion Rate“ */
  phrase: string;
  format: (value: number) => string;
}

export const KPI_ROWS: KpiRow[] = [
  { key: 'visits', label: 'Besuche', phrase: 'die Zahl der Besuche', format: formatCount },
  { key: 'orders', label: 'Käufe', phrase: 'die Zahl der Käufe', format: formatCount },
  { key: 'conversionRate', label: 'Conversion Rate', phrase: 'die Conversion Rate', format: formatPercent },
  { key: 'averageOrderValue', label: 'Bestellwert', phrase: 'der Bestellwert', format: formatEuroCents },
  { key: 'revenue', label: 'Umsatz', phrase: 'der Umsatz', format: formatEuro },
  { key: 'revenuePerVisit', label: 'Umsatz pro Besuch', phrase: 'der Umsatz pro Besuch', format: formatEuroCents },
  { key: 'grossProfit', label: 'Rohertrag', phrase: 'der Rohertrag', format: formatEuro },
];

const row = (key: keyof Kpis) => KPI_ROWS.find((r) => r.key === key)!;
const capitalize = (s: string) => s.charAt(0).toUpperCase() + s.slice(1);
const listWords = (words: string[]) =>
  words.length <= 1 ? (words[0] ?? '') : `${words.slice(0, -1).join(', ')} und ${words[words.length - 1]}`;

/** „die Conversion Rate steigt von 2,6 % auf 2,91 %“ */
export function changePhrase(key: keyof Kpis, change: KpiChange): string {
  const r = row(key);
  if (change.direction === 'same') return `${r.phrase} bleibt bei ${r.format(change.before)}`;
  return `${r.phrase} ${DIRECTION_WORD[change.direction]} von ${r.format(change.before)} auf ${r.format(change.after)}`;
}

export const BASE_FUNNEL: FunnelResult = computeFunnel(SOURCES);
export const BASE_KPIS: Kpis = kpis(BASE_FUNNEL, ECONOMY);

/** Ein Szenario gegen den Start: Funnel, Kennzahlen und Vergleich. */
export function runScenario(id: ScenarioId) {
  const scenario = SCENARIOS.find((s) => s.id === id)!;
  const { sources, economy } = scenario.apply(SOURCES, ECONOMY);
  const funnel = computeFunnel(sources);
  const after = kpis(funnel, economy);
  return { scenario, sources, economy, funnel, after, comparison: compareKpis(BASE_KPIS, after) };
}

const MONEY: (keyof Kpis)[] = ['revenue', 'grossProfit'];

/** Satz zum Widerspruch; das Wort „Widerspruch“ steht nur darin, wenn compareKpis einen meldet. */
function conflictSentence(comparison: ReturnType<typeof compareKpis>): string {
  const cr = comparison.changes.conversionRate.direction;
  const toward = { up: 'nach oben', down: 'nach unten', same: 'nirgendwohin' } as const;
  if (comparison.conflict) {
    const against = MONEY.filter((k) => {
      const d = comparison.changes[k].direction;
      return d !== 'same' && d !== cr;
    });
    const names = against.map((k) => row(k).phrase);
    const opposite = cr === 'up' ? 'down' : 'up';
    return (
      `Das ist ein Widerspruch: Die Conversion Rate zeigt ${toward[cr]}, ${listWords(names)} ` +
      `${names.length > 1 ? 'zeigen' : 'zeigt'} ${toward[opposite]}.`
    );
  }
  const all = (['conversionRate', ...MONEY] as (keyof Kpis)[]).map((k) => comparison.changes[k].direction);
  if (all.every((d) => d === all[0]) && all[0] !== 'same') {
    return `Hier zeigen Conversion Rate, Umsatz und Rohertrag alle ${toward[all[0]!]}: die Gegenprobe, bei der nichts gegeneinander läuft.`;
  }
  return 'Hier läuft keine Geldkennzahl gegen die Conversion Rate.';
}

/** Text des Erkenntnis-Kastens je Szenario, mit den Zahlen aus compareKpis. */
export function scenarioInsight(id: ScenarioId): string {
  const { economy, funnel, comparison } = runScenario(id);
  const c = comparison.changes;
  const end = conflictSentence(comparison);
  const invented = 'Die Effekte des Szenarios sind erfunden.';

  if (id === 'discount') {
    return (
      `Mit ${N0.format(economy.discount * 100)} % Rabatt für alle ${changePhrase('conversionRate', c.conversionRate)}. ` +
      `Aber ${changePhrase('revenue', c.revenue)}, und ${changePhrase('grossProfit', c.grossProfit)}. ` +
      `Der Rabatt geht von jeder Bestellung ab, auch von denen, die ohne ihn gekommen wären. ${end} ${invented}`
    );
  }
  if (id === 'freeShipping') {
    return (
      `Mit der neuen Versandgrenze ${changePhrase('conversionRate', c.conversionRate)}: Einige springen an der Kasse ab. ` +
      `Dafür ${changePhrase('averageOrderValue', c.averageOrderValue)}, ${changePhrase('revenue', c.revenue)}, ` +
      `und ${changePhrase('grossProfit', c.grossProfit)}, weil der Shop seltener den Versand zahlt. ${end} ${invented}`
    );
  }
  if (id === 'socialCampaign') {
    return (
      `Mit der Kampagne ${changePhrase('visits', c.visits)}. ${capitalize(changePhrase('conversionRate', c.conversionRate))}, ` +
      `obwohl keine Quelle an Quote verliert: Es kommen nur mehr Besuche aus Social, der Quelle mit der niedrigsten Quote ` +
      `(${formatPercent(BASE_FUNNEL.bySource.social.overall)}). ${capitalize(changePhrase('revenue', c.revenue))}, ` +
      `aber ${changePhrase('revenuePerVisit', c.revenuePerVisit)}. Das ist derselbe Mischeffekt wie beim Simpson-Paradox in A-004: ` +
      `Der Gesamtwert ändert sich, weil sich die Mischung ändert. ${end} ${invented}`
    );
  }
  // guestCheckout
  return (
    `Ohne Pflichtkonto steigt der Übergang ${TRANSITIONS[3]} von ${formatPercent(BASE_FUNNEL.rates[3]!)} auf ` +
    `${formatPercent(funnel.rates[3]!)}. Damit ${changePhrase('conversionRate', c.conversionRate)}, ` +
    `${changePhrase('revenue', c.revenue)}, und ${changePhrase('grossProfit', c.grossProfit)}. ${end} ${invented}`
  );
}

/** Funnel und Kennzahlen des ganzen Shops mit den Reglerwerten. */
export function liftedState(lifts: Lifts): { funnel: FunnelResult; kpis: Kpis } {
  const funnel = computeFunnel(applyLifts(SOURCES, lifts));
  return { funnel, kpis: kpis(funnel, ECONOMY) };
}

/** Funnel einer einzelnen Quelle oder aller Quellen, mit den Reglerwerten. */
export function funnelFor(source: SourceId | 'all', lifts: Lifts): FunnelResult {
  const lifted = applyLifts(SOURCES, lifts);
  return computeFunnel(source === 'all' ? lifted : lifted.filter((s) => s.id === source));
}

/** Relative Änderung der Käufe (und damit der Conversion Rate) gegen den Start; winzige Rechenreste zählen als 0. */
export function overallLift(lifts: Lifts): number {
  const lift = liftedState(lifts).kpis.orders / BASE_KPIS.orders - 1;
  return Math.abs(lift) < 1e-9 ? 0 : lift;
}

const EPS = 1e-9;

/** Erkenntnis zur Multiplikation, an die eingestellten Regler gebunden; null, wenn alle auf 0 stehen. */
export function liftInsight(lifts: Lifts): string | null {
  const active = lifts.map((l, i) => ({ l, i })).filter((x) => x.l !== 0);
  if (active.length === 0) return null;
  const product = lifts.reduce((p, l) => p * (1 + l), 1);
  const after = liftedState(lifts).kpis.orders;
  const actual = after / BASE_KPIS.orders;
  const more = (factor: number) =>
    Math.abs(factor - 1) < EPS ? 'gleich viele Käufe' : `${formatPercent1(Math.abs(factor - 1))} ${factor > 1 ? 'mehr' : 'weniger'} Käufe`;

  const set = listWords(active.map((x) => `${TRANSITIONS[x.i]} ${formatLift(x.l)}`));
  let text =
    `Eingestellt: ${set}. Die Käufe sind die Besuche mal alle vier Quoten, also multiplizieren sich die Faktoren: ` +
    `${active.map((x) => formatFactor(1 + x.l)).join(' × ')} = ${formatFactor(product)}. `;
  if (Math.abs(actual - product) < EPS) {
    text += `Das ergibt ${more(product)}: ${formatCount(after)} statt ${formatCount(BASE_KPIS.orders)}.`;
  } else {
    text +=
      `Ohne Grenze wären das ${more(product)}. Weil einige Quoten nicht über 100 % steigen können, sind es tatsächlich ` +
      `${more(actual)}: ${formatCount(after)} statt ${formatCount(BASE_KPIS.orders)}.`;
  }
  if (active.length === 1) text += ' Dieselbe relative Änderung an einem anderen Übergang ergäbe dieselbe Zahl.';
  return text;
}

/** Stichprobe je Variante (α 0,05, Power 0,8) und Laufzeit in Wochen; null bei Lift ≤ 0 oder ungültigen Werten. */
export function testSize(conversionRate: number, relativeLift: number, monthlyVisits: number): { perVariant: number; weeks: number } | null {
  if (![conversionRate, relativeLift, monthlyVisits].every(Number.isFinite)) return null;
  if (relativeLift <= 0 || monthlyVisits <= 0) return null;
  const result = calculateSampleSize({ baseline: conversionRate * 100, mde: conversionRate * 100 * relativeLift, alpha: 0.05, power: 0.8 });
  if (!result) return null;
  const weeks = Math.ceil((2 * result.perVariant) / ((monthlyVisits * 12) / 52));
  return { perVariant: result.perVariant, weeks };
}

/** Satz für „Lohnt sich ein Test?“ zu den eingestellten Reglern. */
export function testSizeText(lifts: Lifts): string {
  const lift = overallLift(lifts);
  if (lift <= 0) {
    return (
      'Stell oben an mindestens einem Übergang eine Verbesserung ein. Für keine Änderung oder eine Verschlechterung ' +
      'rechnet dieser Abschnitt keine Testdauer aus.'
    );
  }
  const size = testSize(BASE_KPIS.conversionRate, lift, BASE_KPIS.visits);
  if (!size) return 'Für diese Werte lässt sich keine Stichprobe rechnen: Die neue Quote läge bei 100 % oder darüber.';
  return (
    `Um ${formatLift(lift)} relativ auf ${formatPercent(BASE_KPIS.conversionRate)} zu erkennen, braucht ein A/B-Test etwa ` +
    `${formatCount(size.perVariant)} Besuche je Variante – bei ${formatCount(BASE_KPIS.visits)} Besuchen im Monat rund ` +
    `${size.weeks} ${size.weeks === 1 ? 'Woche' : 'Wochen'}.`
  );
}

/** Ansage nach einem Regler: welcher Übergang, Käufe, Conversion Rate, größter Verlust. */
export function liftAnnouncement(lifts: Lifts, changed: number): string {
  const { funnel, kpis: k } = liftedState(lifts);
  return (
    `${TRANSITIONS[changed]} ${formatLift(lifts[changed]!)}: Käufe ${formatCount(k.orders)}, ` +
    `Conversion Rate ${formatPercent(k.conversionRate)}, größter Verlust ${TRANSITIONS[funnel.biggestLeak]}.`
  );
}

/** Ansage nach dem Quellenumschalter. */
export function sourceAnnouncement(source: SourceId | 'all', lifts: Lifts): string {
  const f = funnelFor(source, lifts);
  const label = source === 'all' ? 'Alle Quellen' : SOURCES.find((s) => s.id === source)!.label;
  return (
    `${label}: ${formatCount(f.counts[0]!)} Besuche, ${formatCount(f.counts[4]!)} Käufe, ` +
    `Conversion Rate ${formatPercent(f.overall)}, größter Verlust ${TRANSITIONS[f.biggestLeak]}.`
  );
}

/** Ansage nach dem Szenario-Umschalter. */
export function scenarioAnnouncement(id: ScenarioId): string {
  const { scenario, comparison } = runScenario(id);
  const c = comparison.changes;
  return (
    `${scenario.label}: Conversion Rate ${DIRECTION_WORD[c.conversionRate.direction]}, Umsatz ${DIRECTION_WORD[c.revenue.direction]}, ` +
    `Rohertrag ${DIRECTION_WORD[c.grossProfit.direction]}. ${comparison.conflict ? 'Widerspruch.' : 'Gleiche Richtung.'}`
  );
}
