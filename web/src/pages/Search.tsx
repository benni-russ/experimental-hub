import { useMemo } from 'react';
import { Link, useSearchParams } from 'react-router';
import { TRACKS } from '@hub/shared';
import { useAllNotes, useAllOwnCards } from '../api';
import { ExperimentMark } from '../design/components/ExperimentMark';
import { Kbd } from '../design/components/Kbd';
import { TrackIcon } from '../design/components/TrackIcon';
import { findProject, projects } from '../projects';
import { excerpt, searchHub, searchTerms, type SearchProject } from '../search/search';
import { Breadcrumb } from '../shell/Breadcrumb';
import { breadcrumbFor } from '../shell/breadcrumbs';
import './pages.css';

const SEARCH_PROJECTS: SearchProject[] = projects.map(({ meta }) => ({
  id: meta.id,
  title: meta.title,
  question: meta.question,
  trackLabel: TRACKS.find((t) => t.id === meta.track)?.label ?? '',
  cards: meta.cards,
}));

export function Search() {
  const [params] = useSearchParams();
  const query = params.get('q') ?? '';
  const ownCards = useAllOwnCards();
  const notes = useAllNotes();

  const result = useMemo(
    () =>
      searchHub(query, {
        projects: SEARCH_PROJECTS,
        ownCards: ownCards.data ?? [],
        notes: notes.data?.notes ?? [],
        reflections: notes.data?.reflections ?? [],
      }),
    [query, ownCards.data, notes.data],
  );

  const terms = searchTerms(query);
  const empty = terms.length === 0;
  const missing = [
    ownCards.isError ? 'eigenen Karten' : null,
    notes.isError ? 'Notizen' : null,
  ].filter((s): s is string => s !== null);
  const loading = ownCards.isPending || notes.isPending;
  const settled = !empty && !loading;

  return (
    <div className="overview search">
      <Breadcrumb crumbs={breadcrumbFor({ kind: 'page', label: 'Suche' })} />
      <h1>Suche</h1>
      <p className="muted search-count" aria-live="polite">
        {!settled ? '' : result.total === 0 ? `Keine Treffer für „${query.trim()}“.` : `${result.total} Treffer für „${query.trim()}“`}
      </p>

      {empty ? (
        <p className="muted">
          Tippe oben ins Suchfeld, um Versuche, Karten und Notizen zu durchsuchen. Mit <Kbd>/</Kbd> springst du von
          überall dorthin.
        </p>
      ) : null}

      {!empty && loading ? <p className="muted">Eigene Karten und Notizen werden noch geladen …</p> : null}
      {!empty && missing.length > 0 ? (
        <p className="field-error" role="alert">
          Die {missing.join(' und ')} konnten nicht geladen werden; die Treffer sind unvollständig.
        </p>
      ) : null}

      {result.experiments.length > 0 ? (
        <section className="search-group" aria-labelledby="h-s-experiments">
          <h2 id="h-s-experiments">
            Versuche <span className="search-group-count">{result.experiments.length}</span>
          </h2>
          <ul className="plain-list search-list">
            {result.experiments.map((hit) => {
              const meta = findProject(hit.projectId)?.meta;
              return (
                <li key={hit.projectId}>
                  <Link to={`/projekt/${hit.projectId}`} className="search-hit">
                    <span className="search-hit-head">
                      <ExperimentMark id={hit.projectId} unit={meta?.kind === 'unit'} small />
                      <span className="search-hit-title">{hit.title}</span>
                    </span>
                    <span className="search-hit-text">{hit.question}</span>
                    {meta ? (
                      <span className="search-hit-meta track-label">
                        <TrackIcon track={meta.track} size={16} /> {hit.trackLabel}
                      </span>
                    ) : null}
                  </Link>
                </li>
              );
            })}
          </ul>
        </section>
      ) : null}

      {result.cards.length > 0 ? (
        <section className="search-group" aria-labelledby="h-s-cards">
          <h2 id="h-s-cards">
            Karten <span className="search-group-count">{result.cards.length}</span>
          </h2>
          <ul className="plain-list search-list">
            {result.cards.map((hit) => (
              <li key={hit.key}>
                <Link to={`/projekt/${hit.projectId}`} className="search-hit">
                  <span className="search-hit-title">{hit.front}</span>
                  <span className="search-hit-text">{excerpt(hit.back, terms)}</span>
                  <span className="search-hit-meta">
                    {hit.own ? 'Eigene Karte · ' : ''}
                    {hit.projectTitle}
                  </span>
                </Link>
              </li>
            ))}
          </ul>
        </section>
      ) : null}

      {result.notes.length > 0 ? (
        <section className="search-group" aria-labelledby="h-s-notes">
          <h2 id="h-s-notes">
            Notizen <span className="search-group-count">{result.notes.length}</span>
          </h2>
          <ul className="plain-list search-list">
            {result.notes.map((hit) => (
              <li key={hit.key}>
                <Link to={`/projekt/${hit.projectId}`} className="search-hit">
                  <span className="search-hit-title">{hit.projectTitle}</span>
                  <span className="search-hit-text">{hit.excerpt}</span>
                  <span className="search-hit-meta">{hit.label}</span>
                </Link>
              </li>
            ))}
          </ul>
        </section>
      ) : null}
    </div>
  );
}
