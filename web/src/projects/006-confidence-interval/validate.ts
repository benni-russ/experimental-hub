import type { Dispatch, SetStateAction } from 'react';
import { parseGermanNumber } from '../../learning/numbers';
import type { Counts } from '../../stats/proportions';

/** Feldtexte bleiben Strings, damit Tippen nicht springt. */
export type CountFields = { visitorsA: string; conversionsA: string; visitorsB: string; conversionsB: string };

type Errors = Partial<Record<keyof CountFields, string>>;

export const NOT_A_NUMBER = 'Bitte eine Zahl eingeben.';
export const NOT_WHOLE = 'Bitte eine ganze Zahl eingeben.';

/** Ganze Zahl ≥ 0 oder eine Fehlermeldung. */
export function readWhole(raw: string): { value: number } | { error: string } {
  const value = parseGermanNumber(raw);
  if (value === null) return { error: NOT_A_NUMBER };
  if (!Number.isInteger(value) || value < 0) return { error: NOT_WHOLE };
  return { value };
}

export function validateCounts(f: CountFields): { counts: Counts | null; errors: Errors } {
  const errors: Errors = {};
  const values: Partial<Record<keyof CountFields, number>> = {};

  for (const key of ['visitorsA', 'conversionsA', 'visitorsB', 'conversionsB'] as const) {
    const r = readWhole(f[key]);
    if ('error' in r) errors[key] = r.error;
    else values[key] = r.value;
  }
  for (const key of ['visitorsA', 'visitorsB'] as const) {
    if (values[key] === 0) errors[key] = 'Mindestens 1 Besucher.';
  }
  for (const [visitors, conversions] of [
    ['visitorsA', 'conversionsA'],
    ['visitorsB', 'conversionsB'],
  ] as const) {
    const v = values[visitors];
    const c = values[conversions];
    if (v !== undefined && c !== undefined && v > 0 && c > v) errors[conversions] = 'Mehr Käufe als Besucher geht nicht.';
  }

  if (Object.keys(errors).length > 0) return { counts: null, errors };
  return {
    counts: {
      visitorsA: values.visitorsA!,
      conversionsA: values.conversionsA!,
      visitorsB: values.visitorsB!,
      conversionsB: values.conversionsB!,
    },
    errors,
  };
}

/** Startwerte des Einstiegsbeispiels (10 % gegen 11 %, je 10.000). */
export const START_FIELDS: CountFields = {
  visitorsA: '10.000',
  conversionsA: '1.000',
  visitorsB: '10.000',
  conversionsB: '1.100',
};

/** Setzt ein Feld der vier Zahlenfelder; für `onChange={fieldSetter(setFields)('visitorsA')}`. */
export const fieldSetter =
  (setFields: Dispatch<SetStateAction<CountFields>>) => (key: keyof CountFields) => (raw: string) =>
    setFields((f) => ({ ...f, [key]: raw }));
