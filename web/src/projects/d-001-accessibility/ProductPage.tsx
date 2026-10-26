import { useId, useState, type ReactNode } from 'react';
import type { PageNode } from '../../experience/productPage';

// Die Beispielseite mit absichtlichen Barrieren, als echtes HTML. Was hier fehlt (Rolle des Knopfs,
// Fokusring, Beschriftung, Alternativtext), fehlt wirklich; die Lernseite drumherum hat diese Fehler nicht.

const KIND_LABEL: Record<PageNode['kind'], string> = {
  logoLink: 'Link',
  heading: 'Überschrift',
  image: 'Bild',
  price: 'Preis',
  note: 'Hinweistext',
  sizes: 'Größenauswahl',
  quantity: 'Eingabefeld',
  cartButton: 'Element',
  paragraph: 'Absatz',
  link: 'Link',
};

/** Name des Suchknopfs über einem Knoten: „<Art>: <Text> prüfen“. */
export function pickLabel(node: PageNode): string {
  const text = node.text || (node.kind === 'image' ? 'Produktbild' : node.kind === 'quantity' ? 'Menge' : node.id);
  return `${KIND_LABEL[node.kind]}: ${text} prüfen`;
}

interface ProductPageProps {
  page: PageNode[];
  searchMode: boolean;
  onPick: (nodeId: string) => void;
  /** Tab-Nummern je Knoten bzw. je Größe (`sizes-42`) */
  markers?: Record<string, number>;
}

export function ProductPage({ page, searchMode, onPick, markers }: ProductPageProps) {
  const id = useId();
  const [added, setAdded] = useState(false);
  const byId = (nodeId: string) => page.find((n) => n.id === nodeId)!;
  // Die Fokus-Barriere hängt am Logo; behoben ist sie für alle Knoten zugleich.
  const focusVisible = byId('logo').focusVisible;

  const marker = (key: string) =>
    markers?.[key] !== undefined ? (
      <span className="a11y-marker" aria-hidden="true">
        {markers[key]}
      </span>
    ) : null;

  // Jeder Knoten steckt in einem Platz. Im Suchmodus ist sein Inhalt `inert`, darüber liegt ein
  // durchsichtiger Knopf mit Namen: So ist jedes Element per Tab und Enter auswählbar.
  const slot = (node: PageNode, children: ReactNode, className = '') => (
    <div className={`a11y-slot ${className}`.trim()} key={node.id}>
      <div className="a11y-slot-body" inert={searchMode}>
        {children}
      </div>
      {searchMode ? <button type="button" className="a11y-pick" aria-label={pickLabel(node)} onClick={() => onPick(node.id)} /> : null}
    </div>
  );

  function render(node: PageNode): ReactNode {
    switch (node.kind) {
      case 'logoLink':
        return slot(
          node,
          <>
            <a className="a11y-logo" href="#" onClick={(e) => e.preventDefault()}>
              {node.text}
            </a>
            {marker(node.id)}
          </>,
          'a11y-head',
        );
      case 'heading': {
        const Tag = node.element as 'h1' | 'h2' | 'h4';
        return slot(node, <Tag className={`a11y-h a11y-h${node.level}`}>{node.text}</Tag>);
      }
      case 'image':
        return slot(node, <ShoeImage alt={node.alt} />, 'a11y-image');
      case 'price':
        return slot(node, <p className="a11y-price">{node.text}</p>);
      case 'note':
        // Farbe aus dem Modell: #9a9a9a (Barriere) oder #595959 (behoben) auf #ffffff.
        return slot(node, <p className="a11y-note" style={{ color: node.color, background: node.background }}>{node.text}</p>);
      case 'sizes': {
        const fixed = node.stateShownBy === 'colorTextAndDisabled';
        return slot(
          node,
          <fieldset className="a11y-sizes">
            <legend>{node.text}</legend>
            <div className="a11y-size-row">
              {(node.sizes ?? []).map((s) => {
                const soldOut = !s.available;
                return (
                  <span className="a11y-size-cell" key={s.size}>
                    <button
                      type="button"
                      className={`a11y-size ${soldOut ? 'is-soldout' : 'is-available'} ${fixed ? 'is-marked' : ''}`.trim()}
                      disabled={fixed && soldOut}
                    >
                      {fixed && soldOut ? (
                        <>
                          <s>{s.size}</s>
                          <span className="a11y-size-word">ausverkauft</span>
                        </>
                      ) : (
                        s.size
                      )}
                    </button>
                    {marker(`${node.id}-${s.size}`)}
                  </span>
                );
              })}
            </div>
          </fieldset>,
        );
      }
      case 'quantity':
        return slot(
          node,
          <div className="a11y-qty">
            {node.label ? (
              <label className="a11y-qty-label" htmlFor={`${id}-qty`}>
                {node.label}
              </label>
            ) : null}
            <span className="a11y-inline">
              <input
                id={`${id}-qty`}
                className="a11y-input"
                type="text"
                inputMode="numeric"
                placeholder={node.label ? undefined : node.placeholder}
                defaultValue=""
              />
              {marker(node.id)}
            </span>
          </div>,
        );
      case 'cartButton':
        return slot(
          node,
          <span className="a11y-inline">
            {node.element === 'button' ? (
              <button type="button" className="a11y-cart" onClick={() => setAdded(true)}>
                {node.text}
              </button>
            ) : (
              // Absichtliche Barriere: ein div mit Klick, ohne Rolle und ohne tabIndex.
              <div className="a11y-cart" onClick={() => setAdded(true)}>
                {node.text}
              </div>
            )}
            {marker(node.id)}
            {added ? <span className="a11y-added">Liegt im Warenkorb.</span> : null}
          </span>,
        );
      case 'link':
        return slot(
          node,
          <span className="a11y-inline">
            <a className="a11y-link" href="#" onClick={(e) => e.preventDefault()}>
              {node.text}
            </a>
            {marker(node.id)}
          </span>,
        );
      default:
        return slot(node, <p className="a11y-text">{node.text}</p>);
    }
  }

  const [logo, ...rest] = page;
  // „Größentabelle:“ und der Link stehen in einer Zeile, bleiben aber zwei Knoten.
  const labelIndex = rest.findIndex((n) => n.id === 'sizeChartLabel');
  const body = rest.slice(0, labelIndex);
  const tail = rest.slice(labelIndex);

  return (
    <section
      className={`a11y-sample ${focusVisible ? '' : 'a11y-sample--nofocus'} ${searchMode ? 'is-searching' : ''}`.replace(/\s+/g, ' ').trim()}
      aria-label="Beispielseite mit absichtlichen Barrieren"
    >
      {logo ? render(logo) : null}
      <div className="a11y-page">
        {body.map(render)}
        <div className="a11y-row">{tail.map(render)}</div>
      </div>
    </section>
  );
}

/** Produktbild als Strichzeichnung eines Laufschuhs. Ohne `alt` bekommt die Grafik weder Rolle noch Namen. */
function ShoeImage({ alt }: { alt?: string }) {
  const named = alt !== undefined && alt !== '';
  return (
    <svg
      className="a11y-shoe"
      viewBox="0 0 240 140"
      fill="none"
      strokeWidth={2}
      strokeLinecap="round"
      strokeLinejoin="round"
      role={named ? 'img' : undefined}
      aria-label={named ? alt : undefined}
    >
      <path d="M24 98C24 86 30 80 40 78L88 70C98 68 104 60 108 50L114 38C116 34 120 33 124 35L136 42C148 49 160 52 172 54L196 58C210 60 218 70 218 84V98Z" stroke="currentColor" />
      <path d="M20 98H222V106C222 112 218 116 212 116H30C24 116 20 112 20 106Z" stroke="currentColor" />
      <path d="M118 46L132 56M112 56L126 66M106 66L118 74" stroke="currentColor" />
      <path d="M150 66C164 72 184 74 204 74" stroke="currentColor" strokeDasharray="4 5" />
      <path d="M40 116V122M80 116V122M120 116V122M160 116V122M200 116V122" stroke="currentColor" />
    </svg>
  );
}
