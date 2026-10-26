export interface InlineSegment {
  text: string;
  code: boolean;
}

/** Zerlegt Text an `…`-Paaren; ein einzelner oder leerer Backtick bleibt wörtlich. */
export function splitInlineCode(input: string): InlineSegment[] {
  const out: InlineSegment[] = [];
  const push = (text: string, code: boolean) => {
    if (text === '') return;
    const last = out[out.length - 1];
    if (last && last.code === code) last.text += text;
    else out.push({ text, code });
  };
  let rest = input;
  while (rest !== '') {
    const open = rest.indexOf('`');
    const close = open === -1 ? -1 : rest.indexOf('`', open + 1);
    if (open === -1 || close === -1) {
      push(rest, false);
      break;
    }
    push(rest.slice(0, open), false);
    if (close === open + 1) push('``', false);
    else push(rest.slice(open + 1, close), true);
    rest = rest.slice(close + 1);
  }
  return out;
}

export function InlineCode({ text }: { text: string }) {
  return (
    <>
      {splitInlineCode(text).map((s, i) => (s.code ? <code key={i}>{s.text}</code> : s.text))}
    </>
  );
}
