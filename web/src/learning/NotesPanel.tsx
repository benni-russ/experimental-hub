import { useEffect, useRef, useState } from 'react';
import type { NotesBody } from '@hub/shared';
import { useNotes, useSaveNotes } from '../api';
import { Button } from '../design/components/Button';
import { Icon } from '../design/components/Icon';
import { SaveStatusLine, useAutosaver } from './useAutosaver';

function NotesFields({
  projectId,
  initial,
  firstRef,
}: {
  projectId: string;
  initial: NotesBody;
  firstRef: React.RefObject<HTMLTextAreaElement | null>;
}) {
  const save = useSaveNotes(projectId);
  const [values, setValues] = useState<NotesBody>(initial);
  const { schedule, status } = useAutosaver<NotesBody>(async (body) => {
    await save.mutateAsync(body);
  });

  function change(next: NotesBody) {
    setValues(next);
    schedule(next);
  }

  return (
    <>
      <div className="field">
        <label htmlFor="notes-note">Notizen</label>
        <textarea
          id="notes-note"
          ref={firstRef}
          className="input textarea"
          rows={6}
          value={values.note}
          onChange={(e) => change({ ...values, note: e.target.value })}
        />
      </div>
      <div className="field">
        <label htmlFor="notes-post">Post-Idee</label>
        <textarea
          id="notes-post"
          className="input textarea"
          rows={4}
          value={values.postIdea}
          onChange={(e) => change({ ...values, postIdea: e.target.value })}
        />
      </div>
      <SaveStatusLine status={status} />
    </>
  );
}

/**
 * Eine einzige Instanz: ab 1024 px Seitenleiste (CSS), darunter eine von unten
 * hochfahrende Leiste, die der Knopf „Notizen“ öffnet.
 */
export function NotesPanel({ projectId }: { projectId: string }) {
  const notes = useNotes(projectId);
  const [open, setOpen] = useState(false);
  const firstRef = useRef<HTMLTextAreaElement>(null);
  const panelRef = useRef<HTMLElement>(null);
  const toggleRef = useRef<HTMLButtonElement>(null);

  const wasOpen = useRef(false);
  useEffect(() => {
    // Felder können noch laden oder fehlen: dann auf die Leiste selbst.
    if (open) (firstRef.current ?? panelRef.current)?.focus();
    // Fokus zurück auf den Knopf, sobald dieser wieder sichtbar ist.
    else if (wasOpen.current) toggleRef.current?.focus();
    wasOpen.current = open;
  }, [open]);

  function close() {
    setOpen(false);
  }

  return (
    <>
      <button
        ref={toggleRef}
        type="button"
        className="btn btn-primary notes-toggle"
        aria-label="Notizen"
        title="Notizen"
        aria-expanded={open}
        aria-controls="notes-panel"
        onClick={() => (open ? close() : setOpen(true))}
      >
        <Icon name="pencil" size={22} />
      </button>
      <aside
        id="notes-panel"
        ref={panelRef}
        tabIndex={-1}
        className={`notes-panel${open ? ' is-open' : ''}`}
        aria-label="Notizen und Post-Idee"
        onKeyDown={(e) => {
          if (e.key === 'Escape' && open) close();
        }}
      >
        <div className="notes-head">
          <h2>Notizen</h2>
          <Button
            variant="secondary"
            className="notes-close"
            onClick={close}
            aria-label="Notizen schließen"
            title="Notizen schließen"
          >
            <Icon name="cross" size={20} />
          </Button>
        </div>
        {notes.isPending ? <p className="muted">Lädt …</p> : null}
        {notes.isError ? (
          <p className="field-error" role="alert">
            Gespeicherte Notizen konnten nicht geladen werden ({notes.error.message}). Bitte die
            Seite neu laden.
          </p>
        ) : null}
        {notes.data ? (
          <NotesFields
            projectId={projectId}
            initial={{ note: notes.data.note, postIdea: notes.data.postIdea }}
            firstRef={firstRef}
          />
        ) : null}
      </aside>
    </>
  );
}
