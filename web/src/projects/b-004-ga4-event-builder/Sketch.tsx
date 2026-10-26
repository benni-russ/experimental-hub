// Strichzeichnung für Versuch B-004: ein Objekt in geschweiften Klammern mit
// vier Feldzeilen; eine davon ist in Gold unterstrichen und mit einem Pfeil
// markiert, so wie der Prüfer die fehlerhafte Stelle zeigt.
export default function Sketch() {
  return (
    <svg viewBox="0 0 200 110" fill="none" strokeWidth={1.5} strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <path d="M58 18C50 18 50 22 50 30V48C50 52 47 55 43 55C47 55 50 58 50 62V80C50 88 50 92 58 92" stroke="currentColor" />
      <path d="M142 18C150 18 150 22 150 30V48C150 52 153 55 157 55C153 55 150 58 150 62V80C150 88 150 92 142 92" stroke="currentColor" />
      <path d="M64 32H96M104 32H128" stroke="currentColor" />
      <path d="M64 47H90M98 47H120" stroke="currentColor" />
      <path d="M64 62H94M102 62H124" stroke="currentColor" />
      <path d="M64 77H88M96 77H130" stroke="currentColor" />
      <path d="M100 68H126" stroke="var(--farbe-sekundaer-tief)" strokeWidth={2.5} />
      <path d="M186 62H166M172 56L166 62L172 68" stroke="var(--farbe-sekundaer-tief)" />
    </svg>
  );
}
