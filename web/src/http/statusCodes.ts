// Tabelle der Statuscodes, die die Lernprojekte durchspielen.

export interface StatusInfo {
  status: number;
  text: string;
  klass: '2xx' | '4xx' | '5xx';
  whoseFault: 'niemand' | 'Client' | 'Server';
  retry: boolean;
}

export const STATUS_CODES: StatusInfo[] = [
  { status: 200, text: 'In Ordnung', klass: '2xx', whoseFault: 'niemand', retry: false },
  { status: 201, text: 'Angelegt', klass: '2xx', whoseFault: 'niemand', retry: false },
  { status: 204, text: 'Keine Antwortdaten', klass: '2xx', whoseFault: 'niemand', retry: false },
  { status: 400, text: 'Ungültige Anfrage', klass: '4xx', whoseFault: 'Client', retry: false },
  { status: 401, text: 'Nicht angemeldet', klass: '4xx', whoseFault: 'Client', retry: false },
  { status: 403, text: 'Verboten', klass: '4xx', whoseFault: 'Client', retry: false },
  { status: 404, text: 'Nicht gefunden', klass: '4xx', whoseFault: 'Client', retry: false },
  { status: 429, text: 'Zu viele Anfragen', klass: '4xx', whoseFault: 'Client', retry: true },
  { status: 500, text: 'Serverfehler', klass: '5xx', whoseFault: 'Server', retry: true },
  { status: 503, text: 'Nicht verfügbar', klass: '5xx', whoseFault: 'Server', retry: true },
];
