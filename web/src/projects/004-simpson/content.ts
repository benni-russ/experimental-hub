import type { ContentMeta } from '@hub/shared';

// Alle Zahlen in diesen Texten sind mit overallRate, compare und tippingPoint
// gerechnet und in content.test.ts festgehalten. Wer eine Zahl ändert, ändert dort mit.

export const meta: ContentMeta = {
  id: '004',
  slug: 'simpson',
  title: 'Simpson-Paradox',
  track: 'experimentation',
  kind: 'project',
  question: 'Wie kann ein Effekt in jedem Segment steigen und insgesamt fallen?',
  buildsOn: ['006', '013'],
  leadsTo: ['007'],
  intro: {
    text:
      'Ein Shop testet eine neue Variante B gegen die bisherige Variante A. ' +
      'Bei den Handynutzern kaufen mit B mehr Leute als mit A. Bei den Desktopnutzern auch. ' +
      'Rechnet man alle zusammen, kaufen mit B weniger. ' +
      'Das klingt unmöglich, ist aber reine Rechnung. ' +
      'Schätz zuerst aus dem Bauch, ab welchem Handyanteil in B die Variante insgesamt hinter A zurückfällt.',
    estimateQuestionId: '004-quiz-01',
  },
  quiz: [
    {
      id: '004-quiz-01',
      type: 'estimate',
      prompt: 'Ab welchem Mobil-Anteil in B verliert B insgesamt?',
      answer: 62,
      tolerance: 0.1,
      unit: '% Mobil-Anteil',
      explanation:
        'A kauft insgesamt mit 4,0 % (je zur Hälfte Mobil mit 2,0 % und Desktop mit 6,0 %). ' +
        'B erreicht diese 4,0 % genau bei einem Mobil-Anteil von (6,6 − 4,0) / (6,6 − 2,4) ≈ 61,9 %. ' +
        'Darüber liegt B insgesamt hinter A, obwohl B in beiden Segmenten besser ist. ' +
        'Bei 70 % Mobil kommt B nur auf 0,7 · 2,4 + 0,3 · 6,6 = 3,66 %, A bleibt bei 4,0 %.',
    },
    {
      id: '004-quiz-02',
      type: 'choice',
      prompt: 'B gewinnt in beiden Segmenten und verliert insgesamt. Woran liegt das?',
      options: [
        'Die Rechnung für die Gesamtrate ist fehlerhaft, weil sie die Segmente doppelt zählt.',
        'B bekam mehr vom schwächeren Segment (Mobil), und das drückt seinen Durchschnitt.',
        'B ist in Wahrheit schlechter, und die Segmentwerte täuschen durch zu kleine Gruppen.',
        'Desktop-Besucher kaufen in B seltener, das zeigt sich erst in der Gesamtrate.',
      ],
      correctIndex: 1,
      explanation:
        'Die Gesamtrate ist ein gewichtetes Mittel der Segmentraten, und die Gewichte sind der Anteil je Segment. ' +
        'Bekommt B deutlich mehr vom schwächeren Segment, zieht das den Durchschnitt unter den von A, ' +
        'auch wenn B in jedem Segment besser ist. Nicht die Rechnung ist falsch, sondern der Vergleich von Gruppen mit unterschiedlichem Mix.',
    },
    {
      id: '004-quiz-03',
      type: 'choice',
      prompt: 'Wie schützt eine saubere Zufallsaufteilung im Test vor dem Paradox?',
      options: [
        'Sie macht beide Varianten in jedem Segment gleich gut, sodass kein Unterschied bleibt.',
        'Sie gibt A und B im Mittel denselben Mix, Abweichungen bleiben reiner Zufall.',
        'Sie verhindert, dass sich Mobil und Desktop in ihrer Kaufrate unterscheiden.',
        'Sie gleicht ungleiche Segmente nachträglich aus, indem sie die Raten gewichtet.',
      ],
      correctIndex: 1,
      explanation:
        'Bei zufälliger Zuteilung haben A und B im Mittel denselben Mix. Dann gibt es keinen Grund für einen Unterschied in den Gewichten, ' +
        'und Gesamt- und Segmentvergleich zeigen in dieselbe Richtung. ' +
        'Verschiebt sich der Mix trotzdem deutlich, ist die Zuteilung gestört. Das würde eine Prüfung der Aufteilung je Segment (wie in 013) aufdecken, ' +
        'auch wenn die Gesamtzahlen in A und B gleich aussehen.',
    },
    {
      id: '004-quiz-04',
      type: 'choice',
      prompt: 'Wann ist der Vergleich je Segment die richtige Sicht?',
      options: [
        'Immer mit so vielen Segmenten wie möglich, bis irgendwo ein Effekt auftaucht, den man berichten kann.',
        'Wenn der Mix in einem randomisierten Test ungleich ist; dann gilt das Segmentergebnis statt der Gesamtrate.',
        'Wenn das Segment eine Störgröße ist, etwa in Beobachtungsdaten, oder wenn du es vorab geplant hast.',
        'Nur wenn das Gesamtergebnis nicht signifikant ist, damit doch noch ein Effekt sichtbar wird.',
      ],
      correctIndex: 2,
      explanation:
        'Segmentieren ist die richtige Sicht, wenn das Segment eine Störgröße ist: in Beobachtungsdaten oder wenn der Mix bewusst verschieden ist. ' +
        'Dann vergleichst du je Segment oder rechnest beide Gruppen auf denselben Mix um. Segmente, die du vorab planst, sind eine saubere Zusatzfrage. ' +
        'Ist der Mix dagegen in einem randomisierten Test ungleich, ist die Zuteilung gestört: Ursache suchen wie in 013, das Ergebnis nicht lesen, auch nicht je Segment. ' +
        'Und wer nach dem Test so lange in Teilgruppen sucht, bis etwas auffällt, testet mehrfach und findet auch bei reinem Zufall etwas.',
    },
  ],
  reflection: [
    {
      id: '004-refl-01',
      prompt: 'Kennst du eine Zahl aus deinem Alltag, die insgesamt fällt, obwohl sie in jeder Gruppe steigt? Wo hättest du den Mix übersehen?',
    },
    {
      id: '004-refl-02',
      prompt: 'Welche Segmente würdest du in deinem nächsten Test vorab festlegen, und warum genau diese?',
    },
  ],
  cards: [
    {
      id: '004-card-01',
      front: 'Was ist das Simpson-Paradox?',
      back: 'Ein Effekt steigt in jedem Segment und fällt insgesamt (oder umgekehrt), weil sich der Anteil der Segmente zwischen den Gruppen unterscheidet.',
    },
    {
      id: '004-card-02',
      front: 'Wie berechnet sich die Gesamtrate?',
      back: 'Als gewichtetes Mittel der Segmentraten, gewichtet mit dem Anteil jedes Segments. Beispiel: B bei 70 % Mobil: 0,7 · 2,4 + 0,3 · 6,6 = 3,66 %.',
    },
    {
      id: '004-card-03',
      front: 'Wo liegt der Kipppunkt im Beispiel?',
      back: 'Bei rund 61,9 % Mobil-Anteil in B. Darüber liegt B insgesamt unter den 4,0 % von A, obwohl B in beiden Segmenten gewinnt.',
    },
    {
      id: '004-card-04',
      front: 'Woher kommt das Paradox?',
      back: 'Nicht aus der Rechnung, sondern aus dem Mix: Eine Gruppe hat mehr vom schwächeren Segment bekommen.',
    },
    {
      id: '004-card-05',
      front: 'Wie hilft die Zufallsaufteilung?',
      back: 'Sie gibt A und B im Mittel denselben Mix, dann zeigen Gesamt- und Segmentvergleich in dieselbe Richtung.',
    },
    {
      id: '004-card-06',
      front: 'Wie hängt das mit SRM zusammen?',
      back: 'Ein stark ungleicher Mix ist ein Zeichen, dass die Zuteilung nicht zufällig war. Die Prüfung der Aufteilung je Segment kann ihn aufdecken, die auf die Gesamtzahlen allein nicht unbedingt.',
    },
    {
      id: '004-card-07',
      front: 'Wann segmentieren?',
      back: 'Bei vorab geplanten Segmenten oder wenn das Segment eine Störgröße ist, etwa in Beobachtungsdaten. Ungleicher Mix im randomisierten Test ist dagegen ein Alarmzeichen (013). Segmente erst nach dem Test zu suchen ist Mehrfachtesten.',
    },
  ],
};
