import { CodeBlock } from '../../design/components/CodeBlock';
import { VALID_PURCHASE } from './fixtures';
import { MAX_NAME_LENGTH, RESERVED_NAMES, RESERVED_PREFIXES, VALUE_TOLERANCE } from './validateEvent';
import './ga4.css';

const PUSHES = `dataLayer.push({ ecommerce: null });
dataLayer.push(${JSON.stringify(VALID_PURCHASE, null, 2)});`;

const SOURCES = [
  {
    href: 'https://developers.google.com/analytics/devguides/collection/ga4/ecommerce?client_type=gtm',
    title: 'Measure ecommerce',
    where: 'Google for Developers, Variante Google Tag Manager',
  },
  {
    href: 'https://support.google.com/analytics/answer/13316687',
    title: 'Event naming rules',
    where: 'Analytics-Hilfe',
  },
  {
    href: 'https://support.google.com/analytics/answer/9267744',
    title: 'Event collection limits',
    where: 'Analytics-Hilfe',
  },
];

const list = (words: string[]) =>
  words.map((w, i) => (
    <span key={w}>
      {i > 0 ? (i === words.length - 1 ? ' und ' : ', ') : null}
      <code>{w}</code>
    </span>
  ));

export default function UnderTheHood() {
  return (
    <div className="ga4-hood">
      <h3>Zwei Aufrufe pro Event</h3>
      <p>
        Die Seite schreibt nicht direkt an GA4, sondern legt Nachrichten in eine Liste namens <code>dataLayer</code>.
        Der Google Tag Manager liest sie und schickt daraus das Event. Weil er neue Angaben mit den bisherigen
        zusammenführt, empfiehlt Google, vorher mit <code>{'{ ecommerce: null }'}</code> das alte Objekt zu leeren.
        Erst dann kommt das eigentliche Event:
      </p>
      <CodeBlock code={PUSHES} label="Gültiges purchase-Event" />

      <h3>Was in das Event gehört</h3>
      <p>
        <code>event</code> ist der Name, etwa <code>view_item</code>, <code>add_to_cart</code> oder{' '}
        <code>purchase</code>. Im Objekt <code>ecommerce</code> stehen die Währung <code>currency</code>, der Wert{' '}
        <code>value</code> und die Liste <code>items</code>. Jedes Item braucht <code>item_id</code> oder{' '}
        <code>item_name</code>; Google empfiehlt beides. <code>price</code> und <code>quantity</code> sind Zahlen, fehlt{' '}
        <code>quantity</code>, gilt 1. Ein Kauf braucht zusätzlich eine eindeutige <code>transaction_id</code>.
      </p>
      <p>
        <code>value</code> ist die Summe aus <code>price × quantity</code> über alle Items. Versand und Steuer stehen in
        eigenen Feldern, <code>shipping</code> und <code>tax</code>, und gehören nicht in <code>value</code>. Sobald ein
        Event <code>value</code> sendet, braucht es <code>currency</code> als dreistelligen Code wie <code>EUR</code>;
        sonst lässt sich der Umsatz nicht richtig zählen.
      </p>

      <h3>Regeln für den Namen</h3>
      <p>
        Höchstens {MAX_NAME_LENGTH} Zeichen. Der Name beginnt mit einem Buchstaben, danach folgen nur Buchstaben, Ziffern
        und Unterstriche; Leerzeichen und Bindestriche sind nicht erlaubt. Groß- und Kleinschreibung ist erlaubt und
        zählt: <code>my_event</code> und <code>My_Event</code> sind zwei verschiedene Events. Kleinbuchstaben mit
        Unterstrich wie <code>add_to_cart</code> sind deshalb Konvention, keine Regel: Wer sich daran hält, vermeidet
        doppelte Events durch unterschiedliche Schreibweise.
      </p>
      <p>
        Reserviert sind die Präfixe {list(RESERVED_PREFIXES)} sowie Namen, die GA4 selbst verwendet, etwa{' '}
        {list(RESERVED_NAMES)}. Google nennt noch weitere; der Prüfer hier kennt nur diese.
      </p>

      <h3>Warum eine Toleranz?</h3>
      <p>
        Computer rechnen mit Kommazahlen im Binärsystem, und viele Dezimalbrüche lassen sich dort nicht genau darstellen.
        In JavaScript ergibt <code>0.1 + 0.2</code> zum Beispiel <code>{String(0.1 + 0.2)}</code>. Damit solche
        Rundungsreste kein Issue auslösen, darf <code>value</code> um bis zu <code>{VALUE_TOLERANCE}</code> von der Summe
        abweichen.
      </p>

      <h3>Was der Prüfer selbst entscheidet</h3>
      <p>
        Ein fehlerhaftes Event fällt oft erst in den Berichten auf, deshalb prüft dieses Projekt vorher. Einige Regeln sind dabei
        eigene Festlegungen: <code>currency</code> muss die Form eines ISO-Codes haben (drei Großbuchstaben), ob es die
        Währung gibt, prüft er nicht. Fehlt ein Preis, zählt das Item mit 0 zur Summe. Und ein Event, das weder{' '}
        <code>ecommerce</code> mitbringt noch einer der drei Typen der Demo ist, prüft er nur am Namen.
      </p>

      <h3>Quellen</h3>
      <p>Stand: Oktober 2026 (abgerufen am 26.10.2026).</p>
      <ul className="ga4-list">
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
