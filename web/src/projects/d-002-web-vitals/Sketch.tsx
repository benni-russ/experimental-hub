// Strichzeichnung für Projekt D-002: eine Seite, deren Knopf nach unten rutscht, links eine Uhr.
// Ladezeit und Verrutschen auf einen Blick.
export default function Sketch() {
  return (
    <svg viewBox="0 0 200 110" fill="none" strokeWidth={1.5} strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <circle cx="40" cy="55" r="22" stroke="currentColor" />
      <path d="M40 41V55L50 61" stroke="currentColor" />
      <rect x="84" y="12" width="64" height="86" rx="4" stroke="currentColor" />
      <path d="M92 24H140M92 32H124" stroke="currentColor" />
      <rect x="92" y="40" width="48" height="22" rx="2" stroke="currentColor" />
      <rect x="92" y="70" width="30" height="10" rx="3" stroke="currentColor" strokeDasharray="3 3" />
      <rect x="92" y="82" width="30" height="10" rx="3" stroke="var(--farbe-sekundaer-tief)" />
      <path d="M160 66V86M155 81L160 86L165 81" stroke="var(--farbe-sekundaer-tief)" />
    </svg>
  );
}
