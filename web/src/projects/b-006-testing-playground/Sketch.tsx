// Strichzeichnung für Versuch B-006: ein kleines Raster (Tests × Fassungen),
// links die Testzeilen als Striche, in den Zellen Häkchen für „bestanden“;
// das goldene Kreuz steht für den Test, der einen eingebauten Fehler erwischt.
export default function Sketch() {
  return (
    <svg viewBox="0 0 200 110" fill="none" strokeWidth={1.5} strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <path d="M14 30H54M14 55H48M14 80H52" stroke="currentColor" />
      <rect x="66" y="18" width="120" height="75" rx="3" stroke="currentColor" />
      <path d="M66 43H186M66 68H186M96 18V93M126 18V93M156 18V93" stroke="currentColor" />
      <path d="M75 30L80 35L88 26" stroke="currentColor" />
      <path d="M105 56L110 61L118 52" stroke="currentColor" />
      <path d="M134 50L148 62M148 50L134 62" stroke="var(--farbe-sekundaer-tief)" strokeWidth={2.5} />
      <path d="M165 76L170 81L178 72" stroke="currentColor" />
    </svg>
  );
}
