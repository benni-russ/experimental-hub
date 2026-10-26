import { CATEGORIES } from '../../personalization/catalog';

// Das Affinitätsprofil als kleine Balken: Kategorie, Balken, Prozent als Text.
// Ohne Verlauf gibt es kein Profil; dann steht dort ein Satz statt leerer Balken.
export function ProfileBars({ profile, headingId }: { profile: Record<string, number>; headingId: string }) {
  const rows = CATEGORIES.map((name) => ({ name, value: profile[name] ?? 0 })).sort((a, b) => b.value - a.value);
  const empty = rows.every((r) => r.value === 0);
  return (
    <div className="rc-profile">
      <h4 id={headingId}>Affinitätsprofil</h4>
      {empty ? (
        <p className="rc-hint">Noch kein Verlauf, also auch kein Profil.</p>
      ) : (
        <ul className="rc-bars" aria-labelledby={headingId}>
          {rows.map((r) => (
            <li key={r.name} className="rc-bar-row">
              <span className="rc-bar-name">{r.name}</span>
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
