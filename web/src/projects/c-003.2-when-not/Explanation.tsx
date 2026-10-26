import { Link } from 'react-router';
import './whennot.css';

// Prüfliste: je Punkt ein Anzeichen und eine einfachere Alternative.
const CHECKS = [
  {
    title: 'Kaltstart: zu wenig Besucher oder Verlauf',
    sign: 'Die meisten Besucher sind neu oder kommen selten wieder, und die Profile sind leer oder bestehen aus ein, zwei Aufrufen.',
    instead: 'Beliebte Produkte zeigen oder Zielgruppenregeln nutzen, bis genug Verlauf da ist.',
  },
  {
    title: 'Kleines Sortiment',
    sign: 'Besucher sehen ohnehin fast alles auf einer Seite; die Reihenfolge ändert kaum, was sie finden.',
    instead: 'Eine sorgfältig von Hand gewählte Reihenfolge, die man erklären und leicht ändern kann.',
  },
  {
    title: 'Gleiche Bedürfnisse für alle',
    sign: 'Fast alle wollen dasselbe, etwa im Ersatzteilshop oder bei einem einzigen Hauptprodukt. Profile unterscheiden sich kaum.',
    instead: 'Für alle die beste Auswahl zeigen und lieber Suche, Filter und Produktseiten verbessern.',
  },
  {
    title: 'Pflegeaufwand größer als der Nutzen',
    sign: 'Das Team pflegt Daten, Gewichte und Ausnahmen, und niemand kann sagen, was die Reihenfolge am Ende bringt.',
    instead: 'Wenige feste Regeln oder eine einfache Beliebtheitsliste, die kaum Pflege braucht.',
  },
  {
    title: 'Keine Einwilligung zum Tracking',
    sign: 'Ein großer Teil der Besucher lehnt ab oder hat nie zugestimmt; für sie gibt es in der Regel keinen Verlauf, den man ohne Weiteres nutzen sollte.',
    instead: 'Empfehlungen aus dem aktuellen Besuch oder aus dem Produkt selbst, etwa ähnliche Artikel, ohne Verlauf einer Person.',
  },
  {
    title: 'Filterblase und fehlende Erklärbarkeit',
    sign: 'Besucher sehen immer mehr vom Gleichen, und niemand im Team kann erklären, warum ein Produkt vorn steht.',
    instead: 'Eine feste Zahl von Plätzen für Neues oder Beliebtes reservieren und Gewichte sichtbar machen.',
  },
];

export default function Explanation() {
  return (
    <div className="wn-explain">
      <p>
        Personalisierung ist ein Werkzeug mit Kosten: Daten, Pflege, Erklärungen. Die Liste unten hilft dir zu prüfen, ob sich diese
        Kosten lohnen. Jeder Punkt hat ein Anzeichen, an dem du ihn erkennst, und eine einfachere Alternative.
      </p>

      <ul className="wn-list">
        {CHECKS.map((c) => (
          <li key={c.title} className="wn-item" data-check="item">
            <h4>{c.title}</h4>
            <dl>
              <div>
                <dt>Woran merke ich es?</dt>
                <dd>{c.sign}</dd>
              </div>
              <div>
                <dt>Was stattdessen?</dt>
                <dd>{c.instead}</dd>
              </div>
            </dl>
          </li>
        ))}
      </ul>

      <figure className="wn-figure">
        <svg
          viewBox="0 0 320 160"
          role="img"
          aria-label="Eine Waage mit zwei gleich hohen Schalen. Auf der linken steht Aufwand für Daten, Pflege und Erklärung, auf der rechten der erwartete Effekt."
          strokeWidth={1.5}
          strokeLinecap="round"
          strokeLinejoin="round"
          fill="none"
        >
          <line x1="160" y1="30" x2="160" y2="130" stroke="currentColor" />
          <line x1="130" y1="130" x2="190" y2="130" stroke="currentColor" />
          <line x1="60" y1="40" x2="260" y2="40" stroke="currentColor" />
          <path d="M60 40L40 90M60 40L80 90M260 40L240 90M260 40L280 90" stroke="currentColor" />
          <path d="M34 90H86L80 106H40Z" className="wn-fill" />
          <path d="M234 90H286L280 106H240Z" className="wn-fill-b" />
          <text className="wn-text" x="60" y="124" textAnchor="middle">
            Aufwand
          </text>
          <text className="wn-text-muted" x="60" y="140" textAnchor="middle">
            Daten, Pflege
          </text>
          <text className="wn-text" x="260" y="124" textAnchor="middle">
            erwarteter Effekt
          </text>
          <text className="wn-text-muted" x="260" y="140" textAnchor="middle">
            mehr Treffer
          </text>
        </svg>
        <figcaption>
          Nur wenn der erwartete Effekt den Aufwand überwiegt, lohnt sich eine eigene Reihenfolge je Besucher.
        </figcaption>
      </figure>

      <h3>Wie es weitergeht</h3>
      <p>
        Wie so eine Reihenfolge entsteht und wo sie ihre Grenzen hat, kannst du in der <Link to="/projekt/C-003">Recommendation Demo</Link>{' '}
        selbst ausprobieren.
      </p>
    </div>
  );
}
