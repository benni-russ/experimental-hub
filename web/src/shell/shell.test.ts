import { describe, expect, it } from 'vitest';
import { bellLabel, dueHeadline, groupDue } from './due';
import { readRail, writeRail } from './rail';
import { isSearchHotkey, isTypingTarget } from './hotkey';
import { formatClock, isUnreachable, nextSaveState, statusText, type SaveState, type StatusInput } from './status';

describe('groupDue', () => {
  it('zählt je Projekt, eigene Karten zählen zu ihrem Projekt', () => {
    const groups = groupDue([
      { projectId: 'A-001', projectTitle: 'MDE', cardId: 'A-001-card-01' },
      { projectId: 'A-002.1', projectTitle: 'Caching', cardId: 'A-002.1-card-01' },
      { projectId: 'A-001', projectTitle: 'MDE', cardId: 'own-4' },
    ]);
    expect(groups).toEqual([
      { projectId: 'A-001', title: 'MDE', count: 2 },
      { projectId: 'A-002.1', title: 'Caching', count: 1 },
    ]);
  });
  it('gleiche Zahl: alphabetisch', () => {
    const groups = groupDue([
      { projectId: 'A-002.1', projectTitle: 'Zeta', cardId: 'a' },
      { projectId: 'A-001', projectTitle: 'Alpha', cardId: 'b' },
    ]);
    expect(groups.map((g) => g.title)).toEqual(['Alpha', 'Zeta']);
  });
  it('nichts fällig: leere Liste', () => expect(groupDue([])).toEqual([]));
});

describe('Texte der Glocke', () => {
  it('Name mit Label zuerst, dann die Zahl', () => {
    expect(bellLabel(8)).toBe('Fällige Karten, 8');
    expect(bellLabel(0)).toBe('Keine fälligen Karten');
  });
  it('Überschrift im Aufklappfeld', () => {
    expect(dueHeadline(1)).toBe('1 Karte fällig');
    expect(dueHeadline(8)).toBe('8 Karten fällig');
  });
});

describe('Einklapp-Speicher', () => {
  const store = (value: string | null) => {
    const written: string[] = [];
    return {
      written,
      storage: () => ({
        getItem: () => value,
        setItem: (_k: string, v: string) => {
          written.push(v);
        },
      }),
    };
  };

  it('liest den gemerkten Zustand', () => {
    expect(readRail(store('1').storage)).toBe(true);
    expect(readRail(store('0').storage)).toBe(false);
    expect(readRail(store(null).storage)).toBe(false);
  });
  it('schreibt 1 bzw. 0', () => {
    const s = store(null);
    writeRail(s.storage, true);
    writeRail(s.storage, false);
    expect(s.written).toEqual(['1', '0']);
  });
  it('gesperrter Speicher: ausgeklappt, kein Fehler', () => {
    const blocked = () => {
      throw new Error('SecurityError');
    };
    expect(readRail(blocked)).toBe(false);
    expect(() => writeRail(blocked, true)).not.toThrow();
    const throwing = () => ({
      getItem: (): string | null => {
        throw new Error('x');
      },
      setItem: () => {
        throw new Error('QuotaExceeded');
      },
    });
    expect(readRail(throwing)).toBe(false);
    expect(() => writeRail(throwing, true)).not.toThrow();
  });
});

describe('Taste / für die Suche', () => {
  const key = (k: string, extra: Partial<Parameters<typeof isSearchHotkey>[0]> = {}) =>
    isSearchHotkey({ key: k, ctrlKey: false, metaKey: false, altKey: false, typing: false, ...extra });
  it('/ springt ins Suchfeld, auch mit Umschalt (deutsche Tastatur)', () => {
    expect(key('/')).toBe(true);
  });
  it('nicht beim Tippen und nicht mit Strg/Cmd/Alt', () => {
    expect(key('/', { typing: true })).toBe(false);
    expect(key('/', { ctrlKey: true })).toBe(false);
    expect(key('/', { metaKey: true })).toBe(false);
    expect(key('/', { altKey: true })).toBe(false);
    expect(key('7')).toBe(false);
  });
});

describe('Tippt gerade in ein Feld', () => {
  const el = (tagName: string, type?: string, isContentEditable = false) => ({ tagName, type, isContentEditable });
  it('Textfelder, Textbereiche, Auswahllisten und editierbarer Text sperren', () => {
    expect(isTypingTarget(el('INPUT'))).toBe(true);
    expect(isTypingTarget(el('INPUT', 'text'))).toBe(true);
    expect(isTypingTarget(el('INPUT', 'search'))).toBe(true);
    expect(isTypingTarget(el('INPUT', 'number'))).toBe(true);
    expect(isTypingTarget(el('TEXTAREA'))).toBe(true);
    expect(isTypingTarget(el('SELECT'))).toBe(true);
    expect(isTypingTarget(el('DIV', undefined, true))).toBe(true);
  });
  it('Kästchen, Optionen, Knöpfe und Schieber sperren nicht', () => {
    for (const type of ['checkbox', 'radio', 'button', 'submit', 'reset', 'range', 'color', 'file']) {
      expect(isTypingTarget(el('INPUT', type))).toBe(false);
    }
    expect(isTypingTarget(el('BUTTON'))).toBe(false);
    expect(isTypingTarget(el('DIV'))).toBe(false);
  });
  it('kein Element', () => {
    expect(isTypingTarget(null)).toBe(false);
    expect(isTypingTarget(window_like())).toBe(false);
  });
});

function window_like() {
  return { addEventListener() {} };
}

describe('Statuskarte', () => {
  const base: StatusInput = { saving: false, paused: false, lastSavedAt: null, saveError: null, stateError: null, stateLoaded: true };
  const at = new Date(2026, 9, 24, 9, 5).getTime();
  const network = { code: 'NETWORK', status: 0 };

  it('Uhrzeit zweistellig', () => expect(formatClock(at)).toBe('09:05'));

  it('erreichbar, noch nichts gespeichert', () =>
    expect(statusText(base)).toEqual({ tone: 'ok', text: 'Server erreichbar' }));
  it('erreichbar mit Zeit des letzten Speicherns', () =>
    expect(statusText({ ...base, lastSavedAt: at })).toEqual({ tone: 'ok', text: 'Server erreichbar · gespeichert 09:05' }));
  it('speichert gerade', () => expect(statusText({ ...base, saving: true, saveError: network }).tone).toBe('busy'));
  it('Speichern fehlgeschlagen', () =>
    expect(statusText({ ...base, saveError: { code: 'INVALID_INPUT', status: 400 } })).toEqual({
      tone: 'error',
      text: 'Speichern fehlgeschlagen',
    }));
  it('Speichern ohne Verbindung: nicht erreichbar', () =>
    expect(statusText({ ...base, saveError: network }).text).toBe('Server nicht erreichbar'));
  it('Lernstand nicht ladbar: nicht erreichbar', () =>
    expect(statusText({ ...base, stateError: { code: 'INTERNAL', status: 502 } })).toEqual({
      tone: 'error',
      text: 'Server nicht erreichbar',
    }));
  it('Serverfehler beim Laden', () =>
    expect(statusText({ ...base, stateError: { code: 'INTERNAL', status: 500 } }).text).toBe('Server meldet einen Fehler'));
  it('Speicherfehler geht vor Ladefehler', () =>
    expect(statusText({ ...base, saveError: { status: 400 }, stateError: network }).text).toBe('Speichern fehlgeschlagen'));
  it('noch nicht geladen', () =>
    expect(statusText({ ...base, stateLoaded: false })).toEqual({ tone: 'unknown', text: 'Verbinde …' }));

  it('wartende Änderung (offline): nicht erreichbar, nicht „Speichert …“', () =>
    expect(statusText({ ...base, paused: true, lastSavedAt: at })).toEqual({
      tone: 'error',
      text: 'Server nicht erreichbar',
    }));
  it('wartende Änderung geht vor laufender', () =>
    expect(statusText({ ...base, paused: true, saving: true }).text).toBe('Server nicht erreichbar'));

  it('isUnreachable: Netzwerk und Gateway-Fehler', () => {
    expect(isUnreachable(network)).toBe(true);
    expect(isUnreachable({ code: 'INTERNAL', status: 503 })).toBe(true);
    expect(isUnreachable({ code: 'INTERNAL', status: 500 })).toBe(false);
    expect(isUnreachable(new Error('x'))).toBe(false);
    expect(isUnreachable(null)).toBe(false);
  });
});

describe('Zustandsfolge des Speicherns', () => {
  const start: SaveState = { at: null, error: null };
  const now = 1000;
  it('Erfolg merkt die Zeit und löscht einen Fehler', () => {
    expect(nextSaveState({ at: 5, error: new Error('x') }, { type: 'success' }, now)).toEqual({ at: now, error: null });
  });
  it('Fehler behält die letzte Erfolgszeit', () => {
    const error = { code: 'NETWORK' };
    expect(nextSaveState({ at: 5, error: null }, { type: 'error', error }, now)).toEqual({ at: 5, error });
  });
  it('andere Schritte (pending, pause, continue, failed) ändern nichts', () => {
    for (const type of ['pending', 'pause', 'continue', 'failed']) {
      expect(nextSaveState(start, { type }, now)).toBe(start);
    }
  });
  it('Folge: Fehler, dann Erfolg', () => {
    const afterError = nextSaveState(start, { type: 'error', error: { status: 500 } }, now);
    expect(nextSaveState(afterError, { type: 'success' }, now + 1)).toEqual({ at: now + 1, error: null });
  });
});
