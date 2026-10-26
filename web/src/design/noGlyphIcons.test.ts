import { describe, expect, it } from 'vitest';

// DESIGN.md: keine Schriftglyphen als Icons. Haken und Kreuz kommen aus
// <Icon name="check" /> und <Icon name="cross" />.
const GLYPHS = /[✓✗✔✘]/u;

const COMPONENTS = import.meta.glob<string>(['../**/*.tsx', '!../**/*.test.tsx'], {
  query: '?raw',
  import: 'default',
  eager: true,
});

describe('keine Glyphen als Icons', () => {
  it('kein ✓ oder ✗ in Komponenten', () => {
    expect(Object.keys(COMPONENTS).length).toBeGreaterThan(20);
    const offenders = Object.entries(COMPONENTS)
      .filter(([, source]) => GLYPHS.test(source))
      .map(([file]) => file);
    expect(offenders).toEqual([]);
  });
});
