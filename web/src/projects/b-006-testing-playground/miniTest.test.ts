import { describe, expect, it } from 'vitest';
import { createTestApi, type TestOutcome } from './miniTest';

/** Registriert genau einen Test und liefert sein Ergebnis. */
async function single(fn: (api: ReturnType<typeof createTestApi>) => void | Promise<void>): Promise<TestOutcome> {
  const api = createTestApi();
  api.test('einzeln', () => fn(api));
  const outcomes = await api.runAll();
  expect(outcomes).toHaveLength(1);
  return outcomes[0]!;
}

describe('miniTest: toBe', () => {
  it('besteht bei gleichem Wert', async () => {
    expect(await single((api) => api.expect(3).toBe(3))).toEqual({ name: 'einzeln', passed: true });
  });

  it('scheitert mit lesbarer Meldung', async () => {
    const o = await single((api) => api.expect(4).toBe(3));
    expect(o.passed).toBe(false);
    expect(o.message).toBe('erwartet 3, bekommen 4');
  });

  it('vergleicht Objekte nach Identität, nicht nach Inhalt', async () => {
    const o = await single((api) => api.expect({ a: 1 }).toBe({ a: 1 }));
    expect(o.passed).toBe(false);
    expect(o.message).toContain('toEqual');
  });

  it('Texte erscheinen in Anführungszeichen', async () => {
    const o = await single((api) => api.expect('3').toBe(3));
    expect(o.message).toBe('erwartet 3, bekommen "3"');
  });
});

describe('miniTest: toEqual', () => {
  it('besteht bei gleichem Inhalt in Listen und Objekten', async () => {
    const o = await single((api) => api.expect([{ a: 1, b: [2, 3] }]).toEqual([{ b: [2, 3], a: 1 }]));
    expect(o.passed).toBe(true);
  });

  it('besteht bei leeren Listen', async () => {
    expect((await single((api) => api.expect([]).toEqual([]))).passed).toBe(true);
  });

  it('NaN gilt als gleich NaN', async () => {
    expect((await single((api) => api.expect([NaN]).toEqual([NaN]))).passed).toBe(true);
  });

  it('scheitert bei anderem Inhalt mit lesbarer Meldung', async () => {
    const o = await single((api) => api.expect([{ code: 'a' }]).toEqual([]));
    expect(o.passed).toBe(false);
    expect(o.message).toBe('erwartet [], bekommen [{"code":"a"}]');
  });

  it('unterscheidet Liste und Objekt', async () => {
    expect((await single((api) => api.expect({ 0: 'x' }).toEqual(['x']))).passed).toBe(false);
  });

  it('unterscheidet fehlende Schlüssel', async () => {
    expect((await single((api) => api.expect({ a: 1 }).toEqual({ a: 1, b: 2 }))).passed).toBe(false);
    expect((await single((api) => api.expect({ a: 1, b: 2 }).toEqual({ a: 1 }))).passed).toBe(false);
  });

  it('unterscheidet Zahl und Text', async () => {
    expect((await single((api) => api.expect([1]).toEqual(['1']))).passed).toBe(false);
  });
});

describe('miniTest: toThrow', () => {
  it('besteht, wenn die Funktion wirft', async () => {
    const o = await single((api) =>
      api
        .expect(() => {
          throw new Error('kaputt');
        })
        .toThrow(),
    );
    expect(o.passed).toBe(true);
  });

  it('scheitert, wenn die Funktion durchläuft', async () => {
    const o = await single((api) => api.expect(() => 1).toThrow());
    expect(o.passed).toBe(false);
    expect(o.message).toBe('erwartet, dass die Funktion wirft; sie lief ohne Fehler durch');
  });

  it('scheitert lesbar, wenn keine Funktion übergeben wird', async () => {
    const o = await single((api) => api.expect(5).toThrow());
    expect(o.passed).toBe(false);
    expect(o.message).toBe('toThrow braucht eine Funktion, bekommen 5');
  });
});

describe('miniTest: runAll', () => {
  it('wartet asynchrone Tests ab', async () => {
    const api = createTestApi();
    api.test('später rot', async () => {
      await new Promise((r) => setTimeout(r, 5));
      api.expect(1).toBe(2);
    });
    api.test('später grün', async () => {
      await Promise.resolve();
      api.expect(1).toBe(1);
    });
    expect(await api.runAll()).toEqual([
      { name: 'später rot', passed: false, message: 'erwartet 2, bekommen 1' },
      { name: 'später grün', passed: true },
    ]);
  });

  it('ein Wurf bricht die übrigen Tests nicht ab', async () => {
    const api = createTestApi();
    api.test('wirft', () => {
      throw new Error('kaputt');
    });
    api.test('danach', () => api.expect(true).toBe(true));
    expect(await api.runAll()).toEqual([
      { name: 'wirft', passed: false, message: 'kaputt' },
      { name: 'danach', passed: true },
    ]);
  });

  it('ein Wurf ohne Error ergibt trotzdem eine lesbare Meldung', async () => {
    const api = createTestApi();
    api.test('Text', () => {
      throw 'kaputt';
    });
    api.test('nichts', () => {
      throw undefined;
    });
    api.test('Objekt', () => {
      throw { code: 1 };
    });
    expect((await api.runAll()).map((o) => o.message)).toEqual([
      'Der Test hat "kaputt" geworfen.',
      'Der Test hat undefined geworfen.',
      'Der Test hat {"code":1} geworfen.',
    ]);
  });

  it('eine Erwartung, die nach einem Fehlschlag kommt, ändert das Ergebnis nicht', async () => {
    const api = createTestApi();
    api.test('zwei', () => {
      api.expect(1).toBe(2);
      api.expect(1).toBe(1);
    });
    expect((await api.runAll())[0]).toEqual({ name: 'zwei', passed: false, message: 'erwartet 2, bekommen 1' });
  });

  it('ohne Tests eine leere Liste', async () => {
    expect(await createTestApi().runAll()).toEqual([]);
  });

  it('mehrfaches runAll läuft dieselben Tests erneut', async () => {
    const api = createTestApi();
    api.test('a', () => undefined);
    expect(await api.runAll()).toHaveLength(1);
    expect(await api.runAll()).toHaveLength(1);
  });

  it('zwei Instanzen teilen keine Tests', async () => {
    const first = createTestApi();
    const second = createTestApi();
    first.test('nur in der ersten', () => undefined);
    expect(await first.runAll()).toHaveLength(1);
    expect(await second.runAll()).toEqual([]);
  });

  it('test und expect funktionieren auch losgelöst vom Objekt', async () => {
    // So kommen sie als Globals in den Nutzercode.
    const { test, expect: check, runAll } = createTestApi();
    test('lose', () => check(1).toBe(1));
    expect(await runAll()).toEqual([{ name: 'lose', passed: true }]);
  });

  it('ein Test ohne Funktion scheitert lesbar', async () => {
    const api = createTestApi();
    (api.test as (name: string, fn: unknown) => void)('leer', undefined);
    expect(await api.runAll()).toEqual([
      { name: 'leer', passed: false, message: 'test braucht als zweites Argument eine Funktion, bekommen undefined' },
    ]);
  });
});
