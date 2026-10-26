import { useEffect, useId, useMemo, useRef, useState } from 'react';
import { InsightBox } from '../../design/components/InsightBox';
import { cleanFeed, inspectFeed, readFeedNaively, type FeedIssue } from '../../personalization/inspectFeed';
import { FEED_DATE, RAW_FEED } from '../../personalization/rawFeed';
import { EffectCompare } from './EffectCompare';
import { FeedView, type FeedPane } from './FeedView';
import { IssueList, issueKey } from './IssueList';
import './feedInspector.css';

export default function Demo() {
  const id = useId();
  const [marked, setMarked] = useState<FeedIssue | null>(null);
  const [pane, setPane] = useState<FeedPane>('raw');
  const [announcement, setAnnouncement] = useState('');
  const root = useRef<HTMLDivElement>(null);

  const inspected = useMemo(() => inspectFeed(RAW_FEED, FEED_DATE), []);
  const naive = useMemo(() => readFeedNaively(RAW_FEED), []);
  const clean = useMemo(() => cleanFeed(inspected.products, inspected.issues), [inspected]);

  const markedIndex = marked ? marked.index : null;

  // Nach dem Markieren den Eintrag in Rohtext und Tabelle in den Blick holen (verborgene Ansichten tun nichts).
  useEffect(() => {
    if (markedIndex === null) return;
    for (const selector of ['.fi-pane-raw', '.fi-pane-table']) {
      root.current?.querySelector(`${selector} [data-entry="${markedIndex}"]`)?.scrollIntoView({ block: 'nearest', inline: 'nearest' });
    }
  }, [markedIndex, pane]);

  function mark(issue: FeedIssue | null) {
    setMarked(issue);
    if (!issue) {
      setAnnouncement('Markierung aufgehoben.');
      return;
    }
    const entry = inspected.products.find((e) => e.index === issue.index);
    setAnnouncement(`Markiert: Eintrag ${issue.index + 1}${entry ? `, Zeile ${entry.line}` : ''}, Feld ${issue.field}.`);
  }

  return (
    <div className="fi-demo" ref={root}>
      <FeedView
        text={RAW_FEED}
        entries={inspected.products}
        issues={inspected.issues}
        marked={markedIndex}
        pane={pane}
        onPane={setPane}
        headingId={`${id}-feed`}
      />
      <IssueList
        entries={inspected.products}
        issues={inspected.issues}
        marked={marked ? issueKey(marked) : null}
        onMark={mark}
        headingId={`${id}-issues`}
      />
      <EffectCompare entries={inspected.products} issues={inspected.issues} naive={naive} clean={clean} headingId={`${id}-effect`} />
      <InsightBox title="Fehler ohne Fehlermeldung">
        Die meisten Feedfehler werfen keinen Fehler. Sie machen Empfehlungen leise schlechter: ein ausverkaufter Artikel steht oben, ein Produkt zweimal in der Liste, die Vorlieben eines
        Besuchers verteilen sich auf zwei Schreibweisen. Erst der Blick in den Feed zeigt, warum.
      </InsightBox>
      <p className="visually-hidden" aria-live="polite" aria-atomic="true">
        {announcement}
      </p>
    </div>
  );
}
