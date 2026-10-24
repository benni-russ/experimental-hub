import { findProject } from '../projects';
import type { ReviewProjectLookup } from './reviewItems';

export const reviewLookup: ReviewProjectLookup = (id) => {
  const project = findProject(id);
  return project ? { title: project.meta.title, track: project.meta.track, cards: project.meta.cards } : undefined;
};
