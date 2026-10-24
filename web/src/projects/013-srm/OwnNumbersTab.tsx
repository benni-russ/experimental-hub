import { useMemo, useState } from 'react';
import { Metric } from '../../design/components/Metric';
import { NumberField } from '../../design/components/NumberField';
import { useCalmSentence } from '../../learning/useCalmSentence';
import { formatCount, formatP, formatThreshold, formatSignedPercent } from './format';
import { formatPValue, srmTest } from './srm';
import { NO_VISITORS, START_FIELDS, validateOwn, type OwnFields } from './validate';
import { Verdict } from './Verdict';

export function OwnNumbersTab() {
  const [fields, setFields] = useState<OwnFields>(START_FIELDS);
  const set = (key: keyof OwnFields) => (raw: string) => setFields((f) => ({ ...f, [key]: raw }));

  const { input, errors, noVisitors } = useMemo(() => validateOwn(fields), [fields]);
  const result = useMemo(() => (input ? srmTest(input) : null), [input]);

  const sentence = result
    ? `${result.mismatch ? 'Aufteilung passt nicht' : 'Aufteilung passt'}, ${formatP(result.pValue)}.`
    : noVisitors
      ? NO_VISITORS
      : 'Bitte die Eingaben prüfen.';
  const announced = useCalmSentence(sentence);

  return (
    <div className="srm-tab">
      <p className="srm-context">
        Trag ein, wie viele Besucher in jeder Gruppe gelandet sind und welchen Anteil für A du geplant hattest. Die
        Startwerte sind das Einstiegsbeispiel.
      </p>

      <div className="srm-fields">
        <NumberField label="Besucher A" value={fields.visitorsA} onChange={set('visitorsA')} error={errors.visitorsA} />
        <NumberField label="Besucher B" value={fields.visitorsB} onChange={set('visitorsB')} error={errors.visitorsB} />
        <NumberField
          label="Geplanter Anteil A"
          value={fields.plannedShareA}
          onChange={set('plannedShareA')}
          error={errors.plannedShareA}
          suffix="%"
        />
      </div>

      {result ? (
        <>
          <Verdict result={result} />
          <div className="srm-metrics">
            <Metric
              label="Erwartet"
              value={`A ${formatCount(result.expectedA)}, B ${formatCount(result.expectedB)}`}
              hint="bei dem geplanten Anteil"
            />
            <Metric
              label="Abweichung von A"
              value={formatSignedPercent(result.deviationPercent)}
              hint="gegenüber dem Erwartungswert"
            />
            <Metric label="p-Wert" value={formatPValue(result.pValue)} hint={`Schwelle ${formatThreshold()}`} />
          </div>
          <p className="srm-note">
            {result.mismatch
              ? 'Das Ergebnis dieses Tests nicht lesen. Erst die Ursache suchen und beheben.'
              : 'Kein Alarm. Das heißt nicht, dass alles stimmt: Kleine Verschiebungen bleiben unter der Schwelle.'}
          </p>
        </>
      ) : (
        <p className="srm-hint">
          {noVisitors ? NO_VISITORS : 'Mit diesen Eingaben lässt sich nichts prüfen. Prüfe die markierten Felder.'}
        </p>
      )}

      <p className="visually-hidden" aria-live="polite" aria-atomic="true">
        {announced}
      </p>
    </div>
  );
}
