import { useEffect, useMemo, useRef, useState } from 'react';
import { createAutosaver, type SaveStatus } from './autosave';

/**
 * Autosave für ein Eingabefeld. Speichert beim Seitenwechsel (Unmount) und
 * wenn die Seite in den Hintergrund geht, damit nichts im Timer hängen bleibt.
 */
export function useAutosaver<T>(save: (value: T) => Promise<void>) {
  const saveRef = useRef(save);
  useEffect(() => {
    saveRef.current = save;
  });
  const [status, setStatus] = useState<SaveStatus>('idle');
  const saver = useMemo(
    () => createAutosaver<T>((v) => saveRef.current(v), { delayMs: 800, onStatus: setStatus }),
    [],
  );

  useEffect(() => {
    const onHide = () => {
      if (document.visibilityState === 'hidden') void saver.flush();
    };
    const onPageHide = () => void saver.flush();
    document.addEventListener('visibilitychange', onHide);
    window.addEventListener('pagehide', onPageHide);
    return () => {
      document.removeEventListener('visibilitychange', onHide);
      window.removeEventListener('pagehide', onPageHide);
      void saver.flush();
    };
  }, [saver]);

  return { schedule: saver.schedule, flush: saver.flush, status };
}

const TEXT: Partial<Record<SaveStatus, string>> = {
  saving: 'Speichert …',
  saved: 'Gespeichert',
  error: 'Nicht gespeichert – wird beim nächsten Tippen erneut versucht',
};

export function SaveStatusLine({ status }: { status: SaveStatus }) {
  return (
    <p className={`save-status save-status-${status}`} aria-live="polite">
      {TEXT[status] ?? ''}
    </p>
  );
}
