import type { ContentMeta } from '@hub/shared';

// Die Standardfehler (0,95 und 0,47 Prozentpunkte) sind in content.test.ts nachgerechnet.
// Wer eine Zahl ändert, ändert dort mit.

export const meta: ContentMeta = {
  id: '002',
  slug: 'randomness',
  title: 'Zufall & Varianz',
  track: 'experimentation',
  kind: 'unit',
  question: 'Warum unterscheiden sich zwei gleiche Varianten trotzdem?',
  buildsOn: [],
  leadsTo: [],
  attachedTo: '006',
  intro: {
    text:
      'Du schickst Besucher zufällig auf zwei Seiten, die völlig identisch sind. Ein solcher A/A-Test zeigt am Ende trotzdem nie zweimal exakt dieselbe Rate, ' +
      'zum Beispiel 10,4 % gegen 9,7 %. Nichts hat gewirkt: Der Zufall hat bloß andere Besucher in die eine als in die andere Gruppe gelegt. ' +
      'Dieses Rauschen ist der Grund, warum man Intervalle braucht.',
  },
  quiz: [],
  reflection: [
    {
      id: '002-refl-01',
      prompt: 'Erkläre in zwei Sätzen, warum ein A/A-Test nicht genau zwei gleiche Zahlen liefert.',
    },
    {
      id: '002-refl-02',
      prompt: 'Welches Ergebnis hast du schon einmal für einen Effekt gehalten, das vielleicht nur Glück war?',
    },
  ],
  cards: [
    {
      id: '002-card-01',
      front: 'Was ist ein A/A-Test?',
      back: 'Ein Test, bei dem beide Gruppen dieselbe Variante sehen. Jeder Unterschied, den er zeigt, ist reines Zufallsrauschen.',
    },
    {
      id: '002-card-02',
      front: 'Wie stark streut eine gemessene Rate?',
      back: 'Der Standardfehler einer 10-%-Rate liegt bei 1.000 Besuchern bei 0,95 Prozentpunkten, bei 4.000 Besuchern nur noch bei 0,47. Die Formel ist √(p · (1 − p) / n).',
    },
    {
      id: '002-card-03',
      front: 'Wie viele Besucher halbieren das Rauschen?',
      back: 'Viermal so viele. Das Rauschen schrumpft mit √n, nicht mit n: Doppelt so viele Besucher bringen nur etwa 29 % weniger.',
    },
    {
      id: '002-card-04',
      front: 'Kann ein einzelner Test „Glück“ haben?',
      back: 'Ja. Auch ohne echten Effekt weicht ein Test gelegentlich weit genug ab, um signifikant zu wirken. Bei einem Niveau von 95 % passiert das in rund 1 von 20 Tests.',
    },
  ],
};
