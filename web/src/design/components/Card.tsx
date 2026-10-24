import type { ElementType, ReactNode } from 'react';

export function Card({ children, as: Tag = 'div' }: { children: ReactNode; as?: ElementType }) {
  return <Tag className="card">{children}</Tag>;
}
