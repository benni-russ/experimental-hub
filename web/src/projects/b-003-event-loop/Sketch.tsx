// Strichzeichnung für Versuch B-003: links der Call Stack als Stapel, in Gold
// die Schleife der Event Loop, rechts zwei Warteschlangen, die kurze oben.
export default function Sketch() {
  return (
    <svg viewBox="0 0 200 110" fill="none" strokeWidth={1.5} strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <rect x="14" y="66" width="50" height="16" rx="2" stroke="currentColor" />
      <rect x="14" y="46" width="50" height="16" rx="2" stroke="currentColor" />
      <rect x="14" y="26" width="50" height="16" rx="2" stroke="currentColor" />
      <path d="M104 32A22 22 0 1 1 82 54" stroke="var(--farbe-sekundaer-tief)" />
      <path d="M76 60L82 54L88 60" stroke="var(--farbe-sekundaer-tief)" />
      <rect x="140" y="30" width="12" height="12" rx="2" stroke="currentColor" />
      <rect x="158" y="30" width="12" height="12" rx="2" stroke="currentColor" />
      <rect x="140" y="64" width="12" height="12" rx="2" stroke="currentColor" />
      <rect x="158" y="64" width="12" height="12" rx="2" stroke="currentColor" />
      <rect x="176" y="64" width="12" height="12" rx="2" stroke="currentColor" />
    </svg>
  );
}
