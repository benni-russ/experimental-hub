import { describe, expect, it } from 'vitest';
import { allText, checkStructure } from '../contentChecks';
import { meta } from './content';
import { VALID_PURCHASE } from './fixtures';
import { MAX_NAME_LENGTH, VALUE_TOLERANCE, validateEvent } from './validateEvent';

const text = allText(meta);
const choice = (id: string) => {
  const q = meta.quiz.find((x) => x.id === id);
  if (q?.type !== 'choice') throw new Error(`${id} ist keine Auswahlfrage`);
  return q;
};
/** 34.99 → „34,99“, wie im Text */
const de = (n: number) => n.toFixed(2).replace('.', ',');
const nameIssues = (name: string) => validateEvent({ event: name }).filter((i) => i.path === 'event');

describe('B-004 Inhalte: Aufbau', () => {
  it('Umfang und IDs stimmen', () => {
    expect(checkStructure(meta, { quiz: 4, reflection: [2, 3], cards: [5, 8] })).toEqual([]);
  });

  it('baut auf B-001 und B-002 auf, führt zu B-005, die Schätzfrage ist die erste', () => {
    expect(meta.id).toBe('B-004');
    expect(meta.track).toBe('web');
    expect(meta.buildsOn).toEqual(['B-001', 'B-002']);
    expect(meta.leadsTo).toEqual(['B-005']);
    expect(meta.quiz.map((q) => q.id)).toEqual(['B-004-quiz-01', 'B-004-quiz-02', 'B-004-quiz-03', 'B-004-quiz-04']);
    expect(meta.intro.estimateQuestionId).toBe('B-004-quiz-01');
  });

  it('eine Code-Aufgabe mit Vorlage, zwei Tipps und Musterlösung', () => {
    const task = meta.codeTasks?.[0];
    expect(meta.codeTasks?.map((t) => t.id)).toEqual(['B-004-code-01']);
    expect(task?.hints).toHaveLength(2);
    expect(task?.starter.trimEnd()).toMatch(/return \{ validateEvent \};$/);
    expect(task?.solution.trimEnd()).toMatch(/return \{ validateEvent \};$/);
    expect(task?.starter).toContain('// dein Code');
    // Die Aufgabe nennt genau die fünf vereinfachten Regeln.
    for (const code of ['name_format', 'currency_missing', 'price_not_number', 'value_mismatch', 'transaction_id_missing']) {
      expect(task?.prompt).toContain(`\`${code}\``);
    }
  });
});

describe('B-004 Inhalte: zitierte Zahlen', () => {
  // Jede Zahl im Text steht hier; jede wird unten nachgerechnet.
  it('der Text nennt nur geprüfte Zahlen', () => {
    const numbers = [...new Set(text.match(/\d+/g))].sort();
    expect(numbers).toEqual(
      [
        // Höchstlänge des Eventnamens
        '40',
        // Toleranz 0.01 in der Code-Aufgabe
        '0',
        '01',
        // Quiz 3: Preise, Versand und die vier Antworten
        '12',
        '50',
        '9',
        '99',
        '4',
        '90',
        '34',
        '39',
        '89',
        '22',
        '49',
        '27',
      ].sort(),
    );
  });

  it(`Schätzfrage: höchstens ${MAX_NAME_LENGTH} Zeichen`, () => {
    const q = meta.quiz[0];
    expect(q?.prompt).toBe('Wie viele Zeichen darf ein GA4-Eventname höchstens haben?');
    expect(q?.type === 'estimate' && q.answer).toBe(MAX_NAME_LENGTH);
    expect(q?.type === 'estimate' && q.tolerance).toBe(0.25);
    expect(MAX_NAME_LENGTH).toBe(40);
    expect(q?.explanation).toContain(`${MAX_NAME_LENGTH} Zeichen`);
    expect(text).toContain(`Höchstens ${MAX_NAME_LENGTH} Zeichen`);
    // Die Grenze aus dem Text gilt auch im Prüfer.
    expect(nameIssues('a'.repeat(MAX_NAME_LENGTH))).toEqual([]);
    expect(nameIssues('a'.repeat(MAX_NAME_LENGTH + 1)).map((i) => i.code)).toEqual(['name_too_long']);
  });

  it('Quiz 2: Nur die richtige Option ist ein gültiger Eventname', () => {
    const q = choice('B-004-quiz-02');
    q.options.forEach((name, i) => {
      expect(nameIssues(name).length === 0, name).toBe(i === q.correctIndex);
    });
    expect(new Set(q.options).size).toBe(q.options.length);
  });

  it('Quiz 3: Preise und Antworten passen zum gültigen Kauf aus der Demo', () => {
    const q = choice('B-004-quiz-03');
    const [cup, tin] = VALID_PURCHASE.ecommerce.items;
    const shipping = VALID_PURCHASE.ecommerce.shipping;
    expect(cup!.quantity).toBe(2);
    expect(tin!.quantity).toBe(1);
    expect(q.prompt).toContain(`zwei Becher zu je ${de(cup!.price)} Euro`);
    expect(q.prompt).toContain(`eine Teedose zu ${de(tin!.price)} Euro`);
    expect(q.prompt).toContain(`${de(shipping)} Euro Versand`);

    const sum = cup!.price * cup!.quantity + tin!.price * tin!.quantity;
    expect(Math.abs(VALID_PURCHASE.ecommerce.value - sum)).toBeLessThanOrEqual(VALUE_TOLERANCE);
    const withShipping = sum + shipping;
    const quantityForgotten = cup!.price + tin!.price;
    const bothWrong = quantityForgotten + shipping;
    expect(q.options).toEqual([de(sum), de(withShipping), de(quantityForgotten), de(bothWrong)]);
    expect(q.correctIndex).toBe(0);
    expect(q.explanation).toContain(`zweimal ${de(cup!.price)} plus einmal ${de(tin!.price)}`);
    expect(q.explanation).toContain(`${de(withShipping)} hätte den Versand mitgezählt`);
    expect(q.explanation).toContain(`${de(quantityForgotten)} die Menge vergessen`);

    // Der Prüfer sieht es genauso: Nur die richtige Antwort ergibt kein value_mismatch.
    const withValue = (value: number) => ({ ...VALID_PURCHASE, ecommerce: { ...VALID_PURCHASE.ecommerce, value } });
    expect(validateEvent(withValue(sum))).toEqual([]);
    for (const wrong of [withShipping, quantityForgotten, bothWrong]) {
      expect(validateEvent(withValue(wrong)).map((i) => i.code)).toEqual(['value_mismatch']);
    }
  });

  it('Quiz 4: Die richtige Option nennt das Leeren des vorigen Objekts', () => {
    const q = choice('B-004-quiz-04');
    expect(q.options[q.correctIndex]).toContain('vorigen');
  });

  it(`Code-Aufgabe: Toleranz ${VALUE_TOLERANCE} wie im Prüfer`, () => {
    const task = meta.codeTasks?.[0];
    expect(VALUE_TOLERANCE).toBe(0.01);
    expect(task?.prompt).toContain(`\`${VALUE_TOLERANCE}\``);
    expect(task?.solution).toContain(`> ${VALUE_TOLERANCE}`);
  });
});
