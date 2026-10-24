import { createContext, useContext, type ReactNode } from 'react';
import { createPortal } from 'react-dom';

/**
 * Platz rechts neben einer Abschnittsüberschrift. undefined: kein Abschnitt
 * drumherum; null: der Platz ist noch nicht im DOM.
 */
export const SectionActionsTarget = createContext<HTMLElement | null | undefined>(undefined);

/** Bedienelemente in die Kopfzeile des umgebenden Abschnitts; ohne Abschnitt an Ort und Stelle. */
export function SectionActions({ children }: { children: ReactNode }) {
  const target = useContext(SectionActionsTarget);
  if (target === undefined) return <>{children}</>;
  return target ? createPortal(children, target) : null;
}
