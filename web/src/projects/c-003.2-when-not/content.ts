import type { ContentMeta } from '@hub/shared';

// Die Texte hier nennen keine Zahlen; content.test.ts prüft das.
// Karten und Reflexion zeigen reinen Text: keine Backticks.

export const meta: ContentMeta = {
  id: 'C-003.2',
  slug: 'when-not',
  title: 'Wann Personalisierung keinen Sinn ergibt',
  track: 'personalization',
  kind: 'unit',
  question: 'Woran erkenne ich, dass sich eine eigene Reihenfolge je Besucher nicht lohnt, und was mache ich dann?',
  buildsOn: [],
  leadsTo: [],
  attachedTo: 'C-003',
  intro: {
    text:
      'Eine eigene Reihenfolge je Besucher klingt immer gut. Sie kostet aber Daten, Pflege und Erklärungen, und manchmal bringt sie wenig. ' +
      'Hier steht eine Prüfliste mit Situationen, in denen man es sich genauer überlegen sollte, jeweils mit einem Anzeichen und einer einfacheren Alternative.',
  },
  quiz: [],
  reflection: [
    {
      id: 'C-003.2-refl-01',
      prompt:
        'Nimm einen Shop, den du kennst, und geh die Prüfliste durch. Bei welchem Punkt würdest du am ehesten sagen, dass sich Personalisierung dort nicht lohnt, und was würdest du stattdessen zeigen?',
    },
  ],
  cards: [
    {
      id: 'C-003.2-card-01',
      front: 'Was heißt Kaltstart?',
      back: 'Für neue Besucher oder neue Produkte gibt es noch keinen Verlauf. Ein Profil ist dann leer, und die Reihenfolge fällt auf allgemeine Beliebtheit zurück. Ohne genug Verlauf lohnt sich der Aufwand nicht.',
    },
    {
      id: 'C-003.2-card-02',
      front: 'Wann ist ein Sortiment zu klein für Personalisierung?',
      back: 'Wenn Besucher ohnehin alles auf einen Blick sehen, gibt es wenig zu sortieren. Eine gute feste Auswahl ist dann einfacher, günstiger und besser zu erklären.',
    },
    {
      id: 'C-003.2-card-03',
      front: 'Was tun ohne Einwilligung zum Tracking?',
      back: 'Ohne Einwilligung sollte der Verlauf einer Person in der Regel nicht gesammelt werden. Dann bleiben Empfehlungen, die nur den aktuellen Besuch oder das Produkt selbst nutzen, oder feste Zielgruppenregeln.',
    },
    {
      id: 'C-003.2-card-04',
      front: 'Was ist eine Filterblase, und warum ist sie ein Risiko?',
      back: 'Wer nur noch mehr vom Bekannten sieht, entdeckt nichts Neues. Zusammen mit fehlender Erklärbarkeit ist das für Shop und Besucher schwer zu bemerken und zu korrigieren.',
    },
  ],
};
