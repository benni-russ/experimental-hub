import type { ContentMeta } from '@hub/shared';

// Zahlen in den Texten: nur die Halbwertszeit und die Ereignisgewichte; content.test.ts prüft sie gegen die Konstanten.
// Karten und Reflexion zeigen reinen Text: keine Backticks.

export const meta: ContentMeta = {
  id: 'C-003.1',
  slug: 'affinity',
  title: 'Affinitätsprofil',
  track: 'personalization',
  kind: 'unit',
  question: 'Wie wird aus ein paar angesehenen Produkten ein Profil, das sagt, was eine Person wohl als Nächstes will?',
  buildsOn: [],
  leadsTo: [],
  attachedTo: 'C-003',
  intro: {
    text:
      'In der Recommendation Demo steht bei jedem Besucher ein Profil: Anteile je Kategorie, die sich zu einem Ganzen addieren. ' +
      'Hier siehst du, woher diese Anteile kommen. Jedes Ereignis zählt, ein Kauf mehr als ein Blick, und alles, was länger zurückliegt, zählt weniger. ' +
      'Die Tabelle rechnet das für einen Beispielbesucher Zeile für Zeile durch.',
  },
  quiz: [],
  reflection: [
    {
      id: 'C-003.1-refl-01',
      prompt:
        'Überleg, welche Käufe oder Aufrufe in deinem eigenen Verlauf bei einem Shop ein falsches Bild von dir ergeben würden, etwa ein Geschenk oder ein Gerät, das mehrere Personen nutzen. Woran würde ein Profil das nicht erkennen?',
    },
  ],
  cards: [
    {
      id: 'C-003.1-card-01',
      front: 'Wie zählt ein einzelnes Ereignis im Profil?',
      back: 'Jedes Ereignis hat ein Gewicht: Aufruf 1, Warenkorb 3, Kauf 5. Dieses Gewicht wird mit einem Abklingfaktor multipliziert, der vom Alter des Ereignisses abhängt. Das Ergebnis ist der Beitrag zur Kategorie des Produkts.',
    },
    {
      id: 'C-003.1-card-02',
      front: 'Was bedeutet Halbwertszeit hier?',
      back: 'Ein Ereignis zählt nach 7 Tagen nur noch halb so viel, nach der doppelten Zeit ein Viertel und so weiter. So treten alte Interessen in den Hintergrund, ohne ganz zu verschwinden.',
    },
    {
      id: 'C-003.1-card-03',
      front: 'Warum wird das Profil auf Summe 1 gebracht?',
      back: 'Die Beiträge je Kategorie werden durch die Gesamtsumme geteilt. Dann sind die Werte Anteile und lassen sich zwischen Besuchern vergleichen, auch wenn einer viel und eine andere wenig angesehen hat.',
    },
    {
      id: 'C-003.1-card-04',
      front: 'Was weiß ein Profil nicht?',
      back: 'Es kennt nur Ereignisse, nicht die Gründe dahinter. Ein Geschenkkauf oder ein geteiltes Gerät sehen aus wie ein echtes Interesse und verzerren das Profil.',
    },
  ],
};
