// Strichzeichnung für Projekt C-001: ein Besucher läuft von links in eine Weiche
// mit drei Abzweigen zu drei Erlebnissen; der gestrichelte Zweig in Gold ist der,
// der nie gewählt wird.
export default function Sketch() {
  return (
    <svg viewBox="0 0 200 110" fill="none" strokeWidth={1.5} strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <circle cx="20" cy="55" r="5" stroke="currentColor" />
      <path d="M25 55H70M70 55L100 24H150M70 55H150" stroke="currentColor" />
      <path d="M70 55L100 86H150" stroke="var(--farbe-sekundaer-tief)" strokeDasharray="5 4" />
      <rect x="150" y="14" width="36" height="20" rx="3" stroke="currentColor" />
      <rect x="150" y="45" width="36" height="20" rx="3" stroke="currentColor" />
      <rect x="150" y="76" width="36" height="20" rx="3" stroke="var(--farbe-sekundaer-tief)" />
    </svg>
  );
}
