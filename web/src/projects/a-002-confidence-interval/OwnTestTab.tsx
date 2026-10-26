import { useMemo, useState } from 'react';
import { Link } from 'react-router';
import { Metric } from '../../design/components/Metric';
import { NumberField } from '../../design/components/NumberField';
import { formatDifference, formatSigned, parseGermanNumber } from '../../learning/numbers';
import { differenceInterval } from '../../stats/proportions';
import { formatLevel, formatPoints, formatRate, levelInterval } from './format';
import { readingOf } from './reading';
import { ApproximationWarning, LevelField } from './fields';
import { IntervalChart, symmetricAxis } from './IntervalChart';
import { useCalmSentence } from '../../learning/useCalmSentence';
import { NOT_A_NUMBER, START_FIELDS, fieldSetter, validateCounts, type CountFields } from './validate';

/** MDE: leer = keine Linie; sonst eine Zahl größer 0. */
function readMde(raw: string): { mde: number | null; error: string | null } {
  if (raw.trim() === '') return { mde: null, error: null };
  const value = parseGermanNumber(raw);
  if (value === null) return { mde: null, error: NOT_A_NUMBER };
  if (value <= 0) return { mde: null, error: 'Der MDE muss größer als 0 sein.' };
  return { mde: value, error: null };
}

export function OwnTestTab() {
  const [fields, setFields] = useState<CountFields>(START_FIELDS);
  const [level, setLevel] = useState(0.95);
  const [mdeRaw, setMdeRaw] = useState('');

  const set = fieldSetter(setFields);
  const { counts, errors } = useMemo(() => validateCounts(fields), [fields]);
  const { mde, error: mdeError } = readMde(mdeRaw);
  const interval = useMemo(() => (counts ? differenceInterval(counts, level) : null), [counts, level]);
  const reading = interval ? readingOf(interval, mde, level) : null;

  const sentence = interval
    ? `${levelInterval(level)} des Unterschieds: ${formatSigned(interval.lower, 2)} bis ${formatSigned(interval.upper, 2)} Prozentpunkte${interval.approximationWeak ? ', Näherung unzuverlässig' : ''}.`
    : 'Bitte die Eingaben prüfen.';
  const announced = useCalmSentence(sentence);

  return (
    <div className="ci-tab">
      <p className="ci-context">Trag die Zahlen deines Tests ein. Das Intervall gilt für den Unterschied B − A.</p>

      <div className="ci-fields">
        <NumberField label="Besucher A" value={fields.visitorsA} onChange={set('visitorsA')} error={errors.visitorsA} />
        <NumberField label="Käufe A" value={fields.conversionsA} onChange={set('conversionsA')} error={errors.conversionsA} />
        <NumberField label="Besucher B" value={fields.visitorsB} onChange={set('visitorsB')} error={errors.visitorsB} />
        <NumberField label="Käufe B" value={fields.conversionsB} onChange={set('conversionsB')} error={errors.conversionsB} />
      </div>

      <div className="ci-fields">
        <LevelField value={level} onChange={setLevel} />
        <NumberField
          label="MDE (optional)"
          value={mdeRaw}
          onChange={setMdeRaw}
          error={mdeError}
          hint="Der kleinste Unterschied, der dir etwas wert ist. Hast du den MDE in A-001 so gewählt, ist es derselbe Wert. Leer lassen, dann gibt es keine MDE-Linie."
          suffix="Prozentpunkte"
        />
      </div>

      {interval && reading ? (
        <>
          <div className="ci-metrics">
            <Metric
              label="Unterschied"
              value={formatPoints(interval.difference)}
              hint={`A ${formatRate(interval.rateA)}, B ${formatRate(interval.rateB)}`}
            />
            <Metric
              label="Intervall"
              value={`${formatSigned(interval.lower, 2)} bis ${formatSigned(interval.upper, 2)}`}
              hint={`Prozentpunkte, Niveau ${formatLevel(level)}`}
            />
          </div>

          {interval.approximationWeak ? (
            <ApproximationWarning />
          ) : null}

          <IntervalChart
            rows={[{ estimate: interval.difference, lower: interval.lower, upper: interval.upper }]}
            axis={symmetricAxis(interval.lower, interval.upper, mde)}
            mde={mde}
            description={`Ein ${levelInterval(level)} des Unterschieds von ${formatSigned(interval.lower, 2)} bis ${formatSigned(interval.upper, 2)} Prozentpunkte, gemessen ${formatDifference(interval.difference, 2)}.`}
          />

          <div className="ci-reading">
            <p>{reading.significance}</p>
            {reading.relevance !== null ? (
              <p>
                {reading.relevance}
                {reading.linkSignificantRelevant ? (
                  <>
                    {' '}
                    <Link to="/projekt/A-002.3">Signifikant ≠ relevant</Link>
                  </>
                ) : null}
              </p>
            ) : null}
          </div>
        </>
      ) : (
        <p className="ci-hint">
          Mit diesen Eingaben lässt sich kein Intervall berechnen. Prüfe die markierten Felder.
        </p>
      )}

      <p className="visually-hidden" aria-live="polite" aria-atomic="true">
        {announced}
      </p>
    </div>
  );
}
