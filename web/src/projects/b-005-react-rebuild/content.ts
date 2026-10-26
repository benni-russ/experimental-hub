import type { ContentMeta } from '@hub/shared';

// Jede Zahl in diesen Texten ist in content.test.ts nachgerechnet; die Antwort
// der Schätzfrage zählt der Test aus classicWrites über DEMO_SEQUENCE.
// Quiz, Karten und Reflexion zeigen reinen Text: dort keine Backticks.
// Code-Aufgaben dagegen setzen `…` als Code.

const lines = (...l: string[]) => `${l.join('\n')}\n`;

// Gemeinsamer Anfang von Vorlage und Musterlösung: remove als Beispiel.
const head = [
  'function eventReducer(state, action) {',
  '  switch (action.type) {',
  "    case 'remove':",
  '      // Als Beispiel: filter baut ein neues Array, das alte bleibt, wie es war.',
  '      return { ...state, items: state.items.filter((item) => item.item_id !== action.item_id) };',
];

const tail = ['    default:', '      return state;', '  }', '}', ''];

export const meta: ContentMeta = {
  id: 'B-005',
  slug: 'react-event-builder',
  title: 'GA4 / React Event Builder',
  track: 'web',
  kind: 'project',
  question: 'Was ändert sich, wenn ein bestehendes Tool in React neu gebaut wird?',
  buildsOn: ['B-004'],
  leadsTo: ['B-006'],
  intro: {
    text:
      'Stell dir einen Warenkorb auf einer Webseite vor: Du legst etwas hinein, änderst die Menge, nimmst etwas wieder heraus. ' +
      'Jedes Mal muss die Seite mehrere Stellen anpassen: die Liste, die Summe und die Nachricht an das Analysewerkzeug aus dem letzten Projekt. ' +
      'Man kann jede dieser Stellen von Hand nachführen. Oder man beschreibt einmal, wie die Seite zu einem bestimmten Inhalt des Warenkorbs aussieht, und lässt sie bei jeder Änderung daraus neu berechnen. ' +
      'Hier steht derselbe Warenkorb auf beide Arten nebeneinander. ' +
      'Schätz zuerst aus dem Bauch: Du legst einen Kaffeebecher hinein, dann eine Teedose, dann erhöhst du beim Becher die Menge auf zwei. ' +
      'Wie oft muss die Fassung von Hand dabei die Seite anfassen?',
    estimateQuestionId: 'B-005-quiz-01',
  },
  quiz: [
    {
      id: 'B-005-quiz-01',
      type: 'estimate',
      prompt: 'Wie oft schreibt der klassische Builder bei den drei Beispiel-Eingaben direkt ins DOM?',
      answer: 10,
      tolerance: 0.25,
      unit: 'Schreibzugriffe',
      explanation:
        '10. Beim ersten Artikel sind es vier: Zeile einfügen, den Hinweis auf den leeren Warenkorb ausblenden, Summe und Event-Text neu schreiben. ' +
        'Danach bei der Teedose drei und beim Ändern der Menge noch einmal drei. Jede dieser Stellen kann man im Code vergessen. ' +
        'Der eigene Code der React-Fassung schreibt keinen einzigen; er beschreibt nur, wie die Ansicht zum Zustand aussieht, und React gleicht die Seite an.',
    },
    {
      id: 'B-005-quiz-02',
      type: 'choice',
      prompt: 'Im klassischen Builder ist „Fehler einbauen“ an, der Warenkorb ist leer. Du legst eine Teedose hinein. Was zeigt die klassische Seite?',
      options: [
        'Die Summe stimmt, aber die neue Zeile fehlt.',
        'Die Zeile erscheint, die Summe bleibt bei 0,00 €.',
        'Die Seite zeigt eine Fehlermeldung an.',
        'Zeile und Summe stimmen, nur das Event fehlt.',
      ],
      correctIndex: 1,
      explanation:
        'Der Fehler lässt nur das Neuschreiben der Summe aus. Die Zeile erscheint, die Summe zeigt weiter den alten Wert. ' +
        'Weil das Event seinen value aus der angezeigten Summe liest, ist auch das Event falsch. Eine Fehlermeldung gibt es nicht: Die Seite weiß nicht, dass etwas fehlt.',
    },
    {
      id: 'B-005-quiz-03',
      type: 'choice',
      prompt: 'Was macht ein Reducer wie eventReducer?',
      options: [
        'Er schreibt die geänderten Stellen direkt in die Seite.',
        'Er speichert den Warenkorb dauerhaft im Browser.',
        'Er schickt das fertige Event an das Analysewerkzeug.',
        'Er berechnet aus altem Zustand und Aktion den neuen Zustand.',
      ],
      correctIndex: 3,
      explanation:
        'Ein Reducer ist eine Funktion von Zustand und Aktion zum neuen Zustand. Er fasst die Seite nicht an und schickt nichts ab. ' +
        'Das Zeichnen übernimmt React, sobald es den neuen Zustand hat; das Event leitet toEvent daraus ab.',
    },
    {
      id: 'B-005-quiz-04',
      type: 'choice',
      prompt:
        'Ein Reducer ändert bei setQuantity die Menge direkt im alten Item und gibt den alten Zustand zurück. Was passiert in React?',
      options: [
        'React erkennt die Änderung und zeichnet die Zeile neu.',
        'Der Browser meldet einen Fehler, weil Objekte fest sind.',
        'Die Anzeige bleibt, wie sie war: React sieht kein neues Objekt.',
        'Die Seite lädt neu, und der Warenkorb ist danach leer.',
      ],
      correctIndex: 2,
      explanation:
        'useReducer vergleicht den zurückgegebenen Zustand mit dem alten. Ist es dasselbe Objekt, hat sich für React nichts geändert, und die Anzeige bleibt stehen. ' +
        'Deshalb baut ein Reducer immer neue Objekte und lässt die alten in Ruhe.',
    },
  ],
  reflection: [
    {
      id: 'B-005-refl-01',
      prompt: 'Angenommen, der Warenkorb bekommt ein Rabattfeld. Welche Stellen müsstest du im klassischen Builder anfassen, und welche davon würdest du am ehesten vergessen?',
    },
    {
      id: 'B-005-refl-02',
      prompt: 'Wo speicherst du in einem eigenen Projekt einen Wert, der sich eigentlich aus anderen berechnen ließe? Was würde sich ändern, wenn du ihn ableitest?',
    },
    {
      id: 'B-005-refl-03',
      prompt: 'Was gewinnst du, wenn die Ansicht nur noch aus dem Zustand berechnet wird, und was gibst du dafür ab?',
    },
  ],
  cards: [
    {
      id: 'B-005-card-01',
      front: 'Was heißt abgeleiteter Zustand?',
      back: 'Ein Wert, der sich aus anderen berechnen lässt, etwa die Summe aus den Artikeln. Man speichert ihn nicht, sondern rechnet ihn bei jeder Darstellung neu aus; so kann er nicht veralten.',
    },
    {
      id: 'B-005-card-02',
      front: 'Was ist ein Reducer?',
      back: 'Eine Funktion, die aus altem Zustand und einer Aktion den neuen Zustand berechnet. Sie ändert nichts außerhalb und liefert für dieselben Eingaben immer dasselbe.',
    },
    {
      id: 'B-005-card-03',
      front: 'Was liefert useReducer?',
      back: 'Den aktuellen Zustand und die Funktion dispatch. dispatch mit einer Aktion ruft den Reducer auf; mit dem neuen Zustand zeichnet React die Komponente neu.',
    },
    {
      id: 'B-005-card-04',
      front: 'Warum verändert ein Reducer den alten Zustand nicht?',
      back: 'React erkennt eine Änderung daran, dass ein neues Objekt zurückkommt. Wer das alte verändert und zurückgibt, bekommt keine neue Anzeige.',
    },
    {
      id: 'B-005-card-05',
      front: 'Was macht setQuantity mit einer Menge von 0 oder weniger?',
      back: 'Es entfernt das Item, genau wie remove. Eine leere Zeile soll weder im Warenkorb noch im Event stehen.',
    },
    {
      id: 'B-005-card-06',
      front: 'Was tut der klassische Builder bei jeder Eingabe?',
      back: 'Er liest Felder aus dem DOM, fügt Zeilen ein oder ändert sie und schreibt Summe und Event-Text neu. Jede vergessene Stelle zeigt danach einen alten Wert.',
    },
    {
      id: 'B-005-card-07',
      front: 'Was heißt: Die Komponente ist eine Funktion des Zustands?',
      back: 'Aus demselben Zustand entsteht immer dieselbe Ansicht. Man beschreibt, wie sie aussehen soll, und React bringt das DOM auf diesen Stand.',
    },
  ],
  codeTasks: [
    {
      id: 'B-005-code-01',
      title: 'Ein eigener Warenkorb-Reducer',
      prompt:
        'Schreib `eventReducer(state, action)` für einen Warenkorb. `state` ist ein Objekt `{ items }`, jedes Item hat `item_id`, `item_name`, `price` und `quantity`. ' +
        'Der Reducer gibt einen neuen Zustand zurück und verändert den alten nie, auch nicht dessen Items.\n\n' +
        'Drei Aktionen:\n\n' +
        "`{ type: 'add', item }`: Gibt es die `item_id` schon, steigt deren Menge um `item.quantity`; sonst kommt das Item hinten an die Liste.\n\n" +
        "`{ type: 'remove', item_id }`: Das Item fällt weg. Die Vorlage zeigt das als Beispiel.\n\n" +
        "`{ type: 'setQuantity', item_id, quantity }`: Die Menge wird `quantity`; bei `0` oder weniger fällt das Item weg.\n\n" +
        'Eine unbekannte Aktion gibt den Zustand unverändert zurück.\n\n' +
        "Dazu `toEvent(state)`: das Event `{ event: 'add_to_cart', ecommerce: { currency: 'EUR', value, items } }`. " +
        '`value` ist die Summe aus `price * quantity`, auf Cent gerundet. Der Code endet mit `return { eventReducer, toEvent };`.',
      starter: lines(
        ...head,
        "    case 'add':",
        '      // dein Code',
        '      return state;',
        "    case 'setQuantity':",
        '      // dein Code',
        '      return state;',
        ...tail,
        'function toEvent(state) {',
        '  // dein Code: value ist die Summe aus price * quantity, auf Cent gerundet',
        "  return { event: 'add_to_cart', ecommerce: { currency: 'EUR', value: 0, items: state.items } };",
        '}',
        '',
        'return { eventReducer, toEvent };',
      ),
      hints: [
        'Neue Objekte statt Änderungen: `[...state.items, { ...action.item }]` hängt hinten an, und `state.items.map((item) => (item.item_id === id ? { ...item, quantity: neu } : item))` ändert eine Menge, ohne das alte Item anzufassen.',
        "Für `setQuantity` mit kleiner Menge kannst du den Fall `remove` wiederverwenden: `eventReducer(state, { type: 'remove', item_id: action.item_id })`. Für `value` summierst du mit `reduce` und rundest mit `Math.round(sum * 100) / 100`.",
      ],
      solution: lines(
        ...head,
        "    case 'add': {",
        '      const existing = state.items.find((item) => item.item_id === action.item.item_id);',
        '      if (!existing) return { ...state, items: [...state.items, { ...action.item }] };',
        '      return {',
        '        ...state,',
        '        items: state.items.map((item) =>',
        '          item.item_id === action.item.item_id ? { ...item, quantity: item.quantity + action.item.quantity } : item,',
        '        ),',
        '      };',
        '    }',
        "    case 'setQuantity':",
        '      if (action.quantity <= 0) {',
        "        return eventReducer(state, { type: 'remove', item_id: action.item_id });",
        '      }',
        '      return {',
        '        ...state,',
        '        items: state.items.map((item) =>',
        '          item.item_id === action.item_id ? { ...item, quantity: action.quantity } : item,',
        '        ),',
        '      };',
        ...tail,
        'function toEvent(state) {',
        '  const sum = state.items.reduce((total, item) => total + item.price * item.quantity, 0);',
        '  return {',
        "    event: 'add_to_cart',",
        "    ecommerce: { currency: 'EUR', value: Math.round(sum * 100) / 100, items: state.items.map((item) => ({ ...item })) },",
        '  };',
        '}',
        '',
        'return { eventReducer, toEvent };',
      ),
    },
  ],
};
