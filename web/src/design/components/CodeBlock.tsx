import { useEffect, useRef, useState } from 'react';
import { Button } from './Button';
import { copyText } from './copyText';
import { Icon } from './Icon';

type CopyState = 'idle' | 'copied' | 'failed';

const TEXT: Record<CopyState, string> = {
  idle: 'Kopieren',
  copied: 'Kopiert',
  failed: 'Nicht kopiert',
};

const MESSAGE: Record<CopyState, string> = {
  idle: '',
  copied: 'In die Zwischenablage kopiert',
  failed: 'Kopieren nicht möglich',
};

export function CodeBlock({ code, label }: { code: string; label?: string }) {
  const [state, setState] = useState<CopyState>('idle');
  const timer = useRef<ReturnType<typeof setTimeout> | undefined>(undefined);

  const mounted = useRef(true);

  useEffect(() => {
    mounted.current = true;
    return () => {
      mounted.current = false;
      clearTimeout(timer.current);
    };
  }, []);

  async function copy() {
    const ok = await copyText(code, navigator.clipboard);
    if (!mounted.current) return;
    setState(ok ? 'copied' : 'failed');
    clearTimeout(timer.current);
    timer.current = setTimeout(() => setState('idle'), 2000);
  }

  return (
    <div className="code-block">
      <pre>
        <code>{code}</code>
      </pre>
      <Button
        variant="quiet"
        className="code-block-copy"
        aria-label={label ? `${label} kopieren` : undefined}
        onClick={copy}
      >
        {state === 'idle' ? <Icon name="copy" /> : null}
        {state === 'copied' ? <Icon name="check" /> : null}
        {TEXT[state]}
      </Button>
      <span className="visually-hidden" aria-live="polite">
        {MESSAGE[state]}
      </span>
    </div>
  );
}
