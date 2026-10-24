// Strichzeichnung für das Testprojekt: ein Regler mit Ausschlag.
export default function Sketch() {
  return (
    <svg viewBox="0 0 200 110" fill="none" strokeWidth={1.5} strokeLinecap="round" aria-hidden="true">
      <path d="M20 70H180" stroke="currentColor" />
      <circle cx="120" cy="70" r="9" stroke="var(--farbe-sekundaer-tief)" />
      <path d="M20 40l30-18 30 26 30-14 30 10 40-20" stroke="currentColor" />
    </svg>
  );
}
