import { CodeBlock } from '../../design/components/CodeBlock';
import './rebuild.css';

const CLASSIC = `// klassisch: jede Stelle von Hand
addButton.addEventListener('click', () => {
  const name = addButton.dataset.itemName;   // Feld gelesen
  const row = document.createElement('li');
  row.textContent = name;
  list.append(row);                          // Zeile eingefügt
  emptyHint.hidden = true;                   // Hinweis ausgeblendet
  total.textContent = sumFromRows();         // Summe neu geschrieben
  eventText.textContent = buildEventFromDom();
});`;

const REACT = `// React: Zustand rein, Ansicht raus
function Cart() {
  const [state, dispatch] = useReducer(cartReducer, { items: [] });
  const total = cartTotal(state);            // abgeleitet, nie gespeichert
  return (
    <>
      <button onClick={() => dispatch({ type: 'add', item })}>+</button>
      <ul>{state.items.map((i) => <li key={i.item_id}>{i.item_name}</li>)}</ul>
      <output>{total}</output>
      <pre>{JSON.stringify(toEvent(state), null, 2)}</pre>
    </>
  );
}`;

const REDUCER = `function cartReducer(state, action) {
  switch (action.type) {
    case 'remove':
      return { ...state, items: state.items.filter((i) => i.item_id !== action.item_id) };
    // add und setQuantity genauso: neue Objekte, das alte bleibt
    default:
      return state;
  }
}`;

export default function UnderTheHood() {
  return (
    <div className="rebuild-hood">
      <h3>Zwei Wege zum selben Event</h3>
      <p>
        Beide Fassungen bauen am Ende dasselbe <code>add_to_cart</code>-Event wie in B-004. Der Unterschied liegt darin,
        wer sich merkt, was gerade im Warenkorb liegt, und wer die Seite danach anpasst.
      </p>

      <h3>Klassisch: das DOM ist der Speicher</h3>
      <p>
        Der klassische Builder hat keinen eigenen Zustand. Was im Warenkorb liegt, steht nur in den Zeilen der Seite. Bei
        jeder Eingabe liest er dort nach und schreibt dann jede betroffene Stelle einzeln neu: die Zeile, den Hinweis auf
        den leeren Warenkorb, die Summe, den Event-Text. Das Event entsteht ebenfalls aus der Seite; seinen{' '}
        <code>value</code> liest es aus der angezeigten Summe.
      </p>
      <CodeBlock code={CLASSIC} label="Klassischer Handler, verkürzt" />
      <p>
        Jeder Schreibzugriff ist eine Stelle, die man vergessen kann. Genau das macht der Schalter „Fehler einbauen“: Er
        lässt eine einzige Zeile weg. Die Seite merkt nichts, die Summe zeigt einen alten Wert, und weil das Event von der
        Summe abschreibt, ist es auch falsch. Mit jedem neuen Feld, etwa einem Rabatt, kommen weitere Stellen dazu.
      </p>

      <h3>React: die Ansicht als Funktion des Zustands</h3>
      <p>
        Die React-Fassung merkt sich den Warenkorb als Zustand, ein einfaches Objekt <code>{'{ items }'}</code>. Eine
        Eingabe wird zu einer Aktion, etwa <code>{"{ type: 'add', item }"}</code>. <code>useReducer</code> gibt sie an den
        Reducer, der aus altem Zustand und Aktion den neuen berechnet. Danach ruft React die Komponente neu auf, und die
        beschreibt, wie die Seite zu diesem Zustand aussieht.
      </p>
      <CodeBlock code={REACT} label="React-Komponente, verkürzt" />
      <p>
        Summe und Event werden bei jedem Aufruf aus dem Zustand berechnet. Sie sind <em>abgeleitet</em>: Weil es sie nirgends
        gespeichert gibt, können sie nicht veralten. Den Fehler aus dem Schalter kann man hier gar nicht einbauen, weil es
        die Zeile „Summe neu schreiben“ nicht gibt.
      </p>

      <h3>Warum der Reducer nichts verändert</h3>
      <p>
        <code>useReducer</code> vergleicht den neuen Zustand mit dem alten. Ist es dasselbe Objekt, geht React davon aus,
        dass sich nichts geändert hat, und zeichnet nicht neu. Deshalb baut der Reducer neue Objekte mit{' '}
        <code>...</code>, <code>map</code> und <code>filter</code> und lässt die alten unberührt. Nebenbei lässt sich so
        jeder alte Stand noch vergleichen.
      </p>
      <CodeBlock code={REDUCER} label="Reducer, verkürzt" />

      <h3>Und wer schreibt bei React ins DOM?</h3>
      <p>
        React selbst. Es vergleicht die neue Beschreibung mit der vorigen und ändert nur die Stellen, die sich
        unterscheiden. Auch dort gibt es also Schreibzugriffe; nur stehen sie nicht mehr im eigenen Code, und keiner kann
        vergessen werden. Das Protokoll der React-Fassung zählt deshalb nur die Schreibzugriffe im eigenen Code.
      </p>

      <h3>Was die Demo zählt</h3>
      <p>
        Als Schreibzugriff zählt jeder Eingriff in die sichtbare Seite einmal: eine Zeile einfügen oder entfernen, eine
        Menge, den Hinweis, die Summe, den Event-Text. Eine neue Zeile wird vorher außerhalb der Seite zusammengesetzt und
        dann mit einem Aufruf eingefügt. Lesen zählt nicht.
      </p>
    </div>
  );
}
