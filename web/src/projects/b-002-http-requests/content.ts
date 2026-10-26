import type { ContentMeta } from '@hub/shared';

// Jede Zahl in diesen Texten ist in content.test.ts gegen die Statuscode-Tabelle
// oder den nachgebauten Server geprüft. Wer eine Zahl ändert, ändert dort mit.
// Quiz, Karten und Reflexion zeigen reinen Text: dort keine Backticks.
// Code-Aufgaben dagegen setzen `…` als Code.

const lines = (...l: string[]) => `${l.join('\n')}\n`;

export const meta: ContentMeta = {
  id: 'B-002',
  slug: 'http-requests',
  title: 'HTTP Request Visualizer',
  track: 'web',
  kind: 'project',
  question: 'Was steht in Request und Antwort – und was bedeuten 200, 400, 401, 404 und 500?',
  buildsOn: ['B-001'],
  leadsTo: ['B-003', 'B-004'],
  intro: {
    text:
      'Wenn du eine Seite öffnest oder in einer App auf „Speichern“ tippst, schickt dein Gerät einen Brief an einen anderen Rechner und wartet auf Antwort. ' +
      'Brief und Antwort haben dieselbe Form: oben steht, worum es geht, darunter kommen Zusatzangaben, und ganz unten steht der eigentliche Inhalt. ' +
      'Das Wichtigste an der Antwort steht in ihrer ersten Zeile, einer dreistelligen Nummer. ' +
      'Sie sagt nicht nur, ob es geklappt hat, sondern auch, bei wem der Fehler liegt und ob sich ein zweiter Versuch lohnt. ' +
      'In der Demo schickst du selbst Anfragen an einen nachgebauten Server und liest beide Seiten im Rohtext. ' +
      'Schätz zuerst aus dem Bauch: In der Tabelle der Demo stehen zehn Statuscodes. Wie viele davon gehen auf das Konto des Absenders, nicht des Servers?',
    estimateQuestionId: 'B-002-quiz-01',
  },
  quiz: [
    {
      id: 'B-002-quiz-01',
      type: 'estimate',
      prompt: 'Wie viele der zehn Statuscodes in der Tabelle sind Fehler des Clients?',
      answer: 5,
      tolerance: 0.2,
      unit: 'Codes',
      explanation:
        'Fünf: 400, 401, 403, 404 und 429. Sie liegen alle beim Absender der Anfrage, dem Client: ungültige Angaben, fehlende Anmeldung, fehlende Berechtigung, ein Pfad, den es nicht gibt, oder zu viele Anfragen. ' +
        'Die übrigen fünf teilen sich so auf: drei Erfolgscodes (200, 201, 204) und zwei Fehler des Servers (500, 503). ' +
        'Die erste Ziffer verrät die Klasse: 200er sind Erfolg, 400er liegen am Client, 500er am Server.',
    },
    {
      id: 'B-002-quiz-02',
      type: 'choice',
      prompt: 'Deine Anfrage bekommt die Antwort 401. Was ist der sinnvolle nächste Schritt?',
      options: [
        'Dieselbe Anfrage nach kurzer Pause noch einmal schicken.',
        'Den Pfad ändern, vermutlich gibt es ihn nicht.',
        'Anmeldedaten mitschicken, etwa den Header Authorization.',
        'Warten, bis der Server wieder erreichbar ist.',
      ],
      correctIndex: 2,
      explanation:
        '401 heißt: Der Server weiß nicht, wer du bist. Solange der Header Authorization fehlt oder nicht stimmt, bekommst du bei jedem Versuch dieselbe Antwort. ' +
        'Einen Pfad, den es nicht gibt, meldet 404. Ein Server, der gerade nicht kann, meldet sich mit 503. ' +
        'Bei 403 kennt der Server dich dagegen, lässt dich aber nicht herein; dann hilft auch ein Token nicht, es fehlt dir die Berechtigung.',
    },
    {
      id: 'B-002-quiz-03',
      type: 'choice',
      prompt: 'Dieselbe Anfrage antwortet erst mit 503, dann mit 500. Was heißt das?',
      options: [
        'Die Anfrage ist falsch aufgebaut, der Server weist sie ab.',
        'Der Fehler liegt beim Server, und ein neuer Versuch kann klappen.',
        'Beide Nummern bedeuten Erfolg, der Server wechselt sie nur ab.',
        'Die Anmeldung ist abgelaufen, du brauchst einen neuen Token.',
      ],
      correctIndex: 1,
      explanation:
        'Beide Nummern beginnen mit einer 5: Der Server hat die Anfrage verstanden, kann sie aber gerade nicht erledigen, etwa weil er überlastet ist (503) oder intern stolpert (500). ' +
        'Daran kannst du selbst nichts ändern, aber ein späterer Versuch kann klappen. ' +
        'Deshalb gilt die Tabelle für beide als wiederholbar. Trotzdem nicht endlos: Lege vorher fest, wie oft du es höchstens probierst.',
    },
    {
      id: 'B-002-quiz-04',
      type: 'choice',
      prompt: 'Dein Programm wiederholt eine fehlgeschlagene Anfrage von selbst. Bei welcher Antwort bringt das nichts?',
      options: [
        '503, Nicht verfügbar.',
        '500, Serverfehler.',
        'Bei einem Netzwerkausfall, es kam gar keine Antwort.',
        '400, Ungültige Anfrage.',
      ],
      correctIndex: 3,
      explanation:
        'Bei 400 ist an der Anfrage selbst etwas falsch. Schickst du sie unverändert noch einmal, bekommst du dieselbe Ablehnung. Erst musst du sie korrigieren. ' +
        'Dasselbe gilt für 401, 403 und 404. Die Ausnahme unter den 400ern ist 429: „zu viele Anfragen“ gibt sich nach einer Pause von selbst. ' +
        'Bei 500er-Fehlern und Netzwerkausfall dagegen lohnt sich ein weiterer Versuch.',
    },
  ],
  reflection: [
    {
      id: 'B-002-refl-01',
      prompt:
        'Eine Kollegin sagt: „Der Server hat geantwortet, also ist alles gut.“ Was erklärst du ihr über die erste Zeile der Antwort?',
    },
    {
      id: 'B-002-refl-02',
      prompt:
        'Du bekommst einmal 401 und einmal 403. Woran erkennst du den Unterschied, und was tust du jeweils als Nächstes?',
    },
    {
      id: 'B-002-refl-03',
      prompt:
        'Warum ist blindes Wiederholen bei Serverfehlern riskant, und wie begrenzt du es? Denk auch an Anfragen, die etwas anlegen.',
    },
  ],
  cards: [
    {
      id: 'B-002-card-01',
      front: 'Woraus besteht eine HTTP-Anfrage?',
      back: 'Aus der Startzeile mit Methode und Pfad, den Headern (Zusatzangaben) und optional einem Body. Zwischen den Headern und dem Body steht eine Leerzeile.',
    },
    {
      id: 'B-002-card-02',
      front: 'Woraus besteht eine HTTP-Antwort?',
      back: 'Aus der Statuszeile mit Nummer und Kurztext, den Headern und dem Body. Die Statuszeile ist die Zeile, die zuerst zählt.',
    },
    {
      id: 'B-002-card-03',
      front: 'Was verrät die erste Ziffer des Statuscodes?',
      back: 'Die Klasse: 200er heißen Erfolg, 400er Fehler des Clients, 500er Fehler des Servers. So weißt du sofort, wo du suchen musst.',
    },
    {
      id: 'B-002-card-04',
      front: 'Was ist der Unterschied zwischen 401 und 403?',
      back: '401: Der Server weiß nicht, wer du bist, die Anmeldung fehlt. 403: Er weiß es, lässt dich aber nicht herein, dir fehlt die Berechtigung.',
    },
    {
      id: 'B-002-card-05',
      front: 'Wann lohnt sich ein erneuter Versuch?',
      back: 'Bei Fehlern des Servers (500er), bei Netzwerkausfall und bei 429 nach einer Pause. Bei den übrigen 400ern nicht: Dieselbe Anfrage bekommt dieselbe Antwort.',
    },
    {
      id: 'B-002-card-06',
      front: 'Wofür steht der Header Authorization?',
      back: 'Er trägt die Anmeldung mit, in der Demo „Bearer demo“. Fehlt er oder stimmt er nicht, antwortet der Server mit 401.',
    },
    {
      id: 'B-002-card-07',
      front: 'Wann schickt eine Anfrage einen Body mit?',
      back: 'Wenn Daten zum Server sollen, also bei POST und PUT. GET und DELETE kommen normalerweise ohne Body aus.',
    },
  ],
  codeTasks: [
    {
      id: 'B-002-code-01',
      title: 'Status einordnen',
      prompt:
        'Schreibe `describeStatus(status)`: Die Funktion ordnet einen Statuscode ein und gibt ein Objekt `{ klass, whoseFault, retry }` zurück.\n\n' +
        "`klass` ist `'2xx'`, `'4xx'` oder `'5xx'`, je nach erster Ziffer. `whoseFault` ist `'niemand'` bei 2xx, `'Client'` bei 4xx und `'Server'` bei 5xx. " +
        '`retry` ist `true` bei allen 5xx und bei `429`, sonst `false`.\n\n' +
        'Gültig sind nur die Bereiche 200 bis 299, 400 bis 499 und 500 bis 599. Für alles andere (etwa `199`, `300` oder `600`) wirf einen Fehler. ' +
        'Der Code endet mit `return { describeStatus };`.',
      starter: lines('function describeStatus(status) {', '  // dein Code', '}', '', 'return { describeStatus };'),
      hints: [
        'Die erste Ziffer bekommst du mit `Math.floor(status / 100)`: für 404 ist das `4`. Daraus lässt sich `klass` zusammensetzen.',
        'Eine kleine Tabelle als Objekt, `{ 2: …, 4: …, 5: … }`, ordnet jeder Klasse ihr `whoseFault` zu. Ist die Ziffer dort nicht zu finden, wirf `throw new Error(…)`.',
      ],
      solution: lines(
        'function describeStatus(status) {',
        '  const hundreds = Math.floor(status / 100);',
        "  const whoseFault = { 2: 'niemand', 4: 'Client', 5: 'Server' }[hundreds];",
        '  if (!whoseFault) {',
        '    throw new Error(`Unbekannter Statuscode: ${status}`);',
        '  }',
        '  return {',
        '    klass: `${hundreds}xx`,',
        '    whoseFault,',
        '    retry: hundreds === 5 || status === 429,',
        '  };',
        '}',
        '',
        'return { describeStatus };',
      ),
    },
    {
      id: 'B-002-code-02',
      title: 'Mit Wiederholung laden',
      prompt:
        'Schreibe `fetchWithRetry(url, tries)`: Die Funktion ruft `fetch(url)` auf und versucht es bei Bedarf noch einmal, insgesamt höchstens `tries` Mal.\n\n' +
        'Noch einmal versucht wird nur bei einer Antwort der Klasse 5xx (`res.status >= 500`) und bei einem Netzwerkausfall (`fetch` wirft). ' +
        'Jede andere Antwort, auch ein 404, kommt sofort zurück.\n\n' +
        'Gibt die Funktion nach dem letzten Versuch auf, liefert sie die letzte Antwort zurück. Scheitert der letzte Versuch am Netzwerk, gibt es keine Antwort: Dann wirf den Fehler weiter. ' +
        'Zwischen den Versuchen wird nicht gewartet. Auch `429` wird hier bewusst nicht wiederholt: Dafür müsste man den Header `retry-after` beachten.\n\n' +
        'Das `fetch` hier ist nachgebaut; `/item` antwortet mit 200. Die Funktion ist `async`; der Code endet mit `return { fetchWithRetry };`.',
      starter: lines('async function fetchWithRetry(url, tries) {', '  // dein Code', '}', '', 'return { fetchWithRetry };'),
      hints: [
        'Der Kern ist eine Schleife, die bis `tries` zählt. In jedem Durchgang: `fetch` aufrufen, den Status ansehen und bei allem unter 500 sofort mit `return` aussteigen.',
        'Den Netzwerkausfall fängst du mit `try { … } catch (err) { … }` um den Aufruf von `fetch`. Merke dir den Fehler und wirf ihn erst nach der Schleife. Beim letzten Versuch gibst du auch eine 5xx-Antwort mit `return res` zurück.',
      ],
      solution: lines(
        'async function fetchWithRetry(url, tries) {',
        '  let lastError;',
        '  for (let attempt = 1; attempt <= tries; attempt++) {',
        '    try {',
        '      const res = await fetch(url);',
        '      if (res.status < 500 || attempt === tries) {',
        '        return res;',
        '      }',
        '    } catch (err) {',
        '      lastError = err;',
        '    }',
        '  }',
        '  throw lastError;',
        '}',
        '',
        'return { fetchWithRetry };',
      ),
    },
  ],
};
