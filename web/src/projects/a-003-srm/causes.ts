import type { Counts } from '../../stats/proportions';

export type CauseId = 'redirect' | 'bots' | 'crossover';

export const CAUSES: { id: CauseId; label: string; strengthLabel: string; description: string }[] = [
  {
    id: 'redirect',
    label: 'Weiterleitung verliert Besucher',
    strengthLabel: 'Anteil der verlorenen Besucher in B',
    description:
      'Variante B läuft über eine Weiterleitung. Wer die Seite nicht rechtzeitig lädt, taucht in B nie auf. Verloren gehen vor allem Besucher mit schlechter Verbindung, die ohnehin selten kaufen.',
  },
  {
    id: 'bots',
    label: 'Bots in Variante A',
    strengthLabel: 'Anteil zusätzlicher Bots in A',
    description:
      'Automatische Zugriffe landen nur in Variante A. Sie zählen als Besucher, kaufen aber nie.',
  },
  {
    id: 'crossover',
    label: 'Wiederkehrende Besucher wechseln',
    strengthLabel: 'Anteil der Besucher, die von A nach B wechseln',
    description:
      'Wer Variante A schon kannte, verliert bei der Rückkehr seine Zuteilung (etwa durch ein gelöschtes Cookie) und wird neu zugeteilt. Der Regler legt fest, welcher Anteil von A dabei in B gezählt wird. Diese Stammkunden kaufen überdurchschnittlich oft.',
  },
];

export const SCENARIO = { visitorsPerGroup: 50_000, conversionRate: 0.05 } as const;

const LOST_VISITOR_RATE = 0.01;
const RETURNING_VISITOR_RATE = 0.1;

/**
 * Erwartungswerte (keine Zufallsziehung) für eine Gruppe von je 50.000 Besuchern
 * mit 5 % Kaufrate, in die die gewählte Ursache eingreift. `strength` ist ein
 * Anteil von 0 bis 0,05 der Gruppengröße.
 */
export function applyCause(cause: CauseId, strength: number): Counts {
  const n = SCENARIO.visitorsPerGroup;
  const baseConversions = n * SCENARIO.conversionRate;
  const moved = Math.round(strength * n);
  let counts: Counts = {
    visitorsA: n,
    conversionsA: baseConversions,
    visitorsB: n,
    conversionsB: baseConversions,
  };
  switch (cause) {
    case 'redirect':
      counts = {
        ...counts,
        visitorsB: n - moved,
        conversionsB: baseConversions - moved * LOST_VISITOR_RATE,
      };
      break;
    case 'bots':
      counts = { ...counts, visitorsA: n + moved };
      break;
    case 'crossover':
      counts = {
        visitorsA: n - moved,
        conversionsA: baseConversions - moved * RETURNING_VISITOR_RATE,
        visitorsB: n + moved,
        conversionsB: baseConversions + moved * RETURNING_VISITOR_RATE,
      };
      break;
  }
  return { ...counts, conversionsA: Math.round(counts.conversionsA), conversionsB: Math.round(counts.conversionsB) };
}

/** Scheinbarer Effekt von B gegenüber A, relativ in Prozent. */
export function measuredUplift(c: Counts): number {
  const rateA = c.conversionsA / c.visitorsA;
  const rateB = c.conversionsB / c.visitorsB;
  return (rateB / rateA - 1) * 100;
}
