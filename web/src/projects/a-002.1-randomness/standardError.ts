/** Standardfehler einer Rate p bei n Personen, in Prozentpunkten. */
export function standardError(p: number, n: number): number {
  return Math.sqrt((p * (1 - p)) / n) * 100;
}
