import { describe, expect, it } from 'vitest';
import { copyText } from './copyText';

describe('copyText', () => {
  it('kopiert und meldet true', async () => {
    let gespeichert = '';
    const ergebnis = await copyText('power.prop.test(p1 = 0.5)', {
      writeText: async (t: string) => {
        gespeichert = t;
      },
    });
    expect(ergebnis).toBe(true);
    expect(gespeichert).toBe('power.prop.test(p1 = 0.5)');
  });

  it('ohne Zwischenablage false', async () => {
    expect(await copyText('x', undefined)).toBe(false);
  });

  it('abgelehntes Schreiben false', async () => {
    const ergebnis = await copyText('x', { writeText: () => Promise.reject(new Error('nein')) });
    expect(ergebnis).toBe(false);
  });

  it('Zeilenumbrüche bleiben', async () => {
    let gespeichert = '';
    await copyText('a\nb', {
      writeText: async (t: string) => {
        gespeichert = t;
      },
    });
    expect(gespeichert).toBe('a\nb');
  });
});
