import { useId } from 'react';
import { Link } from 'react-router';
import { InsightBox } from '../../design/components/InsightBox';
import { SegmentedControl } from '../../design/components/SegmentedControl';
import { SCENARIOS, type Direction, type ScenarioId } from '../../experience/funnel';
import { DIRECTION_WORD, KPI_ROWS, formatChange, runScenario, scenarioInsight } from './insights';

export const SCENARIO_OPTIONS = SCENARIOS.map((s) => ({ value: s.id, label: s.label }));

// Gezeichnete Pfeile im Strichmaß der App: hoch, runter, Gleichheitszeichen. Keine Schriftglyphen
// (DESIGN.md); das Wort steht immer daneben.
export function DirectionMark({ direction }: { direction: Direction }) {
  return (
    <svg className="fn-mark" width="12" height="12" viewBox="0 0 12 12" fill="none" aria-hidden="true">
      {direction === 'up' ? <path d="M6 10.5V2M2.5 5.5L6 2l3.5 3.5" /> : null}
      {direction === 'down' ? <path d="M6 1.5V10M2.5 6.5L6 10l3.5-3.5" /> : null}
      {direction === 'same' ? <path d="M2 4.5h8M2 7.5h8" /> : null}
    </svg>
  );
}

/** Richtung als neutrale Pille: Pfeil und Wort. „Steigt“ ist nicht von sich aus gut, darum keine Wertungsfarbe. */
export function DirectionTag({ direction }: { direction: Direction }) {
  return (
    <span className="tag fn-direction">
      <DirectionMark direction={direction} /> {DIRECTION_WORD[direction]}
    </span>
  );
}

/** Widerspruch oder gleiche Richtung, mit Zeichen und Wort. */
export function ConflictTag({ conflict }: { conflict: boolean }) {
  return conflict ? (
    <span className="tag fn-conflict">
      <svg className="fn-mark" width="12" height="12" viewBox="0 0 12 12" fill="none" aria-hidden="true">
        <path d="M2 4h6.5M6.5 2L8.5 4 6.5 6M10 8H3.5M5.5 6L3.5 8l2 2" />
      </svg>{' '}
      Widerspruch
    </span>
  ) : (
    <span className="tag fn-agree">
      <svg className="fn-mark" width="12" height="12" viewBox="0 0 12 12" fill="none" aria-hidden="true">
        <path d="M2 6.5l2.5 2.5L10 3" />
      </svg>{' '}
      gleiche Richtung
    </span>
  );
}

interface ScenarioTableProps {
  scenario: ScenarioId;
  onScenario: (id: ScenarioId) => void;
}

/** Auswahl der Szenarien, Vorher/Nachher-Tabelle und Erkenntnis mit den gezeigten Zahlen. */
export function ScenarioTable({ scenario, onScenario }: ScenarioTableProps) {
  const labelId = useId();
  const { scenario: s, comparison } = runScenario(scenario);

  return (
    <div className="fn-scenarios">
      <div className="fn-control">
        <span id={labelId} className="fn-control-label">
          Szenario
        </span>
        <SegmentedControl label="Szenario" labelledBy={labelId} options={SCENARIO_OPTIONS} value={scenario} onChange={onScenario} />
      </div>
      <div className="fn-scenario-head">
        <p className="fn-scenario-text">{s.description}</p>
        <div className="fn-scenario-tags">
          <span className="tag fn-invented">Effekte erfunden</span>
          <ConflictTag conflict={comparison.conflict} />
        </div>
      </div>
      <div className="table-scroll fn-table" tabIndex={0} role="region" aria-label={`Kennzahlen vorher und nachher: ${s.label}`}>
        <table>
          <thead>
            <tr>
              <th scope="col">Kennzahl</th>
              <th scope="col">Vorher</th>
              <th scope="col">Nachher</th>
              <th scope="col">Änderung</th>
            </tr>
          </thead>
          <tbody>
            {KPI_ROWS.map((row) => {
              const c = comparison.changes[row.key];
              return (
                <tr key={row.key}>
                  <th scope="row">{row.label}</th>
                  <td className="fn-num">{row.format(c.before)}</td>
                  <td className="fn-num">{row.format(c.after)}</td>
                  <td>
                    <span className="fn-change">
                      <span className="fn-num">{formatChange(c)}</span> <DirectionTag direction={c.direction} />
                    </span>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
      <InsightBox title={comparison.conflict ? 'Kennzahlen im Widerspruch' : 'Kennzahlen in gleicher Richtung'}>
        <p className="fn-insight-text">{scenarioInsight(scenario)}</p>
        {scenario === 'socialCampaign' ? (
          <p className="fn-insight-text">
            Wie ein Gesamtwert kippen kann, obwohl jede Gruppe gleich bleibt, zeigt das <Link to="/projekt/A-004">Simpson-Paradox (A-004)</Link>.
          </p>
        ) : null}
      </InsightBox>
    </div>
  );
}
