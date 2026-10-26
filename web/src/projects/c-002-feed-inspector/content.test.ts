import { describe, expect, it } from 'vitest';
import { STALE_DAYS, inspectFeed } from '../../personalization/inspectFeed';
import { FEED_DATE, RAW_FEED } from '../../personalization/rawFeed';
import { allText, checkStructure } from '../contentChecks';
import { meta } from './content';

const text = allText(meta);
const choice = (id: string) => {
  const q = meta.quiz.find((x) => x.id === id);
  if (q?.type !== 'choice') throw new Error(`${id} ist keine Auswahlfrage`);
  return q;
};

// Zahlen des Feeds, aus der Prüfung berechnet (je Eintrag zählt die schwerste Aktion).
const { products, issues } = inspectFeed(RAW_FEED, FEED_DATE);
const actionsOf = (index: number) => issues.filter((i) => i.index === index).map((i) => i.action);
const dropped = products.filter((p) => actionsOf(p.index).includes('drop')).length;
const repaired = products.filter((p) => !actionsOf(p.index).includes('drop') && actionsOf(p.index).includes('repair')).length;
const warned = products.filter((p) => actionsOf(p.index).every((a) => a === 'warn') && actionsOf(p.index).length > 0).length;
const clean = products.filter((p) => actionsOf(p.index).length === 0).length;

describe('C-002 Inhalte: Aufbau', () => {
  it('Umfang und IDs stimmen', () => {
    expect(checkStructure(meta, { quiz: 4, reflection: [2, 3], cards: [6, 8] })).toEqual([]);
  });

  it('gehört zu Personalization, baut auf C-001 und B-001 auf, führt zu C-003, die Schätzfrage ist die erste', () => {
    expect(meta.id).toBe('C-002');
    expect(meta.track).toBe('personalization');
    expect(meta.kind).toBe('project');
    expect(meta.buildsOn).toEqual(['C-001', 'B-001']);
    expect(meta.leadsTo).toEqual(['C-003']);
    expect(meta.quiz.map((q) => q.id)).toEqual(['C-002-quiz-01', 'C-002-quiz-02', 'C-002-quiz-03', 'C-002-quiz-04']);
    expect(meta.intro.estimateQuestionId).toBe('C-002-quiz-01');
  });

  it('drei Code-Aufgaben mit Vorlage, zwei Tipps und Musterlösung', () => {
    expect(meta.codeTasks?.map((t) => t.id)).toEqual(['C-002-code-01', 'C-002-code-02', 'C-002-code-03']);
    const names = ['parseFeed', 'findDuplicateIds', 'checkProduct'];
    meta.codeTasks?.forEach((task, i) => {
      expect(task.hints).toHaveLength(2);
      expect(task.starter).toContain('// dein Code');
      expect(task.starter.trimEnd()).toMatch(new RegExp(`return \\{ ${names[i]} \\};$`));
      expect(task.solution.trimEnd()).toMatch(new RegExp(`return \\{ ${names[i]} \\};$`));
      expect(task.prompt).toContain(`\`${names[i]}(`);
    });
  });
});

describe('C-002 Inhalte: Antwortpositionen', () => {
  it('die richtige Option steht nicht immer an derselben Stelle', () => {
    const idx = ['C-002-quiz-02', 'C-002-quiz-03', 'C-002-quiz-04'].map((id) => choice(id).correctIndex);
    expect(idx).toEqual([2, 0, 0]);
    expect(new Set(idx).size).toBeGreaterThan(1);
  });
});

describe('C-002 Inhalte: zitierte Zahlen', () => {
  it('der Text nennt nur geprüfte Zahlen', () => {
    // 28 Einträge, 20 fehlerfrei, 8 mit Fehler, davon 4 aussortiert, 3 repariert, 1 Hinweis;
    // dazu `0` in der Aufgabe zum Preis. Sonst keine Ziffern.
    expect([...new Set(text.match(/\d+/g))].sort()).toEqual(['0', '1', '20', '28', '3', '4', '8']);
  });

  it('Schätzfrage: 28 Einträge, davon 20 fehlerfrei, aus RAW_FEED berechnet', () => {
    const q = meta.quiz[0];
    expect(products).toHaveLength(28);
    expect(clean).toBe(20);
    expect(q?.prompt).toContain('28 Einträge');
    expect(q?.type === 'estimate' && q.answer).toBe(clean);
    expect(q?.type === 'estimate' && q.tolerance).toBe(0.25);
    expect(q?.type === 'estimate' && q.unit).toBe('Einträge');
    expect(meta.intro.text).toContain('28 Einträge');
  });

  it('Auflösung: 8 Einträge mit Fehler, 4 aussortiert, 3 repariert, 1 nur Hinweis', () => {
    expect([dropped, repaired, warned]).toEqual([4, 3, 1]);
    expect(dropped + repaired + warned).toBe(8);
    const q = meta.quiz[0];
    expect(q?.explanation).toContain('20 von 28 Einträgen sind fehlerfrei');
    expect(q?.explanation).toContain('8 haben genau einen Fehler: 4 werden aussortiert, 3 lassen sich reparieren, und bei 1 genügt ein Hinweis');
    // „genau einen Fehler“: acht Einträge mit je einem Issue
    expect(new Set(issues.map((i) => i.index)).size).toBe(8);
    expect(issues).toHaveLength(8);
  });

  it('„eine Woche“ entspricht STALE_DAYS', () => {
    expect(STALE_DAYS).toBe(7);
    expect(text).toContain('mehr als einer Woche');
    expect(text).toContain('mehr als eine Woche');
  });

  it('Aufgabe zum Preis: Preis `0` und Zahlen größer als `0` sind ungültig bzw. gültig', () => {
    const task = meta.codeTasks?.[2];
    expect(task?.prompt).toContain('keine Zahl größer als `0`');
  });
});
