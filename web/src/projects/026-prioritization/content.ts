import type { ContentMeta } from '@hub/shared';

// Die drei Testideen und ihre Werte stehen in Explanation.tsx (IDEAS).
// Die Texte hier nennen keine Zahlen; content.test.ts prüft das.

export const meta: ContentMeta = {
  id: '026',
  slug: 'prioritization',
  title: 'Priorisierung mit PIE',
  track: 'experimentation',
  kind: 'unit',
  question: 'Welche Testidee kommt zuerst?',
  buildsOn: [],
  leadsTo: [],
  attachedTo: '001',
  intro: {
    text:
      'Du hast mehr Testideen, als du Besucher zum Prüfen hast. Welche kommt zuerst? PIE macht die Entscheidung ' +
      'nachvollziehbar: Du bewertest jede Idee nach Potential, Importance und Ease und vergleichst den Mittelwert. ' +
      'Das ersetzt keine Messung, es ordnet nur deine Schätzungen.',
  },
  quiz: [],
  reflection: [
    {
      id: '026-refl-01',
      prompt:
        'Nimm drei Ideen, die du gerade testen könntest, und vergib Punkte. Was ändert sich an der Reihenfolge, wenn du die Ease-Punkte weglässt?',
    },
    {
      id: '026-refl-02',
      prompt: 'Wer würde deine Punkte anders vergeben, und welche Begründung würde die Person dafür brauchen?',
    },
  ],
  cards: [
    {
      id: '026-card-01',
      front: 'Wofür steht PIE?',
      back: 'Potential (wie viel ist zu gewinnen), Importance (wie wichtig ist die Seite) und Ease (wie leicht ist der Test). Je Punkte von 1 bis 10, der Mittelwert ist der PIE-Wert.',
    },
    {
      id: '026-card-02',
      front: 'Was ist ICE?',
      back: 'Eine Variante mit Impact, Confidence und Ease. Impact entspricht etwa dem Potential. Statt der Wichtigkeit der Seite zählt, wie sicher du dir mit der Schätzung bist.',
    },
    {
      id: '026-card-03',
      front: 'Wie sicher ist eine Rangfolge nach PIE?',
      back: 'Nicht sehr. Die Punkte sind Schätzungen, ein Punkt Abstand ist kein Beleg. Die Zahlen sehen genauer aus, als sie sind.',
    },
    {
      id: '026-card-04',
      front: 'Was passiert, wenn zwei Ideen denselben PIE-Wert haben?',
      back: 'Lege vorher eine Regel fest, zum Beispiel: Mehr Potential kommt zuerst. Sonst entscheidet am Ende das Bauchgefühl, das PIE ersetzen sollte.',
    },
    {
      id: '026-card-05',
      front: 'Warum schlägt Ease manchmal die Wirkung?',
      back: 'Im Mittelwert zählt ein leichter Test so viel wie ein wirksamer. Eine bequeme Idee mit kleinem Potential kann an einer wirksamen vorbeiziehen. Schreib zu jedem Punkt eine Begründung.',
    },
  ],
};
