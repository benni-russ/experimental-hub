import { Link } from 'react-router';
import { testSizeText, type Lifts } from './insights';

/** „Lohnt sich ein Test?“: Stichprobe und Laufzeit für die mit den Reglern eingestellte Verbesserung. */
export function TestSize({ lifts }: { lifts: Lifts }) {
  return (
    <div className="fn-test">
      <p className="fn-test-result">{testSizeText(lifts)}</p>
      <p className="fn-hint">
        Gerechnet mit α 0,05 und Power 0,8 für zwei gleich große Gruppen. Als Verbesserung zählt, was deine Regler an Käufen bringen, gemessen an
        der Conversion Rate des ganzen Shops im Start (alle Quellen), auch wenn oben eine einzelne Quelle gewählt ist. Wie diese Rechnung entsteht und warum kleine Quoten so viele Besuche brauchen, zeigt{' '}
        <Link to="/projekt/A-001">Kleinster erkennbarer Unterschied (A-001)</Link>.
      </p>
    </div>
  );
}
