import { useState } from 'react';
import type { ReflectionPrompt } from '@hub/shared';
import { useAllNotes, useSaveReflection } from '../api';
import { reflectionView } from './reflectionView';
import { SaveStatusLine, useAutosaver } from './useAutosaver';

function ReflectionItem({
  projectId,
  prompt,
  initial,
}: {
  projectId: string;
  prompt: ReflectionPrompt;
  initial: string;
}) {
  const save = useSaveReflection();
  const [text, setText] = useState(initial);
  const { schedule, status } = useAutosaver<string>(async (answer) => {
    await save.mutateAsync({ questionId: prompt.id, projectId, answer });
  });
  const id = `reflection-${prompt.id}`;
  return (
    <div className="field">
      <label htmlFor={id} className="question-prompt">
        {prompt.prompt}
      </label>
      <textarea
        id={id}
        className="input textarea"
        rows={4}
        value={text}
        onChange={(e) => {
          setText(e.target.value);
          schedule(e.target.value);
        }}
      />
      <SaveStatusLine status={status} />
    </div>
  );
}

export function Reflection({ projectId, prompts }: { projectId: string; prompts: ReflectionPrompt[] }) {
  const all = useAllNotes();
  const view = reflectionView({ hasData: all.data !== undefined, isError: all.isError });
  if (view === 'loading') return <p className="muted">Lädt …</p>;
  if (!all.data) {
    // Ohne den gespeicherten Stand würde Tippen ihn überschreiben.
    return (
      <div>
        {prompts.map((p) => (
          <p key={p.id} className="question-prompt">
            {p.prompt}
          </p>
        ))}
        <p className="field-error" role="alert">
          Deine gespeicherten Antworten konnten nicht geladen werden ({all.error?.message}). Bitte die
          Seite neu laden.
        </p>
      </div>
    );
  }
  return (
    <div>
      {all.isError ? (
        <p className="muted" role="status">
          Aktualisieren hat nicht geklappt. Dein Text bleibt hier stehen.
        </p>
      ) : null}
      {prompts.map((p) => (
        <ReflectionItem
          key={p.id}
          projectId={projectId}
          prompt={p}
          initial={all.data.reflections.find((r) => r.questionId === p.id)?.answer ?? ''}
        />
      ))}
    </div>
  );
}
