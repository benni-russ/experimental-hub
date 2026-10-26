// Zustand des Suchspiels und die Sätze der Erkenntnis-Kästen. Reine Logik, getestet in game.test.ts.

import { ALT_CHOICES, BARRIERS, audit, buildPage, isFixed, type BarrierId, type Fixes } from '../../experience/productPage';

export interface GameState {
  found: Set<BarrierId>;
  fixes: Fixes;
  /** Letzte Auswahl im Suchmodus und was sie ergab; `barrierId` null = „Hier ist nichts falsch.“ */
  lastPick: { nodeId: string; barrierId: BarrierId | null; fixed?: boolean } | null;
  /** Barriere, deren Tipp gerade angezeigt wird */
  hint: BarrierId | null;
}

export type GameAction =
  | { type: 'pick'; nodeId: string }
  | { type: 'fix'; barrierId: BarrierId }
  | { type: 'chooseAlt'; text: string }
  | { type: 'hint' }
  | { type: 'revealAll' }
  | { type: 'reset' };

export const INITIAL: GameState = { found: new Set(), fixes: {}, lastPick: null, hint: null };

/** Ansagezeilen der Größen heißen `sizes-42`; sie gehören zum Knoten `sizes`. */
export function nodeOf(pickId: string): string {
  return pickId.startsWith('sizes-') ? 'sizes' : pickId;
}

/** Die noch nicht behobene Barriere an einem Knoten, sonst null. */
export function barrierAt(nodeId: string, fixes: Fixes): BarrierId | null {
  const b = BARRIERS.find((x) => x.elementId === nodeOf(nodeId));
  return b && !isFixed(b.id, fixes) ? b.id : null;
}

export function gameReducer(state: GameState, action: GameAction): GameState {
  switch (action.type) {
    case 'pick': {
      const barrierId = barrierAt(action.nodeId, state.fixes);
      const found = barrierId ? new Set(state.found).add(barrierId) : state.found;
      return { ...state, found, lastPick: { nodeId: nodeOf(action.nodeId), barrierId }, hint: state.hint === barrierId ? null : state.hint };
    }
    case 'fix': {
      if (action.barrierId === 'alt') return state; // geht nur über chooseAlt
      const fixes: Fixes = { ...state.fixes, [action.barrierId]: true };
      const found = new Set(state.found).add(action.barrierId);
      const b = BARRIERS.find((x) => x.id === action.barrierId)!;
      return { ...state, fixes, found, lastPick: { nodeId: b.elementId, barrierId: action.barrierId, fixed: true } };
    }
    case 'chooseAlt': {
      const fixes: Fixes = { ...state.fixes, alt: action.text };
      const found = new Set(state.found).add('alt');
      return { ...state, fixes, found, lastPick: { nodeId: 'image', barrierId: 'alt', fixed: true } };
    }
    case 'hint': {
      const next = BARRIERS.find((b) => !state.found.has(b.id));
      return { ...state, hint: next ? next.id : null };
    }
    case 'revealAll':
      return { ...state, found: new Set(BARRIERS.map((b) => b.id)), hint: null };
    case 'reset':
      return INITIAL;
  }
}

/** Zähler über allen Barrieren: gefunden und behoben (behoben nach isFixed, beim Alternativtext nur die gute Wahl). */
export function counts(state: GameState): { found: number; fixed: number; total: number } {
  return {
    found: state.found.size,
    fixed: BARRIERS.filter((b) => isFixed(b.id, state.fixes)).length,
    total: BARRIERS.length,
  };
}

/** Wurde beim Alternativtext ein nutzloser Text gewählt? Dann zufriedener Prüfer, aber nicht behoben. */
export function badAltChoice(fixes: Fixes): string | null {
  const choice = ALT_CHOICES.find((c) => c.text === fixes.alt);
  return choice && !choice.good ? choice.text : null;
}

export interface AuditSummary {
  /** Meldungen des Prüfers im aktuellen Stand, = audit(page).length */
  reported: number;
  /** noch nicht behobene Barrieren */
  open: number;
  /** offene Barrieren, die der Prüfer nicht meldet */
  missed: number;
  total: number;
  text: string;
}

// Der Satz nennt immer die Zahl der Meldungen und die Zahl der offenen Barrieren, die der Prüfer
// übersieht (Vorgabe aus der Abstimmung). Im Startstand lautet er wie in der Spezifikation.
export function auditSummary(fixes: Fixes): AuditSummary {
  const reports = audit(buildPage(fixes));
  const reportedIds = new Set(reports.map((r) => r.barrierId));
  const openIds = BARRIERS.filter((b) => !isFixed(b.id, fixes)).map((b) => b.id);
  const reported = reports.length;
  const open = openIds.length;
  const missed = openIds.filter((id) => !reportedIds.has(id)).length;
  const total = BARRIERS.length;
  let text: string;
  if (open === total) {
    text = `Der Prüfer findet ${reported} der ${total} Barrieren. Die ${missed} übrigen merkst du nur, wenn du die Seite selbst bedienst.`;
  } else if (open === 0) {
    text = `Alle ${total} Barrieren sind behoben. Der Prüfer meldet ${reported} und übersieht ${missed}.`;
  } else {
    text =
      `Noch offen ${open === 1 ? 'ist' : 'sind'} ${open} der ${total} Barrieren. Der Prüfer meldet ${reported} davon und übersieht ${missed}. ` +
      (missed > 0 ? 'Die übersehenen merkst du nur, wenn du die Seite selbst bedienst.' : 'Was er nicht sehen kann, hast du schon behoben.');
  }
  return { reported, open, missed, total, text };
}
