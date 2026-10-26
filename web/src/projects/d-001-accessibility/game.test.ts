import { describe, expect, it } from 'vitest';
import { ALT_CHOICES, BARRIERS, audit, buildPage, isFixed, type BarrierId, type Fixes } from '../../experience/productPage';
import { INITIAL, auditSummary, badAltChoice, barrierAt, counts, gameReducer, nodeOf, type GameAction, type GameState } from './game';

const run = (...actions: GameAction[]): GameState => actions.reduce(gameReducer, INITIAL);
const GOOD_ALT = ALT_CHOICES.find((c) => c.good)!.text;
const ALL_FIXED: Fixes = { contrast: true, alt: GOOD_ALT, label: true, heading: true, linkText: true, divButton: true, colorOnly: true, focus: true };

/** Ein Stand mit genau einer Behebung, für jede Barriere; beim Alternativtext jede der drei Wahlen. */
const SINGLE_FIXES: [string, Fixes][] = [
  ...BARRIERS.filter((b) => b.id !== 'alt').map((b): [string, Fixes] => [b.id, { [b.id]: true } as Fixes]),
  ...ALT_CHOICES.map((c): [string, Fixes] => [`alt = ${c.text}`, { alt: c.text }]),
];

/** Erwartung unabhängig von auditSummary: offene Barrieren, die audit() nicht meldet. */
function expected(fixes: Fixes) {
  const reports = audit(buildPage(fixes));
  const reportedIds = new Set(reports.map((r) => r.barrierId));
  const open = BARRIERS.filter((b) => !isFixed(b.id, fixes));
  return { reported: reports.length, open: open.length, missed: open.filter((b) => !reportedIds.has(b.id)).length };
}

describe('Suchspiel: Reducer', () => {
  it('ein Klick auf eine Barriere zählt als Fund, ein Klick daneben nicht', () => {
    const hit = run({ type: 'pick', nodeId: 'note' });
    expect([...hit.found]).toEqual(['contrast']);
    expect(hit.lastPick).toEqual({ nodeId: 'note', barrierId: 'contrast' });
    const miss = run({ type: 'pick', nodeId: 'price' });
    expect(miss.found.size).toBe(0);
    expect(miss.lastPick).toEqual({ nodeId: 'price', barrierId: null });
  });

  it('Ansagezeilen der Größen gehören zur Größenauswahl', () => {
    expect(nodeOf('sizes-42')).toBe('sizes');
    expect(nodeOf('note')).toBe('note');
    expect(run({ type: 'pick', nodeId: 'sizes-40' }).found.has('colorOnly')).toBe(true);
  });

  it('nach der Behebung ist an der Stelle nichts mehr falsch', () => {
    const s = run({ type: 'pick', nodeId: 'cart' }, { type: 'fix', barrierId: 'divButton' });
    expect(s.fixes.divButton).toBe(true);
    expect(s.lastPick).toEqual({ nodeId: 'cart', barrierId: 'divButton', fixed: true });
    expect(barrierAt('cart', s.fixes)).toBeNull();
    expect(gameReducer(s, { type: 'pick', nodeId: 'cart' }).lastPick?.barrierId).toBeNull();
  });

  it('der Alternativtext lässt sich nur über die Auswahl beheben', () => {
    const s = run({ type: 'pick', nodeId: 'image' }, { type: 'fix', barrierId: 'alt' });
    expect(s.fixes.alt).toBeUndefined();
    const good = gameReducer(s, { type: 'chooseAlt', text: GOOD_ALT });
    expect(isFixed('alt', good.fixes)).toBe(true);
  });

  it('ein nutzloser Alternativtext: gefunden, nicht behoben, die Stelle bleibt auswählbar', () => {
    const s = run({ type: 'pick', nodeId: 'image' }, { type: 'chooseAlt', text: 'IMG_2041.jpg' });
    expect(badAltChoice(s.fixes)).toBe('IMG_2041.jpg');
    expect(counts(s)).toEqual({ found: 1, fixed: 0, total: 8 });
    expect(barrierAt('image', s.fixes)).toBe('alt');
    expect(badAltChoice({ alt: GOOD_ALT })).toBeNull();
    expect(badAltChoice({})).toBeNull();
  });

  it('Tipp nennt die erste nicht gefundene Barriere und verschwindet, wenn sie gefunden ist', () => {
    const s = run({ type: 'hint' });
    expect(s.hint).toBe(BARRIERS[0]!.id);
    expect(gameReducer(s, { type: 'pick', nodeId: BARRIERS[0]!.elementId }).hint).toBeNull();
    const next = run({ type: 'pick', nodeId: 'note' }, { type: 'hint' });
    expect(next.hint).toBe(BARRIERS[1]!.id);
  });

  it('Alle zeigen findet alles, behebt aber nichts; Zurücksetzen stellt den Start her', () => {
    const s = run({ type: 'revealAll' });
    expect(counts(s)).toEqual({ found: 8, fixed: 0, total: 8 });
    expect(run({ type: 'hint' }, { type: 'revealAll' }, { type: 'hint' }).hint).toBeNull();
    expect(gameReducer(s, { type: 'reset' })).toBe(INITIAL);
  });

  it('alles behoben: 8 von 8', () => {
    const ids: BarrierId[] = ['contrast', 'label', 'heading', 'linkText', 'divButton', 'colorOnly', 'focus'];
    const s = run(...ids.map((barrierId): GameAction => ({ type: 'fix', barrierId })), { type: 'chooseAlt', text: GOOD_ALT });
    expect(counts(s)).toEqual({ found: 8, fixed: 8, total: 8 });
    expect(s.fixes).toEqual(ALL_FIXED);
  });
});

describe('Erkenntnis-Kasten des Prüfers', () => {
  it('Startstand: der Satz aus der Spezifikation, mit 5 Meldungen und 3 übersehenen', () => {
    const s = auditSummary({});
    expect(s).toMatchObject({ reported: 5, open: 8, missed: 3, total: 8 });
    expect(s.reported).toBe(audit(buildPage({})).length);
    expect(s.text).toBe('Der Prüfer findet 5 der 8 Barrieren. Die 3 übrigen merkst du nur, wenn du die Seite selbst bedienst.');
  });

  it.each(SINGLE_FIXES)('eine Behebung (%s): Satz nennt die Meldungen und die übersehenen Barrieren', (_, fixes) => {
    const e = expected(fixes);
    const s = auditSummary(fixes);
    expect(s).toMatchObject(e);
    // Solange nichts behoben ist (auch bei nutzlosem Alternativtext), gilt der Satz des Startstands.
    if (e.open === 8) {
      expect(s.text).toContain(`findet ${e.reported} der 8 Barrieren`);
      expect(s.text).toContain(`Die ${e.missed} übrigen`);
    } else {
      expect(s.text).toContain(`meldet ${e.reported}`);
      expect(s.text).toContain(`übersieht ${e.missed}`);
      expect(s.text).toContain(`${e.open} der 8 Barrieren`);
    }
  });

  it('Stichproben: Kontrast behoben 4 Meldungen, 3 übersehen; Fokus behoben 5 Meldungen, 2 übersehen', () => {
    expect(auditSummary({ contrast: true }).text).toBe(
      'Noch offen sind 7 der 8 Barrieren. Der Prüfer meldet 4 davon und übersieht 3. Die übersehenen merkst du nur, wenn du die Seite selbst bedienst.',
    );
    expect(auditSummary({ focus: true })).toMatchObject({ reported: 5, open: 7, missed: 2 });
  });

  it('nutzloser Alternativtext: der Prüfer meldet das Bild nicht mehr, offen bleibt es trotzdem', () => {
    for (const c of ALT_CHOICES.filter((x) => !x.good)) {
      expect(auditSummary({ alt: c.text })).toMatchObject({ reported: 4, open: 8, missed: 4 });
    }
    expect(auditSummary({ alt: 'Bild' }).text).toBe('Der Prüfer findet 4 der 8 Barrieren. Die 4 übrigen merkst du nur, wenn du die Seite selbst bedienst.');
  });

  it('nur noch Barrieren offen, die der Prüfer meldet: der zweite Satz wechselt', () => {
    const fixes: Fixes = { divButton: true, colorOnly: true, focus: true };
    const s = auditSummary(fixes);
    expect(s).toMatchObject({ reported: 5, open: 5, missed: 0 });
    expect(s.text).toBe('Noch offen sind 5 der 8 Barrieren. Der Prüfer meldet 5 davon und übersieht 0. Was er nicht sehen kann, hast du schon behoben.');
  });

  it('eine offene Barriere: Einzahl', () => {
    const { focus: _focus, ...rest } = ALL_FIXED;
    expect(auditSummary(rest).text).toBe(
      'Noch offen ist 1 der 8 Barrieren. Der Prüfer meldet 0 davon und übersieht 1. Die übersehenen merkst du nur, wenn du die Seite selbst bedienst.',
    );
  });

  it('alles behoben: 0 Meldungen, 0 übersehen', () => {
    const s = auditSummary(ALL_FIXED);
    expect(s).toMatchObject({ reported: 0, open: 0, missed: 0 });
    expect(s.reported).toBe(audit(buildPage(ALL_FIXED)).length);
    expect(s.text).toBe('Alle 8 Barrieren sind behoben. Der Prüfer meldet 0 und übersieht 0.');
  });
});
