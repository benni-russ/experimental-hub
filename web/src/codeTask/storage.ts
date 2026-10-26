// Entwurf je Code-Aufgabe, nur im Browser. Wie bei der Seitenleiste kann schon
// der Zugriff auf localStorage werfen; dann gilt der Entwurf bis zum Neuladen.
import type { StorageGetter } from '../shell/rail';

export interface Draft {
  code: string;
  passed: boolean;
}

const key = (taskId: string) => `hub-code:${taskId}`;

export function readDraft(storage: StorageGetter<'getItem'>, taskId: string): Draft | null {
  try {
    const raw = storage().getItem(key(taskId));
    if (raw === null) return null;
    const value: unknown = JSON.parse(raw);
    if (typeof value !== 'object' || value === null) return null;
    const { code, passed } = value as Record<string, unknown>;
    if (typeof code !== 'string' || typeof passed !== 'boolean') return null;
    return { code, passed };
  } catch {
    return null;
  }
}

export function writeDraft(storage: StorageGetter<'setItem'>, taskId: string, draft: Draft): void {
  try {
    storage().setItem(key(taskId), JSON.stringify(draft));
  } catch {
    // Nicht merkbar: gilt nur bis zum Neuladen.
  }
}
