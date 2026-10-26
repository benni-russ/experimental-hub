import { CodeBlock } from '../../design/components/CodeBlock';
import { STATUS_CODES } from '../../http/statusCodes';
import './http.css';

const RAW_REQUEST = `POST /products HTTP/1.1
host: api.beispiel.test
content-type: application/json
authorization: Bearer demo

{"name": "Lineal", "price": 2}`;

const RAW_RESPONSE = `HTTP/1.1 201 Created
content-type: application/json
location: /products/3

{"id": 3, "name": "Lineal", "price": 2}`;

const RETRY = `for (let versuch = 1; versuch <= tries; versuch++) {
  const res = await fetch(url);
  if (res.status < 500) return res; // Erfolg oder Fehler des Clients: fertig
  // hier kurz warten, bei jedem Versuch etwas länger
}`;

const METHODS: { name: string; use: string; body: string; again: string }[] = [
  { name: 'GET', use: 'etwas lesen', body: 'nein', again: 'ja' },
  { name: 'POST', use: 'etwas Neues anlegen', body: 'ja', again: 'nein, es entsteht ein zweites' },
  { name: 'PUT', use: 'etwas ersetzen', body: 'ja', again: 'ja, danach steht dasselbe da' },
  { name: 'DELETE', use: 'etwas löschen', body: 'nein', again: 'ja, danach ist es weg' },
];

const MDN_STATUS = 'https://developer.mozilla.org/en-US/docs/Web/HTTP/Status';
const MDN_MESSAGES = 'https://developer.mozilla.org/en-US/docs/Web/HTTP/Messages';

export default function UnderTheHood() {
  return (
    <div className="http-hood">
      <h3>Eine Anfrage, Zeile für Zeile</h3>
      <p>
        Was zwischen Browser und Server wandert, ist Text. Die erste Zeile nennt <code>Methode</code>, <code>Pfad</code> und
        die Protokollversion. Danach folgen die Header, jeweils ein <code>name: wert</code> pro Zeile. Eine Leerzeile
        beendet die Header; was danach kommt, ist der Body.
      </p>
      <CodeBlock code={RAW_REQUEST} label="Anfrage" />
      <p>
        Die Antwort ist genauso gebaut, nur beginnt sie mit der Statuszeile: Protokoll, Nummer, Kurztext. Die Nummer ist
        für Programme, der Kurztext für Menschen; ein Programm sollte sich nur auf die Nummer verlassen.
      </p>
      <CodeBlock code={RAW_RESPONSE} label="Antwort" />

      <h3>Vier Methoden, vier Absichten</h3>
      <p>
        Die Methode sagt, was du mit dem Pfad vorhast. Sie entscheidet auch, ob eine Wiederholung gefahrlos ist: Wer ein <code>POST</code> zweimal
        schickt, legt womöglich zwei Dinge an.
      </p>
      <div className="http-table-wrap" tabIndex={0} role="region" aria-label="Tabelle: Methoden, seitlich verschiebbar">
        <table className="http-table">
          <caption>Die vier Methoden: Zweck, Body und ob zweimal Senden harmlos ist</caption>
          <thead>
            <tr>
              <th scope="col">Methode</th>
              <th scope="col">Zweck</th>
              <th scope="col">Body</th>
              <th scope="col">Zweimal senden harmlos?</th>
            </tr>
          </thead>
          <tbody>
            {METHODS.map((m) => (
              <tr key={m.name}>
                <th scope="row">
                  <code>{m.name}</code>
                </th>
                <td>{m.use}</td>
                <td>{m.body}</td>
                <td>{m.again}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <h3>Die Statuscodes der Demo</h3>
      <p>
        Die erste Ziffer ist die Klasse: <code>2xx</code> Erfolg, <code>4xx</code> der Absender hat etwas falsch gemacht,{' '}
        <code>5xx</code> der Server schafft es gerade nicht. Diese Tabelle hinterlegt die Demo:
      </p>
      <div className="http-table-wrap" tabIndex={0} role="region" aria-label="Tabelle: Statuscodes der Demo, seitlich verschiebbar">
        <table className="http-table">
          <caption>Die Statuscodes der Demo mit Klasse, Verursacher und Wiederholung</caption>
          <thead>
            <tr>
              <th scope="col">Code</th>
              <th scope="col">Bedeutung</th>
              <th scope="col">Klasse</th>
              <th scope="col">Wessen Fehler?</th>
              <th scope="col">Erneut versuchen?</th>
            </tr>
          </thead>
          <tbody>
            {STATUS_CODES.map((s) => (
              <tr key={s.status}>
                <th scope="row">{s.status}</th>
                <td>{s.text}</td>
                <td>
                  <code>{s.klass}</code>
                </td>
                <td>{s.whoseFault === 'niemand' ? 'keiner' : s.whoseFault}</td>
                <td>{s.retry ? 'ja' : 'nein'}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <h3>401 oder 403?</h3>
      <p>
        Beide Nummern sagen „kein Zutritt“, aber aus verschiedenen Gründen. Bei <code>401</code> weiß der Server nicht, wer
        du bist: Es fehlt der Header <code>authorization</code> oder er stimmt nicht. Bei <code>403</code> kennt er dich,
        lässt dich aber nicht herein, weil dir die Berechtigung fehlt. Im ersten Fall hilft eine Anmeldung, im zweiten
        nur ein anderes Konto oder mehr Rechte.
      </p>

      <h3>Header, die dir begegnen</h3>
      <ul className="http-list">
        <li>
          <code>content-type</code>: Welche Art Inhalt der Body hat, etwa <code>application/json</code>.
        </li>
        <li>
          <code>accept</code>: Welche Art Antwort du dir wünschst.
        </li>
        <li>
          <code>authorization</code>: Deine Anmeldung. In der Demo ist es <code>Bearer demo</code>.
        </li>
        <li>
          <code>location</code>: Wo das Neue nach einem <code>201</code> liegt.
        </li>
        <li>
          <code>retry-after</code>: Wie lange du bei Überlastung warten sollst; die Demo schickt ihn beim{' '}
          <code>503</code> mit.
        </li>
      </ul>

      <h3>Wiederholen mit Verstand</h3>
      <p>
        Ein zweiter Versuch hilft nur dort, wo der Fehler vergehen kann: beim Server, der sich erholt, und beim
        Netzwerk, das wieder da ist. Bei den übrigen <code>4xx</code> bekommst du immer wieder dieselbe Antwort. Dazu
        gehört eine Obergrenze, sonst hämmert dein Programm endlos auf einen angeschlagenen Server. In echt wartet man
        zwischen den Versuchen, jedes Mal etwas länger. Und Anfragen, die etwas anlegen, wiederholt man nur, wenn man
        sicher ist, dass kein Duplikat entsteht. Die Aufgabe „Mit Wiederholung laden“ verlangt mehr als dieses Gerüst, etwa den Netzwerkausfall und die letzte Antwort. Die Grundidee sieht so aus:
      </p>
      <CodeBlock code={RETRY} label="Skizze: Wiederholen" />

      <h3>Zum Weiterlesen</h3>
      <ul className="http-list">
        <li>
          <a href={MDN_STATUS} target="_blank" rel="noreferrer">
            HTTP response status codes
          </a>{' '}
          (MDN, englisch): alle Codes mit Erklärung
        </li>
        <li>
          <a href={MDN_MESSAGES} target="_blank" rel="noreferrer">
            HTTP messages
          </a>{' '}
          (MDN, englisch): Aufbau von Anfrage und Antwort
        </li>
      </ul>
    </div>
  );
}
