import { SearchGame } from './SearchGame';
import './accessibility.css';

// Eine Seite, vier Blickwinkel, Suchspiel und automatischer Prüfer. Jeder Besuch startet aus dem
// festen Stand der Beispielseite; nichts wird gespeichert.
export default function Demo() {
  return (
    <div className="a11y-demo">
      <SearchGame />
    </div>
  );
}
