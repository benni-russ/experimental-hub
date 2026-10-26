import type { ContentMeta } from '@hub/shared';

// Die Werte der Tabelle werden in Explanation.tsx aus ROWS berechnet; die Texte
// hier nennen keine Zahlen. content.test.ts prüft das.
// Quiz, Karten und Reflexion zeigen reinen Text: dort keine Backticks.

export const meta: ContentMeta = {
  id: 'B-001.1',
  slug: 'json-vs-objects',
  title: 'JSON vs. JS-Objekte',
  track: 'web',
  kind: 'unit',
  question: 'Was geht beim Weg über JSON verloren?',
  buildsOn: [],
  leadsTo: [],
  attachedTo: 'B-001',
  intro: {
    text:
      'JSON sieht aus wie ein JavaScript-Objekt, ist aber nur Text, der so aussieht. Auf dem Weg ins Netz und zurück ' +
      'wird dein Objekt in Text verwandelt und wieder zurückgebaut. Dabei kommt nicht alles heil an: Manches verschwindet, ' +
      'manches wird zu etwas anderem. Die Tabelle zeigt es für typische Fälle, und darunter steht, was ein JSON-Text gar nicht erst enthalten darf.',
  },
  quiz: [],
  reflection: [
    {
      id: 'B-001.1-refl-01',
      prompt:
        'Welche Werte in deinem eigenen Code (zum Beispiel Datum, fehlende Angaben, Zahlen) gehen irgendwann durch JSON? Was wird aus ihnen auf der anderen Seite?',
    },
    {
      id: 'B-001.1-refl-02',
      prompt:
        'Ein Feld fehlt in der Antwort, obwohl du es gesetzt hattest. Wo auf dem Weg könnte es verloren gegangen sein?',
    },
  ],
  cards: [
    {
      id: 'B-001.1-card-01',
      front: 'Was wird aus undefined in JSON?',
      back: 'Als Wert in einem Objekt verschwindet das ganze Feld, in einem Array wird es zu null. Allein gibt es gar keinen JSON-Text. JSON kennt kein undefined.',
    },
    {
      id: 'B-001.1-card-02',
      front: 'Wie kommt ein Datum durch JSON?',
      back: 'Als Text im ISO-Format. Nach dem Zurückwandeln ist es ein String, kein Date mehr. Wer ein Datum braucht, baut es mit new Date(text) selbst wieder.',
    },
    {
      id: 'B-001.1-card-03',
      front: 'Warum ist ein Schlüssel ohne Anführungszeichen als JSON-Text ungültig?',
      back: 'In JSON müssen Schlüssel in doppelten Anführungszeichen stehen. Einfache Anführungszeichen, Kommentare und ein Komma am Ende sind ebenfalls verboten.',
    },
    {
      id: 'B-001.1-card-04',
      front: 'Was passiert mit NaN, Infinity, Funktionen und einer Map?',
      back: 'NaN und Infinity werden zu null, Funktionen im Objekt fallen weg, eine Map wird zu einem leeren Objekt. JSON kennt nur Text, Zahl, Wahrheitswert, null, Liste und Objekt.',
    },
  ],
};
