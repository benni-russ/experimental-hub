// Aufklappbarer Baum eines geparsten JSON-Werts: Schlüssel, Wert und Typ als
// Etikett. Objekte und Arrays sind <details>, also ohne eigenes Skript mit
// Tastatur bedienbar (Enter oder Leertaste auf dem Kopf).

/** Typ-Etikett wie in der Spezifikation: string, number, boolean, null, array[n], object. */
export function typeLabel(value: unknown): string {
  if (value === null) return 'null';
  if (Array.isArray(value)) return `array[${value.length}]`;
  return typeof value;
}

const isContainer = (value: unknown): value is Record<string, unknown> | unknown[] =>
  typeof value === 'object' && value !== null;

function formatPrimitive(value: unknown): string {
  return typeof value === 'string' ? JSON.stringify(value) : String(value);
}

function Entry({ name, value, open = false }: { name: string; value: unknown; open?: boolean }) {
  const tag = <span className="json-type">{typeLabel(value)}</span>;
  if (!isContainer(value)) {
    return (
      <li className="json-leaf">
        <span className="json-key">{name}:</span> <code className="json-value">{formatPrimitive(value)}</code> {tag}
      </li>
    );
  }
  const entries = Object.entries(value);
  return (
    <li>
      <details className="json-branch" open={open}>
        <summary>
          <span className="json-key">{name}</span> {tag}
        </summary>
        {entries.length > 0 ? (
          <ul className="json-children">
            {entries.map(([k, v]) => (
              <Entry key={k} name={k} value={v} />
            ))}
          </ul>
        ) : (
          <p className="json-empty">leer</p>
        )}
      </details>
    </li>
  );
}

export function ObjectTree({ value, label = 'Wert' }: { value: unknown; label?: string }) {
  return (
    <ul className="json-tree" aria-label={`Objektbaum: ${label}`}>
      <Entry name={label} value={value} open />
    </ul>
  );
}
