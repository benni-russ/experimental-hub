import { describe, expect, it } from 'vitest';
import { describeResult } from './resultView';

describe('describeResult', () => {
  it('zählt bestandene Prüfungen', () => {
    const r = describeResult({
      status: 'ok',
      results: [
        { name: 'a', passed: true },
        { name: 'b', passed: false, message: 'erwartet 4' },
        { name: 'c', passed: true },
      ],
    });
    expect(r.summary).toBe('2 von 3 bestanden');
    expect(r.allPassed).toBe(false);
    expect(r.items).toHaveLength(3);
  });

  it('alle bestanden', () => {
    const r = describeResult({ status: 'ok', results: [{ name: 'a', passed: true }] });
    expect(r.summary).toBe('1 von 1 bestanden');
    expect(r.allPassed).toBe(true);
  });

  it('Syntaxfehler mit Zeile', () => {
    const r = describeResult({ status: 'error', message: 'Syntaxfehler: Unexpected token', line: 2 });
    expect(r.summary).toBe('Syntaxfehler in Zeile 2: Unexpected token');
    expect(r.errorLine).toBe(2);
  });

  it('Laufzeitfehler mit Zeile', () => {
    const r = describeResult({ status: 'error', message: 'x is not defined', line: 4 });
    expect(r.summary).toBe('Fehler in Zeile 4: x is not defined');
  });

  it('Fehler ohne Zeile', () => {
    const r = describeResult({ status: 'error', message: 'x is not defined' });
    expect(r.summary).toBe('Fehler: x is not defined');
    expect(r.errorLine).toBeNull();
  });

  it('Fehler der Prüfung selbst', () => {
    expect(describeResult({ status: 'error', message: 'Die Prüfung konnte nicht geladen werden.' }).summary).toBe(
      'Die Prüfung ist abgebrochen: Die Prüfung konnte nicht geladen werden.',
    );
  });

  it('Startfehler und unbekannte Aufgabe gelten als abgebrochene Prüfung', () => {
    expect(describeResult({ status: 'error', message: 'Unbekannte Aufgabe' }).summary).toBe(
      'Die Prüfung ist abgebrochen: Unbekannte Aufgabe',
    );
    expect(describeResult({ status: 'error', message: 'Die Prüfung konnte nicht gestartet werden.' }).errorLine).toBeNull();
  });

  it('Timeout', () => {
    expect(describeResult({ status: 'timeout' }).summary).toBe('Läuft zu lange – Endlosschleife oder zu lange Wartezeit?');
  });
});
