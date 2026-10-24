export default function Explanation() {
  return (
    <div className="bayes-explain" style={{ display: 'grid', gap: 'var(--abstand-4)', minWidth: 0 }}>
      <p>
        Ein Konfidenzintervall beantwortet: „Welche Unterschiede passen zu den Daten?“ Die Bayes-Lesart beantwortet:
        „Wie wahrscheinlich ist es, dass B besser ist?“ Für die zweite Antwort braucht sie etwas, das das Intervall nicht
        braucht, nämlich den Prior: eine Annahme darüber, welche Effekte schon vor dem Test plausibel waren. Daten und
        Prior zusammen ergeben die Wahrscheinlichkeit.
      </p>
      <p>
        Der Prior kann das Ergebnis verschieben. Ein flacher Prior hält jeden Effekt für gleich plausibel und lässt die
        Daten allein sprechen; ein skeptischer Prior, auf „kein Unterschied“ zentriert, hält große Effekte für selten und zieht
        kleine Stichproben zur Null hin. Bei 10 % gegen 11 % mit je 10.000 Besuchern liefert ein flacher Prior für „B ist besser“ rund 99 %. Ein
        skeptischer Prior würde die Zahl senken. Wer „97 %“ meldet, sollte deshalb sagen, mit welchem Prior.
      </p>
      <p>
        Gemeinsam haben beide Lesarten das Rauschen: Sie rechnen mit denselben Daten, und bei wenig Besuchern sind beide
        unsicher. Die Bayes-Lesart ist kein Weg, aus einem zu kleinen Test mehr herauszuholen. Im Alltag nützt sie, wenn
        die Entscheidung selbst eine Wahrscheinlichkeit verlangt („Lohnt sich der Umbau?“) und das Team den Prior
        offenlegt. Sie ersetzt aber nicht die Frage nach der Größe des Effekts: Auch „B ist mit 99 % besser“ sagt nicht,
        wie viel besser.
      </p>
    </div>
  );
}
