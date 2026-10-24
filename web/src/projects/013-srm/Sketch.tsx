// Strichzeichnung für Versuch 013: zwei Balken enden ungleich hoch, die
// gestrichelte Soll-Linie in Gold zeigt, wo beide hätten enden sollen.
export default function Sketch() {
  return (
    <svg viewBox="0 0 200 110" fill="none" strokeWidth={1.5} strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <path d="M12 96H188" stroke="currentColor" />
      <path d="M48 96V26H88V96M112 96V46H152V96" stroke="currentColor" />
      <path d="M30 36H170" stroke="var(--farbe-sekundaer-tief)" strokeDasharray="5 4" />
    </svg>
  );
}
