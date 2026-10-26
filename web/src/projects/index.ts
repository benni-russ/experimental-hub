import { lazy, type ComponentType, type LazyExoticComponent } from 'react';
import type { ContentMeta, TrackId } from '@hub/shared';
import { meta as sampleMeta } from './000-sample/content';
import { meta as sampleUnitMeta } from './000-sample-unit/content';
import { meta as mdeMeta } from './a-001-mde/content';
import MdeSketch from './a-001-mde/Sketch';
import { meta as prioritizationMeta } from './a-001.1-prioritization/content';
import { meta as confidenceIntervalMeta } from './a-002-confidence-interval/content';
import ConfidenceIntervalSketch from './a-002-confidence-interval/Sketch';
import { meta as randomnessMeta } from './a-002.1-randomness/content';
import { meta as bayesMeta } from './a-002.2-bayes/content';
import { meta as significantMeta } from './a-002.3-significant-relevant/content';
import { meta as srmMeta } from './a-003-srm/content';
import SrmSketch from './a-003-srm/Sketch';
import { meta as simpsonMeta } from './a-004-simpson/content';
import SimpsonSketch from './a-004-simpson/Sketch';
import { meta as jsonApiMeta } from './b-001-json-api/content';
import JsonApiSketch from './b-001-json-api/Sketch';
import { meta as jsonVsObjectsMeta } from './b-001.1-json-vs-objects/content';
import { meta as httpRequestsMeta } from './b-002-http-requests/content';
import HttpRequestsSketch from './b-002-http-requests/Sketch';
import { meta as eventLoopMeta } from './b-003-event-loop/content';
import EventLoopSketch from './b-003-event-loop/Sketch';
import { meta as ga4EventBuilderMeta } from './b-004-ga4-event-builder/content';
import Ga4EventBuilderSketch from './b-004-ga4-event-builder/Sketch';
import { meta as purchaseVsCartMeta } from './b-004.1-purchase-vs-cart/content';
import { meta as dataQualityMeta } from './b-004.2-data-quality/content';
import { meta as reactRebuildMeta } from './b-005-react-rebuild/content';
import ReactRebuildSketch from './b-005-react-rebuild/Sketch';
import { meta as testingPlaygroundMeta } from './b-006-testing-playground/content';
import TestingPlaygroundSketch from './b-006-testing-playground/Sketch';
import { meta as ruleBuilderMeta } from './c-001-rule-builder/content';
import RuleBuilderSketch from './c-001-rule-builder/Sketch';
import { meta as segmentationMeta } from './c-001.1-segmentation/content';
import { meta as feedInspectorMeta } from './c-002-feed-inspector/content';
import FeedInspectorSketch from './c-002-feed-inspector/Sketch';
import { meta as recommendationsMeta } from './c-003-recommendations/content';
import RecommendationsSketch from './c-003-recommendations/Sketch';
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
    Demo: lazy(() => import('./a-001-mde/Demo')),
    UnderTheHood: lazy(() => import('./a-001-mde/UnderTheHood')),
  },
  { meta: prioritizationMeta, UnderTheHood: lazy(() => import('./a-001.1-prioritization/Explanation')) },
  {
    meta: confidenceIntervalMeta,
    Sketch: ConfidenceIntervalSketch,
    Demo: lazy(() => import('./a-002-confidence-interval/Demo')),
    UnderTheHood: lazy(() => import('./a-002-confidence-interval/UnderTheHood')),
  },
  { meta: randomnessMeta, UnderTheHood: lazy(() => import('./a-002.1-randomness/Explanation')) },
  { meta: bayesMeta, UnderTheHood: lazy(() => import('./a-002.2-bayes/Explanation')) },
  { meta: significantMeta, UnderTheHood: lazy(() => import('./a-002.3-significant-relevant/Explanation')) },
  {
    meta: srmMeta,
    Sketch: SrmSketch,
    Demo: lazy(() => import('./a-003-srm/Demo')),
    UnderTheHood: lazy(() => import('./a-003-srm/UnderTheHood')),
  },
  {
    meta: simpsonMeta,
    Sketch: SimpsonSketch,
    Demo: lazy(() => import('./a-004-simpson/Demo')),
    UnderTheHood: lazy(() => import('./a-004-simpson/UnderTheHood')),
  },
  {
    meta: jsonApiMeta,
    Sketch: JsonApiSketch,
    Demo: lazy(() => import('./b-001-json-api/Demo')),
    UnderTheHood: lazy(() => import('./b-001-json-api/UnderTheHood')),
  },
  { meta: jsonVsObjectsMeta, UnderTheHood: lazy(() => import('./b-001.1-json-vs-objects/Explanation')) },
  {
    meta: httpRequestsMeta,
    Sketch: HttpRequestsSketch,
    Demo: lazy(() => import('./b-002-http-requests/Demo')),
    UnderTheHood: lazy(() => import('./b-002-http-requests/UnderTheHood')),
  },
  {
    meta: eventLoopMeta,
    Sketch: EventLoopSketch,
    Demo: lazy(() => import('./b-003-event-loop/Demo')),
    UnderTheHood: lazy(() => import('./b-003-event-loop/UnderTheHood')),
  },
  {
    meta: ga4EventBuilderMeta,
    Sketch: Ga4EventBuilderSketch,
    Demo: lazy(() => import('./b-004-ga4-event-builder/Demo')),
    UnderTheHood: lazy(() => import('./b-004-ga4-event-builder/UnderTheHood')),
  },
  { meta: purchaseVsCartMeta, UnderTheHood: lazy(() => import('./b-004.1-purchase-vs-cart/Explanation')) },
  { meta: dataQualityMeta, UnderTheHood: lazy(() => import('./b-004.2-data-quality/Explanation')) },
  {
    meta: reactRebuildMeta,
    Sketch: ReactRebuildSketch,
    Demo: lazy(() => import('./b-005-react-rebuild/Demo')),
    UnderTheHood: lazy(() => import('./b-005-react-rebuild/UnderTheHood')),
  },
  {
    meta: testingPlaygroundMeta,
    Sketch: TestingPlaygroundSketch,
    Demo: lazy(() => import('./b-006-testing-playground/Demo')),
    UnderTheHood: lazy(() => import('./b-006-testing-playground/UnderTheHood')),
  },
  {
    meta: ruleBuilderMeta,
    Sketch: RuleBuilderSketch,
    Demo: lazy(() => import('./c-001-rule-builder/Demo')),
    UnderTheHood: lazy(() => import('./c-001-rule-builder/UnderTheHood')),
  },
  { meta: segmentationMeta, UnderTheHood: lazy(() => import('./c-001.1-segmentation/Explanation')) },
  {
    meta: feedInspectorMeta,
    Sketch: FeedInspectorSketch,
    Demo: lazy(() => import('./c-002-feed-inspector/Demo')),
    UnderTheHood: lazy(() => import('./c-002-feed-inspector/UnderTheHood')),
  },
  {
    meta: recommendationsMeta,
    Sketch: RecommendationsSketch,
    Demo: lazy(() => import('./c-003-recommendations/Demo')),
    UnderTheHood: lazy(() => import('./c-003-recommendations/UnderTheHood')),
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

/**
 * IDs bis Oktober 2026, als noch global gezählt wurde. Nur noch für die
 * Weiterleitung alter Links; die gespeicherten Lernstände stellt die
 * Migration 002_track_ids.sql um.
 */
export const LEGACY_IDS: Record<string, string> = {
  '001': 'A-001',
  '026': 'A-001.1',
  '006': 'A-002',
  '002': 'A-002.1',
  '009': 'A-002.2',
  '031': 'A-002.3',
  '013': 'A-003',
  '004': 'A-004',
};

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
