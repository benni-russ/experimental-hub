import { renderToStaticMarkup } from 'react-dom/server';
import { describe, expect, it } from 'vitest';
import { contrastRatio, rateContrast } from '../../experience/color';
import UnderTheHood from './UnderTheHood';

const html = renderToStaticMarkup(<UnderTheHood />);
const text = html.replace(/<[^>]+>/g, '');

describe('D-001 Unter der Haube: zitierte Zahlen', () => {
  it('die WCAG-Grenzen im Text stimmen mit rateContrast überein', () => {
    // Normaler Text: AA ab 4,5, AAA ab 7. Großer Text: AA ab 3, AAA ab 4,5.
    expect([rateContrast(4.5, false), rateContrast(4.49, false), rateContrast(7, false), rateContrast(6.99, false)]).toEqual(['AA', 'fail', 'AAA', 'AA']);
    expect([rateContrast(3, true), rateContrast(2.99, true), rateContrast(4.5, true), rateContrast(4.49, true)]).toEqual(['AA', 'fail', 'AAA', 'AA']);
    expect(text).toContain('AA bei normalem Text mindestens 4,5 : 1, bei großem Text 3 : 1; AAA verlangt 7 : 1 bzw. 4,5 : 1');
    expect(text).toContain('Grenzen 4,5 : 1 für AA, 7 : 1 für AAA');
    expect(text).toContain('Zoom auf 200 %');
  });

  it('die Rechenbeispiele kommen aus dem Kern', () => {
    const light = contrastRatio('#9a9a9a', '#ffffff');
    const dark = contrastRatio('#595959', '#ffffff');
    expect(text).toContain(`= ${light.toFixed(2).replace('.', ',')} : 1`);
    expect(text).toContain(`= ${dark.toFixed(2).replace('.', ',')} : 1`);
    expect(text).toContain(`Für normalen Text: nicht bestanden`);
    expect(rateContrast(light, false)).toBe('fail');
    expect(rateContrast(dark, false)).toBe('AAA');
    expect(text).toContain('Für normalen Text: AAA');
  });

  it('keine absoluten Rechtsaussagen, kein Produktname', () => {
    expect(text).toContain('fachkundig klären');
    expect(text).not.toMatch(/axe|lighthouse|wave|rechtssicher|garantiert/i);
  });
});
