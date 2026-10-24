import { useIsMutating, useQueryClient } from '@tanstack/react-query';
import { useEffect, useState } from 'react';
import { useAppState } from '../api';
import { nextSaveState, statusText, type SaveState } from './status';

/**
 * Zustand für die Statuskarte, nur aus react-query: laufende Änderungen, das
 * Ergebnis der letzten (über den Mutation-Cache, denn abgeschlossene Mutationen
 * fallen nach ein paar Minuten aus dem Cache) und der Lernstand.
 */
export function useServerStatus() {
  const qc = useQueryClient();
  const state = useAppState();
  // Offline pausiert react-query Mutationen; sie zählen nicht als „Speichert …“.
  const saving = useIsMutating({ predicate: (m) => !m.state.isPaused }) > 0;
  const paused = useIsMutating({ predicate: (m) => m.state.isPaused }) > 0;
  const [last, setLast] = useState<SaveState>({ at: null, error: null });

  useEffect(
    () =>
      qc.getMutationCache().subscribe((event) => {
        if (event.type !== 'updated') return;
        const action = event.action;
        const now = Date.now();
        setLast((prev) => nextSaveState(prev, action, now));
      }),
    [qc],
  );

  return statusText({
    saving,
    paused,
    lastSavedAt: last.at,
    saveError: last.error,
    stateError: state.isError ? state.error : null,
    stateLoaded: state.data !== undefined,
  });
}
