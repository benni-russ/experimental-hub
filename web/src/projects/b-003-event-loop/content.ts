import type { ContentMeta } from '@hub/shared';
import { SNIPPET_CODE } from './snippets';

// Jede Zahl und jede Reihenfolge in diesen Texten ist in content.test.ts durch
// echtes Ausführen geprüft. Wer etwas ändert, ändert dort mit.
// Quiz, Karten und Reflexion zeigen reinen Text: dort keine Backticks.
// Code-Aufgaben dagegen setzen `…` als Code.

const lines = (...l: string[]) => `${l.join('\n')}\n`;

// Das gemischte Beispiel der Demo, als Kommentar für Aufgabe 1.
const mixedCode = SNIPPET_CODE.mixed;
const mixedAsComment = mixedCode.split('\n').map((l) => `// ${l}`);

export const meta: ContentMeta = {
  id: 'B-003',
  slug: 'event-loop',
  title: 'JavaScript Event Loop Visualizer',
  track: 'web',
  kind: 'project',
  question: 'In welcher Reihenfolge läuft asynchroner Code wirklich?',
  buildsOn: ['B-001', 'B-002'],
  leadsTo: ['B-004'],
  intro: {
    text:
      'Wenn eine Seite Daten lädt und du währenddessen scrollst und klickst, wirkt es, als passiere alles gleichzeitig. ' +
      'In Wahrheit hat JavaScript nur einen einzigen Arbeitsplatz und erledigt immer genau eine Sache. ' +
      'Was warten muss, kommt auf eine von zwei Wartelisten: eine für kleine Nacharbeiten, die sofort im Anschluss drankommen, ' +
      'und eine für alles, was von außen kommt, etwa einen Wecker oder einen Klick. ' +
      'Wer wann drankommt, folgt einer festen Regel, und die sieht oft anders aus, als man den Code von oben nach unten liest. ' +
      'Schätz zuerst aus dem Bauch: Ein Beispiel hat sechs Ausgaben, eine davon steckt in einem Wecker, der ohne Wartezeit klingeln soll. ' +
      'An welcher Stelle erscheint sie?',
    estimateQuestionId: 'B-003-quiz-01',
  },
  quiz: [
    {
      id: 'B-003-quiz-01',
      type: 'estimate',
      prompt: 'An welcher Stelle erscheint im gemischten Beispiel die Ausgabe aus setTimeout?',
      answer: 6,
      tolerance: 0,
      unit: '. Zeile',
      explanation:
        'Ganz am Ende, an sechster Stelle. Zuerst läuft der ganze synchrone Code: Start, vor await, Ende. ' +
        'Dann kommen alle Microtasks, in der Reihenfolge, in der sie angemeldet wurden: then und nach await. ' +
        'Erst danach darf die Macrotask mit dem Timer. Dass er im Code an zweiter Stelle steht und auf 0 Millisekunden gestellt ist, ändert daran nichts.',
    },
    {
      id: 'B-003-quiz-02',
      type: 'choice',
      prompt:
        "Was gibt dieser Code aus? console.log('A'); setTimeout(() => console.log('B'), 0); Promise.resolve().then(() => console.log('C')); console.log('D');",
      options: ['A, B, C, D', 'A, D, C, B', 'A, D, B, C', 'A, C, D, B'],
      correctIndex: 1,
      explanation:
        'A und D sind synchron und kommen sofort. Danach leert die Event Loop die Microtask-Queue: C aus dem then. ' +
        'Erst dann holt sie die nächste Macrotask, den Timer mit B. Dass setTimeout im Code vor dem then steht, spielt keine Rolle.',
    },
    {
      id: 'B-003-quiz-03',
      type: 'choice',
      prompt:
        'Ein setTimeout wartet schon in der Macrotask-Queue. Jetzt hängt jede then-Funktion sofort eine neue then-Funktion an, ohne Ende. Was passiert mit dem Timer?',
      options: [
        'Er läuft nie, weil die Microtask-Queue nie leer wird.',
        'Er drängelt sich dazwischen, denn Timer haben Vorrang.',
        'Er läuft im Wechsel mit den Microtasks, einer nach dem anderen.',
        'Er wird nach kurzer Zeit verworfen und meldet einen Fehler.',
      ],
      correctIndex: 0,
      explanation:
        'Die Event Loop leert die Microtask-Queue immer ganz, auch wenn dabei neue Microtasks dazukommen. ' +
        'Kommen ständig neue nach, wird sie nie leer, und weder der Timer noch ein Klick kommen dran. ' +
        'Die Seite friert ein, obwohl keine einzelne Funktion lange läuft.',
    },
    {
      id: 'B-003-quiz-04',
      type: 'choice',
      prompt: 'Eine async-Funktion erreicht ein await. Was passiert mit dem Rest der Funktion?',
      options: [
        'Das ganze Programm hält an, bis das Promise erfüllt ist.',
        'Der Rest wartet als Microtask, der Aufrufer läuft weiter.',
        'Die Funktion springt zurück an ihren Anfang und wiederholt sich.',
        'Der Rest kommt in die Macrotask-Queue, wie bei setTimeout.',
      ],
      correctIndex: 1,
      explanation:
        'await teilt die Funktion: Bis dorthin läuft sie synchron, dann verlässt sie den Call Stack, und der Aufrufer macht weiter. ' +
        'Der Rest meldet sich als Microtask an, sobald das Promise erfüllt ist. Deshalb kommt er vor jedem Timer, aber nach dem übrigen synchronen Code.',
    },
  ],
  reflection: [
    {
      id: 'B-003-refl-01',
      prompt: 'Erkläre einer Kollegin in eigenen Worten, warum setTimeout mit 0 Millisekunden nicht „sofort“ bedeutet.',
    },
    {
      id: 'B-003-refl-02',
      prompt:
        'Wo hast du dich in deinem Code schon darauf verlassen, dass etwas „danach“ passiert? Wie würdest du die Reihenfolge jetzt nachprüfen?',
    },
    {
      id: 'B-003-refl-03',
      prompt: 'Warum kann eine lange Schleife eine Seite einfrieren, obwohl Klicks und Timer längst warten?',
    },
  ],
  cards: [
    {
      id: 'B-003-card-01',
      front: 'Was ist der Call Stack?',
      back: 'Der Stapel der Funktionen, die gerade laufen. Gearbeitet wird immer oben. Es gibt nur einen davon: JavaScript macht immer genau eine Sache.',
    },
    {
      id: 'B-003-card-02',
      front: 'Was kommt in die Microtask-Queue?',
      back: 'Reaktionen auf Promises: Funktionen aus then, catch und finally sowie der Rest einer async-Funktion nach await. Auch queueMicrotask legt dort ab.',
    },
    {
      id: 'B-003-card-03',
      front: 'Was kommt in die Macrotask-Queue?',
      back: 'Aufgaben von außen: Timer aus setTimeout und setInterval, Klicks und andere Ereignisse, Nachrichten an die Seite.',
    },
    {
      id: 'B-003-card-04',
      front: 'In welcher Reihenfolge arbeitet die Event Loop?',
      back: 'Erst der synchrone Code bis zum Ende. Dann alle Microtasks, auch die, die dabei neu dazukommen. Dann genau eine Macrotask, danach wieder alle Microtasks.',
    },
    {
      id: 'B-003-card-05',
      front: 'Was heißt setTimeout mit 0 Millisekunden?',
      back: 'Frühestens nach 0 ms, und erst wenn der Call Stack leer und die Microtask-Queue abgearbeitet ist. Sofort ist das nie.',
    },
    {
      id: 'B-003-card-06',
      front: 'Was macht await mit dem Rest der Funktion?',
      back: 'Der Rest wird zur Microtask. Die Funktion verlässt den Call Stack, der Aufrufer läuft weiter. Bis zum ersten await läuft eine async-Funktion synchron.',
    },
    {
      id: 'B-003-card-07',
      front: 'Warum kommt then vor dem Timer, obwohl setTimeout zuerst im Code steht?',
      back: 'Nach dem synchronen Code leert die Event Loop zuerst die Microtask-Queue. Die then-Funktion wartet dort, der Timer in der Macrotask-Queue.',
    },
  ],
  codeTasks: [
    {
      id: 'B-003-code-01',
      title: 'Reihenfolge vorhersagen',
      prompt:
        'In der Vorlage steht als Kommentar das gemischte Beispiel aus der Demo. ' +
        'Schreib die sechs Ausgaben in das Array `order`, in der Reihenfolge, in der sie wirklich erscheinen, etwa `const order = [\'Start\', …];`.\n\n' +
        'Die Prüfung führt das Beispiel echt aus und vergleicht. Der Code endet mit `return { order };`.',
      starter: lines(
        '// Das gemischte Beispiel:',
        '//',
        ...mixedAsComment,
        '',
        'const order = [',
        '  // dein Code',
        '];',
        '',
        'return { order };',
      ),
      hints: [
        'Erst alles Synchrone, von oben nach unten, auch das, was in `load()` vor dem `await` steht. Dann die Microtasks in der Reihenfolge, in der sie angemeldet wurden. Der Timer ganz zum Schluss.',
        "Synchron sind `'Start'`, `'vor await'` und `'Ende'`. Danach kommt `'then'` vor `'nach await'`, weil das `then` zuerst angemeldet wurde.",
      ],
      solution: lines(
        '// Das gemischte Beispiel:',
        '//',
        ...mixedAsComment,
        '',
        "const order = ['Start', 'vor await', 'Ende', 'then', 'nach await', 'Timer'];",
        '',
        'return { order };',
      ),
    },
    {
      id: 'B-003-code-02',
      title: 'Reihenfolge umbauen',
      prompt:
        '`run()` gibt `B`, `A`, `C` aus. Bau den Code so um, dass `A`, `B`, `C` herauskommt.\n\n' +
        'Die Regel: Keine Zeile löschen. Die drei `console.log`, das `Promise.resolve().then` und das `setTimeout` bleiben im Code; ' +
        'du darfst sie verschieben, umschließen oder Neues ergänzen, etwa ein weiteres `then` oder ein `await`.\n\n' +
        'Die Prüfung ruft `run()` selbst auf und wartet einen Moment auf Timer und Promises; ruf `run()` deshalb nicht selbst auf. ' +
        'Der Code endet mit `return { run };`.',
      starter: lines(
        'function run() {',
        '  Promise.resolve().then(() => {',
        "    console.log('A');",
        '  });',
        "  console.log('B');",
        '  setTimeout(() => {',
        "    console.log('C');",
        '  }, 0);',
        '}',
        '',
        'return { run };',
      ),
      hints: [
        '`B` steht synchron im Code und kommt deshalb vor allem, was warten muss. Damit `A` davor erscheint, muss `B` auch warten, aber nicht so lange wie der Timer.',
        "Häng `B` als zweites `then` an das erste: `Promise.resolve().then(…).then(() => { console.log('B'); });`. Oder mach `run` zur `async function` und schreib `await null;` vor das `console.log('B')`.",
      ],
      solution: lines(
        'function run() {',
        '  Promise.resolve()',
        '    .then(() => {',
        "      console.log('A');",
        '    })',
        '    .then(() => {',
        "      console.log('B');",
        '    });',
        '  setTimeout(() => {',
        "    console.log('C');",
        '  }, 0);',
        '}',
        '',
        'return { run };',
      ),
    },
  ],
};
