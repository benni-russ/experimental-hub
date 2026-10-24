import type { ProjectStatus } from '../../projects/status';

// Ein Punkt je Projekt: voll = durchgearbeitet, halb = begonnen, leer = offen.
// Die Zahl daneben steht immer als Text; die Punkte sind nur das Bild dazu.
export function ProgressDots({ statuses }: { statuses: ProjectStatus[] }) {
  return (
    <span className="dots" aria-hidden="true">
      {statuses.map((s, i) => (
        <span key={i} className={`dot dot-${s}`} />
      ))}
    </span>
  );
}
