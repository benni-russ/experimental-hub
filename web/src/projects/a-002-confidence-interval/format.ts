import { formatDifference, formatNumber, formatSigned, isWhole } from '../../learning/numbers';

export const LEVEL_OPTIONS = [
  { value: 0.9, label: '90 %' },
  { value: 0.95, label: '95 %' },
  { value: 0.99, label: '99 %' },
];

/** Unterschied mit Vorzeichen: „+1,00 Prozentpunkte“. */
export const formatPoints = (v: number, digits = 2) => `${formatDifference(v, digits)} Prozentpunkte`;
/** MDE wie im Diagramm: ganze Zahlen ohne Nachkommastellen. */
export const formatMde = (v: number) => formatSigned(v, isWhole(v) ? 0 : 2);
export const formatRate = (v: number) => `${formatNumber(v, isWhole(v) ? 0 : 2)} %`;
export const formatLevel = (level: number) => `${formatNumber(level * 100)} %`;
/** „95-%-Intervall“ */
export const levelInterval = (level: number) => `${formatNumber(level * 100)}-%-Intervall`;
