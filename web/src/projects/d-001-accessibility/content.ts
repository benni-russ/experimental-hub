import type { ContentMeta } from '@hub/shared';

// Zahlen in diesen Texten: 8 Barrieren, davon 5 automatisch und 3 nicht (gegen BARRIERS und audit),
// Kontrast 2,8 : 1 (Hellgrau auf Weiß) und die Grenzen 4,5 / 7 und 3 / 4,5 (gegen contrastRatio und
// rateContrast), die Formel mit 0,05 und dem Bereich 1 bis 21, Zoom auf 200 %. Alle in content.test.ts.
// Quiz, Karten und Reflexion zeigen reinen Text: dort keine Backticks.
// Code-Aufgaben dagegen setzen `…` als Code.

const lines = (...l: string[]) => `${l.join('\n')}\n`;

export const meta: ContentMeta = {
  id: 'D-001',
  slug: 'accessibility',
  title: 'Accessibility Playground',
  track: 'experience',
  kind: 'project',
  question: 'Woran scheitert eine Seite für Menschen mit Einschränkung, und wie prüfe ich das?',
  buildsOn: [],
  leadsTo: ['D-002'],
  intro: {
    text:
      'Stell dir eine Produktseite vor, die für dich einwandfrei funktioniert: Du siehst das Bild, liest den Preis und klickst auf „In den Warenkorb“. ' +
      'Für jemanden ohne Maus, mit einem Programm, das die Seite vorliest, oder mit Farbsehschwäche ist es dieselbe Seite, aber sie verhält sich anders: ' +
      'Manches ist nicht erreichbar, manches bleibt stumm, manches verschwindet. ' +
      'Hier schaust du dir so eine Seite aus vier Blickwinkeln an und suchst die Stellen, an denen sie scheitert. ' +
      'Schätz zuerst aus dem Bauch: Die Seite hat 8 Barrieren. Wie viele davon findet ein automatischer Prüfer?',
    estimateQuestionId: 'D-001-quiz-01',
  },
  quiz: [
    {
      id: 'D-001-quiz-01',
      type: 'estimate',
      prompt: 'Eine Produktseite hat 8 Barrieren. Schätz: Wie viele davon findet ein automatischer Prüfer?',
      answer: 5,
      tolerance: 0.25,
      unit: 'Barrieren',
      explanation:
        'Der Prüfer dieser Seite findet 5: den schwachen Kontrast, das Bild ohne Beschreibung, das Feld ohne Beschriftung, den Sprung in den Überschriften und den Link „hier“. ' +
        'Die 3 übrigen, der Knopf, der keiner ist, der Zustand nur über Farbe und der fehlende Fokusring, fallen erst auf, wenn du die Seite selbst bedienst. ' +
        'Ein automatischer Prüfer ist nützlich, ersetzt das Ausprobieren aber nicht.',
    },
    {
      id: 'D-001-quiz-02',
      type: 'choice',
      prompt: '„In den Warenkorb“ ist ein div, das auf Klicks reagiert. Mit der Maus klappt alles. Was fehlt?',
      options: [
        'Nichts, solange es wie ein Knopf aussieht und auf Klicks reagiert.',
        'Ein stärkerer Kontrast, damit man das Feld besser erkennt.',
        'Rolle und Tastaturbedienung: Per Tab ist es nicht erreichbar.',
        'Ein Alternativtext, weil Text in einem div nicht vorgelesen wird.',
      ],
      correctIndex: 2,
      explanation:
        'Ein div hat keine Rolle und nimmt keinen Fokus. Wer mit der Tastatur arbeitet, kommt nicht hin, und ein Vorleseprogramm liest nur den Text, ohne zu sagen, dass man ihn drücken kann. ' +
        'Ein echtes button-Element bringt Rolle, Fokus und die Bedienung mit Enter und Leertaste von selbst mit.',
    },
    {
      id: 'D-001-quiz-03',
      type: 'choice',
      prompt: 'Ein Bild ist reiner Schmuck, etwa eine Zierlinie. Was gehört in seinen Alternativtext?',
      options: [
        'Ein leerer Text, damit Vorleseprogramme es überspringen.',
        'Der Dateiname, damit man das Bild später wiederfindet.',
        'Das Wort „Bild“, damit klar ist, dass dort etwas steht.',
        'Gar nichts: Das alt-Attribut lässt man am besten ganz weg.',
      ],
      correctIndex: 0,
      explanation:
        'Ein leerer Alternativtext sagt: Hier gibt es nichts zu erzählen. Fehlt das Attribut ganz, gilt das Bild als unbeschrieben, und ein Vorleseprogramm kann zum Beispiel den Dateinamen ansagen. ' +
        '„Bild“ oder ein Dateiname stellen einen automatischen Prüfer zufrieden, helfen aber niemandem.',
    },
    {
      id: 'D-001-quiz-04',
      type: 'choice',
      prompt: 'Ausverkaufte Größen sind rot, lieferbare grün. Sonst unterscheidet sie nichts. Was ist das Problem?',
      options: [
        'Rot und Grün sind zu grell und stören beim Lesen der Seite.',
        'Wer Rot und Grün schlecht unterscheidet, erfährt nicht, was lieferbar ist.',
        'Rot bedeutet nicht überall dasselbe und wird leicht missverstanden.',
        'Ein automatischer Prüfer meldet jede rote Schrift als Fehler.',
      ],
      correctIndex: 1,
      explanation:
        'Farbe darf mittragen, aber nie allein. Mit Rot-Grün-Schwäche, in Graustufen oder vorgelesen ist der Unterschied weg. ' +
        'Durchgestrichen, mit dem Wort „ausverkauft“ und als deaktivierter Knopf trägt der Zustand auch ohne Farbe. ' +
        'Ein automatischer Prüfer meldet das nicht, weil er nicht weiß, was die Farbe bedeuten soll.',
    },
  ],
  reflection: [
    {
      id: 'D-001-refl-01',
      prompt: 'Geh eine Seite, die du oft nutzt, ein paar Minuten nur mit der Tastatur durch. Wo bist du hängen geblieben, und was hat dir gefehlt?',
    },
    {
      id: 'D-001-refl-02',
      prompt: 'Ein automatischer Prüfer meldet keinen einzigen Fehler. Was antwortest du, wenn jemand im Team sagt, die Seite sei damit barrierefrei?',
    },
    {
      id: 'D-001-refl-03',
      prompt: 'Welche Barriere der Beispielseite hätte dich selbst am ehesten gestört, und welche hättest du ohne die Blickwinkel nie bemerkt?',
    },
  ],
  cards: [
    {
      id: 'D-001-card-01',
      front: 'Was ist eine Barriere auf einer Webseite?',
      back: 'Eine Stelle, an der jemand die Seite nicht oder nur mit Mühe nutzen kann, etwa ohne Maus, mit einem Vorleseprogramm oder mit Sehschwäche. Wer sie nicht braucht, bemerkt sie oft gar nicht.',
    },
    {
      id: 'D-001-card-02',
      front: 'Was steht im Accessibility-Tree?',
      back: 'Für jedes Element Rolle, Name und Zustand, etwa: Knopf, In den Warenkorb, deaktiviert. Daraus lesen Vorleseprogramme und andere Hilfsmittel die Seite. Ein div, das auf Klicks reagiert, hat dort keine Rolle.',
    },
    {
      id: 'D-001-card-03',
      front: 'Wie rechnet man den Kontrast zweier Farben aus?',
      back: 'Die Helligkeit der helleren Farbe plus 0,05, geteilt durch die Helligkeit der dunkleren plus 0,05. Das Ergebnis liegt zwischen 1 und 21. Hellgrau auf Weiß wie im Hinweistext der Beispielseite kommt auf etwa 2,8 : 1.',
    },
    {
      id: 'D-001-card-04',
      front: 'Welche Kontrastgrenzen nennt WCAG?',
      back: 'Normaler Text: mindestens 4,5 : 1 für Stufe AA, 7 : 1 für AAA. Großer Text: 3 : 1 und 4,5 : 1. Die Werte sind eine Referenz; auch knapp darüber kann Text mühsam zu lesen sein.',
    },
    {
      id: 'D-001-card-05',
      front: 'Was findet ein automatischer Prüfer, und was nicht?',
      back: 'Er findet, was sich an Eigenschaften ablesen lässt: fehlender Alternativtext, fehlende Beschriftung, zu wenig Kontrast, Sprünge in den Überschriften. Ob ein div als Knopf dient, ob Farbe allein etwas bedeutet und ob ein Text verständlich ist, sieht er nicht.',
    },
    {
      id: 'D-001-card-06',
      front: 'Wann ist ein leerer Alternativtext richtig?',
      back: 'Bei einem Bild, das reiner Schmuck ist. Der leere Text sagt Vorleseprogrammen, dass sie es überspringen können. Fehlt das Attribut ganz, gilt das Bild dagegen als unbeschrieben.',
    },
    {
      id: 'D-001-card-07',
      front: 'Wie prüfst du eine Seite von Hand?',
      back: 'Nur mit der Tastatur durchgehen, auf 200 % zoomen, den Screenreader des Systems einschalten und die Farbe weglassen, etwa in Graustufen. Jeder Durchgang zeigt andere Barrieren.',
    },
  ],
  codeTasks: [
    {
      id: 'D-001-code-01',
      title: 'Das Kontrastverhältnis',
      prompt:
        'Schreib `contrastRatio(hexA, hexB)`. Beide Farben kommen als Hex-Text, lang wie `#9a9a9a` oder kurz wie `#fff`. ' +
        'Gib das Kontrastverhältnis zurück, eine Zahl zwischen `1` und `21`; die Reihenfolge der Farben ist egal.\n\n' +
        'So geht es: Jeder Kanal geteilt durch `255` ergibt `c`. Ist `c <= 0.03928`, rechnest du `c / 12.92`, sonst `((c + 0.055) / 1.055) ** 2.4`. ' +
        'Die Helligkeit ist `0.2126 * R + 0.7152 * G + 0.0722 * B` mit diesen umgerechneten Kanälen. Das Verhältnis ist `(heller + 0.05) / (dunkler + 0.05)`. ' +
        'Geprüft wird auf `0.01` genau. Der Code endet mit `return { contrastRatio };`.',
      starter: lines(
        'function contrastRatio(hexA, hexB) {',
        '  // dein Code: Helligkeit beider Farben, dann (heller + 0.05) / (dunkler + 0.05)',
        '  return 1;',
        '}',
        '',
        'return { contrastRatio };',
      ),
      hints: [
        'Die Kurzform zuerst verlängern: Aus `fff` wird mit `h.split(\'\').map((c) => c + c).join(\'\')` der Text `ffffff`. Danach liefert `parseInt(h.slice(0, 2), 16)` den Rotkanal als Zahl von `0` bis `255`.',
        'Schreib eine Hilfsfunktion für die Helligkeit und ruf sie für beide Farben auf. `Math.max` und `Math.min` ordnen die beiden Werte für `(heller + 0.05) / (dunkler + 0.05)`, so ist die Reihenfolge egal.',
      ],
      solution: lines(
        'function luminance(hex) {',
        '  let h = hex.slice(1);',
        "  if (h.length === 3) h = h.split('').map((c) => c + c).join('');",
        '  const channel = (i) => {',
        '    const c = parseInt(h.slice(i, i + 2), 16) / 255;',
        '    return c <= 0.03928 ? c / 12.92 : ((c + 0.055) / 1.055) ** 2.4;',
        '  };',
        '  return 0.2126 * channel(0) + 0.7152 * channel(2) + 0.0722 * channel(4);',
        '}',
        '',
        'function contrastRatio(hexA, hexB) {',
        '  const a = luminance(hexA);',
        '  const b = luminance(hexB);',
        '  return (Math.max(a, b) + 0.05) / (Math.min(a, b) + 0.05);',
        '}',
        '',
        'return { contrastRatio };',
      ),
    },
    {
      id: 'D-001-code-02',
      title: 'Sprünge in den Überschriften',
      prompt:
        'Schreib `checkHeadingOrder(levels)`. `levels` ist eine Liste von Überschriftenebenen in der Reihenfolge der Seite, zum Beispiel `[1, 2, 4]`. ' +
        'Gib für jeden Sprung um mehr als eine Ebene nach unten ein Objekt `{ index, from, to }` zurück: `index` ist die Position des tieferen Eintrags, `from` die Ebene davor, `to` die neue Ebene. ' +
        'Für `[1, 2, 4]` also `[{ index: 2, from: 2, to: 4 }]`.\n\n' +
        'Nach oben darf es beliebig springen, etwa von `4` zurück auf `2`. Der erste Eintrag hat keinen Vorgänger und zählt nie als Sprung. Eine leere Liste ergibt `[]`. ' +
        'Die Eingabe darfst du nicht verändern. Der Code endet mit `return { checkHeadingOrder };`.',
      starter: lines(
        'function checkHeadingOrder(levels) {',
        '  // dein Code: jeden Eintrag mit dem davor vergleichen',
        '  return [];',
        '}',
        '',
        'return { checkHeadingOrder };',
      ),
      hints: [
        'Geh ab Index `1` durch die Liste und vergleiche `levels[i]` mit `levels[i - 1]`. Jeder Fund kommt als `{ index: i, from: levels[i - 1], to: levels[i] }` in die Ergebnisliste.',
        'Ein Sprung nach unten um mehr als eine Ebene heißt `levels[i] - levels[i - 1] > 1`. Nach oben ist die Differenz negativ und fällt so von selbst heraus.',
      ],
      solution: lines(
        'function checkHeadingOrder(levels) {',
        '  const jumps = [];',
        '  for (let i = 1; i < levels.length; i++) {',
        '    if (levels[i] - levels[i - 1] > 1) jumps.push({ index: i, from: levels[i - 1], to: levels[i] });',
        '  }',
        '  return jumps;',
        '}',
        '',
        'return { checkHeadingOrder };',
      ),
    },
    {
      id: 'D-001-code-03',
      title: 'Alternativtexte prüfen',
      prompt:
        'Schreib `checkAlt(images)`. `images` ist eine Liste von Bildern `{ src, alt }`, wobei `alt` auch fehlen darf. ' +
        'Gib je Bild in derselben Reihenfolge einen Zustand zurück:\n\n' +
        '`\'missing\'`, wenn `alt` fehlt (`undefined`); `\'decorative\'` bei leerem Text `\'\'`; ' +
        '`\'suspicious\'`, wenn der Text ein Dateiname ist (endet auf `.jpg`, `.jpeg`, `.png`, `.webp` oder `.gif`) oder nur `Bild`, `Foto` oder `image` lautet; sonst `\'ok\'`. ' +
        'Groß- und Kleinschreibung zählen nicht. Die Eingabe darfst du nicht verändern. Der Code endet mit `return { checkAlt };`.',
      starter: lines(
        'function checkAlt(images) {',
        '  // dein Code: je Bild missing, decorative, suspicious oder ok',
        "  return images.map(() => 'ok');",
        '}',
        '',
        'return { checkAlt };',
      ),
      hints: [
        'Mit `images.map(...)` bekommst du eine Liste gleicher Länge in derselben Reihenfolge. Prüf die Fälle der Reihe nach: erst `undefined`, dann `\'\'`, dann die verdächtigen Texte.',
        'Vergleiche mit `alt.trim().toLowerCase()`. Für die Dateiendung hilft `/\\.(jpe?g|png|webp|gif)$/.test(text)`, für die Wörter `[\'bild\', \'foto\', \'image\'].includes(text)`.',
      ],
      solution: lines(
        'function checkAlt(images) {',
        '  return images.map((image) => {',
        "    if (image.alt === undefined) return 'missing';",
        "    if (image.alt === '') return 'decorative';",
        '    const text = image.alt.trim().toLowerCase();',
        "    if (/\\.(jpe?g|png|webp|gif)$/.test(text)) return 'suspicious';",
        "    if (['bild', 'foto', 'image'].includes(text)) return 'suspicious';",
        "    return 'ok';",
        '  });',
        '}',
        '',
        'return { checkAlt };',
      ),
    },
  ],
};
