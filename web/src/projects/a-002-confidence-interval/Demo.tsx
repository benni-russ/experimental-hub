import { useState } from 'react';
import { Switch } from '../../design/components/Switch';
import { SectionActions } from '../../learning/SectionActions';
import { OwnTestTab } from './OwnTestTab';
import { RepeatTab } from './RepeatTab';
import './ci.css';

export default function Demo() {
  const [own, setOwn] = useState(false);
  return (
    <div className="ci-demo">
      <SectionActions>
        <Switch label="Eigene Zahlen prüfen" checked={own} onChange={setOwn} />
      </SectionActions>
      {/* Beide bleiben gemountet, damit Eingaben beim Wechsel erhalten bleiben. */}
      <div hidden={own}>
        <RepeatTab />
      </div>
      <div hidden={!own}>
        <OwnTestTab />
      </div>
    </div>
  );
}
