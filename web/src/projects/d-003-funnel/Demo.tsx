import { useMemo, useState } from 'react';
import type { ScenarioId } from '../../experience/funnel';
import { FunnelBars, type SourceChoice } from './FunnelBars';
import {
  NO_LIFTS,
  funnelFor,
  liftAnnouncement,
  liftedState,
  scenarioAnnouncement,
  sourceAnnouncement,
  type Lifts,
} from './insights';
import { LiftSliders } from './LiftSliders';
import { ScenarioTable } from './ScenarioTable';
import { TestSize } from './TestSize';
import './funnel.css';

// Ein Shop mit vier Quellen: Funnel mit Quellenumschalter, vier Regler je Übergang, Stichprobe für
// einen Test und vier Szenarien. Jeder Besuch startet ohne Regler; nichts wird gespeichert.
export default function Demo() {
  const [source, setSource] = useState<SourceChoice>('all');
  const [lifts, setLifts] = useState<Lifts>(NO_LIFTS);
  const [resetKey, setResetKey] = useState(0);
  const [scenario, setScenario] = useState<ScenarioId>('discount');
  // Live-Regionen sind immer da und werden nur gefüllt; der Fokus bleibt, wo er ist.
  const [funnelMessage, setFunnelMessage] = useState('');
  const [scenarioMessage, setScenarioMessage] = useState('');

  const funnel = useMemo(() => funnelFor(source, lifts), [source, lifts]);
  const shop = useMemo(() => liftedState(lifts), [lifts]);

  const changeSource = (next: SourceChoice) => {
    if (next === source) return;
    setSource(next);
    setFunnelMessage(sourceAnnouncement(next, lifts));
  };
  const commitLift = (next: Lifts, index: number) => {
    setLifts(next);
    setFunnelMessage(liftAnnouncement(next, index));
  };
  const reset = () => {
    if (lifts.every((l) => l === 0)) return;
    setLifts(NO_LIFTS);
    setResetKey((k) => k + 1);
    setFunnelMessage(`Alle Regler auf 0. ${sourceAnnouncement(source, NO_LIFTS)}`);
  };
  const changeScenario = (next: ScenarioId) => {
    if (next === scenario) return;
    setScenario(next);
    setScenarioMessage(scenarioAnnouncement(next));
  };

  return (
    <div className="fn-demo">
      <section className="fn-section" aria-labelledby="fn-h-funnel">
        <h3 id="fn-h-funnel">Wo die Besuche bleiben</h3>
        <p className="fn-hint">
          Ein Monat in einem kleinen Shop, von vier Quellen zusammen. Jeder Balken ist eine Stufe; dazwischen steht, welcher Anteil weitergeht und wie viele
          verloren gehen.
        </p>
        <FunnelBars funnel={funnel} source={source} onSource={changeSource} />
      </section>

      <section className="fn-section" aria-labelledby="fn-h-lifts">
        <h3 id="fn-h-lifts">Selbst drehen</h3>
        <p className="fn-hint">
          Verändere jeden Übergang relativ, von −50 % bis +50 %. Die Balken oben rechnen mit, die Kennzahlen hier gelten für den ganzen Shop. Keine Quote steigt über
          100 %.
        </p>
        <LiftSliders lifts={lifts} kpis={shop.kpis} onChange={setLifts} onCommit={commitLift} onReset={reset} resetKey={resetKey} />
        <p className="visually-hidden" aria-live="polite">
          {funnelMessage}
        </p>
      </section>

      <section className="fn-section" aria-labelledby="fn-h-test">
        <h3 id="fn-h-test">Lohnt sich ein Test?</h3>
        <TestSize lifts={lifts} />
      </section>

      <section className="fn-section" aria-labelledby="fn-h-scenarios">
        <h3 id="fn-h-scenarios">Szenarien</h3>
        <p className="fn-hint">
          Vier Ideen, jeweils gegen den Start ohne deine Regler gerechnet. Die Wirkungen der Ideen sind erfunden, die Rechnung dahinter nicht.
        </p>
        <ScenarioTable scenario={scenario} onScenario={changeScenario} />
        <p className="visually-hidden" aria-live="polite">
          {scenarioMessage}
        </p>
      </section>
    </div>
  );
}
