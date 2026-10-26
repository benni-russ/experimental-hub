import { useId, useReducer, useRef, useState } from 'react';
import { Button } from '../../design/components/Button';
import { CATALOG, cartReducer, cartTotal, EMPTY_CART, euro, reactSteps, toEvent, type CartAction } from './cart';
import { Protocol } from './Protocol';

/** Derselbe Warenkorb mit useReducer: Zeilen, Summe und Event sind aus dem Zustand berechnet. */
export function ReactPanel() {
  const id = useId();
  const [state, dispatch] = useReducer(cartReducer, EMPTY_CART);
  const [steps, setSteps] = useState<string[] | null>(null);
  const addGroup = useRef<HTMLDivElement>(null);

  function send(action: CartAction) {
    setSteps(reactSteps(state, action));
    dispatch(action);
  }

  /** Die Zeile verschwindet gleich; der Fokus geht zurück zu den Artikeln. */
  function sendAndRefocus(action: CartAction) {
    send(action);
    addGroup.current?.querySelector('button')?.focus();
  }

  // Abgeleitet, nicht gespeichert: bei jeder Anzeige neu aus dem Zustand.
  const total = cartTotal(state);
  const event = toEvent(state);

  return (
    <section className="rebuild-panel" aria-labelledby={id}>
      <header className="rebuild-panel-head">
        <h3 id={id}>React</h3>
        <p className="rebuild-muted">useReducer: Die Ansicht wird aus dem Zustand berechnet.</p>
      </header>
      <div className="rebuild-cart">
        <div className="rebuild-add" role="group" aria-label="Artikel hinzufügen" ref={addGroup}>
          {CATALOG.map((item) => (
            <Button
              key={item.item_id}
              variant="secondary"
              aria-label={`${item.item_name} hinzufügen, ${euro(item.price)}`}
              onClick={() => send({ type: 'add', item: { ...item, quantity: 1 } })}
            >
              <span aria-hidden="true">+ </span>
              {item.item_name}
            </Button>
          ))}
        </div>
        {state.items.length === 0 ? <p className="rebuild-empty">Der Warenkorb ist leer.</p> : null}
        <ul className="rebuild-rows" aria-label="Warenkorb">
          {state.items.map((item) => (
            <li key={item.item_id} className="rebuild-row">
              <span className="rebuild-row-name">{item.item_name}</span>
              <span className="rebuild-row-price">je {euro(item.price)}</span>
              <span className="rebuild-qty">
                <Button
                  variant="quiet"
                  className="rebuild-step"
                  aria-label={`${item.item_name}: Menge verringern`}
                  onClick={() => {
                    const action: CartAction = { type: 'setQuantity', item_id: item.item_id, quantity: item.quantity - 1 };
                    if (item.quantity <= 1) sendAndRefocus(action);
                    else send(action);
                  }}
                >
                  −
                </Button>
                <span className="visually-hidden">Menge </span>
                <span className="rebuild-qty-value">{item.quantity}</span>
                <Button
                  variant="quiet"
                  className="rebuild-step"
                  aria-label={`${item.item_name}: Menge erhöhen`}
                  onClick={() => send({ type: 'setQuantity', item_id: item.item_id, quantity: item.quantity + 1 })}
                >
                  +
                </Button>
              </span>
              <Button
                variant="quiet"
                className="rebuild-remove"
                aria-label={`${item.item_name} entfernen`}
                onClick={() => sendAndRefocus({ type: 'remove', item_id: item.item_id })}
              >
                Entfernen
              </Button>
            </li>
          ))}
        </ul>
        <p className="rebuild-total">
          Summe: <output data-role="react-total">{euro(total)}</output>
        </p>
        <pre className="rebuild-event" data-role="react-event" tabIndex={0} role="region" aria-label="Event-Text, React">
          {JSON.stringify(event, null, 2)}
        </pre>
      </div>
      <Protocol
        pattern="Aktion → neuer Zustand → Ansicht neu berechnet"
        lines={steps}
        count="Schreibzugriffe ins DOM im eigenen Code: 0. Das DOM gleicht React an."
        announcement={steps ? `React: ${steps.join('; ')}.` : ''}
      />
    </section>
  );
}
