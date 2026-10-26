import { useEffect, useId, useRef } from 'react';
import { Button } from '../../design/components/Button';
import type { RequestDraft } from './scenarios';

const METHODS: RequestDraft['method'][] = ['GET', 'POST', 'PUT', 'DELETE'];

interface RequestBuilderProps {
  draft: RequestDraft;
  onChange: (draft: RequestDraft) => void;
  onSend: () => void;
  disabled?: boolean;
}

/** Baukasten für eine Anfrage: Methode, Pfad, Header-Liste und (bei POST und PUT) ein Body. */
export function RequestBuilder({ draft, onChange, onSend, disabled }: RequestBuilderProps) {
  const id = useId();
  const hasBody = draft.method === 'POST' || draft.method === 'PUT';
  const nameInputs = useRef<(HTMLInputElement | null)[]>([]);
  const addButton = useRef<HTMLButtonElement>(null);
  // Nach „Hinzufügen“ springt der Fokus in die neue Zeile, nach „Entfernen“ zum Hinzufügen-Knopf.
  const focusAfter = useRef<'new-row' | 'add' | null>(null);

  useEffect(() => {
    if (focusAfter.current === 'new-row') nameInputs.current[draft.headers.length - 1]?.focus();
    if (focusAfter.current === 'add') addButton.current?.focus();
    focusAfter.current = null;
  }, [draft.headers.length]);

  const set = (patch: Partial<RequestDraft>) => onChange({ ...draft, ...patch });
  const setHeader = (index: number, part: 0 | 1, value: string) =>
    set({
      headers: draft.headers.map((h, i): [string, string] =>
        i === index ? (part === 0 ? [value, h[1]] : [h[0], value]) : h,
      ),
    });

  return (
    <form
      className="http-builder"
      onSubmit={(e) => {
        e.preventDefault();
        if (!disabled) onSend();
      }}
    >
      <div className="http-line">
        <div className="http-field http-field-method">
          <label htmlFor={`${id}-method`}>Methode</label>
          <select
            id={`${id}-method`}
            className="input"
            value={draft.method}
            onChange={(e) => set({ method: e.target.value as RequestDraft['method'] })}
          >
            {METHODS.map((m) => (
              <option key={m} value={m}>
                {m}
              </option>
            ))}
          </select>
        </div>
        <div className="http-field http-field-path">
          <label htmlFor={`${id}-path`}>Pfad</label>
          <input
            id={`${id}-path`}
            className="input http-mono"
            type="text"
            autoComplete="off"
            spellCheck={false}
            autoCapitalize="off"
            value={draft.path}
            onChange={(e) => set({ path: e.target.value })}
          />
        </div>
      </div>

      <fieldset className="http-headers">
        <legend>Header</legend>
        {draft.headers.length === 0 ? <p className="http-muted">Keine Header.</p> : null}
        <ul className="http-header-list">
          {draft.headers.map(([name, value], i) => (
            <li key={i} className="http-header-row">
              <label className="visually-hidden" htmlFor={`${id}-hn-${i}`}>
                Header-Name {i + 1}
              </label>
              <input
                id={`${id}-hn-${i}`}
                ref={(el) => {
                  nameInputs.current[i] = el;
                }}
                className="input http-mono"
                type="text"
                autoComplete="off"
                spellCheck={false}
                autoCapitalize="off"
                placeholder="Name"
                value={name}
                onChange={(e) => setHeader(i, 0, e.target.value)}
              />
              <label className="visually-hidden" htmlFor={`${id}-hv-${i}`}>
                Header-Wert {i + 1}
              </label>
              <input
                id={`${id}-hv-${i}`}
                className="input http-mono"
                type="text"
                autoComplete="off"
                spellCheck={false}
                autoCapitalize="off"
                placeholder="Wert"
                value={value}
                onChange={(e) => setHeader(i, 1, e.target.value)}
              />
              <Button
                variant="quiet"
                className="http-remove"
                aria-label={`Header ${name.trim() || i + 1} entfernen`}
                onClick={() => {
                  focusAfter.current = 'add';
                  set({ headers: draft.headers.filter((_, j) => j !== i) });
                }}
              >
                <span aria-hidden="true">✕</span>
              </Button>
            </li>
          ))}
        </ul>
        <button
          ref={addButton}
          type="button"
          className="btn btn-secondary"
          onClick={() => {
            focusAfter.current = 'new-row';
            set({ headers: [...draft.headers, ['', '']] });
          }}
        >
          Header hinzufügen
        </button>
      </fieldset>

      {hasBody ? (
        <div className="http-field">
          <label htmlFor={`${id}-body`}>Body</label>
          <textarea
            id={`${id}-body`}
            className="input textarea http-mono"
            rows={5}
            spellCheck={false}
            autoCapitalize="off"
            value={draft.body}
            onChange={(e) => set({ body: e.target.value })}
          />
        </div>
      ) : null}

      <div>
        <Button type="submit" disabled={disabled}>
          Senden
        </Button>
      </div>
    </form>
  );
}
