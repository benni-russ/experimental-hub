// Strichzeichnung für Versuch 001: zwei überlappende Verteilungen, die
// verschobene in Gold (Veränderung), dazwischen der kleinste erkennbare Abstand.
export default function Sketch() {
  return (
    <svg viewBox="0 0 200 110" fill="none" strokeWidth={1.5} strokeLinecap="round" aria-hidden="true">
      <path d="M6 96H194" stroke="currentColor" />
      <path d="M16 96C40 96 56 14 88 14S136 96 160 96" stroke="currentColor" />
      <path d="M44 96C68 96 84 26 116 26S164 96 188 96" stroke="var(--farbe-sekundaer-tief)" />
      <path d="M88 96V16M116 96V28" stroke="currentColor" strokeDasharray="3 4" />
    </svg>
  );
}
