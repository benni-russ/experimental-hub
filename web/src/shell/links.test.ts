import { describe, expect, it } from 'vitest';
import { parseLinks } from './links';

describe('parseLinks', () => {
  it('ohne Angabe gibt es keine Links', () => {
    expect(parseLinks(undefined)).toEqual([]);
    expect(parseLinks('')).toEqual([]);
    expect(parseLinks('  ')).toEqual([]);
  });

  it('liest Name, Ziel und Icon, Leerzeichen sind egal', () => {
    expect(parseLinks('Start|/|server ; Zeiten | /zeiten/ | clock')).toEqual([
      { label: 'Start', href: '/', icon: 'server' },
      { label: 'Zeiten', href: '/zeiten/', icon: 'clock' },
    ]);
  });

  it('ohne oder mit unbekanntem Icon gilt das Extern-Zeichen', () => {
    expect(parseLinks('A|/a/;B|/b/|gibtsnicht')).toEqual([
      { label: 'A', href: '/a/', icon: 'external' },
      { label: 'B', href: '/b/', icon: 'external' },
    ]);
  });

  it('Einträge ohne Name oder Ziel fallen weg', () => {
    expect(parseLinks('|/a/;B|;;C|/c/')).toEqual([{ label: 'C', href: '/c/', icon: 'external' }]);
  });
});
