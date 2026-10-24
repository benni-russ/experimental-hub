import { Suspense, useEffect, useRef, useState, type ReactNode } from 'react';
import { Link, useParams } from 'react-router';
import { TRACKS } from '@hub/shared';
import { useAppState, useOpenProject, useQuizAttempts } from '../api';
import { Disclosure } from '../design/components/Disclosure';
import { ExperimentMark } from '../design/components/ExperimentMark';
import { ProjectSketch } from '../design/components/ProjectSketch';
import { StatusTag } from '../design/components/StatusTag';
import { TrackIcon } from '../design/components/TrackIcon';
import { CardList } from '../learning/CardList';
import { Intro } from '../learning/Intro';
import { NotesPanel } from '../learning/NotesPanel';
import { Quiz } from '../learning/Quiz';
import { Reflection } from '../learning/Reflection';
import { SectionActionsTarget } from '../learning/SectionActions';
import '../learning/learning.css';
import { Breadcrumb } from '../shell/Breadcrumb';
import { breadcrumbFor } from '../shell/breadcrumbs';
import { findProject, type ProjectModule } from '../projects';
import { projectStatus } from '../projects/status';

function Section({ id, title, children }: { id: string; title: string; children: ReactNode }) {
  const [actions, setActions] = useState<HTMLDivElement | null>(null);
  return (
    <section className="project-section" aria-labelledby={`h-${id}`}>
      <div className="project-section-head">
        <h2 id={`h-${id}`}>{title}</h2>
        <div ref={setActions} className="project-section-actions" />
      </div>
      <SectionActionsTarget.Provider value={actions}>{children}</SectionActionsTarget.Provider>
    </section>
  );
}

function RefList({ label, ids }: { label: string; ids: string[] }) {
  if (ids.length === 0) return null;
  return (
    <div>
      <h3>{label}</h3>
      <ul className="plain-list">
        {ids.map((id) => {
          const target = findProject(id);
          return (
            <li key={id}>
              {target ? (
                <Link to={`/projekt/${target.meta.id}`}>{target.meta.title}</Link>
              ) : (
                <span>{id} (noch nicht gebaut)</span>
              )}
            </li>
          );
        })}
      </ul>
    </div>
  );
}

function ProjectView({ project }: { project: ProjectModule }) {
  const { meta, Demo, UnderTheHood, Sketch } = project;
  const isUnit = meta.kind === 'unit';
  const parent = meta.attachedTo ? findProject(meta.attachedTo)?.meta : undefined;
  const state = useAppState();
  const attempts = useQuizAttempts(meta.id);
  const open = useOpenProject();

  // Einmal pro Projekt öffnen; der Server-Aufruf ist idempotent, der Guard
  // verhindert nur die doppelte Ausführung im StrictMode.
  const openedFor = useRef<string | null>(null);
  useEffect(() => {
    if (openedFor.current === meta.id) return;
    openedFor.current = meta.id;
    open.mutate({ projectId: meta.id, cardIds: meta.cards.map((c) => c.id) });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [meta.id]);

  const track = TRACKS.find((t) => t.id === meta.track);
  const status = state.data ? projectStatus(meta, state.data) : null;
  const fallback = <p className="muted">Wird geladen …</p>;

  return (
    <div className="project-layout">
      <article className="project-main">
        <Breadcrumb crumbs={breadcrumbFor({ kind: 'project', meta, parent })} />
        <header className="project-header">
          <ExperimentMark id={meta.id} unit={isUnit} />
          <div className="project-header-text">
            <h1>{meta.title}</h1>
            <p className="project-meta">
              <span className="track-label">
                <TrackIcon track={meta.track} size={16} /> {track?.label}
                {isUnit ? ' · Mini-Einheit' : null}
              </span>
              {status ? <StatusTag status={status} /> : null}
            </p>
            <p className="project-question">{meta.question}</p>
          </div>
          <ProjectSketch Sketch={Sketch} track={meta.track} />
          {open.isError ? (
            <p className="muted" role="status">
              Fortschritt konnte nicht gespeichert werden; wird beim nächsten Öffnen erneut versucht.
            </p>
          ) : null}
        </header>

        <Section id="intro" title="Einstieg">
          <Intro meta={meta} attempts={attempts.data} loadError={attempts.error?.message} />
        </Section>

        {!isUnit && Demo ? (
          <Section id="demo" title="Demo">
            <Suspense fallback={fallback}>
              <Demo />
            </Suspense>
          </Section>
        ) : null}

        {UnderTheHood ? (
          <Section id="hood" title={isUnit ? 'Erklärung' : 'Unter der Haube'}>
            {isUnit ? (
              <Suspense fallback={fallback}>
                <UnderTheHood />
              </Suspense>
            ) : (
              <Disclosure summary="Formel, Annahmen und Grenzen" marker="help">
                <Suspense fallback={fallback}>
                  <UnderTheHood />
                </Suspense>
              </Disclosure>
            )}
          </Section>
        ) : null}

        {!isUnit && meta.quiz.length > 0 ? (
          <Section id="quiz" title="Wissenscheck">
            <Quiz
              projectId={meta.id}
              questions={meta.quiz}
              attempts={attempts.data}
              estimateQuestionId={meta.intro.estimateQuestionId}
            />
            {attempts.isError ? (
              <p className="field-error" role="alert">
                Gespeicherte Antworten konnten nicht geladen werden ({attempts.error.message}).
              </p>
            ) : null}
          </Section>
        ) : null}

        {meta.reflection.length > 0 ? (
          <Section id="reflection" title="Reflexion">
            <Reflection projectId={meta.id} prompts={meta.reflection} />
          </Section>
        ) : null}

        {meta.cards.length > 0 ? (
          <Section id="cards" title="Karten">
            <CardList projectId={meta.id} cards={meta.cards} />
          </Section>
        ) : null}

        <footer
          className={`project-footer${
            meta.buildsOn.length + meta.leadsTo.length + (meta.attachedTo ? 1 : 0) === 0 ? ' is-empty' : ''
          }`}
        >
          <RefList label="Baut auf" ids={meta.buildsOn} />
          <RefList label="Führt zu" ids={meta.leadsTo} />
          {meta.attachedTo ? <RefList label="Gehört zu" ids={[meta.attachedTo]} /> : null}
        </footer>
      </article>
      <NotesPanel projectId={meta.id} />
    </div>
  );
}

export function Project() {
  const { id } = useParams();
  const project = id ? findProject(id) : undefined;
  if (!project) {
    return (
      <section>
        <h1>Projekt nicht gefunden</h1>
        <p>Dieses Projekt gibt es im Hub nicht.</p>
        <p>
          <Link to="/pfad">Zum Lernpfad</Link>
        </p>
      </section>
    );
  }
  // key: Zustand der Bausteine gehört zu genau einem Projekt.
  return <ProjectView key={project.meta.id} project={project} />;
}

