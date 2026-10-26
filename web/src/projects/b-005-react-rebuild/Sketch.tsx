// Strichzeichnung für Versuch B-005: links eine Seite, auf die drei Pfeile von
// außen zielen (Schreibzugriffe von Hand), rechts ein Kreis für den Zustand,
// aus dem ein einziger goldener Pfeil die Seite berechnet.
export default function Sketch() {
  return (
    <svg viewBox="0 0 200 110" fill="none" strokeWidth={1.5} strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <rect x="40" y="22" width="44" height="66" rx="3" stroke="currentColor" />
      <path d="M48 36H76M48 50H70M48 64H74M48 78H64" stroke="currentColor" />
      <path d="M14 30L34 38M30 33L34 38L28 40" stroke="currentColor" />
      <path d="M12 55H34M29 51L34 55L29 59" stroke="currentColor" />
      <path d="M14 80L34 72M28 70L34 72L30 77" stroke="currentColor" />
      <circle cx="122" cy="55" r="12" stroke="currentColor" />
      <path d="M134 55H150M145 50L150 55L145 60" stroke="var(--farbe-sekundaer-tief)" strokeWidth={2.5} />
      <rect x="154" y="22" width="36" height="66" rx="3" stroke="currentColor" />
      <path d="M161 36H183M161 50H178M161 64H181M161 78H172" stroke="currentColor" />
    </svg>
  );
}
