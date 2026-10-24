import { TrackIcon } from '../design/components/TrackIcon';
import type { ForecastDay, TrackProgress } from './todayStats';

const GAP = 0.5;

const SEGMENTS = [
  { key: 'done', word: 'durchgearbeitet', className: 'seg-done' },
  { key: 'started', word: 'begonnen', className: 'seg-started' },
  { key: 'open', word: 'offen', className: 'seg-open' },
] as const;

function ProgressBar({ row }: { row: TrackProgress }) {
  let x = 0;
  const visible = SEGMENTS.filter((s) => row[s.key] > 0);
  return (
    <svg className="chart-bar" viewBox="0 0 100 10" preserveAspectRatio="none" aria-hidden="true">
      {visible.map((s, i) => {
        const share = (row[s.key] / row.total) * 100;
        const width = share - (i < visible.length - 1 ? GAP : 0);
        const rect = (
          <rect key={s.key} className={s.className} x={x} y={0} width={Math.max(width, 0)} height={10}>
            <title>
              {row.label}: {row[s.key]} {s.word}
            </title>
          </rect>
        );
        x += share;
        return rect;
      })}
    </svg>
  );
}

export function TrackProgressChart({ rows }: { rows: TrackProgress[] }) {
  return (
    <div className="chart-progress">
      <ul className="plain-list chart-legend" aria-hidden="true">
        {SEGMENTS.map((s) => (
          <li key={s.key}>
            <span className={`chart-swatch ${s.className}`} aria-hidden="true" /> {s.word}
          </li>
        ))}
      </ul>
      <ul className="plain-list chart-rows">
        {rows.map((row) => (
          <li key={row.track} className="chart-row">
            <span className="chart-row-head">
              <span className="track-label">
                <TrackIcon track={row.track} size={18} /> {row.label}
              </span>
              <span className="chart-row-count">
                {row.done} von {row.total}
              </span>
            </span>
            <ProgressBar row={row} />
          </li>
        ))}
      </ul>
      <table className="visually-hidden">
        <caption>Fortschritt je Track</caption>
        <thead>
          <tr>
            <th scope="col">Track</th>
            <th scope="col">durchgearbeitet</th>
            <th scope="col">begonnen</th>
            <th scope="col">offen</th>
          </tr>
        </thead>
        <tbody>
          {rows.map((row) => (
            <tr key={row.track}>
              <th scope="row">{row.label}</th>
              <td>{row.done}</td>
              <td>{row.started}</td>
              <td>{row.open}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

const COLUMN_WIDTH = 0.8;
const BASELINE = 0.4;
const AREA = 40 - BASELINE;
// Ausgleich für die Verzerrung: rund 4 px bei etwa 43 px je Einheit waagerecht, 4 px je Einheit senkrecht.
const RX = 0.09;
const RY = 1;

function columnPath(index: number, height: number): string {
  const x = index + (1 - COLUMN_WIDTH) / 2;
  const top = AREA - height;
  const ry = Math.min(RY, height);
  return [
    `M${x} ${AREA}`,
    `V${top + ry}`,
    `A${RX} ${ry} 0 0 1 ${x + RX} ${top}`,
    `H${x + COLUMN_WIDTH - RX}`,
    `A${RX} ${ry} 0 0 1 ${x + COLUMN_WIDTH} ${top + ry}`,
    `V${AREA}`,
    'Z',
  ].join('');
}

export function ForecastChart({ days }: { days: ForecastDay[] }) {
  const max = days.length === 0 ? 0 : Math.max(...days.map((d) => d.count));
  if (max === 0) {
    return <p className="muted">In den nächsten {days.length} Tagen ist keine Karte fällig.</p>;
  }
  const columns = { gridTemplateColumns: `repeat(${days.length}, 1fr)` };
  return (
    <div className="chart-forecast">
      <div className="chart-forecast-row chart-forecast-values" style={columns} aria-hidden="true">
        {days.map((d) => (
          <span key={d.label}>{d.count > 0 ? d.count : ''}</span>
        ))}
      </div>
      <svg
        className="chart-columns"
        viewBox={`0 0 ${days.length} 40`}
        preserveAspectRatio="none"
        aria-hidden="true"
      >
        <rect className="seg-open" x={0} y={AREA} width={days.length} height={BASELINE} />
        {days.map((d, i) =>
          d.count > 0 ? (
            <path key={d.label} className="seg-due" d={columnPath(i, (d.count / max) * AREA)}>
              <title>
                {d.label}: {d.count} {d.count === 1 ? 'Karte' : 'Karten'}
              </title>
            </path>
          ) : null,
        )}
      </svg>
      <div className="chart-forecast-row chart-forecast-labels" style={columns} aria-hidden="true">
        {days.map((d) => (
          <span key={d.label}>
            {d.label.split(' ').map((part) => (
              <span key={part}>{part}</span>
            ))}
          </span>
        ))}
      </div>
      <table className="visually-hidden">
        <caption>Fällige Karten in den nächsten {days.length} Tagen</caption>
        <thead>
          <tr>
            <th scope="col">Tag</th>
            <th scope="col">Karten</th>
          </tr>
        </thead>
        <tbody>
          {days.map((d) => (
            <tr key={d.label}>
              <th scope="row">{d.label}</th>
              <td>{d.count}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
