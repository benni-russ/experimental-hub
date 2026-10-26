import { useId, useState } from 'react';
import { SegmentedControl } from '../../design/components/SegmentedControl';
import { STATUS_CODES } from '../../http/statusCodes';
import { useCalmSentence } from '../../learning/useCalmSentence';
import { RequestBuilder } from './RequestBuilder';
import { demoServer, SCENARIOS, sendDraft, type RequestDraft, type ScenarioId, type SendResult } from './scenarios';
import './http.css';

const OPTIONS = (Object.keys(SCENARIOS) as ScenarioId[]).map((id) => ({ value: id, label: SCENARIOS[id].label }));

// Was die Antwort für den Absender bedeutet; steht unter der Einordnung.
const HINT: Record<number, string> = {
  200: 'Alles gut: Die Antwort enthält, was du angefragt hast.',
  201: 'Etwas Neues wurde angelegt. Der Header location nennt, wo es jetzt liegt.',
  204: 'Es hat geklappt, aber es gibt nichts zurückzugeben: Der Body ist leer.',
  400: 'Die Anfrage selbst stimmt nicht, hier fehlt der Name. Korrigiere sie, bevor du sie noch einmal schickst.',
  401: 'Der Server weiß nicht, wer du bist. Füge den Header authorization mit dem Wert Bearer demo hinzu.',
  404: 'Diesen Pfad oder dieses Produkt gibt es nicht. Neu senden ändert daran nichts.',
  500: 'Der Fehler liegt beim Server. Ein neuer Versuch kann klappen.',
  503: 'Der Server ist gerade überlastet. Drück noch einmal auf Senden: Die Antwort wechselt zwischen 503 und 500.',
};

const cloneDraft = (d: RequestDraft): RequestDraft => ({ ...d, headers: d.headers.map(([n, v]): [string, string] => [n, v]) });

export default function Demo() {
  const labelId = useId();
  const [server] = useState(demoServer);
  const [scenario, setScenario] = useState<ScenarioId | 'custom'>('load');
  const [draft, setDraft] = useState<RequestDraft>(() => cloneDraft(SCENARIOS.load.draft));
  const [result, setResult] = useState<SendResult | null>(null);
  const [busy, setBusy] = useState(false);

  function pick(id: ScenarioId) {
    setScenario(id);
    setDraft(cloneDraft(SCENARIOS[id].draft));
    setResult(null);
  }

  async function send() {
    setBusy(true);
    const r = await sendDraft(server, draft);
    setResult(r);
    setBusy(false);
  }

  const info = result?.status != null ? STATUS_CODES.find((s) => s.status === result.status) : undefined;
  const sentence = !result
    ? ''
    : result.error
      ? result.error
      : info
        ? `Antwort ${info.status}, ${info.text}. ${info.whoseFault === 'niemand' ? 'Kein Fehler.' : `Fehler beim ${info.whoseFault}.`}`
        : `Antwort ${result.status}.`;
  const announced = useCalmSentence(sentence);

  return (
    <div className="http-demo">
      <div className="http-scenarios">
        <span id={labelId} className="http-label">
          Szenario
        </span>
        <SegmentedControl
          label="Szenario"
          labelledBy={labelId}
          options={OPTIONS}
          value={scenario as ScenarioId}
          onChange={pick}
        />
      </div>

      <RequestBuilder
        draft={draft}
        onChange={(d) => {
          setScenario('custom');
          setDraft(d);
        }}
        onSend={() => void send()}
        disabled={busy}
      />

      {result ? (
        result.error ? (
          <p className="http-problem" role="alert">
            {result.error}
          </p>
        ) : (
          <>
            <div className="http-panels">
              <section className="http-panel" aria-labelledby={`${labelId}-req`}>
                <h3 id={`${labelId}-req`}>Anfrage</h3>
                <pre className="http-raw" tabIndex={0} role="region" aria-label="Rohtext der Anfrage">
                  {result.rawRequest}
                </pre>
              </section>
              <section className="http-panel" aria-labelledby={`${labelId}-res`}>
                <h3 id={`${labelId}-res`}>Antwort</h3>
                <pre className="http-raw" tabIndex={0} role="region" aria-label="Rohtext der Antwort">
                  {result.rawResponse}
                </pre>
              </section>
            </div>

            <section
              className={`http-verdict http-verdict-${info?.klass ?? 'none'}`}
              aria-labelledby={`${labelId}-verdict`}
            >
              <h3 id={`${labelId}-verdict`}>Einordnung</h3>
              {info ? (
                <>
                  <p className="http-verdict-code">
                    <strong>{info.status}</strong> {info.text}
                  </p>
                  <dl className="http-facts">
                    <div>
                      <dt>Klasse</dt>
                      <dd>{info.klass}</dd>
                    </div>
                    <div>
                      <dt>Wessen Fehler?</dt>
                      <dd>{info.whoseFault === 'niemand' ? 'Keiner, es hat geklappt' : info.whoseFault}</dd>
                    </div>
                    <div>
                      <dt>Erneut versuchen?</dt>
                      <dd>{info.retry ? 'Ja, das kann sich lohnen' : 'Nein, so gibt es dieselbe Antwort'}</dd>
                    </div>
                  </dl>
                  {HINT[info.status] ? <p className="http-hint">{HINT[info.status]}</p> : null}
                </>
              ) : (
                <p className="http-muted">Diesen Statuscode kennt die Tabelle nicht.</p>
              )}
            </section>
          </>
        )
      ) : (
        <p className="http-muted">Noch nichts gesendet. Wähle ein Szenario oder baue eine Anfrage und drücke auf Senden.</p>
      )}

      <p className="visually-hidden" aria-live="polite" aria-atomic="true">
        {announced}
      </p>
    </div>
  );
}
