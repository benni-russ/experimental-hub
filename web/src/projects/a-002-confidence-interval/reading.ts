import { intervalCase, significanceOf, type IntervalCase } from '../../stats/intervalCase';
import type { DifferenceInterval } from '../../stats/proportions';
import { formatLevel, formatMde } from './format';

export interface Reading {
  /** Fall aus der gemeinsamen Klassifikation (wie A-002.3); null ohne MDE. */
  case: IntervalCase | null;
  /** Satz zur Null */
  significance: string;
  /** Satz zum MDE; null ohne MDE */
  relevance: string | null;
  /** Verweis auf A-002.3 nur bei „signifikant, aber zu klein“ */
  linkSignificantRelevant: boolean;
}

/** „dem MDE von 2 Prozentpunkten“ bzw. „den MDE …“; die Zahl nach „von“ im Dativ, bei genau 1 Einzahl. */
const mdePhrase = (article: 'dem' | 'den', mde: number) =>
  `${article} MDE von ${formatMde(mde)} ${mde === 1 ? 'Prozentpunkt' : 'Prozentpunkten'}`;

/** Lesart des Intervalls für „Dein Test“: ein Satz zur Null, einer zum MDE. */
export function readingOf(i: DifferenceInterval, mde: number | null, level: number): Reading {
  const atLevel = `auf dem Niveau ${formatLevel(level)}`;
  const significance = {
    positive: `Das Intervall schließt 0 aus: Ein Unterschied von null passt ${atLevel} nicht zu diesen Daten.`,
    negative: `Das Intervall liegt ganz unter 0: Ein Unterschied von null passt ${atLevel} nicht zu diesen Daten, B schneidet schlechter ab als A.`,
    includesZero:
      'Das Intervall schließt 0 ein: Ein Unterschied von null passt noch zu diesen Daten. Das heißt nicht, dass es keinen gibt.',
  }[significanceOf(i.lower, i.upper)];

  const c = intervalCase(i.lower, i.upper, mde);
  if (c === null || mde === null) return { case: null, significance, relevance: null, linkSignificantRelevant: false };

  const m = mdePhrase('dem', mde);
  const mAcc = mdePhrase('den', mde);
  const relevance: Record<IntervalCase, string> = {
    both: `Das ganze Intervall liegt über ${m}: Auch am unteren Ende erreicht der Unterschied die Schwelle.`,
    small: `Das ganze Intervall liegt unter ${m}: signifikant, aber kleiner als der Unterschied, der dir etwas wert ist.`,
    significantOpen: `Das Intervall schließt ${mAcc} ein: Ob der Unterschied die Schwelle erreicht, lässt sich mit diesen Daten noch nicht sagen.`,
    open: `Das Intervall schließt auch ${mAcc} ein: Kein Unterschied und ein lohnender passen beide zu diesen Daten. Der Test war zu ungenau für eine Antwort.`,
    excluded: `Das ganze Intervall liegt unter ${m}: Ein Unterschied, der die Schwelle erreicht, passt ${atLevel} nicht zu diesen Daten. Auch das ist eine Antwort.`,
    negative: `Damit liegt es auch unter ${m}: Ein lohnender Vorsprung von B passt ${atLevel} nicht zu diesen Daten.`,
  };
  return { case: c, significance, relevance: relevance[c], linkSignificantRelevant: c === 'small' };
}
