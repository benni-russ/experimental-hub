import { useId } from 'react';
import { SegmentedControl } from '../../design/components/SegmentedControl';
import { LEVEL_OPTIONS } from './format';

/** Niveau 90 / 95 / 99 % mit sichtbarem Label. */
export function LevelField({
  value,
  onChange,
  label = 'Niveau',
}: {
  value: number;
  onChange: (level: number) => void;
  label?: string;
}) {
  const labelId = useId();
  return (
    <div className="ci-field">
      <span id={labelId} className="ci-field-label">
        {label}
      </span>
      <SegmentedControl label={label} labelledBy={labelId} options={LEVEL_OPTIONS} value={value} onChange={onChange} />
    </div>
  );
}

/**
 * Warnkasten bei schwacher Näherung. Statisch, wo ein ruhiger Satz die Warnung schon ansagt;
 * `live` nur dort, wo es keine eigene Live-Ansage gibt (Unter der Haube).
 */
export function ApproximationWarning({ live = false }: { live?: boolean }) {
  return (
    <p className="ci-warning" role={live ? 'status' : undefined}>
      <strong>Hinweis:</strong> Bei so wenigen Käufen trägt die Näherung nicht; das Intervall ist hier unzuverlässig.
    </p>
  );
}
