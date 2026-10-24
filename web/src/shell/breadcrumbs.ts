import type { ContentMeta } from '@hub/shared';
import { HOME, PATH } from './nav';

/** Ein Glied der Brotkrumen; ohne `to` ist es die aktuelle Seite. */
export interface Crumb {
  label: string;
  to?: string;
}

type Page = { kind: 'project'; meta: ContentMeta; parent?: ContentMeta } | { kind: 'page'; label: string };

const projectLabel = (meta: ContentMeta) => `${meta.id} ${meta.title}`;

/** Der Weg von „Heute“ bis zur aktuellen Seite. Die Startseite hat keine Brotkrumen. */
export function breadcrumbFor(page: Page): Crumb[] {
  const home: Crumb = { label: HOME.label, to: HOME.to };
  if (page.kind === 'page') {
    return [home, { label: page.label }];
  }
  const crumbs: Crumb[] = [home, { label: PATH.label, to: PATH.to }];
  if (page.parent) crumbs.push({ label: projectLabel(page.parent), to: `/projekt/${page.parent.id}` });
  crumbs.push({ label: projectLabel(page.meta) });
  return crumbs;
}
