import { useId } from 'react';
import { SegmentedControl } from '../../design/components/SegmentedControl';
import { SOURCES, STEPS, type FunnelResult, type SourceId } from '../../experience/funnel';
import { TRANSITIONS, formatCount, formatPercent, formatPercent1 } from './insights';

export type SourceChoice = SourceId | 'all';

export const SOURCE_OPTIONS: { value: SourceChoice; label: string }[] = [
  { value: 'all', label: 'Alle Quellen' },
  ...SOURCES.map((s) => ({ value: s.id as SourceChoice, label: s.label })),
];

// Gezeichnetes Zeichen für den größten Verlust: ein Tropfen, der aus einer Linie fällt. Keine
// Schriftglyphe (DESIGN.md); das Wort steht immer daneben.
export function LeakMark() {
  return (
    <svg className="fn-mark" width="12" height="12" viewBox="0 0 12 12" fill="none" aria-hidden="true">
      <path d="M1.5 2.5h9" />
      <path d="M6 5c1.4 1.7 2 2.7 2 3.5a2 2 0 0 1-4 0c0-.8.6-1.8 2-3.5z" />
    </svg>
  );
}

/** Pille „größter Verlust“ mit Zeichen und Wort; die Farbe hilft nur beim Überfliegen. */
export function LeakTag() {
  return (
    <span className="tag fn-leak">
      <LeakMark /> größter Verlust
    </span>
  );
}

interface FunnelBarsProps {
  funnel: FunnelResult;
  source: SourceChoice;
  onSource: (source: SourceChoice) => void;
}

const width = (count: number, visits: number) => `${visits > 0 ? Math.max(0.5, (count / visits) * 100) : 0}%`;

/** Fünf Balken mit Anzahl, Quote je Übergang und der Marke am größten Verlust. */
export function FunnelBars({ funnel, source, onSource }: FunnelBarsProps) {
  const labelId = useId();
  const visits = funnel.counts[0]!;
  const sourceLabel = SOURCE_OPTIONS.find((o) => o.value === source)!.label;

  return (
    <div className="fn-funnel">
      <div className="fn-control">
        <span id={labelId} className="fn-control-label">
          Quelle
        </span>
        <SegmentedControl label="Quelle" labelledBy={labelId} options={SOURCE_OPTIONS} value={source} onChange={onSource} />
      </div>
      <ol className="fn-bars" aria-label={`Funnel: ${sourceLabel}`}>
        {STEPS.map((step, i) => {
          const count = funnel.counts[i]!;
          const isLeak = i === funnel.biggestLeak;
          return (
            <li key={step.id} className="fn-step">
              <div className="fn-step-head">
                <span className="fn-step-name">{step.label}</span>
                <span className="fn-num">{formatCount(count)}</span>
              </div>
              <span className="fn-track" aria-hidden="true">
                <span className="fn-bar" style={{ width: width(count, visits) }} />
              </span>
              {i < STEPS.length - 1 ? (
                <p className={isLeak ? 'fn-transition is-leak' : 'fn-transition'}>
                  <span className="visually-hidden">{TRANSITIONS[i]}: </span>
                  <span className="fn-num">{formatPercent1(funnel.rates[i]!)}</span> gehen weiter,{' '}
                  <span className="fn-num">{formatCount(count - funnel.counts[i + 1]!)}</span> gehen verloren
                  {isLeak ? (
                    <>
                      {' '}
                      <LeakTag />
                    </>
                  ) : null}
                </p>
              ) : null}
            </li>
          );
        })}
      </ol>
      <p className="fn-overall">
        Gesamt kaufen <strong className="fn-num">{formatPercent(funnel.overall)}</strong> der Besuche ({sourceLabel}).
      </p>
    </div>
  );
}
