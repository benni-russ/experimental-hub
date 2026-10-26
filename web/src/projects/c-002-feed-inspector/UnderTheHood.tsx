import { CodeBlock } from '../../design/components/CodeBlock';
import './feedInspector.css';

const RULE = `// Eine Regel: unbekannte Kategorie-Schreibweise erkennen
const known = ['Laufschuhe', 'Jacken', 'Rucksäcke', 'Zubehör'];

function checkCategory(entry) {
  if (known.includes(entry.category)) return null;           // in Ordnung
  const fixed = known.find(
    (k) => k.toLowerCase() === entry.category.trim().toLowerCase(),
  );
  return fixed
    ? { code: 'category_variant', action: 'repair', value: fixed }  // eindeutig
    : { code: 'category_variant', action: 'drop' };                 // unklar
}`;

export default function UnderTheHood() {
  return (
    <div className="fi-hood">
      <h3>Wie ein Feed entsteht</h3>
      <p>
        Ein Feed wird nicht von Hand geschrieben. Das Shopsystem exportiert ihn, oft nachts und nach einem festen Plan, aus der Warenwirtschaft: Preis, Bestand,
        Kategorie, Bildlink. Jede Quelle hat eigene Eigenheiten. Das eine System schreibt „Out of Stock“, das andere „out_of_stock“, und ein manuell gepflegtes Feld
        kennt Kategorien in zwei Schreibweisen. Der Feed ist so gut wie die schlechteste Stelle auf dem Weg dorthin.
      </p>

      <h3>Prüfen, bevor man einliest</h3>
      <p>
        Die Prüfung gehört vor das Einlesen, nicht dahinter. Sie geht jeden Eintrag durch und fragt eine Handvoll fester Regeln ab: Fehlt ein Pflichtfeld? Ist der Preis eine
        Zahl? Kennt das System den Wert der Verfügbarkeit? Gibt es die id schon? Ist der Eintrag älter als erlaubt? Jede Regel ist klein und hat einen Namen, den
        man in einer Liste zählen kann.
      </p>
      <CodeBlock code={RULE} label="Eine Regel" />

      <h3>Reparieren, aussortieren oder nur melden</h3>
      <p>
        Was nach einem Fund geschieht, ist eine Entscheidung. <strong>Reparieren</strong> ist nur sicher, wenn die Absicht eindeutig ist: „laufschuhe“ meint „Laufschuhe“.{' '}
        <strong>Aussortieren</strong> ist die vorsichtige Wahl, wenn ein Eintrag nicht sicher lesbar ist, etwa ein Preis als Text. Dann fehlt ein Produkt in der Empfehlung,
        aber es steht keines mit falschem Preis darin. <strong>Nur melden</strong> passt, wenn die Empfehlung trotzdem funktioniert, etwa bei einem fehlenden Bild. Wichtig ist,
        dass jede dieser Entscheidungen sichtbar bleibt, sonst verschwinden Produkte einfach.
      </p>

      <h3>Wie Werkzeuge das nennen</h3>
      <p>
        In Personalisierungs- und Werbewerkzeugen heißt die Liste meist <strong>Product Feed</strong> oder <strong>Catalog</strong>, ein einzelner Artikel{' '}
        <strong>Item</strong> oder <strong>SKU</strong> (Stock Keeping Unit, die Lagernummer), und das regelmäßige Einlesen <strong>Feed-Sync</strong> oder Katalog-Import. Dynamic Yield
        ist ein Beispiel: Es liest den Katalog ein und zeigt Fehler in der Einlesestatistik, repariert aber nicht von selbst.
      </p>

      <h3>Grenzen</h3>
      <p>
        Der Prüfer kennt Formen, nicht Wahrheit. Ein Preis, der eine gültige Zahl ist, aber nicht dem Shop entspricht, fällt keiner Regel auf, ebenso ein Titel mit
        Tippfehler oder ein Bestand, der gestern noch stimmte. Dafür braucht es einen Abgleich mit der Quelle und die Gewohnheit, Empfehlungen ab und zu mit eigenen Augen zu lesen.
      </p>
    </div>
  );
}
