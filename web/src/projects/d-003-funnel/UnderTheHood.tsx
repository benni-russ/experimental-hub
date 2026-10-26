import { Link } from 'react-router';
import { SOURCES } from '../../experience/funnel';
import { BASE_FUNNEL, BASE_KPIS, formatCount, formatEuro, formatEuroCents, formatPercent, formatPercent1, runScenario, testSize } from './insights';
import './funnel.css';

const rates = BASE_FUNNEL.rates.map(formatPercent1);
const social = runScenario('socialCampaign').after;
const discount = runScenario('discount').after;
const tenPercent = testSize(BASE_KPIS.conversionRate, 0.1, BASE_KPIS.visits)!;
const bySource = SOURCES.map((s) => `${s.label} ${formatPercent(BASE_FUNNEL.bySource[s.id].overall)}`);

export default function UnderTheHood() {
  return (
    <div className="fn-hood">
      <h3>Quoten multiplizieren sich</h3>
      <p>
        Die Käufe sind die Besuche mal alle vier Übergangsquoten. Im Start: {formatCount(BASE_KPIS.visits)} × {rates.join(' × ')} ergibt rund{' '}
        {formatCount(BASE_KPIS.orders)} Käufe. Weil es ein Produkt ist, bringt eine relative Verbesserung um 10 % an jedem Übergang dasselbe: 10 % mehr Käufe. Welcher
        Übergang sich lohnt, entscheidet deshalb nicht die Rechnung, sondern wie leicht er sich verbessern lässt und was es kostet.
      </p>

      <h3>Absolut oder relativ</h3>
      <p>
        Verbessert sich eine Quote von {formatPercent(BASE_KPIS.conversionRate)} relativ um 10 %, liegt sie bei {formatPercent(BASE_KPIS.conversionRate * 1.1)}. Absolut
        ist das nur ein Abstand von {formatPercent(BASE_KPIS.conversionRate * 0.1).replace(' %', '')} Prozentpunkten. Ein Test muss genau diesen kleinen Abstand vom
        Zufall unterscheiden: Dafür braucht er etwa {formatCount(tenPercent.perVariant)} Besuche je Variante, bei {formatCount(BASE_KPIS.visits)} Besuchen im Monat
        rund {tenPercent.weeks} Wochen. Wie diese Rechnung entsteht, zeigt <Link to="/projekt/A-001">Kleinster erkennbarer Unterschied (A-001)</Link>.
      </p>

      <h3>Die Conversion Rate ist ein Quotient</h3>
      <p>
        Käufe geteilt durch Besuche: Zähler und Nenner können sich beide bewegen. Die Rate steigt, wenn mehr Menschen kaufen, aber auch, wenn Besuche wegfallen, die
        ohnehin nicht gekauft hätten. Sie fällt, wenn zusätzliche Besuche mit niedriger Quote kommen. In der Social-Kampagne: {formatCount(social.visits)} statt{' '}
        {formatCount(BASE_KPIS.visits)} Besuche, Conversion Rate {formatPercent(social.conversionRate)} statt {formatPercent(BASE_KPIS.conversionRate)}, Umsatz{' '}
        {formatEuro(social.revenue)} statt {formatEuro(BASE_KPIS.revenue)}.
      </p>

      <h3>Mischeffekt über die Quellen</h3>
      <p>
        Die Gesamtquote ist ein nach Besuchen gewichteter Durchschnitt der Quellen: {bySource.join(', ')}. Verschiebt sich die Mischung, bewegt sich der Durchschnitt,
        auch wenn sich keine Quelle ändert. Dasselbe Muster steckt im <Link to="/projekt/A-004">Simpson-Paradox (A-004)</Link>: Vor einem Vergleich lohnt der Blick in die
        Gruppen.
      </p>

      <h3>Umsatz pro Besuch und Rohertrag als Gegengewicht</h3>
      <p>
        Der Umsatz pro Besuch verbindet Quote und Bestellwert. In der Social-Kampagne fällt er von {formatEuroCents(BASE_KPIS.revenuePerVisit)} auf{' '}
        {formatEuroCents(social.revenuePerVisit)}, obwohl der Umsatz steigt. Der Rohertrag zieht Wareneinsatz, Rabatt und getragene Versandkosten ab: Beim Rabatt fällt er
        von {formatEuro(BASE_KPIS.grossProfit)} auf {formatEuro(discount.grossProfit)}, obwohl die Conversion Rate steigt.
      </p>

      <h3>Primär- und Schutzkennzahl</h3>
      <p>
        Vor einem Test legst du fest, welche Kennzahl besser werden soll, die Primärkennzahl, und welche dabei nicht schlechter werden darf, die Schutzkennzahl. Bei einem
        Rabatt wäre die Conversion Rate primär und der Rohertrag ein Schutz. Ohne Schutzkennzahl sähe der Rabatt-Test in der Demo wie ein Erfolg aus.
      </p>

      <h3>Wie Analysewerkzeuge das nennen</h3>
      <p>
        In Analysewerkzeugen begegnen dir dafür oft englische Begriffe, zum Beispiel Funnel Exploration für die Stufenansicht, Sessions für Besuche, Conversion Rate, AOV
        (Average Order Value) für den Bestellwert und RPV (Revenue per Visit) für den Umsatz pro Besuch. Wie ein Werkzeug zählt, etwa wann ein Besuch endet oder ob eine
        Stufe übersprungen werden darf, legt es selbst fest. Zahlen aus zwei Werkzeugen müssen deshalb nicht zusammenpassen.
      </p>

      <h3>Wo der Funnel aufhört</h3>
      <p>
        Ein Funnel zeigt, wo Menschen gehen, aber nicht warum. Ob ein Versandhinweis an der Kasse abschreckt oder ein Knopf schwer zu finden ist, verrät erst eine
        Beobachtung, etwa ein Gespräch oder ein Usability-Test. Wie aus so einer Beobachtung eine prüfbare Vermutung wird, ist das Thema von D-003.1.
      </p>
    </div>
  );
}
