import type { ComponentType } from 'react';
import type { TrackId } from '@hub/shared';
import { TrackIcon } from './TrackIcon';

// Bild des Versuchs; ohne eigene Zeichnung steht das Track-Zeichen groß da.
export function ProjectSketch({ Sketch, track }: { Sketch?: ComponentType; track: TrackId }) {
  return (
    <span className={`sketch${Sketch ? '' : ' sketch-fallback'}`}>
      {Sketch ? <Sketch /> : <TrackIcon track={track} size={40} />}
    </span>
  );
}
