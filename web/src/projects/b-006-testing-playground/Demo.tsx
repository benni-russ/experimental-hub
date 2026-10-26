import { useEffect, useState } from 'react';
import { Button } from '../../design/components/Button';
import { Switch } from '../../design/components/Switch';
import { Matrix } from './Matrix';
import { killMatrix, PRESET_TESTS, type MatrixRow } from './presetTests';
import './testing.css';

const ALL = PRESET_TESTS.map((t) => t.id);

export default function Demo() {
  const [enabled, setEnabled] = useState<string[]>(ALL);
  // Die Matrix rechnet einmal alle zehn Tests gegen alle fünf Fassungen; die Schalter filtern nur.
  const [matrix, setMatrix] = useState<Record<string, MatrixRow> | null>(null);

  useEffect(() => {
    let alive = true;
    void killMatrix(PRESET_TESTS).then((m) => {
      if (alive) setMatrix(m);
    });
    return () => {
      alive = false;
    };
  }, []);

  const toggle = (id: string, on: boolean) =>
    setEnabled((list) => (on ? ALL.filter((x) => x === id || list.includes(x)) : list.filter((x) => x !== id)));

  return (
    <div className="testing-demo">
      <p className="testing-hint">
        Zehn vorbereitete Tests laufen gegen die richtige <code>validateEvent</code> und gegen vier Fassungen mit je
        einem eingebauten Fehler. Schalte Tests ab und sieh zu, welche Fehler dann niemand mehr bemerkt.
      </p>
      <fieldset className="testing-list">
        <legend>Vorbereitete Tests</legend>
        <div className="testing-toolbar">
          <Button variant="secondary" onClick={() => setEnabled(ALL)}>
            Alle an
          </Button>
          <Button variant="secondary" onClick={() => setEnabled([])}>
            Alle aus
          </Button>
        </div>
        <ul className="testing-switches">
          {PRESET_TESTS.map((t) => (
            <li key={t.id}>
              <Switch label={t.name} checked={enabled.includes(t.id)} onChange={(on) => toggle(t.id, on)} />
            </li>
          ))}
        </ul>
      </fieldset>
      {matrix ? (
        <Matrix matrix={matrix} tests={PRESET_TESTS.filter((t) => enabled.includes(t.id))} />
      ) : (
        <p className="testing-hint">Tests laufen …</p>
      )}
      <p className="testing-hint">
        Ein Test hat eine Fehlervariante erwischt, wenn er an der richtigen Fassung besteht und an der Variante
        scheitert. Zeilen mit „erwischt nichts“ bestehen überall, auch dort, wo etwas kaputt ist.
      </p>
    </div>
  );
}
