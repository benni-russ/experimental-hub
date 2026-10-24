import { useState } from 'react';
import { Slider } from '../../design/components/Slider';
import { Metric } from '../../design/components/Metric';
import { formatNumber } from '../../learning/numbers';

export default function Demo() {
  const [days, setDays] = useState(30);
  return (
    <div>
      <Slider label="Tage (Beispiel)" value={days} min={1} max={365} step={1} onChange={setDays} format={(v) => formatNumber(v)} />
      <Metric label="Stunden" value={formatNumber(days * 24)} hint="Beispielrechnung: Tage mal 24" />
    </div>
  );
}
