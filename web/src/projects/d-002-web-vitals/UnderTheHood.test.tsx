import { renderToStaticMarkup } from 'react-dom/server';
import { describe, expect, it } from 'vitest';
import { FIELD_VISITS, REFERENCE, THRESHOLDS, clsFromShifts, fieldResults, percentile75, simulateLoad } from '../../experience/vitals';
import { shiftsOf } from './insights';
import UnderTheHood from './UnderTheHood';

const html = renderToStaticMarkup(<UnderTheHood />);
const text = html.replace(/<[^>]+>/g, '').replace(/&#x27;/g, "'").replace(/\s+/g, ' ');
// Fließtext ohne den Code-Block
const prose = renderToStaticMarkup(<UnderTheHood />)
  .replace(/<pre>[\s\S]*?<\/pre>/g, '')
  .replace(/<[^>]+>/g, '')
  .replace(/\s+/g, ' ');
const start = simulateLoad({}, REFERENCE);
const shifts = shiftsOf(start);
const value = (source: string) => shifts.find((s) => s.source === source)!;

describe('D-002 Unter der Haube: zitierte Zahlen', () => {
  it('CLS-Formel: 0,5 × 0,24 ist genau der Wert des Banners', () => {
    expect(Math.round(0.5 * 0.24 * 1000) / 1000).toBe(value('banner').value);
    expect(prose).toContain('um 24 % der Höhe nach unten: 0,5 × 0,24 = 0,12');
  });

  it('Sitzungsfenster und CLS im Start aus dem Kern', () => {
    expect(clsFromShifts([{ time: 0, value: 0.1 }, { time: 0.99, value: 0.1 }])).toBe(0.2);
    expect(clsFromShifts([0, 0.9, 1.8, 2.7, 3.6, 4.5, 5.4].map((time) => ({ time, value: 0.1 })))).toBe(0.6);
    expect(prose).toContain('weniger als 1 s auseinander');
    expect(prose).toContain('höchstens 5 s');
    expect(value('font').value).toBe(0.05);
    expect(value('image')).toMatchObject({ value: 0.15, time: 4.53 });
    expect(start.cls).toBe(0.17);
    expect(prose).toContain('Schrift (0,05) und Banner (0,12)');
    expect(prose).toContain('das Bild (0,15) kommt erst bei 4,53 s');
    expect(prose).toContain('der CLS 0,17 und nicht die Summe aller drei');
  });

  it('INP-Grenzen und Feldzahlen', () => {
    expect(THRESHOLDS.inp).toMatchObject({ good: 200, poor: 500 });
    expect(prose).toContain('Gut ist bis 200 ms, schlecht über 500 ms');
    expect(prose).toContain('2024 hat INP den FID abgelöst');
    expect(FIELD_VISITS).toHaveLength(20);
    expect(percentile75(fieldResults({}).map((v) => v.lcp))).toBe(6.975);
    expect(prose).toContain('einen LCP von 4,53 s, das Feld mit 20 Besuchen 6,975 s');
    expect(prose).toContain(`das Profil ${REFERENCE.label}`);
  });

  it('der Fließtext nennt nur geprüfte Zahlen', () => {
    expect([...new Set(prose.match(/\d+/g))].sort()).toEqual(
      ['0', '001', '003', '05', '1', '12', '15', '17', '20', '200', '2024', '24', '4', '5', '500', '53', '6', '75', '975'].sort(),
    );
  });

  it('Beobachter mit den drei Eintragsarten, vorsichtige Aussagen, keine Werkzeugnamen', () => {
    for (const type of ['largest-contentful-paint', 'layout-shift', 'event']) expect(text).toContain(`type: '${type}'`);
    // durationThreshold: 40 ms ist der kleinste Wert, den der Browser für Ereignis-Einträge annimmt
    // (Vorgabe sind 104 ms); so erscheinen auch kürzere Reaktionen. Der Wert steht bewusst im Beispiel.
    expect(text).toContain("observe({ type: 'event', durationThreshold: 40, buffered: true })");
    expect(prose).toContain('nach eigenen Angaben als eines von vielen Signalen');
    expect(text).not.toMatch(/lighthouse|pagespeed|search console|crux|ranking|garantiert/i);
    expect(prose).toContain('D-001');
    expect(prose).toContain('D-003');
  });
});
