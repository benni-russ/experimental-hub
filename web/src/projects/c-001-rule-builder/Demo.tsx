import { useId, useLayoutEffect, useMemo, useReducer, useRef, useState } from 'react';
import { Button } from '../../design/components/Button';
import { InsightBox } from '../../design/components/InsightBox';
import { SegmentedControl } from '../../design/components/SegmentedControl';
import {
  ATTRIBUTES,
  DEFAULT_ID,
  START_EXPERIENCES,
  allVisitorKinds,
  decide,
  reach,
  type Strategy,
} from '../../personalization/rules';
import { VISITORS } from '../../personalization/visitors';
import { DecisionPath } from './DecisionPath';
import { ReachTable } from './ReachTable';
import { RuleEditor } from './RuleEditor';
import { ruleReducer, type RuleAction } from './state';
import './ruleBuilder.css';

const STRATEGIES: { value: Strategy; label: string }[] = [
  { value: 'priority', label: 'Erste passende' },
  { value: 'specificity', label: 'Spezifischste' },
];

const STRATEGY_HINT: Record<Strategy, string> = {
  priority: 'Von oben nach unten: Das erste Erlebnis, dessen Bedingungen alle zutreffen, gewinnt.',
  specificity: 'Es gewinnt das passende Erlebnis mit den meisten Bedingungen; bei Gleichstand das weiter oben stehende.',
};

export default function Demo() {
  const id = useId();
  const [experiences, dispatch] = useReducer(ruleReducer, START_EXPERIENCES);
  const [strategy, setStrategy] = useState<Strategy>('priority');
  const [visitorId, setVisitorId] = useState(VISITORS[0]!.id);
  const [announcement, setAnnouncement] = useState('');
  const focusAfter = useRef<string | null>(null);
  const root = useRef<HTMLDivElement>(null);

  const reachById = useMemo(() => reach(experiences, strategy), [experiences, strategy]);
  const results = useMemo(
    () => VISITORS.map((v) => ({ visitor: v, ...decide(experiences, v.traits, strategy) })),
    [experiences, strategy],
  );
  const selected = results.find((r) => r.visitor.id === visitorId) ?? results[0]!;
  const nameOf = (winnerId: string) =>
    winnerId === DEFAULT_ID ? 'Standard' : (experiences.find((e) => e.id === winnerId)?.name ?? winnerId);

  // Nach dem Verschieben bleibt der Fokus beim Knopf; am Rand springt er zum anderen Knopf.
  useLayoutEffect(() => {
    const key = focusAfter.current;
    if (!key) return;
    focusAfter.current = null;
    const [expId, dir] = key.split(':');
    const first = root.current?.querySelector<HTMLButtonElement>(`[data-move="${expId}:${dir}"]`);
    const other = root.current?.querySelector<HTMLButtonElement>(`[data-move="${expId}:${dir === 'up' ? 'down' : 'up'}"]`);
    (first && !first.disabled ? first : other)?.focus();
  }, [experiences]);

  function act(action: RuleAction) {
    if (action.type === 'move') {
      focusAfter.current = `${action.id}:${action.direction}`;
      const from = experiences.findIndex((e) => e.id === action.id);
      const to = action.direction === 'up' ? from - 1 : from + 1;
      const name = experiences[from]?.name;
      if (name && to >= 0 && to < experiences.length) setAnnouncement(`${name} steht jetzt an Position ${to + 1} von ${experiences.length}.`);
    } else if (action.type === 'reset') {
      setAnnouncement('Startstand wiederhergestellt.');
    }
    dispatch(action);
  }

  const shadowed = experiences.filter((e) => {
    const r = reachById[e.id];
    return r !== undefined && r.matches > 0 && r.wins === 0;
  });
  const kinds = allVisitorKinds().length;

  return (
    <div className="rb-demo" ref={root}>
      <div className="rb-toolbar">
        <div className="rb-field">
          <span id={`${id}-strategy`} className="rb-label">
            Konfliktregel
          </span>
          <SegmentedControl
            label="Konfliktregel"
            labelledBy={`${id}-strategy`}
            describedBy={`${id}-strategy-hint`}
            options={STRATEGIES}
            value={strategy}
            onChange={setStrategy}
          />
          <p id={`${id}-strategy-hint`} className="rb-hint">
            {STRATEGY_HINT[strategy]}
          </p>
        </div>
        <Button variant="secondary" onClick={() => act({ type: 'reset' })}>
          Zurücksetzen
        </Button>
      </div>

      <div className="rb-columns">
        <RuleEditor experiences={experiences} dispatch={act} />

        <div className="rb-side">
          <section className="rb-panel" aria-labelledby={`${id}-visitors`}>
            <h3 id={`${id}-visitors`}>Besucher und ihr Erlebnis</h3>
            <p className="rb-hint">Wähl einen Besucher, um den Entscheidungsweg zu sehen.</p>
            <ul className="rb-visitors">
              {results.map((r) => {
                const t = r.visitor.traits;
                return (
                  <li key={r.visitor.id}>
                    <button
                      type="button"
                      className="rb-visitor"
                      aria-pressed={r.visitor.id === selected.visitor.id}
                      onClick={() => setVisitorId(r.visitor.id)}
                    >
                      <span className="rb-visitor-name">{r.visitor.name}</span>
                      <span className="rb-visitor-traits">
                        {ATTRIBUTES.map((a) => a.values.find((v) => v.value === t[a.id])?.label).join(' · ')}
                      </span>
                      <span className="rb-visitor-result">
                        sieht: <strong>{nameOf(r.winnerId)}</strong>
                      </span>
                    </button>
                  </li>
                );
              })}
            </ul>
          </section>

          <DecisionPath
            experiences={experiences}
            steps={selected.steps}
            winnerId={selected.winnerId}
            traits={selected.visitor.traits}
            visitorName={selected.visitor.name}
            headingId={`${id}-path`}
          />
        </div>
      </div>

      <ReachTable experiences={experiences} reachById={reachById} headingId={`${id}-reach`} />

      {shadowed.length > 0 ? (
        <InsightBox title="Überdeckt: vorhanden, aber ohne Wirkung">
          {shadowed.map((e) => `„${e.name}“`).join(' und ')} passt auf einen Teil der {kinds} Besucherarten, wird aber bei keiner ausgespielt:
          Davor greift immer schon ein anderes Erlebnis. Schieb die Regel nach oben, mach ihre Bedingungen enger oder probier die Konfliktregel
          „Spezifischste“.
        </InsightBox>
      ) : null}

      <p className="visually-hidden" aria-live="polite" aria-atomic="true">
        {announcement}
      </p>
    </div>
  );
}
