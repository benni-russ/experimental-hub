import { Button } from '../../design/components/Button';
import { InsightBox } from '../../design/components/InsightBox';
import { Metric } from '../../design/components/Metric';
import { Slider } from '../../design/components/Slider';
import type { Kpis } from '../../experience/funnel';
import { BASE_KPIS, KPI_ROWS, TRANSITIONS, formatLift, liftInsight, type Lifts } from './insights';

// Kennzahlen unter den Reglern: Besuche bleiben gleich, der Bestellwert auch; gezeigt wird, was sich bewegt.
const SHOWN: (keyof Kpis)[] = ['orders', 'conversionRate', 'revenue', 'revenuePerVisit', 'grossProfit'];

interface LiftSlidersProps {
  lifts: Lifts;
  kpis: Kpis;
  onChange: (lifts: Lifts) => void;
  /** nach dem Loslassen eines Reglers, mit seinem Index */
  onCommit: (lifts: Lifts, index: number) => void;
  onReset: () => void;
  /** wechselt bei jedem Zurücksetzen: Die Regler starten neu und vergessen ihren zuletzt gemeldeten Wert. */
  resetKey: number;
}

/** Vier Regler −50 … +50 % je Übergang, darunter die Kennzahlen des ganzen Shops und die Erkenntnis zur Multiplikation. */
export function LiftSliders({ lifts, kpis, onChange, onCommit, onReset, resetKey }: LiftSlidersProps) {
  const insight = liftInsight(lifts);
  const set = (i: number, percent: number): Lifts => {
    const next = [...lifts] as Lifts;
    next[i] = percent / 100;
    return next;
  };

  return (
    <div className="fn-lifts">
      <div className="fn-sliders">
        {TRANSITIONS.map((t, i) => (
          <Slider
            key={`${t}-${resetKey}`}
            label={t}
            value={Math.round(lifts[i]! * 100)}
            min={-50}
            max={50}
            step={5}
            format={(v) => formatLift(v / 100)}
            onChange={(v) => onChange(set(i, v))}
            onCommit={(v) => onCommit(set(i, v), i)}
          />
        ))}
      </div>
      <div>
        <Button variant="secondary" onClick={onReset}>
          Alle Regler auf 0
        </Button>
      </div>
      <ul className="fn-kpis" aria-label="Kennzahlen des ganzen Shops mit deinen Reglern">
        {SHOWN.map((key) => {
          const row = KPI_ROWS.find((r) => r.key === key)!;
          return (
            <li key={key} className="fn-kpi">
              <Metric label={row.label} value={row.format(kpis[key])} hint={`Start: ${row.format(BASE_KPIS[key])}`} />
            </li>
          );
        })}
      </ul>
      {insight ? <InsightBox title="Die Quoten multiplizieren sich">{insight}</InsightBox> : null}
    </div>
  );
}
