// Strichzeichnung für Versuch 006: viele Intervalle untereinander um die
// senkrechte Wahrheitslinie in Gold, eines hohl und abseits (verfehlt).
export default function Sketch() {
  return (
    <svg viewBox="0 0 200 110" fill="none" strokeWidth={1.5} strokeLinecap="round" aria-hidden="true">
      <path d="M100 8V102" stroke="var(--farbe-sekundaer-tief)" />
      <path d="M78 18H116M86 32H126M70 46H108M92 60H132M82 74H118M96 88H134" stroke="currentColor" />
      <path d="M142 102H176" stroke="currentColor" strokeDasharray="3 4" />
    </svg>
  );
}
