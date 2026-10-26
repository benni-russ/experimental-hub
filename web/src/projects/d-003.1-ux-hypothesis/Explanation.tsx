import { Link } from 'react-router';
import './uxHypothesis.css';

// Der Satzbaustein in Teilen: Text dazwischen und Lücken mit ihrer Bedeutung.
export const PATTERN: { text: string; slot?: string }[] = [
  { text: 'Weil wir beobachtet haben, dass', slot: 'Beobachtung' },
  { text: ', nehmen wir an, dass', slot: 'Änderung' },
  { text: 'bei', slot: 'Zielgruppe' },
  { text: 'zu', slot: 'erwartete Wirkung' },
  { text: 'führt. Wir messen das an', slot: 'Primärkennzahl' },
  { text: 'und achten darauf, dass', slot: 'Schutzkennzahl' },
  { text: 'nicht schlechter wird.' },
];

// Je eine Schwäche mit schwacher und stärkerer Fassung, alle am selben Beispiel.
export const WEAKNESSES = [
  {
    weakness: 'Vage Beobachtung',
    weak: 'Die Kasse ist irgendwie unübersichtlich.',
    strong: 'In Usability-Tests und Sitzungsaufnahmen halten viele auf der Kassenseite am Versandkosten-Hinweis inne und scrollen zurück.',
  },
  {
    weakness: 'Keine Zielgruppe',
    weak: 'Ein früherer Versandhinweis hilft allen.',
    strong: 'Ein früherer Versandhinweis hilft Erstbesuchern auf dem Handy, die die Versandregeln noch nicht kennen.',
  },
  {
    weakness: 'Keine Kennzahl',
    weak: 'Die Kunden werden zufriedener sein.',
    strong: 'Der Anteil der Besuche mit Kauf steigt, weil weniger an der Kasse abbrechen.',
  },
  {
    weakness: 'Keine Schutzkennzahl',
    weak: 'Hauptsache, mehr Menschen kaufen.',
    strong: 'Mehr Menschen kaufen, und der Umsatz pro Besuch wird dabei nicht schlechter.',
  },
  {
    weakness: 'Nicht widerlegbar',
    weak: 'Der neue Hinweis könnte das Erlebnis verbessern.',
    strong: 'Bleibt der Anteil der Besuche mit Kauf gleich oder sinkt er, ist die Vermutung widerlegt.',
  },
];

export default function Explanation() {
  return (
    <div className="uh-explain">
      <h3>Beobachtung ist keine Hypothese</h3>
      <p>
        Angenommen, in Usability-Tests und Sitzungsaufnahmen fällt auf: Viele zögern auf der Kassenseite am Versandkosten-Hinweis. Das ist eine Beobachtung. Sie sagt, was
        passiert, aber nicht, warum, und schon gar nicht, was man ändern sollte. Eine erste Vermutung wäre: Die Versandkosten überraschen, weil sie erst an der Kasse
        sichtbar werden.
      </p>
      <p>
        Auch das ist noch keine Hypothese. Es fehlt, was genau sich ändern soll, für wen, woran man den Erfolg misst und was dabei nicht leiden darf. Erst wenn das feststeht,
        kann ein Test die Vermutung bestätigen oder widerlegen.
      </p>

      <h3>Der Satzbaustein</h3>
      <p className="uh-pattern" data-pattern="template">
        {PATTERN.map((part, i) => (
          <span key={part.text}>
            {i > 0 && !part.text.startsWith(',') ? ' ' : ''}
            {part.text}
            {part.slot && (
              <>
                {' '}
                <span className="uh-slot">
                  <span className="uh-slot-dots" aria-hidden="true">
                    …
                  </span>
                  <span className="uh-slot-label">{part.slot}</span>
                </span>
              </>
            )}
          </span>
        ))}
      </p>
      <p>Mit dem Beispiel von oben ausgefüllt:</p>
      <blockquote className="uh-example">
        <p>
          Weil wir beobachtet haben, dass viele auf der Kassenseite am Versandkosten-Hinweis zögern, nehmen wir an, dass ein Hinweis auf die Versandkosten schon im
          Warenkorb bei Erstbesuchern auf dem Handy zu weniger Abbrüchen an der Kasse führt. Wir messen das an der Conversion Rate und achten darauf, dass der Umsatz pro
          Besuch nicht schlechter wird.
        </p>
      </blockquote>

      <h3>Schwach und stark</h3>
      <div
        className="uh-wrap table-scroll"
        tabIndex={0}
        role="region"
        aria-label="Tabelle: typische Schwächen einer Hypothese mit schwacher und stärkerer Fassung, seitlich verschiebbar"
      >
        <table className="uh-table">
          <caption>Fünf typische Schwächen, jeweils am Beispiel des Versandhinweises</caption>
          <thead>
            <tr>
              <th scope="col">Schwäche</th>
              <th scope="col">Schwache Fassung</th>
              <th scope="col">Stärkere Fassung</th>
            </tr>
          </thead>
          <tbody>
            {WEAKNESSES.map((w) => (
              <tr key={w.weakness} data-row="weakness">
                <th scope="row">{w.weakness}</th>
                <td>{w.weak}</td>
                <td>{w.strong}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <h3>Primär- und Schutzkennzahl</h3>
      <p>
        Die Primärkennzahl sagt, ob die Änderung wirkt, hier die Conversion Rate. Die Schutzkennzahl sagt, ob dabei etwas anderes leidet, hier der Umsatz pro Besuch: Ein
        früher Versandhinweis könnte auch dazu führen, dass Menschen kleinere Warenkörbe bilden. Wie die beiden zusammenhängen und wann sie sich widersprechen, kannst du im{' '}
        <Link to="/projekt/D-003">Conversion Funnel Simulator (D-003)</Link> ausprobieren.
      </p>

      <h3>Vom Satz zum Test</h3>
      <p>
        Meist hast du mehr Hypothesen, als du testen kannst. Welche zuerst drankommt, ordnest du mit der <Link to="/projekt/A-001.1">Priorisierung mit PIE (A-001.1)</Link>.
        Und weil die Hypothese eine erwartete Wirkung nennt, kannst du vorher abschätzen, wie groß die Stichprobe sein muss, um sie zu erkennen. Das zeigt der{' '}
        <Link to="/projekt/A-001">Kleinste erkennbare Unterschied (A-001)</Link>: Je kleiner die erwartete Wirkung, desto mehr Besuche braucht der Test.
      </p>

      <figure className="uh-figure">
        <svg
          viewBox="0 0 320 300"
          role="img"
          aria-label="Ein Weg in vier Stufen von oben nach unten: Beobachtung, Vermutung, Hypothese, Test. Vom Test führt ein Pfeil zurück zur Beobachtung, weil jedes Ergebnis zur nächsten Beobachtung wird."
          strokeWidth={1.5}
          strokeLinecap="round"
          strokeLinejoin="round"
          fill="none"
        >
          {[
            { y: 10, title: 'Beobachtung', sub: 'Viele zögern am Versandhinweis' },
            { y: 85, title: 'Vermutung', sub: 'Die Kosten kommen zu spät' },
            { y: 160, title: 'Hypothese', sub: 'Änderung, Zielgruppe, Kennzahlen', highlight: true },
            { y: 235, title: 'Test', sub: 'messen, Schutzkennzahl prüfen' },
          ].map((s) => (
            <g key={s.title}>
              <rect x="40" y={s.y} width="200" height="52" rx="6" className={s.highlight ? 'uh-box-b' : 'uh-box'} />
              <text className="uh-text" x="140" y={s.y + 22} textAnchor="middle">
                {s.title}
              </text>
              <text className="uh-text-muted" x="140" y={s.y + 40} textAnchor="middle">
                {s.sub}
              </text>
            </g>
          ))}
          {/* Pfeile nach unten zwischen den Stufen */}
          {[62, 137, 212].map((y) => (
            <path key={y} d={`M140 ${y + 2}V${y + 21}M134 ${y + 15}L140 ${y + 21}L146 ${y + 15}`} stroke="currentColor" />
          ))}
          {/* Rückweg vom Test zur Beobachtung */}
          <path d="M242 261H280V36H247" stroke="currentColor" strokeDasharray="4 4" />
          <path d="M252 30L246 36L252 42" stroke="currentColor" />
          <text className="uh-text-muted" x="0" y="0" textAnchor="middle" transform="translate(296 148) rotate(90)">
            nächste Runde
          </text>
        </svg>
        <figcaption>Erst die Hypothese macht aus Beobachtung und Vermutung etwas, das ein Test bestätigen oder widerlegen kann.</figcaption>
      </figure>
    </div>
  );
}
