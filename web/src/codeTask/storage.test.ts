import { describe, expect, it } from 'vitest';
import { readDraft, writeDraft } from './storage';

function fake() {
  const data = new Map<string, string>();
  return {
    data,
    storage: () => ({
      getItem: (k: string) => data.get(k) ?? null,
      setItem: (k: string, v: string) => void data.set(k, v),
    }),
  };
}

describe('Entwurf im Browser-Speicher', () => {
  it('nutzt den Schlüssel hub-code:<id>', () => {
    const { data, storage } = fake();
    writeDraft(storage, 'B-001-code-01', { code: 'a', passed: false });
    expect([...data.keys()]).toEqual(['hub-code:B-001-code-01']);
  });

  it('Rundreise', () => {
    const { storage } = fake();
    writeDraft(storage, 't', { code: 'return {};', passed: true });
    expect(readDraft(storage, 't')).toEqual({ code: 'return {};', passed: true });
  });

  it('nichts gespeichert: null', () => {
    expect(readDraft(fake().storage, 't')).toBeNull();
  });

  it('kaputtes JSON oder falsche Form: null', () => {
    const { data, storage } = fake();
    data.set('hub-code:t', '{kaputt');
    expect(readDraft(storage, 't')).toBeNull();
    data.set('hub-code:t', JSON.stringify({ code: 5, passed: 'ja' }));
    expect(readDraft(storage, 't')).toBeNull();
    data.set('hub-code:t', 'null');
    expect(readDraft(storage, 't')).toBeNull();
  });

  it('werfender Speicher: Lesen null, Schreiben ohne Wurf', () => {
    const throwing = () => {
      throw new Error('gesperrt');
    };
    expect(readDraft(throwing, 't')).toBeNull();
    expect(() => writeDraft(throwing, 't', { code: '', passed: false })).not.toThrow();
    const throwingItems = () => ({
      getItem: throwing,
      setItem: throwing,
    });
    expect(readDraft(throwingItems, 't')).toBeNull();
    expect(() => writeDraft(throwingItems, 't', { code: '', passed: false })).not.toThrow();
  });
});
