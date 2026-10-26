import { renderToStaticMarkup } from 'react-dom/server';
import { MemoryRouter } from 'react-router';
import { describe, expect, it } from 'vitest';
import { ECONOMY, SOURCES, computeFunnel, kpis } from '../../experience/funnel';
import { calculateSampleSize } from '../a-001-mde/sampleSize';
import { runScenario } from './insights';
import UnderTheHood from './UnderTheHood';

const html = renderToStaticMarkup(
  <MemoryRouter>
    <UnderTheHood />
  </MemoryRouter>,
);
const prose = html.replace(/<[^>]+>/g, '').replace(/&#x27;/g, "'").replace(/\s+/g, ' ');
const base = computeFunnel(SOURCES);
const start = kpis(base, ECONOMY);
const de = (n: number, digits = 2) => new Intl.NumberFormat('de-DE', { maximumFractionDigits: digits }).format(n);
const pct = (share: number, digits = 2) => `${de(share * 100, digits)} %`;

describe('D-003 Unter der Haube: zitierte Zahlen', () => {
  it('Multiplikation der Quoten im Start', () => {
    expect(base.rates.map((r) => pct(r, 1))).toEqual(['54,8 %', '13,7 %', '55,1 %', '62,6 %']);
    expect(prose).toContain('Im Start: 20.000 × 54,8 % × 13,7 % × 55,1 % × 62,6 % ergibt rund 520 Käufe.');
    expect(Math.round(start.orders)).toBe(520);
    expect(prose).toContain('um 10 % an jedem Übergang dasselbe: 10 % mehr Käufe');
  });

  it('absolut gegen relativ und Stichprobe bei +10 %', () => {
    expect(pct(start.conversionRate)).toBe('2,6 %');
    expect(pct(start.conversionRate * 1.1)).toBe('2,86 %');
    expect(de(start.conversionRate * 0.1 * 100)).toBe('0,26');
    const direct = calculateSampleSize({ baseline: start.conversionRate * 100, mde: start.conversionRate * 10, alpha: 0.05, power: 0.8 })!;
    const weeks = Math.ceil((2 * direct.perVariant) / ((start.visits * 12) / 52));
    expect(direct.perVariant).toBe(61683);
    expect(weeks).toBe(27);
    expect(prose).toContain(
      'Verbessert sich eine Quote von 2,6 % relativ um 10 %, liegt sie bei 2,86 %. Absolut ist das nur ein Abstand von 0,26 Prozentpunkten.',
    );
    expect(prose).toContain('etwa 61.683 Besuche je Variante, bei 20.000 Besuchen im Monat rund 27 Wochen');
  });

  it('Quotient und Social-Kampagne', () => {
    const { after } = runScenario('socialCampaign');
    expect(after.visits).toBe(25000);
    expect(Math.round(after.revenue)).toBe(50309);
    expect(prose).toContain('In der Social-Kampagne: 25.000 statt 20.000 Besuche, Conversion Rate 2,19 % statt 2,6 %, Umsatz 50.309 € statt 47.825 €.');
  });

  it('Mischeffekt: Quoten je Quelle, gewichteter Durchschnitt', () => {
    const shown = SOURCES.map((s) => `${s.label} ${pct(base.bySource[s.id].overall)}`).join(', ');
    expect(shown).toBe('Suche 2,97 %, Social 0,54 %, Newsletter 5,88 %, direkt 2,75 %');
    expect(prose).toContain(`gewichteter Durchschnitt der Quellen: ${shown}.`);
    const weighted = SOURCES.reduce((sum, s) => sum + (s.visits / start.visits) * base.bySource[s.id].overall, 0);
    expect(weighted).toBeCloseTo(start.conversionRate, 12);
  });

  it('Umsatz pro Besuch und Rohertrag', () => {
    expect(runScenario('socialCampaign').after.revenuePerVisit).toBeCloseTo(2.0124, 4);
    expect(prose).toContain('fällt er von 2,39 € auf 2,01 €, obwohl der Umsatz steigt');
    expect(Math.round(runScenario('discount').after.grossProfit)).toBe(10538);
    expect(prose).toContain('Beim Rabatt fällt er von 16.583 € auf 10.538 €, obwohl die Conversion Rate steigt');
  });

  it('der Fließtext nennt nur geprüfte Zahlen', () => {
    // 001, 003, 004 aus den Verweisen A-001, D-003.1, A-004.
    expect([...new Set(prose.match(/\d+/g))].sort()).toEqual(
      [
        '0', '000', '001', '003', '004', '01', '1', '10', '13', '16', '19', '2', '20', '25', '26', '27', '309', '39', '47', '5', '50', '520', '538', '54', '55', '583', '6',
        '61', '62', '683', '7', '75', '8', '825', '86', '88', '97',
      ].sort(),
    );
  });

  it('Verweise und vorsichtige Aussagen', () => {
    expect(html).toContain('href="/projekt/A-001"');
    expect(html).toContain('href="/projekt/A-004"');
    expect(html).toMatch(/<a href="\/projekt\/D-003\.1"[^>]*>UX-Beobachtung als Hypothese \(D-003\.1\)<\/a>/);
    for (const term of ['Funnel Exploration', 'Sessions', 'Conversion Rate', 'AOV', 'RPV']) expect(prose).toContain(term);
    expect(prose).toContain('nicht warum');
    expect(prose).not.toMatch(/Google|GA4|Shopify|Branchen|garantiert|immer/i);
  });
});
