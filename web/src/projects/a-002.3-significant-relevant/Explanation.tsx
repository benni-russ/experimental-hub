import { CasesChart } from './CasesChart';
import './significant.css';

export default function Explanation() {
  return (
    <div className="sig-explain">
      <p>
        Zwei Fragen sind getrennt. Signifikant: Liegt die Null außerhalb des Intervalls? Relevant: Liegt der Unterschied
        mindestens beim kleinsten Wert, der sich für dich lohnt, dem MDE aus Versuch A-001? Die Zeichnung legt das Intervall
        eines Tests gegen beide Linien. Je nachdem, wo es liegt, gehört es zu einem von vier typischen Fällen.
      </p>
      <CasesChart />
      <ol>
        <li>
          <strong>Signifikant und relevant:</strong> Das ganze Intervall liegt rechts der MDE-Linie. Hier kannst du
          entscheiden.
        </li>
        <li>
          <strong>Signifikant, aber zu klein:</strong> Der Test spricht gegen „kein Unterschied“, aber selbst das obere Ende bleibt unter dem MDE.
          Das passiert vor allem bei sehr vielen Besuchern. Ob sich der Aufwand lohnt, ist fraglich.
        </li>
        <li>
          <strong>Nicht signifikant, relevant nicht ausgeschlossen:</strong> Das Intervall enthält die Null und die
          MDE-Linie. Der Test war zu ungenau; „kein Effekt“ wäre die falsche Schlussfolgerung.
        </li>
        <li>
          <strong>Nicht signifikant und relevant ausgeschlossen:</strong> Das Intervall enthält die Null, endet aber vor dem
          MDE. Ein lohnender Effekt passt auf diesem Niveau nicht zu den Daten, und das ist eine echte Antwort.
        </li>
      </ol>
      <p>
        Der MDE ist deine Entscheidung vor dem Test, nicht das Ergebnis einer Rechnung. Erst mit ihm wird aus „signifikant“
        eine Antwort auf die Frage, die du eigentlich hattest.
      </p>
    </div>
  );
}
