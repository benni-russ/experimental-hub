import type { ReactNode, Ref } from 'react';
import { Button } from './Button';
import { Icon } from './Icon';

interface FlipCardProps {
  front: ReactNode;
  back: ReactNode;
  flipped: boolean;
  /** Mit Handler erscheint unter der Karte ein Knopf zum Umdrehen. */
  onFlip?: () => void;
  /** Kleine gedämpfte Zeile über der Vorderseite, etwa der Projekttitel. */
  label?: string;
  backRef?: Ref<HTMLDivElement>;
}

export function FlipCard({ front, back, flipped, onFlip, label, backRef }: FlipCardProps) {
  return (
    <div className="flip-card">
      <div className={`flip-card-inner${flipped ? ' is-flipped' : ''}`}>
        <div
          className={`flip-card-face flip-card-front${flipped ? ' is-hidden' : ''}`}
          aria-hidden={flipped ? 'true' : undefined}
          inert={flipped}
        >
          {label ? <p className="flip-card-label">{label}</p> : null}
          {front}
        </div>
        <div
          className={`flip-card-face flip-card-back${flipped ? '' : ' is-hidden'}`}
          aria-hidden={flipped ? undefined : 'true'}
          inert={!flipped}
          ref={backRef}
          tabIndex={-1}
        >
          <div className="flip-card-recall" aria-hidden="true">
            {front}
          </div>
          {back}
        </div>
      </div>
      {onFlip ? (
        <Button variant="secondary" className="flip-card-button" onClick={onFlip}>
          <Icon name="retry" /> {flipped ? 'Zur Vorderseite' : 'Karte umdrehen'}
        </Button>
      ) : null}
    </div>
  );
}
