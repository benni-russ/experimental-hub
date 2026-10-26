import { describe, expect, it } from 'vitest';
import { FIXES, REFERENCE, simulateLoad, type VitalsFixes } from '../../experience/vitals';
import { advance, fullPageHeight, pageAt, shownTime } from './timelineModel';

const ALL: VitalsFixes = Object.fromEntries(FIXES.map((f) => [f.id, true]));
const COMBOS: VitalsFixes[] = Array.from({ length: 2 ** FIXES.length }, (_, mask) =>
  Object.fromEntries(FIXES.map((f, i) => [f.id, Boolean(mask & (1 << i))])),
);

describe('shownTime (Review Focus 3)', () => {
  it('am Ende wandert mit dem neuen Ende mit', () => {
    expect(shownTime('end', 5.03)).toBe(5.03);
    expect(shownTime('end', 1.838)).toBe(1.838);
  });
  it('eine Zeit hinter dem neuen Ende wird begrenzt', () => {
    // Abspielen bei 4 s im Start, dann alle Gegenmittel an: Ende 1,838 s.
    const start = simulateLoad({}, REFERENCE).end;
    const all = simulateLoad(ALL, REFERENCE).end;
    expect(start).toBe(5.03);
    expect(all).toBe(1.838);
    expect(shownTime(4, all)).toBe(all);
  });
  it('nie NaN, nie negativ', () => {
    expect(shownTime(NaN, 5)).toBe(0);
    expect(shownTime(-1, 5)).toBe(0);
  });
  it('über alle Stände bleibt jede Zeit in [0, end]', () => {
    for (const fixes of COMBOS) {
      const end = simulateLoad(fixes, REFERENCE).end;
      for (const t of [-3, 0, 1.2, 4.9, 5.03, 99, NaN, 'end' as const]) {
        const s = shownTime(t, end);
        expect(s).toBeGreaterThanOrEqual(0);
        expect(s).toBeLessThanOrEqual(end);
      }
    }
  });
});

describe('advance', () => {
  it('läuft vorwärts und hält am Ende', () => {
    expect(advance(1, 5, 0.5)).toEqual({ time: 1.5, done: false });
    expect(advance(4.8, 5, 0.5)).toEqual({ time: 'end', done: true });
  });
  it('Ende schrumpft beim Abspielen: sofort fertig statt hinter dem Ende', () => {
    expect(advance(4, 1.838, 0.016)).toEqual({ time: 'end', done: true });
  });
  it('ein negativer Schritt geht nicht rückwärts', () => {
    expect(advance(1, 5, -2)).toEqual({ time: 1, done: false });
  });
});

describe('pageAt', () => {
  const start = simulateLoad({}, REFERENCE);
  const box = (fixes: VitalsFixes, t: number, id: string) => pageAt(simulateLoad(fixes, REFERENCE), fixes, t).boxes.find((b) => b.id === id)!;

  it('vor dem ersten Zeichnen ist die Seite leer', () => {
    const p = pageAt(start, {}, 0.5);
    expect(p.painted).toBe(false);
    expect(p.boxes.every((b) => !b.drawn)).toBe(true);
  });

  it('jede Verschiebung des Starts schiebt den Knopf sichtbar nach unten', () => {
    const shifts = start.events.flatMap((e) => (e.type === 'shift' ? [e.time] : []));
    expect(shifts).toEqual([0.818, 1.338, 4.53]);
    for (const t of shifts) {
      expect(box({}, t, 'button').y).toBeGreaterThan(box({}, t - 0.01, 'button').y);
    }
  });

  it('mit allen Gegenmitteln steht der Knopf ab dem ersten Zeichnen still', () => {
    const all = simulateLoad(ALL, REFERENCE);
    const fp = 0.372;
    expect(all.events[0]).toEqual({ type: 'firstPaint', time: fp });
    const y = box(ALL, fp, 'button').y;
    for (let t = fp; t <= all.end; t += 0.05) expect(box(ALL, t, 'button').y).toBe(y);
  });

  it('reservierter Platz ist gestrichelt, bis Inhalt kommt', () => {
    expect(box({ reserveSpace: true }, 1, 'banner')).toMatchObject({ reserved: true, drawn: false });
    expect(box({ reserveSpace: true }, 1.4, 'banner')).toMatchObject({ reserved: false, drawn: true });
    expect(box({ dimensions: true }, 2, 'image')).toMatchObject({ reserved: true, drawn: false });
    expect(box({}, 2, 'image').height).toBe(0);
  });

  it('am Ende ist die Seite in jedem Stand gleich hoch', () => {
    for (const fixes of COMBOS) {
      const load = simulateLoad(fixes, REFERENCE);
      expect(pageAt(load, fixes, load.end).height).toBe(fullPageHeight());
    }
  });
});
