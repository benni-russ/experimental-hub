import type { FormulaTerm } from '../../design/components/InteractiveFormula';
import { formatNumber, formatSignificant, formatSigned } from '../../learning/numbers';
import { formatCount } from './format';
import type { SrmResult } from './srm';

/** Das Einstiegsbeispiel, durchgerechnet. */
export const EXAMPLE = { visitorsA: 50_600, visitorsB: 49_400, plannedShareA: 50 };

/**
 * Die drei Formelterme von 013 mit den Werten aus derselben Rechnung wie die Schritte darunter.
 * Ohne Regler: „Unter der Haube“ rechnet nur das Einstiegsbeispiel.
 */
export function srmTerms(
  example: typeof EXAMPLE,
  r: SrmResult,
): Record<'expected' | 'devA' | 'devB', FormulaTerm> {
  const n = example.visitorsA + example.visitorsB;
  const q = example.plannedShareA / 100;
  const dA = example.visitorsA - r.expectedA;
  const dB = example.visitorsB - r.expectedB;
  return {
    expected: {
      id: 'expected',
      label: 'E_A = n·q · Erwartung für A',
      value: `${formatNumber(n)} · ${formatSignificant(q)} = ${formatCount(r.expectedA)} (E_B = ${formatCount(r.expectedB)})`,
      explanation: 'So viele Besucher erwartet A bei dem geplanten Anteil q. E_B folgt genauso aus n · (1 − q).',
    },
    devA: {
      id: 'devA',
      label: '(O_A − E_A)²/E_A · Abweichung von A',
      value: `(${formatNumber(dA)})² / ${formatCount(r.expectedA)} = ${formatSignificant(dA ** 2 / r.expectedA)}`,
      explanation:
        'Die Abweichung der tatsächlichen Besucher O_A von der Erwartung, quadriert und durch die Erwartung geteilt. Quadriert zählen Abweichungen nach oben wie nach unten.',
    },
    devB: {
      id: 'devB',
      label: '(O_B − E_B)²/E_B · Abweichung von B',
      value: `(${formatSigned(dB)})² / ${formatCount(r.expectedB)} = ${formatSignificant(dB ** 2 / r.expectedB)}`,
      explanation: `Dasselbe für B. Beide Summanden zusammen ergeben χ² = ${formatSignificant(r.chiSquare)}.`,
    },
  };
}
