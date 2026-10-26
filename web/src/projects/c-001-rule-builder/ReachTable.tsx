import { Icon } from '../../design/components/Icon';
import { DEFAULT_ID, allVisitorKinds, type Experience } from '../../personalization/rules';

interface ReachTableProps {
  experiences: Experience[];
  reachById: Record<string, { matches: number; wins: number }>;
  headingId: string;
}

const TOTAL = allVisitorKinds().length;

/** Reichweite je Erlebnis über alle Besucherarten, mit Marken für überdeckte und unerreichbare Regeln. */
export function ReachTable({ experiences, reachById, headingId }: ReachTableProps) {
  const rows = [...experiences.map((e) => ({ id: e.id, name: e.name })), { id: DEFAULT_ID, name: 'Standard' }];
  return (
    <section className="rb-panel" aria-labelledby={headingId}>
      <h3 id={headingId}>Reichweite über alle {TOTAL} Besucherarten</h3>
      <div className="table-scroll" tabIndex={0} role="region" aria-label="Reichweite je Erlebnis">
        <table className="rb-table">
          <thead>
            <tr>
              <th scope="col">Erlebnis</th>
              <th scope="col">Passt bei</th>
              <th scope="col">Gewinnt bei</th>
              <th scope="col">Hinweis</th>
            </tr>
          </thead>
          <tbody>
            {rows.map((r) => {
              const reach = reachById[r.id] ?? { matches: 0, wins: 0 };
              // Der Standard passt immer und wird nie als überdeckt markiert.
              const isDefault = r.id === DEFAULT_ID;
              const unreachable = !isDefault && reach.matches === 0;
              const shadowed = !isDefault && reach.matches > 0 && reach.wins === 0;
              return (
                <tr key={r.id}>
                  <th scope="row">{r.name}</th>
                  <td>
                    {reach.matches} von {TOTAL}
                  </td>
                  <td>
                    {reach.wins} von {TOTAL}
                  </td>
                  <td>
                    {shadowed || unreachable ? (
                      <span className="rb-mark">
                        <Icon name="cross" /> {unreachable ? 'erreicht niemanden' : 'überdeckt'}
                      </span>
                    ) : null}
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
      <p className="rb-hint">
        „Passt bei“ zählt alle Besucherarten, auf die die Bedingungen zutreffen; „Gewinnt bei“ nur die, bei denen das Erlebnis tatsächlich
        ausgespielt wird.
      </p>
    </section>
  );
}
