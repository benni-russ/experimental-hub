import { useId, useMemo, useState } from 'react';
import { CodeBlock } from '../../design/components/CodeBlock';
import { CATALOG } from '../../personalization/catalog';
import { PRESETS, rankProducts } from '../../personalization/recommend';
import { EXAMPLE_VISITOR_ID, NOW, VISITORS } from '../../personalization/visitors';
import { de2 } from './RankList';
import { VisitorSelect } from './VisitorSelect';
import './recommendations.css';

const FORMULA = `// Punkte eines Produkts: gewichtete Summe der drei Signale
function scoreProduct(signals, weights) {
  return (
    signals.affinity * weights.affinity +
    signals.popularity * weights.popularity +
    signals.similarity * weights.similarity
  );
}

// Jedes Signal liegt zwischen 0 und 1:
// affinity   = Anteil der Produktkategorie im Profil des Besuchers
// popularity = Verkäufe / Verkäufe des Bestsellers
// similarity = gemeinsame Merkmale / alle Merkmale beider Produkte (Jaccard)`;

const OPTIONS = { hideOutOfStock: true, hidePurchased: true, n: 1 };

export default function UnderTheHood() {
  const id = useId();
  const [visitorId, setVisitorId] = useState(EXAMPLE_VISITOR_ID);
  const visitor = VISITORS.find((v) => v.id === visitorId) ?? VISITORS[0]!;
  const w = PRESETS.personal.weights;

  // Platz 1 unter „Persönlich“; die Signale ergeben sich aus Beitrag geteilt durch Gewicht.
  const first = useMemo(() => rankProducts(CATALOG, visitor, w, OPTIONS, NOW)[0], [visitor, w]);
  const s = first
    ? { affinity: first.parts.affinity / w.affinity, popularity: first.parts.popularity / w.popularity, similarity: first.parts.similarity / w.similarity }
    : null;

  return (
    <div className="rc-hood">
      <h3>Die Formel mit eingesetzten Werten</h3>
      <p>
        Ein Ranking ist eine gewichtete Summe. Für jedes Produkt werden drei Signale ausgerechnet, jedes mit seinem Gewicht malgenommen und zusammengezählt. Das
        Produkt mit der höchsten Summe steht oben.
      </p>
      <CodeBlock code={FORMULA} label="Die Formel" />
      <VisitorSelect id={`${id}-visitor`} label="Besucher für das Beispiel" value={visitorId} onChange={setVisitorId} />
      {first && s ? (
        <p className="rc-worked">
          <strong>
            Platz 1 für {visitor.name} unter „{PRESETS.personal.label}“: {first.product.title}
          </strong>
          <br />
          <span className="rc-calc">
            {de2(w.affinity)} · {de2(s.affinity)} + {de2(w.popularity)} · {de2(s.popularity)} + {de2(w.similarity)} · {de2(s.similarity)} = {de2(first.score)}
          </span>
          <br />
          <span className="rc-hint">Gewicht · Signal, je für Affinität, Beliebtheit und Ähnlichkeit. Ausverkauftes und schon Gekauftes ist ausgeblendet.</span>
        </p>
      ) : (
        <p className="rc-hint">Kein Produkt übrig.</p>
      )}

      <h3>Warum Signale vergleichbar sein müssen</h3>
      <p>
        Verkaufszahlen gehen in die Dutzende, ein Profilwert liegt nie über eins. Würde man sie roh addieren, entschiede allein die Verkaufszahl, egal wie klein ihr Gewicht ist.
        Deshalb wird jedes Signal vorher auf die Skala von null bis eins gebracht: Die Beliebtheit wird durch die Verkäufe des Bestsellers geteilt, das Profil so, dass seine
        Anteile zusammen eins ergeben. Erst dann bedeutet ein doppeltes Gewicht auch einen doppelten Einfluss.
      </p>

      <h3>Von Hand gesetzt oder gelernt</h3>
      <p>
        In dieser Übung stellst du die Gewichte selbst ein. Das ist leicht zu erklären: Man kann nachrechnen, warum ein Produkt auf Platz 1 steht. In der Praxis gibt es
        daneben gelernte Verfahren, die Gewichte oder ganze Rangfolgen aus dem Verhalten vieler Besucher ableiten. Sie treffen oft besser, sind aber schwerer zu durchschauen.
        Meist werden mehrere Strategien nebeneinander betrieben und gegeneinander getestet.
      </p>

      <h3>Wie Werkzeuge das nennen</h3>
      <p>
        In Personalisierungswerkzeugen, Dynamic Yield ist ein Beispiel, heißt die Gewichtung einer Rangfolge <strong>Strategy</strong> oder <strong>Algorithm</strong>.
        Das Profil nennt man <strong>Affinity</strong>, die Verkaufszahlen <strong>Popularity</strong>, die Ähnlichkeit zum zuletzt Angesehenen <strong>Similar Items</strong>.
        Das Ausblenden von Ausverkauftem und Gekauftem heißt <strong>Exclusions</strong> oder <strong>Filter</strong>.
      </p>

      <h3>Grenzen</h3>
      <p>
        Ob eine Rangliste besser ist, sieht man ihr nicht an. Sie kann plausibel wirken und trotzdem weniger Käufe bringen. Das zeigt erst ein A/B-Test, bei dem eine Hälfte der
        Besucher die eine Liste sieht und die andere Hälfte die andere, wie du es aus dem Track Experimentation & Data kennst. Dazu kommt der Kaltstart: Wer neu ist, bekommt
        nur die Bestseller.
      </p>
    </div>
  );
}
