import type { ContentMeta } from '@hub/shared';

// Zahlen (etwa der Betrag, um den value zu hoch ist) stehen nur in Explanation.tsx
// und werden dort aus den Beispielobjekten berechnet; die Texte hier nennen keine.
// content.test.ts prüft das. Karten und Reflexion zeigen reinen Text: keine Backticks.

export const meta: ContentMeta = {
  id: 'B-004.2',
  slug: 'data-quality',
  title: 'Datenqualität',
  track: 'web',
  kind: 'unit',
  question: 'Was passiert mit einem fehlerhaften Event, und wie findet man es vorher?',
  buildsOn: [],
  leadsTo: [],
  attachedTo: 'B-004',
  intro: {
    text:
      'Wer ein kaputtes Event an GA4 schickt, bekommt keine Fehlermeldung zurück. Die Daten kommen trotzdem an, nur falsch ' +
      'oder unvollständig, und der Fehler fällt erst später in einem Bericht auf. Die Tabelle zeigt fünf typische Fehler ' +
      'und den Code, mit dem der Prüfer sie benennt. Darunter steht, was man vor dem Livegang durchgeht.',
  },
  quiz: [],
  reflection: [
    {
      id: 'B-004.2-refl-01',
      prompt:
        'Welcher dieser Fehler würde dir in deinem eigenen Shop am ehesten unterlaufen, und woran würdest du ihn bemerken?',
    },
    {
      id: 'B-004.2-refl-02',
      prompt:
        'Wer sollte in deinem Team ein neues Event prüfen, bevor es live geht, und wie könnte das automatisch passieren?',
    },
  ],
  cards: [
    {
      id: 'B-004.2-card-01',
      front: 'Lehnt GA4 ein fehlerhaftes Event ab?',
      back: 'GA4 antwortet nicht mit einer Fehlermeldung, die Daten landen trotzdem falsch oder unvollständig in den Berichten. Auch dataLayer.push meldet nichts, denn es ist nur ein Listen-Aufruf. Fehler fallen erst in Berichten oder im DebugView auf.',
    },
    {
      id: 'B-004.2-card-02',
      front: 'Was bedeutet (not set) in einem Bericht?',
      back: 'Ein Platzhalter, den Analytics verwendet, wenn zu einer Dimension keine Information angekommen ist. Fehlt in einem Event also ein Feld, kann in der zugehörigen Spalte (not set) stehen. Was genau dahintersteckt, hängt von der Dimension ab.',
    },
    {
      id: 'B-004.2-card-03',
      front: 'Was passiert, wenn value den Versand mit einrechnet?',
      back: 'Der Umsatz ist um den Versandbetrag zu hoch. value ist laut Google die Summe aus Preis mal Menge der Items; Versand und Steuer gehören in eigene Felder.',
    },
    {
      id: 'B-004.2-card-04',
      front: 'Was prüfst du vor dem Livegang?',
      back: 'Den Eventnamen nach den Namensregeln, die Währung bei jedem value, value gegen die Summe der Items, Zahlen als Zahlen und bei Käufen eine eindeutige transaction_id. Ein Prüfer wie in diesem Projekt findet das, bevor Daten fließen.',
    },
  ],
};
