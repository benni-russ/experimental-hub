import { describe, expect, it } from 'vitest';
import { projects } from '../projects';
import { CHECKS } from './registry';

describe('registry', () => {
  it('hat zu jeder Code-Aufgabe ein Prüfmodul und umgekehrt', () => {
    // `projects` enthält 000-* nur in der Entwicklung (Vitest läuft mit DEV = true);
    // die Registry führt dessen Eintrag immer, im Produktionsbuild ist er ungenutzt.
    const ids = projects.flatMap((p) => (p.meta.codeTasks ?? []).map((t) => t.id)).sort();
    const registered = Object.keys(CHECKS).filter((id) => import.meta.env.DEV || !id.startsWith('000-'));
    expect(registered.sort()).toEqual(ids);
  });

  it('lädt für jeden Eintrag ein Modul mit Prüfungen', async () => {
    for (const [id, load] of Object.entries(CHECKS)) {
      const mod = (await load()).default;
      expect(mod.checks.length, id).toBeGreaterThan(0);
    }
  });
});
