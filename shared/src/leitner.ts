export const BOX_INTERVAL_DAYS = [1, 3, 7, 14, 30] as const;

const DAY_MS = 86_400_000;

/** Gewusst: ein Fach weiter (höchstens 5). Nicht gewusst: zurück auf Fach 1. */
export function nextBox(box: number, known: boolean): number {
  if (!known) return 1;
  return Math.min(box + 1, BOX_INTERVAL_DAYS.length);
}

/** Fälligkeit = reviewedAt + Abstand des (neuen) Fachs; reine Millisekunden, keine Kalenderlogik. */
export function dueDate(box: number, reviewedAt: Date): Date {
  if (!Number.isInteger(box) || box < 1 || box > BOX_INTERVAL_DAYS.length) {
    throw new RangeError(`Fach muss eine ganze Zahl von 1 bis ${BOX_INTERVAL_DAYS.length} sein, war: ${box}`);
  }
  const days = BOX_INTERVAL_DAYS[box - 1] as number;
  return new Date(reviewedAt.getTime() + days * DAY_MS);
}
