import { describe, expect, it } from 'vitest';
import { contrastRatio, parseHex, rateContrast, relativeLuminance } from './color';

describe('parseHex', () => {
  it('liest drei- und sechsstellige Werte', () => {
    expect(parseHex('#fff')).toEqual([255, 255, 255]);
    expect(parseHex('#ffffff')).toEqual([255, 255, 255]);
    expect(parseHex('#9a9a9a')).toEqual([154, 154, 154]);
  });
  it('liefert null bei Unbrauchbarem', () => {
    expect(parseHex('blau')).toBeNull();
    expect(parseHex('#ff')).toBeNull();
    expect(parseHex('#gggggg')).toBeNull();
  });
});

describe('relativeLuminance', () => {
  it('Schwarz 0, Weiß 1', () => {
    expect(relativeLuminance('#000000')).toBe(0);
    expect(relativeLuminance('#ffffff')).toBeCloseTo(1, 10);
  });
});

describe('contrastRatio', () => {
  it('Schwarz auf Weiß ist genau 21', () => {
    expect(contrastRatio('#000000', '#ffffff')).toBe(21);
  });
  it('gleiche Farbe ergibt 1', () => {
    expect(contrastRatio('#336699', '#336699')).toBe(1);
  });
  it('Reihenfolge ist egal', () => {
    expect(contrastRatio('#9a9a9a', '#ffffff')).toBe(contrastRatio('#ffffff', '#9a9a9a'));
  });
  it('#9a9a9a auf Weiß ist etwa 2,81 und fällt durch', () => {
    const r = contrastRatio('#9a9a9a', '#ffffff');
    expect(r.toFixed(2)).toBe('2.81');
    expect(rateContrast(r, false)).toBe('fail');
  });
});

describe('rateContrast', () => {
  it('#595959 auf Weiß erreicht AAA', () => {
    const r = contrastRatio('#595959', '#ffffff');
    expect(r).toBeGreaterThanOrEqual(7);
    expect(rateContrast(r, false)).toBe('AAA');
  });
  it('#767676 auf Weiß ist AA', () => {
    expect(rateContrast(contrastRatio('#767676', '#ffffff'), false)).toBe('AA');
  });
  it('Grenzwerte gehören zur besseren Stufe', () => {
    expect(rateContrast(4.5, false)).toBe('AA');
    expect(rateContrast(7, false)).toBe('AAA');
    expect(rateContrast(4.49, false)).toBe('fail');
    expect(rateContrast(3, true)).toBe('AA');
    expect(rateContrast(4.5, true)).toBe('AAA');
    expect(rateContrast(2.99, true)).toBe('fail');
  });
});
