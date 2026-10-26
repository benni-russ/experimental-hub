import { useState } from 'react';
import { InsightBox } from '../../design/components/InsightBox';
import { Metric } from '../../design/components/Metric';
import { Slider } from '../../design/components/Slider';
import { formatNumber } from '../../learning/numbers';
import { useCalmSentence } from '../../learning/useCalmSentence';
import { formatGap, overallWinnerWord, pct2 } from './format';
import { SegmentBars } from './SegmentBars';
import { MOBILE_SHARE_A, compare, tippingPoint } from './simpson';
import './simpson.css';

export default function Demo() {
  const [share, setShare] = useState(50);
  const result = compare(share);
  const gap = result.overallB - result.overallA;
  const threshold = Math.ceil(tippingPoint());

  const sentence = `Insgesamt: A ${pct2(result.overallA)}, B ${pct2(result.overallB)}, ${overallWinnerWord(result.overallA, result.overallB, result.overallWinner)}, Abstand B minus A ${formatGap(gap)}.`;
  const announced = useCalmSentence(sentence);

  return (
    <div className="simpson-demo">
      <p className="simpson-context">
        B ist in jedem Segment besser. Verschiebe, wie viele der Besucher von B mobil kommen, und sieh, was mit der
        Gesamtrate passiert.
      </p>

      <Slider
        label="Mobil-Anteil in B"
        value={share}
        min={30}
        max={90}
        step={1}
        onChange={setShare}
        format={(v) => `${formatNumber(v)} %`}
      />
      <p className="simpson-mix">A: {MOBILE_SHARE_A} % mobil</p>

      <SegmentBars
        mobileShareB={share}
        mobileShareA={MOBILE_SHARE_A}
        overallA={result.overallA}
        overallB={result.overallB}
        overallWinner={result.overallWinner}
        paradox={result.paradox}
      />

      <div className="simpson-metrics">
        <Metric label="Gesamtrate A" value={pct2(result.overallA)} />
        <Metric label="Gesamtrate B" value={pct2(result.overallB)} />
        <Metric label="Abstand B − A" value={formatGap(gap)} />
      </div>

      {result.paradox ? (
        <InsightBox title="Das Paradox">
          B gewinnt in jedem Segment und verliert insgesamt – weil B mehr vom schwächeren Segment bekommen hat.
        </InsightBox>
      ) : (
        <p className="simpson-note">
          {result.overallWinner === 'tie'
            ? 'Insgesamt gleichauf: genau am Kipppunkt.'
            : `Hier liegt B auch insgesamt vorn. Ab ${threshold} % Mobil-Anteil kippt es.`}
        </p>
      )}

      <p className="visually-hidden" aria-live="polite" aria-atomic="true">
        {announced}
      </p>
    </div>
  );
}
