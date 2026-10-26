import { useId } from 'react';
import { Switch } from '../../design/components/Switch';
import { FIXES, type FixId, type VitalsFixes } from '../../experience/vitals';
import { METRICS, METRIC_NAME } from './insights';

interface FixListProps {
  fixes: VitalsFixes;
  onChange: (fixes: VitalsFixes) => void;
}

/** Hauptschalter „Alle Gegenmittel“ und je Zielkennzahl eine Gruppe von Schaltern. */
export function FixList({ fixes, onChange }: FixListProps) {
  const id = useId();
  const allOn = FIXES.every((f) => fixes[f.id]);
  const setAll = (on: boolean) => onChange(Object.fromEntries(FIXES.map((f) => [f.id, on])) as VitalsFixes);
  const set = (fix: FixId, on: boolean) => onChange({ ...fixes, [fix]: on });

  return (
    <fieldset className="wv-fixes">
      <legend>Gegenmittel</legend>
      <div className="wv-fixes-master">
        {/* An nur, wenn alle an sind; aus einem Teilstand schaltet er alle an. */}
        <Switch label="Alle Gegenmittel" checked={allOn} onChange={() => setAll(!allOn)} />
      </div>
      <div className="wv-fix-groups">
        {METRICS.map((m) => (
          <div key={m} className="wv-fix-group" role="group" aria-labelledby={`${id}-${m}`}>
            <p className="wv-fix-target" id={`${id}-${m}`}>
              Zielt auf {METRIC_NAME[m]}
            </p>
            <ul className="wv-fix-list">
              {FIXES.filter((f) => f.targets === m).map((f) => (
                <li key={f.id}>
                  <Switch label={f.label} checked={Boolean(fixes[f.id])} onChange={(on) => set(f.id, on)} />
                </li>
              ))}
            </ul>
          </div>
        ))}
      </div>
    </fieldset>
  );
}
