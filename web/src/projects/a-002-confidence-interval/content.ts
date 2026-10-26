import type { ContentMeta } from '@hub/shared';

// Alle Zahlen in diesen Texten sind mit differenceInterval und twoProportionZTest
// gerechnet und in content.test.ts festgehalten. Wer eine Zahl ändert, ändert dort mit.

export const meta: ContentMeta = {
  id: 'A-002',
  slug: 'confidence-interval',
  title: 'Konfidenzintervall',
  track: 'experimentation',
  kind: 'project',
  question: 'Was sagt ein Konfidenzintervall über das Ergebnis – und was nicht?',
  buildsOn: ['A-001'],
  leadsTo: ['A-003'],
  intro: {
    text:
      'Dein A/B-Test lief zwei Wochen. Variante B liegt mit 11 % Käufern gegen 10 % bei A vorn, bei je 10.000 Besuchern. ' +
      'Ein Prozentpunkt Vorsprung klingt gut. Aber wie sicher ist dieses „vorn“? ' +
      'Hätte ein zweiter Test genauso gut 10 % gegen 10 % oder sogar B hinten zeigen können? ' +
      'Statt einer einzigen Zahl gibt es einen Bereich, in dem der wahre Unterschied plausibel liegt. ' +
      'Schätz zuerst aus dem Bauch, wie breit dieser Bereich ist.',
    estimateQuestionId: 'A-002-quiz-01',
  },
  quiz: [
    {
      id: 'A-002-quiz-01',
      type: 'estimate',
      prompt: 'Je 10.000 Besucher, 10 % gegen 11 %: Wie weit reicht das 95-%-Intervall des Unterschieds nach oben und unten?',
      answer: 0.85,
      tolerance: 0.25,
      unit: 'Prozentpunkte (±)',
      explanation:
        'Das Intervall reicht vom gemessenen Unterschied von 1 Prozentpunkt rund ±0,85 Prozentpunkte nach beiden Seiten, ' +
        'also von 0,15 bis 1,85 Prozentpunkten. Es schließt die 0 aus: Ein Unterschied von null passt nicht zu diesen Daten. ' +
        'Trotzdem ist es breit: Der wahre Effekt kann winzig sein oder fast doppelt so groß wie gemessen.',
    },
    {
      id: 'A-002-quiz-02',
      type: 'choice',
      prompt: 'Was bedeutet „95 %“ bei einem 95-%-Konfidenzintervall?',
      options: [
        'Mit 95 % Wahrscheinlichkeit liegt der wahre Wert in genau dem einen Intervall, das du gemessen hast.',
        'In rund 95 von 100 Wiederholungen liefert das Verfahren ein Intervall, das den wahren Wert enthält.',
        '95 % der Besucher hatten eine Kaufrate, die zwischen den beiden Grenzen des Intervalls liegt.',
        'Wiederholst du den Test, liegt das neue Ergebnis mit 95 % Wahrscheinlichkeit in diesem Intervall.',
      ],
      correctIndex: 1,
      explanation:
        'Die 95 % beschreiben das Verfahren, nicht ein einzelnes Intervall: Würdest du den Test oft wiederholen, ' +
        'enthielten rund 95 von 100 der Intervalle den wahren Wert, die übrigen verfehlen ihn. ' +
        'Ob dein eines Intervall dazugehört, weißt du nicht. Der wahre Wert ist fest; zufällig ist das Intervall.',
    },
    {
      id: 'A-002-quiz-03',
      type: 'choice',
      prompt:
        'Ein Test mit je 50.000 Besuchern zeigt 10 % gegen 10,3 %. Das 99-%-Intervall des Unterschieds reicht von −0,19 bis 0,79 Prozentpunkten. Was folgt daraus?',
      options: [
        'Die Varianten sind gleich gut, denn das Intervall schließt die 0 ein.',
        'B ist signifikant besser, weil der größere Teil des Intervalls über 0 liegt.',
        'Nicht signifikant, aber ein Effekt bis knapp 0,8 Prozentpunkte ist nicht ausgeschlossen.',
        'Nicht signifikant, also lässt sich jeder Effekt, der sich lohnen würde, mit diesen Daten ausschließen.',
      ],
      correctIndex: 2,
      explanation:
        'Das Intervall von −0,19 bis 0,79 Prozentpunkten schließt die 0 ein, der Test ist also nicht signifikant. ' +
        'Das heißt aber nicht „kein Effekt“: Auch ein Plus von fast 0,8 Prozentpunkten passt noch zu den Daten, ebenso ein kleines Minus. ' +
        'Der Test war schlicht zu ungenau, um das zu entscheiden.',
    },
    {
      id: 'A-002-quiz-04',
      type: 'choice',
      prompt: 'Wie wird ein Konfidenzintervall schmaler?',
      options: [
        'Mit mehr Besuchern; viermal so viele halbieren die Breite.',
        'Mit mehr Besuchern; doppelt so viele halbieren die Breite.',
        'Mit längerer Testlaufzeit, auch wenn die Besucherzahl gleich bleibt.',
        'Mit einem strengeren Niveau, etwa 99 % statt 95 %.',
      ],
      correctIndex: 0,
      explanation:
        'Die Breite schrumpft mit der Wurzel der Stichprobe, genau wie das Rauschen in Versuch A-001: ' +
        'Viermal so viele Personen halbieren sie. Ein höheres Niveau macht das Intervall dagegen breiter, nicht schmaler.',
    },
  ],
  reflection: [
    { id: 'A-002-refl-01', prompt: 'Erkläre in einem Satz, was ein Konfidenzintervall über ein Testergebnis sagt.' },
    { id: 'A-002-refl-02', prompt: 'Wo hast du bisher Ergebnisse gelesen, zu denen kein Intervall angegeben war?' },
  ],
  cards: [
    {
      id: 'A-002-card-01',
      front: 'Was ist ein Konfidenzintervall?',
      back: 'Ein Bereich um das gemessene Ergebnis, in dem der wahre Wert plausibel liegt. Statt „B ist 1 Prozentpunkt besser“ heißt es: „zwischen 0,15 und 1,85 Prozentpunkten besser“.',
    },
    {
      id: 'A-002-card-02',
      front: 'Was bedeutet das Niveau 95 %?',
      back: 'Das Verfahren trifft den wahren Wert in rund 95 von 100 Wiederholungen. Bei einem einzelnen Intervall weißt du nicht, ob es dazugehört.',
    },
    {
      id: 'A-002-card-03',
      front: 'Wie hängt das Intervall mit Signifikanz zusammen?',
      back: 'Schließt das 95-%-Intervall des Unterschieds die 0 aus, ist der zweiseitige Test bei p < 0,05 in der Regel signifikant; schließt es die 0 ein, in der Regel nicht. Nahe der Grenze können Intervall und gepoolter Test abweichen, weil sie den Standardfehler etwas anders schätzen.',
    },
    {
      id: 'A-002-card-04',
      front: 'Wie hängen Breite und Stichprobe zusammen?',
      back: 'Viermal so viele Besucher halbieren die Breite. Bei je 10.000 Besuchern ist das Intervall ±0,85 Prozentpunkte breit, bei je 40.000 nur etwa ±0,42.',
    },
    {
      id: 'A-002-card-05',
      front: 'Was ist die häufigste Fehldeutung?',
      back: '„Mit 95 % liegt der wahre Wert in diesem Intervall.“ Der wahre Wert ist fest, zufällig ist das Intervall. Die 95 % gehören zum Verfahren, nicht zu dem einen Ergebnis.',
    },
    {
      id: 'A-002-card-06',
      front: 'Was ist der Unterschied zwischen Intervall und MDE?',
      back: 'Der MDE (Versuch A-001) legt vor dem Test fest, welchen Unterschied du erkennen willst. Das Intervall zeigt nach dem Test, welche Unterschiede die Daten noch zulassen.',
    },
  ],
};
