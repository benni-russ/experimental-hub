// Aufschlüsselung der fälligen Karten für die Glocke. Eingabe sind die
// aufgelösten Items der Lernrunde, damit die Zahl genau der Runde entspricht.

export interface DueGroup {
  projectId: string;
  title: string;
  count: number;
}

export function groupDue(items: readonly { projectId: string; projectTitle: string; cardId: string }[]): DueGroup[] {
  const groups = new Map<string, DueGroup>();
  for (const item of items) {
    const g = groups.get(item.projectId);
    if (g) g.count += 1;
    else groups.set(item.projectId, { projectId: item.projectId, title: item.projectTitle, count: 1 });
  }
  return [...groups.values()].sort((a, b) => b.count - a.count || a.title.localeCompare(b.title, 'de'));
}

/** Name des Knopfs: Label zuerst, dann die Zahl. */
export function bellLabel(total: number): string {
  return total > 0 ? `Fällige Karten, ${total}` : 'Keine fälligen Karten';
}

export function dueHeadline(total: number): string {
  return `${total} ${total === 1 ? 'Karte' : 'Karten'} fällig`;
}
