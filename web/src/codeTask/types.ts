export interface RunOutput {
  exports: Record<string, unknown>;
  logs: string[];
}

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
