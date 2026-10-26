import { Link } from 'react-router';
import './segmentation.css';

// Zeilen der Gegenüberstellung: Segmentierung links, Personalisierung rechts.
const ROWS = [
  {
    label: 'Grundlage',
    segmentation: 'Merkmale und Bedingungen, etwa Neukunde, Handy, Warenkorb gefüllt.',
    personalization: 'Das Verhalten der einzelnen Person: was sie angesehen, in den Warenkorb gelegt oder gekauft hat.',
  },
  {
    label: 'Wer entscheidet',
    segmentation: 'Ein Mensch legt Zielgruppen fest und ordnet ihnen Erlebnisse zu.',
    personalization: 'Ein Verfahren rechnet die Reihenfolge aus; Menschen stellen nur die Gewichte ein.',
  },
  {
    label: 'Datenbedarf',
    segmentation: 'Gering. Ein paar Merkmale genügen, auch bei wenig Besuchern.',
    personalization: 'Hoch. Ohne Verlauf und gepflegte Produktdaten ist die Reihenfolge wenig wert.',
  },
  {
    label: 'Pflege',
    segmentation: 'Regeln müssen aktuell bleiben, und bei vielen Regeln verdecken sich manche gegenseitig.',
    personalization: 'Die Daten müssen stimmen und die Gewichte gelegentlich überprüft werden; einzelne Regeln gibt es kaum.',
  },
  {
    label: 'Erklärbarkeit',
    segmentation: 'Hoch. Jede Regel lässt sich lesen und begründen.',
    personalization: 'Geringer. Man kann Signale und Gewichte zeigen, aber nicht jede Reihenfolge in einem Satz erklären.',
  },
  {
    label: 'Testbarkeit',
    segmentation: 'Gut. Man weiß, wer was sieht, und kann eine Regel gezielt prüfen.',
    personalization: 'Schwieriger. Es gibt keine einzelne Regel; man vergleicht Gruppen mit und ohne Personalisierung.',
  },
];

// Reihenfolge der Produkte A bis C je Besucher im Strom.
const ORDERS = [
  ['A', 'B', 'C'],
  ['C', 'A', 'B'],
  ['B', 'C', 'A'],
];

export default function Explanation() {
  return (
    <div className="seg-explain">
      <p>
        Segmentierung heißt: Du teilst Besucher in Zielgruppen ein und zeigst jeder Gruppe ein Erlebnis. Das ist, was der Rule
        Builder macht. Personalisierung im engeren Sinn heißt: Jede Person bekommt aus ihrem eigenen Verhalten eine eigene
        Reihenfolge. Im Alltag werden beide Wörter vermischt; die Tabelle trennt sie.
      </p>

      <div
        className="seg-wrap table-scroll"
        tabIndex={0}
        role="region"
        aria-label="Tabelle: Segmentierung und Personalisierung im Vergleich, seitlich verschiebbar"
      >
        <table className="seg-table">
          <caption>Segmentierung und Personalisierung im Vergleich</caption>
          <thead>
            <tr>
              <th scope="col">Merkmal</th>
              <th scope="col">Segmentierung</th>
              <th scope="col">Personalisierung</th>
            </tr>
          </thead>
          <tbody>
            {ROWS.map((r) => (
              <tr key={r.label}>
                <th scope="row">{r.label}</th>
                <td>{r.segmentation}</td>
                <td>{r.personalization}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <figure className="seg-figure">
        <svg
          viewBox="0 0 420 170"
          role="img"
          aria-label="Links drei Zielgruppen als Fächer, jede mit einem eigenen Erlebnis. Rechts ein Strom, in dem drei Besucher dieselben Produkte in jeweils anderer Reihenfolge sehen."
          strokeWidth={1.5}
          strokeLinecap="round"
          strokeLinejoin="round"
          fill="none"
        >
          <text className="seg-text" x="10" y="16" fontWeight="600">
            Segmente
          </text>
          <circle cx="24" cy="85" r="6" className="seg-fill" />
          <path d="M30 85L90 35M30 85L90 85M30 85L90 135" stroke="currentColor" />
          <rect x="90" y="22" width="100" height="26" rx="4" className="seg-fill" />
          <rect x="90" y="72" width="100" height="26" rx="4" className="seg-fill" />
          <rect x="90" y="122" width="100" height="26" rx="4" className="seg-fill" />
          <text className="seg-text" x="140" y="39" textAnchor="middle">
            Neukunden
          </text>
          <text className="seg-text" x="140" y="89" textAnchor="middle">
            Handy
          </text>
          <text className="seg-text" x="140" y="139" textAnchor="middle">
            Warenkorb
          </text>
          <text className="seg-text-muted" x="140" y="166" textAnchor="middle">
            je Gruppe ein Erlebnis
          </text>

          <line x1="215" y1="12" x2="215" y2="158" stroke="var(--farbe-rahmen-stark)" strokeDasharray="4 4" />

          <text className="seg-text" x="232" y="16" fontWeight="600">
            Personalisiert
          </text>
          {ORDERS.map((order, row) => (
            <g key={row}>
              <circle cx="244" cy={45 + row * 40} r="6" className="seg-fill-b" />
              {order.map((item, col) => (
                <g key={col}>
                  <rect x={262 + col * 50} y={33 + row * 40} width="42" height="24" rx="4" className="seg-fill-b" />
                  <text className="seg-text" x={283 + col * 50} y={49 + row * 40} textAnchor="middle">
                    {item}
                  </text>
                </g>
              ))}
            </g>
          ))}
          <text className="seg-text-muted" x="318" y="166" textAnchor="middle">
            je Person eine Reihenfolge
          </text>
        </svg>
        <figcaption>
          Links sieht jede Gruppe ihr Erlebnis. Rechts sehen drei Besucher dieselben Produkte A bis C, aber jeder in anderer
          Reihenfolge.
        </figcaption>
      </figure>

      <h3>Wann welche Art</h3>
      <p>
        Die beiden Arten schließen sich nicht aus. Wer wenig Daten hat oder eine Regel begründen muss, kommt mit Zielgruppen
        weit. Wer ein großes Sortiment hat und viel Verlauf, gewinnt mit einer eigenen Reihenfolge. Häufig steuert man den
        Rahmen mit Zielgruppen und lässt innerhalb davon sortieren.
      </p>

      <h3>Wie es weitergeht</h3>
      <p>
        Wie aus Ereignissen eine eigene Reihenfolge entsteht, zeigt das Projekt <Link to="/projekt/C-003">Recommendation Demo</Link>:
        Signale, ein Profil je Besucher und eine Rangliste, deren Gewichte du selbst einstellst.
      </p>

      <h3>Einordnung</h3>
      <p>
        In Personalisierungswerkzeugen, Dynamic Yield ist ein Beispiel, liegen beide Arten oft nebeneinander. Zielgruppen
        heißen dort meist Audiences, die Reihenfolge je Besucher kommt aus Empfehlungsstrategien oder Algorithmen. Der
        Unterschied bleibt derselbe: feste Regeln gegen berechnete Reihenfolge.
      </p>
    </div>
  );
}
