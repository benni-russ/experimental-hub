import type { ContentMeta } from '@hub/shared';

// Zahlen in diesen Texten: 28 Einträge, 20 fehlerfrei, 8 mit Fehler (4 aussortiert, 3 repariert,
// 1 Hinweis); alle in content.test.ts aus inspectFeed(RAW_FEED, FEED_DATE) nachgerechnet.
// „Eine Woche“ steht für STALE_DAYS, die Wirkungswörter stammen aus effects.ts.
// Quiz, Karten und Reflexion zeigen reinen Text: dort keine Backticks.
// Code-Aufgaben dagegen setzen `…` als Code.

const lines = (...l: string[]) => `${l.join('\n')}\n`;

export const meta: ContentMeta = {
  id: 'C-002',
  slug: 'feed-inspector',
  title: 'Product Feed Inspector',
  track: 'personalization',
  kind: 'project',
  question: 'Woran erkenne ich, dass ein Produktfeed Empfehlungen verdirbt?',
  buildsOn: ['C-001', 'B-001'],
  leadsTo: ['C-003'],
  intro: {
    text:
      'Hinter „Das könnte dir gefallen“ steht keine Magie, sondern eine Liste: der Produktfeed. Der Shop schreibt sie oft nachts aus seinem Warensystem, ' +
      'und die Empfehlung liest sie ein. Steht dort ein Preis als Text, ein Produkt doppelt oder ein ausverkaufter Artikel als lieferbar, gibt es keine Fehlermeldung. ' +
      'Das System macht einfach weiter und empfiehlt, was es versteht. Die Empfehlungen werden leise schlechter, und niemand sieht, warum. ' +
      'Hier prüfst du einen Feed Eintrag für Eintrag und vergleichst, was ein unachtsames System daraus empfiehlt und was ein geprüfter Feed hergibt. ' +
      'Schätz zuerst aus dem Bauch: Ein Feed hat 28 Einträge. Wie viele davon sind ganz ohne Fehler?',
    estimateQuestionId: 'C-002-quiz-01',
  },
  quiz: [
    {
      id: 'C-002-quiz-01',
      type: 'estimate',
      prompt: 'Ein Feed hat 28 Einträge. Schätz: Wie viele davon sind ganz ohne Fehler?',
      answer: 20,
      tolerance: 0.25,
      unit: 'Einträge',
      explanation:
        '20 von 28 Einträgen sind fehlerfrei. 8 haben genau einen Fehler: 4 werden aussortiert, 3 lassen sich reparieren, und bei 1 genügt ein Hinweis. ' +
        'Das wirkt wenig, aber diese 8 sind keine Randfälle: Schon ein einziger doppelter oder ausverkaufter Eintrag kann in der Empfehlung ganz oben landen.',
    },
    {
      id: 'C-002-quiz-02',
      type: 'choice',
      prompt:
        'Ein Produkt hat im Feed die Verfügbarkeit „Out of Stock“. Das empfehlende System kennt nur „in_stock“ und „out_of_stock“ und liest unbekannte Werte als lieferbar. Was passiert?',
      options: [
        'Der ganze Feed wird abgelehnt, und es gibt keine Empfehlungen mehr.',
        'Es wird automatisch ausgeblendet, weil der Wert nicht passt.',
        'Es gilt als lieferbar und wird womöglich empfohlen.',
        'Sein Preis wird auf null gesetzt, bis der Bestand wieder stimmt.',
      ],
      correctIndex: 2,
      explanation:
        'Es gilt als lieferbar. Der Filter „ausverkaufte ausblenden“ greift nur bei dem exakten Wert out_of_stock, also bleibt das Produkt in der Liste. ' +
        'Hier lässt sich die Schreibweise eindeutig reparieren; bei einem ganz unbekannten Wert wäre Aussortieren sicherer.',
    },
    {
      id: 'C-002-quiz-03',
      type: 'choice',
      prompt: 'Zwei Einträge im Feed tragen dieselbe id, aber verschiedene Preise. Warum ist das für Empfehlungen ein Problem?',
      options: [
        'Das Produkt kann doppelt in der Liste stehen, und sein Verlauf landet beim falschen Eintrag.',
        'Der Feed wird dadurch zu groß, und der Server bricht die Übertragung ab.',
        'Der niedrigere der beiden Preise wird dabei immer automatisch gelöscht.',
        'Die Bilder passen nicht mehr zu den Titeln der beiden Einträge.',
      ],
      correctIndex: 0,
      explanation:
        'Das System ordnet Klicks und Käufe über die id zu. Bei zwei Einträgen mit derselben id kann das Produkt zweimal in der Empfehlung stehen, und was Besucher getan haben, ' +
        'wird dem falschen Eintrag gutgeschrieben. Der Prüfer behält deshalb den ersten Eintrag und sortiert die späteren aus.',
    },
    {
      id: 'C-002-quiz-04',
      type: 'choice',
      prompt: 'Welcher Fehler fällt keiner der Regeln des Prüfers auf?',
      options: [
        'Ein Preis, der plausibel aussieht, aber falsch ist.',
        'Ein Preis als Text mit Komma und Währungszeichen.',
        'Ein Eintrag, der seit mehr als einer Woche nicht erneuert wurde.',
        'Ein Eintrag ohne Bildlink.',
      ],
      correctIndex: 0,
      explanation:
        'Der Prüfer kennt Formen, nicht Wahrheit: Ein Preis, der um ein paar Euro danebenliegt, ist trotzdem eine gültige Zahl und besteht jede Regel.' +
        'Solche Fehler findet nur ein Vergleich mit der Quelle, etwa ein Abgleich mit dem Shopsystem oder Stichproben.',
    },
  ],
  reflection: [
    {
      id: 'C-002-refl-01',
      prompt:
        'Wer ist in einem Shop dafür zuständig, dass der Feed stimmt: die Technik, das Produktteam, das Marketing? Was geschieht, wenn es niemand ist?',
    },
    {
      id: 'C-002-refl-02',
      prompt:
        'Ein Eintrag hat keinen Bildlink. Würdest du ihn reparieren, aussortieren oder nur melden? Was spricht für deine Wahl, und was dagegen?',
    },
    {
      id: 'C-002-refl-03',
      prompt: 'Welchen Feedfehler würde keine Regel des Prüfers finden, und woran würdest du ihn trotzdem bemerken?',
    },
  ],
  cards: [
    {
      id: 'C-002-card-01',
      front: 'Was ist ein Produktfeed?',
      back: 'Eine Liste aller Produkte eines Shops mit id, Titel, Kategorie, Preis, Verfügbarkeit, Änderungsdatum und Bildlink. Der Shop exportiert sie oft nachts, und Empfehlungen lesen sie ein.',
    },
    {
      id: 'C-002-card-02',
      front: 'Warum fallen Feedfehler nicht auf?',
      back: 'Sie lösen keine Fehlermeldung aus. Das System liest weiter und empfiehlt, was es versteht: ein ausverkauftes, doppeltes oder veraltetes Produkt. Die Empfehlungen werden leise schlechter.',
    },
    {
      id: 'C-002-card-03',
      front: 'Reparieren, aussortieren oder nur melden?',
      back: 'Reparieren, wenn die Absicht eindeutig ist, etwa bei einer anderen Schreibweise. Aussortieren, wenn ein Eintrag nicht sicher lesbar ist, etwa bei einem Preis als Text. Nur melden, wenn die Empfehlung trotzdem funktioniert, etwa bei einem fehlenden Bild.',
    },
    {
      id: 'C-002-card-04',
      front: 'Warum ist eine doppelte id ein Problem?',
      back: 'Das Produkt kann zweimal im Ranking stehen, und Klicks und Käufe werden dem falschen Eintrag zugeordnet. Der Prüfer behält den ersten Eintrag und sortiert die späteren aus.',
    },
    {
      id: 'C-002-card-05',
      front: 'Wann gilt ein Eintrag als veraltet?',
      back: 'In dieser Übung, wenn sein Änderungsdatum mehr als eine Woche vor dem Datum des Feeds liegt. Dann können Preis oder Bestand nicht mehr stimmen.',
    },
    {
      id: 'C-002-card-06',
      front: 'Was heißt „Kategorie falsch geschrieben“?',
      back: 'Für ein System sind „Laufschuhe“ und „laufschuhe“ zwei verschiedene Kategorien. Die Vorlieben eines Besuchers verteilen sich dann auf beide und zählen weniger.',
    },
    {
      id: 'C-002-card-07',
      front: 'Welchen Fehler findet kein Formatprüfer?',
      back: 'Einen plausiblen, aber falschen Wert, etwa einen Preis, der eine gültige Zahl ist, aber nicht dem Shop entspricht. Dafür braucht es einen Vergleich mit der Quelle.',
    },
  ],
  codeTasks: [
    {
      id: 'C-002-code-01',
      title: 'Den Feed lesen, ohne abzustürzen',
      prompt:
        'Schreib `parseFeed(text)`. Sie bekommt den Feed als Text und gibt immer ein Objekt zurück, nie eine Ausnahme: ' +
        '`{ ok: true, products }`, wenn der Text gültiges JSON ist und `products` ein Array enthält, sonst `{ ok: false, error }` mit einer kurzen Meldung als Text.\n\n' +
        'Eine leere Liste ist gültig. Kaputtes JSON, ein fehlendes `products` und ein `products`, das kein Array ist, ergeben `ok: false`. ' +
        'Der Code endet mit `return { parseFeed };`.',
      starter: lines(
        'function parseFeed(text) {',
        '  // dein Code: lesen, prüfen, nie eine Ausnahme werfen',
        "  return { ok: false, error: 'noch nicht gebaut' };",
        '}',
        '',
        'return { parseFeed };',
      ),
      hints: [
        '`JSON.parse` wirft bei kaputtem Text eine Ausnahme. Fang sie mit `try` und `catch` ab und gib dort `{ ok: false, error }` zurück.',
        'Danach brauchst du zwei Prüfungen: Ist das Ergebnis ein Objekt (Achtung, `null` ist auch eins), und ist `Array.isArray(root.products)` wahr?',
      ],
      solution: lines(
        'function parseFeed(text) {',
        '  let root;',
        '  try {',
        '    root = JSON.parse(text);',
        '  } catch (err) {',
        "    return { ok: false, error: 'Der Feed ist kein gültiges JSON.' };",
        '  }',
        "  if (typeof root !== 'object' || root === null || !Array.isArray(root.products)) {",
        "    return { ok: false, error: 'Der Feed enthält keine Liste products.' };",
        '  }',
        '  return { ok: true, products: root.products };',
        '}',
        '',
        'return { parseFeed };',
      ),
    },
    {
      id: 'C-002-code-02',
      title: 'Doppelte IDs finden',
      prompt:
        'Schreib `findDuplicateIds(products)`. `products` ist eine Liste von Objekten mit einer `id`. ' +
        'Gib die IDs zurück, die mehr als einmal vorkommen, jede nur einmal, alphabetisch sortiert. Ohne Dubletten kommt `[]` zurück.\n\n' +
        'Die Eingabe darfst du nicht verändern. Der Code endet mit `return { findDuplicateIds };`.',
      starter: lines(
        'function findDuplicateIds(products) {',
        '  // dein Code',
        '  return [];',
        '}',
        '',
        'return { findDuplicateIds };',
      ),
      hints: [
        'Zähl die IDs in einer `Map`: `counts.set(id, (counts.get(id) ?? 0) + 1)`.',
        'Nimm danach die IDs, deren Zahl größer als eins ist. `sort()` verändert das Array, auf dem es aufgerufen wird: Sortier nur deine eigene Ergebnisliste, nie `products`.',
      ],
      solution: lines(
        'function findDuplicateIds(products) {',
        '  const counts = new Map();',
        '  for (const product of products) {',
        '    counts.set(product.id, (counts.get(product.id) ?? 0) + 1);',
        '  }',
        '  const duplicates = [];',
        '  for (const [id, count] of counts) {',
        '    if (count > 1) duplicates.push(id);',
        '  }',
        '  return duplicates.sort();',
        '}',
        '',
        'return { findDuplicateIds };',
      ),
    },
    {
      id: 'C-002-code-03',
      title: 'Ein Produkt prüfen',
      prompt:
        'Schreib `checkProduct(product)`. Sie bekommt ein Produkt als Objekt und gibt eine Liste von Codes zurück, jeder höchstens einmal, in beliebiger Reihenfolge. ' +
        'Ein gültiges Produkt ergibt `[]`.\n\n' +
        'Drei Codes:\n\n' +
        '`missing_field`: `id`, `title`, `price`, `availability` oder `category` fehlt (nicht vorhanden, `null` oder ein leerer Text).\n\n' +
        '`price_format`: `price` ist vorhanden, aber keine Zahl größer als `0`.\n\n' +
        '`availability_value`: `availability` ist vorhanden, aber weder `in_stock` noch `out_of_stock`.\n\n' +
        'Ein fehlender Wert zählt nur als `missing_field`, nicht zusätzlich als falsches Format. Die Eingabe darfst du nicht verändern. ' +
        'Der Code endet mit `return { checkProduct };`.',
      starter: lines(
        'function checkProduct(product) {',
        '  const codes = [];',
        '',
        '  // dein Code: missing_field, price_format, availability_value',
        '',
        '  return codes;',
        '}',
        '',
        'return { checkProduct };',
      ),
      hints: [
        'Schreib dir eine kleine Hilfsfunktion `isMissing(value)` für „nicht vorhanden, `null` oder leerer Text“. Mit `required.some(…)` über die fünf Felder entsteht `missing_field` höchstens einmal.',
        "Prüf Preis und Verfügbarkeit nur, wenn sie nicht fehlen. Der Preis ist gültig, wenn `typeof price === 'number' && price > 0`; die Verfügbarkeit, wenn sie in `['in_stock', 'out_of_stock']` steht.",
      ],
      solution: lines(
        'function checkProduct(product) {',
        '  const codes = [];',
        '  const isMissing = (value) => value === undefined || value === null || String(value).trim() === \'\';',
        '',
        "  const required = ['id', 'title', 'price', 'availability', 'category'];",
        '  const missing = required.some((field) => isMissing(product[field]));',
        "  if (missing) codes.push('missing_field');",
        '',
        '  const { price, availability } = product;',
        "  if (!isMissing(price) && !(typeof price === 'number' && price > 0)) {",
        "    codes.push('price_format');",
        '  }',
        "  if (!isMissing(availability) && !['in_stock', 'out_of_stock'].includes(availability)) {",
        "    codes.push('availability_value');",
        '  }',
        '',
        '  return codes;',
        '}',
        '',
        'return { checkProduct };',
      ),
    },
  ],
};
