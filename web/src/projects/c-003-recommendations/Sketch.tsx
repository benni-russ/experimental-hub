// Strichzeichnung für Projekt C-003: drei Linien (die Signale) laufen in eine Rangliste mit drei Plätzen.
export default function Sketch() {
  return (
    <svg viewBox="0 0 200 110" fill="none" strokeWidth={1.5} strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <path d="M12 24H56C76 24 80 40 98 40" stroke="currentColor" />
      <path d="M12 55H98" stroke="currentColor" strokeDasharray="5 4" />
      <path d="M12 86H56C76 86 80 70 98 70" stroke="currentColor" strokeDasharray="1.5 4" />
      <path d="M92 35L100 40L92 45M92 50L100 55L92 60M92 65L100 70L92 75" stroke="currentColor" />
      <rect x="108" y="14" width="80" height="82" rx="4" stroke="currentColor" />
      <rect x="116" y="22" width="64" height="16" rx="2" stroke="var(--farbe-sekundaer-tief)" />
      <rect x="116" y="46" width="52" height="16" rx="2" stroke="currentColor" />
      <rect x="116" y="70" width="40" height="16" rx="2" stroke="currentColor" />
    </svg>
  );
}
