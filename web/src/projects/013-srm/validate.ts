import { parseGermanNumber } from '../../learning/numbers';
import { NOT_A_NUMBER, readWhole } from '../006-confidence-interval/validate';

/** Feldtexte bleiben Strings, damit Tippen nicht springt. */
export type OwnFields = { visitorsA: string; visitorsB: string; plannedShareA: string };

export const SHARE_RANGE = 'Anteil zwischen 0 und 100 %.';
export const NO_VISITORS = 'Mindestens ein Besucher insgesamt nötig, sonst gibt es nichts zu prüfen.';

export interface OwnInput {
  visitorsA: number;
  visitorsB: number;
  plannedShareA: number;
}

export interface OwnValidation {
  input: OwnInput | null;
  errors: Partial<Record<keyof OwnFields, string>>;
  /** Beide Zähler 0: kein Feldfehler, aber nichts zu rechnen. */
  noVisitors: boolean;
}

export function validateOwn(f: OwnFields): OwnValidation {
  const errors: OwnValidation['errors'] = {};
  let visitorsA = 0;
  let visitorsB = 0;
  let plannedShareA = 0;

  const a = readWhole(f.visitorsA);
  if ('error' in a) errors.visitorsA = a.error;
  else visitorsA = a.value;
  const b = readWhole(f.visitorsB);
  if ('error' in b) errors.visitorsB = b.error;
  else visitorsB = b.value;

  const share = parseGermanNumber(f.plannedShareA);
  if (share === null) errors.plannedShareA = NOT_A_NUMBER;
  else if (share <= 0 || share >= 100) errors.plannedShareA = SHARE_RANGE;
  else plannedShareA = share;

  if (Object.keys(errors).length > 0) return { input: null, errors, noVisitors: false };
  if (visitorsA + visitorsB === 0) return { input: null, errors, noVisitors: true };
  return { input: { visitorsA, visitorsB, plannedShareA }, errors, noVisitors: false };
}

/** Startwerte: das Einstiegsbeispiel. */
export const START_FIELDS: OwnFields = { visitorsA: '50.600', visitorsB: '49.400', plannedShareA: '50' };
