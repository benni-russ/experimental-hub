import { intervalCase, type IntervalCase } from '../../stats/intervalCase';

/** Die vier Fälle: Intervall des Unterschieds in Prozentpunkten gegen Nulllinie und MDE-Linie. */

/** Beispiel-MDE der Zeichnung in Prozentpunkten. */
export const MDE = 1;

export interface Case {
  /** Fall aus der gemeinsamen Klassifikation in stats/intervalCase.ts */
  id: IntervalCase;
  /** Kurzbeschriftung in der Zeichnung */
  label: string;
  /** Lage zu den Linien, für die Beschreibung der Zeichnung */
  position: string;
  lower: number;
  upper: number;
}

export const CASES: Case[] = [
  {
    id: 'both',
    label: 'signifikant und relevant',
    position: 'ganz rechts von beiden Linien',
    lower: 1.3,
    upper: 2.7,
  },
  {
    id: 'small',
    label: 'signifikant, aber zu klein',
    position: 'rechts von der Null, aber links vom MDE',
    lower: 0.1,
    upper: 0.7,
  },
  {
    id: 'open',
    label: 'nicht signifikant, relevant nicht ausgeschlossen',
    position: 'über Null und MDE hinweg',
    lower: -0.5,
    upper: 1.6,
  },
  {
    id: 'excluded',
    label: 'nicht signifikant und relevant ausgeschlossen',
    position: 'über die Null hinweg, aber ganz links vom MDE',
    lower: -0.4,
    upper: 0.5,
  },
];

/** Fall eines Intervalls der Zeichnung, gegen deren MDE gelesen. */
export const caseOf = (c: Pick<Case, 'lower' | 'upper'>) => intervalCase(c.lower, c.upper, MDE);

const ORDINALS = ['Erstens', 'Zweitens', 'Drittens', 'Viertens'];

/** Beschreibung der Zeichnung, aus CASES abgeleitet. */
export const CASES_LABEL =
  'Vier Konfidenzintervalle des Unterschieds, jeweils gegen die Nulllinie und die Linie des kleinsten lohnenden Unterschieds (MDE). ' +
  CASES.map((c, i) => `${ORDINALS[i]}: ${c.position}, ${c.label}.`).join(' ');
