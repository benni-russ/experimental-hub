import type { ReactNode } from 'react';
import { Icon } from '../../design/components/Icon';
import type { StationId, StationState } from './stations';

export const STATION_NAMES: Record<StationId, string> = {
  request: 'Anfrage',
  response: 'Response',
  text: 'Rohtext',
  parse: 'JSON.parse',
  object: 'Objekt',
};

// Was an der Station im Code passiert.
const STATION_CODE: Record<StationId, string> = {
  request: 'await fetch(url)',
  response: 'res.status, res.headers',
  text: 'await res.text()',
  parse: 'JSON.parse(text)',
  object: 'fertiger Wert',
};

type ShownStatus = StationState['status'] | 'pending';

// Status nie über Farbe allein: Zeichen und Wort stehen immer dabei.
const STATUS: Record<ShownStatus, { symbol: ReactNode; label: string }> = {
  done: { symbol: <Icon name="check" />, label: 'geklappt' },
  failed: { symbol: <Icon name="cross" />, label: 'gerissen' },
  skipped: { symbol: '–', label: 'nicht erreicht' },
  pending: { symbol: '…', label: 'wartet' },
};

const PREVIEW_LENGTH = 48;

function Body({ station }: { station: StationState }) {
  const { id, detail } = station;
  if (station.status === 'skipped') return null;
  if (id === 'text') {
    if (detail === '') return <p className="json-station-detail">Leer: 0 Zeichen</p>;
    const preview = detail.length > PREVIEW_LENGTH ? `${detail.slice(0, PREVIEW_LENGTH)}…` : detail;
    return (
      <>
        <p className="json-station-detail">{detail.length} Zeichen, Anfang:</p>
        <code className="json-station-code">{preview}</code>
      </>
    );
  }
  return (
    <>
      {id === 'request' || id === 'response' ? (
        <code className="json-station-code">{detail}</code>
      ) : (
        <p className="json-station-detail">{detail}</p>
      )}
      {station.error ? <p className="json-station-error">{station.error}</p> : null}
    </>
  );
}

/** Fünf Stationen nebeneinander (schmal untereinander); `shown` begrenzt beim langsamen Abspielen. */
export function StationRail({ stations, shown }: { stations: StationState[]; shown: number }) {
  return (
    <ol className="json-rail">
      {stations.map((station, i) => {
        const status: ShownStatus = i < shown ? station.status : 'pending';
        const s = STATUS[status];
        return (
          <li key={station.id} className={`json-station is-${status}`}>
            <div className="json-station-head">
              <span className="json-station-name">{STATION_NAMES[station.id]}</span>
              <span className="json-station-status">
                <span aria-hidden="true">{s.symbol}</span> {s.label}
              </span>
            </div>
            <code className="json-station-call">{STATION_CODE[station.id]}</code>
            {status === 'pending' ? null : <Body station={station} />}
          </li>
        );
      })}
    </ol>
  );
}
