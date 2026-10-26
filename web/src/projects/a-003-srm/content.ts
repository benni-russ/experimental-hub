import type { ContentMeta } from '@hub/shared';

// Alle Zahlen in diesen Texten sind mit srmTest, applyCause und measuredUplift
// gerechnet und in content.test.ts festgehalten. Wer eine Zahl ändert, ändert dort mit.

export const meta: ContentMeta = {
  id: 'A-003',
  slug: 'srm',
  title: 'Sample Ratio Mismatch',
  track: 'experimentation',
  kind: 'project',
  question: 'Woran erkenne ich, dass ein Test kaputt ist, bevor ich sein Ergebnis lese?',
  buildsOn: ['A-001', 'A-002'],
  leadsTo: ['A-004'],
  intro: {
    text:
      'Dein A/B-Test sollte die Besucher je zur Hälfte auf A und B verteilen. Gelandet sind 50.600 in A und 49.400 in B. ' +
      'Das sieht fast gleich aus, und 600 Besucher Abweichung vom Plan je Gruppe ließen sich leicht als Zufall abtun. ' +
      'Ist das schlimm? Wenn die Aufteilung selbst nicht stimmt, sagt auch ein glänzendes Ergebnis wenig. ' +
      'Schätz zuerst aus dem Bauch, ab welcher Abweichung die Prüfung Alarm schlägt.',
    estimateQuestionId: 'A-003-quiz-01',
  },
  quiz: [
    {
      id: 'A-003-quiz-01',
      type: 'estimate',
      prompt:
        'Geplant 50/50 bei 100.000 Besuchern. Ab wie vielen Besuchern Abweichung von 50.000 schlägt die Prüfung an?',
      answer: 520,
      tolerance: 0.25,
      unit: 'Besucher',
      explanation:
        'Die Prüfung schlägt an, wenn p unter 0,001 liegt. Das ist bei rund 520 Besuchern Abweichung der Fall: ' +
        '50.521 zu 49.479 schlägt an, 50.520 zu 49.480 gerade noch nicht. Das sind gut 1 % Abweichung vom Erwartungswert, ' +
        'also weniger, als man denkt. Dein Einstiegsbeispiel, 50.600 zu 49.400, liegt mit p ≈ 0,00015 weit unter der Schwelle von 0,001: Die Prüfung schlägt an.',
    },
    {
      id: 'A-003-quiz-02',
      type: 'choice',
      prompt: 'Was bedeutet ein Sample Ratio Mismatch (SRM)?',
      options: [
        'Die Aufteilung der Besucher weicht stärker vom Plan ab, als der Zufall erklärt.',
        'Variante B hat deutlich mehr Käufe als Variante A, mehr als der Zufall erklärt.',
        'Der Test hat zu wenige Besucher, um einen Unterschied verlässlich zu erkennen.',
        'Der Unterschied zwischen A und B ist nicht signifikant, obwohl er groß aussieht.',
      ],
      correctIndex: 0,
      explanation:
        'SRM heißt nur: Die Zahl der Besucher je Gruppe weicht stärker vom geplanten Verhältnis ab, als der Zufall erklärt. ' +
        'Es sagt nichts darüber, welche Variante besser ist. Es sagt, dass die Zuteilung oder die Zählung nicht so lief wie gedacht, ' +
        'und damit sind die Gruppen vermutlich nicht mehr vergleichbar.',
    },
    {
      id: 'A-003-quiz-03',
      type: 'choice',
      prompt: 'Die Prüfung schlägt an. Was tust du?',
      options: [
        'Das Ergebnis trotzdem lesen, die Abweichung von der geplanten Aufteilung ist ja klein.',
        'Den Test länger laufen lassen, bis sich die Zahlen der Gruppen von selbst angleichen.',
        'Das Ergebnis nicht lesen, die Ursache suchen und nach der Reparatur neu starten.',
        'In der größeren Gruppe zufällig Besucher streichen, bis die Aufteilung wieder passt.',
      ],
      correctIndex: 2,
      explanation:
        'Bei einem SRM sind die Gruppen nicht mehr durch reinen Zufall entstanden, also trägt auch der Vergleich nicht. ' +
        'Länger laufen zu lassen behebt die Ursache nicht, und Besucher zu streichen verdeckt sie nur. ' +
        'Suche, wo Besucher verloren gehen oder dazukommen (Weiterleitung, Bots, Tracking), behebe das und starte neu.',
    },
    {
      id: 'A-003-quiz-04',
      type: 'choice',
      prompt:
        'Die Weiterleitung in B verliert 5 % der Besucher, vor allem solche mit schlechter Verbindung. Sonst ändert sich nichts. Was zeigt der Test?',
      options: [
        'Nichts Auffälliges, die Kaufrate von B bleibt gleich, nur die Besucherzahl sinkt.',
        'B wirkt relativ rund 4,2 % besser, obwohl die Änderung in B nichts verbessert hat.',
        'B wirkt relativ rund 4,2 % schlechter, weil die verlorenen Besucher als Nichtkäufer zählen.',
        'B wirkt genau 5 % besser, weil genau 5 % der Besucher in B fehlen.',
      ],
      correctIndex: 1,
      explanation:
        'Die verlorenen Besucher kaufen ohnehin selten. Fehlen sie in B, steigt dort die Kaufrate allein durch die Auswahl: ' +
        'B wirkt relativ rund 4,2 % besser, obwohl nichts geändert wurde. ' +
        'Ein solches Ergebnis kann signifikant sein und trotzdem falsch. Gegen den Fehler hilft nur die Prüfung der Aufteilung.',
    },
  ],
  reflection: [
    {
      id: 'A-003-refl-01',
      prompt:
        'Ein signifikanter Test kann trotzdem kaputt sein. Wo hätte dich das getroffen: bei welchem Test hast du nur das Ergebnis gelesen?',
    },
    {
      id: 'A-003-refl-02',
      prompt: 'Welche Ursache für eine verschobene Aufteilung wäre bei dir am wahrscheinlichsten, und wer könnte sie bemerken?',
    },
  ],
  cards: [
    {
      id: 'A-003-card-01',
      front: 'Was ist ein Sample Ratio Mismatch?',
      back: 'Die Besucherzahlen der Gruppen passen nicht zum geplanten Verhältnis, stärker als der Zufall erklärt. Es sagt nichts über das Ergebnis, nur über die Aufteilung.',
    },
    {
      id: 'A-003-card-02',
      front: 'In welcher Reihenfolge liest du einen Test?',
      back: 'Erst die Aufteilung prüfen, dann das Ergebnis lesen. Schlägt die Prüfung an, das Ergebnis nicht lesen, sondern die Ursache suchen.',
    },
    {
      id: 'A-003-card-03',
      front: 'Warum liegt die Schwelle bei p < 0,001?',
      back: 'Die Prüfung läuft oft, und ein Fehlalarm stoppt einen Test. Deshalb ist sie strenger als die üblichen 0,05; in der Praxis liegen die Schwellen zwischen 0,01 und 0,0005.',
    },
    {
      id: 'A-003-card-04',
      front: 'Was sind typische Ursachen?',
      back: 'Weiterleitungen, die Besucher verlieren, Bots in einer Gruppe, Caching, Tracking-Ausfälle und ungleiche Auslöser für die Zuteilung.',
    },
    {
      id: 'A-003-card-05',
      front: 'Wie entsteht ein Scheineffekt?',
      back: 'Verlorene oder zusätzliche Besucher kaufen anders als der Rest. Verliert B bei 5 % Verlust langsame Besucher, wirkt B relativ rund 4,2 % besser, obwohl nichts geändert wurde.',
    },
    {
      id: 'A-003-card-06',
      front: 'Wie hängen χ² und z zusammen?',
      back: 'Bei zwei Gruppen hat der χ²-Test einen Freiheitsgrad, und dann gilt χ² = z². Der p-Wert ist derselbe wie beim zweiseitigen z-Test.',
    },
    {
      id: 'A-003-card-07',
      front: 'Was kann die Prüfung nicht?',
      back: 'Sie zeigt nur, dass etwas schiefläuft, nicht was. Eine kleine Verschiebung bleibt unter der Schwelle und kann das Ergebnis trotzdem verfälschen.',
    },
  ],
};
