import { Link } from 'react-router';
import { EVENT_WEIGHTS, HALF_LIFE_DAYS, categoryAffinity } from '../../personalization/affinity';
import { CATALOG } from '../../personalization/catalog';
import { EXAMPLE_VISITOR_ID, NOW, VISITORS } from '../../personalization/visitors';
import './affinity.css';

const EVENT_LABEL = { view: 'Aufruf', cart: 'Warenkorb', purchase: 'Kauf' } as const;

const de = (n: number, digits: number) => n.toLocaleString('de-DE', { minimumFractionDigits: digits, maximumFractionDigits: digits });
// Zahl ohne überflüssige Nullen, für die Zeichnung.
const short = (n: number) => n.toLocaleString('de-DE', { maximumFractionDigits: 2 });

// Beispielbesucher und seine Rechnung zur Laufzeit; nichts davon ist von Hand eingetragen.
const visitor = VISITORS.find((v) => v.id === EXAMPLE_VISITOR_ID)!;
const { profile, contributions } = categoryAffinity(visitor.events, NOW, CATALOG);
const rows = [...contributions].sort((a, b) => Date.parse(a.event.at) - Date.parse(b.event.at));
const total = contributions.reduce((sum, c) => sum + c.value, 0);
const shares = Object.entries(profile).sort((a, b) => b[1] - a[1]);

// Abklingen eines Kaufs über 0 bis 3 Halbwertszeiten für die Zeichnung.
const DECAY_STEPS = [0, 1, 2, 3].map((k) => ({
  day: k * HALF_LIFE_DAYS,
  value: EVENT_WEIGHTS.purchase * 0.5 ** k,
}));

export default function Explanation() {
  return (
    <div className="aff-explain">
      <p>
        Jedes Ereignis bekommt ein Gewicht: Aufruf {EVENT_WEIGHTS.view}, Warenkorb {EVENT_WEIGHTS.cart}, Kauf {EVENT_WEIGHTS.purchase}.
        Das Gewicht wird mit einem Abklingfaktor multipliziert; alle {HALF_LIFE_DAYS} Tage halbiert er sich. Die Beiträge werden je
        Kategorie addiert und durch die Gesamtsumme geteilt, sodass das Profil zusammen 100&nbsp;% ergibt. Die Rechnung für {visitor.name}:
      </p>

      <div
        className="aff-wrap table-scroll"
        tabIndex={0}
        role="region"
        aria-label="Tabelle: Verlauf des Beispielbesuchers und Beitrag je Ereignis, seitlich verschiebbar"
      >
        <table className="aff-table">
          <caption>Verlauf von {visitor.name} und Beitrag je Ereignis</caption>
          <thead>
            <tr>
              <th scope="col">Ereignis</th>
              <th scope="col">Kategorie</th>
              <th scope="col" className="aff-num">Alter in Tagen</th>
              <th scope="col" className="aff-num">Gewicht</th>
              <th scope="col" className="aff-num">Abklingen</th>
              <th scope="col" className="aff-num">Beitrag</th>
            </tr>
          </thead>
          <tbody>
            {rows.map((c) => (
              <tr key={`${c.event.productId}-${c.event.at}`} data-row="contribution">
                <th scope="row">
                  {EVENT_LABEL[c.event.type]}: {CATALOG.find((p) => p.id === c.event.productId)?.title}
                </th>
                <td>{c.category}</td>
                <td className="aff-num">{de(c.ageDays, 1)}</td>
                <td className="aff-num">{c.weight}</td>
                <td className="aff-num">{de(c.decay, 2)}</td>
                <td className="aff-num">{de(c.value, 2)}</td>
              </tr>
            ))}
          </tbody>
          <tfoot>
            <tr>
              <th scope="row" colSpan={5}>
                Summe aller Beiträge
              </th>
              <td className="aff-num">{de(total, 2)}</td>
            </tr>
          </tfoot>
        </table>
      </div>

      <h3>Das fertige Profil</h3>
      <ul className="aff-profile" aria-label={`Profil von ${visitor.name}, Anteile je Kategorie`}>
        {shares.map(([category, share]) => (
          <li key={category}>
            <span>{category}</span>
            <span className="aff-track" aria-hidden="true">
              <span className="aff-bar" style={{ width: `${share * 100}%` }} />
            </span>
            <span className="aff-pct">{de(share * 100, 1)}&nbsp;%</span>
          </li>
        ))}
      </ul>

      <figure className="aff-figure">
        <svg
          viewBox="0 0 320 150"
          role="img"
          aria-label={`Vier Balken, die von links nach rechts jeweils halb so hoch werden: ${DECAY_STEPS.map((s) => `Tag ${s.day}: ${short(s.value)}`).join(', ')}. Dargestellt ist der Beitrag eines Kaufs.`}
          strokeWidth={1.5}
          strokeLinejoin="round"
          fill="none"
        >
          <line x1="20" y1="110" x2="310" y2="110" stroke="currentColor" />
          {DECAY_STEPS.map((s, i) => {
            const h = (s.value / EVENT_WEIGHTS.purchase) * 80;
            const x = 40 + i * 70;
            return (
              <g key={s.day}>
                <rect x={x} y={110 - h} width="44" height={h} rx="3" className="aff-fill" />
                <text className="aff-text" x={x + 22} y={105 - h} textAnchor="middle">
                  {short(s.value)}
                </text>
                <text className="aff-text-muted" x={x + 22} y="126" textAnchor="middle">
                  Tag {s.day}
                </text>
              </g>
            );
          })}
          <text className="aff-text-muted" x="165" y="144" textAnchor="middle">
            Beitrag eines Kaufs über die Zeit
          </text>
        </svg>
        <figcaption>
          Derselbe Kauf zählt mit jeder Halbwertszeit nur noch halb so viel. Neue Ereignisse verdrängen alte Interessen langsam,
          nicht abrupt.
        </figcaption>
      </figure>

      <h3>Was ein Profil nicht weiß</h3>
      <p>
        Ein Profil kennt nur Ereignisse, nicht ihre Gründe. Wer ein Geschenk kauft, sieht danach Empfehlungen für etwas, das er
        selbst nie tragen würde. Wenn mehrere Personen ein Gerät teilen, verschmelzen ihre Interessen zu einem Profil, das zu
        keiner von ihnen passt. Und eine einzelne lange Suche zählt wie dauerhaftes Interesse. Die Zahlen sind genau, aber sie
        beschreiben nur, was geklickt wurde.
      </p>

      <h3>Wie es weitergeht</h3>
      <p>
        Wie dieses Profil mit Beliebtheit und Ähnlichkeit zu einer Rangliste wird, zeigt das Projekt{' '}
        <Link to="/projekt/C-003">Recommendation Demo</Link>.
      </p>
    </div>
  );
}
