import { CheckFailure, expectEqual, formatValue } from '../../../codeTask/assert';
import type { CheckModule } from '../../../codeTask/types';
import { STATUS_CODES } from '../../../http/statusCodes';

type DescribeStatus = (status: number) => unknown;

/** Ruft describeStatus auf; ein Fehler bei einem gültigen Code ist selbst ein Fehlschlag. */
function describe(exports: Record<string, unknown>, status: number): unknown {
  try {
    return (exports.describeStatus as DescribeStatus)(status);
  } catch (err) {
    throw new CheckFailure(
      `\`describeStatus(${status})\` hat geworfen (${formatValue(err)}). Dieser Code ist gültig und soll eingeordnet werden.`,
    );
  }
}

/** Prüft einen Block der Tabelle: erwartet genau die Werte aus STATUS_CODES. */
function checkTable(exports: Record<string, unknown>, klass: '2xx' | '4xx' | '5xx'): void {
  for (const s of STATUS_CODES.filter((x) => x.klass === klass)) {
    expectEqual(
      describe(exports, s.status),
      { klass: s.klass, whoseFault: s.whoseFault, retry: s.retry },
      `\`describeStatus(${s.status})\``,
    );
  }
}

/** Erwartet einen Fehler; liefert die Funktion stattdessen etwas, ist das der Fehlschlag. */
function expectThrows(exports: Record<string, unknown>, status: number): void {
  let result: unknown;
  try {
    result = (exports.describeStatus as DescribeStatus)(status);
  } catch {
    return;
  }
  throw new CheckFailure(
    `\`describeStatus(${status})\`: Erwartet war ein Fehler, die Funktion hat aber ${formatValue(result)} zurückgegeben.`,
  );
}

const module: CheckModule = {
  exportsNeeded: ['describeStatus'],
  checks: [
    {
      name: 'Erfolgscodes der Tabelle (`200`, `201`, `204`): `2xx`, `niemand`, kein Retry',
      run: ({ exports }) => checkTable(exports, '2xx'),
    },
    {
      name: 'Fehler des Clients (`400`, `401`, `403`, `404`, `429`): `4xx`, `Client`, Retry nur bei `429`',
      run: ({ exports }) => checkTable(exports, '4xx'),
    },
    {
      name: 'Fehler des Servers (`500`, `503`): `5xx`, `Server`, Retry',
      run: ({ exports }) => checkTable(exports, '5xx'),
    },
    {
      name: 'Codes außerhalb der Tabelle richten sich nach ihrer Klasse (`299`, `418`, `502`)',
      run({ exports }) {
        expectEqual(describe(exports, 299), { klass: '2xx', whoseFault: 'niemand', retry: false }, '`describeStatus(299)`');
        expectEqual(describe(exports, 418), { klass: '4xx', whoseFault: 'Client', retry: false }, '`describeStatus(418)`');
        expectEqual(describe(exports, 502), { klass: '5xx', whoseFault: 'Server', retry: true }, '`describeStatus(502)`');
      },
    },
    {
      name: '`199`, `300` und `600` werfen einen Fehler',
      run({ exports }) {
        for (const status of [199, 300, 600]) expectThrows(exports, status);
      },
    },
  ],
};

export default module;
