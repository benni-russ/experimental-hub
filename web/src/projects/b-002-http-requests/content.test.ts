import { describe, expect, it } from 'vitest';
import { STATUS_CODES } from '../../http/statusCodes';
import { allText, checkStructure } from '../contentChecks';
import { meta } from './content';
import { demoServer, sendDraft, type RequestDraft } from './scenarios';

const text = allText(meta);
const byStatus = (n: number) => STATUS_CODES.find((s) => s.status === n);

describe('B-002 Inhalte: Aufbau', () => {
  it('Umfang und IDs stimmen', () => {
    expect(checkStructure(meta, { quiz: 4, reflection: [2, 3], cards: [5, 8] })).toEqual([]);
  });

  it('baut auf B-001 auf, die Schätzfrage ist die erste', () => {
    expect(meta.buildsOn).toEqual(['B-001']);
    expect(meta.intro.estimateQuestionId).toBe('B-002-quiz-01');
    expect(meta.quiz[0]?.id).toBe('B-002-quiz-01');
    expect(meta.quiz[0]?.type).toBe('estimate');
  });

  it('zwei Code-Aufgaben mit Vorlage, zwei Tipps und Musterlösung', () => {
    expect(meta.codeTasks?.map((t) => t.id)).toEqual(['B-002-code-01', 'B-002-code-02']);
    for (const t of meta.codeTasks ?? []) {
      expect(t.hints).toHaveLength(2);
      expect(t.starter).toContain('// dein Code');
      expect(t.starter.trimEnd()).toMatch(/return \{ \w+ \};$/);
      expect(t.solution.trimEnd()).toMatch(/return \{ \w+ \};$/);
    }
  });

  // Quiz, Karten, Reflexion und Einstieg zeigen Text ohne Formatierung.
  it('Backticks nur in Code-Aufgaben', () => {
    const plain = [
      meta.intro.text,
      meta.question,
      ...meta.quiz.flatMap((q) => [q.prompt, q.explanation, ...(q.type === 'choice' ? q.options : [])]),
      ...meta.reflection.map((r) => r.prompt),
      ...meta.cards.flatMap((c) => [c.front, c.back]),
    ].join('\n');
    expect(plain).not.toContain('`');
  });
});

describe('B-002 Inhalte: zitierte Zahlen', () => {
  // Jede Zahl im Text steht hier; jede wird unten nachgerechnet oder geprüft.
  it('der Text nennt nur geprüfte Zahlen', () => {
    const numbers = [...new Set(text.match(/\d+/g))].sort();
    expect(numbers).toEqual(
      [
        // Statuscodes der Tabelle
        '200', '201', '204', '400', '401', '403', '404', '429', '500', '503',
        // Bereichsgrenzen und Randwerte in Aufgabe 1, Hinweis auf 404 („4“) und 5xx in Aufgabe 2
        '299', '499', '599', '199', '300', '600', '2', '4', '5',
        // 100 steckt im Tipp: Math.floor(status / 100) ist die erste Ziffer
        '100',
      ].sort(),
    );
  });

  it('alle genannten Statuscodes der Tabelle stehen in der Tabelle', () => {
    const codes = [...new Set(text.match(/\b[2-5]\d\d\b/g))].map(Number);
    const outside = [299, 499, 599, 199, 300, 600].map(Number);
    for (const code of codes.filter((c) => !outside.includes(c))) expect(byStatus(code), String(code)).toBeDefined();
  });

  it('Schätzfrage: genau fünf der zehn Codes sind Fehler des Clients', () => {
    expect(STATUS_CODES).toHaveLength(10);
    const clientFaults = STATUS_CODES.filter((s) => s.whoseFault === 'Client');
    expect(clientFaults.length).toBe(5);
    expect(clientFaults.map((s) => s.status)).toEqual([400, 401, 403, 404, 429]);
    const q = meta.quiz.find((x) => x.id === 'B-002-quiz-01');
    expect(q?.type === 'estimate' && q.answer).toBe(clientFaults.length);
    expect(text).toContain('zehn Statuscodes');
  });

  it('die übrigen fünf: drei Erfolge, zwei Serverfehler', () => {
    expect(STATUS_CODES.filter((s) => s.whoseFault === 'niemand').map((s) => s.status)).toEqual([200, 201, 204]);
    expect(STATUS_CODES.filter((s) => s.whoseFault === 'Server').map((s) => s.status)).toEqual([500, 503]);
  });

  it('die erste Ziffer entscheidet über die Klasse', () => {
    for (const s of STATUS_CODES) expect(s.klass).toBe(`${Math.floor(s.status / 100)}xx`); // wie im Tipp von Aufgabe 1
  });

  it('wiederholbar sind 429 und die Serverfehler, nichts sonst', () => {
    expect(STATUS_CODES.filter((s) => s.retry).map((s) => s.status)).toEqual([429, 500, 503]);
    // Aufgabe 1 beschreibt genau diese Regel.
    const rule = (status: number) => Math.floor(status / 100) === 5 || status === 429;
    for (const s of STATUS_CODES) expect(rule(s.status), String(s.status)).toBe(s.retry);
  });

  it('Kurztexte in Quiz 04: 503 „Nicht verfügbar“, 400 „Ungültige Anfrage“, 500 „Serverfehler“', () => {
    expect(byStatus(503)?.text).toBe('Nicht verfügbar');
    expect(byStatus(400)?.text).toBe('Ungültige Anfrage');
    expect(byStatus(500)?.text).toBe('Serverfehler');
    expect(text).toContain('503, Nicht verfügbar.');
    expect(text).toContain('400, Ungültige Anfrage.');
    expect(text).toContain('500, Serverfehler.');
  });

  it('401 und 403 sind getrennte Fälle der Tabelle', () => {
    expect(byStatus(401)?.text).toBe('Nicht angemeldet');
    expect(byStatus(403)?.text).toBe('Verboten');
  });

  it('Der Token „Bearer demo“ öffnet /products, ohne ihn kommt 401', async () => {
    expect(text).toContain('Bearer demo');
    const draft = { method: 'GET', path: '/products/1', body: '' } as const;
    expect((await sendDraft(demoServer(), { ...draft, headers: [['authorization', 'Bearer demo']] })).status).toBe(200);
    expect((await sendDraft(demoServer(), { ...draft, headers: [] })).status).toBe(401);
  });

  it('der Server antwortet erst 503, dann 500', async () => {
    const server = demoServer();
    const d: RequestDraft = { method: 'GET', path: '/stock', headers: [], body: '' };
    expect([(await sendDraft(server, d)).status, (await sendDraft(server, d)).status]).toEqual([503, 500]);
  });

  it('Aufgabe 2: /item im Text ist der Pfad des nachgebauten Servers', () => {
    expect(meta.codeTasks?.[1]?.prompt).toContain('`/item`');
  });
});
