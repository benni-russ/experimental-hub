import { runChecks } from './runChecks';
import type { CheckModule, RunResult } from './types';

export type CheckLoaders = Record<string, () => Promise<{ default: CheckModule }>>;

/**
 * Lädt das Prüfmodul der Aufgabe und führt es gegen den Code aus. Getrennt
 * vom Worker, damit es ohne Worker testbar ist.
 */
export async function handleTask(
  checks: CheckLoaders,
  taskId: string,
  code: string,
  onLoaded: () => void = () => {},
): Promise<RunResult> {
  // hasOwn: Namen wie `toString` dürfen nicht aus dem Prototyp kommen.
  if (!Object.hasOwn(checks, taskId)) return { status: 'error', message: 'Unbekannte Aufgabe' };
  let module: CheckModule;
  try {
    module = (await checks[taskId]!()).default;
  } catch {
    return { status: 'error', message: 'Die Prüfung konnte nicht geladen werden.' };
  }
  // Ab hier zählt die Zeitgrenze des Runners; das Laden zählt nicht mit.
  onLoaded();
  try {
    return await runChecks(module, code);
  } catch (err) {
    return { status: 'error', message: err instanceof Error ? err.message : String(err) };
  }
}
