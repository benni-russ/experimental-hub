import { useId, useState } from 'react';
import { Icon } from '../../design/components/Icon';
import { SegmentedControl } from '../../design/components/SegmentedControl';
import { announce, headingOutline, tabOrder, type PageNode, type Perspective } from '../../experience/productPage';
import { ProductPage } from './ProductPage';

export const PERSPECTIVES: { value: Perspective; label: string }[] = [
  { value: 'see', label: 'Sehen' },
  { value: 'hear', label: 'Hören' },
  { value: 'keyboard', label: 'Tastatur' },
  { value: 'vision', label: 'Sehschwäche' },
];

type VisionMode = 'protan' | 'deutan' | 'tritan' | 'gray' | 'blur';

const VISION_OPTIONS: { value: VisionMode; label: string }[] = [
  { value: 'protan', label: 'Rotschwäche' },
  { value: 'deutan', label: 'Grünschwäche' },
  { value: 'tritan', label: 'Blauschwäche' },
  { value: 'gray', label: 'Graustufen' },
  { value: 'blur', label: 'Unschärfe' },
];

// Farbmatrizen nach Machado, Oliveira und Fernandes (2009), Stärke 1,0, je Zeile R, G, B.
// feColorMatrix rechnet standardmäßig im linearen RGB, wie das Modell es verlangt.
const MACHADO: Record<'protan' | 'deutan' | 'tritan', number[][]> = {
  protan: [
    [0.152286, 1.052583, -0.204868],
    [0.114503, 0.786281, 0.099216],
    [-0.003882, -0.048116, 1.051998],
  ],
  deutan: [
    [0.367322, 0.860646, -0.227968],
    [0.280085, 0.672501, 0.047413],
    [-0.01182, 0.04294, 0.968881],
  ],
  tritan: [
    [1.255528, -0.076749, -0.178779],
    [-0.078411, 0.930809, 0.147602],
    [0.004733, 0.691367, 0.3039],
  ],
};

/** Die 3×3-Matrix als `values` für feColorMatrix (4 × 5, Alpha bleibt). */
export function matrixValues(m: number[][]): string {
  return [...m.map((row) => [...row, 0, 0].join(' ')), '0 0 0 1 0'].join(' ');
}

interface PerspectivesProps {
  page: PageNode[];
  searchMode: boolean;
  onPick: (nodeId: string) => void;
}

export function Perspectives({ page, searchMode, onPick }: PerspectivesProps) {
  const rawId = useId();
  // useId enthält Zeichen, die in url(#…) stören; für die Filter-IDs nur Buchstaben und Ziffern.
  const id = rawId.replace(/[^a-zA-Z0-9]/g, '');
  const [view, setView] = useState<Perspective>('see');
  const [vision, setVision] = useState<VisionMode>('protan');

  const lines = announce(page);
  const outline = headingOutline(page);
  const order = tabOrder(page);
  const markers = Object.fromEntries(order.map((key, i) => [key, i + 1]));
  const cartReachable = order.includes('cart');

  const filter = vision === 'gray' ? 'grayscale(1)' : vision === 'blur' ? 'blur(2px)' : `url(#${id}-${vision})`;

  return (
    <div className="a11y-perspectives">
      <div className="a11y-field">
        <span className="a11y-label" id={`${id}-view`}>
          Blickwinkel
        </span>
        <SegmentedControl<Perspective> label="Blickwinkel" labelledBy={`${id}-view`} options={PERSPECTIVES} value={view} onChange={setView} />
      </div>

      {view === 'see' ? <ProductPage page={page} searchMode={searchMode} onPick={onPick} /> : null}

      {view === 'hear' ? (
        <div className="a11y-hear">
          <section className="a11y-panel" aria-labelledby={`${id}-lines`}>
            <h3 id={`${id}-lines`}>Was ein Vorleseprogramm ansagt</h3>
            <ol className="a11y-lines">
              {lines.map((line, i) => (
                <li key={line.nodeId}>
                  <span className="a11y-line-no" aria-hidden="true">
                    {i + 1}
                  </span>
                  {searchMode ? (
                    <button type="button" className="a11y-line-pick" onClick={() => onPick(line.nodeId)}>
                      {line.text}
                      <span className="visually-hidden"> prüfen</span>
                    </button>
                  ) : (
                    <span className="a11y-line-text">{line.text}</span>
                  )}
                </li>
              ))}
            </ol>
            <p className="a11y-hint">Modell – echte Screenreader sagen je nach Programm und Einstellung anderes an.</p>
          </section>
          <section className="a11y-panel" aria-labelledby={`${id}-outline`}>
            <h3 id={`${id}-outline`}>Gliederung der Überschriften</h3>
            <ul className="a11y-outline">
              {outline.map((h) => (
                <li key={h.nodeId} style={{ paddingLeft: `${(h.level - 1) * 1}rem` }}>
                  <span className="a11y-outline-level">Ebene {h.level}</span> {h.text}
                  {h.skipped ? (
                    <span className="tag a11y-skip">
                      <Icon name="info" size={14} /> übersprungen
                    </span>
                  ) : null}
                </li>
              ))}
            </ul>
          </section>
        </div>
      ) : null}

      {view === 'keyboard' ? (
        <div className="a11y-keyboard">
          <p className="a11y-hint">
            Klick in die Seite und geh mit Tab weiter. Die Nummern zeigen die Reihenfolge der Tab-Stopps.
            {searchMode ? ' Funde meldest du in Sehen, Hören oder Sehschwäche; hier bleibt die Seite bedienbar.' : ''}
          </p>
          <ProductPage page={page} searchMode={false} onPick={onPick} markers={markers} />
          <p className="a11y-summary">
            {order.length} Tab-Stopps. „In den Warenkorb“ {cartReachable ? `ist Stopp ${markers.cart}.` : 'hat keine Nummer: Per Tab kommst du nicht hin.'}
          </p>
        </div>
      ) : null}

      {view === 'vision' ? (
        <div className="a11y-vision">
          <div className="a11y-field">
            <span className="a11y-label" id={`${id}-vision`}>
              Sehschwäche
            </span>
            <SegmentedControl<VisionMode> label="Sehschwäche" labelledBy={`${id}-vision`} options={VISION_OPTIONS} value={vision} onChange={setVision} />
          </div>
          <svg className="a11y-filters" width="0" height="0" aria-hidden="true" focusable="false">
            {(Object.keys(MACHADO) as (keyof typeof MACHADO)[]).map((k) => (
              <filter key={k} id={`${id}-${k}`}>
                <feColorMatrix type="matrix" values={matrixValues(MACHADO[k])} />
              </filter>
            ))}
          </svg>
          {/* Der Filter liegt auf dem Inhalt der Plätze, nicht auf der ganzen Seite: So bleibt der
              Fokusring der Suchknöpfe scharf und farbecht. */}
          <div className="a11y-filtered">
            <ProductPage page={page} searchMode={searchMode} onPick={onPick} filter={filter} />
          </div>
          <p className="a11y-hint">Näherung: Wie stark sich eine Sehschwäche auswirkt, ist von Mensch zu Mensch verschieden.</p>
        </div>
      ) : null}
    </div>
  );
}
