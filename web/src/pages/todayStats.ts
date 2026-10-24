import { TRACKS, type ContentMeta, type StateResponse, type TrackId, type UpcomingItem } from '@hub/shared';
import { projectStatus } from '../projects/status';

export interface TrackProgress {
  track: TrackId;
  label: string;
  done: number;
  started: number;
  open: number;
  total: number;
}

/** Fortschritt je Track; nur Projekte zählen, Tracks ohne Projekte entfallen. */
export function trackProgress(metas: ContentMeta[], state: StateResponse): TrackProgress[] {
  const result: TrackProgress[] = [];
  for (const { id, label } of TRACKS) {
    const entry: TrackProgress = { track: id, label, done: 0, started: 0, open: 0, total: 0 };
    for (const meta of metas) {
      if (meta.kind !== 'project' || meta.track !== id) continue;
      entry[projectStatus(meta, state)] += 1;
      entry.total += 1;
    }
    if (entry.total > 0) result.push(entry);
  }
  return result;
}

export interface ForecastDay {
  date: Date;
  label: string;
  count: number;
}

/**
 * Fällige Karten je Tag, beginnend heute. Tagesgrenzen sind 00:00 Uhr lokal
 * (über das Kalenderdatum gebaut, damit Sommerzeitwechsel nicht verschieben).
 * Heute zählt nur, was jetzt fällig ist (inklusive Überfälligem), damit die Zahl
 * mit Glocke und Lernrunde übereinstimmt; was erst später heute fällig wird,
 * erscheint, sobald es fällig ist. Was nach dem letzten Tag fällig ist, entfällt.
 */
export function dueForecast(
  items: UpcomingItem[],
  isKnown: (item: UpcomingItem) => boolean,
  now: Date,
  days = 7,
): ForecastDay[] {
  const count = Math.max(1, days);
  // Der Formatierer entsteht hier, nicht auf Modulebene: Er folgt so der aktuellen Zeitzone.
  const weekdayFormat = new Intl.DateTimeFormat('de-DE', { weekday: 'short' });
  const starts = Array.from(
    { length: count + 1 },
    (_, i) => new Date(now.getFullYear(), now.getMonth(), now.getDate() + i),
  );
  const startMs = starts.map((d) => d.getTime());
  const counts: number[] = new Array<number>(count).fill(0);
  for (const item of items) {
    if (!isKnown(item)) continue;
    const due = new Date(item.dueAt).getTime();
    if (due >= startMs[count]!) continue;
    if (due > now.getTime() && due < startMs[1]!) continue;
    let index = 0;
    for (let i = count - 1; i > 0; i--) {
      if (due >= startMs[i]!) {
        index = i;
        break;
      }
    }
    counts[index]! += 1;
  }
  return starts.slice(0, count).map((date, i) => ({
    date,
    label: i === 0 ? 'Heute' : `${weekdayFormat.format(date).replace(/\.$/, '')} ${date.getDate()}.`,
    count: counts[i]!,
  }));
}
