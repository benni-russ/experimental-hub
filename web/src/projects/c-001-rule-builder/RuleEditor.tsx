import { useId } from 'react';
import { Button } from '../../design/components/Button';
import { ATTRIBUTES, type Attribute, type Condition, type Experience } from '../../personalization/rules';
import type { RuleAction } from './state';

interface RuleEditorProps {
  experiences: Experience[];
  dispatch: (action: RuleAction) => void;
}

const valuesOf = (attribute: Attribute) => ATTRIBUTES.find((a) => a.id === attribute)?.values ?? [];

/** Die Liste der Erlebnisse in Prioritätsreihenfolge, darunter der feste Standard. */
export function RuleEditor({ experiences, dispatch }: RuleEditorProps) {
  const id = useId();
  return (
    <section className="rb-panel" aria-labelledby={`${id}-h`}>
      <h3 id={`${id}-h`}>Erlebnisse nach Priorität</h3>
      <p className="rb-hint">Ein Erlebnis passt, wenn alle seine Bedingungen zutreffen. Oben steht die höchste Priorität.</p>
      <ol className="rb-rules">
        {experiences.map((exp, i) => (
          <li key={exp.id} className="rb-rule">
            <div className="rb-rule-head">
              <h4>
                <span className="rb-rule-no">Regel {i + 1}</span> {exp.name}
              </h4>
              <div className="rb-move">
                <Button
                  variant="quiet"
                  data-move={`${exp.id}:up`}
                  disabled={i === 0}
                  aria-label={`${exp.name} nach oben`}
                  onClick={() => dispatch({ type: 'move', id: exp.id, direction: 'up' })}
                >
                  Nach oben
                </Button>
                <Button
                  variant="quiet"
                  data-move={`${exp.id}:down`}
                  disabled={i === experiences.length - 1}
                  aria-label={`${exp.name} nach unten`}
                  onClick={() => dispatch({ type: 'move', id: exp.id, direction: 'down' })}
                >
                  Nach unten
                </Button>
              </div>
            </div>
            {exp.conditions.length === 0 ? (
              <p className="rb-hint">Ohne Bedingung: passt auf alle Besucher.</p>
            ) : (
              <ul className="rb-conditions">
                {exp.conditions.map((c, ci) => (
                  <ConditionRow key={ci} exp={exp} condition={c} index={ci} dispatch={dispatch} />
                ))}
              </ul>
            )}
            <div>
              <Button variant="secondary" onClick={() => dispatch({ type: 'addCondition', id: exp.id })}>
                <span className="visually-hidden">{exp.name}: </span>Bedingung hinzufügen
              </Button>
            </div>
          </li>
        ))}
        <li className="rb-rule rb-rule-default">
          <h4>
            <span className="rb-rule-no">Standard</span> Gilt, wenn nichts anderes passt
          </h4>
          <p className="rb-hint">Fest am Ende der Liste und nicht änderbar: Er passt immer und fängt alle übrigen Besucher auf.</p>
        </li>
      </ol>
    </section>
  );
}

function ConditionRow({
  exp,
  condition,
  index,
  dispatch,
}: {
  exp: Experience;
  condition: Condition;
  index: number;
  dispatch: (action: RuleAction) => void;
}) {
  const where = `${exp.name}, Bedingung ${index + 1}`;
  const change = (patch: Partial<Condition>) => dispatch({ type: 'changeCondition', id: exp.id, index, patch });
  return (
    <li className="rb-condition">
      <select
        className="input"
        aria-label={`${where}: Merkmal`}
        value={condition.attribute}
        onChange={(e) => change({ attribute: e.target.value as Attribute })}
      >
        {ATTRIBUTES.map((a) => (
          <option key={a.id} value={a.id}>
            {a.label}
          </option>
        ))}
      </select>
      <select
        className="input"
        aria-label={`${where}: ist oder ist nicht`}
        value={condition.operator}
        onChange={(e) => change({ operator: e.target.value as Condition['operator'] })}
      >
        <option value="is">ist</option>
        <option value="isNot">ist nicht</option>
      </select>
      <select
        className="input"
        aria-label={`${where}: Wert`}
        value={condition.value}
        onChange={(e) => change({ value: e.target.value })}
      >
        {valuesOf(condition.attribute).map((v) => (
          <option key={v.value} value={v.value}>
            {v.label}
          </option>
        ))}
      </select>
      <Button
        variant="quiet"
        aria-label={`${where} entfernen`}
        onClick={() => dispatch({ type: 'removeCondition', id: exp.id, index })}
      >
        Entfernen
      </Button>
    </li>
  );
}
