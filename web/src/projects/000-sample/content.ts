import type { ContentMeta } from '@hub/shared';

export const meta: ContentMeta = {
  id: '000',
  slug: '000-sample',
  title: 'Beispielprojekt (nur Entwicklung)',
  track: 'experimentation',
  kind: 'project',
  question: 'Wie sieht ein Projekt mit allen Bausteinen aus?',
  buildsOn: [],
  leadsTo: [],
  intro: {
    text: 'Dies ist ein Beispielprojekt, das nur in der Entwicklung erscheint. Es zeigt alle Bausteine einer Projektseite mit erfundenem Inhalt.',
    estimateQuestionId: '000-quiz-01',
  },
  quiz: [
    {
      id: '000-quiz-01',
      type: 'estimate',
      prompt: 'Wie viele Tage hat ein Schaltjahr?',
      answer: 366,
      tolerance: 0.01,
      unit: 'Tage',
      explanation: 'Ein Schaltjahr hat einen zusätzlichen Tag im Februar, also 366 Tage.',
    },
    {
      id: '000-quiz-02',
      type: 'choice',
      prompt: 'Wofür steht dieses Beispielprojekt?',
      options: ['Für echten Lerninhalt', 'Für einen Platzhalter zum Ausprobieren', 'Für eine Prüfung'],
      correctIndex: 1,
      explanation: 'Das Beispielprojekt dient nur dazu, die Bausteine in der Entwicklung zu testen.',
    },
  ],
  reflection: [
    { id: '000-refl-01', prompt: 'Was hat dich an diesem Beispiel überrascht?' },
    { id: '000-refl-02', prompt: 'Wo würdest du so einen Baustein selbst einsetzen?' },
  ],
  cards: [
    { id: '000-card-01', front: 'Beispielkarte 1: Was ist ein Beispielprojekt?', back: 'Ein Platzhalter mit erfundenem Inhalt für die Entwicklung.' },
    { id: '000-card-02', front: 'Beispielkarte 2: Wann erscheint es?', back: 'Nur im Entwicklungsmodus, nie auf dem Server.' },
    { id: '000-card-03', front: 'Beispielkarte 3: Wie viele Tage hat ein Schaltjahr?', back: '366.' },
  ],
};
