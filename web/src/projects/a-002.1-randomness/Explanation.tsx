import { Link } from 'react-router';
import { formatNumber } from '../../learning/numbers';
import { RatesChart } from './RatesChart';
import { standardError } from './standardError';
import './randomness.css';

export default function Explanation() {
  const at1000 = standardError(0.1, 1000);
  const at4000 = standardError(0.1, 4000);

  return (
    <div className="rnd-explain">
      <p>
        Jede Person kauft oder kauft nicht, und das ist bis zu einem gewissen Grad Zufall. Eine gemessene Rate ist deshalb
        nur eine Stichprobe der wahren Rate. Wie weit sie typischerweise danebenliegt, sagt der Standardfehler:{' '}
        <code>√(p · (1 − p) / n)</code>.
      </p>
      <p>
        Bei einer wahren Rate von 10 % liegt er bei 1.000 Besuchern bei {formatNumber(at1000, 2)} Prozentpunkten. Bei 4.000
        Besuchern sind es nur noch {formatNumber(at4000, 2)}, also die Hälfte. Viermal so viele Personen halbieren das
        Rauschen, denn es schrumpft mit der Wurzel von n und nicht mit n selbst. Wer das Rauschen auf ein Zehntel drücken
        will, braucht hundertmal so viele Besucher.
      </p>
      <RatesChart />
      <p>
        Das erklärt den A/A-Test: Beide Gruppen haben dieselbe wahre Rate, die gemessenen Raten schwanken trotzdem um sie
        herum, und der Abstand zwischen ihnen ist selten null. Daraus folgt auch, dass ein einzelner Test „Glück“ haben
        kann: Hin und wieder liegt der Zufall so weit daneben, dass es nach einem Effekt aussieht. Wie das
        Konfidenzintervall mit diesem Rauschen umgeht, zeigt die Demo in{' '}
        <Link to="/projekt/A-002">Versuch A-002</Link>.
      </p>
    </div>
  );
}
