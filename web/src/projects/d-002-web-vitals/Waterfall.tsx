import type { LoadResult } from '../../experience/vitals';
import { formatNumber } from './insights';

const seconds = (t: number) => `${formatNumber(Math.round(t * 100) / 100)} s`;
const percent = (x: number) => `${Math.round(x * 10000) / 100}%`;

/** Wasserfall: wann welche Datei lädt. Breite Tabelle in eigenem Scrollbereich. */
export function Waterfall({ load }: { load: LoadResult }) {
  const end = load.end;
  return (
    <div className="table-scroll wv-waterfall" tabIndex={0} role="region" aria-label="Wasserfall der geladenen Dateien">
      <table>
        <thead>
          <tr>
            <th scope="col">Datei</th>
            <th scope="col">Größe</th>
            <th scope="col">Start</th>
            <th scope="col">Ende</th>
            <th scope="col" className="wv-waterfall-bar-col">
              Verlauf bis {seconds(end)}
            </th>
          </tr>
        </thead>
        <tbody>
          {load.resources.map((r) => (
            <tr key={r.id}>
              <th scope="row">
                <span className="wv-file">{r.label}</span>
                {r.blocking ? <span className="tag wv-blocking">blockiert das Zeichnen</span> : null}
              </th>
              <td className="wv-num">{formatNumber(r.sizeKB)} KB</td>
              <td className="wv-num">{seconds(r.start)}</td>
              <td className="wv-num">{seconds(r.end)}</td>
              <td className="wv-waterfall-bar-col">
                <span className="wv-track" aria-hidden="true">
                  <span
                    className={r.blocking ? 'wv-bar is-blocking' : 'wv-bar'}
                    style={{ left: percent(r.start / end), width: percent(Math.max(0.005, (r.end - r.start) / end)) }}
                  />
                </span>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
