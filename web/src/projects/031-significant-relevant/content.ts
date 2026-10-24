import type { ContentMeta } from '@hub/shared';

// Die vier Fälle der Zeichnung stehen in cases.ts und sind in content.test.ts eingeordnet.
// Der Text nennt keine gerechneten Zahlen.

export const meta: ContentMeta = {
  id: '031',
  slug: 'significant-relevant',
  title: 'Signifikant ≠ relevant',
  track: 'experimentation',
  kind: 'unit',
  question: 'Warum kann ein signifikanter Unterschied trotzdem unwichtig sein?',
  buildsOn: [],
  leadsTo: [],
  attachedTo: '006',
  intro: {
    text:
      'Das Ergebnis ist signifikant, der Test „hat gewonnen“. Reicht das für die Entscheidung? Nicht unbedingt. ' +
      'Signifikant heißt nur: Die Daten passen schlecht zu „gar kein Unterschied“. Es sagt nicht, ob der Unterschied groß genug ist, ' +
      'dass sich der Aufwand lohnt. Und ein nicht signifikantes Ergebnis heißt nicht, dass es keinen Effekt gibt.',
  },
  quiz: [],
  reflection: [
    {
      id: '031-refl-01',
      prompt: 'Welchen kleinsten Unterschied müsste eine Änderung bei deiner Arbeit bringen, damit sie sich lohnt?',
    },
    {
      id: '031-refl-02',
      prompt: 'Erinnere dich an ein „signifikantes“ Ergebnis: Hast du danach gefragt, wie groß der Unterschied war?',
    },
  ],
  cards: [
    {
      id: '031-card-01',
      front: 'Was heißt „signifikant“?',
      back: 'Das Intervall des Unterschieds schließt die 0 aus: Zufall allein erklärt die Daten schlecht. Über die Größe des Effekts sagt das nichts.',
    },
    {
      id: '031-card-02',
      front: 'Was heißt „relevant“?',
      back: 'Der Unterschied ist mindestens so groß wie der kleinste, der sich für dich lohnt: der MDE aus Versuch 001. Das legst du fest, nicht die Statistik.',
    },
    {
      id: '031-card-03',
      front: 'Welche vier Fälle gibt es?',
      back: 'Signifikant und relevant · signifikant, aber zu klein · nicht signifikant, relevant nicht ausgeschlossen · nicht signifikant und relevant ausgeschlossen.',
    },
    {
      id: '031-card-04',
      front: 'Warum werden winzige Effekte signifikant?',
      back: 'Mit sehr vielen Besuchern wird das Intervall so schmal, dass es selbst einen kleinen Unterschied von der 0 trennt. Signifikanz misst dann vor allem die Stichprobengröße.',
    },
    {
      id: '031-card-05',
      front: 'Was tust du bei „nicht signifikant“?',
      back: 'Prüf, ob die MDE-Linie im Intervall liegt. Wenn ja, war der Test zu ungenau, um einen relevanten Effekt auszuschließen. Wenn nicht, passt ein lohnender Effekt auf diesem Niveau nicht zu den Daten: Du kannst ihn ausschließen.',
    },
  ],
};
