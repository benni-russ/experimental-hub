import type { ContentMeta } from '@hub/shared';

// Jede Zahl in diesen Texten ist in content.test.ts nachgerechnet; die Antwort
// der Schätzfrage zählt der Test aus killMatrix(PRESET_TESTS).
// Quiz, Karten und Reflexion zeigen reinen Text: dort keine Backticks.
// Code-Aufgaben dagegen setzen `…` als Code.

const lines = (...l: string[]) => `${l.join('\n')}\n`;

export const meta: ContentMeta = {
  id: 'B-006',
  slug: 'testing-playground',
  title: 'First Testing Playground',
  track: 'web',
  kind: 'project',
  question: 'Was prüfe ich mit einem Unit Test an echter Projektlogik überhaupt?',
  buildsOn: ['B-005'],
  leadsTo: [],
  intro: {
    text:
      'Zwei Projekte zurück hast du einen Prüfer gebaut, der Nachrichten an ein Analysewerkzeug auf Fehler durchsieht. ' +
      'Hier bekommt dieser Prüfer selbst Prüfungen: kleine Programme, die ihn mit festen Beispielen füttern und nachsehen, ob das Richtige herauskommt. ' +
      'Ob so eine Prüfung etwas taugt, zeigt sich erst, wenn der Prüfer kaputtgeht. ' +
      'Deshalb gibt es ihn hier zusätzlich in vier absichtlich kaputten Fassungen, und zehn vorbereitete Prüfungen laufen gegen alle. ' +
      'Schätz zuerst aus dem Bauch: Wie viele der zehn Prüfungen bemerken mindestens eine der kaputten Fassungen?',
    estimateQuestionId: 'B-006-quiz-01',
  },
  quiz: [
    {
      id: 'B-006-quiz-01',
      type: 'estimate',
      prompt: 'Wie viele der zehn vorbereiteten Tests erwischen mindestens eine Fehlervariante?',
      answer: 6,
      tolerance: 0.2,
      unit: 'Tests',
      explanation:
        '6. Vier Tests erwischen keine Variante. Zwei davon prüfen etwas Sinnvolles, das nur keine der vier Varianten kaputt macht: den reservierten Präfix google_ und den value mit Versand, den jede Fassung weiter meldet. ' +
        'Einer prüft nur, dass überhaupt eine Liste zurückkommt. ' +
        'Und „Ein gültiger Kauf läuft durch“ schaut sich das Ergebnis gar nicht an: Er besteht immer, auch gegen jede kaputte Fassung.',
    },
    {
      id: 'B-006-quiz-02',
      type: 'choice',
      prompt:
        'Ein Test ruft validateEvent mit einem gültigen Kauf auf und prüft danach nur expect(true).toBe(true). Was sagt es, dass er besteht?',
      options: [
        'Nichts über validateEvent: Er besteht auch, wenn sie kaputt ist.',
        'Dass validateEvent für den Kauf keine Issues meldet.',
        'Dass validateEvent alle Regeln aus dem Projekt richtig umsetzt.',
        'Dass der Kauf später in den Berichten richtig gezählt wird.',
      ],
      correctIndex: 0,
      explanation:
        'Die Erwartung vergleicht true mit true und kann nicht scheitern. Was validateEvent zurückgibt, schaut sich der Test nie an. ' +
        'Er bliebe grün, selbst wenn validateEvent jeden Kauf für fehlerhaft hielte. Ein Test sagt nur dann etwas, wenn er scheitern kann.',
    },
    {
      id: 'B-006-quiz-03',
      type: 'choice',
      prompt: 'Welcher der vorbereiteten Tests erwischt die Variante „Menge ignoriert“?',
      options: [
        'Ein gültiger Kauf hat keine Issues.',
        'Ein Kauf ohne transaction_id wird gemeldet.',
        'Ein Bindestrich im Eventnamen wird gemeldet.',
        'Der Präfix google_ wird gemeldet.',
      ],
      correctIndex: 0,
      explanation:
        'Der gültige Kauf enthält zwei Kaffeebecher. Zählt die Variante jeden Preis nur einmal, passt value nicht mehr zur Summe, und sie meldet einen Fehler, wo keiner ist. ' +
        'Die anderen drei Tests prüfen Regeln, die mit der Summe nichts zu tun haben, und bestehen auch gegen diese Variante.',
    },
    {
      id: 'B-006-quiz-04',
      type: 'choice',
      prompt: 'Warum zählt ein Test nur dann als Treffer, wenn er gegen die richtige validateEvent besteht?',
      options: [
        'Ein Test, der immer scheitert, erwischt jede Variante und sagt nichts.',
        'Sonst bricht der Testläufer ab, und die übrigen Tests laufen nicht.',
        'Weil validateEvent sonst selbst einen Fehler wirft und stehen bleibt.',
        'Weil ein gescheiterter Test die Varianten dauerhaft verändert.',
      ],
      correctIndex: 0,
      explanation:
        'Ein Test, der schon am richtigen Code scheitert, scheitert an jeder Variante auch. Er würde alle „erwischen“, ohne eine einzige Regel zu prüfen. ' +
        'Erwischt hat ein Test eine Variante erst, wenn er am Original besteht und an ihr scheitert. Der Testläufer bricht übrigens nicht ab: Jeder Test läuft für sich.',
    },
  ],
  reflection: [
    {
      id: 'B-006-refl-01',
      prompt: 'Denk an eine Funktion aus einem eigenen Projekt. Welchen Fehler könnte man darin leicht einbauen, und welcher Test würde ihn bemerken?',
    },
    {
      id: 'B-006-refl-02',
      prompt: 'Wann hast du schon einmal etwas geprüft, das gar nicht scheitern konnte? Woran hättest du es merken können?',
    },
    {
      id: 'B-006-refl-03',
      prompt: 'Die Toleranz von einem Cent ist leicht zu vergessen. Welche Randfälle in deinen eigenen Daten würdest du zuerst testen?',
    },
  ],
  cards: [
    {
      id: 'B-006-card-01',
      front: 'Was ist ein Unit Test?',
      back: 'Ein kleines Programm, das eine einzelne Funktion mit festen Eingaben aufruft und das Ergebnis mit dem erwarteten vergleicht. Weicht es ab, scheitert der Test mit einer Meldung.',
    },
    {
      id: 'B-006-card-02',
      front: 'Was unterscheidet toBe von toEqual?',
      back: 'toBe verlangt denselben Wert: dieselbe Zahl, denselben Text, dasselbe Objekt. toEqual vergleicht Listen und Objekte nach Inhalt. Zwei leere Listen sind gleich nach toEqual, aber nicht nach toBe.',
    },
    {
      id: 'B-006-card-03',
      front: 'Wann prüft ein Test nichts?',
      back: 'Wenn er nicht scheitern kann. Ein Test, der sich das Ergebnis nicht ansieht, besteht auch gegen eine kaputte Funktion.',
    },
    {
      id: 'B-006-card-04',
      front: 'Was ist eine Fehlervariante?',
      back: 'Eine absichtlich kaputte Fassung des Codes, in der genau eine Regel geändert ist. Lässt sie keinen Test scheitern, fehlt ein Test für diese Regel.',
    },
    {
      id: 'B-006-card-05',
      front: 'Was ist ein Randfall?',
      back: 'Eine Eingabe an der Grenze einer Regel, etwa ein value, der knapp einen Cent neben der Summe liegt. Dort verstecken sich Fehler wie eine vergessene Toleranz.',
    },
    {
      id: 'B-006-card-06',
      front: 'Wann hat ein Test eine Fehlervariante erwischt?',
      back: 'Wenn er gegen den richtigen Code besteht und gegen die Variante scheitert. Ein Test, der schon am richtigen Code scheitert, zählt nicht.',
    },
    {
      id: 'B-006-card-07',
      front: 'Warum bekommt expect bei toThrow eine Funktion?',
      back: 'toThrow ruft die Funktion selbst auf und fängt den Fehler. Stünde der Aufruf direkt in expect, wäre der Fehler schon geworfen, bevor toThrow ihn sehen kann.',
    },
  ],
  codeTasks: [
    {
      id: 'B-006-code-01',
      title: 'Tests, die etwas bemerken',
      prompt:
        'Schreib Tests für `validateEvent` aus dem GA4 Event Builder. Dir stehen `test(name, fn)`, `expect(wert)` mit `toBe`, `toEqual` und `toThrow`, `validateEvent` und das gültige Beispiel `VALID_PURCHASE` zur Verfügung. Ein `return` am Ende brauchst du nicht.\n\n' +
        'Geprüft wird nicht dein Code allein, sondern was deine Tests bemerken. Sie laufen zuerst gegen die richtige `validateEvent` und müssen dort alle bestehen. ' +
        'Dann laufen sie gegen vier kaputte Fassungen, und jede muss mindestens einen deiner Tests scheitern lassen:\n\n' +
        '„Toleranz vergessen“: `value` muss genau der Summe entsprechen; schon eine Abweichung unter einem Cent wird gemeldet.\n\n' +
        '„Menge ignoriert“: Die Summe zählt jeden Preis nur einmal, egal wie hoch `quantity` ist.\n\n' +
        '„Namensregel zu lasch“: Ein Bindestrich im Eventnamen geht durch.\n\n' +
        '„`transaction_id` nicht geprüft“: Ein `purchase` ohne `transaction_id` gilt als gültig.\n\n' +
        'Der Test in der Vorlage besteht immer, auch gegen jede kaputte Fassung: `expect(true).toBe(true)` schaut sich das Ergebnis von `validateEvent` gar nicht an. ' +
        'Er erwischt deshalb nichts. Schreib mindestens drei Tests, die wirklich etwas prüfen.',
      starter: lines(
        '// Dieser Test besteht immer: Er sieht sich das Ergebnis nie an.',
        "test('Ein gültiger Kauf läuft durch', () => {",
        '  validateEvent(VALID_PURCHASE);',
        '  expect(true).toBe(true);',
        '});',
        '',
        '// deine Tests',
      ),
      hints: [
        'Ein Event leicht verändern, ohne `VALID_PURCHASE` anzufassen: `{ ...VALID_PURCHASE, ecommerce: { ...VALID_PURCHASE.ecommerce, value: 35 } }`. ' +
          'Die Codes der Issues bekommst du mit `validateEvent(event).map((issue) => issue.code)` und vergleichst sie mit `toEqual`.',
        'Für die Toleranz brauchst du einen Randfall: einen `value`, der knapp neben der Summe liegt und trotzdem gültig ist. ' +
          'Für die Menge reicht der gültige Kauf selbst: Er enthält zwei Kaffeebecher.',
      ],
      solution: lines(
        "test('Ein gültiger Kauf hat keine Issues', () => {",
        '  expect(validateEvent(VALID_PURCHASE)).toEqual([]);',
        '});',
        '',
        "test('Ein Kauf ohne transaction_id wird gemeldet', () => {",
        "  const event = { ...VALID_PURCHASE, ecommerce: { ...VALID_PURCHASE.ecommerce, transaction_id: '' } };",
        '  const codes = validateEvent(event).map((issue) => issue.code);',
        "  expect(codes).toEqual(['transaction_id_missing']);",
        '});',
        '',
        "test('Ein Bindestrich im Eventnamen wird gemeldet', () => {",
        "  const codes = validateEvent({ ...VALID_PURCHASE, event: 'pur-chase' }).map((issue) => issue.code);",
        "  expect(codes).toEqual(['name_format']);",
        '});',
        '',
        "test('Ein Cent Abweichung ist erlaubt', () => {",
        '  const event = { ...VALID_PURCHASE, ecommerce: { ...VALID_PURCHASE.ecommerce, value: 35 } };',
        '  expect(validateEvent(event)).toEqual([]);',
        '});',
      ),
    },
  ],
};
