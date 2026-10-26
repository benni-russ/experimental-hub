import type { ContentMeta } from '@hub/shared';

// Die Texte hier nennen keine Zahlen; content.test.ts prüft das.
// Karten und Reflexion zeigen reinen Text: keine Backticks.

export const meta: ContentMeta = {
  id: 'C-001.1',
  slug: 'segmentation',
  title: 'Segmentierung vs. Personalisierung',
  track: 'personalization',
  kind: 'unit',
  question: 'Wann reicht eine Zielgruppe, und wann bekommt jede Person ihre eigene Reihenfolge?',
  buildsOn: [],
  leadsTo: [],
  attachedTo: 'C-001',
  intro: {
    text:
      'Im Rule Builder hast du Besucher in Gruppen sortiert und jeder Gruppe ein Erlebnis zugewiesen. Das nennt man Segmentierung. ' +
      'Viele Shops zeigen aber auch Empfehlungen, bei denen niemand eine Gruppe festgelegt hat und zwei Besucher selten dieselbe Reihenfolge sehen. ' +
      'Beides heißt im Alltag Personalisierung, ist aber etwas anderes. Hier stehen beide nebeneinander: wer entscheidet, wie viele Daten es braucht und wie gut man ' +
      'das Ergebnis erklären und testen kann.',
  },
  quiz: [],
  reflection: [
    {
      id: 'C-001.1-refl-01',
      prompt:
        'Denk an einen Shop, den du kennst. Welche Stelle dort würdest du mit Zielgruppen steuern, und welche mit einer eigenen Reihenfolge je Besucher? Warum passt jeweils das eine besser?',
    },
    {
      id: 'C-001.1-refl-02',
      prompt:
        'Eine Regel zeigt allen Neukunden Gratisversand. Wie würdest du prüfen, dass sie wirkt, und wie wäre das bei einer Reihenfolge, die für jede Person anders aussieht?',
    },
  ],
  cards: [
    {
      id: 'C-001.1-card-01',
      front: 'Was ist der Kern der Segmentierung?',
      back: 'Ein Mensch legt Zielgruppen und Bedingungen fest und ordnet jeder Zielgruppe ein Erlebnis zu. Alle Besucher einer Zielgruppe sehen dasselbe. Die Regeln sind sichtbar und lassen sich einzeln nachlesen.',
    },
    {
      id: 'C-001.1-card-02',
      front: 'Was ist der Kern der Personalisierung im engeren Sinn?',
      back: 'Ein Verfahren rechnet aus dem Verhalten jeder Person eine eigene Reihenfolge aus. Niemand legt Gruppen fest, die Reihenfolge ändert sich mit jedem neuen Signal. Dafür braucht es genug Verlauf und gepflegte Daten.',
    },
    {
      id: 'C-001.1-card-03',
      front: 'Woran erkenne ich, welche der beiden Arten ich brauche?',
      back: 'Wenn eine Aussage für ganze Gruppen gilt und du sie in einem Satz erklären kannst, reicht Segmentierung. Wenn die passende Auswahl von der einzelnen Person abhängt und das Sortiment groß ist, lohnt sich eine eigene Reihenfolge.',
    },
    {
      id: 'C-001.1-card-04',
      front: 'Wie lässt sich die jeweilige Art prüfen?',
      back: 'Eine Zielgruppenregel lässt sich gezielt testen, weil klar ist, wer sie sieht. Bei einer Reihenfolge je Person vergleicht man Gruppen mit und ohne Personalisierung, weil es keine einzelne Regel zum Prüfen gibt.',
    },
  ],
};
