// Strichzeichnung für Versuch B-002: links ein Brief (Anfrage), rechts eine Antwort mit
// kurzer erster Zeile; in Gold der Pfeil dazwischen, wie der Weg zum Server und zurück.
export default function Sketch() {
  return (
    <svg viewBox="0 0 200 110" fill="none" strokeWidth={1.5} strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <rect x="10" y="26" width="64" height="58" rx="3" stroke="currentColor" />
      <path d="M18 38H44M18 50H66M18 60H58M18 70H62" stroke="currentColor" />
      <path d="M84 48H116M106 38L116 48L106 58" stroke="var(--farbe-sekundaer-tief)" />
      <path d="M116 68H84M94 58L84 68L94 78" stroke="var(--farbe-sekundaer-tief)" />
      <rect x="126" y="26" width="64" height="58" rx="3" stroke="currentColor" />
      <path d="M134 38H158" stroke="currentColor" strokeWidth={3} />
      <path d="M134 50H182M134 60H174M134 70H178" stroke="currentColor" />
    </svg>
  );
}
