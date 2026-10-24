import { Link } from 'react-router';

export function NotFound() {
  return (
    <section>
      <h1>Seite nicht gefunden</h1>
      <p>Diese Adresse gibt es im Hub nicht.</p>
      <p>
        <Link to="/">Zu Heute</Link> · <Link to="/pfad">Zum Lernpfad</Link>
      </p>
    </section>
  );
}
