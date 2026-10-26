/**
 * Gleichstand beim Rang: Für jeden Wert, ob mindestens ein anderer denselben hat.
 * Verglichen wird auf neun Stellen gerundet, damit (6+9+8)/3-Rundungsreste keinen Unterschied vortäuschen.
 */
export function tiedFlags(scores: number[]): boolean[] {
  const keys = scores.map((s) => Math.round(s * 1e9));
  return keys.map((key, i) => keys.some((other, j) => j !== i && other === key));
}
