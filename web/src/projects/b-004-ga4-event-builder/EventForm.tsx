import { useEffect, useId, useRef } from 'react';
import { Button } from '../../design/components/Button';
import { SegmentedControl } from '../../design/components/SegmentedControl';
import { emptyItem, itemSum, type EventDraft, type ItemDraft } from './draft';

const EVENT_TYPES = ['view_item', 'add_to_cart', 'purchase'].map((t) => ({ value: t, label: t }));

interface FieldProps {
  label: string;
  value: string;
  onChange: (value: string) => void;
  hint?: string;
  id: string;
  inputRef?: (el: HTMLInputElement | null) => void;
}

function Field({ label, value, onChange, hint, id, inputRef }: FieldProps) {
  return (
    <div className="ga4-field">
      <label htmlFor={id}>{label}</label>
      <input
        id={id}
        ref={inputRef}
        className="input ga4-mono"
        type="text"
        autoComplete="off"
        spellCheck={false}
        autoCapitalize="off"
        value={value}
        aria-describedby={hint ? `${id}-hint` : undefined}
        onChange={(e) => onChange(e.target.value)}
      />
      {hint ? (
        <p id={`${id}-hint`} className="ga4-hint">
          {hint}
        </p>
      ) : null}
    </div>
  );
}

interface EventFormProps {
  draft: EventDraft;
  onChange: (draft: EventDraft) => void;
}

/** Formular für das Event: Typ und Name, Kaufangaben, Währung, value und die Items. */
export function EventForm({ draft, onChange }: EventFormProps) {
  const id = useId();
  const purchase = draft.name === 'purchase';
  const sum = itemSum(draft.items);
  const firstInputs = useRef<(HTMLInputElement | null)[]>([]);
  const addButton = useRef<HTMLButtonElement>(null);
  // Nach „Hinzufügen“ springt der Fokus in das neue Item, nach „Entfernen“ zum Hinzufügen-Knopf.
  const focusAfter = useRef<'new-item' | 'add' | null>(null);

  useEffect(() => {
    if (focusAfter.current === 'new-item') firstInputs.current[draft.items.length - 1]?.focus();
    if (focusAfter.current === 'add') addButton.current?.focus();
    focusAfter.current = null;
  }, [draft.items.length]);

  const set = (patch: Partial<EventDraft>) => onChange({ ...draft, ...patch });
  const setItem = (index: number, patch: Partial<ItemDraft>) =>
    set({ items: draft.items.map((item, i) => (i === index ? { ...item, ...patch } : item)) });

  return (
    <form className="ga4-form" onSubmit={(e) => e.preventDefault()} aria-label="Event bauen">
      <div className="ga4-field">
        <span id={`${id}-type`} className="ga4-label">
          Eventtyp
        </span>
        <SegmentedControl
          label="Eventtyp"
          labelledBy={`${id}-type`}
          options={EVENT_TYPES}
          value={draft.name}
          onChange={(name) => set({ name })}
        />
      </div>

      <Field
        id={`${id}-name`}
        label="Eventname (event)"
        value={draft.name}
        onChange={(name) => set({ name })}
        hint="Frei änderbar. Üblich sind Kleinbuchstaben mit Unterstrich, Pflicht ist das nicht."
      />

      {purchase ? (
        <div className="ga4-pair">
          <Field
            id={`${id}-tid`}
            label="transaction_id"
            value={draft.transactionId}
            onChange={(transactionId) => set({ transactionId })}
          />
          <Field id={`${id}-shipping`} label="Versand (shipping)" value={draft.shipping} onChange={(shipping) => set({ shipping })} />
        </div>
      ) : null}

      <div className="ga4-pair">
        <Field
          id={`${id}-currency`}
          label="Währung (currency)"
          value={draft.currency}
          onChange={(currency) => set({ currency })}
          hint="Leer lassen, um das Feld wegzulassen."
        />
        <div className="ga4-field">
          <Field id={`${id}-value`} label="Wert (value)" value={draft.value} onChange={(value) => set({ value })} />
          <p className="ga4-hint">
            {sum === null ? 'Summe der Items: nicht berechenbar, ein Preis oder eine Menge ist keine Zahl.' : `Summe der Items: ${sum}`}
          </p>
          <div>
            <Button variant="quiet" disabled={sum === null} onClick={() => sum !== null && set({ value: String(sum) })}>
              Summe übernehmen
            </Button>
          </div>
        </div>
      </div>

      <fieldset className="ga4-items">
        <legend>Items</legend>
        <p id={`${id}-numbers`} className="ga4-hint">
          Preis und Menge: Zahlen mit Punkt, etwa 9.99. In Anführungszeichen wird daraus Text, ebenso mit Komma.
        </p>
        {draft.items.length === 0 ? <p className="ga4-hint">Keine Items.</p> : null}
        <ol className="ga4-item-list">
          {draft.items.map((item, i) => (
            <li key={i}>
              <fieldset className="ga4-item">
                <legend>Item {i + 1}</legend>
                <Field
                  id={`${id}-item-${i}-id`}
                  label="item_id"
                  value={item.id}
                  onChange={(v) => setItem(i, { id: v })}
                  inputRef={(el) => {
                    firstInputs.current[i] = el;
                  }}
                />
                <Field id={`${id}-item-${i}-name`} label="item_name" value={item.name} onChange={(v) => setItem(i, { name: v })} />
                <Field id={`${id}-item-${i}-price`} label="price" value={item.price} onChange={(v) => setItem(i, { price: v })} />
                <Field
                  id={`${id}-item-${i}-quantity`}
                  label="quantity"
                  value={item.quantity}
                  onChange={(v) => setItem(i, { quantity: v })}
                />
                <div className="ga4-item-remove">
                  <Button
                    variant="quiet"
                    aria-label={`Item ${i + 1} (${item.name.trim() || item.id.trim() || 'ohne Namen'}) entfernen`}
                    onClick={() => {
                      focusAfter.current = 'add';
                      set({ items: draft.items.filter((_, j) => j !== i) });
                    }}
                  >
                    <span aria-hidden="true">✕</span> Entfernen
                  </Button>
                </div>
              </fieldset>
            </li>
          ))}
        </ol>
        <div>
          <button
            ref={addButton}
            type="button"
            className="btn btn-secondary"
            onClick={() => {
              focusAfter.current = 'new-item';
              set({ items: [...draft.items, emptyItem()] });
            }}
          >
            Item hinzufügen
          </button>
        </div>
      </fieldset>
    </form>
  );
}
