import { CodeBlock } from '../../design/components/CodeBlock';
import { contrastRatio, rateContrast, relativeLuminance } from '../../experience/color';
import './accessibility.css';

const TREE = `<!-- Für das Auge gleich, im Accessibility-Tree verschieden -->
<div onclick="…">In den Warenkorb</div>
  → Rolle: keine · Name: – · per Tab erreichbar: nein

<button>In den Warenkorb</button>
  → Rolle: Knopf · Name: In den Warenkorb · per Tab erreichbar: ja
    Enter und Leertaste lösen ihn aus`;

const FORMULA = `// Helligkeit je Kanal (0 bis 255 → 0 bis 1, dann linearisiert)
c <= 0.03928 ? c / 12.92 : ((c + 0.055) / 1.055) ** 2.4
L = 0.2126 · R + 0.7152 · G + 0.0722 · B

// Kontrast: hellere gegen dunklere Farbe
(L_hell + 0.05) / (L_dunkel + 0.05)`;

const de = (n: number, digits: number) => n.toFixed(digits).replace('.', ',');
const RATING_TEXT = { AAA: 'AAA', AA: 'AA', fail: 'nicht bestanden' } as const;

// Die beiden Farben des Hinweistexts, live aus dem Kern gerechnet.
const EXAMPLES = ['#9a9a9a', '#595959'].map((hex) => {
  const ratio = contrastRatio(hex, '#ffffff');
  return { hex, luminance: relativeLuminance(hex), ratio, rating: rateContrast(ratio, false) };
});
const WHITE = relativeLuminance('#ffffff');

export default function UnderTheHood() {
  return (
    <div className="a11y-hood">
      <h3>Rolle, Name, Zustand</h3>
      <p>
        Der Browser baut aus dem HTML neben der sichtbaren Seite einen zweiten Baum, den Accessibility-Tree. Darin steht für jedes Element seine Rolle (Knopf, Link,
        Überschrift), sein Name (der Text, den ein Vorleseprogramm ansagt) und sein Zustand (gedrückt, deaktiviert, ausgeklappt). Hilfsmittel lesen diesen Baum, nicht die
        Pixel. Ein div, das auf Klicks reagiert, sieht aus wie ein Knopf, steht dort aber ohne Rolle und ist per Tastatur nicht erreichbar.
      </p>
      <CodeBlock code={TREE} label="Vergleich div und button" />

      <h3>Die Kontrastformel mit eingesetzten Werten</h3>
      <p>Der Kontrast vergleicht die Helligkeit zweier Farben. Weiß hat die Helligkeit {de(WHITE, 0)}, Schwarz 0.</p>
      <CodeBlock code={FORMULA} label="Die Formel" />
      {EXAMPLES.map((e) => (
        <p className="a11y-worked" key={e.hex}>
          <strong>
            Hinweistext in {e.hex} auf #ffffff
          </strong>
          <span className="a11y-calc">
            ({de(WHITE, 0)} + 0,05) / ({de(e.luminance, 4)} + 0,05) = {de(e.ratio, 2)} : 1
          </span>
          <span className="a11y-hint">
            Für normalen Text: {RATING_TEXT[e.rating]} (Grenzen 4,5 : 1 für AA, 7 : 1 für AAA).
          </span>
        </p>
      ))}

      <h3>WCAG-Stufen als Referenz</h3>
      <p>
        Die Web Content Accessibility Guidelines (WCAG) ordnen ihre Kriterien in drei Stufen: A ist das Mindeste, AA das übliche Ziel, AAA die strengste Stufe. Für
        Textkontrast verlangt AA bei normalem Text mindestens 4,5 : 1, bei großem Text 3 : 1; AAA verlangt 7 : 1 bzw. 4,5 : 1. Die Zahlen sind eine Referenz, keine
        Garantie: Auch Text knapp über der Grenze kann je nach Schrift und Umgebung mühsam zu lesen sein.
      </p>

      <h3>Von Hand prüfen</h3>
      <ul className="a11y-list">
        <li>
          <strong>Nur Tastatur:</strong> Maus weglegen und mit Tab, Umschalt+Tab, Enter und Leertaste durch die Seite gehen. Siehst du immer, wo du bist?
        </li>
        <li>
          <strong>Zoom auf 200 %:</strong> Bleibt alles lesbar, ohne dass Text abgeschnitten wird oder sich überlagert?
        </li>
        <li>
          <strong>Screenreader des Systems:</strong> Einschalten und die Seite anhören. Ergeben die Ansagen ohne Bild einen Sinn?
        </li>
        <li>
          <strong>Farbe weglassen:</strong> In Graustufen ansehen. Geht eine Information verloren?
        </li>
      </ul>

      <h3>Pflichten</h3>
      <p>
        In der EU und in Deutschland gibt es Pflichten zur Barrierefreiheit, in Deutschland etwa das Barrierefreiheitsstärkungsgesetz (BFSG). Wen sie betreffen und wie weit
        sie im Einzelfall reichen, ist eine eigene Frage, die man fachkundig klären sollte.
      </p>

      <h3>Grenzen</h3>
      <p>
        Automatische Prüfer finden nur einen Teil der Barrieren, nämlich das, was sich an Eigenschaften ablesen lässt. Ob ein Element so bedient werden kann, wie es aussieht,
        ob Farbe allein etwas bedeutet und ob ein Alternativtext oder eine Beschriftung verständlich ist, prüft keiner. Dafür braucht es Menschen, die die Seite benutzen.
      </p>
    </div>
  );
}
