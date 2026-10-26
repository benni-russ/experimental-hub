import { describe, expect, it } from 'vitest';
import { findSyntaxErrorLine } from './syntaxLine';

describe('findSyntaxErrorLine', () => {
  it('gibt für gültigen Code null zurück', () => {
    expect(findSyntaxErrorLine('const a = 1;\nreturn a;')).toBeNull();
  });
  it('findet die Zeile des Fehlers', () => {
    expect(findSyntaxErrorLine('const a = 1;\nconst b = 2;\nfoo(a, ;\n')).toBe(3);
  });
  it('lässt return außerhalb einer Funktion zu', () => {
    expect(findSyntaxErrorLine('return 1;')).toBeNull();
  });
});
