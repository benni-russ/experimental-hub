import type { ContentMeta } from '@hub/shared';

// Zahlen in diesen Texten: Grenzwerte 2,5 / 4 s, 0,1 / 0,25 und 200 / 500 ms (gegen THRESHOLDS),
// Schätzfrage 2,4 MB bei 10 Mbit/s = 1,92 s (8 Bit je Byte), Bild der Demo 2400 KB bei 5 Mbit/s
// = 3,84 s, Tabellenwerte 4,53 s, 1,17 s, 0,17, 0,32 und 576 ms (gegen simulateLoad), Feld 6,975 s
// bei 20 Besuchen (gegen fieldResults und percentile75), Sitzungsfenster 1 s und 5 s, INP seit 2024.
// Alle in content.test.ts. Quiz, Karten und Reflexion zeigen reinen Text: dort keine Backticks.
// Code-Aufgaben dagegen setzen `…` als Code.

const lines = (...l: string[]) => `${l.join('\n')}\n`;

export const meta: ContentMeta = {
  id: 'D-002',
  slug: 'web-vitals',
  title: 'Core Web Vitals Playground',
  track: 'experience',
  kind: 'project',
  question: 'Was messen LCP, CLS und INP, und was verschlechtert sie?',
  buildsOn: ['D-001'],
  leadsTo: ['D-003'],
  intro: {
    text:
      'Du öffnest eine Produktseite auf dem Handy. Erst bleibt der Bildschirm weiß, dann steht der Text da, das große Produktbild lässt auf sich warten. ' +
      'Gerade als du auf „In den Warenkorb“ tippen willst, schiebt sich oben ein Rabatt-Banner hinein und alles rutscht nach unten. ' +
      'Und als du dann tippst, passiert eine Weile gar nichts. ' +
      'Hier misst du genau diese drei Ärgernisse, schaust zu, wie die Seite Stück für Stück entsteht, und probierst Gegenmittel aus. ' +
      'Schätz zuerst aus dem Bauch: Ein Produktbild hat 2,4 MB, die Leitung schafft 10 Mbit/s. Wie viele Sekunden dauert allein das Bild?',
    estimateQuestionId: 'D-002-quiz-01',
  },
  quiz: [
    {
      id: 'D-002-quiz-01',
      type: 'estimate',
      prompt: 'Ein Produktbild hat 2,4 MB, die Leitung schafft 10 Mbit/s. Schätz: Wie viele Sekunden dauert allein das Bild?',
      answer: 1.92,
      tolerance: 0.25,
      unit: 's',
      explanation:
        'Ein Byte hat 8 Bit, also sind 2,4 MB genau 19,2 Megabit. Bei 10 Mbit/s dauert das 1,92 s, und dazu kommt noch die Wartezeit, bis der Server antwortet. ' +
        'In der Demo ist das Bild 2400 KB groß und die Leitung schafft 5 Mbit/s: Allein die Übertragung dauert dort 3,84 s. ' +
        'Deshalb bringt Komprimieren beim größten Element so viel.',
    },
    {
      id: 'D-002-quiz-02',
      type: 'choice',
      prompt: 'Was misst der CLS (Cumulative Layout Shift)?',
      options: [
        'Wie lange es dauert, bis alle Dateien der Seite geladen sind.',
        'Wie stark sichtbarer Inhalt unerwartet verrutscht, im schlimmsten Zeitfenster.',
        'Wie oft der Browser die Seite beim Laden neu zeichnen muss.',
        'Wie viel Zeit zwischen einem Klick und der Reaktion vergeht.',
      ],
      correctIndex: 1,
      explanation:
        'Der CLS addiert Verschiebungen sichtbarer Elemente, die nicht direkt auf eine Eingabe folgen. Gezählt wird das Sitzungsfenster mit der größten Summe. ' +
        'Bis 0,1 gilt das als gut, über 0,25 als schlecht. Die Ladedauer gehört eher zum LCP, die Reaktion auf einen Klick zum INP.',
    },
    {
      id: 'D-002-quiz-03',
      type: 'choice',
      prompt: 'Warum wird das 75. Perzentil echter Besuche bewertet und nicht der Wert auf deinem Rechner?',
      options: [
        'Weil der eigene Rechner im Labor oft zu langsam misst.',
        'Weil der Durchschnitt aller Besuche zu aufwendig zu berechnen ist.',
        'Weil langsame Besuche sonst die Zahl zu stark nach oben treiben.',
        'Weil Geräte und Netze streuen und auch langsamere Besuche zählen sollen.',
      ],
      correctIndex: 3,
      explanation:
        'Echte Besuche kommen von schnellen und langsamen Geräten, über gutes und schlechtes Netz. Das 75. Perzentil heißt: Mindestens drei von vier Besuchen sind so gut oder besser. ' +
        'In der Demo hat das Referenzprofil im Start einen LCP von 4,53 s, das 75. Perzentil der 20 Besuche liegt bei 6,975 s.',
    },
    {
      id: 'D-002-quiz-04',
      type: 'choice',
      prompt: 'Ein Rabatt-Banner wird per Script oben eingefügt und schiebt die Seite nach unten. Was hilft?',
      options: [
        'Den Platz für das Banner von Anfang an freihalten.',
        'Das Produktbild komprimieren, damit es schneller lädt.',
        'Das Script ans Ende der Seite verschieben.',
        'Das Banner einfach noch später einfügen.',
      ],
      correctIndex: 0,
      explanation:
        'Verrutschen entsteht, weil plötzlich etwas Platz braucht, den vorher nichts belegt hat. Ist der Platz reserviert, füllt das Banner nur eine Lücke. ' +
        'Später einfügen verschiebt den Sprung nur, und ein schnelleres Bild kann ihn sogar mit anderen Sprüngen in ein Fenster rücken: In der Demo steigt der CLS dann von 0,17 auf 0,32.',
    },
  ],
  reflection: [
    {
      id: 'D-002-refl-01',
      prompt: 'Wann hat dich zuletzt eine Seite verärgert, weil sie verrutscht ist oder nicht reagiert hat? Welche der drei Kennzahlen hätte das erfasst?',
    },
    {
      id: 'D-002-refl-02',
      prompt: 'Ein Gegenmittel macht eine Kennzahl besser und eine andere schlechter. Woran entscheidest du, ob es sich trotzdem lohnt?',
    },
    {
      id: 'D-002-refl-03',
      prompt: 'Auf deinem Rechner sind alle Werte gut, im Feld nicht. Wen würdest du fragen, und welche Geräte würdest du dir ausleihen?',
    },
  ],
  cards: [
    {
      id: 'D-002-card-01',
      front: 'Was misst der LCP (Largest Contentful Paint)?',
      back: 'Wann das größte sichtbare Element im ersten Bildschirm gezeichnet ist, oft ein Bild oder ein großer Textblock. Als Referenz gilt: gut bis 2,5 s, schlecht über 4 s.',
    },
    {
      id: 'D-002-card-02',
      front: 'Was misst der CLS (Cumulative Layout Shift)?',
      back: 'Wie stark sichtbarer Inhalt unerwartet verrutscht. Jede Verschiebung bekommt einen Wert, gezählt wird das Sitzungsfenster mit der größten Summe. Als Referenz gilt: gut bis 0,1, schlecht über 0,25.',
    },
    {
      id: 'D-002-card-03',
      front: 'Was misst der INP (Interaction to Next Paint)?',
      back: 'Wie lange es nach einer Eingabe dauert, bis die Seite das nächste Bild zeigt, gezählt wird eine der langsamsten Reaktionen des Besuchs. Als Referenz gilt: gut bis 200 ms, schlecht über 500 ms. Seit 2024 ersetzt er den FID (First Input Delay), der nur die Wartezeit vor der Verarbeitung maß.',
    },
    {
      id: 'D-002-card-04',
      front: 'Was ist ein Sitzungsfenster beim CLS?',
      back: 'Verschiebungen, zwischen denen weniger als 1 s liegt, zählen zusammen; ein Fenster dauert höchstens 5 s. Der CLS ist die Summe des größten Fensters. Darum kann es helfen oder schaden, wenn sich Sprünge zeitlich verschieben.',
    },
    {
      id: 'D-002-card-05',
      front: 'Labordaten oder Felddaten: Was ist der Unterschied?',
      back: 'Labordaten misst du selbst, auf einem Gerät und mit einem Netz, gut wiederholbar. Felddaten stammen von echten Besuchen mit allen ihren Geräten und Netzen. Bewertet wird das 75. Perzentil der Felddaten.',
    },
    {
      id: 'D-002-card-06',
      front: 'Warum kann ein LCP-Gegenmittel den CLS verschlechtern?',
      back: 'Kommt das Bild früher, rückt sein Sprung näher an andere Sprünge heran. Liegen sie weniger als 1 s auseinander, fallen sie in ein Sitzungsfenster und addieren sich. In der Demo: LCP 1,17 s statt 4,53 s, aber CLS 0,32 statt 0,17.',
    },
    {
      id: 'D-002-card-07',
      front: 'Was hilft gegen verrutschenden Inhalt?',
      back: 'Bildern Breite und Höhe geben, Platz für nachgeladene Elemente wie Banner reservieren und eine Ersatzschrift wählen, die ungefähr so breit läuft wie die Webschrift.',
    },
  ],
  codeTasks: [
    {
      id: 'D-002-code-01',
      title: 'Kennzahlen bewerten',
      prompt:
        'Schreib `rateMetric(name, value)`. `name` ist `\'lcp\'`, `\'cls\'` oder `\'inp\'`, `value` der Messwert: LCP in Sekunden, CLS ohne Einheit, INP in Millisekunden. ' +
        'Gib `\'good\'`, `\'needsImprovement\'` oder `\'poor\'` zurück.\n\n' +
        'Die Grenzen: LCP gut bis `2.5`, schlecht über `4`; CLS gut bis `0.1`, schlecht über `0.25`; INP gut bis `200`, schlecht über `500`. ' +
        'Der Grenzwert selbst gehört zur besseren Stufe: `rateMetric(\'lcp\', 2.5)` ist `\'good\'`. Der Code endet mit `return { rateMetric };`.',
      starter: lines(
        'function rateMetric(name, value) {',
        '  // dein Code: Grenzen je Kennzahl nachschlagen und vergleichen',
        "  return 'good';",
        '}',
        '',
        'return { rateMetric };',
      ),
      hints: [
        'Leg die Grenzen in ein Objekt, etwa `{ lcp: { good: 2.5, poor: 4 }, … }`, und hol sie mit `limits[name]`. So brauchst du die Vergleiche nur einmal.',
        'Mit `<=` gehört der Grenzwert zur besseren Stufe: erst `value <= good`, dann `value <= poor`, sonst `\'poor\'`.',
      ],
      solution: lines(
        'const LIMITS = {',
        '  lcp: { good: 2.5, poor: 4 },',
        '  cls: { good: 0.1, poor: 0.25 },',
        '  inp: { good: 200, poor: 500 },',
        '};',
        '',
        'function rateMetric(name, value) {',
        '  const limit = LIMITS[name];',
        "  if (value <= limit.good) return 'good';",
        "  if (value <= limit.poor) return 'needsImprovement';",
        "  return 'poor';",
        '}',
        '',
        'return { rateMetric };',
      ),
    },
    {
      id: 'D-002-code-02',
      title: 'Das 75. Perzentil',
      prompt:
        'Schreib `percentile75(values)`. `values` ist eine Liste von Messwerten, mindestens einer. ' +
        'Sortiere aufsteigend und gib den Wert an Stelle `Math.ceil(0.75 * n)` zurück, gezählt ab `1`; bei `20` Werten also den 15.\n\n' +
        'Für `[1, 2, 3, 4]` ist das `3`. Die Eingabe darfst du nicht verändern. Der Code endet mit `return { percentile75 };`.',
      starter: lines(
        'function percentile75(values) {',
        '  // dein Code: Kopie sortieren, dann die Stelle ausrechnen',
        '  return values[0];',
        '}',
        '',
        'return { percentile75 };',
      ),
      hints: [
        '`[...values]` macht eine Kopie. `sort()` ohne Vergleich sortiert Zahlen wie Text, `10` vor `9`; nimm `sort((a, b) => a - b)`.',
        'Die Stelle ist ab `1` gezählt, der Index im Array ab `0`: `sorted[Math.ceil(0.75 * sorted.length) - 1]`.',
      ],
      solution: lines(
        'function percentile75(values) {',
        '  const sorted = [...values].sort((a, b) => a - b);',
        '  return sorted[Math.ceil(0.75 * sorted.length) - 1];',
        '}',
        '',
        'return { percentile75 };',
      ),
    },
    {
      id: 'D-002-code-03',
      title: 'CLS aus Sitzungsfenstern',
      prompt:
        'Schreib `clsFromShifts(shifts)`. `shifts` ist eine Liste von Verschiebungen `{ time, value }`, `time` in Sekunden, nicht unbedingt sortiert. ' +
        'Teile sie nach der Zeit in Sitzungsfenster und gib die größte Fenstersumme zurück; ohne Verschiebung `0`.\n\n' +
        'Ein neues Fenster beginnt, wenn seit der letzten Verschiebung `1` s oder mehr vergangen ist oder wenn das Fenster sonst länger als `5` s würde, gemessen ab seiner ersten Verschiebung. ' +
        'Geprüft wird auf drei Stellen genau. Die Eingabe darfst du nicht verändern. Der Code endet mit `return { clsFromShifts };`.',
      starter: lines(
        'function clsFromShifts(shifts) {',
        '  // dein Code: sortieren, Fenster bilden, größte Summe merken',
        '  return shifts.reduce((sum, s) => sum + s.value, 0);',
        '}',
        '',
        'return { clsFromShifts };',
      ),
      hints: [
        'Sortiere eine Kopie mit `[...shifts].sort((a, b) => a.time - b.time)`. Merk dir dann beim Durchgehen `start` (erste Zeit im Fenster), `last` (letzte Zeit) und `sum`.',
        'Bei jeder Verschiebung: Ist `s.time - last >= 1` oder `s.time - start > 5`, setz `sum = 0` und `start = s.time`. Danach `sum += s.value` und `best = Math.max(best, sum)`.',
      ],
      solution: lines(
        'function clsFromShifts(shifts) {',
        '  const sorted = [...shifts].sort((a, b) => a.time - b.time);',
        '  let best = 0;',
        '  let sum = 0;',
        '  let start = 0;',
        '  let last = 0;',
        '  sorted.forEach((s, i) => {',
        '    if (i === 0 || s.time - last >= 1 || s.time - start > 5) {',
        '      sum = 0;',
        '      start = s.time;',
        '    }',
        '    sum += s.value;',
        '    last = s.time;',
        '    best = Math.max(best, sum);',
        '  });',
        '  return best;',
        '}',
        '',
        'return { clsFromShifts };',
      ),
    },
  ],
};
