import type { FormulaTerm } from '../../design/components/InteractiveFormula';
import { formatNumber, formatSignificant } from '../../learning/numbers';
import { formatRate } from './Assumptions';
import type { calculateSampleSize } from './sampleSize';

/** Eingaben exakt zeigen, ohne aufgefüllte Nullen: 0,1 · 0,105 · 0,975 (wie die Schritte darunter) */
export const exact = (v: number) => new Intl.NumberFormat('de-DE', { maximumFractionDigits: 6 }).format(v);

type Result = NonNullable<ReturnType<typeof calculateSampleSize>>;

/** Die fünf Formelterme von 001 mit den Werten aus derselben Rechnung wie die Schritte darunter. */
export function mdeTerms(
  r: Result,
  input: { baseline: number; mde: number; alpha: number; power: number },
): Record<'zAlpha' | 'zPower' | 'p1' | 'p2' | 'delta', FormulaTerm> {
  return {
    zAlpha: {
      id: 'zAlpha',
      label: 'z(1−α/2) · Signifikanzniveau',
      value: `α = ${exact(input.alpha)} → z = ${formatSignificant(r.zAlpha)}`,
      explanation:
        'Übersetzt das Risiko eines Fehlalarms in einen Abstand auf der Normalverteilung; zweiseitig zählen beide Richtungen. Je strenger das Niveau, desto größer der z-Wert.',
      control: 'alpha',
    },
    zPower: {
      id: 'zPower',
      label: 'z(Power) · Trennschärfe',
      value: `Power ${formatNumber(input.power * 100)} % → z = ${formatSignificant(r.zPower)}`,
      explanation:
        'Übersetzt die gewünschte Chance, einen echten Unterschied zu erkennen, in einen z-Wert. Mehr Power heißt größerer z-Wert und mehr Personen.',
      control: 'power',
    },
    p1: {
      id: 'p1',
      label: 'p₁ · Rate heute',
      value: `${exact(r.p1)} = ${formatRate(input.baseline)}`,
      explanation: 'Die heutige Rate als Anteil. Sie bestimmt mit, wie stark die Messung zufällig schwankt.',
      control: 'baseline',
    },
    p2: {
      id: 'p2',
      label: 'p₂ · Zielrate',
      value: `${exact(r.p2)} = ${formatRate(input.baseline + input.mde)}`,
      explanation: 'Rate heute plus kleinster Unterschied, also die Rate, die der Test noch erkennen soll.',
      control: 'mde',
    },
    delta: {
      id: 'delta',
      label: '(p₂ − p₁)² · Unterschied zum Quadrat',
      value: `(${exact(r.difference)})² = ${formatSignificant(r.difference ** 2)}`,
      explanation: 'Der Unterschied steht quadriert im Nenner. Halb so groß heißt etwa viermal so viele Personen.',
      control: 'mde',
    },
  };
}
