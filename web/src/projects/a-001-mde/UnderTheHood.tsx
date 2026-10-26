import { useState } from 'react';
import { CodeBlock } from '../../design/components/CodeBlock';
import { Disclosure } from '../../design/components/Disclosure';
import { InteractiveFormula, type FormulaPart } from '../../design/components/InteractiveFormula';
import { Slider } from '../../design/components/Slider';
import { formatNumber, formatSignificant } from '../../learning/numbers';
import { DEFAULTS, MoreAssumptions, formatPoints } from './Assumptions';
import { exact, mdeTerms } from './formulaTerms';
import { MDE_MAX, MDE_MIN } from './SampleCurve';
import { calculateSampleSize } from './sampleSize';
import './mde.css';

/** Fünf gültige Stellen (vier reichen nicht: beide Streuungen wären 0,4335) */
const sig = formatSignificant;

const R_DOC = 'https://search.r-project.org/R/refmans/stats/html/power.prop.test.html';

const LIMITS = [
  'binäres Ergebnis pro Person, zum Beispiel Kauf oder kein Kauf',
  'unabhängige Beobachtungen und 1:1-Aufteilung',
  'feste Stichprobenplanung ohne vorzeitiges Nachsehen (Peeking) oder sequenzielle Korrektur',
  'Normalapproximation, keine Kontinuitätskorrektur',
  'kein Zuschlag für Abbrüche, Tracking-Ausfälle oder Mehrfachtests',
  'Planungshilfe, kein Ersatz für ein vollständiges Experimentdesign',
];

const NUMERATOR: FormulaPart[] = [
  '[',
  { term: 'zAlpha', text: 'z(1−α/2)' },
  ' · √(2p̄(1−p̄)) + ',
  { term: 'zPower', text: 'z(Power)' },
  ' · √(',
  { term: 'p1', text: 'p₁(1−p₁)' },
  ' + ',
  { term: 'p2', text: 'p₂(1−p₂)' },
  ')]²',
];
const DENOMINATOR: FormulaPart[] = [{ term: 'delta', text: '(p₂ − p₁)²' }];

type Control = 'baseline' | 'mde' | 'alpha' | 'power';
const isControl = (c: string | undefined): c is Control =>
  c === 'baseline' || c === 'mde' || c === 'alpha' || c === 'power';

export default function UnderTheHood() {
  const [mde, setMde] = useState(DEFAULTS.mde);
  const [baseline, setBaseline] = useState(DEFAULTS.baseline);
  const [alpha, setAlpha] = useState(DEFAULTS.alpha);
  const [power, setPower] = useState(DEFAULTS.power);
  const [linked, setLinked] = useState<Control | undefined>();
  const r = calculateSampleSize({ baseline, mde, alpha, power });
  const terms = r ? mdeTerms(r, { baseline, mde, alpha, power }) : null;

  return (
    <div className="mde-hood">
      <h3>Formel</h3>
      <p>
        Gerechnet wird für zwei gleich große Gruppen und einen zweiseitigen Test, der Unterschied steht in
        Prozentpunkten.
      </p>
      {terms ? (
        <InteractiveFormula
          ariaLabel="n ungefähr gleich: z von 1 minus Alpha halbe mal Wurzel aus 2 p quer mal 1 minus p quer, plus z von Power mal Wurzel aus p1 mal 1 minus p1 plus p2 mal 1 minus p2, das Ganze zum Quadrat, geteilt durch p2 minus p1 zum Quadrat"
          lead="n ≈"
          numerator={NUMERATOR}
          denominator={DENOMINATOR}
          terms={terms}
          onActiveChange={(c) => setLinked(isControl(c) ? c : undefined)}
        />
      ) : null}

      <p>Probier eigene Werte; die Rechnung unten setzt sie ein. Das ist unabhängig von der Demo oben.</p>
      <div className="mde-hood-controls">
        <div className={`mde-field${linked === 'mde' ? ' is-linked' : ''}`}>
          <Slider
            label="Kleinster Unterschied (Rechnung)"
            value={mde}
            min={MDE_MIN}
            max={MDE_MAX}
            step={0.1}
            onChange={setMde}
            format={formatPoints}
          />
        </div>
        <MoreAssumptions
          baseline={baseline}
          alpha={alpha}
          power={power}
          onBaseline={setBaseline}
          onAlpha={setAlpha}
          onPower={setPower}
          labelSuffix=" (Rechnung)"
          linked={linked === 'mde' ? undefined : linked}
        />
      </div>

      <h3>Schritt für Schritt</h3>
      {r ? (
        <ol className="mde-steps">
          <li>
            <strong>Raten als Anteile:</strong> p₁ = {exact(r.p1)} (heute), p₂ = {exact(r.p1)} + {exact(r.difference)} ={' '}
            {exact(r.p2)} (Ziel), Mittelwert p̄ = {exact(r.pooledProportion)}
          </li>
          <li>
            <strong>Sicherheit als z-Werte:</strong> z(1 − {exact(alpha)}/2) = z({exact(1 - alpha / 2)}) ={' '}
            {sig(r.zAlpha)} für das Signifikanzniveau, z({exact(power)}) = {sig(r.zPower)} für die Power
          </li>
          <li>
            <strong>Streuung ohne Unterschied:</strong> √(2 · {exact(r.pooledProportion)} · {exact(1 - r.pooledProportion)}) ={' '}
            {sig(r.stdNull)}
          </li>
          <li>
            <strong>Streuung mit Unterschied:</strong> √({exact(r.p1)} · {exact(1 - r.p1)} + {exact(r.p2)} ·{' '}
            {exact(1 - r.p2)}) = {sig(r.stdAlternative)}
          </li>
          <li>
            <strong>Zähler:</strong> ({sig(r.zAlpha)} · {sig(r.stdNull)} + {sig(r.zPower)} · {sig(r.stdAlternative)})² ={' '}
            {sig(r.raw * r.difference ** 2)}
          </li>
          <li>
            <strong>Nenner:</strong> ({exact(r.difference)})² = {sig(r.difference ** 2)}
          </li>
          <li>
            <strong>Ergebnis:</strong> n = {formatNumber(r.raw, 2)}, aufgerundet{' '}
            <strong>{formatNumber(r.perVariant)} Personen je Variante</strong>, {formatNumber(r.total)} insgesamt
          </li>
        </ol>
      ) : (
        <p className="mde-warning" role="status">
          <strong>Hinweis:</strong> Diese Kombination geht nicht, die Zielrate läge bei 100 % oder darüber.
        </p>
      )}

      <h3>Annahmen und Grenzen</h3>
      <ul className="mde-limits">
        {LIMITS.map((l) => (
          <li key={l}>{l}</li>
        ))}
      </ul>

      <h3>Zum Weiterlesen</h3>
      <Disclosure summary="Gegenprobe mit R">
        <p>
          Dieselbe Rechnung steckt in der R-Funktion{' '}
          <a href={R_DOC} target="_blank" rel="noreferrer">
            <code>power.prop.test</code>
          </a>
          . Ihr Dokumentationsbeispiel <code>power.prop.test(p1 = 0.50, p2 = 0.75, power = 0.90)</code> ergibt n ≈ 76,7;
          dieses Modul rechnet 76,71 und rundet auf 77 je Variante. Für deine Werte oben lautet der Aufruf:
        </p>
        {r ? (
          <CodeBlock
            code={`power.prop.test(p1 = ${Number(r.p1.toFixed(6))}, p2 = ${Number(r.p2.toFixed(6))}, sig.level = ${alpha}, power = ${power})`}
            label="R-Aufruf"
          />
        ) : null}
      </Disclosure>
    </div>
  );
}
