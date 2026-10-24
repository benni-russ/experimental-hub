// Strichzeichnung für Versuch 004: zwei kurze steigende Linien (die Segmente)
// und eine lange fallende in Gold (das Gesamtbild).
export default function Sketch() {
  return (
    <svg viewBox="0 0 200 110" fill="none" strokeWidth={1.5} strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <path d="M12 96H188" stroke="currentColor" />
      <path d="M22 80L74 62M22 52L74 34" stroke="currentColor" />
      <path d="M92 24L180 84" stroke="var(--farbe-sekundaer-tief)" />
    </svg>
  );
}
