// Eigene kleine Datei: der Runner liegt im Hauptbündel und soll nichts aus dem Worker mitziehen.

/** Text eines ErrorEvent ohne „Uncaught “ und ohne bloßes „Error: “ davor. */
export function cleanErrorMessage(message: string): string {
  return message.replace(/^Uncaught /, '').replace(/^Error: /, '');
}
