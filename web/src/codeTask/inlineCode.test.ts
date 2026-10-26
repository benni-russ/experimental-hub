import { describe, expect, it } from 'vitest';
import { splitInlineCode } from './inlineCode';

describe('splitInlineCode', () => {
  it('leerer Text', () => {
    expect(splitInlineCode('')).toEqual([]);
  });
  it('Text ohne Backticks', () => {
    expect(splitInlineCode('nur Text')).toEqual([{ text: 'nur Text', code: false }]);
  });
  it('Paare werden zu Code', () => {
    expect(splitInlineCode('Die `double(n)` und `x` hier')).toEqual([
      { text: 'Die ', code: false },
      { text: 'double(n)', code: true },
      { text: ' und ', code: false },
      { text: 'x', code: true },
      { text: ' hier', code: false },
    ]);
  });
  it('ein offener Backtick am Ende bleibt wörtlich', () => {
    expect(splitInlineCode('a `b` c `d')).toEqual([
      { text: 'a ', code: false },
      { text: 'b', code: true },
      { text: ' c `d', code: false },
    ]);
  });
  it('leeres Paar bleibt wörtlich', () => {
    expect(splitInlineCode('a `` b')).toEqual([{ text: 'a `` b', code: false }]);
  });
});
