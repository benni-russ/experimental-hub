export interface RunOutput {
  exports: Record<string, unknown>;
  logs: string[];
}

/**
 * `logs` sammelt die Ausgaben des ersten Laufs über alle Prüfungen hinweg
 * und wird zwischen den Prüfungen nicht zurückgesetzt.
 */
export interface CheckContext extends RunOutput {
  /** Nutzercode erneut ausführen, mit zusätzlichen/ersetzten Globals (B-006) */
  rerun(globals: Record<string, unknown>): Promise<RunOutput>;
}

export interface Check {
  name: string;
  run(ctx: CheckContext): void | Promise<void>;
}

export interface CheckModule {
  /** Namen, die der Nutzercode zurückgeben muss */
  exportsNeeded: string[];
  globals?(): Record<string, unknown>;
  checks: Check[];
}

export interface CheckResult {
  name: string;
  passed: boolean;
  message?: string;
}

export type RunResult =
  | { status: 'ok'; results: CheckResult[] }
  | { status: 'error'; message: string; line?: number }
  | { status: 'timeout' };

/** Was der Worker schickt: erst `ready` nach dem Laden des Prüfmoduls, dann das Ergebnis. */
export type WorkerMessage = RunResult | { status: 'ready' };
