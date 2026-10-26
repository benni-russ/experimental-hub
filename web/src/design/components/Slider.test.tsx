import { renderToStaticMarkup } from 'react-dom/server';
import { describe, expect, it } from 'vitest';
import { Slider } from './Slider';

const noop = () => {};

describe('Slider', () => {
  it('sagt mit format den formatierten Wert an', () => {
    const html = renderToStaticMarkup(<Slider label="Zeitpunkt" value={1.5} min={0} max={5} step={0.05} onChange={noop} format={(v) => `${String(v).replace('.', ',')} s`} />);
    expect(html).toContain('aria-valuetext="1,5 s"');
    expect(html).toContain('>1,5 s</output>');
  });

  it('ohne format kein aria-valuetext, der Browser sagt die Zahl an', () => {
    const html = renderToStaticMarkup(<Slider label="Anteil" value={3} min={0} max={10} step={1} onChange={noop} />);
    expect(html).not.toContain('aria-valuetext');
  });
});
