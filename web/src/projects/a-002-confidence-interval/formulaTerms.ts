import type { FormulaTerm } from '../../design/components/InteractiveFormula';
import { formatNumber, formatSignificant, formatSigned } from '../../learning/numbers';
import type { Counts, differenceInterval } from '../../stats/proportions';
import { formatLevel } from './format';

/** Eingaben exakt zeigen, ohne aufgefüllte Nullen: 0,1 · 0,105 (wie die Schritte darunter) */
export const exact = (v: number) => new Intl.NumberFormat('de-DE', { maximumFractionDigits: 6 }).format(v);

const NONE = '–';

/**
 * Die vier Formelterme von A-002 mit den Werten aus derselben Rechnung wie die Schritte darunter.
 * Ohne gültige Eingaben bleiben Formel und Erklärungen stehen, die Werte sind „–“.
 */
export function ciTerms(
  r: ReturnType<typeof differenceInterval> | null,
  counts: Counts | null,
  level: number,
): Record<'diff' | 'z' | 'varA' | 'varB', FormulaTerm> {
  const ok = r !== null && counts !== null;
  const pA = ok ? r.rateA / 100 : 0;
  const pB = ok ? r.rateB / 100 : 0;
  return {
    diff: {
      id: 'diff',
      label: 'p_B − p_A · Unterschied der Raten',
      value: ok
        ? `${exact(pB)} − ${exact(pA)} = ${exact(pB - pA)} = ${formatSigned(r.difference, 2)} Prozentpunkte`
        : NONE,
      explanation: 'Der beobachtete Unterschied ist die Mitte des Intervalls. Gerechnet wird mit Anteilen, nicht mit Prozent.',
      control: 'counts',
    },
    z: {
      id: 'z',
      label: 'z · Niveau als Abstand',
      value: ok ? `Niveau ${formatLevel(level)} → z = ${formatSignificant(r.z)}` : NONE,
      explanation: 'Übersetzt das Niveau in einen Abstand auf der Normalverteilung, ohne Einheit. Je höher das Niveau, desto größer z und desto breiter das Intervall.',
      control: 'level',
    },
    varA: {
      id: 'varA',
      label: 'p_A(1−p_A)/n_A · Streuung in A',
      value: ok
        ? `${exact(pA)} · ${exact(1 - pA)} / ${formatNumber(counts.visitorsA)} = ${formatSignificant((pA * (1 - pA)) / counts.visitorsA)}`
        : NONE,
      explanation: 'Wie stark die Rate in A zufällig schwankt. Mehr Besucher in A machen den Wert kleiner.',
      control: 'a',
    },
    varB: {
      id: 'varB',
      label: 'p_B(1−p_B)/n_B · Streuung in B',
      value: ok
        ? `${exact(pB)} · ${exact(1 - pB)} / ${formatNumber(counts.visitorsB)} = ${formatSignificant((pB * (1 - pB)) / counts.visitorsB)}`
        : NONE,
      explanation: 'Wie stark die Rate in B zufällig schwankt. Beide Streuungen zusammen ergeben unter der Wurzel den Standardfehler.',
      control: 'b',
    },
  };
}
