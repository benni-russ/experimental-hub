import { useMemo, useState } from 'react';
import { Button } from '../../design/components/Button';
import { InsightBox } from '../../design/components/InsightBox';
import { SegmentedControl } from '../../design/components/SegmentedControl';
import { Slider } from '../../design/components/Slider';
import { formatNumber } from '../../learning/numbers';
import { LevelField } from './fields';
import { levelInterval } from './format';
import { IntervalChart } from './IntervalChart';
import { useCalmSentence } from '../../learning/useCalmSentence';
import { DEFAULT_SEED, TRUTH, simulateIntervals } from './simulate';

const TEST_OPTIONS = [
  { value: 20, label: '20' },
  { value: 50, label: '50' },
  { value: 100, label: '100' },
];

/** Feste Achse, damit Breiten über alle Reglerstellungen vergleichbar bleiben. */
const AXIS = { min: -2, max: 4 };

export function RepeatTab() {
  // Entwurf: Anzeige am Regler beim Ziehen. Rechenwert: erst nach dem Loslassen (Simulation dauert spürbar).
  const [draftVisitors, setDraftVisitors] = useState(10000);
  const [visitors, setVisitors] = useState(10000);
  const [tests, setTests] = useState(50);
  const [level, setLevel] = useState(0.95);
  const [seed, setSeed] = useState(DEFAULT_SEED);

  const pending = draftVisitors !== visitors;
  const result = useMemo(
    () => simulateIntervals({ seed, visitorsPerVariant: visitors, tests, level }),
    [seed, visitors, tests, level],
  );

  const count = `${formatNumber(result.covered)} von ${formatNumber(tests)} Intervallen enthalten den wahren Unterschied von ${formatNumber(TRUTH.difference)} Prozentpunkt.`;
  const announced = useCalmSentence(count);

  return (
    <div className="ci-tab">
      <p className="ci-context">
        Die Wahrheit ist festgelegt: {formatNumber(TRUTH.baseline)} % kaufen heute, die neue Variante liegt wirklich{' '}
        {formatNumber(TRUTH.difference)} Prozentpunkt darüber. Jeder Strich unten ist ein eigener Test mit seinem
        Intervall.
      </p>

      <Slider
        label="Besucher je Variante"
        value={draftVisitors}
        min={1000}
        max={50000}
        step={1000}
        onChange={setDraftVisitors}
        onCommit={setVisitors}
        format={formatNumber}
      />
      <div className="ci-choices">
        <div className="ci-field">
          <span id="ci-tests-label" className="ci-field-label">
            Anzahl Tests
          </span>
          <SegmentedControl
            label="Anzahl Tests"
            labelledBy="ci-tests-label"
            options={TEST_OPTIONS}
            value={tests}
            onChange={setTests}
          />
        </div>
        <LevelField value={level} onChange={setLevel} />
        <Button variant="secondary" onClick={() => setSeed((s) => s + 1)}>
          Neu würfeln
        </Button>
      </div>

      <p className="ci-count">{pending ? 'Rechnet nach dem Loslassen neu …' : count}</p>
      <p className="ci-legend">
        Voller Punkt: das Intervall enthält den wahren Unterschied. Hohler Kreis mit gestricheltem Strich: es verfehlt
        ihn.
      </p>
      <div className={pending ? 'ci-pending' : undefined} aria-busy={pending}>
        <IntervalChart
          rows={result.intervals}
          axis={AXIS}
          truth={TRUTH.difference}
          description={`${formatNumber(tests)} simulierte Tests, jeweils ein waagrechtes ${levelInterval(level)}. ${count}`}
        />
      </div>

      <InsightBox title="Das Niveau gilt dem Verfahren, nicht dem einzelnen Intervall">
        Mehr Besucher machen die Intervalle schmaler, die Trefferquote bleibt beim gewählten Niveau. Das Niveau ist eine
        Aussage über das Verfahren, nicht über ein einzelnes Intervall.
      </InsightBox>

      <p className="visually-hidden" aria-live="polite" aria-atomic="true">
        {announced}
      </p>
    </div>
  );
}
