import { useId, useMemo, useState } from 'react';
import type { Product } from '../../personalization/catalog';
import type { FeedEntry, FeedIssue } from '../../personalization/inspectFeed';
import { PRESETS, rankProducts } from '../../personalization/recommend';
import { EXAMPLE_VISITOR_ID, NOW, VISITORS } from '../../personalization/visitors';
import { naiveFlaws } from './effects';

const OPTIONS = { hideOutOfStock: true, hidePurchased: true, n: 5 };

// Startbesucher ist der Beispielbesucher: Annas Liste aus dem rohen Feed zeigt sofort zwei Markierungen.
const START_VISITOR = EXAMPLE_VISITOR_ID;

const euro = (n: number) => `${n.toFixed(2).replace('.', ',')} €`;

interface EffectCompareProps {
  entries: FeedEntry[];
  issues: FeedIssue[];
  naive: Product[];
  clean: Product[];
  headingId: string;
}

interface Row {
  product: Product;
  flaws: string[];
}

function RankList({ title, rows, id }: { title: string; rows: Row[]; id: string }) {
  const broken = rows.filter((r) => r.flaws.length > 0).length;
  return (
    <div className="fi-rank">
      <h4 id={id}>{title}</h4>
      <ol className="fi-rank-list" aria-labelledby={id}>
        {rows.map(({ product, flaws }, i) => (
          <li key={`${product.id}-${i}`} className={`fi-rec${flaws.length > 0 ? ' is-flawed' : ''}`}>
            <span className="fi-rec-no" aria-hidden="true">
              {i + 1}
            </span>
            <span className="fi-rec-body">
              <span className="fi-rec-title">{product.title}</span>
              <span className="fi-rec-meta">
                {product.id} · {product.category.trim()} · {euro(product.price)}
              </span>
              {flaws.length > 0 ? (
                <span className="fi-rec-flaws">
                  {flaws.map((w) => (
                    <span key={w} className="tag fi-tag fi-tag-drop">
                      <span aria-hidden="true">⚠</span> {w}
                    </span>
                  ))}
                </span>
              ) : null}
            </span>
          </li>
        ))}
      </ol>
      <p className="fi-hint" aria-live="polite">
        {broken === 0 ? 'Keine Empfehlung markiert.' : `${broken} von ${rows.length} Empfehlungen ${broken === 1 ? 'ist' : 'sind'} kaputt.`}
      </p>
    </div>
  );
}

/** Die Top 5 für einen Besucher, aus dem naiv gelesenen und aus dem bereinigten Feed. */
export function EffectCompare({ entries, issues, naive, clean, headingId }: EffectCompareProps) {
  const id = useId();
  const [visitorId, setVisitorId] = useState(START_VISITOR);
  const visitor = VISITORS.find((v) => v.id === visitorId) ?? VISITORS[0]!;

  const flaws = useMemo(() => naiveFlaws(naive, entries, issues), [naive, entries, issues]);
  const left = useMemo(
    () => rankProducts(naive, visitor, PRESETS.personal.weights, OPTIONS, NOW).map((r) => ({ product: r.product, flaws: flaws.get(r.product) ?? [] })),
    [naive, visitor, flaws],
  );
  const right = useMemo(
    () => rankProducts(clean, visitor, PRESETS.personal.weights, OPTIONS, NOW).map((r) => ({ product: r.product, flaws: [] as string[] })),
    [clean, visitor],
  );
  const sameList = left.length === right.length && left.every((r, i) => r.product.id === right[i]!.product.id);
  const anyFlaw = left.some((r) => r.flaws.length > 0);

  return (
    <section className="fi-panel" aria-labelledby={headingId}>
      <h3 id={headingId}>Wirkung auf die Empfehlung</h3>
      <div className="fi-field">
        <label htmlFor={`${id}-visitor`} className="fi-label">
          Besucher
        </label>
        <select id={`${id}-visitor`} className="input" value={visitorId} onChange={(e) => setVisitorId(e.target.value)}>
          {VISITORS.map((v) => (
            <option key={v.id} value={v.id}>
              {v.name}
            </option>
          ))}
        </select>
      </div>
      <p className="fi-hint">
        „Das könnte dir gefallen“ mit der Gewichtung „{PRESETS.personal.label}“, ausverkaufte und schon gekaufte Produkte ausgeblendet. Links liest ein unachtsames System
        den Feed, rechts der geprüfte.
      </p>
      <div className="fi-compare">
        <RankList title="Aus dem rohen Feed" rows={left} id={`${id}-left`} />
        <RankList title="Aus dem geprüften Feed" rows={right} id={`${id}-right`} />
      </div>
      {!anyFlaw && !sameList ? (
        <p className="fi-hint">
          Links ist nichts markiert, und doch unterscheiden sich die Listen: Fehler wie eine falsch geschriebene Kategorie verschieben Plätze, ohne dass man es dem Eintrag ansieht.
        </p>
      ) : null}
    </section>
  );
}
