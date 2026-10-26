import { useId, useState } from 'react';
import { Button } from '../../design/components/Button';
import { Icon } from '../../design/components/Icon';
import { InsightBox } from '../../design/components/InsightBox';
import { StatusMark } from '../../design/components/StatusTag';
import { audit, BARRIERS, buildPage, isFixed, type Fixes } from '../../experience/productPage';
import { auditSummary, badAltChoice } from './game';

// Ein automatischer Prüfer gegen die Gesamtliste. Liste und Erkenntnis-Kasten rechnen aus demselben
// Stand (auditSummary nutzt dieselbe audit-Funktion), die Zahlen im Satz sind also die der Liste.
export function AuditPanel({ fixes }: { fixes: Fixes }) {
  const id = useId();
  const [ran, setRan] = useState(false);
  // Ansage des Laufs: beim Klick gesetzt, damit spätere Behebungen (die der Fokus schon ansagt) nicht doppelt kommen.
  const [announcement, setAnnouncement] = useState('');
  const reports = audit(buildPage(fixes));
  const reportedIds = new Set(reports.map((r) => r.barrierId));
  const summary = auditSummary(fixes);
  const badAlt = badAltChoice(fixes);

  function run() {
    setRan(true);
    setAnnouncement(summary.text);
  }

  return (
    <section className="a11y-panel a11y-audit" aria-labelledby={`${id}-title`}>
      <h3 id={`${id}-title`}>Automatisch prüfen</h3>
      <p className="a11y-hint">Ein automatischer Prüfer liest nur Eigenschaften der Seite: Farben, Attribute, Überschriftenebenen. Bedienen kann er sie nicht.</p>
      <div>
        <Button variant="secondary" onClick={run}>
          Automatisch prüfen
        </Button>
      </div>
      {/* Die Live-Region steht immer im Baum und wird nur gefüllt, damit die erste Ansage nicht verloren geht. */}
      <p className="visually-hidden a11y-audit-status" aria-live="polite" aria-atomic="true">
        {announcement}
      </p>
      {ran ? (
        <>
          <p className="a11y-hint">Das Ergebnis folgt dem aktuellen Stand der Seite: Behebst du etwas, ändert sich die Liste mit.</p>
          <div className="a11y-audit-grid">
            <div className="a11y-audit-col">
              <h4>Meldungen des Prüfers ({reports.length})</h4>
              {reports.length === 0 ? (
                <p className="a11y-hint">Keine Meldungen.</p>
              ) : (
                <ol className="a11y-reports">
                  {reports.map((r) => (
                    <li key={r.barrierId}>{r.message}</li>
                  ))}
                </ol>
              )}
            </div>
            <div className="a11y-audit-col">
              <h4>Alle {BARRIERS.length} Barrieren</h4>
              <ul className="a11y-all">
                {BARRIERS.map((b) => {
                  const fixed = isFixed(b.id, fixes);
                  const reported = reportedIds.has(b.id);
                  return (
                    <li key={b.id}>
                      <span className="a11y-found-title">{b.title}</span>
                      {fixed ? (
                        <span className="tag tag-done">
                          <StatusMark status="done" /> behoben
                        </span>
                      ) : (
                        <span className={`a11y-verdict ${reported ? 'is-yes' : 'is-no'}`}>
                          <Icon name={reported ? 'check' : 'cross'} size={14} /> findet der Prüfer: {reported ? 'ja' : 'nein'}
                        </span>
                      )}
                    </li>
                  );
                })}
              </ul>
            </div>
          </div>
          <InsightBox title="Was der Prüfer sieht">{summary.text}</InsightBox>
          {badAlt ? (
            <InsightBox title="Zufriedener Prüfer, nutzloser Text">
              Beim Bild steht jetzt „{badAlt}“. Der Prüfer meldet dort nichts mehr, weil ein Alternativtext vorhanden ist. Ob er etwas beschreibt, kann er nicht beurteilen:
              Wer die Seite vorgelesen bekommt, erfährt weiterhin nicht, was zu sehen ist.
            </InsightBox>
          ) : null}
        </>
      ) : null}
    </section>
  );
}
