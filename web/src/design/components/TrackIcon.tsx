import type { TrackId } from '@hub/shared';

// Strichzeichen je Track, eine Linienstärke für alle. Tracks unterscheiden
// sich über Zeichen und Label, nie über Farbe.
const PATHS: Record<TrackId, string> = {
  experimentation: 'M4 20V11M10 20V5M16 20v-6M21 20H3',
  web: 'M8 7l-5 5 5 5M16 7l5 5-5 5M14 4l-4 16',
  personalization: 'M12 12a4 4 0 1 0 0-8 4 4 0 0 0 0 8zM4 21c0-4.4 3.6-7 8-7s8 2.6 8 7',
  experience: 'M4 4h16a1 1 0 0 1 1 1v11a1 1 0 0 1-1 1H4a1 1 0 0 1-1-1V5a1 1 0 0 1 1-1zM8 21h8M12 17v4',
  ai: 'M12 3v3M12 18v3M3 12h3M18 12h3M8 8h8v8H8zM5.6 5.6l2 2M16.4 16.4l2 2M5.6 18.4l2-2M16.4 7.6l2-2',
};

export function TrackIcon({ track, size = 20 }: { track: TrackId; size?: number }) {
  return (
    <svg
      className="track-icon"
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth={1.5}
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
    >
      <path d={PATHS[track]} />
    </svg>
  );
}
