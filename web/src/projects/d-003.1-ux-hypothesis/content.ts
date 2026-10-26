import type { ContentMeta } from '@hub/shared';

// Die Texte hier nennen keine Zahlen; content.test.ts prüft das.
// Karten und Reflexion zeigen reinen Text: keine Backticks.
// Die Beobachtung bleibt allgemein (Usability-Test, Sitzungsaufnahme); kein Buch, kein Zitat.

export const meta: ContentMeta = {
  id: 'D-003.1',
  slug: 'ux-hypothesis',
  title: 'UX-Beobachtung als Hypothese',
  track: 'experience',
  kind: 'unit',
  question: 'Wie wird aus einer Beobachtung eine Vermutung, die ein Test bestätigen oder widerlegen kann?',
  buildsOn: [],
  leadsTo: [],
  attachedTo: 'D-003',
  intro: {
    text:
      'Du schaust Menschen beim Einkaufen zu und merkst: An einer Stelle zögern viele. Das ist ein wertvoller Hinweis, aber noch keine Aussage, die man prüfen kann. ' +
      'Hier lernst du einen einfachen Satzbaustein, mit dem aus so einem Hinweis eine prüfbare Vermutung wird: mit Änderung, Zielgruppe, einer Kennzahl, die besser werden soll, und einer, die nicht leiden darf.',
  },
  quiz: [],
  reflection: [
    {
      id: 'D-003.1-refl-01',
      prompt:
        'Denk an eine Stelle in einem Shop, an der du selbst schon gezögert hast. Schreib dazu eine Hypothese nach dem Satzbaustein. Welche Kennzahl würdest du als Schutz wählen, und warum?',
    },
    {
      id: 'D-003.1-refl-02',
      prompt:
        'Nimm deine Hypothese und überleg, welches Ergebnis sie widerlegen würde. Fällt dir keines ein, was fehlt dann noch?',
    },
  ],
  cards: [
    {
      id: 'D-003.1-card-01',
      front: 'Was unterscheidet eine Beobachtung von einer Hypothese?',
      back: 'Eine Beobachtung beschreibt, was passiert ist, etwa dass viele an der Kasse zögern. Eine Hypothese nennt dazu eine Änderung, eine Zielgruppe, eine Kennzahl und das erwartete Ergebnis, sodass ein Test sie bestätigen oder widerlegen kann.',
    },
    {
      id: 'D-003.1-card-02',
      front: 'Wie lautet der Satzbaustein für eine Hypothese?',
      back: 'Weil wir beobachtet haben, dass …, nehmen wir an, dass … bei … zu … führt. Wir messen das an … und achten darauf, dass … nicht schlechter wird.',
    },
    {
      id: 'D-003.1-card-03',
      front: 'Wozu braucht eine Hypothese eine Schutzkennzahl?',
      back: 'Die Primärkennzahl zeigt, ob die Änderung wirkt. Die Schutzkennzahl zeigt, ob dabei etwas anderes leidet, etwa der Umsatz pro Besuch. Ohne sie kann ein Test wie ein Erfolg aussehen, der in Wahrheit Geld kostet.',
    },
    {
      id: 'D-003.1-card-04',
      front: 'Woran erkennst du, dass eine Hypothese nicht widerlegbar ist?',
      back: 'Wenn jedes denkbare Ergebnis zu ihr passt, etwa bei Formulierungen wie „könnte helfen“ oder „verbessert das Erlebnis“. Eine gute Hypothese sagt vorher, welche Kennzahl sich in welche Richtung bewegen soll.',
    },
  ],
};
