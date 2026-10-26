import { Icon } from '../../design/components/Icon';
import { MUTANT_IDS, MUTANTS, type MutantId } from './mutants';
import type { MatrixRow, PresetTest } from './presetTests';

interface MatrixProps {
  matrix: Record<string, MatrixRow>;
  /** die eingeschalteten Tests, in Listenreihenfolge */
  tests: PresetTest[];
}

/** Erwischt: Der Test besteht am Original und scheitert an der Variante. */
const caughtBy = (row: MatrixRow | undefined, id: MutantId) => row?.original === true && row[id] === false;

/** Fazitzeile aus den eingeschalteten Tests, z. B. „3 von 4 Fehlervarianten erwischt“. */
export function verdict(matrix: Record<string, MatrixRow>, tests: PresetTest[]) {
  const total = MUTANT_IDS.length;
  const caught = MUTANT_IDS.filter((id) => tests.some((t) => caughtBy(matrix[t.id], id))).length;
  const base = `${caught} von ${total} Fehlervarianten erwischt`;
  return { caught, total, text: tests.length === 0 ? `Kein Test eingeschaltet: ${base}` : base };
}

function Cell({ passed, original }: { passed: boolean | undefined; original: boolean }) {
  if (passed === undefined) return <td>–</td>;
  if (passed) {
    return (
      <td className="testing-cell">
        <Icon name="check" /> bestanden
      </td>
    );
  }
  // Am Original heißt Scheitern: Der Test selbst ist falsch.
  return original ? (
    <td className="testing-cell is-broken">
      <Icon name="cross" /> gescheitert
    </td>
  ) : (
    <td className="testing-cell is-caught">
      <strong>
        <Icon name="cross" /> erwischt
      </strong>
    </td>
  );
}

/** Tests × (Original + vier Varianten) als Tabelle; schmal scrollt nur die Tabelle. */
export function Matrix({ matrix, tests }: MatrixProps) {
  const { caught, total, text } = verdict(matrix, tests);
  return (
    <div className="testing-matrix">
      <p className={`testing-verdict${caught === total ? ' is-complete' : ''}`} aria-live="polite">
        {text}
      </p>
      <div className="testing-table-wrap table-scroll" tabIndex={0} role="region" aria-label="Matrix: Tests gegen Fassungen">
        <table className="testing-table">
          <caption>Jeder eingeschaltete Test gegen die richtige Fassung und die vier Fehlervarianten</caption>
          <thead>
            <tr>
              <th scope="col">Test</th>
              <th scope="col">Original</th>
              {MUTANT_IDS.map((id) => (
                <th key={id} scope="col">
                  {MUTANTS[id].label}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {tests.map((t) => {
              const row = matrix[t.id];
              const blind = !MUTANT_IDS.some((id) => caughtBy(row, id));
              return (
                <tr key={t.id}>
                  <th scope="row">
                    {t.name}
                    {blind ? <span className="testing-blind"> · erwischt nichts</span> : null}
                  </th>
                  <Cell passed={row?.original} original />
                  {MUTANT_IDS.map((id) => (
                    <Cell key={id} passed={row?.[id]} original={false} />
                  ))}
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
}
