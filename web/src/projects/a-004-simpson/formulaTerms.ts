import type { FormulaTerm } from '../../design/components/InteractiveFormula';
import { formatNumber } from '../../learning/numbers';
import { pct } from './format';
import { MOBILE_SHARE_A, SEGMENT_RATES } from './simpson';

const f1 = (v: number) => formatNumber(v, 1);

/**
 * Die vier Formelterme von A-004 für Variante A, mit den Werten aus derselben Rechnung wie die Schritte darunter.
 * Ohne Regler: „Unter der Haube“ rechnet nur das feste Beispiel.
 */
export function simpsonTerms(): Record<'s' | 'mobile' | 'rest' | 'desktop', FormulaTerm> {
  const s = MOBILE_SHARE_A / 100;
  const { mobile, desktop } = SEGMENT_RATES.A;
  return {
    s: {
      id: 's',
      label: 's · Mobil-Anteil',
      value: `s = ${f1(s)}`,
      explanation: 'Der Anteil der Besucher dieser Variante, die mobil kommen. Er ist das Gewicht der Mobil-Rate.',
    },
    mobile: {
      id: 'mobile',
      label: 'Rate_Mobil · Kaufrate mobil',
      value: pct(mobile),
      explanation: 'Die Kaufrate der mobilen Besucher dieser Variante. Sie geht mit dem Gewicht s ein.',
    },
    rest: {
      id: 'rest',
      label: '(1 − s) · Desktop-Anteil',
      value: `1 − ${f1(s)} = ${f1(1 - s)}`,
      explanation: 'Der Rest der Besucher kommt per Desktop. Er ist das Gewicht der Desktop-Rate.',
    },
    desktop: {
      id: 'desktop',
      label: 'Rate_Desktop · Kaufrate Desktop',
      value: pct(desktop),
      explanation: 'Die Kaufrate der Desktop-Besucher dieser Variante. Sie geht mit dem Gewicht (1 − s) ein.',
    },
  };
}
