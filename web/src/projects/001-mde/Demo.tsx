import { useEffect, useState } from 'react';
import { Disclosure } from '../../design/components/Disclosure';
import { InsightBox } from '../../design/components/InsightBox';
import { Metric } from '../../design/components/Metric';
import { Slider } from '../../design/components/Slider';
import { formatNumber } from '../../learning/numbers';
import { DEFAULTS, MoreAssumptions, formatPercent, formatPoints, formatRate, isWhole, outOf } from './Assumptions';
import { NOTABLY_BELOW_FOUR, halveMde } from './halving';
import { MDE_MAX, MDE_MIN, SampleCurve } from './SampleCurve';
import { calculateSampleSize } from './sampleSize';
import './mde.css';

/** 0,5 bleibt 0,5; 0,25 bekommt zwei Stellen statt gerundet 0,3. */
const decimals = (v: number) => (isWhole(v * 10) ? 1 : 2);

export default function Demo() {
  const [mde, setMde] = useState(DEFAULTS.mde);
  const [baseline, setBaseline] = useState(DEFAULTS.baseline);
  const [alpha, setAlpha] = useState(DEFAULTS.alpha);
  const [power, setPower] = useState(DEFAULTS.power);

  const result = calculateSampleSize({ baseline, mde, alpha, power });
  const halving = halveMde({ baseline, mde, alpha, power });

  // Eine ruhige Ansage für Screenreader: erst wenn der Regler ~500 ms stillsteht.
  const sentence = result
    ? `${formatNumber(result.perVariant)} Personen je Variante, ${formatNumber(result.total)} insgesamt`
    : 'Diese Kombination geht nicht.';
  const [announced, setAnnounced] = useState(sentence);
  useEffect(() => {
    const timer = setTimeout(() => setAnnounced(sentence), 500);
    return () => clearTimeout(timer);
  }, [sentence]);

  return (
    <div className="mde-demo">
      <Slider
        label="Kleinster Unterschied, den du erkennen willst"
        value={mde}
        min={MDE_MIN}
        max={MDE_MAX}
        step={0.1}
        onChange={setMde}
        format={formatPoints}
      />

      {result ? (
        <>
          <p className="mde-context">
            Heute kaufen {formatPercent(baseline)} der Besucher. Der Test soll erkennen, ob es mit der neuen Variante
            mindestens {formatRate(baseline + mde)} sind, relativ also {isWhole(result.relativeUplift) ? '' : 'rund '}
            {formatNumber(result.relativeUplift, 0)} % mehr.
          </p>
          <div className="mde-metrics">
            <Metric label="Personen je Variante" value={formatNumber(result.perVariant)} />
            <Metric label="insgesamt" value={formatNumber(result.total)} hint="beide Varianten zusammen" />
          </div>
          <p className="mde-hint">
            Damit zeigt der Test einen echten Unterschied dieser Größe in rund {outOf(power, 10)} Fällen, und der Zufall
            täuscht einen nicht vorhandenen nur in {outOf(alpha, 100)} Fällen vor.
          </p>
        </>
      ) : (
        <p className="mde-warning" role="status">
          <strong>Hinweis:</strong> Diese Kombination geht nicht, die neue Rate läge bei 100 % oder darüber. Wähle eine
          kleinere Baseline oder einen kleineren Unterschied.
        </p>
      )}

      <SampleCurve
        baseline={baseline}
        alpha={alpha}
        power={power}
        mde={mde}
        current={result ? result.perVariant : null}
      />

      {result && halving ? (
        <InsightBox title={`Halber Unterschied, das ${formatNumber(halving.ratio, 1)}-Fache an Personen`}>
          Willst du nur {formatNumber(mde / 2, decimals(mde / 2))} statt {formatNumber(mde, 1)} Prozentpunkte
          erkennen, brauchst du {formatNumber(halving.half.perVariant)} statt {formatNumber(result.perVariant)} Personen
          je Variante.
          {halving.ratio < NOTABLY_BELOW_FOUR
            ? ' Meist ist es rund das Vierfache. Hier weniger, weil sich bei kleiner Baseline und großem Unterschied die Streuung mit der Zielrate merklich ändert.'
            : null}
        </InsightBox>
      ) : null}

      <p className="visually-hidden" aria-live="polite" aria-atomic="true">
        {announced}
      </p>

      <Disclosure summary="Weitere Annahmen ändern">
        <MoreAssumptions
          baseline={baseline}
          alpha={alpha}
          power={power}
          onBaseline={setBaseline}
          onAlpha={setAlpha}
          onPower={setPower}
        />
      </Disclosure>
    </div>
  );
}
