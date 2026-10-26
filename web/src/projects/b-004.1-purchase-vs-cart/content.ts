import type { ContentMeta } from '@hub/shared';

// Die Zahlen der Tabelle und der Rechnung werden in Explanation.tsx aus den
// Beispielobjekten (fixtures.ts) berechnet; die Texte hier nennen keine Zahlen.
// content.test.ts prüft das. Karten und Reflexion zeigen reinen Text: keine Backticks.

export const meta: ContentMeta = {
  id: 'B-004.1',
  slug: 'purchase-vs-cart',
  title: 'Purchase vs. Add-to-Cart',
  track: 'web',
  kind: 'unit',
  question: 'Wodurch unterscheidet sich ein Kauf von einem Eintrag in den Warenkorb?',
  buildsOn: [],
  leadsTo: [],
  attachedTo: 'B-004',
  intro: {
    text:
      'Ein Kunde legt einen Kaffeebecher in den Warenkorb und kauft später. Für GA4 sind das zwei verschiedene Ereignisse. ' +
      'Sie sehen sich ähnlich, meinen aber nicht dasselbe, vor allem beim Wert. Hier stehen beide nebeneinander: woran man sie ' +
      'unterscheidet, was value jeweils zählt und was passiert, wenn derselbe Kauf zweimal gemeldet wird.',
  },
  quiz: [],
  reflection: [
    {
      id: 'B-004.1-refl-01',
      prompt:
        'Wo in einem Shop könnte ein Kaufereignis ungewollt zweimal ausgelöst werden, etwa beim Neuladen der Bestätigungsseite? Woher käme eine Bestellnummer, die sich dabei nicht ändert?',
    },
    {
      id: 'B-004.1-refl-02',
      prompt:
        'Was würdest du als value senden, wenn ein Kunde mehrere verschiedene Artikel auf einmal in den Warenkorb legt? Und was beim Kauf, wenn Versandkosten dazukommen?',
    },
  ],
  cards: [
    {
      id: 'B-004.1-card-01',
      front: 'Was unterscheidet add_to_cart von purchase im Aufbau?',
      back: 'Beide tragen Währung, Wert und eine Liste von Items. Der Kauf braucht zusätzlich eine transaction_id und kann Versand und Steuer in eigenen Feldern melden. Das Warenkorb-Ereignis kommt ohne Bestellnummer aus.',
    },
    {
      id: 'B-004.1-card-02',
      front: 'Was zählt value bei add_to_cart, was beim Kauf?',
      back: 'In beiden Fällen die Summe aus Preis mal Menge der Items im jeweiligen Event, ohne Versand und Steuer. Beim Warenkorb sind das nur die gerade hinzugefügten Items, beim Kauf die ganze Bestellung.',
    },
    {
      id: 'B-004.1-card-03',
      front: 'Wozu dient die transaction_id?',
      back: 'Sie kennzeichnet einen Kauf eindeutig und ist für purchase Pflicht. Damit erkennt Google denselben Kauf, der doppelt ankommt, und zählt ihn nur einmal. Das gilt für Web-Streams, nicht für App-Streams.',
    },
    {
      id: 'B-004.1-card-04',
      front: 'Was passiert, wenn zwei verschiedene Bestellungen dieselbe transaction_id tragen?',
      back: 'Google hält sie für denselben Kauf, und Käufe werden untergezählt. Jede Bestellung braucht ihre eigene ID, und eine leere ID sendet man besser gar nicht.',
    },
  ],
};
