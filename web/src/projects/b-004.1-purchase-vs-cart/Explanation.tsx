import { CodeBlock } from '../../design/components/CodeBlock';
import { VALID_ADD_TO_CART, VALID_PURCHASE } from '../b-004-ga4-event-builder/fixtures';
import { DOUBLE_PUSH, FIELD_ROWS, fmt, valueFormula } from './compare';
import './purchase.css';

const SOURCES = [
  {
    href: 'https://developers.google.com/analytics/devguides/collection/ga4/ecommerce?client_type=gtm',
    title: 'Measure ecommerce',
    where: 'Google for Developers, Variante Google Tag Manager',
  },
  {
    href: 'https://support.google.com/analytics/answer/12313109',
    title: 'Transaction ID (Measure ecommerce)',
    where: 'Analytics-Hilfe',
  },
];

const json = (e: object) => JSON.stringify(e, null, 2);

export default function Explanation() {
  return (
    <div className="pvc-explain">
      <p>
        Google zeigt das Leeren des alten Objekts mit <code>{'{ ecommerce: null }'}</code> vor E-Commerce-Events; hier
        steht es vor beiden, dann folgt das eigentliche Event. Der Aufbau ist fast gleich. Daneben siehst du, was beim Kauf dazukommt.
      </p>
      <div className="pvc-pair">
        <div>
          <span className="pvc-label">add_to_cart: Kunde legt in den Warenkorb</span>
          <CodeBlock code={json(VALID_ADD_TO_CART)} label="add_to_cart-Event" />
        </div>
        <div>
          <span className="pvc-label">purchase: Kunde hat bezahlt</span>
          <CodeBlock code={json(VALID_PURCHASE)} label="purchase-Event" />
        </div>
      </div>
      <div
        className="pvc-wrap"
        tabIndex={0}
        role="region"
        aria-label="Tabelle: Felder von add_to_cart und purchase, seitlich verschiebbar"
      >
        <table className="pvc-table">
          <caption>Dieselben Felder in beiden Beispielen (live aus den Objekten oben gelesen)</caption>
          <thead>
            <tr>
              <th scope="col">Feld</th>
              <th scope="col">add_to_cart</th>
              <th scope="col">purchase</th>
            </tr>
          </thead>
          <tbody>
            {FIELD_ROWS.map((r) => (
              <tr key={r.label}>
                <th scope="row">
                  <code>{r.label}</code>
                </th>
                <td>{r.cart}</td>
                <td>{r.purchase}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <h3>Was value jeweils zählt</h3>
      <p>
        Google definiert <code>value</code> als Summe aus <code>price × quantity</code> über alle Items im Event, ohne
        Steuer und Versand. Das Wort bleibt gleich, doch die Events decken Unterschiedliches ab:
      </p>
      <ul>
        <li>
          <strong>add_to_cart:</strong> Weil value die Items im Event summiert, zählt es hier nur die gerade hinzugefügten Items, nicht den ganzen Warenkorb.{' '}
          <span className="pvc-calc">{valueFormula(VALID_ADD_TO_CART.ecommerce.items)}</span>
        </li>
        <li>
          <strong>purchase:</strong> die ganze Bestellung.{' '}
          <span className="pvc-calc">{valueFormula(VALID_PURCHASE.ecommerce.items)}</span>
        </li>
      </ul>
      <p>
        Der Versand von {fmt(VALID_PURCHASE.ecommerce.shipping)} steht beim Kauf in <code>shipping</code>. Rechnest du
        ihn in <code>value</code> ein, ist der Umsatz zu hoch, und der Prüfer aus dem Projekt meldet{' '}
        <code>value_mismatch</code>.
      </p>

      <h3>Derselbe Kauf zweimal</h3>
      <p>
        Wird der Kauf zweimal gesendet, etwa weil die Bestätigungsseite neu geladen wird, sieht jeder Push für sich
        richtig aus. Der Prüfer meldet bei keinem etwas, denn er sieht immer nur ein Event. Hier tragen beide Pushes
        dieselbe <code>transaction_id</code>:
      </p>
      <ul>
        {DOUBLE_PUSH.map((e, i) => (
          <li key={i}>
            Push {i + 1}: <code>{e.event}</code> mit <code>transaction_id</code>{' '}
            <code>{e.ecommerce.transaction_id}</code>
          </li>
        ))}
      </ul>
      <p>
        Laut Google dedupliziert Analytics Käufe mit derselben Transaktions-ID. Das gilt nur für Daten aus Web-Streams,
        nicht für App-Streams, und für Transaktionen desselben Nutzers; dieselbe ID sollte also nie für verschiedene
        Nutzer verwendet werden. Ein Zeitfenster nennt Google in diesem Artikel nicht. Umgekehrt gilt: Tragen zwei
        verschiedene Bestellungen dieselbe ID, werden Käufe untergezählt. Jede Bestellung braucht deshalb ihre eigene
        ID, und eine leere ID wird gar nicht erst gesendet.
      </p>

      <h3>Quellen</h3>
      <p>Stand: Oktober 2026 (abgerufen am 26.10.2026).</p>
      <ul>
        {SOURCES.map((s) => (
          <li key={s.href}>
            <a href={s.href} target="_blank" rel="noreferrer">
              {s.title}
            </a>{' '}
            ({s.where}, englisch)
          </li>
        ))}
      </ul>
    </div>
  );
}
