// Strichzeichnung für Versuch B-001: links Zeilen Rohtext, in Gold der Pfeil
// (JSON.parse), rechts geschweifte Klammern um das fertige Objekt.
export default function Sketch() {
  return (
    <svg viewBox="0 0 200 110" fill="none" strokeWidth={1.5} strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <path d="M12 38H62M12 55H52M12 72H58" stroke="currentColor" />
      <path d="M76 55H118M108 45L118 55L108 65" stroke="var(--farbe-sekundaer-tief)" />
      <path
        d="M144 20C137 20 136 24 136 31V45C136 51 133 55 128 55C133 55 136 59 136 65V79C136 86 137 90 144 90"
        stroke="currentColor"
      />
      <path
        d="M178 20C185 20 186 24 186 31V45C186 51 189 55 194 55C189 55 186 59 186 65V79C186 86 185 90 178 90"
        stroke="currentColor"
      />
      <path d="M148 42H170M148 55H164M148 68H174" stroke="currentColor" />
    </svg>
  );
}
