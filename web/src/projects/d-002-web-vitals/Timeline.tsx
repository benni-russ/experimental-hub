import { useEffect, useLayoutEffect, useRef, useState } from 'react';
import { Button } from '../../design/components/Button';
import { Slider } from '../../design/components/Slider';
import type { LoadResult, VitalsFixes } from '../../experience/vitals';
import { SHIFT_SOURCE, formatMetric, formatNumber } from './insights';
import { advance, fontTime, fullPageHeight, pageAt, shownTime, type PageBox, type TimelineTime } from './timelineModel';

const REDUCED = '(prefers-reduced-motion: reduce)';

/** Folgt `prefers-reduced-motion`; ohne matchMedia (Tests) gilt keine Einschränkung. */
export function useReducedMotion(): boolean {
  const query = () => (typeof window !== 'undefined' && typeof window.matchMedia === 'function' ? window.matchMedia(REDUCED) : null);
  const [reduced, setReduced] = useState(() => query()?.matches ?? false);
  useEffect(() => {
    const mql = query();
    if (!mql) return;
    const update = () => setReduced(mql.matches);
    update();
    mql.addEventListener('change', update);
    return () => mql.removeEventListener('change', update);
  }, []);
  return reduced;
}

// Maße der Zeichnung (SVG-Einheiten, viewBox 360 breit).
const W = 360;
const FRAME = { x: 104, y: 4, w: 152 };
const PAD = 8;
const AXIS = { x0: 16, x1: 344, y: 214 };
const H = 296;
const seconds = (t: number) => `${formatNumber(Math.round(t * 100) / 100)} s`;

/** Textanker am Rand nach innen ziehen, damit nichts aus der Zeichnung ragt. */
const anchor = (x: number): 'start' | 'middle' | 'end' => (x < 60 ? 'start' : x > W - 60 ? 'end' : 'middle');

const BOX_LABEL: Record<PageBox['id'], string> = {
  header: 'Kopf',
  banner: 'Banner',
  heading: 'Überschrift',
  image: 'Bild',
  price: 'Preis',
  button: 'Knopf',
};

interface TimelineProps {
  load: LoadResult;
  fixes: VitalsFixes;
}

export function Timeline({ load, fixes }: TimelineProps) {
  const reduced = useReducedMotion();
  const [time, setTimeState] = useState<TimelineTime>('end');
  const [playing, setPlaying] = useState(false);
  const timeRef = useRef<TimelineTime>('end');
  const endRef = useRef(load.end);

  const setTime = (next: TimelineTime) => {
    timeRef.current = next;
    setTimeState(next);
  };

  // Das Ende ändert sich mit den Gegenmitteln, auch während des Abspielens; die Schleife liest es hier.
  useLayoutEffect(() => {
    endRef.current = load.end;
  }, [load.end]);

  useEffect(() => {
    if (!playing) return;
    let last = performance.now();
    let frame = 0;
    const step = (now: number) => {
      const r = advance(timeRef.current, endRef.current, (now - last) / 1000);
      last = now;
      timeRef.current = r.time;
      setTimeState(r.time);
      if (r.done) {
        setPlaying(false);
        return;
      }
      frame = requestAnimationFrame(step);
    };
    frame = requestAnimationFrame(step);
    return () => cancelAnimationFrame(frame);
  }, [playing]);

  // Wechselt das System während des Abspielens auf reduzierte Bewegung: anhalten, ans Ende springen.
  useEffect(() => {
    if (reduced && playing) {
      setPlaying(false);
      timeRef.current = 'end';
      setTimeState('end');
    }
  }, [reduced, playing]);

  const end = load.end;
  const t = shownTime(time, end);

  const onPlay = () => {
    // Am Ende ist der Sprung ohne Wirkung: aria-disabled statt disabled, damit der Fokus auf dem Knopf bleibt.
    if (reduced) {
      setTime('end');
      return;
    }
    if (playing) {
      setPlaying(false);
      return;
    }
    if (t >= end) setTime(0);
    setPlaying(true);
  };

  const page = pageAt(load, fixes, t);
  const x = (s: number) => AXIS.x0 + (Math.min(Math.max(s, 0), end) / end) * (AXIS.x1 - AXIS.x0);

  const firstPaint = load.events.find((e) => e.type === 'firstPaint');
  const lcp = load.events.find((e) => e.type === 'lcp');
  const longTask = load.events.find((e) => e.type === 'longTask');
  const shifts = load.events.flatMap((e) => (e.type === 'shift' ? [e] : []));
  const reached = shifts.filter((s) => s.time <= t);
  // Der letzte Sprung bleibt kurz neben der Seite stehen.
  const recent = [...reached].reverse().find((s) => t - s.time < 0.6);
  const button = page.boxes.find((b) => b.id === 'button')!;

  const fpTime = firstPaint && 'time' in firstPaint ? firstPaint.time : 0;
  const lcpTime = lcp && 'time' in lcp ? lcp.time : 0;
  const lcpRowUp = Math.abs(x(lcpTime) - x(fpTime)) < 90;

  // Ein Satz mit allem, was bis zum gezeigten Zeitpunkt passiert ist, und was noch kommt.
  const done: string[] = [];
  const open: string[] = [];
  (fpTime <= t ? done : open).push(`erstes Bild bei ${seconds(fpTime)}`);
  if (longTask && longTask.type === 'longTask') (longTask.start <= t ? done : open).push(`lange Aufgabe von ${seconds(longTask.start)} bis ${seconds(longTask.end)}`);
  for (const s of shifts) (s.time <= t ? done : open).push(`Verschiebung ${formatNumber(s.value)} durch ${SHIFT_SOURCE[s.source]} bei ${seconds(s.time)}`);
  (lcpTime <= t ? done : open).push(`LCP bei ${formatMetric('lcp', lcpTime)}`);
  const label =
    `Zeitleiste der Produktseite bei ${seconds(t)} von ${seconds(end)}. ` +
    (done.length ? `Bisher: ${done.join(', ')}. ` : 'Noch ist nichts gezeichnet. ') +
    (open.length ? `Noch nicht: ${open.join(', ')}.` : 'Die Seite ist fertig.');

  const frameH = fullPageHeight() + PAD;
  const inner = { x: FRAME.x + PAD, w: FRAME.w - 2 * PAD };

  return (
    <div className="wv-timeline">
      <div className="wv-timeline-controls">
        <Button variant="secondary" onClick={onPlay} aria-disabled={reduced && t >= end ? true : undefined}>
          {reduced ? 'Ans Ende springen' : playing ? 'Pause' : 'Abspielen'}
        </Button>
        <div className="wv-timeline-slider">
          <Slider
            label="Zeitpunkt"
            value={t}
            min={0}
            max={end}
            step={0.05}
            format={seconds}
            onChange={(v) => {
              setPlaying(false);
              setTime(v);
            }}
          />
        </div>
      </div>
      {reduced ? <p className="wv-hint">Reduzierte Bewegung ist eingestellt: Der Knopf springt ans Ende, den Verlauf gehst du mit dem Regler durch.</p> : null}

      <figure className="wv-figure">
        <svg viewBox={`0 0 ${W} ${H}`} role="img" aria-label={label} className="wv-timeline-svg">
          {/* Die Seite als Strichskizze */}
          <rect x={FRAME.x} y={FRAME.y} width={FRAME.w} height={frameH} rx={6} className="wv-frame" />
          {!page.painted ? (
            <text x={FRAME.x + FRAME.w / 2} y={FRAME.y + frameH / 2} textAnchor="middle" className="wv-svg-muted">
              noch weiß
            </text>
          ) : null}
          {page.boxes.map((b) => {
            if (b.height === 0 || (!b.drawn && !b.reserved)) return null;
            const y = FRAME.y + b.y;
            return (
              <g key={b.id}>
                {b.reserved ? (
                  <rect x={inner.x} y={y} width={inner.w} height={b.height} rx={3} className="wv-reserved" />
                ) : (
                  <PageElement box={b} x={inner.x} y={y} w={inner.w} fontLoaded={page.fontLoaded} lines={page.headingLines} />
                )}
                <text x={FRAME.x + FRAME.w + 8} y={y + Math.min(b.height, 14) / 2 + 4} className="wv-svg-label">
                  {BOX_LABEL[b.id]}
                  {b.reserved ? ' (Platz frei)' : ''}
                </text>
              </g>
            );
          })}
          {recent ? (
            <g className="wv-jump">
              <path d={`M${FRAME.x - 10} ${FRAME.y + button.y - 10}v14m-4 -4l4 4l4 -4`} />
              <text x={FRAME.x - 16} y={FRAME.y + button.y} textAnchor="end">
                Sprung
              </text>
              <text x={FRAME.x - 16} y={FRAME.y + button.y + 14} textAnchor="end">
                {formatNumber(recent.value)}
              </text>
            </g>
          ) : null}

          {/* Achse mit Marken */}
          <line x1={AXIS.x0} y1={AXIS.y} x2={AXIS.x1} y2={AXIS.y} className="wv-axis" />
          {fpTime <= t ? (
            <g>
              <line x1={x(fpTime)} y1={AXIS.y - 10} x2={x(fpTime)} y2={AXIS.y} className="wv-tick" />
              <text x={x(fpTime)} y={AXIS.y - 14} textAnchor={anchor(x(fpTime))} className="wv-svg-label">
                erstes Bild
              </text>
            </g>
          ) : null}
          {lcpTime <= t ? (
            <g>
              <line x1={x(lcpTime)} y1={AXIS.y - (lcpRowUp ? 26 : 10)} x2={x(lcpTime)} y2={AXIS.y} className="wv-tick wv-tick-strong" />
              <text x={x(lcpTime)} y={AXIS.y - (lcpRowUp ? 30 : 14)} textAnchor={anchor(x(lcpTime))} className="wv-svg-label wv-svg-strong">
                LCP {formatMetric('lcp', lcpTime)}
              </text>
            </g>
          ) : null}
          {reached.map((s, i) => (
            <g key={`${s.source}-${s.time}`}>
              <path d={`M${x(s.time)} ${AXIS.y - 5}l5 5l-5 5l-5 -5z`} className="wv-shift" />
              <text x={x(s.time)} y={AXIS.y + 24 + (i % 2) * 14} textAnchor={anchor(x(s.time))} className="wv-svg-label">
                {formatNumber(s.value)}
              </text>
            </g>
          ))}
          {longTask && longTask.type === 'longTask' && longTask.start <= t ? (
            <g>
              <rect x={x(longTask.start)} y={AXIS.y + 42} width={Math.max(1, x(Math.min(t, longTask.end)) - x(longTask.start))} height={8} rx={2} className="wv-task" />
              <text
                x={x(longTask.start) < W / 2 ? x(longTask.start) : x(longTask.end)}
                y={AXIS.y + 66}
                textAnchor={x(longTask.start) < W / 2 ? 'start' : 'end'}
                className="wv-svg-label"
              >
                lange Aufgabe {formatNumber(Math.round((longTask.end - longTask.start) * 1000) / 1000)} s
              </text>
            </g>
          ) : null}
          <line x1={x(t)} y1={AXIS.y - 36} x2={x(t)} y2={AXIS.y + 54} className="wv-cursor" />
          <text x={AXIS.x0} y={H - 4} className="wv-svg-muted">
            0 s
          </text>
          <text x={AXIS.x1} y={H - 4} textAnchor="end" className="wv-svg-muted">
            {seconds(end)}
          </text>
        </svg>
        <figcaption className="wv-hint">
          Raute: Verschiebung mit ihrem Wert. Balken: lange Aufgabe im Hauptthread. Gestrichelt: reservierter Platz. Die Webschrift ist bei {seconds(fontTime(load))} da.
        </figcaption>
      </figure>
    </div>
  );
}

function PageElement({ box, x, y, w, fontLoaded, lines }: { box: PageBox; x: number; y: number; w: number; fontLoaded: boolean; lines: number }) {
  const h = box.height;
  switch (box.id) {
    case 'header':
      return (
        <g className="wv-ink">
          <rect x={x} y={y} width={w} height={h} rx={2} />
          <path d={`M${x + 6} ${y + h / 2}h28M${x + w - 18} ${y + h / 2}h10`} />
        </g>
      );
    case 'banner':
      return (
        <g className="wv-ink">
          <rect x={x} y={y} width={w} height={h} rx={3} className="wv-fill" />
          <path d={`M${x + 10} ${y + h / 2}h${w - 60}`} />
        </g>
      );
    case 'heading': {
      // Ersatzschrift gedämpft, Webschrift in Tinte; die Zeilenzahl kommt aus pageAt.
      const lens = lines === 2 ? [w - 20, w * 0.55] : [w - 8];
      return (
        <g className={fontLoaded ? 'wv-ink wv-heading' : 'wv-ink wv-heading is-fallback'}>
          {lens.map((len, i) => (
            <path key={i} d={`M${x} ${y + 4 + i * 8}h${len}`} />
          ))}
        </g>
      );
    }
    case 'image':
      return (
        <g className="wv-ink">
          <rect x={x} y={y} width={w} height={h} rx={3} className="wv-fill" />
          <path d={`M${x + 8} ${y + h - 8}l${w * 0.25} ${-h * 0.45}l${w * 0.18} ${h * 0.25}l${w * 0.15} ${-h * 0.15}l${w * 0.3} ${h * 0.35}`} />
          <circle cx={x + w - 24} cy={y + 14} r={5} />
        </g>
      );
    case 'price':
      return (
        <g className="wv-ink">
          <path d={`M${x} ${y + h / 2}h36`} className="wv-thick" />
        </g>
      );
    case 'button':
      return (
        <g className="wv-ink">
          <rect x={x} y={y} width={w * 0.7} height={h} rx={4} className="wv-fill" />
          <path d={`M${x + 12} ${y + h / 2}h${w * 0.7 - 24}`} />
        </g>
      );
  }
}
