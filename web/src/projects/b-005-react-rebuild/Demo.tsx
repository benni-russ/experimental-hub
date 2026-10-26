import { useState } from 'react';
import { Button } from '../../design/components/Button';
import { Switch } from '../../design/components/Switch';
import { ClassicPanel } from './ClassicPanel';
import { ReactPanel } from './ReactPanel';
import './rebuild.css';

export default function Demo() {
  const [forgetTotal, setForgetTotal] = useState(false);
  // Ein neuer Schlüssel baut beide Panels frisch auf: leerer Warenkorb, leeres Protokoll.
  const [round, setRound] = useState(0);

  return (
    <div className="rebuild-demo">
      <div className="rebuild-toolbar">
        <Switch label="Fehler einbauen" checked={forgetTotal} onChange={setForgetTotal} />
        <Button variant="secondary" onClick={() => setRound((r) => r + 1)}>
          Beide Warenkörbe leeren
        </Button>
      </div>
      <p className="rebuild-hint">
        {forgetTotal
          ? 'Der klassische Builder vergisst jetzt, die Summe neu zu schreiben, und das Event liest seinen value aus genau dieser Summe. Die React-Fassung kann das nicht vergessen: Sie rechnet die Summe bei jeder Anzeige aus dem Zustand.'
          : 'Probier die drei Beispiel-Eingaben aus der Schätzfrage in beiden Fassungen: Kaffeebecher, dann Teedose, dann beim Kaffeebecher „+“. Das Protokoll unter jedem Warenkorb zeigt, was bei der letzten Eingabe passiert ist.'}
      </p>
      <div className="rebuild-panels">
        <ClassicPanel key={`classic-${round}`} forgetTotal={forgetTotal} />
        <ReactPanel key={`react-${round}`} />
      </div>
    </div>
  );
}
