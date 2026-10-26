// Versuchsmarke: jedes Projekt ist ein nummerierter Versuch.
export function ExperimentMark({ id, unit = false, small = false }: { id: string; unit?: boolean; small?: boolean }) {
  const word = unit ? 'Einheit' : 'Versuch';
  return (
    <span
      className={`mark${small ? ' mark-small' : ''}${id.length > 5 ? ' mark-long' : ''}`}
      aria-label={`${word} ${id}`}
      role="img"
    >
      {small ? null : <span className="mark-word">{word}</span>}
      <span className="mark-id">{id}</span>
    </span>
  );
}
