import { CheckFailure, expectEqual, formatValue } from '../../../codeTask/assert';
import type { CheckModule } from '../../../codeTask/types';

/** Wartezeit nach dem Aufruf von run(), damit Timer und Promises fertig werden */
const WAIT_MS = 200;

const count = (source: string, pattern: RegExp) => source.match(pattern)?.length ?? 0;

const module: CheckModule = {
  exportsNeeded: ['run'],
  checks: [
    {
      name: '`run()` gibt `A`, `B`, `C` aus, in dieser Reihenfolge',
      async run({ exports, logs }) {
        if (typeof exports.run !== 'function') {
          throw new CheckFailure(`\`run\` soll eine Funktion sein, ist aber ${formatValue(exports.run)}.`);
        }
        // Nur zählen, was nach dem Aufruf dazukommt; `logs` sammelt auch Timer und Promises.
        const before = logs.length;
        (exports.run as () => unknown)();
        await new Promise((resolve) => setTimeout(resolve, WAIT_MS));
        expectEqual(logs.slice(before), ['A', 'B', 'C'], 'Ausgabe von `run()`');
      },
    },
    {
      name: 'Alle Zeilen der Vorlage sind noch da: je ein `console.log` für `A`, `B`, `C`, dazu `Promise.resolve().then` und `setTimeout`',
      run({ exports }) {
        if (typeof exports.run !== 'function') {
          throw new CheckFailure(`\`run\` soll eine Funktion sein, ist aber ${formatValue(exports.run)}.`);
        }
        // Der Quelltext von run, so wie er im Editor steht.
        const source = (exports.run as () => unknown).toString();
        for (const letter of ['A', 'B', 'C']) {
          const n = count(source, new RegExp(String.raw`console\.log\(\s*(['"${'`'}])${letter}\1\s*\)`, 'g'));
          if (n !== 1) {
            throw new CheckFailure(`\`console.log('${letter}')\` soll genau einmal in \`run\` stehen, steht aber ${n}-mal da.`);
          }
        }
        if (count(source, /Promise\.resolve\(\)\s*\.then\(/g) === 0) {
          throw new CheckFailure('`Promise.resolve().then(…)` aus der Vorlage fehlt. Bau es um, statt es zu löschen.');
        }
        if (count(source, /setTimeout\(/g) === 0) {
          throw new CheckFailure('`setTimeout(…)` aus der Vorlage fehlt. Bau es um, statt es zu löschen.');
        }
      },
    },
  ],
};

export default module;
