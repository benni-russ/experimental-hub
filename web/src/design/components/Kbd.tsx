import type { ReactNode } from 'react';

// Eine Taste als Taste: feiner Rahmen, unten ein Schattenrand.
export function Kbd({ children }: { children: ReactNode }) {
  return <kbd className="kbd">{children}</kbd>;
}
