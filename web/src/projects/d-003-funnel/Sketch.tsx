// Strichzeichnung für Projekt D-003: ein Trichter aus vier Stufen, aus dessen Seiten Tropfen fallen.
// Unten kommt nur ein schmaler Strahl an.
export default function Sketch() {
  return (
    <svg viewBox="0 0 200 110" fill="none" strokeWidth={1.5} strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <path d="M50 14H150L126 40H74Z" stroke="currentColor" />
      <path d="M74 40H126L114 62H86Z" stroke="currentColor" />
      <path d="M86 62H114L106 80H94Z" stroke="currentColor" />
      <path d="M94 80H106V98H94Z" stroke="currentColor" />
      <path d="M100 98V104" stroke="var(--farbe-sekundaer-tief)" />
      <path d="M38 34c-3 4-4 6-4 8a4 4 0 0 0 8 0c0-2-1-4-4-8z" stroke="var(--farbe-sekundaer-tief)" />
      <path d="M160 46c-2.5 3.5-3.5 5-3.5 7a3.5 3.5 0 0 0 7 0c0-2-1-3.5-3.5-7z" stroke="var(--farbe-sekundaer-tief)" />
      <path d="M66 62c-2 3-3 4.5-3 6a3 3 0 0 0 6 0c0-1.5-1-3-3-6z" stroke="var(--farbe-sekundaer-tief)" />
      <path d="M136 72c-1.5 2.5-2.5 3.5-2.5 5a2.5 2.5 0 0 0 5 0c0-1.5-1-2.5-2.5-5z" stroke="var(--farbe-sekundaer-tief)" />
    </svg>
  );
}
