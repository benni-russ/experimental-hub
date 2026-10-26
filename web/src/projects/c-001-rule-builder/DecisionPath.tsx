import { Icon } from '../../design/components/Icon';
import { ATTRIBUTES, DEFAULT_ID, describeCondition, type DecisionStep, type Experience } from '../../personalization/rules';
import type { VisitorTraits } from '../../personalization/visitors';

interface DecisionPathProps {
  experiences: Experience[];
  steps: DecisionStep[];
  winnerId: string;
  traits: VisitorTraits;
  visitorName: string;
  headingId: string;
}

// „Gerät ist Desktop“: der tatsächliche Wert des Besuchers für das Merkmal.
function actual(attribute: keyof VisitorTraits, traits: VisitorTraits): string {
  const attr = ATTRIBUTES.find((a) => a.id === attribute);
  const label = attr?.values.find((v) => v.value === traits[attribute])?.label ?? traits[attribute];
  return `${attr?.label ?? attribute} ist ${label}`;
}

/** Entscheidungsweg für einen Besucher: Regel für Regel, mit Gewinner und überdeckten Treffern. */
export function DecisionPath({ experiences, steps, winnerId, traits, visitorName, headingId }: DecisionPathProps) {
  const defaultWins = winnerId === DEFAULT_ID;
  return (
    <section className="rb-panel" aria-labelledby={headingId}>
      <h3 id={headingId}>Entscheidungsweg für {visitorName}</h3>
      <ol className="rb-path">
        {steps.map((s, i) => {
          const exp = experiences.find((e) => e.id === s.experienceId);
          const wins = s.experienceId === winnerId;
          return (
            <li key={s.experienceId} className={`rb-step${wins ? ' is-winner' : ''}${s.matched ? '' : ' is-miss'}`}>
              <span className="rb-step-mark" aria-hidden="true">
                <Icon name={s.matched ? 'check' : 'cross'} />
              </span>
              <span>
                <strong>Regel {i + 1}</strong> ({exp?.name}) passt?{' '}
                {s.matched ? (
                  wins ? (
                    <>
                      ja – <strong>gewinnt</strong>
                    </>
                  ) : (
                    <>ja – hätte auch gepasst</>
                  )
                ) : s.failedCondition ? (
                  <>
                    nein – {actual(s.failedCondition.attribute, traits)} (verlangt: {describeCondition(s.failedCondition)})
                  </>
                ) : (
                  <>nein</>
                )}
              </span>
            </li>
          );
        })}
        <li className={`rb-step${defaultWins ? ' is-winner' : ' is-miss'}`}>
          <span className="rb-step-mark" aria-hidden="true">
            <Icon name={defaultWins ? 'check' : 'cross'} />
          </span>
          <span>
            <strong>Standard</strong>{' '}
            {defaultWins ? (
              <>
                – nichts anderes passt, der Standard <strong>gewinnt</strong>
              </>
            ) : (
              <>– wird nicht gebraucht, es passt etwas anderes</>
            )}
          </span>
        </li>
      </ol>
    </section>
  );
}
