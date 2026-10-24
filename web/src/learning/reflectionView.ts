export type ReflectionView = 'loading' | 'items' | 'error';

/**
 * Vorhandene Daten gehen vor: Scheitert nur ein Hintergrund-Refetch, bleiben die
 * Textfelder (und ungespeicherter Text) stehen. Fehleransicht nur ohne Daten.
 */
export function reflectionView(q: { hasData: boolean; isError: boolean }): ReflectionView {
  if (q.hasData) return 'items';
  return q.isError ? 'error' : 'loading';
}
