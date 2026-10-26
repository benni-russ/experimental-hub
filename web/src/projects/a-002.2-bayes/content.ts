import type { ContentMeta } from '@hub/shared';

// Die einzige gerechnete Zahl (rund 99 %) ist in content.test.ts nachgerechnet.
// Die 97 % in der Kernfrage und in der Reflexion sind ein Beispiel, kein Ergebnis.

export const meta: ContentMeta = {
  id: 'A-002.2',
  slug: 'bayes',
  title: 'Bayes statt Intervall?',
  track: 'experimentation',
  kind: 'unit',
  question: 'Was sagt „B ist mit 97 % besser“ – und was muss man dafür annehmen?',
  buildsOn: [],
  leadsTo: [],
  attachedTo: 'A-002',
  intro: {
    text:
      'Manche Testwerkzeuge zeigen keinen p-Wert und kein Konfidenzintervall, sondern einen Satz wie „B ist mit 97 % Wahrscheinlichkeit besser“. ' +
      'Das klingt genau nach der Antwort, die man sich wünscht – anders als beim Intervall, dessen 95 % zum Verfahren gehören und nicht zum einzelnen Ergebnis. ' +
      'Aber woher kommt die Zahl, und was steckt dahinter, das beim Intervall fehlt?',
  },
  quiz: [],
  reflection: [
    {
      id: 'A-002.2-refl-01',
      prompt: 'Ein Werkzeug meldet „B ist mit 97 % besser“. Welche zwei Rückfragen stellst du, bevor du entscheidest?',
    },
  ],
  cards: [
    {
      id: 'A-002.2-card-01',
      front: 'Was liefert die Bayes-Lesart, das ein Intervall nicht liefert?',
      back: 'Eine direkte Aussage wie „B ist mit x % Wahrscheinlichkeit besser“. Dafür muss man vorab festlegen, wie plausibel verschiedene Effekte schon vor dem Test waren: den Prior.',
    },
    {
      id: 'A-002.2-card-02',
      front: 'Was ist ein Prior?',
      back: 'Die Annahme darüber, welche Effekte vor dem Test wie wahrscheinlich sind. Ein flacher Prior hält jeden Effekt für gleich plausibel, ein skeptischer Prior, auf „kein Unterschied“ zentriert, hält große Effekte für selten.',
    },
    {
      id: 'A-002.2-card-03',
      front: 'Was haben Bayes-Lesart und Intervall gemeinsam?',
      back: 'Beide beruhen auf denselben Daten und demselben Rauschen. Mit flachem Prior ist „B ist besser“ ungefähr 1 minus dem einseitigen p-Wert; bei 10 % gegen 11 % mit je 10.000 Besuchern sind das rund 99 % (Näherung: Normalverteilung, flacher Prior).',
    },
    {
      id: 'A-002.2-card-04',
      front: 'Wann nützt die Bayes-Lesart im Alltag?',
      back: 'Wenn die Entscheidung eine Wahrscheinlichkeit verlangt („lohnt sich B?“) und das Team den Prior offenlegt. Dann ist „B ist mit x % besser“ die verständlichere Antwort.',
    },
    {
      id: 'A-002.2-card-05',
      front: 'Woran erkennst du eine unseriöse Bayes-Zahl?',
      back: 'Am fehlenden Prior. Wer die Annahme nicht nennt, kann die Zahl nahezu beliebig verschieben. Frag, welcher Prior verwendet wurde.',
    },
  ],
};
