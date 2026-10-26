// Strichzeichnung für Projekt D-001: eine Seite in der Mitte, links ein Auge, oben rechts ein Ohr,
// unten rechts eine Tastatur. Drei Blickwinkel auf dieselbe Seite.
export default function Sketch() {
  return (
    <svg viewBox="0 0 200 110" fill="none" strokeWidth={1.5} strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <rect x="72" y="12" width="56" height="86" rx="4" stroke="currentColor" />
      <path d="M80 24H120M80 34H108M80 70H120M80 80H102" stroke="currentColor" />
      <rect x="80" y="44" width="40" height="18" rx="2" stroke="var(--farbe-sekundaer-tief)" />
      <path d="M14 55C22 43 32 38 42 38C52 38 60 43 66 55C60 67 52 72 42 72C32 72 22 67 14 55Z" stroke="currentColor" />
      <circle cx="42" cy="55" r="7" stroke="currentColor" />
      <path d="M150 40C150 30 156 22 166 22C176 22 182 30 182 38C182 46 174 48 172 56C170 62 166 64 162 62" stroke="currentColor" />
      <path d="M160 40C160 34 163 31 167 31C171 31 173 34 173 38" stroke="currentColor" />
      <rect x="140" y="72" width="48" height="26" rx="3" stroke="currentColor" />
      <path d="M147 80H151M157 80H161M167 80H171M177 80H181M147 88H151M157 88H171M177 88H181" stroke="currentColor" />
    </svg>
  );
}
