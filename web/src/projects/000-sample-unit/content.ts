import type { ContentMeta } from '@hub/shared';

export const meta: ContentMeta = {
  id: '000-sample-unit',
  slug: '000-sample-unit',
  title: 'Beispiel-Mini-Einheit (nur Entwicklung)',
  track: 'experimentation',
  kind: 'unit',
  question: 'Wie sieht eine Mini-Einheit aus?',
  buildsOn: [],
  leadsTo: [],
  attachedTo: '000',
  intro: { text: 'Dies ist eine Beispiel-Mini-Einheit: Einstieg, Erklärung, Reflexion und Karten, ohne Demo und Quiz.' },
  quiz: [],
  reflection: [{ id: '000-sample-unit-refl-01', prompt: 'Was nimmst du aus dieser Kurzform mit?' }],
  cards: [
    { id: '000-sample-unit-card-01', front: 'Beispielkarte: Was fehlt einer Mini-Einheit?', back: 'Demo und Quiz.' },
  ],
};
