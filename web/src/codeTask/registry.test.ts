import { describe, expect, it } from 'vitest';
import { projects } from '../projects';
import { CHECKS } from './registry';

describe('registry', () => {
  it('hat zu jeder Code-Aufgabe ein Prüfmodul und umgekehrt', () => {
    const ids = projects.flatMap((p) => (p.meta.codeTasks ?? []).map((t) => t.id)).sort();
    expect(Object.keys(CHECKS).sort()).toEqual(ids);
  });

  it('lädt für jeden Eintrag ein Modul mit Prüfungen', async () => {
    for (const [id, load] of Object.entries(CHECKS)) {
      const mod = (await load()).default;
      expect(mod.checks.length, id).toBeGreaterThan(0);
    }
  });
});
