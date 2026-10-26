import { CodeBlock } from '../../design/components/CodeBlock';
import './testing.css';

const GOOD = `test('Ein Bindestrich im Eventnamen wird gemeldet', () => {
  const codes = validateEvent({ event: 'add-to-cart' }).map((i) => i.code);
  expect(codes.includes('name_format')).toBe(true);
});`;

const BLIND = `test('Ein gültiger Kauf läuft durch', () => {
  validateEvent(VALID_PURCHASE);   // Ergebnis wird weggeworfen
  expect(true).toBe(true);         // kann nicht scheitern
});`;

const RUNNER = `function createTestApi() {
  const tests = [];
  return {
    test(name, fn) { tests.push({ name, fn }); },
    expect(actual) {
      return {
        toBe(expected) {
          if (!Object.is(actual, expected)) throw new Error(\`erwartet \${expected}, bekommen \${actual}\`);
        },
        // toEqual und toThrow genauso
      };
    },
    async runAll() {
      const outcomes = [];
      for (const { name, fn } of tests) {
        try { await fn(); outcomes.push({ name, passed: true }); }
        catch (err) { outcomes.push({ name, passed: false, message: err.message }); }
      }
      return outcomes;
    },
  };
}`;

const MUTANT = `// Fehlervariante „Toleranz vergessen“: alles wie validateEvent,
// nur die Summenregel vergleicht exakt statt mit einem Cent Spielraum.
if (Math.abs(value - sum) > 0) issues.push({ code: 'value_mismatch', … });`;

export default function UnderTheHood() {
  return (
    <div className="testing-hood">
      <h3>Was ein Test ist</h3>
      <p>
        Ein Unit Test ruft eine einzelne Funktion mit einer festen Eingabe auf und vergleicht das Ergebnis mit dem, was
        herauskommen soll. <code>test(name, fn)</code> meldet den Test mit einem Namen an, <code>expect(wert)</code>{' '}
        liefert Vergleiche wie <code>toBe</code>. Stimmt der Vergleich nicht, wirft er einen Fehler, und der Test gilt als
        gescheitert.
      </p>
      <CodeBlock code={GOOD} label="Ein Test, der etwas prüft" />

      <h3>Der Mini-Testläufer</h3>
      <p>
        Hier läuft kein Vitest und kein Jest, sondern ein kleiner Nachbau. Er sammelt die Tests in
        einer Liste und führt sie nacheinander aus, jeden für sich in <code>try</code>/<code>catch</code>. So bricht ein
        gescheiterter Test die übrigen nicht ab. Asynchrone Tests wartet er mit <code>await</code> ab.
      </p>
      <CodeBlock code={RUNNER} label="Kern des Testläufers, verkürzt" />
      <p>
        <code>toBe</code> vergleicht wie <code>Object.is</code>: gleiche Zahl, gleicher Text, dasselbe Objekt. Zwei Listen
        mit gleichem Inhalt sind für <code>toBe</code> verschieden; dafür gibt es <code>toEqual</code>, das Listen und
        Objekte Stück für Stück vergleicht. <code>toThrow</code> bekommt eine Funktion, ruft sie selbst auf und besteht,
        wenn sie wirft.
      </p>

      <h3>Fehlervarianten</h3>
      <p>
        Ob ein Test etwas taugt, sieht man nicht, solange der Code stimmt: Dann bestehen gute und schlechte Tests
        gleichermaßen. Deshalb baut man absichtlich Fehler ein, jeweils genau einen, und schaut, ob ein Test scheitert.
        Fachleute nennen das Mutationstests, die kaputten Fassungen Mutanten. Die vier Varianten hier ändern je eine Regel
        von <code>validateEvent</code> und urteilen sonst genau wie das Original.
      </p>
      <CodeBlock code={MUTANT} label="Eine Fehlervariante, verkürzt" />
      <p>
        Erwischt hat ein Test eine Variante erst, wenn er an der richtigen Fassung besteht und an der Variante scheitert.
        Ein Test, der schon am Original scheitert, scheitert überall und sagt deshalb nichts.
      </p>

      <h3>Ein Test, der nie scheitert</h3>
      <CodeBlock code={BLIND} label="Ein Test, der nichts prüft" />
      <p>
        Dieser Test ruft <code>validateEvent</code> zwar auf, sieht sich das Ergebnis aber nie an. Er besteht gegen jede
        Fassung, auch gegen alle kaputten. In einer Liste grüner Tests fällt er nicht auf; erst eine Fehlervariante zeigt,
        dass er nichts bemerkt.
      </p>
      <p>
        Nicht jeder Test, der hier keine Variante erwischt, ist schlecht. Der Test zum Präfix <code>google_</code> prüft
        eine echte Regel; nur ändert keine der vier Varianten diese Regel. Wer wissen will, ob seine Tests reichen, braucht
        Varianten für jede Regel.
      </p>

      <h3>Wo der Code läuft</h3>
      <p>
        In der Code-Aufgabe läuft dein Code in einem Web Worker. Die Prüfung lädt dort <code>validateEvent</code>, die
        vier Varianten und den Testläufer und führt deinen Code einmal je Fassung aus, jedes Mal mit einem frischen{' '}
        <code>test</code> und <code>expect</code>. Erst dann startet sie deine Tests und vergleicht die Ergebnisse.
      </p>
    </div>
  );
}
