import { useEffect, useId, useMemo, useState } from 'react';
import { InsightBox } from '../../design/components/InsightBox';
import { SegmentedControl } from '../../design/components/SegmentedControl';
import { Slider } from '../../design/components/Slider';
import { Switch } from '../../design/components/Switch';
import { categoryAffinity } from '../../personalization/affinity';
import { CATALOG } from '../../personalization/catalog';
import { cleanFeed, inspectFeed, readFeedNaively } from '../../personalization/inspectFeed';
import { FEED_DATE, RAW_FEED } from '../../personalization/rawFeed';
import { PRESETS, rankChanges, rankProducts, type PresetId, type Weights } from '../../personalization/recommend';
import { EXAMPLE_VISITOR_ID, NOW, VISITORS } from '../../personalization/visitors';
import { naiveFlaws } from '../../personalization/feedFlaws';
import { insightsFor } from './insights';
import { ProfileBars } from './ProfileBars';
import { RankList } from './RankList';
import { VisitorSelect } from './VisitorSelect';
import './recommendations.css';

const TOP = 8;
const REST_MS = 500;
const PRESET_OPTIONS = (Object.keys(PRESETS) as PresetId[]).map((value) => ({ value, label: PRESETS[value].label }));
const FEED_OPTIONS = [
  { value: 'clean', label: 'bereinigt' },
  { value: 'raw', label: 'roh' },
] as const;
type FeedKind = (typeof FEED_OPTIONS)[number]['value'];

const SLIDERS: { key: keyof Weights; label: string }[] = [
  { key: 'affinity', label: 'Affinität' },
  { key: 'popularity', label: 'Beliebtheit' },
  { key: 'similarity', label: 'Ähnlichkeit' },
];

const toPercent = (w: Weights): Weights => ({ affinity: w.affinity * 100, popularity: w.popularity * 100, similarity: w.similarity * 100 });

export default function Demo() {
  const id = useId();
  const [visitorId, setVisitorId] = useState(EXAMPLE_VISITOR_ID);
  // Gewichte in Prozent; `preset` ist `null`, sobald ein Regler bewegt wurde.
  const [preset, setPreset] = useState<PresetId | null>('personal');
  const [percent, setPercent] = useState<Weights>(() => toPercent(PRESETS.personal.weights));
  const [hideOutOfStock, setHideOutOfStock] = useState(true);
  const [hidePurchased, setHidePurchased] = useState(true);
  const [feed, setFeed] = useState<FeedKind>('clean');
  const [announcement, setAnnouncement] = useState('');

  const visitor = VISITORS.find((v) => v.id === visitorId) ?? VISITORS[0]!;
  const weights: Weights = useMemo(
    () => ({ affinity: percent.affinity / 100, popularity: percent.popularity / 100, similarity: percent.similarity / 100 }),
    [percent],
  );

  // Feed: bereinigt (wie CATALOG) oder roh, so wie ein unachtsames System ihn liest (Brücke zu C-002).
  const inspected = useMemo(() => inspectFeed(RAW_FEED, FEED_DATE), []);
  const clean = useMemo(() => cleanFeed(inspected.products, inspected.issues), [inspected]);
  const naive = useMemo(() => readFeedNaively(RAW_FEED), []);
  const products = feed === 'clean' ? clean : naive;
  const flaws = useMemo(() => (feed === 'raw' ? naiveFlaws(naive, inspected.products, inspected.issues) : undefined), [feed, naive, inspected]);

  const { profile } = useMemo(() => categoryAffinity(visitor.events, NOW, CATALOG), [visitor]);
  const ranked = useMemo(
    () => rankProducts(products, visitor, weights, { hideOutOfStock, hidePurchased, n: TOP }, NOW),
    [products, visitor, weights, hideOutOfStock, hidePurchased],
  );

  // Vorheriger Stand der Liste für die Platzänderung: beim Ändern der Reihenfolge merken wir den alten Stand.
  const ids = ranked.map((r) => r.product.id);
  const key = ids.join('|');
  const [track, setTrack] = useState({ key, ids, prev: ids });
  if (track.key !== key) setTrack({ key, ids, prev: track.ids });
  const changes = useMemo(() => rankChanges(track.prev, track.ids), [track]);
  const changed = Object.values(changes).filter((c) => c !== 0).length;

  const first = ranked[0];
  const spoken =
    first && changed > 0
      ? `Platz 1: ${first.product.title}. ${changed === 1 ? '1 Platz hat' : `${changed} Plätze haben`} sich geändert.`
      : '';
  // Erst nach 500 ms Ruhe ansagen, damit Ziehen am Regler nicht jeden Schritt vorliest.
  useEffect(() => {
    const t = setTimeout(() => setAnnouncement(spoken), REST_MS);
    return () => clearTimeout(t);
  }, [spoken]);

  const sum = weights.affinity + weights.popularity + weights.similarity;
  const insights = insightsFor(weights, visitor.events.length > 0);

  function choosePreset(next: PresetId) {
    setPreset(next);
    setPercent(toPercent(PRESETS[next].weights));
  }
  function moveSlider(key: keyof Weights, value: number) {
    setPreset(null);
    setPercent((p) => ({ ...p, [key]: value }));
  }

  return (
    <div className="rc-demo">
      <div className="rc-controls">
        <section className="rc-panel" aria-labelledby={`${id}-visitor`}>
          <h3 id={`${id}-visitor`}>Besucher</h3>
          <VisitorSelect id={`${id}-select`} label="Wer schaut sich den Shop an?" value={visitorId} onChange={setVisitorId} />
          <ProfileBars profile={profile} headingId={`${id}-profile`} />
        </section>

        <section className="rc-panel" aria-labelledby={`${id}-weights`}>
          <h3 id={`${id}-weights`}>Gewichte</h3>
          <div className="rc-field">
            <span className="rc-label" id={`${id}-preset`}>
              Vorgabe
            </span>
            <SegmentedControl<PresetId | 'custom'>
              label="Vorgabe"
              labelledBy={`${id}-preset`}
              options={PRESET_OPTIONS}
              value={preset ?? 'custom'}
              onChange={(v) => v !== 'custom' && choosePreset(v)}
            />
            <p className="rc-hint">{preset ? 'Ein Regler hebt die Vorgabe auf.' : 'Eigene Einstellung: keine Vorgabe gewählt.'}</p>
          </div>
          <div className="rc-sliders">
            {SLIDERS.map((s) => (
              <Slider
                key={s.key}
                label={s.label}
                value={percent[s.key]}
                min={0}
                max={100}
                step={5}
                format={(v) => `${Math.round(v)} %`}
                onChange={(v) => moveSlider(s.key, v)}
              />
            ))}
          </div>
        </section>

        <section className="rc-panel" aria-labelledby={`${id}-filters`}>
          <h3 id={`${id}-filters`}>Filter und Feed</h3>
          <fieldset className="rc-switches">
            <legend className="visually-hidden">Filter</legend>
            {/* An nur, wenn beide an sind; aus einem Teilstand heraus schaltet der Klick beide an */}
            <div className="rc-master">
              <Switch
                label="Filter"
                checked={hideOutOfStock && hidePurchased}
                onChange={(on) => {
                  setHideOutOfStock(on);
                  setHidePurchased(on);
                }}
              />
            </div>
            <ul className="rc-switch-list">
              <li>
                <Switch label="Ausverkauftes ausblenden" checked={hideOutOfStock} onChange={setHideOutOfStock} />
              </li>
              <li>
                <Switch label="Schon Gekauftes ausblenden" checked={hidePurchased} onChange={setHidePurchased} />
              </li>
            </ul>
          </fieldset>
          <div className="rc-field">
            <span className="rc-label" id={`${id}-feed`}>
              Feed
            </span>
            <SegmentedControl<FeedKind> label="Feed" labelledBy={`${id}-feed`} options={[...FEED_OPTIONS]} value={feed} onChange={setFeed} />
            <p className="rc-hint">
              {feed === 'clean'
                ? 'Der geprüfte Feed aus dem Projekt Product Feed Inspector.'
                : 'So liest ein unachtsames System den Feed: mit Dubletten, falschen Schreibweisen und Einträgen, die nicht stimmen.'}
            </p>
          </div>
        </section>
      </div>

      <section className="rc-panel rc-results" aria-labelledby={`${id}-top`}>
        <h3 id={`${id}-top`}>Die besten {TOP} für {visitor.name}</h3>
        {ranked.length === 0 ? (
          <p className="rc-hint">Kein Produkt übrig.</p>
        ) : (
          <RankList items={ranked} changes={changes} weightSum={sum} flaws={flaws} headingId={`${id}-top`} />
        )}
        {insights.includes('coldStart') ? (
          <InsightBox title="Kaltstart">
            {visitor.name} hat noch nichts getan. Affinität und Ähnlichkeit haben keinen Anhaltspunkt, es kann nur die Beliebtheit wirken (bei Beliebtheit 0 ist auch sie aus). Alle Neuen sehen dieselbe Liste.
          </InsightBox>
        ) : null}
        {insights.includes('monotone') ? (
          <InsightBox title="Eintönig">
            Zählt die Ähnlichkeit fast allein, kommen die vorderen Plätze fast nur aus einer Kategorie. Die Liste wiederholt, was der Besucher gerade angesehen hat.
          </InsightBox>
        ) : null}
        {insights.includes('allZero') ? (
          <InsightBox title="Alle Gewichte auf null">
            Jedes Produkt hat null Punkte, und die Reihenfolge ergibt sich nur aus der Produkt-ID. Das ist keine Empfehlung mehr.
          </InsightBox>
        ) : null}
        <p className="visually-hidden" aria-live="polite" aria-atomic="true">
          {announcement}
        </p>
      </section>
    </div>
  );
}
