import { CodeBlock } from '../../design/components/CodeBlock';
import { FIELD_VISITS, REFERENCE, THRESHOLDS, clsFromShifts, fieldResults, percentile75, simulateLoad } from '../../experience/vitals';
import { formatMetric, formatNumber, shiftsOf } from './insights';
import './webVitals.css';

const OBSERVER = `// Größtes gezeichnetes Element (LCP)
new PerformanceObserver((list) => {
  const last = list.getEntries().at(-1);
  console.log('LCP', last.startTime);
}).observe({ type: 'largest-contentful-paint', buffered: true });

// Layout-Verschiebungen (CLS), ohne die direkt nach einer Eingabe
new PerformanceObserver((list) => {
  for (const e of list.getEntries()) if (!e.hadRecentInput) console.log('Verschiebung', e.value);
}).observe({ type: 'layout-shift', buffered: true });

// Eingaben mit ihrer ganzen Dauer bis zum nächsten Bild (Grundlage für INP)
new PerformanceObserver((list) => {
  for (const e of list.getEntries()) console.log(e.name, e.duration);
}).observe({ type: 'event', durationThreshold: 40, buffered: true });`;

// Das Banner des Beispiels: Es betrifft die Hälfte der Fläche und schiebt um 24 % der Höhe.
const BANNER_EXAMPLE = { area: 0.5, distance: 0.24 };
const bannerValue = Math.round(BANNER_EXAMPLE.area * BANNER_EXAMPLE.distance * 1000) / 1000;

const start = simulateLoad({}, REFERENCE);
const shifts = shiftsOf(start);
const font = shifts.find((s) => s.source === 'font')!;
const banner = shifts.find((s) => s.source === 'banner')!;
const image = shifts.find((s) => s.source === 'image')!;
const fieldLcp = percentile75(fieldResults({}).map((v) => v.lcp));

export default function UnderTheHood() {
  return (
    <div className="wv-hood">
      <h3>Wie der Browser misst</h3>
      <p>
        Der Browser meldet seine Messungen über den PerformanceObserver. Für jede der drei Kennzahlen gibt es eine eigene Eintragsart: das größte gezeichnete Element,
        die Layout-Verschiebungen und die Ereignisse mit ihrer Dauer. Welche Eintragsarten ein Browser kennt, ist unterschiedlich; frag im Zweifel ab, was er unterstützt,
        statt dich auf eine Liste zu verlassen.
      </p>
      <CodeBlock code={OBSERVER} label="Beobachter für LCP, CLS und INP" />

      <h3>Die CLS-Formel</h3>
      <p>
        Jede Verschiebung bekommt einen Wert: Anteil der Fläche, die sich bewegt, mal Anteil des Wegs, gemessen an der Höhe des sichtbaren Bereichs. Das Banner im
        Beispiel schiebt Inhalt, der die Hälfte der Fläche ausmacht, um 24 % der Höhe nach unten: {formatNumber(BANNER_EXAMPLE.area)} × {formatNumber(BANNER_EXAMPLE.distance)} ={' '}
        {formatNumber(bannerValue)}.
      </p>
      <p>
        Die Verschiebungen werden in Sitzungsfenster gesammelt: Liegen zwei weniger als 1 s auseinander, landen sie im selben Fenster, und ein Fenster dauert höchstens
        5 s. Der CLS ist die Summe des größten Fensters. Im Start liegen Schrift ({formatNumber(font.value)}) und Banner ({formatNumber(banner.value)}) nah beieinander,
        das Bild ({formatNumber(image.value)}) kommt erst bei {formatMetric('lcp', image.time)}. Deshalb ist der CLS {formatMetric('cls', clsFromShifts(shifts))} und
        nicht die Summe aller drei.
      </p>

      <h3>INP misst die ganze Reaktion</h3>
      <p>
        2024 hat INP den FID abgelöst. FID hat nur gemessen, wie lange eine Eingabe warten musste, bis der Browser sie überhaupt bearbeiten konnte. INP misst die ganze
        Reaktion: Wartezeit, die eigene Verarbeitung und den Weg bis zum nächsten Bild. Als Wert zählt eine der langsamsten Reaktionen des Besuchs, nicht der
        Durchschnitt. Gut ist bis {formatMetric('inp', THRESHOLDS.inp.good)}, schlecht über {formatMetric('inp', THRESHOLDS.inp.poor)}.
      </p>

      <h3>Labor und Feld</h3>
      <p>
        Labordaten entstehen auf einem festen Gerät mit fester Leitung, hier das Profil {REFERENCE.label}: wiederholbar und gut zum Vergleichen von Gegenmitteln. Felddaten
        kommen von echten Besuchen; bewertet wird dort das 75. Perzentil. Im Start hat das Labor einen LCP von {formatMetric('lcp', start.lcp)}, das Feld mit{' '}
        {FIELD_VISITS.length} Besuchen {formatMetric('lcp', fieldLcp)}. Ein schneller Rechner im Büro sagt wenig darüber, wie die Seite auf einem alten Handy unterwegs
        lädt. Und im Labor gibt es keine echten Klicks: INP lässt sich dort nur annähern.
      </p>
      <p>
        Google nutzt die Kennzahlen nach eigenen Angaben als eines von vielen Signalen für die Suche. Wie stark sie dort zählen, lässt sich von außen nicht sagen.
      </p>

      <h3>Wo die Kennzahlen aufhören</h3>
      <p>
        Gute Werte heißen nicht, dass Menschen die Seite gut bedienen können: Ein schnell gezeichneter Knopf ohne Namen bleibt für ein Vorleseprogramm stumm (siehe
        D-001). Und gute Werte heißen nicht, dass jemand kauft. Wo Menschen auf dem Weg zum Kauf aussteigen, zeigt erst der Funnel (D-003).
      </p>
    </div>
  );
}
