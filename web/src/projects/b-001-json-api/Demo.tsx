import { useEffect, useId, useRef, useState, type ReactNode } from 'react';
import { Button } from '../../design/components/Button';
import { InsightBox } from '../../design/components/InsightBox';
import { SegmentedControl } from '../../design/components/SegmentedControl';
import { useCalmSentence } from '../../learning/useCalmSentence';
import { ObjectTree } from './ObjectTree';
import { STATION_NAMES, StationRail } from './StationRail';
import { STATION_IDS, walkStations, type CaseId, type StationState } from './stations';
import './jsonApi.css';

const CASES: { value: CaseId; label: string }[] = [
  { value: 'ok', label: 'Alles gut' },
  { value: 'broken-json', label: 'Kaputtes JSON' },
  { value: 'not-found', label: '404 mit HTML' },
  { value: 'empty', label: 'Leere Antwort' },
  { value: 'wrong-type', label: 'Falscher Content-Type' },
];

/** Pause je Station beim langsamen Abspielen */
const STEP_MS = 600;

// Was der Fall zeigt; steht unter der Leiste.
const LESSON: Record<CaseId, { title: string; text: ReactNode }> = {
  ok: {
    title: 'Fünf Stationen, fünfmal geklappt',
    text: (
      <>
        Aus der Antwort wird erst Text, aus dem Text mit <code>JSON.parse</code> ein Array. Erst jetzt kann dein Code
        damit rechnen.
      </>
    ),
  },
  'broken-json': {
    title: 'Status 200, und trotzdem reißt es',
    text: (
      <>
        Der Server meldet Erfolg, der Text kommt vollständig an. Erst <code>JSON.parse</code> scheitert: am Komma nach
        dem letzten Eintrag, das JavaScript erlaubt, JSON aber nicht.
      </>
    ),
  },
  'not-found': {
    title: 'fetch wirft nicht, auch bei 404',
    text: (
      <>
        Es kam eine Antwort, nur eben „nicht gefunden“ als HTML-Seite. <code>res.ok</code> ist <code>false</code>. Wer
        das nicht prüft, scheitert erst an <code>JSON.parse</code>, mit einer Meldung, die nach Tippfehler klingt statt
        nach 404.
      </>
    ),
  },
  empty: {
    title: 'Kein Inhalt ist kein JSON',
    text: (
      <>
        204 heißt „kein Inhalt“ und zählt als Erfolg. Der Rohtext ist leer, und <code>JSON.parse('')</code> wirft.
        Bei 204 liest man den Body am besten gar nicht.
      </>
    ),
  },
  'wrong-type': {
    title: 'Geht trotzdem',
    text: (
      <>
        Der Server nennt den Inhalt <code>text/plain</code>. <code>JSON.parse</code> schaut aber nicht auf Header,
        nur auf den Text, und der ist gültiges JSON. Auch <code>res.json()</code> hätte geklappt.
      </>
    ),
  },
};

const prefersReducedMotion = () =>
  typeof window !== 'undefined' && (window.matchMedia?.('(prefers-reduced-motion: reduce)').matches ?? false);

type Walk = { caseId: CaseId; stations: StationState[]; value?: unknown };

export default function Demo() {
  const labelId = useId();
  const [caseId, setCaseId] = useState<CaseId>('ok');
  const [walk, setWalk] = useState<Walk | null>(null);
  const [shown, setShown] = useState(STATION_IDS.length);
  const timer = useRef<ReturnType<typeof setInterval> | undefined>(undefined);

  const stopPlayback = () => {
    clearInterval(timer.current);
    timer.current = undefined;
  };

  // Jeder Fallwechsel rechnet neu und zeigt sofort alle Stationen.
  useEffect(() => {
    let current = true;
    stopPlayback();
    setShown(STATION_IDS.length);
    void walkStations(caseId).then((r) => {
      if (current) setWalk({ caseId, ...r });
    });
    return () => {
      current = false;
    };
  }, [caseId]);

  useEffect(() => stopPlayback, []);

  function playSlowly() {
    stopPlayback();
    if (prefersReducedMotion()) {
      setShown(STATION_IDS.length);
      return;
    }
    setShown(1);
    timer.current = setInterval(() => {
      setShown((n) => {
        if (n + 1 >= STATION_IDS.length) stopPlayback();
        return Math.min(n + 1, STATION_IDS.length);
      });
    }, STEP_MS);
  }

  // Beim Fallwechsel bleibt die alte Leiste stehen, bis der neue Weg berechnet ist: kein Springen.
  const ready = walk;
  const shownCase = walk?.caseId ?? caseId;
  const stations = ready?.stations ?? [];
  const failed = stations.find((s) => s.status === 'failed');
  const done = shown >= STATION_IDS.length;
  const textStation = stations.find((s) => s.id === 'text');
  const showText = textStation !== undefined && textStation.status !== 'skipped' && shown > STATION_IDS.indexOf('text');
  const showObject = done && ready !== null;

  const caseLabel = CASES.find((c) => c.value === shownCase)?.label ?? '';
  const sentence = !ready
    ? ''
    : !done
      ? `${caseLabel}: Station ${shown} von ${STATION_IDS.length}, ${STATION_NAMES[STATION_IDS[shown - 1]!]}.`
      : failed
        ? `${caseLabel}: Die Kette reißt bei ${STATION_NAMES[failed.id]}. ${failed.error ?? ''}`
        : `${caseLabel}: Alle Stationen geklappt.`;
  const announced = useCalmSentence(sentence);

  return (
    <div className="json-demo">
      <div className="json-controls">
        <div className="json-cases">
          <span id={labelId} className="json-label">
            Fall
          </span>
          <SegmentedControl label="Fall" labelledBy={labelId} options={CASES} value={caseId} onChange={setCaseId} />
        </div>
        <Button variant="secondary" onClick={playSlowly} disabled={!ready}>
          Langsam abspielen
        </Button>
      </div>

      {ready ? <StationRail stations={stations} shown={shown} /> : <p className="json-loading">Lädt …</p>}

      {ready ? (
        <div className="json-panels">
          <section className="json-panel" aria-labelledby={`${labelId}-text`}>
            <h3 id={`${labelId}-text`}>Rohtext</h3>
            {!showText ? (
              <p className="json-muted">Noch nicht gelesen.</p>
            ) : textStation.detail === '' ? (
              <p className="json-muted">Leer. Der Server hat keinen Inhalt geschickt.</p>
            ) : (
              <pre className="json-raw" tabIndex={0} role="region" aria-label="Rohtext der Antwort">
                {textStation.detail}
              </pre>
            )}
          </section>
          <section className="json-panel" aria-labelledby={`${labelId}-object`}>
            <h3 id={`${labelId}-object`}>Objekt</h3>
            {!showObject ? (
              <p className="json-muted">Noch nicht da.</p>
            ) : failed ? (
              <p className="json-muted">Kein Objekt: Die Kette ist bei {STATION_NAMES[failed.id]} gerissen.</p>
            ) : (
              <ObjectTree value={ready.value} label="Antwort" />
            )}
          </section>
        </div>
      ) : null}

      {ready && done ? <InsightBox title={LESSON[shownCase].title}>{LESSON[shownCase].text}</InsightBox> : null}

      <p className="visually-hidden" aria-live="polite" aria-atomic="true">
        {announced}
      </p>
    </div>
  );
}
