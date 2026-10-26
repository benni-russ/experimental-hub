import { useId, useState } from 'react';
import { Icon } from '../../design/components/Icon';
import { InsightBox } from '../../design/components/InsightBox';
import { Metric } from '../../design/components/Metric';
import { Slider } from '../../design/components/Slider';
import { formatNumber } from '../../learning/numbers';
import { useCalmSentence } from '../../learning/useCalmSentence';
import { CAUSES, SCENARIO, applyCause, measuredUplift, type CauseId } from './causes';
import { formatP, formatPercent } from './format';
import { SplitChart } from './SplitChart';
import { srmTest } from './srm';
import { Verdict } from './Verdict';

/** Feste Achse, damit Balkenhöhen über alle Reglerstellungen vergleichbar bleiben. */
const AXIS = { min: 45_000, max: 55_000 };
/** Ab dieser Verfälschung (in %) lohnt der Hinweis „zu klein für die Prüfung“. */
const NOTICEABLE_UPLIFT = 0.5;

function upliftText(uplift: number): string {
  if (Math.abs(uplift) < 0.05) return 'Kein Unterschied gemessen';
  return `B wirkt ${formatPercent(Math.abs(uplift))} ${uplift > 0 ? 'besser' : 'schlechter'}, obwohl nichts geändert wurde`;
}

export function CausesTab() {
  const [causeId, setCauseId] = useState<CauseId>('redirect');
  const [strength, setStrength] = useState(2);
  const groupName = useId();

  const cause = CAUSES.find((c) => c.id === causeId)!;
  const counts = applyCause(causeId, strength / 100);
  // Die Eingaben sind hier immer gültig (ganze Zahlen, Summe > 0, Anteil 50).
  const result = srmTest({ visitorsA: counts.visitorsA, visitorsB: counts.visitorsB, plannedShareA: 50 })!;
  const uplift = measuredUplift(counts);
  const hiddenDistortion = !result.mismatch && Math.abs(uplift) >= NOTICEABLE_UPLIFT;

  const sentence = `${result.mismatch ? 'Aufteilung passt nicht' : 'Aufteilung passt'}, ${formatP(result.pValue)}. ${upliftText(uplift)}.`;
  const announced = useCalmSentence(sentence);

  return (
    <div className="srm-tab">
      <p className="srm-context">
        Die Wahrheit ist festgelegt: Beide Varianten sind identisch, je {formatNumber(SCENARIO.visitorsPerGroup)} Besucher
        mit {formatNumber(SCENARIO.conversionRate * 100)} % Kaufrate, geplant ist 50/50. Eine Ursache greift ein, und du
        siehst, was der Test daraus macht. Gerechnet wird mit Erwartungswerten, nicht mit Zufall.
      </p>

      <fieldset className="srm-causes">
        <legend>Ursache</legend>
        {CAUSES.map((c, index) => (
          <label key={c.id} className="srm-cause">
            <input type="radio" name={groupName} value={c.id} checked={c.id === causeId} onChange={() => setCauseId(c.id)} />
            <span className="srm-cause-num" aria-hidden="true">
              {index + 1}.
            </span>
            <strong className="srm-cause-title">{c.label}</strong>
            <span className="srm-cause-info">
              <Icon name="info" size={18} />
              <span>{c.description}</span>
            </span>
          </label>
        ))}
      </fieldset>

      <Slider
        label={`${cause.strengthLabel}, in % der ${formatNumber(SCENARIO.visitorsPerGroup)} je Variante`}
        value={strength}
        min={0}
        max={5}
        step={0.5}
        onChange={setStrength}
        format={(v) => `${formatNumber(v, 1)} %`}
      />

      <SplitChart
        visitorsA={counts.visitorsA}
        visitorsB={counts.visitorsB}
        expectedA={result.expectedA}
        expectedB={result.expectedB}
        axis={AXIS}
      />

      <Verdict result={result} />

      <div className="srm-metrics">
        <Metric label="Gemessener Unterschied" value={upliftText(uplift)} hint="Kaufrate B gegenüber A, relativ" />
      </div>
      {hiddenDistortion ? (
        <p className="srm-note">Zu klein für die Prüfung, aber schon verfälscht.</p>
      ) : null}

      <InsightBox title="Reihenfolge beim Lesen">Erst die Aufteilung prüfen, dann das Ergebnis lesen.</InsightBox>

      <p className="visually-hidden" aria-live="polite" aria-atomic="true">
        {announced}
      </p>
    </div>
  );
}
