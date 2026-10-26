import type { ContentMeta } from '@hub/shared';
import { MAX_NAME_LENGTH } from './limits';

// Jede Zahl in diesen Texten ist in content.test.ts nachgerechnet, die Preise
// in Quiz 3 stammen aus VALID_PURCHASE. Wer etwas ändert, ändert dort mit.
// Quiz, Karten und Reflexion zeigen reinen Text: dort keine Backticks.
// Code-Aufgaben dagegen setzen `…` als Code.

const lines = (...l: string[]) => `${l.join('\n')}\n`;

// Gemeinsamer Anfang von Vorlage und Musterlösung.
const head = [
  'function validateEvent(event) {',
  '  const issues = [];',
  '  const ecommerce = event.ecommerce || {};',
  '  const items = ecommerce.items || [];',
  '',
  '  // Regel 1 als Beispiel: der Eventname',
  '  if (!/^[A-Za-z]\\w*$/.test(event.event)) {',
  "    issues.push({ path: 'event', code: 'name_format', message: 'Eventname ungültig' });",
  '  }',
  '',
];

export const meta: ContentMeta = {
  id: 'B-004',
  slug: 'ga4-event-builder',
  title: 'GA4 Event Builder',
  track: 'web',
  kind: 'project',
  question: 'Wie ist ein GA4-Event aufgebaut, und woran erkenne ich ein fehlerhaftes?',
  buildsOn: ['B-001', 'B-002'],
  leadsTo: ['B-005'],
  intro: {
    text:
      'Wenn du in einem Onlineshop etwas in den Warenkorb legst oder kaufst, schreibt die Seite im Hintergrund eine kleine Nachricht: ' +
      'was passiert ist, welche Artikel, zu welchem Preis, in welcher Währung. ' +
      'Ein Analysewerkzeug sammelt diese Nachrichten und rechnet daraus Umsätze aus. ' +
      'Die Nachricht hat einen festen Aufbau, und kleine Fehler fallen nicht sofort auf: ein Preis als Text, eine vergessene Währung, ein Name mit Bindestrich. ' +
      'Die Zahlen im Bericht stimmen dann einfach nicht. ' +
      'Schätz zuerst aus dem Bauch: Wie lang darf der Name eines solchen Ereignisses höchstens sein?',
    estimateQuestionId: 'B-004-quiz-01',
  },
  quiz: [
    {
      id: 'B-004-quiz-01',
      type: 'estimate',
      prompt: 'Wie viele Zeichen darf ein GA4-Eventname höchstens haben?',
      answer: MAX_NAME_LENGTH,
      tolerance: 0.25,
      unit: 'Zeichen',
      explanation:
        `${MAX_NAME_LENGTH} Zeichen. Außerdem beginnt ein Eventname mit einem Buchstaben und enthält danach nur Buchstaben, Ziffern und Unterstriche. ` +
        'Kleinbuchstaben mit Unterstrich wie add_to_cart sind üblich, aber keine Pflicht: GA4 unterscheidet Groß- und Kleinschreibung.',
    },
    {
      id: 'B-004-quiz-02',
      type: 'choice',
      prompt: 'Welcher dieser Eventnamen ist in GA4 gültig?',
      options: ['add-to-cart', 'add to cart', '_add_to_cart', 'add_to_cart'],
      correctIndex: 3,
      explanation:
        'Nur add_to_cart. Bindestriche und Leerzeichen sind nicht erlaubt, und ein Name muss mit einem Buchstaben beginnen, nicht mit einem Unterstrich.',
    },
    {
      id: 'B-004-quiz-03',
      type: 'choice',
      prompt:
        'Ein Kauf: zwei Becher zu je 12,50 Euro, eine Teedose zu 9,99 Euro, dazu 4,90 Euro Versand. Welcher value gehört ins purchase-Event?',
      options: ['34,99', '39,89', '22,49', '27,39'],
      correctIndex: 0,
      explanation:
        'value ist die Summe aus Preis mal Menge, also zweimal 12,50 plus einmal 9,99. Der Versand steht im eigenen Feld shipping. ' +
        '39,89 hätte den Versand mitgezählt, 22,49 die Menge vergessen.',
    },
    {
      id: 'B-004-quiz-04',
      type: 'choice',
      prompt: 'Warum schickt die Seite vor jedem E-Commerce-Event erst ein dataLayer.push mit ecommerce: null?',
      options: [
        'Damit keine Felder aus dem vorigen Event übrig bleiben.',
        'Damit GA4 das neue Event schneller abschickt.',
        'Damit die Seite den Warenkorb neu laden muss.',
        'Damit ein Kauf nicht doppelt gezählt werden kann.',
      ],
      correctIndex: 0,
      explanation:
        'Der dataLayer führt neue Angaben mit den bisherigen zusammen. Ohne das Leeren könnten Items oder eine transaction_id aus dem vorigen Event im neuen landen. ' +
        'Google empfiehlt deshalb, das ecommerce-Objekt vor jedem E-Commerce-Event zu leeren. Gegen doppelte Käufe hilft dagegen die transaction_id.',
    },
  ],
  reflection: [
    {
      id: 'B-004-refl-01',
      prompt: 'Warum lohnt es sich, Events vor dem Livegang selbst zu prüfen, statt auf eine Fehlermeldung zu warten?',
    },
    {
      id: 'B-004-refl-02',
      prompt: 'Wo in einem Shop, den du kennst, könnte ein Preis als Text statt als Zahl entstehen? Wie würdest du das abfangen?',
    },
    {
      id: 'B-004-refl-03',
      prompt: 'Welche Regel aus dem Prüfer hättest du ohne dieses Projekt am ehesten übersehen, und warum?',
    },
  ],
  cards: [
    {
      id: 'B-004-card-01',
      front: 'Wie sieht ein E-Commerce-Event im dataLayer aus?',
      back: 'Erst dataLayer.push mit ecommerce: null, dann dataLayer.push mit event für den Namen und ecommerce mit currency, value und der Liste items.',
    },
    {
      id: 'B-004-card-02',
      front: 'Welche Regeln gelten für einen GA4-Eventnamen?',
      back: `Höchstens ${MAX_NAME_LENGTH} Zeichen, beginnt mit einem Buchstaben, danach nur Buchstaben, Ziffern und Unterstriche. Kleinbuchstaben wie add_to_cart sind Konvention, keine Pflicht.`,
    },
    {
      id: 'B-004-card-03',
      front: 'Was gehört in value?',
      back: 'Die Summe aus price mal quantity über alle Items. Versand und Steuer stehen in eigenen Feldern, shipping und tax.',
    },
    {
      id: 'B-004-card-04',
      front: 'Wann braucht ein Event currency?',
      back: 'Sobald es value sendet. Erwartet ist ein dreistelliger Code wie EUR; ohne Währung lässt sich der Umsatz nicht richtig zählen.',
    },
    {
      id: 'B-004-card-05',
      front: 'Was braucht jedes Item mindestens?',
      back: 'item_id oder item_name, Google empfiehlt beides. Fehlt quantity, zählt das Item einmal.',
    },
    {
      id: 'B-004-card-06',
      front: 'Wozu dient die transaction_id?',
      back: 'Sie kennzeichnet einen Kauf eindeutig und ist beim purchase Pflicht. So lässt sich ein Kauf von einem doppelt gesendeten Event unterscheiden.',
    },
    {
      id: 'B-004-card-07',
      front: 'Welche Eventnamen sind reserviert?',
      back: 'Namen, die mit google_, ga_ oder firebase_ beginnen, und Namen, die GA4 selbst verwendet, etwa session_start oder first_visit.',
    },
  ],
  codeTasks: [
    {
      id: 'B-004-code-01',
      title: 'Ein eigener Event-Prüfer',
      prompt:
        'Schreib eine vereinfachte `validateEvent(event)`. Sie bekommt ein Event wie `{ event: \'purchase\', ecommerce: { transaction_id, value, currency, items } }` ' +
        'und gibt ein Array von Issues zurück, jedes ein Objekt `{ path, code, message }`. Ein gültiges Event ergibt `[]`.\n\n' +
        'Fünf Regeln, jede mit eigenem `code`:\n\n' +
        '`name_format`: `event.event` beginnt mit einem Buchstaben und enthält danach nur Buchstaben, Ziffern und Unterstriche. Die Vorlage prüft das schon, als Beispiel.\n\n' +
        '`currency_missing`: Es gibt `ecommerce.value`, aber keine `ecommerce.currency`.\n\n' +
        '`price_not_number`: Ein Item hat einen `price`, der keine Zahl ist.\n\n' +
        '`value_mismatch`: `value` weicht um mehr als `0.01` von der Summe aus `price * quantity` ab. Prüf das nur, wenn alle Preise Zahlen sind.\n\n' +
        '`transaction_id_missing`: Das Event heißt `purchase` und hat keine `ecommerce.transaction_id`.\n\n' +
        'Geprüft werden nur die Codes; `path` und `message` darfst du frei wählen. Der Code endet mit `return { validateEvent };`.',
      starter: lines(
        ...head,
        '  // dein Code: currency_missing, price_not_number, value_mismatch, transaction_id_missing',
        '',
        '  return issues;',
        '}',
        '',
        'return { validateEvent };',
      ),
      hints: [
        "Für die Preise reicht eine Schleife über `items`: `typeof item.price !== 'number'` erkennt einen Text. Bei der Währung genügt `ecommerce.value !== undefined && !ecommerce.currency`.",
        "Summiere in derselben Schleife Preis mal Menge, wobei eine fehlende `quantity` als eins zählt, und merk dir, ob alle Preise Zahlen waren. Danach `Math.abs(ecommerce.value - sum) > 0.01`. Für den Kauf: `event.event === 'purchase' && !ecommerce.transaction_id`.",
      ],
      solution: lines(
        ...head,
        '  if (ecommerce.value !== undefined && !ecommerce.currency) {',
        "    issues.push({ path: 'ecommerce.currency', code: 'currency_missing', message: 'Währung fehlt' });",
        '  }',
        '',
        '  let sum = 0;',
        '  let allPricesNumbers = true;',
        '  items.forEach((item, i) => {',
        "    if (typeof item.price !== 'number') {",
        '      allPricesNumbers = false;',
        "      issues.push({ path: `ecommerce.items[${i}].price`, code: 'price_not_number', message: 'Preis ist keine Zahl' });",
        '    }',
        '    const quantity = item.quantity ?? 1;',
        '    sum += item.price * quantity;',
        '  });',
        '',
        '  if (allPricesNumbers && Math.abs(ecommerce.value - sum) > 0.01) {',
        "    issues.push({ path: 'ecommerce.value', code: 'value_mismatch', message: 'value passt nicht zur Summe' });",
        '  }',
        '',
        "  if (event.event === 'purchase' && !ecommerce.transaction_id) {",
        "    issues.push({ path: 'ecommerce.transaction_id', code: 'transaction_id_missing', message: 'transaction_id fehlt' });",
        '  }',
        '',
        '  return issues;',
        '}',
        '',
        'return { validateEvent };',
      ),
    },
  ],
};
