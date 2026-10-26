import type { ContentMeta } from '@hub/shared';

// Jede Zahl in diesen Texten ist in content.test.ts nachgerechnet oder mit
// echten Response-Objekten geprüft. Wer eine Zahl ändert, ändert dort mit.
// Quiz, Karten und Reflexion zeigen reinen Text: dort keine Backticks.
// Code-Aufgaben dagegen setzen `…` als Code.

const lines = (...l: string[]) => `${l.join('\n')}\n`;

export const meta: ContentMeta = {
  id: 'B-001',
  slug: 'json-api',
  title: 'JSON API Explorer',
  track: 'web',
  kind: 'project',
  question: 'Was passiert zwischen fetch() und einem fertigen JavaScript-Objekt?',
  buildsOn: [],
  leadsTo: ['B-002'],
  intro: {
    text:
      'Wenn eine Seite dir Produkte, Wetter oder Nachrichten zeigt, hat sie die Daten meist gerade erst bei einem anderen Rechner angefragt. ' +
      'Die Antwort kommt nicht als fertige Liste, sondern in Etappen: zuerst ein kurzer Bescheid, ob es geklappt hat, ' +
      'dann der eigentliche Inhalt als langer Text, und erst daraus baut das Programm wieder Daten, mit denen es arbeiten kann. ' +
      'Auf diesem Weg gibt es fünf Stationen, und an jeder kann etwas reißen. Manches, was für dich nach Fehler aussieht, bemerkt das Programm nicht einmal. ' +
      'Der Bescheid ist eine dreistellige Nummer. Schätz zuerst aus dem Bauch, wie viele dieser Nummern als „alles gut“ gelten.',
    estimateQuestionId: 'B-001-quiz-01',
  },
  quiz: [
    {
      id: 'B-001-quiz-01',
      type: 'estimate',
      prompt: 'Wie viele der Statuscodes von 100 bis 599 zählen für response.ok als Erfolg?',
      answer: 100,
      tolerance: 0.2,
      unit: 'Statuscodes',
      explanation:
        'Genau 100: alle Codes von 200 bis 299. response.ok ist nur die Kurzform für „der Status liegt zwischen 200 und 299“. ' +
        'Auch 204 („kein Inhalt“) zählt dazu, obwohl gar nichts mitkommt. 404 oder 500 sind nicht ok, ' +
        'aber fetch wirft deshalb keinen Fehler: Es ist ja eine Antwort angekommen.',
    },
    {
      id: 'B-001-quiz-02',
      type: 'choice',
      prompt: "Du rufst fetch('/missing') auf, und der Server antwortet mit 404 Not Found. Was passiert?",
      options: [
        'fetch wirft einen Fehler, und der catch-Block läuft.',
        'Das Promise erfüllt sich mit einer Response, res.ok ist false.',
        'Das Promise erfüllt sich mit null, weil nichts gefunden wurde.',
        'fetch versucht es von selbst noch einmal und wirft dann.',
      ],
      correctIndex: 1,
      explanation:
        'Für fetch ist ein 404 eine ganz normale Antwort: Der Server war erreichbar und hat etwas gesagt. ' +
        'Das Promise erfüllt sich, res.status ist 404 und res.ok ist false. fetch wirft nur, wenn gar keine Antwort ankommt, ' +
        'etwa bei einem Netzwerkausfall. Ob ein 404 für dein Programm ein Fehler ist, entscheidest du selbst, mit einem Blick auf res.ok.',
    },
    {
      id: 'B-001-quiz-03',
      type: 'choice',
      prompt: 'Du rufst erst await res.text() auf, um den Rohtext zu loggen, und danach await res.json(). Was passiert?',
      options: [
        'res.json() liefert das Objekt, der Text ist ja schon geladen.',
        'res.json() liefert einen leeren String, weil nichts mehr übrig ist.',
        'res.json() wirft einen Fehler: Der Body ist schon verbraucht.',
        'Beide liefern dasselbe, text() hat nur zusätzlich mitgeschrieben.',
      ],
      correctIndex: 2,
      explanation:
        'Der Body ist ein Datenstrom, der beim Lesen verbraucht wird. Nach text() steht res.bodyUsed auf true, ' +
        'und jeder weitere Leseversuch wirft einen TypeError. Wer beides braucht, liest einmal als Text und ruft dann selbst ' +
        'JSON.parse(text) auf, oder liest vorher eine Kopie mit res.clone().',
    },
    {
      id: 'B-001-quiz-04',
      type: 'choice',
      prompt: 'Der Server antwortet mit 204 No Content. Was liefert await res.json()?',
      options: [
        'Es liefert null, weil der Server ausdrücklich keinen Inhalt schickt.',
        'Es liefert ein leeres Objekt {}, damit der Code weiterlaufen kann.',
        'Es liefert undefined, und res.ok steht wegen 204 auf false.',
        'Es wirft einen SyntaxError, denn ein leerer Text ist kein JSON.',
      ],
      correctIndex: 3,
      explanation:
        "res.json() ist JSON.parse auf den Rohtext, und der ist bei 204 leer. JSON.parse('') wirft einen SyntaxError. " +
        'res.ok ist dabei true, denn 204 liegt zwischen 200 und 299. Wer mit 204 rechnen muss, prüft vorher res.status ' +
        'und liest den Body gar nicht erst.',
    },
  ],
  reflection: [
    {
      id: 'B-001-refl-01',
      prompt:
        'Erkläre einer Kollegin in eigenen Worten, warum fetch bei einem 404 nicht wirft und was dein Code deshalb selbst prüfen muss.',
    },
    {
      id: 'B-001-refl-02',
      prompt:
        'An welcher der fünf Stationen ist dir schon einmal etwas gerissen, ohne dass du wusstest, wo? Was würdest du heute zuerst nachsehen?',
    },
    { id: 'B-001-refl-03', prompt: 'Wann würdest du res.text() statt res.json() verwenden, und was gewinnst du dadurch?' },
  ],
  cards: [
    {
      id: 'B-001-card-01',
      front: 'Was liefert fetch zuerst zurück?',
      back: 'Ein Promise auf eine Response. Status und Header sind sofort da, den Body musst du noch lesen, etwa mit res.text() oder res.json().',
    },
    {
      id: 'B-001-card-02',
      front: 'Was macht res.json() eigentlich?',
      back: 'Zwei Schritte: den Body als Text lesen und den Text mit JSON.parse umwandeln. Kurz: JSON.parse(await res.text()).',
    },
    {
      id: 'B-001-card-03',
      front: 'Wann wirft fetch, und wann nicht?',
      back: 'fetch wirft nur, wenn gar keine Antwort ankommt, etwa bei Netzwerkausfall (TypeError: Failed to fetch). Ein 404 oder 500 ist eine Antwort und wirft nicht.',
    },
    {
      id: 'B-001-card-04',
      front: 'Was bedeutet res.ok?',
      back: 'true, wenn der Status zwischen 200 und 299 liegt, sonst false. Das sind genau 100 Statuscodes.',
    },
    {
      id: 'B-001-card-05',
      front: 'Wie oft lässt sich der Body einer Response lesen?',
      back: 'Einmal. Danach ist res.bodyUsed true, und jeder weitere Leseversuch wirft. Wer zweimal lesen will, macht vorher eine Kopie mit res.clone().',
    },
    {
      id: 'B-001-card-06',
      front: 'Was sagt der Header Content-Type, und was nicht?',
      back: 'Er sagt, was der Server zu schicken behauptet, zum Beispiel application/json. Geprüft wird das nicht: JSON.parse und res.json() schauen nur auf den Text.',
    },
    {
      id: 'B-001-card-07',
      front: 'Warum scheitert res.json() bei 204?',
      back: "204 heißt „kein Inhalt“, der Rohtext ist leer. Ein leerer Text ist kein JSON: JSON.parse('') wirft einen SyntaxError.",
    },
  ],
  codeTasks: [
    {
      id: 'B-001-code-01',
      title: 'Produkte laden',
      prompt:
        'Schreibe `loadProducts(url)`: Die Funktion ruft `fetch(url)` auf und gibt die fertige Produktliste zurück.\n\n' +
        'Antwortet der Server nicht mit Erfolg (`res.ok` ist `false`), wirf einen Fehler, dessen Meldung den Status nennt, ' +
        "zum Beispiel `throw new Error('HTTP 404')`.\n\n" +
        'Das `fetch` hier ist nachgebaut und hängt kurze Pfade an `https://api.beispiel.test` an: `/products` liefert die Liste, ' +
        '`/missing` antwortet mit 404. Die Funktion ist `async`; der Code endet mit `return { loadProducts };`.',
      starter: lines('async function loadProducts(url) {', '  // dein Code', '}', '', 'return { loadProducts };'),
      hints: [
        'Erst `const res = await fetch(url);`, dann `res.ok` prüfen, bevor du den Body liest.',
        'Den Status findest du in `res.status`, die Liste liefert `await res.json()`.',
      ],
      solution: lines(
        'async function loadProducts(url) {',
        '  const res = await fetch(url);',
        '  if (!res.ok) {',
        '    throw new Error(`HTTP ${res.status}`);',
        '  }',
        '  return res.json();',
        '}',
        '',
        'return { loadProducts };',
      ),
    },
    {
      id: 'B-001-code-02',
      title: 'Günstig und lieferbar',
      prompt:
        'Schreibe `cheapInStock(products, maxPrice)`: Sie gibt alle Produkte zurück, die lieferbar sind (`inStock` ist `true`) ' +
        'und höchstens `maxPrice` Euro kosten, sortiert nach Preis, das günstigste zuerst.\n\n' +
        "Jedes Produkt sieht so aus: `{ id: 1, name: 'Notizbuch', price: 4.5, inStock: true }`. " +
        'Die übergebene Liste darf sich dabei nicht verändern. Der Code endet mit `return { cheapInStock };`.',
      starter: lines('function cheapInStock(products, maxPrice) {', '  // dein Code', '}', '', 'return { cheapInStock };'),
      hints: [
        '`filter` sortiert aus, `sort` ordnet. Aber Vorsicht: `sort` verändert das Array, auf dem du es aufrufst.',
        'Sortiere erst nach dem `filter`, das liefert schon ein neues Array: `.sort((a, b) => a.price - b.price)`.',
      ],
      solution: lines(
        'function cheapInStock(products, maxPrice) {',
        '  return products',
        '    .filter((p) => p.inStock && p.price <= maxPrice)',
        '    .sort((a, b) => a.price - b.price);',
        '}',
        '',
        'return { cheapInStock };',
      ),
    },
    {
      id: 'B-001-code-03',
      title: 'Sicher laden',
      prompt:
        'Schreibe `loadSafely(url)`: Die Funktion wirft nie, sondern gibt immer ein Objekt zurück, ' +
        'bei Erfolg `{ ok: true, data }`, sonst `{ ok: false, error }`.\n\n' +
        '`error` ist eine deutsche Meldung, die drei Fälle auseinanderhält: Bei Netzwerkausfall enthält sie das Wort `Netzwerk`, ' +
        'bei einem HTTP-Fehler den Status (etwa `404`), bei kaputtem Body das Wort `JSON`.\n\n' +
        'Zum Ausprobieren: `/products` klappt, `/offline` spielt einen Netzwerkausfall nach, `/missing` antwortet mit 404 ' +
        'und `/broken` mit 200, aber kaputtem JSON. Der Code endet mit `return { loadSafely };`.',
      starter: lines('async function loadSafely(url) {', '  // dein Code', '}', '', 'return { loadSafely };'),
      hints: [
        'Drei Stellen können scheitern, jede auf ihre Art: `fetch` wirft (Netzwerk), `res.ok` ist `false` (HTTP), `res.json()` wirft (JSON). Prüfe sie einzeln, in dieser Reihenfolge.',
        'Ein eigenes `try { … } catch` um `await fetch(url)` und eines um `await res.json()`; dazwischen `if (!res.ok) return { ok: false, error: … };`.',
      ],
      solution: lines(
        'async function loadSafely(url) {',
        '  let res;',
        '  try {',
        '    res = await fetch(url);',
        '  } catch {',
        "    return { ok: false, error: 'Netzwerkfehler: Der Server ist nicht erreichbar.' };",
        '  }',
        '  if (!res.ok) {',
        '    return { ok: false, error: `HTTP-Fehler ${res.status} ${res.statusText}` };',
        '  }',
        '  try {',
        '    return { ok: true, data: await res.json() };',
        '  } catch {',
        "    return { ok: false, error: 'Die Antwort ist kein gültiges JSON.' };",
        '  }',
        '}',
        '',
        'return { loadSafely };',
      ),
    },
  ],
};
