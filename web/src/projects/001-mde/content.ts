import type { ContentMeta } from '@hub/shared';

// Alle Zahlen in diesen Texten sind mit calculateSampleSize gerechnet und in
// content.test.ts festgehalten. Wer eine Zahl ändert, ändert dort mit.

export const meta: ContentMeta = {
  id: '001',
  slug: 'mde',
  title: 'Kleinster erkennbarer Unterschied (MDE)',
  track: 'experimentation',
  kind: 'project',
  question: 'Wie viele Menschen braucht ein A/B-Test, um einen kleinen Unterschied zuverlässig zu erkennen?',
  buildsOn: [],
  leadsTo: ['006', '013'],
  intro: {
    text:
      'Stell dir vor, du betreibst einen Onlineshop und willst wissen, ob ein neuer Kaufen-Button besser ankommt. ' +
      'Die Hälfte der Besucher sieht den alten Button, die andere Hälfte den neuen. ' +
      'Beim alten kaufen 10 von 100 Menschen, beim neuen 11 von 100. ' +
      'Ist 11 statt 10 echt oder Zufall? ' +
      'Je kleiner der Unterschied ist, den du sicher erkennen willst, desto mehr Besucher brauchst du. ' +
      'Schätz zuerst aus dem Bauch, wie viele es sein müssen.',
    estimateQuestionId: '001-quiz-01',
  },
  quiz: [
    {
      id: '001-quiz-01',
      type: 'estimate',
      prompt: 'Wie viele Besucher braucht jede Variante, um 10 % → 11 % sicher zu erkennen?',
      answer: 14751,
      tolerance: 0.25,
      unit: 'Personen je Variante',
      explanation:
        '„Sicher“ heißt hier: Gibt es den Unterschied wirklich, zeigt der Test ihn in rund 80 von 100 Fällen (Power 80 %), ' +
        'und gibt es ihn nicht, täuscht der Zufall ihn nur in 5 von 100 Fällen vor (Signifikanzniveau 0,05). ' +
        'Damit ergibt die Formel 14.750,79, aufgerundet 14.751 Personen je Variante, zusammen 29.502. ' +
        'Ein Kauf mehr pro 100 Besucher geht im Zufallsrauschen leicht unter; erst bei sehr vielen Besuchern hebt er sich zuverlässig ab.',
    },
    {
      id: '001-quiz-02',
      type: 'choice',
      prompt:
        'Du willst statt 2 Prozentpunkten nur noch 1 Prozentpunkt Unterschied erkennen (Baseline 10 %, sonst alles gleich). Was passiert mit der nötigen Stichprobe?',
      options: ['Sie halbiert sich.', 'Sie wächst auf etwa das Doppelte.', 'Sie wird etwa viermal so groß.', 'Sie bleibt ungefähr gleich.'],
      correctIndex: 2,
      explanation:
        'Der Unterschied steht quadriert im Nenner der Formel. Halber Unterschied heißt ungefähr vierfache Stichprobe: ' +
        'von 3.841 auf 14.751 Personen je Variante, also das 3,84-Fache. Nicht ganz genau vier, weil sich mit der Zielrate auch die Streuung ein wenig ändert.',
    },
    {
      id: '001-quiz-03',
      type: 'choice',
      prompt: 'Was bedeutet eine Power von 80 %?',
      options: [
        'Das Testergebnis ist zu 80 % richtig, egal wie groß der Unterschied wirklich ist.',
        'Gibt es einen Unterschied in der geplanten Größe, zeigt der Test ihn in rund 80 von 100 Fällen.',
        'Zeigt der Test einen Unterschied, ist er mit 80 % Wahrscheinlichkeit auch wirklich vorhanden.',
        'Die neue Variante ist mit 80 % Wahrscheinlichkeit besser, wenn der Test signifikant wird.',
      ],
      correctIndex: 1,
      explanation:
        'Power ist die Trefferquote für echte Unterschiede: Ist der Unterschied genau so groß wie der kleinste, den du erkennen willst, ' +
        'wird der Test in rund 80 von 100 Fällen signifikant; ist er größer, noch öfter. In den übrigen Fällen übersiehst du ihn. ' +
        'Mehr Power kostet Stichprobe: Für 10 % → 11 % braucht es bei 90 % Power 19.747 statt 14.751 Personen je Variante.',
    },
    {
      id: '001-quiz-04',
      type: 'choice',
      prompt: 'Warum ist ein kleiner MDE so teuer?',
      options: [
        'Weil kleine Unterschiede im Rauschen untergehen und es mit mehr Personen nur langsam schrumpft.',
        'Weil kleine Unterschiede ein strengeres Signifikanzniveau verlangen, und das kostet Stichprobe.',
        'Weil der Test bei kleinen Unterschieden länger laufen muss, bis sich Wochentage ausgleichen.',
        'Weil man bei kleinen Unterschieden mehr Varianten braucht, um den Effekt einzugrenzen.',
      ],
      correctIndex: 0,
      explanation:
        'Die zufällige Schwankung einer gemessenen Kaufrate schrumpft nur mit der Wurzel der Stichprobe: ' +
        'Um sie zu halbieren, brauchst du viermal so viele Personen. Bei 10 % Baseline braucht ein Unterschied von 5 Prozentpunkten ' +
        '686 Personen je Variante, 1 Prozentpunkt 14.751 und 0,2 Prozentpunkte schon 356.335.',
    },
  ],
  reflection: [
    { id: '001-refl-01', prompt: 'Erkläre MDE in einem Satz, als würdest du es einer Kollegin ohne Statistik erklären.' },
    { id: '001-refl-02', prompt: 'Welcher Zusammenhang hat dich überrascht?' },
  ],
  cards: [
    {
      id: '001-card-01',
      front: 'Was ist der MDE (Minimum Detectable Effect)?',
      back: 'Der kleinste Unterschied, den ein Test zuverlässig erkennen soll. Du legst ihn vor dem Test fest; er bestimmt, wie viele Personen du brauchst. Hier ist er absolut gemeint, in Prozentpunkten: 10 % → 11 % sind 1 Prozentpunkt (siehe Karte „Absoluter oder relativer Unterschied“).',
    },
    {
      id: '001-card-02',
      front: 'Was ist die Baseline?',
      back: 'Die heutige Rate ohne Änderung, zum Beispiel 10 von 100 Besuchern kaufen, also 10 %. Von ihr aus wird der Unterschied gemessen.',
    },
    {
      id: '001-card-03',
      front: 'Was bedeutet eine Power von 80 %?',
      back: 'Ist der echte Unterschied so groß wie der MDE, wird der Test in rund 80 von 100 Fällen signifikant. In den übrigen übersiehst du ihn.',
    },
    {
      id: '001-card-04',
      front: 'Was bedeutet ein Signifikanzniveau von 0,05?',
      back: 'Gibt es in Wahrheit keinen Unterschied, meldet der Test trotzdem in 5 von 100 Fällen einen: ein Fehlalarm durch Zufall. Weniger Fehlalarme kosten mehr Stichprobe.',
    },
    {
      id: '001-card-05',
      front: 'Wie hängen MDE und Stichprobe zusammen?',
      back: 'Ungefähr quadratisch: halber MDE, etwa vierfache Stichprobe. Bei 10 % Baseline brauchen 2 Prozentpunkte 3.841 Personen je Variante, 1 Prozentpunkt 14.751.',
    },
    {
      id: '001-card-06',
      front: 'Absoluter oder relativer Unterschied: Was ist was?',
      back: 'Von 10 % auf 11 % sind absolut +1 Prozentpunkt, relativ zur Baseline +10 %. Immer dazusagen, welches gemeint ist.',
    },
    {
      id: '001-card-07',
      front: 'Warum braucht „+10 % relativ“ bei 20 % Baseline weniger Personen als bei 10 %?',
      back: 'Bei 20 % sind +10 % relativ schon 2 Prozentpunkte, bei 10 % nur 1. Der größere Abstand braucht 6.510 statt 14.751 Personen je Variante.',
    },
    {
      id: '001-card-08',
      front: 'Gilt die berechnete Stichprobe je Variante oder insgesamt?',
      back: 'Je Variante. Bei zwei gleich großen Gruppen brauchst du insgesamt das Doppelte: 14.751 je Variante sind 29.502 Personen.',
    },
  ],
};
