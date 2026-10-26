/** Eine Zeile der Tabelle: JS-Wert, hin zu JSON-Text und wieder zurück. */
export interface RoundTripRow {
  label: string;
  /** der JavaScript-Ausdruck, wie er im Code stünde */
  source: string;
  value: () => unknown;
}

export const ROWS: RoundTripRow[] = [
  { label: 'undefined', source: 'undefined', value: () => undefined },
  { label: 'undefined im Objekt', source: '{ a: undefined }', value: () => ({ a: undefined }) },
  { label: 'undefined im Array', source: '[undefined]', value: () => [undefined] },
  { label: 'Funktion im Objekt', source: '{ a: 1, f: () => 1 }', value: () => ({ a: 1, f: () => 1 }) },
  { label: 'Date', source: 'new Date(Date.UTC(2026, 9, 26))', value: () => new Date(Date.UTC(2026, 9, 26)) },
  { label: 'NaN', source: 'NaN', value: () => NaN },
  { label: 'Infinity', source: 'Infinity', value: () => Infinity },
  { label: 'Map', source: "new Map([['a', 1]])", value: () => new Map([['a', 1]]) },
  {
    label: 'verschachteltes Objekt',
    source: "{ a: { b: [1, 'x', null, true] } }",
    value: () => ({ a: { b: [1, 'x', null, true] } }),
  },
  { label: 'Zahl mit vielen Stellen', source: '0.1 + 0.2', value: () => 0.1 + 0.2 },
];

/** Hin und zurück: JSON.stringify, dann JSON.parse. Ohne Text (undefined) gibt es kein Zurück. */
export function roundTrip(value: unknown): { json: string | undefined; back: unknown } {
  const json = JSON.stringify(value) as string | undefined;
  return { json, back: json === undefined ? undefined : JSON.parse(json) };
}

/** Texte, die als JavaScript-Objekt gültig wären, als JSON aber nicht. */
export const FORBIDDEN: { label: string; text: string }[] = [
  { label: 'Kommentar', text: '{ "a": 1 // Kommentar\n}' },
  { label: 'Komma am Ende', text: '{ "a": 1, }' },
  { label: 'Einfache Anführungszeichen', text: "{ 'a': 1 }" },
  { label: 'Schlüssel ohne Anführungszeichen', text: '{ a: 1 }' },
];

/** Die echte Fehlermeldung von JSON.parse für diesen Text (Wortlaut je nach Browser). */
export function parseError(text: string): string {
  try {
    JSON.parse(text);
  } catch (err) {
    return (err as Error).message;
  }
  return 'kein Fehler';
}
