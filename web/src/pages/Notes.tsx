import { useMemo, useState } from 'react';
import { Link } from 'react-router';
import { useAllNotes } from '../api';
import { SegmentedControl } from '../design/components/SegmentedControl';
import { findProject } from '../projects';
import { filterNotes } from './notesFilter';
import { Breadcrumb } from '../shell/Breadcrumb';
import { breadcrumbFor } from '../shell/breadcrumbs';
import { NOTES } from '../shell/nav';
import './pages.css';

type Mode = 'all' | 'ideas';

const lookup = (id: string) => {
  const meta = findProject(id)?.meta;
  return meta ? { title: meta.title, reflection: meta.reflection } : undefined;
};

export function Notes() {
  const all = useAllNotes();
  const [query, setQuery] = useState('');
  const [mode, setMode] = useState<Mode>('all');

  const groups = useMemo(
    () => (all.data ? filterNotes(all.data.notes, all.data.reflections, lookup, query, mode === 'ideas') : []),
    [all.data, query, mode],
  );
  const hasAny = useMemo(
    () => (all.data ? filterNotes(all.data.notes, all.data.reflections, lookup, '', false).length > 0 : false),
    [all.data],
  );

  if (!all.data) {
    if (all.isPending) return <p className="muted">Lädt …</p>;
    return (
      <p className="field-error" role="alert">
        Die Notizen konnten nicht geladen werden ({all.error?.message}).
      </p>
    );
  }

  return (
    <div className="overview">
      <Breadcrumb crumbs={breadcrumbFor({ kind: 'page', label: NOTES.label })} />
      <h1>Notizen</h1>
      {!hasAny ? (
        <p className="muted">Noch keine Notizen.</p>
      ) : (
        <>
          <div className="notes-tools">
            <div className="field">
              <label htmlFor="notes-search">Suchen</label>
              <input
                id="notes-search"
                type="search"
                className="notes-search"
                value={query}
                onChange={(e) => setQuery(e.target.value)}
              />
            </div>
            <SegmentedControl<Mode>
              label="Anzeige"
              value={mode}
              onChange={setMode}
              options={[
                { value: 'all', label: 'Alles' },
                { value: 'ideas', label: 'Nur Post-Ideen' },
              ]}
            />
          </div>
          {groups.length === 0 ? (
            <p className="muted" role="status">
              Keine Treffer.
            </p>
          ) : (
            groups.map((g) => (
              <section key={g.projectId} className="notes-group" aria-labelledby={`n-${g.projectId}`}>
                <h2 id={`n-${g.projectId}`}>
                  <Link to={`/projekt/${g.projectId}`}>{g.title}</Link>
                </h2>
                {g.note ? (
                  <div>
                    <h3>Notiz</h3>
                    <p className="notes-text">{g.note}</p>
                  </div>
                ) : null}
                {g.postIdea ? (
                  <div>
                    <h3>Post-Idee</h3>
                    <p className="notes-text">{g.postIdea}</p>
                  </div>
                ) : null}
                {g.answers.map((a) => (
                  <div key={a.question}>
                    <h3>{a.question}</h3>
                    <p className="notes-text">{a.answer}</p>
                  </div>
                ))}
              </section>
            ))
          )}
        </>
      )}
    </div>
  );
}
