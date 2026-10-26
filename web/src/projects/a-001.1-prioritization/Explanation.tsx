import { formatNumber } from '../../learning/numbers';
import { tiedFlags } from './ties';
import './prioritization.css';

export interface Idea {
  name: string;
  p: number;
  i: number;
  e: number;
}

/** Drei erfundene Testideen eines Onlineshops, jeweils mit Punkten von 1 bis 10. */
export const IDEAS: Idea[] = [
  { name: 'Größere Produktfotos auf der Produktseite', p: 6, i: 9, e: 8 },
  { name: 'Express-Kauf mit einem Klick', p: 9, i: 8, e: 3 },
  { name: 'Neue Farbe für den Kaufen-Knopf', p: 3, i: 7, e: 10 },
];

/** PIE-Wert: Mittelwert aus Potential, Importance und Ease. */
export const pieScore = (idea: Idea): number => (idea.p + idea.i + idea.e) / 3;

/** Absteigend nach PIE-Wert; bei Gleichstand zuerst die Idee mit mehr Potential. */
export function rankIdeas(ideas: Idea[]): Idea[] {
  return [...ideas].sort((a, b) => {
    const diff = Math.round((pieScore(b) - pieScore(a)) * 1e9);
    return diff !== 0 ? diff : b.p - a.p;
  });
}

export default function Explanation() {
  const ranked = rankIdeas(IDEAS);
  const tied = tiedFlags(ranked.map(pieScore));
  return (
    <div className="pie-explain">
      <p>
        PIE gibt jeder Testidee drei Punkte von 1 bis 10. <strong>Potential:</strong> Wie viel ließe sich hier gewinnen?{' '}
        <strong>Importance:</strong> Wie wichtig ist die Seite, wie viele Besucher und wie viel Umsatz hängen daran?{' '}
        <strong>Ease:</strong> Wie leicht ist der Test umzusetzen? Der Mittelwert der drei Punkte ist der PIE-Wert, und
        der höchste kommt zuerst. ICE ist die Variante mit Impact (etwa das Potential), Confidence (Wie sicher bist du?) und Ease.
      </p>
      <div className="pie-table-wrap table-scroll" tabIndex={0} role="region" aria-label="Tabelle der Testideen, seitlich verschiebbar">
        <table className="pie-table">
          <caption>Drei Testideen eines Onlineshops (erfunden), nach PIE-Wert geordnet</caption>
          <thead>
            <tr>
              <th scope="col">Rang</th>
              <th scope="col">Testidee</th>
              <th scope="col">Potential</th>
              <th scope="col">Importance</th>
              <th scope="col">Ease</th>
              <th scope="col">PIE-Wert</th>
            </tr>
          </thead>
          <tbody>
            {ranked.map((idea, index) => (
              <tr key={idea.name}>
                <td>
                  {index + 1}
                  {tied[index] && <span className="pie-tie"> gleichauf</span>}
                </td>
                <th scope="row">{idea.name}</th>
                <td>{idea.p}</td>
                <td>{idea.i}</td>
                <td>{idea.e}</td>
                <td>{formatNumber(pieScore(idea), 2)}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      <p>
        Keine Spalte allein ergibt die Reihenfolge: Den höchsten Wert bei Potential hat der Express-Kauf, bei Ease der
        Farbwechsel, und vorn liegt trotzdem die Idee mit den größeren Fotos. Der Express-Kauf und der Farbwechsel haben
        denselben PIE-Wert. Bei Gleichstand zählt hier das Potential, also kommt der Express-Kauf zuerst. Lege diese
        Regel fest, bevor du die Punkte vergibst.
      </p>
      <h3>Wo PIE in die Irre führt</h3>
      <ul>
        <li>
          <strong>Scheingenauigkeit:</strong> Die Punkte sind Schätzungen. Ein Abstand von einem Punkt zwischen zwei
          Ideen ist kein Beleg für einen Unterschied.
        </li>
        <li>
          <strong>Ease schlägt Wirkung:</strong> Im Mittelwert wiegt ein leichter Test genauso viel wie ein wirksamer. So
          rutschen bequeme Ideen mit kleinem Potential nach oben.
        </li>
        <li>
          <strong>Punkte ohne Begründung:</strong> Schreib zu jeder Zahl einen Satz, woher sie kommt. Sonst vergibt jeder
          Punkte nach Bauchgefühl und die Tabelle sieht nur nach Rechnung aus.
        </li>
      </ul>
    </div>
  );
}
