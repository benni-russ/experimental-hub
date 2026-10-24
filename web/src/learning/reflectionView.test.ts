import { describe, expect, it } from 'vitest';
import { reflectionView } from './reflectionView';

describe('reflectionView', () => {
  it('lädt, solange weder Daten noch Fehler da sind', () => {
    expect(reflectionView({ hasData: false, isError: false })).toBe('loading');
  });

  it('zeigt die Fehleransicht nur ohne Daten', () => {
    expect(reflectionView({ hasData: false, isError: true })).toBe('error');
  });

  it('behält die Textfelder, wenn ein Refetch mit vorhandenen Daten scheitert', () => {
    expect(reflectionView({ hasData: true, isError: true })).toBe('items');
  });

  it('zeigt die Textfelder bei Daten ohne Fehler', () => {
    expect(reflectionView({ hasData: true, isError: false })).toBe('items');
  });
});
