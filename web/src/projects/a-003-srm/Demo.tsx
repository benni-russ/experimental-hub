import { useState } from 'react';
import { Switch } from '../../design/components/Switch';
import { SectionActions } from '../../learning/SectionActions';
import { CausesTab } from './CausesTab';
import { OwnNumbersTab } from './OwnNumbersTab';
import './srm.css';

export default function Demo() {
  const [own, setOwn] = useState(false);
  return (
    <div className="srm-demo">
      <SectionActions>
        <Switch label="Eigene Zahlen prüfen" checked={own} onChange={setOwn} />
      </SectionActions>
      {/* Beide bleiben gemountet, damit Eingaben beim Wechsel erhalten bleiben. */}
      <div hidden={own}>
        <CausesTab />
      </div>
      <div hidden={!own}>
        <OwnNumbersTab />
      </div>
    </div>
  );
}
