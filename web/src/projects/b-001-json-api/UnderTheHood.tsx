import { useEffect, useState } from 'react';
import { CodeBlock } from '../../design/components/CodeBlock';
import './jsonApi.css';

// Statuscodes für die ok-Tabelle; das Ergebnis rechnet der Browser selbst aus.
const OK_CODES = [200, 201, 204, 299, 301, 404, 500, 503];

const TWO_STEPS = `// das hier …
const data = await res.json();

// … macht dasselbe wie
const text = await res.text();
const data = JSON.parse(text);`;

const CHECK_OK = `const res = await fetch(url);
if (!res.ok) {
  throw new Error(\`HTTP \${res.status}\`);
}
const data = await res.json();`;

const CLONE = `const copy = res.clone();
console.log(await copy.text()); // die Kopie zum Ansehen
const data = await res.json();  // das Original ist noch ungelesen`;

const CHECK_TYPE = `const type = res.headers.get('content-type') ?? '';
if (!type.includes('application/json')) {
  throw new Error(\`Erwartet JSON, bekommen: \${type || 'nichts'}\`);
}`;

const MDN_RESPONSE = 'https://developer.mozilla.org/en-US/docs/Web/API/Response';
const MDN_FETCH = 'https://developer.mozilla.org/en-US/docs/Web/API/Fetch_API/Using_Fetch';

/** Liest einen Body zweimal und hält die echte Meldung dieses Browsers fest. */
async function secondReadMessage(): Promise<string> {
  const res = new Response('[]');
  await res.text();
  try {
    await res.text();
    return 'Kein Fehler (unerwartet).';
  } catch (err) {
    return err instanceof Error ? `${err.name}: ${err.message}` : String(err);
  }
}

export default function UnderTheHood() {
  const [bodyUsed, setBodyUsed] = useState<string | null>(null);
  useEffect(() => {
    let current = true;
    void secondReadMessage().then((m) => {
      if (current) setBodyUsed(m);
    });
    return () => {
      current = false;
    };
  }, []);

  return (
    <div className="json-hood">
      <h3>res.json() sind zwei Schritte</h3>
      <p>
        <code>res.json()</code> liest den Body als Text und gibt ihn an <code>JSON.parse</code>. Mehr passiert nicht:
      </p>
      <CodeBlock code={TWO_STEPS} label="Zwei Schritte" />
      <p>
        Darum lauten die Fehlermeldungen von <code>res.json()</code> ganz ähnlich wie die von <code>JSON.parse</code>. Und
        darum lohnt es sich bei der Fehlersuche, zuerst den Rohtext anzusehen: Oft steht dort eine HTML-Fehlerseite statt
        der erwarteten Daten.
      </p>

      <h3>Warum fetch bei 404 nicht wirft</h3>
      <p>
        <code>fetch</code> beantwortet nur eine Frage: Kam eine Antwort zurück? Ein 404 ist eine Antwort, sogar eine
        sehr deutliche, also erfüllt sich das Promise. Abgelehnt wird es nur, wenn keine Antwort ankommt: Netzwerk weg,
        Name nicht auflösbar oder Anfrage vom Browser blockiert. Dann wirft <code>fetch</code> einen{' '}
        <code>TypeError</code>, in Chrome mit der Meldung „Failed to fetch“; andere Browser formulieren sie anders.
        Wer eine Anfrage selbst abbricht, bekommt einen <code>AbortError</code>.
      </p>
      <p>Ob ein 404 für dein Programm ein Fehler ist, entscheidest du, und zwar vor dem Lesen des Bodys:</p>
      <CodeBlock code={CHECK_OK} label="res.ok prüfen" />

      <h3>res.ok heißt: Status 200 bis 299</h3>
      <p>
        <code>ok</code> ist keine Meinung des Servers, sondern eine Abkürzung für <code>{'status >= 200 && status <= 299'}</code>. Diese Tabelle rechnet dein Browser gerade selbst aus:
      </p>
      <div className="json-table-wrap table-scroll" tabIndex={0} role="region" aria-label="Tabelle: Status und res.ok">
        <table className="json-table">
          <caption>res.ok je Status, live in deinem Browser berechnet</caption>
          <thead>
            <tr>
              <th scope="col">Status</th>
              <th scope="col">res.ok</th>
            </tr>
          </thead>
          <tbody>
            {OK_CODES.map((status) => (
              <tr key={status}>
                <th scope="row">{status}</th>
                <td>
                  <code>{String(new Response(null, { status }).ok)}</code>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <h3>Der Body lässt sich nur einmal lesen</h3>
      <p>
        Der Body ist kein fertiger Text, der in der Response liegt, sondern ein Datenstrom, der beim Lesen verbraucht
        wird. Nach dem ersten <code>text()</code> oder <code>json()</code> steht <code>res.bodyUsed</code> auf{' '}
        <code>true</code>, jeder weitere Versuch wirft. Dein Browser meldet beim zweiten Lesen gerade:
      </p>
      <p className="json-browser-says">
        <code>{bodyUsed ?? '…'}</code>
      </p>
      <p>
        Wer den Text ansehen und trotzdem parsen will, liest einmal als Text und ruft selbst <code>JSON.parse</code>{' '}
        auf, oder macht vorher eine Kopie:
      </p>
      <CodeBlock code={CLONE} label="Mit Kopie lesen" />

      <h3>Content-Type ist eine Absichtserklärung</h3>
      <p>
        Der Header <code>content-type</code> sagt, was der Server zu schicken meint. Weder <code>res.text()</code> noch{' '}
        <code>res.json()</code> noch <code>JSON.parse</code> schauen hinein; deshalb klappt in der Demo der Fall
        „Falscher Content-Type“. Umgekehrt schützt <code>application/json</code> nicht vor kaputtem Text. Wer sicher
        gehen will, prüft den Header selbst, bevor er parst:
      </p>
      <CodeBlock code={CHECK_TYPE} label="Content-Type prüfen" />

      <h3>Zum Weiterlesen</h3>
      <ul className="json-links">
        <li>
          <a href={MDN_FETCH} target="_blank" rel="noreferrer">
            Using the Fetch API
          </a>{' '}
          (MDN, englisch)
        </li>
        <li>
          <a href={MDN_RESPONSE} target="_blank" rel="noreferrer">
            Response
          </a>{' '}
          (MDN, englisch): Status, Header, Body und <code>bodyUsed</code>
        </li>
      </ul>
    </div>
  );
}
