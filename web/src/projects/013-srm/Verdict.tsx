import { Icon } from '../../design/components/Icon';
import { formatP, formatThreshold } from './format';
import type { SrmResult } from './srm';

/** Befund als Zeichen und Wort, nie nur Farbe. */
export function Verdict({ result }: { result: SrmResult }) {
  const bad = result.mismatch;
  return (
    <p className={bad ? 'srm-verdict srm-verdict-bad' : 'srm-verdict srm-verdict-ok'}>
      <Icon name={bad ? 'cross' : 'check'} size={22} />
      <strong>{bad ? 'Aufteilung passt nicht' : 'Aufteilung passt'}</strong>
      <span>{formatP(result.pValue)} (Schwelle p &lt; {formatThreshold()})</span>
    </p>
  );
}
