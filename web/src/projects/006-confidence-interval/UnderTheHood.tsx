import { useState } from 'react';
import { CodeBlock } from '../../design/components/CodeBlock';
import { Disclosure } from '../../design/components/Disclosure';
import { InteractiveFormula, type FormulaPart } from '../../design/components/InteractiveFormula';
import { NumberField } from '../../design/components/NumberField';
import { formatNumber, formatSignificant, formatSigned } from '../../learning/numbers';
import { differenceInterval } from '../../stats/proportions';
import { ApproximationWarning, LevelField } from './fields';
import { formatLevel } from './format';
import { ciTerms, exact } from './formulaTerms';
import { START_FIELDS, fieldSetter, validateCounts, type CountFields } from './validate';
import './ci.css';

const sig = (v: number) => formatSignificant(v);

const R_DOC = 'https://search.r-project.org/R/refmans/stats/html/prop.test.html';

const LIMITS = [
  'binäres Ergebnis pro Person, zum Beispiel Kauf oder kein Kauf',
  'unabhängige Beobachtungen, jede Person zählt nur einmal',
  'Normalapproximation: unzuverlässig bei kleinen Stichproben und Raten nahe 0 % oder 100 %',
  'feste Stichprobe: wer zwischendurch schaut und beim ersten guten Wert stoppt (Peeking), verändert die Trefferquote',
  'ein Intervall für eine Frage; mehr Kennzahlen oder Varianten erhöhen die Chance auf einen Zufallstreffer',
];

const FORMULA: FormulaPart[] = [
  '(',
  { term: 'diff', text: 'p_B − p_A' },
  ') ± ',
  { term: 'z', text: 'z' },
  ' · √( ',
  { term: 'varA', text: 'p_A(1−p_A)/n_A' },
  ' + ',
  { term: 'varB', text: 'p_B(1−p_B)/n_B' },
  ' )',
];

type Control = 'a' | 'b' | 'counts' | 'level';
const isControl = (c: string | undefined): c is Control => c === 'a' || c === 'b' || c === 'counts' || c === 'level';

export default function UnderTheHood() {
  const [fields, setFields] = useState<CountFields>(START_FIELDS);
  const [level, setLevel] = useState(0.95);
  const [linked, setLinked] = useState<Control | undefined>();
  const set = fieldSetter(setFields);

  const { counts, errors } = validateCounts(fields);
  const r = counts ? differenceInterval(counts, level) : null;
  const terms = ciTerms(r, counts, level);
  const pA = r ? r.rateA / 100 : 0;
  const pB = r ? r.rateB / 100 : 0;
  const d = r ? r.difference / 100 : 0;
  const se = r ? r.standardError / 100 : 0;

  // Hülle mit Rand für den Ring von .is-linked; `groups` nennt die Steuerungen, die das Feld hervorheben
  const wrap = (groups: Control[]) => `ci-linkable${linked && groups.includes(linked) ? ' is-linked' : ''}`;

  return (
    <div className="ci-hood">
      <h3>Formel</h3>
      <p>Für den Unterschied zweier Raten, B − A, gilt näherungsweise:</p>
      <InteractiveFormula
        ariaLabel="Unterschied p B minus p A, plus minus z mal Wurzel aus: p A mal 1 minus p A, geteilt durch n A, plus p B mal 1 minus p B, geteilt durch n B"
        lead="B − A ≈"
        numerator={FORMULA}
        terms={terms}
        onActiveChange={(c) => setLinked(isControl(c) ? c : undefined)}
      />

      <p>Probier eigene Werte; die Rechnung unten setzt sie ein. Das ist unabhängig von der Demo oben.</p>
      <div className="ci-hood-controls">
        <div className="ci-fields">
          <div className={wrap(['a', 'counts'])}>
            <NumberField label="Besucher A (Rechnung)" value={fields.visitorsA} onChange={set('visitorsA')} error={errors.visitorsA} />
          </div>
          <div className={wrap(['a', 'counts'])}>
            <NumberField label="Käufe A (Rechnung)" value={fields.conversionsA} onChange={set('conversionsA')} error={errors.conversionsA} />
          </div>
          <div className={wrap(['b', 'counts'])}>
            <NumberField label="Besucher B (Rechnung)" value={fields.visitorsB} onChange={set('visitorsB')} error={errors.visitorsB} />
          </div>
          <div className={wrap(['b', 'counts'])}>
            <NumberField label="Käufe B (Rechnung)" value={fields.conversionsB} onChange={set('conversionsB')} error={errors.conversionsB} />
          </div>
        </div>
        <div className={wrap(['level'])}>
          <LevelField label="Niveau (Rechnung)" value={level} onChange={setLevel} />
        </div>
      </div>

      <h3>Schritt für Schritt</h3>
      {r && counts ? (
        <ol className="ci-steps">
          <li>
            <strong>Raten als Anteile (nicht in Prozent):</strong> p_A = {formatNumber(counts.conversionsA)} / {formatNumber(counts.visitorsA)} ={' '}
            {exact(pA)}, p_B = {formatNumber(counts.conversionsB)} / {formatNumber(counts.visitorsB)} = {exact(pB)}
          </li>
          <li>
            <strong>Unterschied:</strong> p_B − p_A = {exact(pB)} − {exact(pA)} = {sig(d)}
          </li>
          <li>
            <strong>Standardfehler (als Anteil):</strong> √({exact(pA)} · {exact(1 - pA)} / {formatNumber(counts.visitorsA)} +{' '}
            {exact(pB)} · {exact(1 - pB)} / {formatNumber(counts.visitorsB)}) = {sig(se)}
          </li>
          <li>
            <strong>z-Wert (ohne Einheit):</strong> z(1 − (1 − {exact(level)})/2) = z({exact(1 - (1 - level) / 2)}) = {sig(r.z)}
          </li>
          <li>
            <strong>Grenzen (Anteil mal 100 = Prozentpunkte):</strong> {sig(d)} ± {sig(r.z)} · {sig(se)} = {sig(d)} ± {sig(r.z * se)}, also von{' '}
            <strong>{formatSigned(r.lower, 2)}</strong> bis <strong>{formatSigned(r.upper, 2)} Prozentpunkte</strong> (Niveau {formatLevel(level)})
          </li>
        </ol>
      ) : (
        <p className="ci-hint" role="status">
          Mit diesen Eingaben lässt sich nichts rechnen. Prüfe die markierten Felder.
        </p>
      )}
      {r?.approximationWeak ? <ApproximationWarning live /> : null}

      <h3>Annahmen und Grenzen</h3>
      <ul className="ci-limits">
        {LIMITS.map((l) => (
          <li key={l}>{l}</li>
        ))}
      </ul>

      <h3>Zum Weiterlesen</h3>
      <Disclosure summary="Was 95 % nicht heißt">
        <p>
          Nicht gemeint ist: „Mit 95 % Wahrscheinlichkeit liegt der wahre Wert in diesem Intervall.“ Der wahre Wert steht
          fest, das Intervall schwankt von Test zu Test.
        </p>
        <p>
          Die 95 % gelten dem Verfahren: Über viele Wiederholungen enthalten rund 95 von 100 Intervallen den wahren Wert,
          so wie in der Demo. Für das eine Intervall vor dir gilt nur: Es hat den wahren Wert getroffen oder nicht, und du
          weißt nicht, welches von beiden.
        </p>
      </Disclosure>
      <Disclosure summary="Wenn die Näherung nicht trägt">
        <p>
          Wo die Normalapproximation unzuverlässig ist (siehe Annahmen und Grenzen), rechnen bessere Verfahren genauer.
          Sie heißen Wilson und Newcombe und sind hier nur genannt.
        </p>
      </Disclosure>
      <Disclosure summary="Gegenprobe mit R">
        <p>
          Dieselbe Rechnung steckt in der R-Funktion{' '}
          <a href={R_DOC} target="_blank" rel="noreferrer">
            <code>prop.test</code>
          </a>{' '}
          mit <code>correct = FALSE</code>. Für deine Werte oben lautet der Aufruf:
        </p>
        {counts ? (
          <CodeBlock
            code={`prop.test(x = c(${counts.conversionsA}, ${counts.conversionsB}), n = c(${counts.visitorsA}, ${counts.visitorsB}), conf.level = ${level}, correct = FALSE)`}
            label="R-Aufruf"
          />
        ) : null}
        <p>
          Beachte: R rechnet A − B. Das Intervall in der R-Ausgabe hat deshalb das umgekehrte Vorzeichen; Grenzen und
          Unterschied zeigen dort in die andere Richtung, sind sonst aber gleich.
        </p>
      </Disclosure>
    </div>
  );
}
