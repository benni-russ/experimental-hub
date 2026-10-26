import { CodeBlock } from '../../design/components/CodeBlock';
import './ruleBuilder.css';

const LOOP = `function decide(experiences, visitor, strategy) {
  let winner = null;
  for (const experience of experiences) {
    // Alle Bedingungen müssen zutreffen (UND).
    const matches = experience.conditions.every((c) => holds(c, visitor));
    if (!matches) continue;

    // „Erste passende“: der erste Treffer gewinnt sofort.
    if (strategy === 'priority') return experience;

    // „Spezifischste“: mehr Bedingungen gewinnen, bei Gleichstand bleibt der frühere.
    if (!winner || experience.conditions.length > winner.conditions.length) {
      winner = experience;
    }
  }
  return winner ?? DEFAULT_EXPERIENCE;
}`;

export default function UnderTheHood() {
  return (
    <div className="rb-hood">
      <h3>Die Auswertung ist eine Schleife</h3>
      <p>
        Hinter dem Rule Builder steckt keine Magie: Für einen Besucher geht der Code die Erlebnisse der Reihe nach durch und fragt bei jedem, ob
        alle Bedingungen zutreffen. Welches der Treffer gewinnt, legt die Konfliktregel fest.
      </p>
      <CodeBlock code={LOOP} label="Auswertung" />

      <h3>Warum die Reihenfolge eine Entscheidung ist</h3>
      <p>
        Bei „Erste passende“ ist die Liste eine Rangfolge. Wer ein Erlebnis nach oben schiebt, nimmt allen darunter die Besucher weg, auf die
        beide passen. Das ist kein Schönheitsfehler, sondern die eigentliche Entscheidung: Die Regel ganz oben gewinnt bei jedem, auf den sie
        passt, egal wie gut die anderen wären. Deshalb zeigt die Reichweiten-Tabelle neben „Passt bei“ auch „Gewinnt bei“.
      </p>

      <h3>Spezifität und ihre Tücke</h3>
      <p>
        „Spezifischste“ klingt klüger: Wer mehr Bedingungen erfüllt, wird genauer getroffen. Aber mehr Bedingungen heißt nicht wichtiger. Eine
        einfache Regel mit hohem Wert, etwa die Erinnerung an einen gefüllten Warenkorb, kann von einer engen Regel mit kleinem Nutzen überholt
        werden, nur weil diese mehr Bedingungen zählt. Bei Gleichstand entscheidet wieder die Reihenfolge; sie verschwindet also nie ganz.
      </p>

      <h3>Der Standard als Sicherheitsnetz</h3>
      <p>
        Der Standard passt auf jeden und steht am Ende. Er gewinnt nur, wenn nichts anderes passt. Damit bekommt jeder Besucher ein Erlebnis,
        auch einer, an den beim Bauen der Regeln niemand gedacht hat. Wird er bei vielen Besuchern ausgespielt, ist das ein Hinweis, dass die
        Regeln einen großen Teil der Kundschaft nicht erreichen.
      </p>

      <h3>Wie Werkzeuge das nennen</h3>
      <p>
        In Personalisierungswerkzeugen, Dynamic Yield ist ein Beispiel, heißen die Bausteine meist so oder ähnlich: eine <strong>Audience</strong>{' '}
        beschreibt die Zielgruppe, eine <strong>Experience</strong> ist das Erlebnis, das sie sieht, <strong>Priority</strong> ist die Reihenfolge
        bei Konflikten, und <strong>Fallback</strong> oder <strong>Default</strong> ist das Erlebnis für alle übrigen. Die Rechnung dahinter
        ist im Kern dieselbe Schleife wie oben.
      </p>

      <h3>Grenzen</h3>
      <p>
        Merkmale wie „Neukunde“ oder „mobil“ sind Annahmen über Menschen: Wer mobil kommt, will nicht unbedingt eine App, und wer neu ist, will
        nicht unbedingt Gratisversand. Und eine Regel ohne Test bleibt eine Vermutung. Ob ein Erlebnis wirklich besser ist als der Standard,
        zeigt erst ein Experiment mit Vergleichsgruppe, wie es der Track „Experimentation & Data“ beschreibt.
      </p>
    </div>
  );
}
