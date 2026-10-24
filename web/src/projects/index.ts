import { lazy, type ComponentType, type LazyExoticComponent } from 'react';
import type { ContentMeta, TrackId } from '@hub/shared';
import { meta as sampleMeta } from './000-sample/content';
import { meta as sampleUnitMeta } from './000-sample-unit/content';
import { meta as mdeMeta } from './001-mde/content';
import MdeSketch from './001-mde/Sketch';
import { meta as prioritizationMeta } from './026-prioritization/content';
import { meta as confidenceIntervalMeta } from './006-confidence-interval/content';
import ConfidenceIntervalSketch from './006-confidence-interval/Sketch';
import { meta as randomnessMeta } from './002-randomness/content';
import { meta as bayesMeta } from './009-bayes/content';
import { meta as significantMeta } from './031-significant-relevant/content';
import { meta as srmMeta } from './013-srm/content';
import SrmSketch from './013-srm/Sketch';
import { meta as simpsonMeta } from './004-simpson/content';
import SimpsonSketch from './004-simpson/Sketch';
import SampleSketch from './000-sample/Sketch';

export interface ProjectModule {
  meta: ContentMeta;
  Demo?: LazyExoticComponent<ComponentType>;
  UnderTheHood?: LazyExoticComponent<ComponentType>;
  /** kleine Strichzeichnung für Karten und Kopf, nicht lazy */
  Sketch?: ComponentType;
}

// Reihenfolge = Reihenfolge der Registrierung. 000-* nur in der Entwicklung.
export const projects: ProjectModule[] = [
  {
    meta: mdeMeta,
    Sketch: MdeSketch,
    Demo: lazy(() => import('./001-mde/Demo')),
    UnderTheHood: lazy(() => import('./001-mde/UnderTheHood')),
  },
  { meta: prioritizationMeta, UnderTheHood: lazy(() => import('./026-prioritization/Explanation')) },
  {
    meta: confidenceIntervalMeta,
    Sketch: ConfidenceIntervalSketch,
    Demo: lazy(() => import('./006-confidence-interval/Demo')),
    UnderTheHood: lazy(() => import('./006-confidence-interval/UnderTheHood')),
  },
  { meta: randomnessMeta, UnderTheHood: lazy(() => import('./002-randomness/Explanation')) },
  { meta: bayesMeta, UnderTheHood: lazy(() => import('./009-bayes/Explanation')) },
  { meta: significantMeta, UnderTheHood: lazy(() => import('./031-significant-relevant/Explanation')) },
  {
    meta: srmMeta,
    Sketch: SrmSketch,
    Demo: lazy(() => import('./013-srm/Demo')),
    UnderTheHood: lazy(() => import('./013-srm/UnderTheHood')),
  },
  {
    meta: simpsonMeta,
    Sketch: SimpsonSketch,
    Demo: lazy(() => import('./004-simpson/Demo')),
    UnderTheHood: lazy(() => import('./004-simpson/UnderTheHood')),
  },
];

if (import.meta.env.DEV) {
  projects.push(
    {
      meta: sampleMeta,
      Sketch: SampleSketch,
      Demo: lazy(() => import('./000-sample/Demo')),
      UnderTheHood: lazy(() => import('./000-sample/UnderTheHood')),
    },
    { meta: sampleUnitMeta },
  );
}

export function findProject(id: string): ProjectModule | undefined {
  return projects.find((p) => p.meta.id === id);
}

export function projectsByTrack(): Map<TrackId, ProjectModule[]> {
  const result = new Map<TrackId, ProjectModule[]>();
  for (const p of projects) {
    const list = result.get(p.meta.track) ?? [];
    list.push(p);
    result.set(p.meta.track, list);
  }
  return result;
}
