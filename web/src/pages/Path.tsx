import { Link } from 'react-router';
import { TRACKS, type StateResponse } from '@hub/shared';
import { useAppState } from '../api';
import { ExperimentMark } from '../design/components/ExperimentMark';
import { ProgressDots } from '../design/components/ProgressDots';
import { ProjectSketch } from '../design/components/ProjectSketch';
import { StatusTag } from '../design/components/StatusTag';
import { TrackIcon } from '../design/components/TrackIcon';
import { projectsByTrack, type ProjectModule } from '../projects';
import { projectStatus } from '../projects/status';
import { Breadcrumb } from '../shell/Breadcrumb';
import { breadcrumbFor } from '../shell/breadcrumbs';
import { PATH } from '../shell/nav';
import './pages.css';

function Node({ project, state }: { project: ProjectModule; state: StateResponse }) {
  const status = projectStatus(project.meta, state);
  return (
    <Link to={`/projekt/${project.meta.id}`} className={`path-node path-node-${status}`}>
      <ProjectSketch Sketch={project.Sketch} track={project.meta.track} />
      <span className="path-node-head">
        <ExperimentMark id={project.meta.id} small />
        <StatusTag status={status} />
      </span>
      <span className="path-node-title">{project.meta.title}</span>
    </Link>
  );
}

function UnitCard({ unit, state }: { unit: ProjectModule; state: StateResponse }) {
  const status = projectStatus(unit.meta, state);
  return (
    <Link to={`/projekt/${unit.meta.id}`} className={`unit-card unit-card-${status}`}>
      <ExperimentMark id={unit.meta.id} unit small />
      <span className="unit-card-title">{unit.meta.title}</span>
      <StatusTag status={status} />
      <span className="unit-card-question">{unit.meta.question}</span>
    </Link>
  );
}

export function Path() {
  const state = useAppState();
  if (!state.data) {
    if (state.isPending) return <p className="muted">Lädt …</p>;
    return (
      <p className="field-error" role="alert">
        Der Lernstand konnte nicht geladen werden ({state.error?.message}).
      </p>
    );
  }

  const byTrack = projectsByTrack();
  const tracks = TRACKS.filter((t) => (byTrack.get(t.id) ?? []).length > 0);

  return (
    <div className="overview">
      <Breadcrumb crumbs={breadcrumbFor({ kind: 'page', label: PATH.label })} />
      <h1>Lernpfad</h1>
      {tracks.length === 0 ? <p className="muted">Noch keine Projekte registriert.</p> : null}
      {tracks.map((t) => {
        const list = byTrack.get(t.id) ?? [];
        const mains = list.filter((p) => p.meta.kind === 'project');
        const units = list.filter((p) => p.meta.kind === 'unit');
        const attached = (id: string) => units.filter((u) => u.meta.attachedTo === id);
        const loose = units.filter((u) => !mains.some((m) => m.meta.id === u.meta.attachedTo));
        return (
          <section key={t.id} className="path-track" aria-labelledby={`h-${t.id}`}>
            <div className="path-track-head">
              <h2 id={`h-${t.id}`} className="path-track-label">
                <span className="track-badge">
                  <TrackIcon track={t.id} />
                </span>
                {t.label}
              </h2>
              {mains.length > 0 ? (
                <p className="path-track-count">
                  <ProgressDots statuses={mains.map((m) => projectStatus(m.meta, state.data))} />
                  {mains.filter((m) => projectStatus(m.meta, state.data) === 'done').length} von {mains.length}{' '}
                  durchgearbeitet
                </p>
              ) : null}
            </div>
            <ol className="path-nodes">
              {mains.map((m) => (
                <li key={m.meta.id} className="path-item">
                  <Node project={m} state={state.data} />
                  {attached(m.meta.id).length > 0 ? (
                    <ul className="path-units" aria-label={`Mini-Einheiten zu ${m.meta.title}`}>
                      {attached(m.meta.id).map((u) => (
                        <li key={u.meta.id}>
                          <UnitCard unit={u} state={state.data} />
                        </li>
                      ))}
                    </ul>
                  ) : null}
                </li>
              ))}
            </ol>
            {loose.length > 0 ? (
              <div className="path-loose">
                <h3>Weitere Mini-Einheiten</h3>
                <ul className="path-units">
                  {loose.map((u) => (
                    <li key={u.meta.id}>
                      <UnitCard unit={u} state={state.data} />
                    </li>
                  ))}
                </ul>
              </div>
            ) : null}
          </section>
        );
      })}
    </div>
  );
}
