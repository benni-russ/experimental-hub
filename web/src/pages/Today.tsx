import { Link } from 'react-router';
import { TRACKS, type StateResponse } from '@hub/shared';
import { useAppState, useUpcomingCards } from '../api';
import { ExperimentMark } from '../design/components/ExperimentMark';
import { ProjectSketch } from '../design/components/ProjectSketch';
import { StatusTag } from '../design/components/StatusTag';
import { TrackIcon } from '../design/components/TrackIcon';
import { projects, type ProjectModule } from '../projects';
import { projectStatus } from '../projects/status';
import { isKnownCard } from './reviewItems';
import { reviewLookup } from './reviewLookup';
import { dueForecast, trackProgress } from './todayStats';
import { ForecastChart, TrackProgressChart } from './TodayCharts';
import './pages.css';

function trackLabel(project: ProjectModule): string {
  return TRACKS.find((t) => t.id === project.meta.track)?.label ?? '';
}

function ContinueCard({ project, state }: { project: ProjectModule; state: StateResponse }) {
  const { meta } = project;
  return (
    <article className="experiment">
      <ExperimentMark id={meta.id} unit={meta.kind === 'unit'} />
      <div className="experiment-body">
        <h3 className="experiment-title">{meta.title}</h3>
        <p className="experiment-meta">
          <span className="track-label">
            <TrackIcon track={meta.track} size={16} /> {trackLabel(project)}
          </span>
          <StatusTag status={projectStatus(meta, state)} />
        </p>
        <p className="experiment-question">{meta.question}</p>
        <Link to={`/projekt/${meta.id}`} className="experiment-link">
          Weiter lesen<span className="visually-hidden">: {meta.title}</span>
        </Link>
      </div>
      <ProjectSketch Sketch={project.Sketch} track={meta.track} />
    </article>
  );
}

export function Today() {
  const state = useAppState();
  const upcoming = useUpcomingCards();

  if (!state.data) {
    if (state.isPending) return <p className="muted">Lädt …</p>;
    return (
      <p className="field-error" role="alert">
        Der Lernstand konnte nicht geladen werden ({state.error?.message}).
      </p>
    );
  }

  const data = state.data;
  const lastOpened = new Map(data.progress.map((p) => [p.projectId, p.lastOpenedAt]));
  const recent = projects
    .filter((p) => lastOpened.has(p.meta.id))
    .sort((a, b) => (lastOpened.get(b.meta.id) ?? '').localeCompare(lastOpened.get(a.meta.id) ?? ''))
    .slice(0, 3);
  const [latest, ...earlier] = recent;

  return (
    <div className="overview today">
      <h1>Heute</h1>

      <section className="panel today-continue" aria-labelledby="h-continue">
        <h2 id="h-continue">Weitermachen</h2>
        {latest === undefined ? (
          <p className="muted">
            Noch nichts begonnen. <Link to="/pfad">Zum Lernpfad</Link>
          </p>
        ) : (
          <>
            <ContinueCard project={latest} state={data} />
            {earlier.length > 0 ? (
              <ul className="plain-list earlier">
                {earlier.map((p) => (
                  <li key={p.meta.id}>
                    <Link to={`/projekt/${p.meta.id}`} className="row-link">
                      <ExperimentMark id={p.meta.id} unit={p.meta.kind === 'unit'} small />
                      <span className="row-link-title">{p.meta.title}</span>
                      <StatusTag status={projectStatus(p.meta, data)} />
                    </Link>
                  </li>
                ))}
              </ul>
            ) : null}
          </>
        )}
      </section>

      <section className="panel today-progress" aria-labelledby="h-progress">
        <h2 id="h-progress">Fortschritt je Track</h2>
        <TrackProgressChart rows={trackProgress(projects.map((p) => p.meta), data)} />
      </section>

      <section className="panel today-forecast" aria-labelledby="h-forecast">
        <h2 id="h-forecast">Fällige Karten</h2>
        {upcoming.data ? (
          <ForecastChart days={dueForecast(upcoming.data, (i) => isKnownCard(i, reviewLookup), new Date())} />
        ) : upcoming.isPending ? (
          <p className="muted">Lädt …</p>
        ) : (
          <p className="field-error" role="alert">
            Die fälligen Karten konnten nicht geladen werden ({upcoming.error?.message}).
          </p>
        )}
      </section>
    </div>
  );
}
