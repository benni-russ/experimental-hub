import { FORBIDDEN, ROWS, parseError, roundTrip } from './roundTrip';
import './json.css';

/** Wert als Text, wie man ihn im Code schreiben würde (undefined sichtbar, Strings in Anführungszeichen). */
export function show(value: unknown): string {
  return value === undefined ? 'undefined' : (JSON.stringify(value) ?? 'undefined');
}

export default function Explanation() {
  return (
    <div className="jvo-explain">
      <p>
        Ein JavaScript-Objekt lebt im Speicher deines Programms. JSON ist dagegen reiner Text, der nur so aussieht.{' '}
        <code>JSON.stringify</code> macht aus dem Objekt Text, <code>JSON.parse</code> baut aus dem Text wieder ein
        Objekt. Der Text kennt nur Text, Zahl, Wahrheitswert, <code>null</code>, Liste und Objekt. Alles andere wird auf
        dem Weg verändert oder verschwindet, und zwar ohne Fehlermeldung.
      </p>
      <div className="jvo-wrap table-scroll" tabIndex={0} role="region" aria-label="Tabelle: JS-Wert, JSON-Text und zurück, seitlich verschiebbar">
        <table className="jvo-table">
          <caption>Hin mit JSON.stringify, zurück mit JSON.parse (alle Werte hier live berechnet)</caption>
          <thead>
            <tr>
              <th scope="col">Fall</th>
              <th scope="col">In JavaScript</th>
              <th scope="col">JSON-Text</th>
              <th scope="col">Wieder zurück</th>
            </tr>
          </thead>
          <tbody>
            {ROWS.map((row) => {
              const { json, back } = roundTrip(row.value());
              return (
                <tr key={row.label}>
                  <th scope="row">{row.label}</th>
                  <td>
                    <code>{row.source}</code>
                  </td>
                  <td>
                    {json === undefined ? <code className="jvo-leer">kein Text (undefined)</code> : <code>{json}</code>}
                  </td>
                  <td>
                    <code>{show(back)}</code>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
      <p>
        Zwei Zeilen verdienen einen zweiten Blick. Das <code>Date</code> kommt als String zurück, nicht als Datum: Du
        musst es mit <code>new Date(text)</code> selbst wieder bauen. Und <code>0.1 + 0.2</code> bleibt, was es in
        JavaScript schon war: eine Zahl mit Rundungsrest. Das liegt an der Zahlendarstellung, nicht an JSON.
      </p>
      <h3>Was ein JSON-Text nicht enthalten darf</h3>
      <p>
        Umgekehrt ist nicht jeder Text, der wie ein JavaScript-Objekt aussieht, gültiges JSON. Diese vier Schreibweisen
        sind im Code erlaubt, <code>JSON.parse</code> lehnt sie ab. Die Meldung darunter hat dein Browser gerade selbst
        erzeugt.
      </p>
      <ul>
        {FORBIDDEN.map((f) => (
          <li key={f.label}>
            <strong>{f.label}:</strong> <code>{f.text.replace('\n', ' ')}</code>
            <br />
            <code className="jvo-error">{parseError(f.text)}</code>
          </li>
        ))}
      </ul>
    </div>
  );
}
