import type { ContentMeta } from '@hub/shared';
import { PRESETS } from '../../personalization/recommend';

// Zahlen in diesen Texten: 7 Tage Halbwertszeit, 14 Tage und 25 Prozent (Schätzfrage), Ereignisgewichte
// 1 / 3 / 5 und das Rechenbeispiel (EXAMPLE) in der ersten Aufgabe; alle in content.test.ts nachgerechnet.
// Quiz, Karten und Reflexion zeigen reinen Text: dort keine Backticks.
// Code-Aufgaben dagegen setzen `…` als Code.

const lines = (...l: string[]) => `${l.join('\n')}\n`;

// Das Rechenbeispiel aus „Unter der Haube“ und aus Aufgabe 1: Platz 1 für Anna unter „Persönlich“,
// auf zwei Stellen gerundet. In content.test.ts gegen rankProducts geprüft.
export const EXAMPLE = {
  productId: 'P21',
  signals: { affinity: 0.33, popularity: 0.95, similarity: 0.4 },
  weights: PRESETS.personal.weights,
  score: 0.47,
};

export const meta: ContentMeta = {
  id: 'C-003',
  slug: 'recommendations',
  title: 'Recommendation Demo',
  track: 'personalization',
  kind: 'project',
  question: 'Wie entsteht aus Signalen und Gewichten ein Ranking?',
  buildsOn: ['C-002'],
  leadsTo: [],
  intro: {
    text:
      'Hinter „Das könnte dir gefallen“ steckt eine Rangliste: Jedes Produkt bekommt Punkte, und wer die meisten hat, steht oben. ' +
      'Die Punkte entstehen aus drei Signalen: was dich bisher interessiert hat, was gerade alle kaufen und was dem zuletzt Angesehenen ähnelt. ' +
      'Wie stark jedes Signal zählt, bestimmen Gewichte. Hier stellst du sie selbst ein und siehst sofort, wie sich die Liste verschiebt. ' +
      'Schätz zuerst aus dem Bauch: Signale verlieren alle 7 Tage die Hälfte ihres Gewichts. Wie viel Prozent zählt ein Aufruf von vor 14 Tagen noch?',
    estimateQuestionId: 'C-003-quiz-01',
  },
  quiz: [
    {
      id: 'C-003-quiz-01',
      type: 'estimate',
      prompt: 'Signale verlieren alle 7 Tage die Hälfte ihres Gewichts. Wie viel Prozent zählt ein Aufruf von vor 14 Tagen noch?',
      answer: 25,
      tolerance: 0.25,
      unit: '%',
      explanation:
        'Nach 7 Tagen zählt der Aufruf noch halb, nach 14 Tagen halb von halb, also ein Viertel: 25 Prozent. ' +
        'So bleibt das Profil aktuell. Was ein Besucher gestern angesehen hat, sagt mehr über seine Wünsche als ein Aufruf vor einem Monat.',
    },
    {
      id: 'C-003-quiz-02',
      type: 'choice',
      prompt: 'Ein Besucher ist neu und hat noch nichts angesehen. Welches der drei Signale kann die Empfehlung für ihn trotzdem nutzen?',
      options: [
        'Alle drei, weil sich das System seine Vorlieben ausrechnet.',
        'Nur die Beliebtheit, denn sie braucht keinen Verlauf.',
        'Nur die Ähnlichkeit, weil sie auf dem Produkt der Seite beruht.',
        'Keines, deshalb bleibt die Liste leer.',
      ],
      correctIndex: 1,
      explanation:
        'Die Beliebtheit kommt aus den Verkäufen aller und braucht keinen Verlauf. Affinität und Ähnlichkeit brauchen etwas, das der Besucher getan hat. ' +
        'Darum sehen alle Neuen dieselbe Liste: Das ist der Kaltstart, und er ist der Grund, warum viele Shops zu Beginn schlicht ihre Bestseller zeigen.',
    },
    {
      id: 'C-003-quiz-03',
      type: 'choice',
      prompt: 'Warum liegen alle Signale vor dem Gewichten zwischen null und eins?',
      options: [
        'Damit die Punkte nie negativ werden können.',
        'Damit die Rechnung für den Rechner leichter wird.',
        'Damit jedes Produkt am Ende dieselbe Punktzahl hat.',
        'Damit ein Gewicht für jedes Signal dasselbe bedeutet.',
      ],
      correctIndex: 3,
      explanation:
        'Verkaufszahlen gehen in die Dutzende, ein Profilwert nie über eins. Ohne gemeinsamen Maßstab würde die Verkaufszahl alles übertönen, egal wie klein ihr Gewicht ist. ' +
        'Erst wenn jedes Signal zwischen null und eins liegt, heißt „doppelt so wichtig“ auch wirklich doppelt so wichtig.',
    },
    {
      id: 'C-003-quiz-04',
      type: 'choice',
      prompt: 'Das Produkt mit den meisten Punkten ist ausverkauft, und der Filter „Ausverkauftes ausblenden“ ist an. Was zeigt die Liste?',
      options: [
        'Sie bleibt voll, weil das nächste Produkt nachrückt.',
        'Sie bleibt an dieser Stelle leer, bis es wieder lieferbar ist.',
        'Sie zeigt das Produkt weiter, aber mit null Punkten.',
        'Sie bricht ab und zeigt eine Fehlermeldung.',
      ],
      correctIndex: 0,
      explanation:
        'Der Filter greift vor dem Kürzen auf die besten Plätze: Das ausverkaufte Produkt fällt weg, und alle dahinter rücken einen Platz hoch. Die Liste bleibt also voll. ' +
        'Würde man erst auf die obersten Plätze kürzen und dann filtern, wäre sie plötzlich zu kurz.',
    },
  ],
  reflection: [
    {
      id: 'C-003-refl-01',
      prompt:
        'Die Gewichte hat ein Mensch von Hand gesetzt. Wer sollte das in einem Shop entscheiden, und woran würdest du merken, dass die Einstellung falsch ist?',
    },
    {
      id: 'C-003-refl-02',
      prompt:
        'Wann ist es für einen Besucher unangenehm, wenn die Liste fast nur noch aus dem besteht, was er schon angesehen hat? Und wann ist es genau richtig?',
    },
    {
      id: 'C-003-refl-03',
      prompt: 'Du stellst die Gewichte so ein, dass die Liste dir am besten gefällt. Warum ist das noch kein Beweis, dass sie auch den Kunden besser gefällt?',
    },
  ],
  cards: [
    {
      id: 'C-003-card-01',
      front: 'Was ist ein Ranking?',
      back: 'Eine Liste, in der jedes Produkt Punkte bekommt und das mit den meisten oben steht. Die Punkte sind eine gewichtete Summe aus mehreren Signalen.',
    },
    {
      id: 'C-003-card-02',
      front: 'Welche drei Signale nutzt die Übung?',
      back: 'Affinität: wie stark die Kategorie zum Profil des Besuchers passt. Beliebtheit: wie oft das Produkt zuletzt verkauft wurde, im Vergleich zum Bestseller. Ähnlichkeit: wie viele Merkmale es mit dem zuletzt angesehenen Produkt teilt.',
    },
    {
      id: 'C-003-card-03',
      front: 'Wie entsteht das Affinitätsprofil?',
      back: 'Jedes Ereignis zählt mit einem Gewicht: ein Kauf fünfmal, ein Warenkorb dreimal, ein Aufruf einmal. Alte Ereignisse verlieren mit der Zeit an Wert. Je Kategorie wird addiert und alles so geteilt, dass die Summe eins ergibt.',
    },
    {
      id: 'C-003-card-04',
      front: 'Was heißt Kaltstart?',
      back: 'Ein Besucher ohne Verlauf. Affinität und Ähnlichkeit haben nichts, woran sie sich orientieren können, und es wirkt nur die Beliebtheit. Alle Neuen sehen deshalb dieselbe Liste.',
    },
    {
      id: 'C-003-card-05',
      front: 'Warum bringt man Signale auf dieselbe Skala?',
      back: 'Damit ein Gewicht für alle Signale dasselbe bedeutet. Sonst bestimmt das Signal mit den größten Zahlen die Liste, auch wenn sein Gewicht klein ist.',
    },
    {
      id: 'C-003-card-06',
      front: 'Warum wird die Liste bei hoher Ähnlichkeit eintönig?',
      back: 'Die Ähnlichkeit misst nur den Abstand zu einem einzigen Produkt, dem zuletzt angesehenen. Zählt sie fast allein, folgt die ganze Liste den Merkmalen dieses einen Produkts und zeigt fast nur Abwandlungen dessen, was der Besucher gerade angesehen hat.',
    },
    {
      id: 'C-003-card-07',
      front: 'Woran erkennt man, ob ein Ranking besser ist?',
      back: 'Nicht daran, dass es plausibel aussieht. Erst ein A/B-Test zeigt, ob Besucher mit der einen Liste mehr anklicken oder kaufen als mit der anderen.',
    },
  ],
  codeTasks: [
    {
      id: 'C-003-code-01',
      title: 'Punkte aus Signalen und Gewichten',
      prompt:
        'Schreib `scoreProduct(signals, weights)`. Beide sind Objekte mit den Schlüsseln `affinity`, `popularity` und `similarity`. ' +
        'Das Ergebnis ist die gewichtete Summe: jedes Signal mal sein Gewicht, alles zusammengezählt.\n\n' +
        'Ein fehlendes Signal zählt `0`. Das Beispiel aus „Unter der Haube“: Signale `0.33`, `0.95` und `0.4` mit den Gewichten `0.6`, `0.2` und `0.2` ergeben `0.468`. ' +
        'Die Eingaben darfst du nicht verändern. Der Code endet mit `return { scoreProduct };`.',
      starter: lines(
        'function scoreProduct(signals, weights) {',
        '  // dein Code: Signal mal Gewicht, addiert',
        '  return 0;',
        '}',
        '',
        'return { scoreProduct };',
      ),
      hints: [
        'Du brauchst drei Teile: `signals.affinity * weights.affinity` und die entsprechenden Teile für Beliebtheit und Ähnlichkeit. Addier sie.',
        'Fehlt ein Signal, ist es `undefined`, und die Rechnung ergibt `NaN`. Mit `(signals.similarity ?? 0)` zählt ein fehlendes Signal wie `0`.',
      ],
      solution: lines(
        'function scoreProduct(signals, weights) {',
        '  return (',
        '    (signals.affinity ?? 0) * weights.affinity +',
        '    (signals.popularity ?? 0) * weights.popularity +',
        '    (signals.similarity ?? 0) * weights.similarity',
        '  );',
        '}',
        '',
        'return { scoreProduct };',
      ),
    },
    {
      id: 'C-003-code-02',
      title: 'Die Liste filtern und ordnen',
      prompt:
        'Schreib `rankProducts(products, purchasedIds, scores, n)`. `products` ist eine Liste von Objekten mit `id` und `availability`, `purchasedIds` eine Liste schon gekaufter IDs, ' +
        '`scores` ein Objekt von `id` zu Punkten. Gib die IDs der besten `n` Produkte zurück, die höchste Punktzahl zuerst.\n\n' +
        'Ausverkaufte Produkte (`out_of_stock`) und schon gekaufte fallen weg, und zwar bevor auf `n` gekürzt wird. Bei gleichen Punkten kommt die kleinere `id` zuerst. ' +
        'Ein fehlender Score zählt `0`. Die Eingaben darfst du nicht verändern. Der Code endet mit `return { rankProducts };`.',
      starter: lines(
        'function rankProducts(products, purchasedIds, scores, n) {',
        '  // dein Code: filtern, sortieren, kürzen',
        '  return [];',
        '}',
        '',
        'return { rankProducts };',
      ),
      hints: [
        'Filtere zuerst mit `filter`: nicht ausverkauft und nicht in `purchasedIds`. Danach sortieren, danach mit `slice(0, n)` kürzen und mit `map` die IDs holen.',
        '`sort` verändert das Array, auf dem es aufgerufen wird. Sortier eine Kopie, zum Beispiel das Ergebnis von `filter`. Als Vergleich: `(scores[b.id] ?? 0) - (scores[a.id] ?? 0) || a.id.localeCompare(b.id)`.',
      ],
      solution: lines(
        'function rankProducts(products, purchasedIds, scores, n) {',
        '  const bought = new Set(purchasedIds);',
        '  return products',
        "    .filter((p) => p.availability !== 'out_of_stock' && !bought.has(p.id))",
        '    .sort((a, b) => (scores[b.id] ?? 0) - (scores[a.id] ?? 0) || a.id.localeCompare(b.id))',
        '    .slice(0, n)',
        '    .map((p) => p.id);',
        '}',
        '',
        'return { rankProducts };',
      ),
    },
    {
      id: 'C-003-code-03',
      title: 'Das Profil eines Besuchers',
      prompt:
        'Schreib `categoryAffinity(events, now)`. `events` ist eine Liste von Ereignissen `{ type, category, at }`, `now` ein Zeitpunkt als Text. ' +
        'Gib ein Objekt von Kategorie zu Anteil zurück; die Anteile ergeben zusammen `1`.\n\n' +
        'Jedes Ereignis hat ein Gewicht: `view` zählt `1`, `cart` `3`, `purchase` `5`. Sein Wert halbiert sich alle `7` Tage: Gewicht mal `0.5 ** (Alter in Tagen / 7)`. ' +
        'Addier die Werte je Kategorie und teil durch die Summe aller Werte. Ein leerer Verlauf ergibt `{}`. ' +
        'Die Eingabe darfst du nicht verändern. Der Code endet mit `return { categoryAffinity };`.',
      starter: lines(
        'function categoryAffinity(events, now) {',
        '  // dein Code: Gewicht, Abklingen, addieren, normieren',
        '  return {};',
        '}',
        '',
        'return { categoryAffinity };',
      ),
      hints: [
        'Das Alter in Tagen ist `(Date.parse(now) - Date.parse(event.at)) / 86400000`. Der Wert eines Ereignisses ist `weights[event.type] * 0.5 ** (age / 7)`.',
        'Sammle die Werte in einem Objekt `sums` je Kategorie und merk dir die Gesamtsumme `total`. Teile am Ende jede Summe durch `total`, aber nur, wenn `total` größer als `0` ist, sonst bleibt das Ergebnis leer.',
      ],
      solution: lines(
        'function categoryAffinity(events, now) {',
        '  const weights = { view: 1, cart: 3, purchase: 5 };',
        '  const DAY = 86400000;',
        '  const sums = {};',
        '  let total = 0;',
        '  for (const event of events) {',
        '    const age = (Date.parse(now) - Date.parse(event.at)) / DAY;',
        '    const value = weights[event.type] * 0.5 ** (age / 7);',
        '    sums[event.category] = (sums[event.category] ?? 0) + value;',
        '    total += value;',
        '  }',
        '  const profile = {};',
        '  if (total > 0) {',
        '    for (const category of Object.keys(sums)) profile[category] = sums[category] / total;',
        '  }',
        '  return profile;',
        '}',
        '',
        'return { categoryAffinity };',
      ),
    },
  ],
};
