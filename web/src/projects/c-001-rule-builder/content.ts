import type { ContentMeta } from '@hub/shared';

// Zahlen in diesen Texten: 48 und die Wertezahlen 3, 2, 4 und 2 der Schätzfrage,
// alle in content.test.ts gegen ATTRIBUTES und allVisitorKinds geprüft. Die Namen
// der Erlebnisse in Quiz 2 und 3 stammen aus START_EXPERIENCES.
// Quiz, Karten und Reflexion zeigen reinen Text: dort keine Backticks.

export const meta: ContentMeta = {
  id: 'C-001',
  slug: 'rule-builder',
  title: 'Personalization Rule Builder',
  track: 'personalization',
  kind: 'project',
  question: 'Wie wird aus Regeln eine Entscheidung, und welche gewinnt, wenn mehrere passen?',
  buildsOn: [],
  leadsTo: ['C-002'],
  intro: {
    text:
      'Oben auf der Startseite eines Shops steht ein Banner. Neukunden sollen dort Gratisversand sehen, Handynutzer einen Hinweis auf die App, ' +
      'Leute mit gefülltem Warenkorb eine Erinnerung. Aber ein Besucher ist selten nur eines davon: Er kann neu sein, mit dem Handy kommen und schon etwas im Warenkorb haben. ' +
      'Dann passen mehrere Banner, und angezeigt wird nur eins. Wer entscheidet das, und woran merkt man, dass ein Banner nie zum Zug kommt? ' +
      'Schätz zuerst aus dem Bauch: Wie viele verschiedene Arten von Besuchern lassen sich mit nur vier einfachen Merkmalen unterscheiden?',
    estimateQuestionId: 'C-001-quiz-01',
  },
  quiz: [
    {
      id: 'C-001-quiz-01',
      type: 'estimate',
      prompt: 'Vier Merkmale mit 3, 2, 4 und 2 Werten: Wie viele verschiedene Besucherarten ergeben sie?',
      answer: 48,
      tolerance: 0.25,
      unit: 'Besucherarten',
      explanation:
        '48 Besucherarten, nämlich 3 mal 2 mal 4 mal 2. Jedes Merkmal multipliziert die Zahl der Möglichkeiten, deshalb wächst sie schneller, als man denkt. ' +
        'Schon bei vier einfachen Merkmalen kann niemand mehr im Kopf durchgehen, welches Erlebnis bei welcher Besucherart gewinnt. Genau dafür rechnet der Rule Builder es durch.',
    },
    {
      id: 'C-001-quiz-02',
      type: 'choice',
      prompt:
        'Ein Neukunde hat etwas im Warenkorb. Die Warenkorb-Erinnerung (weiter oben) und der Gratisversand für Neukunden (darunter) passen beide. ' +
        'Welches Erlebnis sieht er bei der Konfliktregel „Erste passende“?',
      options: ['Warenkorb-Erinnerung', 'Gratisversand für Neukunden', 'Beide nacheinander', 'Den Standard'],
      correctIndex: 0,
      explanation:
        'Die Warenkorb-Erinnerung: Bei „Erste passende“ gewinnt von allen passenden Erlebnissen das, das in der Liste am weitesten oben steht. ' +
        'Beide haben gleich viele Bedingungen, deshalb entscheidet auch bei „Spezifischste“ die Reihenfolge. Die Reihenfolge ist also eine Entscheidung, keine Nebensache.',
    },
    {
      id: 'C-001-quiz-03',
      type: 'choice',
      prompt:
        'Der Newsletter-Rabatt verlangt Newsletter als Quelle und einen gefüllten Warenkorb. Die Warenkorb-Erinnerung steht davor und verlangt nur den gefüllten Warenkorb. ' +
        'Warum gewinnt der Rabatt bei „Erste passende“ nie?',
      options: [
        'Er hat mehr Bedingungen und wird deshalb aussortiert.',
        'Newsletter-Besucher haben nie einen gefüllten Warenkorb.',
        'Wer ihn erfüllt, erfüllt auch die Erinnerung, und die steht weiter oben.',
        'Der Standard geht immer vor.',
      ],
      correctIndex: 2,
      explanation:
        'Der Rabatt ist überdeckt: Er passt bei manchen Besuchern, aber vor ihm greift immer schon die Erinnerung. ' +
        'Bei „Spezifischste“ gewinnt er dagegen, weil er mehr Bedingungen hat. Die Reichweiten-Tabelle zeigt solche Erlebnisse, bevor man sie im Betrieb vermisst.',
    },
    {
      id: 'C-001-quiz-04',
      type: 'choice',
      prompt: 'Wann gewinnt der Standard?',
      options: [
        'Immer, wenn er in der Liste ganz oben steht.',
        'Nur wenn nichts anderes passt.',
        'Bei jedem Besucher, der neu ist.',
        'Sobald zwei Erlebnisse gleich viele Bedingungen haben.',
      ],
      correctIndex: 1,
      explanation:
        'Der Standard steht immer ganz unten und passt auf jeden Besucher. Er gewinnt also genau bei den Besucherarten, bei denen kein anderes Erlebnis passt. ' +
        'Er ist das Sicherheitsnetz: Kein Besucher bleibt ohne Banner.',
    },
  ],
  reflection: [
    {
      id: 'C-001-refl-01',
      prompt:
        'Welche Regel würdest du in einem Shop, den du kennst, an die erste Stelle setzen, und was verlieren die Besucher, die dadurch nie ein anderes Banner sehen?',
    },
    {
      id: 'C-001-refl-02',
      prompt:
        'Ein Merkmal wie „Neukunde“ ist eine Annahme über einen Menschen. Wann kann sie falsch sein, und was passiert dann mit dem Erlebnis?',
    },
    {
      id: 'C-001-refl-03',
      prompt: 'Woran würdest du erkennen, dass eine Regel nützt und nicht nur plausibel klingt? Welche Zahl würdest du dafür ansehen?',
    },
  ],
  cards: [
    {
      id: 'C-001-card-01',
      front: 'Wie werden die Bedingungen eines Erlebnisses verknüpft?',
      back: 'Mit UND: Das Erlebnis passt nur, wenn alle Bedingungen zutreffen. Ein Erlebnis ohne Bedingung passt auf jeden Besucher.',
    },
    {
      id: 'C-001-card-02',
      front: 'Was bedeutet „Erste passende“?',
      back: 'Von oben nach unten gelesen gewinnt das erste Erlebnis, dessen Bedingungen alle zutreffen. Die Reihenfolge der Liste ist die Priorität.',
    },
    {
      id: 'C-001-card-03',
      front: 'Was bedeutet „Spezifischste“?',
      back: 'Es gewinnt das passende Erlebnis mit den meisten Bedingungen. Bei Gleichstand entscheidet die Reihenfolge.',
    },
    {
      id: 'C-001-card-04',
      front: 'Warum heißt mehr Bedingungen nicht wichtiger?',
      back: 'Die Zahl der Bedingungen sagt nur, wie eng eine Regel gefasst ist, nicht, wie viel sie wert ist. Eine wichtige, einfache Regel kann so von einer Nebensache überholt werden.',
    },
    {
      id: 'C-001-card-05',
      front: 'Was ist eine überdeckte Regel?',
      back: 'Eine Regel, die auf Besucher passt, aber nie gewinnt, weil davor immer ein anderes Erlebnis greift. Sie wirkt vorhanden, erreicht aber niemanden.',
    },
    {
      id: 'C-001-card-06',
      front: 'Wozu dient der Standard?',
      back: 'Er ist das Sicherheitsnetz: Er passt auf alle und gewinnt nur, wenn sonst nichts passt. So bekommt jeder Besucher ein Erlebnis.',
    },
    {
      id: 'C-001-card-07',
      front: 'Was zeigt die Reichweite eines Erlebnisses?',
      back: 'Auf wie viele Besucherarten es passt und bei wie vielen es tatsächlich gewinnt. Passt es auf viele und gewinnt nie, ist es überdeckt.',
    },
  ],
};
