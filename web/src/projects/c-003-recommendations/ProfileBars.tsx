import { CATEGORIES } from '../../personalization/catalog';

export interface ProfileRow {
  name: string;
  value: number;
  unknown: boolean; // Kategorie, die es im Katalog nicht gibt (z. B. falsch geschrieben im rohen Feed)
}

// Alle bekannten Kategorien (auch mit 0) plus jede unbekannte Schreibweise, die im Profil vorkommt.
export function profileRows(profile: Record<string, number>): ProfileRow[] {
  const known = new Set<string>(CATEGORIES);
  const rows: ProfileRow[] = CATEGORIES.map((name) => ({ name, value: profile[name] ?? 0, unknown: false }));
  for (const [name, value] of Object.entries(profile)) if (!known.has(name)) rows.push({ name, value, unknown: true });
  return rows.sort((a, b) => b.value - a.value);
}

// Das Affinitätsprofil als kleine Balken: Kategorie, Balken, Prozent als Text.
// Ohne Verlauf gibt es kein Profil; dann steht dort ein Satz statt leerer Balken.
// Eine unbekannte Schreibweise steht als eigene Zeile mit Zeichen und Wort, nicht nur in anderer Farbe.
export function ProfileBars({ profile, headingId }: { profile: Record<string, number>; headingId: string }) {
  const rows = profileRows(profile);
  const empty = rows.every((r) => r.value === 0);
  return (
    <div className="rc-profile">
      <h4 id={headingId}>Affinitätsprofil</h4>
      {empty ? (
        <p className="rc-hint">Noch kein Verlauf, also auch kein Profil.</p>
      ) : (
        <ul className="rc-bars" aria-labelledby={headingId}>
          {rows.map((r) => (
            <li key={r.name} className={`rc-bar-row${r.unknown ? ' is-unknown' : ''}`}>
              <span className="rc-bar-name">
                {r.unknown ? `„${r.name}“` : r.name}
                {r.unknown ? (
                  <span className="rc-bar-warn">
                    <span aria-hidden="true">⚠</span> Schreibweise weicht ab
                  </span>
                ) : null}
              </span>
              <span className="rc-bar-track" aria-hidden="true">
                <span className="rc-bar-fill" style={{ width: `${r.value * 100}%` }} />
              </span>
              <span className="rc-bar-value">{Math.round(r.value * 100)} %</span>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
