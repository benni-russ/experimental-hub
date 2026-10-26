import { parser } from '@lezer/javascript';

/**
 * Zeile (1-basiert) des ersten Syntaxfehlers im Nutzercode oder null.
 * Der Code ist ein Funktionsrumpf (darf `return` enthalten), daher wird er
 * für den Parser in eine Funktion gewickelt; die Wrapper-Zeile zählt nicht.
 */
export function findSyntaxErrorLine(code: string): number | null {
  const source = `function __t(){\n${code}\n}`;
  let from: number | null = null;
  parser.parse(source).iterate({
    enter(node) {
      if (from !== null) return false;
      if (node.type.isError) {
        from = node.from;
        // Leerer Fehlerknoten (etwas fehlt): Fehler gehört ans Ende des letzten Tokens davor.
        if (node.from === node.to) {
          while (from > 0 && /\s/.test(source.charAt(from - 1))) from -= 1;
          from = Math.max(0, from - 1);
        }
        return false;
      }
      return undefined;
    },
  });
  if (from === null) return null;
  const line = source.slice(0, from).split('\n').length - 1; // Wrapper-Zeile abziehen
  return Math.max(1, Math.min(line, code.split('\n').length));
}
