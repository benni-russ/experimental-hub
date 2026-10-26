import { CodeBlock } from '../../design/components/CodeBlock';
import { Disclosure } from '../../design/components/Disclosure';
import { InteractiveFormula, type FormulaPart } from '../../design/components/InteractiveFormula';
import { formatNumber, formatSignificant, formatSigned } from '../../learning/numbers';
import { formatCount } from './format';
import { EXAMPLE, srmTerms } from './formulaTerms';
import { SRM_THRESHOLD, formatPValue, srmTest } from './srm';
import './srm.css';

const sig = (v: number) => formatSignificant(v);

const R_DOC = 'https://search.r-project.org/R/refmans/stats/html/chisq.test.html';

const CAUSES_LIST = [
  'Weiterleitungen (Redirects), bei denen ein Teil der Besucher die Zielseite nie erreicht oder nicht gezählt wird',
  'Bots und automatische Zugriffe, die nur eine Gruppe treffen',
  'Caching: Eine Variante wird ausgeliefert, ohne dass die Zuteilung oder das Tracking mitläuft',
  'Tracking-Ausfälle, etwa durch Ad-Blocker oder langsame Skripte, die eine Variante stärker betreffen',
  'Ungleiche Auslöser: Die Zuteilung erfolgt an verschiedenen Stellen, zum Beispiel erst nach einem Klick in B',
];

const LIMITS = [
  'Zeigt nur, dass etwas schiefläuft, nicht was; die Ursache suchst du selbst',
  'Nur zwei Varianten; mehr Gruppen brauchen den χ²-Test mit mehr Freiheitsgraden',
  'Kleine Verschiebung bleibt unter der Schwelle, kann aber verfälschen; mögliche Ursachen zeigt die Demo oben, solange „Eigene Zahlen prüfen“ aus ist',
  'Normalnäherung trägt bei sehr wenigen Besuchern nicht; ab einigen Tausend Besuchern ist sie unproblematisch',
];

// Einzeilige Summe: der Baustein kennt nur einen Bruch oder eine Zeile, die Brüche stehen als Text
const FORMULA: FormulaPart[] = [
  { term: 'devA', text: '(O_A − E_A)²/E_A' },
  ' + ',
  { term: 'devB', text: '(O_B − E_B)²/E_B' },
  ', mit ',
  { term: 'expected', text: 'E_A = n·q' },
  ' und E_B = n·(1 − q)',
];

export default function UnderTheHood() {
  const r = srmTest(EXAMPLE)!;
  const terms = srmTerms(EXAMPLE, r);
  const n = EXAMPLE.visitorsA + EXAMPLE.visitorsB;
  const q = EXAMPLE.plannedShareA / 100;
  const dA = EXAMPLE.visitorsA - r.expectedA;
  const dB = EXAMPLE.visitorsB - r.expectedB;
  const z = Math.sqrt(r.chiSquare);

  return (
    <div className="srm-hood">
      <h3>Formel</h3>
      <p>
        Der χ²-Anpassungstest (Chi-Quadrat) misst, wie weit die tatsächlichen Besucherzahlen O von den erwarteten E
        abweichen, die aus dem geplanten Anteil q und der Gesamtzahl n folgen.
      </p>
      <InteractiveFormula
        ariaLabel="Chi-Quadrat gleich: O A minus E A zum Quadrat, geteilt durch E A, plus O B minus E B zum Quadrat, geteilt durch E B, mit E A gleich n mal q und E B gleich n mal 1 minus q"
        lead="χ² ="
        numerator={FORMULA}
        terms={terms}
      />

      <h3>Schritt für Schritt</h3>
      <p>Dein Einstiegsbeispiel, durchgerechnet.</p>
      <ol className="srm-steps">
        <li>
          <strong>Erwartung:</strong> n = {formatNumber(n)}, q = {sig(q)}, E_A = {formatNumber(n)} · {sig(q)} ={' '}
          {formatCount(r.expectedA)}, E_B = {formatCount(r.expectedB)}
        </li>
        <li>
          <strong>Abweichung:</strong> O_A − E_A = {formatNumber(EXAMPLE.visitorsA)} − {formatCount(r.expectedA)} ={' '}
          {formatNumber(dA)}, O_B − E_B = {formatNumber(EXAMPLE.visitorsB)} − {formatCount(r.expectedB)} ={' '}
          {formatSigned(dB)}
        </li>
        <li>
          <strong>χ²:</strong> ({formatNumber(dA)})² / {formatCount(r.expectedA)} + ({formatSigned(dB)})² /{' '}
          {formatCount(r.expectedB)} = <strong>{sig(r.chiSquare)}</strong>
        </li>
        <li>
          <strong>Beziehung zu z:</strong> bei zwei Gruppen ein Freiheitsgrad, also χ² = z²; z = √{sig(r.chiSquare)} ={' '}
          {sig(z)}, p = 2 · Φ(−z) (zweiseitiger z-Test) = <strong>{formatPValue(r.pValue)}</strong>
        </li>
        <li>
          <strong>Befund:</strong> {formatPValue(r.pValue)} &lt; {formatNumber(SRM_THRESHOLD, 3)}, die Aufteilung passt
          nicht
        </li>
      </ol>

      <h3>Annahmen und Grenzen</h3>
      <ul className="srm-list">
        {LIMITS.map((l) => (
          <li key={l}>{l}</li>
        ))}
      </ul>

      <h3>Zum Weiterlesen</h3>
      <Disclosure summary="Schwelle und Begründung">
        <p>
          Die Schwelle liegt bei p &lt; {formatNumber(SRM_THRESHOLD, 3)}, also deutlich strenger als die üblichen 0,05,
          denn die Prüfung läuft bei jedem Test und oft mehrmals: Mit 0,05 gäbe es regelmäßig Fehlalarme, und jeder
          Fehlalarm stoppt einen gesunden Test. In der Praxis liegen die Schwellen zwischen 0,01 und 0,0005; wirkliche
          Fehler in der Zuteilung sind meist so deutlich, dass sie die strenge Schwelle trotzdem reißen.
        </p>
      </Disclosure>
      <Disclosure summary="Typische Ursachen">
        <ul className="srm-list">
          {CAUSES_LIST.map((c) => (
            <li key={c}>{c}</li>
          ))}
        </ul>
      </Disclosure>
      <Disclosure summary="Gegenprobe mit R">
        <p>
          Dieselbe Rechnung steckt in der R-Funktion{' '}
          <a href={R_DOC} target="_blank" rel="noreferrer">
            <code>chisq.test</code>
          </a>
          . Für das Beispiel oben lautet der Aufruf, mit dem geplanten Anteil als Vektor <code>p</code>:
        </p>
        <CodeBlock code={`chisq.test(c(${EXAMPLE.visitorsA}, ${EXAMPLE.visitorsB}), p = c(${q}, ${1 - q}))`} label="R-Aufruf" />
        <p>
          Allgemein: <code>chisq.test(c(a, b), p = c(q, 1 - q))</code> mit den Besuchern a und b und dem geplanten Anteil
          q für A. R zeigt <code>X-squared = {r.chiSquare.toPrecision(3)}</code> (mit Punkt als Dezimalzeichen) und einen
          p-Wert, der dem oben entspricht.
        </p>
      </Disclosure>
    </div>
  );
}
