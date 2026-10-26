import type { ContentMeta } from '@hub/shared';

// Zahlen in diesen Texten: Schätzfrage 10.000 × 0,5⁴ = 625 (1 von 16), Ausgangslage 20.000 Besuche,
// rund 520 Käufe, 2,6 %, Stufen 10.950 und 1.505, Übergänge 54,8 / 13,7 / 55,1 / 62,6 % (bzw. 14 und 63 %),
// rund 52 Käufe mehr bei +10 %, Social 0,54 %, 5.000 → 10.000 und 25.000 Besuche, 2,19 %, Rabatt 15 %,
// 2,91 %, Rohertrag 16.583 → 10.538 €, Marge 40 %, Versand 4,90 €, Bestellwert 92 €, 2,6 % × 1,1 = 2,86 %
// und 0,26 Prozentpunkte. Alle in content.test.ts gegen kpis(computeFunnel(SOURCES), ECONOMY) und die
// Szenarien. Quiz, Karten und Reflexion zeigen reinen Text: dort keine Backticks. Code-Aufgaben setzen `…` als Code.

const lines = (...l: string[]) => `${l.join('\n')}\n`;

export const meta: ContentMeta = {
  id: 'D-003',
  slug: 'funnel',
  title: 'Conversion Funnel Simulator',
  track: 'experience',
  kind: 'project',
  question: 'Wie hängen Funnel-Schritte, Conversion und Umsatz zusammen, und wann widersprechen sie sich?',
  buildsOn: ['A-004'],
  leadsTo: ['A-001'],
  intro: {
    text:
      'Ein kleiner Onlineshop hat im Monat 20.000 Besuche, aber nur rund 520 Käufe. Wo bleiben die anderen? ' +
      'Auf dem Weg über Produktseite, Warenkorb und Kasse steigen an jeder Stufe Menschen aus, an manchen viel mehr als an anderen. ' +
      'Hier siehst du, wo die meisten gehen, drehst selbst an den Stufen und probierst Ideen wie einen Rabatt oder eine Werbekampagne aus. ' +
      'Dabei merkst du, dass mehr Käufe nicht immer mehr Geld heißen. ' +
      'Schätz zuerst aus dem Bauch: 10.000 Besuche, an jedem der 4 Übergänge geht die Hälfte verloren. Wie viele kaufen?',
    estimateQuestionId: 'D-003-quiz-01',
  },
  quiz: [
    {
      id: 'D-003-quiz-01',
      type: 'estimate',
      prompt: '10.000 Besuche, an jedem der 4 Übergänge geht die Hälfte verloren. Schätz: Wie viele kaufen?',
      answer: 625,
      tolerance: 0.25,
      unit: 'Käufe',
      explanation:
        'Jeder Übergang halbiert: 10.000, 5.000, 2.500, 1.250 und schließlich 625. Das ist 10.000 × 0,5 × 0,5 × 0,5 × 0,5, also nur einer von 16 Besuchen. ' +
        'Die Verluste multiplizieren sich, sie addieren sich nicht. Im Shop der Demo sind sie ungleich verteilt: Von 20.000 Besuchen kaufen rund 520, etwa 2,6 %.',
    },
    {
      id: 'D-003-quiz-02',
      type: 'choice',
      prompt: 'In der Demo lässt ein Rabattcode über 15 % für alle die Conversion Rate steigen. Was passiert mit dem Rohertrag?',
      options: [
        'Er steigt, weil der Rabatt nur den Umsatz betrifft.',
        'Er fällt deutlich, weil der Rabatt von jeder Bestellung abgeht.',
        'Er bleibt gleich, weil mehr Käufe den Rabatt genau ausgleichen.',
        'Er steigt um genau 15 %, so viel wie der Rabatt.',
      ],
      correctIndex: 1,
      explanation:
        'In der Demo steigt die Conversion Rate von 2,6 % auf 2,91 %, der Rohertrag fällt aber von 16.583 € auf 10.538 €. ' +
        'Der Rabatt geht auch von den Bestellungen ab, die ohne ihn gekommen wären, und die zusätzlichen Käufe gleichen das nicht aus. ' +
        'Die Effekte des Szenarios sind erfunden, die Rechnung dahinter nicht.',
    },
    {
      id: 'D-003-quiz-03',
      type: 'choice',
      prompt: 'Eine Kampagne verdoppelt die Besuche aus Social. Keine Quelle verliert an Quote, trotzdem sinkt die Conversion Rate gesamt. Warum?',
      options: [
        'Weil mehr Besuche aus einer Quelle mit niedriger Quote kommen und den Schnitt drücken.',
        'Weil die anderen Quellen durch die Kampagne weniger Besuche bekommen.',
        'Weil Besuche aus Social doppelt gezählt werden.',
        'Weil die Kasse durch die vielen Besuche langsamer wird.',
      ],
      correctIndex: 0,
      explanation:
        'Social kauft in der Demo nur zu 0,54 %, der Schnitt liegt bei 2,6 %. Kommen statt 5.000 nun 10.000 Besuche aus Social, sinkt die Gesamtquote auf 2,19 %, ' +
        'obwohl der Umsatz steigt. Die anderen Quellen bleiben, wie sie sind. Das ist derselbe Mischeffekt wie beim Simpson-Paradox (A-004).',
    },
    {
      id: 'D-003-quiz-04',
      type: 'choice',
      prompt: 'Du kannst genau einen Übergang um 10 % relativ verbessern. Welcher bringt am meisten zusätzliche Käufe?',
      options: [
        'Besuch → Produktseite, weil dort die meisten Menschen sind.',
        'Produktseite → Warenkorb, weil dort am meisten verloren geht.',
        'Kasse → Kauf, weil er am nächsten am Kauf liegt.',
        'Alle gleich viel, jeder bringt 10 % mehr Käufe.',
      ],
      correctIndex: 3,
      explanation:
        'Die Käufe sind die Besuche mal alle vier Quoten. Wird eine davon mit 1,1 malgenommen, wird das Produkt 1,1-mal so groß, egal welche. ' +
        'Bei rund 520 Käufen sind das etwa 52 mehr. Relativ gleich heißt aber nicht gleich leicht: Bei einer Quote von 14 % sind 10 % mehr etwas anderes als bei 63 %.',
    },
  ],
  reflection: [
    {
      id: 'D-003-refl-01',
      prompt: 'Wo bist du selbst zuletzt kurz vor einem Kauf ausgestiegen? An welcher Stufe, und was hätte dich gehalten?',
    },
    {
      id: 'D-003-refl-02',
      prompt: 'Du testest einen Rabatt. Welche Kennzahl stellst du als Schutzkennzahl neben die Conversion Rate, und ab wann würdest du den Test stoppen?',
    },
    {
      id: 'D-003-refl-03',
      prompt: 'Der Funnel zeigt, wo Menschen gehen, aber nicht warum. Wie würdest du herausfinden, was an der Stufe mit dem größten Verlust passiert?',
    },
  ],
  cards: [
    {
      id: 'D-003-card-01',
      front: 'Was ist ein Funnel?',
      back: 'Die Stufen auf dem Weg zum Kauf, etwa Besuch, Produktseite, Warenkorb, Kasse und Kauf. Je Stufe zählt man, wie viele ankommen, und je Übergang, welcher Anteil weitergeht.',
    },
    {
      id: 'D-003-card-02',
      front: 'Wie hängen Übergangsquoten und Conversion Rate zusammen?',
      back: 'Die Conversion Rate ist das Produkt aller Übergangsquoten. In der Demo: 54,8 % × 13,7 % × 55,1 % × 62,6 % ergibt rund 2,6 %.',
    },
    {
      id: 'D-003-card-03',
      front: 'Was ist das größte Leck in einem Funnel?',
      back: 'Der Übergang, an dem absolut die meisten Menschen verloren gehen. In der Demo ist es Produktseite → Warenkorb: Von 10.950 auf der Produktseite legen nur 1.505 etwas in den Warenkorb.',
    },
    {
      id: 'D-003-card-04',
      front: 'Absolute oder relative Änderung?',
      back: 'Steigt eine Quote von 2,6 % relativ um 10 %, liegt sie bei 2,86 %. Absolut sind das nur 0,26 Prozentpunkte. Für die Stichprobe eines Tests zählt der absolute Abstand, deshalb brauchen kleine Quoten viele Besuche.',
    },
    {
      id: 'D-003-card-05',
      front: 'Warum kann die Conversion Rate fallen, obwohl der Umsatz steigt?',
      back: 'Sie ist ein Quotient: Käufe geteilt durch Besuche. Kommen viele zusätzliche Besuche mit niedriger Quote, wächst der Nenner schneller als der Zähler. In der Demo: 25.000 statt 20.000 Besuche, Conversion Rate 2,19 % statt 2,6 %, Umsatz höher.',
    },
    {
      id: 'D-003-card-06',
      front: 'Was sind Primär- und Schutzkennzahl?',
      back: 'Die Primärkennzahl soll sich durch eine Änderung verbessern, etwa die Conversion Rate. Die Schutzkennzahl darf dabei nicht schlechter werden, etwa der Rohertrag oder der Umsatz pro Besuch. So fällt ein Rabatt auf, der mehr Käufe bringt, aber weniger Geld.',
    },
    {
      id: 'D-003-card-07',
      front: 'Was ist der Rohertrag in der Demo?',
      back: 'Listenwert der Bestellungen mal Warenmarge, minus Rabatt und minus die Versandkosten, die der Shop trägt. Dazu nimmt die Demo eine Marge von 40 %, 4,90 € Versand je Bestellung und einen Bestellwert von 92 € an.',
    },
  ],
  codeTasks: [
    {
      id: 'D-003-code-01',
      title: 'Quoten je Übergang',
      prompt:
        'Schreib `stepRates(counts)`. `counts` ist eine Liste mit der Anzahl Menschen je Stufe, etwa `[1000, 500, 100, 50, 25]`. ' +
        'Gib `{ rates, overall }` zurück: `rates` enthält je Übergang den Anteil, der weitergeht (`counts[i + 1] / counts[i]`), `overall` ist die letzte durch die erste Anzahl.\n\n' +
        'Für das Beispiel ist das `{ rates: [0.5, 0.2, 0.5, 0.5], overall: 0.025 }`. Ist eine Stufe `0`, ist die Quote danach `0` statt `NaN`. ' +
        'Bei nur einer Stufe ist `rates` leer und `overall` ist `1`. Die Eingabe darfst du nicht verändern. Der Code endet mit `return { stepRates };`.',
      starter: lines(
        'function stepRates(counts) {',
        '  // dein Code: je Übergang teilen, dann gesamt',
        '  return { rates: [], overall: 0 };',
        '}',
        '',
        'return { stepRates };',
      ),
      hints: [
        '`counts.slice(1)` sind alle Stufen ab der zweiten, als neue Liste. Mit `.map((c, i) => …)` steht dann `counts[i]` für die Stufe davor.',
        'Eine kleine Hilfsfunktion `ratio(a, b)` gibt `0` zurück, wenn `b` nicht größer als `0` ist, sonst `a / b`. Nimm sie für jede Quote und für `overall`.',
      ],
      solution: lines(
        'const ratio = (a, b) => (b > 0 ? a / b : 0);',
        '',
        'function stepRates(counts) {',
        '  const rates = counts.slice(1).map((c, i) => ratio(c, counts[i]));',
        '  return { rates, overall: ratio(counts[counts.length - 1], counts[0]) };',
        '}',
        '',
        'return { stepRates };',
      ),
    },
    {
      id: 'D-003-code-02',
      title: 'Umsatz pro Besuch',
      prompt:
        'Schreib `revenuePerVisit({ visits, orders, averageOrderValue })`: Käufe mal Bestellwert, geteilt durch die Besuche. ' +
        'Ohne Besuche gib `0` zurück, nicht `NaN` oder `Infinity`.\n\n' +
        'Runden musst du nicht, das macht erst die Anzeige. Für `20000` Besuche, `520` Käufe und `92` € Bestellwert ist das `2.392`. ' +
        'Der Code endet mit `return { revenuePerVisit };`.',
      starter: lines(
        'function revenuePerVisit({ visits, orders, averageOrderValue }) {',
        '  // dein Code: an null Besuche denken',
        '  return (orders * averageOrderValue) / visits;',
        '}',
        '',
        'return { revenuePerVisit };',
      ),
      hints: [
        'Mit `{ visits, orders, averageOrderValue }` in der Parameterliste holst du die drei Werte direkt aus dem Objekt.',
        '`0 / 0` ist `NaN`, `5 / 0` ist `Infinity`. Prüf deshalb zuerst `visits <= 0` und gib dann `0` zurück.',
      ],
      solution: lines(
        'function revenuePerVisit({ visits, orders, averageOrderValue }) {',
        '  if (visits <= 0) return 0;',
        '  return (orders * averageOrderValue) / visits;',
        '}',
        '',
        'return { revenuePerVisit };',
      ),
    },
    {
      id: 'D-003-code-03',
      title: 'Widerspruch erkennen',
      prompt:
        'Schreib `compareKpis(before, after)`. Beide sind Objekte mit `conversionRate` und `revenue`. ' +
        'Gib für jede der beiden Kennzahlen die Richtung zurück, `\'up\'`, `\'down\'` oder `\'same\'`, und dazu `conflict`.\n\n' +
        '`conflict` ist `true`, wenn sich beide bewegen und dabei in verschiedene Richtungen gehen. Bleibt eine gleich, ist es kein Widerspruch. ' +
        'Ein Ergebnis sieht so aus: `{ conversionRate: \'up\', revenue: \'down\', conflict: true }`. Der Code endet mit `return { compareKpis };`.',
      starter: lines(
        'function direction(before, after) {',
        "  if (after > before) return 'up';",
        "  if (after < before) return 'down';",
        "  return 'same';",
        '}',
        '',
        'function compareKpis(before, after) {',
        '  // dein Code: Widerspruch erkennen',
        '  return {',
        '    conversionRate: direction(before.conversionRate, after.conversionRate),',
        '    revenue: direction(before.revenue, after.revenue),',
        '    conflict: false,',
        '  };',
        '}',
        '',
        'return { compareKpis };',
      ),
      hints: [
        'Merk dir beide Richtungen erst in Variablen, etwa `cr` und `revenue`, und bau das Ergebnis am Ende daraus.',
        "Ein Widerspruch braucht drei Bedingungen zugleich: `cr !== 'same'`, `revenue !== 'same'` und `cr !== revenue`.",
      ],
      solution: lines(
        'function direction(before, after) {',
        "  if (after > before) return 'up';",
        "  if (after < before) return 'down';",
        "  return 'same';",
        '}',
        '',
        'function compareKpis(before, after) {',
        '  const cr = direction(before.conversionRate, after.conversionRate);',
        '  const revenue = direction(before.revenue, after.revenue);',
        "  const conflict = cr !== 'same' && revenue !== 'same' && cr !== revenue;",
        '  return { conversionRate: cr, revenue, conflict };',
        '}',
        '',
        'return { compareKpis };',
      ),
    },
  ],
};
