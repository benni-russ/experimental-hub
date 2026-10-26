// Strichzeichnung für Projekt C-002: eine Liste mit vier Einträgen, der dritte ist durchgestrichen
// und trägt in Gold die Marke des aussortierten Eintrags.
export default function Sketch() {
  return (
    <svg viewBox="0 0 200 110" fill="none" strokeWidth={1.5} strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <rect x="40" y="10" width="120" height="90" rx="4" stroke="currentColor" />
      <rect x="52" y="22" width="14" height="14" rx="2" stroke="currentColor" />
      <path d="M74 29H146" stroke="currentColor" />
      <rect x="52" y="42" width="14" height="14" rx="2" stroke="currentColor" />
      <path d="M74 49H134" stroke="currentColor" />
      <rect x="52" y="62" width="14" height="14" rx="2" stroke="var(--farbe-sekundaer-tief)" />
      <path d="M74 69H146" stroke="var(--farbe-sekundaer-tief)" strokeDasharray="5 4" />
      <path d="M48 69H154" stroke="var(--farbe-sekundaer-tief)" />
      <rect x="52" y="82" width="14" height="14" rx="2" stroke="currentColor" />
      <path d="M74 89H140" stroke="currentColor" />
    </svg>
  );
}
