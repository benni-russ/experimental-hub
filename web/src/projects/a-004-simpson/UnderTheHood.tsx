import { Disclosure } from '../../design/components/Disclosure';
import { InteractiveFormula, type FormulaPart } from '../../design/components/InteractiveFormula';
import { formatNumber } from '../../learning/numbers';
import { simpsonTerms } from './formulaTerms';
import { MOBILE_SHARE_A, SEGMENT_RATES, overallRate, tippingPoint } from './simpson';
import './simpson.css';

const f1 = (v: number) => formatNumber(v, 1);
const f2 = (v: number) => formatNumber(v, 2);

const LIMITS = [
  'Segment-Fischen: Segmente vorab festlegen, nachträgliches Suchen findet Zufallstreffer',
  'Mehr Segmente, größere Chance auf Scheintreffer: Mehrfachtesten, keine Erkenntnis',
  'Segmente müssen sinnvoll begründet sein (etwa Gerät oder Neu- gegen Bestandskunden), nicht beliebig geschnitten',
];

const FORMULA: FormulaPart[] = [
  { term: 's', text: 's' },
  ' · ',
  { term: 'mobile', text: 'Rate_Mobil' },
  ' + ',
  { term: 'rest', text: '(1 − s)' },
  ' · ',
  { term: 'desktop', text: 'Rate_Desktop' },
];

export default function UnderTheHood() {
  const { A, B } = SEGMENT_RATES;
  const shareA = MOBILE_SHARE_A / 100;
  const overallA = overallRate(A, MOBILE_SHARE_A);
  const tip = tippingPoint();
  const exampleShare = 70;
  const exampleB = overallRate(B, exampleShare);
  const terms = simpsonTerms();

  return (
    <div className="simpson-hood">
      <h3>Formel</h3>
      <p>
        Die Gesamtrate einer Variante ist das Mittel ihrer Segmentraten, gewichtet mit den Anteilen der Segmente an
        ihren Besuchern. Die Werte, die die Formel einsetzt, stammen von Variante A.
      </p>
      <InteractiveFormula
        ariaLabel="Gesamtrate gleich s mal Rate Mobil plus 1 minus s mal Rate Desktop"
        lead="Gesamt ="
        numerator={FORMULA}
        terms={terms}
      />

      <h3>Schritt für Schritt</h3>
      <ol className="simpson-steps">
        <li>
          <strong>A</strong> mit s = {f1(shareA)}: {f1(shareA)} · {f1(A.mobile)} % + {f1(1 - shareA)} · {f1(A.desktop)} % ={' '}
          <strong>{f1(overallA)} %</strong>
        </li>
        <li>
          <strong>B</strong> bei {exampleShare} % Mobil: {f1(exampleShare / 100)} · {f1(B.mobile)} % +{' '}
          {f1(1 - exampleShare / 100)} · {f1(B.desktop)} % = <strong>{f2(exampleB)} %</strong>,{' '}
          {exampleB < overallA ? 'weniger' : 'mehr'} als die {f1(overallA)} % von A, obwohl B in beiden Segmenten besser
          ist
        </li>
        <li>
          <strong>Gleichauf:</strong> B erreicht A, wenn s · {f1(B.mobile)} + (1 − s) · {f1(B.desktop)} = {f1(overallA)}
        </li>
        <li>
          <strong>Nach s aufgelöst:</strong> s = ({f1(B.desktop)} − {f1(overallA)}) / ({f1(B.desktop)} − {f1(B.mobile)}) ={' '}
          {f1(B.desktop - overallA)} / {f1(B.desktop - B.mobile)} ≈ <strong>{f1(tip)} %</strong>
        </li>
        <li>
          <strong>Kipppunkt:</strong> Hat B mehr als {f1(tip)} % Mobil-Anteil, liegt B insgesamt hinter A. Der Regler
          zeigt nur ganze Prozent, dort liegt B ab {Math.ceil(tip)} % hinten.
        </li>
      </ol>

      <h3>Annahmen und Grenzen</h3>
      <ul className="simpson-list">
        {LIMITS.map((l) => (
          <li key={l}>{l}</li>
        ))}
      </ul>

      <h3>Zum Weiterlesen</h3>
      <Disclosure summary="Rückbezug auf die Aufteilungsprüfung (A-003)">
        <p>
          Bei sauberer Zufallsaufteilung haben A und B im Mittel denselben Mix aus Mobil und Desktop, dann zeigen
          Gesamtvergleich und Segmentvergleich in dieselbe Richtung, und das Paradox bleibt im Test aus. Die
          Aufteilungsprüfung aus A-003 kontrolliert, ob die Zuteilung stimmt, und deckt je Segment angewendet auch einen
          ungleichen Mix auf, der in den Gesamtzahlen von A und B nicht auffällt.
        </p>
      </Disclosure>
      <Disclosure summary="Segmentieren oder aggregieren">
        <p>
          Beides sind Sichten auf dieselben Daten, keine Wahrheit gegen Fälschung; welche gilt, hängt davon ab, warum der
          Mix verschieden ist. Bei zufälliger Zuteilung ist die Gesamtrate die ehrliche Antwort auf die Frage, was die
          Umstellung insgesamt bringt, und Segmente zeigen, wo der Effekt sitzt.
        </p>
        <p>
          Ist der Mix in einem randomisierten Test ungleich, ist die Zuteilung gestört: Wie in A-003 erst die Ursache
          suchen und das Ergebnis nicht lesen, auch nicht je Segment, denn die Störung kann auch innerhalb eines
          Segments auswählen, etwa langsame Geräte unter Mobil.
        </p>
        <p>
          Segmentieren ist die richtige Sicht, wenn das Segment eine Störgröße ist: in Beobachtungsdaten oder wenn der
          Mix bewusst verschieden ist. Dann vergleichst du je Segment oder rechnest beide Gruppen auf denselben Mix um.
        </p>
      </Disclosure>
    </div>
  );
}
