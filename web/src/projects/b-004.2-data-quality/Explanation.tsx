import { BROKEN_LABELS } from '../b-004-ga4-event-builder/fixtures';
import { CASES, CHECKLIST, codesOf } from './cases';
import './quality.css';

const SOURCES = [
  {
    href: 'https://developers.google.com/analytics/devguides/collection/ga4/ecommerce?client_type=gtm',
    title: 'Measure ecommerce',
    where: 'Google for Developers, Variante Google Tag Manager',
  },
  {
    href: 'https://support.google.com/analytics/answer/13316687',
    title: 'Event naming rules',
    where: 'Analytics-Hilfe',
  },
  {
    href: 'https://support.google.com/analytics/answer/12313109',
    title: 'Transaction ID (Measure ecommerce)',
    where: 'Analytics-Hilfe',
  },
  {
    href: 'https://support.google.com/analytics/answer/1009667',
    title: 'What the value (not set) means in your reports',
    where: 'Analytics-Hilfe',
  },
];

export default function Explanation() {
  return (
    <div className="dq-explain">
      <h3>Nichts wird abgelehnt</h3>
      <p>
        <code>dataLayer.push</code> ist ein gewöhnlicher Listen-Aufruf. Er prüft nichts und gibt nur die neue Länge der
        Liste zurück, die Seite merkt von einem kaputten Event also nichts. Auch GA4 antwortet nicht mit einer
        Fehlermeldung: Die Daten landen trotzdem in den Berichten, falsch oder unvollständig. Das Problem zeigt sich
        erst dort oder im DebugView.
      </p>

      <h3>Fünf Fehler und ihre Folgen</h3>
      <div
        className="dq-wrap"
        tabIndex={0}
        role="region"
        aria-label="Tabelle: Fehlerfälle, Code des Prüfers und Folge, seitlich verschiebbar"
      >
        <table className="dq-table">
          <caption>Der Code stammt live vom Prüfer aus B-004</caption>
          <thead>
            <tr>
              <th scope="col">Fall</th>
              <th scope="col">Code des Prüfers</th>
              <th scope="col">Folge</th>
            </tr>
          </thead>
          <tbody>
            {CASES.map((c) => (
              <tr key={c.id}>
                <th scope="row">{BROKEN_LABELS[c.id]}</th>
                <td>
                  <code>{codesOf(c.id).join(', ')}</code>
                </td>
                <td>{c.effect}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <h3>
        Und was heißt <code>(not set)</code>?
      </h3>
      <p>
        In Berichten steht manchmal <code>(not set)</code>. Das ist laut Google ein Platzhalter, den Analytics
        verwendet, wenn zu einer Dimension keine Information angekommen ist. Fehlt in einem Event ein Feld, kann deshalb
        in der zugehörigen Spalte <code>(not set)</code> stehen. Welche Ursache dahintersteckt, hängt von der Dimension
        ab; für einzelne Berichte lässt sich das hier nicht pauschal sagen.
      </p>

      <h3>Was man vor dem Livegang prüft</h3>
      <ol>
        {CHECKLIST.map((c) => (
          <li key={c.text}>
            {c.text} Prüfer: <code>{c.codes.join(', ')}</code>
          </li>
        ))}
      </ol>
      <p>
        Danach lohnt sich ein Test-Event im DebugView, bevor echte Käufe fließen. Der Prüfer aus B-004 fängt die Fehler
        oben ab, kennt aber nicht alles, was Google regelt.
      </p>

      <h3>Quellen</h3>
      <p>Stand: Oktober 2026 (abgerufen am 26.10.2026).</p>
      <ul>
        {SOURCES.map((s) => (
          <li key={s.href}>
            <a href={s.href} target="_blank" rel="noreferrer">
              {s.title}
            </a>{' '}
            ({s.where}, englisch)
          </li>
        ))}
      </ul>
    </div>
  );
}
