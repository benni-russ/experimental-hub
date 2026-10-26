// Formatiertes JSON Zeile für Zeile, jede Zeile mit ihrem Pfad im Event
// (Schreibweise wie in validateEvent: ecommerce.items[1].price). So kann die
// Demo die Zeile zu einem Issue markieren.

export interface JsonLine {
  text: string;
  /** Pfad des Werts, der in dieser Zeile beginnt oder endet; '' für das Ganze */
  path: string;
}

const INDENT = '  ';

const childPath = (parent: string, key: string | number) =>
  typeof key === 'number' ? `${parent}[${key}]` : parent === '' ? key : `${parent}.${key}`;

function walk(value: unknown, path: string, depth: number, prefix: string, comma: string, out: JsonLine[]): void {
  const pad = INDENT.repeat(depth);
  const isArray = Array.isArray(value);
  if (typeof value === 'object' && value !== null) {
    const entries: [string | number, unknown][] = isArray
      ? value.map((v, i): [number, unknown] => [i, v])
      : Object.entries(value).filter(([, v]) => v !== undefined && typeof v !== 'function');
    const [open, close] = isArray ? ['[', ']'] : ['{', '}'];
    if (entries.length === 0) {
      out.push({ text: `${pad}${prefix}${open}${close}${comma}`, path });
      return;
    }
    out.push({ text: `${pad}${prefix}${open}`, path });
    entries.forEach(([key, v], i) => {
      const keyText = typeof key === 'number' ? '' : `${JSON.stringify(key)}: `;
      walk(v, childPath(path, key), depth + 1, keyText, i < entries.length - 1 ? ',' : '', out);
    });
    out.push({ text: `${pad}${close}${comma}`, path });
    return;
  }
  out.push({ text: `${pad}${prefix}${JSON.stringify(value) ?? 'null'}${comma}`, path });
}

export function jsonLines(value: unknown): JsonLine[] {
  const out: JsonLine[] = [];
  walk(value, '', 0, '', '', out);
  return out;
}

/** Erste Zeile zum Pfad; fehlt er, die des nächsten vorhandenen Elternteils, zuletzt Zeile 0. */
export function findLine(lines: JsonLine[], path: string): number {
  let current = path;
  for (;;) {
    const index = lines.findIndex((l) => l.path === current);
    if (index >= 0) return index;
    if (current === '') return 0;
    current = parentPath(current);
  }
}

/** ecommerce.items[1].price → ecommerce.items[1] → ecommerce.items → ecommerce → '' */
function parentPath(path: string): string {
  const match = /^(.+)(\.[^.[\]]+|\[\d+\])$/.exec(path);
  return match ? match[1]! : '';
}
