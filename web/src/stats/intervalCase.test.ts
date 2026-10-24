import { describe, expect, it } from 'vitest';
import { differenceInterval } from './proportions';
import { intervalCase, significanceOf } from './intervalCase';

describe('significanceOf', () => {
  it('ganz über 0: positiv', () => expect(significanceOf(0.1, 0.7)).toBe('positive'));
  it('ganz unter 0: negativ', () => expect(significanceOf(-2, -1)).toBe('negative'));
  it('über 0 hinweg: schließt 0 ein', () => expect(significanceOf(-0.5, 1.6)).toBe('includesZero'));
  it('ein Intervall, das 0 berührt, schließt 0 ein', () => {
    expect(significanceOf(0, 1)).toBe('includesZero');
    expect(significanceOf(-1, 0)).toBe('includesZero');
  });
});

describe('intervalCase', () => {
  it('ohne MDE gibt es keinen Fall', () => expect(intervalCase(0.1, 0.7, null)).toBeNull());

  it('signifikant und ganz über dem MDE: both', () => expect(intervalCase(1.3, 2.7, 1)).toBe('both'));
  it('MDE-Grenze: unteres Ende genau am MDE zählt als erreicht', () => expect(intervalCase(1, 2, 1)).toBe('both'));
  it('signifikant, ganz unter dem MDE: small', () => expect(intervalCase(0.1, 0.7, 1)).toBe('small'));
  it('signifikant, MDE im Intervall: significantOpen', () => expect(intervalCase(0.15, 1.85, 1)).toBe('significantOpen'));
  it('oberes Ende genau am MDE: MDE liegt im Intervall', () => expect(intervalCase(0.2, 1, 1)).toBe('significantOpen'));
  it('schließt 0 und MDE ein: open', () => expect(intervalCase(-0.5, 1.6, 1)).toBe('open'));
  it('schließt 0 ein, endet vor dem MDE: excluded', () => expect(intervalCase(-0.4, 0.5, 1)).toBe('excluded'));
  it('ganz unter 0: negative, unabhängig vom MDE', () => expect(intervalCase(-2, -1, 1)).toBe('negative'));
  it('berührt 0 von oben und endet vor dem MDE: excluded, nicht small', () =>
    expect(intervalCase(0, 0.5, 1)).toBe('excluded'));

  it('Untergrenze genau 0: die Obergrenze ist der größte verträgliche Effekt und entscheidet über den MDE', () => {
    // Obergrenze über dem MDE: der MDE ist noch verträglich.
    expect(intervalCase(0, 2, 1)).toBe('open');
    // Obergrenze genau am MDE: der MDE liegt im Intervall.
    expect(intervalCase(0, 1, 1)).toBe('open');
    // Obergrenze knapp unter dem MDE: der relevante Effekt ist ausgeschlossen.
    expect(intervalCase(0, 0.99, 1)).toBe('excluded');
    // Das Intervall berührt 0, ist also nicht signifikant.
    expect(significanceOf(0, 2)).toBe('includesZero');
  });

  it('10.000/1.000 gegen 10.000/1.020, MDE 2: schließt 0 ein, relevant ausgeschlossen', () => {
    const i = differenceInterval({ visitorsA: 10000, conversionsA: 1000, visitorsB: 10000, conversionsB: 1020 }, 0.95)!;
    expect(i.lower).toBeLessThan(0);
    expect(intervalCase(i.lower, i.upper, 2)).toBe('excluded');
  });
});
