import type { RankedItem, Weights } from '../../personalization/recommend';

export const de2 = (n: number) => n.toFixed(2).replace('.', ',');

export type Changes = Record<string, number | 'new'>;

// Drei Muster statt drei Farben allein: voll, schraffiert, gepunktet.
const SIGNALS: { key: keyof Weights; label: string; className: string }[] = [
  { key: 'affinity', label: 'Affinität', className: 'rc-seg-affinity' },
  { key: 'popularity', label: 'Beliebtheit', className: 'rc-seg-popularity' },
  { key: 'similarity', label: 'Ähnlichkeit', className: 'rc-seg-similarity' },
];

export function ariaForParts(parts: Weights): string {
  return SIGNALS.map((s) => `${s.label} ${de2(parts[s.key])}`).join(', ');
}

function Change({ change }: { change: number | 'new' | undefined }) {
  if (change === undefined || change === 0) return <span className="rc-change" />;
  if (change === 'new') {
    return (
      <span className="rc-change is-new">
        <span aria-hidden="true">neu</span>
        <span className="visually-hidden">neu in der Liste</span>
      </span>
    );
  }
  const up = change > 0;
  const n = Math.abs(change);
  return (
    <span className={`rc-change ${up ? 'is-up' : 'is-down'}`}>
      <span aria-hidden="true">{`${up ? '↑' : '↓'}${n}`}</span>
      <span className="visually-hidden">{`${n} ${n === 1 ? 'Platz' : 'Plätze'} ${up ? 'höher' : 'tiefer'}`}</span>
    </span>
  );
}

interface RankListProps {
  items: RankedItem[];
  changes: Changes;
  /** Summe der Gewichte: so lang wäre der Balken bei lauter Einsen. */
  weightSum: number;
  /** Mängel je Produkt (roher Feed), sonst leer. */
  flaws?: Map<RankedItem['product'], string[]>;
  headingId: string;
}

export function RankList({ items, changes, weightSum, flaws, headingId }: RankListProps) {
  return (
    <div className="rc-rank">
      <ul className="rc-legend" aria-label="Legende der Balken">
        {SIGNALS.map((s) => (
          <li key={s.key}>
            <span className={`rc-swatch ${s.className}`} aria-hidden="true" />
            {s.label}
          </li>
        ))}
      </ul>
      <ol className="rc-list" aria-labelledby={headingId}>
        {items.map((item, i) => {
          const words = flaws?.get(item.product) ?? [];
          return (
            <li key={`${item.product.id}-${i}`} className={`rc-item${words.length > 0 ? ' is-flawed' : ''}`}>
              <span className="rc-place" aria-hidden="true">
                {i + 1}
              </span>
              <div className="rc-body">
                <div className="rc-head">
                  <span className="rc-title">{item.product.title}</span>
                  <span className="rc-score">{de2(item.score)}</span>
                </div>
                <div className="rc-meta">
                  <span>{item.product.category}</span>
                  <Change change={changes[item.product.id]} />
                  {words.map((w) => (
                    <span key={w} className="tag rc-flaw">
                      <span aria-hidden="true">⚠</span> {w}
                    </span>
                  ))}
                </div>
                <div className="rc-stack" role="img" aria-label={ariaForParts(item.parts)}>
                  {weightSum > 0
                    ? SIGNALS.map((s) => (
                        <span key={s.key} className={`rc-seg ${s.className}`} style={{ width: `${(item.parts[s.key] / weightSum) * 100}%` }} />
                      ))
                    : null}
                </div>
              </div>
            </li>
          );
        })}
      </ol>
    </div>
  );
}
