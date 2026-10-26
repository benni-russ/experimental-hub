import { useEffect, useState } from 'react';
import { CodeBlock } from '../../design/components/CodeBlock';
import { runSnippet, SNIPPETS } from './traces';
import './eventLoop.css';

const AWAIT_AS_THEN = `async function load() {
  console.log('vor await');
  await null;
  console.log('nach await');
}

// verhält sich wie

function load() {
  console.log('vor await');
  return Promise.resolve(null).then(() => {
    console.log('nach await');
  });
}`;

const STARVE = `// Nicht ausführen: Diese Seite friert ein.
setTimeout(() => console.log('Timer'), 0);
function forever() {
  Promise.resolve().then(forever);
}
forever();`;

const LOOP = `while (true) {
  führe die älteste Macrotask aus (am Anfang: das Skript)
  solange Microtasks warten:
    führe die älteste Microtask aus
  zeichne die Seite neu, wenn nötig
}`;

const MDN_GUIDE = 'https://developer.mozilla.org/en-US/docs/Web/API/HTML_DOM_API/Microtask_guide';
const MDN_IN_DEPTH = 'https://developer.mozilla.org/en-US/docs/Web/API/HTML_DOM_API/Microtask_guide/In_depth';

const mixed = SNIPPETS.find((s) => s.id === 'mixed');

export default function UnderTheHood() {
  const [real, setReal] = useState<string[] | null>(null);

  // Das gemischte Beispiel läuft hier wirklich, im Browser des Nutzers.
  useEffect(() => {
    let current = true;
    if (mixed) {
      void runSnippet(mixed.code).then((out) => {
        if (current) setReal(out);
      });
    }
    return () => {
      current = false;
    };
  }, []);

  return (
    <div className="loop-hood">
      <h3>Ein Arbeitsplatz, ein Stapel</h3>
      <p>
        JavaScript im Browser läuft auf einem einzigen Faden. Was gerade arbeitet, liegt auf dem Call Stack; ruft eine
        Funktion eine andere auf, kommt die obendrauf. Eine Funktion wird nie mittendrin unterbrochen: Erst wenn der
        Stapel leer ist, kann etwas anderes drankommen. Darum friert eine lange Schleife die Seite ein, auch wenn Klicks
        und Timer längst warten.
      </p>

      <h3>Zwei Warteschlangen, eine Regel</h3>
      <p>
        <strong>Macrotasks</strong> kommen von außen: das Skript selbst, Timer aus <code>setTimeout</code>, Klicks,
        Nachrichten. <strong>Microtasks</strong> sind Nacharbeiten: Funktionen aus <code>then</code>, <code>catch</code>{' '}
        und <code>finally</code>, der Rest einer <code>async</code>-Funktion nach <code>await</code> und alles, was{' '}
        <code>queueMicrotask</code> anmeldet. Die Event Loop arbeitet sinngemäß so:
      </p>
      <CodeBlock code={LOOP} label="Event Loop als Pseudocode" />
      <p>
        Nach jeder Macrotask wird die Microtask-Queue also ganz geleert, bevor die nächste Macrotask darf. Deshalb kommt
        ein <code>then</code> vor einem Timer, selbst wenn der Timer zuerst im Code steht und auf <code>0</code>{' '}
        Millisekunden gestellt ist. Zwischen zwei Macrotasks darf der Browser die Seite neu zeichnen, zwischen zwei
        Microtasks nicht.
      </p>

      <h3>await ist then in anderer Schreibweise</h3>
      <p>
        Eine <code>async</code>-Funktion läuft bis zum ersten <code>await</code> ganz normal. Dort verlässt sie den Call
        Stack, und der Rest wird zur Reaktion auf ein Promise. Für die Reihenfolge verhalten sich diese beiden
        Schreibweisen gleich:
      </p>
      <CodeBlock code={AWAIT_AS_THEN} label="await und then" />

      <h3>Microtasks können alles aufhalten</h3>
      <p>
        Weil die Microtask-Queue ganz geleert wird, auch von Microtasks, die dabei neu dazukommen, kann eine Kette ohne
        Ende den Timer, jeden Klick und das Neuzeichnen aussperren:
      </p>
      <CodeBlock code={STARVE} label="Endlose Microtasks" />
      <p>
        Ein Timer dagegen meldet sich immer als neue Macrotask an. Zwischen zwei Timern kommen Microtasks, Klicks und das
        Neuzeichnen also wieder an die Reihe.
      </p>

      <h3>setTimeout mit 0 heißt „frühestens“</h3>
      <p>
        Die Zahl bei <code>setTimeout</code> ist eine Mindestwartezeit, kein Termin. Läuft gerade noch Code oder warten
        Microtasks, wartet der Timer länger. Bei tief verschachtelten Timern hebt der Browser die Wartezeit außerdem von
        sich aus etwas an.
      </p>

      <h3>Dein Browser hat es eben ausgeführt</h3>
      <p>Das gemischte Beispiel aus der Demo, gerade echt in diesem Browser gelaufen, ergibt:</p>
      <p className="loop-browser-says">
        <code>{real ? real.join(' → ') : '…'}</code>
      </p>
      <p>
        Dieselbe Ausführung prüft auch, ob die gezeichneten Schritte der Demo stimmen: Ein Test vergleicht die letzte
        Konsole jedes Beispiels mit der echten Ausgabe.
      </p>

      <h3>Zum Weiterlesen</h3>
      <ul className="loop-list">
        <li>
          <a href={MDN_GUIDE} target="_blank" rel="noreferrer">
            Using microtasks in JavaScript with queueMicrotask()
          </a>{' '}
          (MDN, englisch)
        </li>
        <li>
          <a href={MDN_IN_DEPTH} target="_blank" rel="noreferrer">
            In depth: Microtasks and the JavaScript runtime environment
          </a>{' '}
          (MDN, englisch)
        </li>
      </ul>
    </div>
  );
}
