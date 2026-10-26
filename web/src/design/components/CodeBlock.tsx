import { useEffect, useRef, useState } from 'react';
import { Button } from './Button';
import { copyText } from './copyText';
import { Icon, type IconName } from './Icon';

type CopyState = 'idle' | 'copied' | 'failed';

const TEXT: Record<CopyState, string> = {
  idle: 'Kopieren',
  copied: 'Kopiert',
  failed: 'Nicht kopiert',
};

const ICON: Record<CopyState, IconName> = {
  idle: 'copy',
  copied: 'check',
  failed: 'cross',
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
      {/* Nur das Symbol, wie im Editor; der Zustand steht im Tooltip und wird über die Live-Region angesagt */}
      <Button
        variant="quiet"
        className="code-block-copy"
        aria-label={label ? `${label} kopieren` : 'Kopieren'}
        title={TEXT[state]}
        onClick={copy}
      >
        <Icon name={ICON[state]} />
      </Button>
      <span className="visually-hidden" aria-live="polite">
        {MESSAGE[state]}
      </span>
    </div>
  );
}
