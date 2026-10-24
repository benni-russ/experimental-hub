import { useId } from 'react';
import { SegmentedControl } from '../../design/components/SegmentedControl';
import { Slider } from '../../design/components/Slider';
import { formatNumber } from '../../learning/numbers';

export const DEFAULTS = { baseline: 10, mde: 1, alpha: 0.05, power: 0.8 };

export const ALPHA_OPTIONS = [
  { value: 0.01, label: '0,01' },
  { value: 0.05, label: '0,05' },
  { value: 0.1, label: '0,10' },
];

export const POWER_OPTIONS = [
  { value: 0.7, label: '70 %' },
  { value: 0.8, label: '80 %' },
  { value: 0.9, label: '90 %' },
];

export const isWhole = (v: number) => Math.abs(v - Math.round(v)) < 1e-9;
export const formatPercent = (v: number, digits = 0) => `${formatNumber(v, digits)} %`;
/** 11 % statt 11,0 %; 10,3 % mit einer Stelle */
export const formatRate = (v: number) => formatPercent(v, isWhole(v) ? 0 : 1);
export const formatPoints = (v: number) => `${formatNumber(v, 1)} Prozentpunkte`;

/** „5 von 100“ aus 0,05; „8 von 10“ aus 0,8. */
export function outOf(probability: number, base: 10 | 100): string {
  return `${formatNumber(probability * base)} von ${base}`;
}

function LabelledSegmented({
  label,
  hint,
  options,
  value,
  onChange,
  linked,
}: {
  label: string;
  hint: string;
  options: { value: number; label: string }[];
  value: number;
  onChange: (v: number) => void;
  /** Hülle hervorgehoben, weil ein Formelterm auf diesen Regler zeigt */
  linked?: boolean;
}) {
  const id = useId();
  const labelId = `${id}-label`;
  const hintId = `${id}-hint`;
  return (
    <div className={`mde-field${linked ? ' is-linked' : ''}`}>
      <span id={labelId} className="mde-field-label">
        {label}
      </span>
      <SegmentedControl
        label={label}
        labelledBy={labelId}
        describedBy={hintId}
        options={options}
        value={value}
        onChange={onChange}
      />
      <p id={hintId} className="mde-field-hint">
        {hint}
      </p>
    </div>
  );
}

/** Baseline, Signifikanzniveau und Power: die „weiteren Annahmen“. */
export function MoreAssumptions({
  baseline,
  alpha,
  power,
  onBaseline,
  onAlpha,
  onPower,
  labelSuffix = '',
  linked,
}: {
  baseline: number;
  alpha: number;
  power: number;
  onBaseline: (v: number) => void;
  onAlpha: (v: number) => void;
  onPower: (v: number) => void;
  /** z. B. „ (Rechnung)“, wenn eine zweite Reglergruppe auf derselben Seite steht */
  labelSuffix?: string;
  /** Regler, den ein Formelterm gerade meint (Hülle bekommt `.is-linked`) */
  linked?: 'baseline' | 'alpha' | 'power';
}) {
  return (
    <div className="mde-assumptions">
      <div className={`mde-field${linked === 'baseline' ? ' is-linked' : ''}`}>
        <Slider
          label={`Ausgangsrate (Baseline): so viele kaufen heute${labelSuffix}`}
          value={baseline}
          min={1}
          max={50}
          step={1}
          onChange={onBaseline}
          format={(v) => formatPercent(v)}
        />
        <p className="mde-field-hint">Die heutige Rate ohne Änderung, von der aus der Unterschied gemessen wird.</p>
      </div>
      <LabelledSegmented
        label={`Signifikanzniveau${labelSuffix}`}
        hint={`Gibt es keinen Unterschied, täuscht der Zufall in ${outOf(alpha, 100)} Fällen einen vor.`}
        options={ALPHA_OPTIONS}
        value={alpha}
        onChange={onAlpha}
        linked={linked === 'alpha'}
      />
      <LabelledSegmented
        label={`Power${labelSuffix}`}
        hint={`Gibt es den Unterschied wirklich, zeigt der Test ihn in rund ${outOf(power, 10)} Fällen.`}
        options={POWER_OPTIONS}
        value={power}
        onChange={onPower}
        linked={linked === 'power'}
      />
    </div>
  );
}
