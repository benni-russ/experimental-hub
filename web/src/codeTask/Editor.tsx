import { closeBrackets } from '@codemirror/autocomplete';
import { defaultKeymap, history, historyKeymap, indentWithTab } from '@codemirror/commands';
import { javascript } from '@codemirror/lang-javascript';
import { bracketMatching, HighlightStyle, indentOnInput, syntaxHighlighting } from '@codemirror/language';
import { Prec, RangeSetBuilder, StateEffect, StateField } from '@codemirror/state';
import { Decoration, EditorView, keymap, lineNumbers } from '@codemirror/view';
import { tags } from '@lezer/highlight';
import { useEffect, useRef } from 'react';

// Nur Farb-Tokens: Hell und Dunkel folgen der App, der Editor schaltet nichts um.
const theme = EditorView.theme({
  '&': {
    color: 'var(--farbe-text)',
    backgroundColor: 'var(--farbe-flaeche)',
    border: '1px solid var(--farbe-rahmen-stark)',
    borderRadius: 'var(--radius-klein)',
    fontSize: '0.9rem',
  },
  '&.cm-focused': { outline: '2px solid var(--farbe-fokus)', outlineOffset: '2px' },
  '.cm-scroller': { fontFamily: 'var(--schrift-code)', lineHeight: '1.6', overflow: 'auto' },
  '.cm-content': { caretColor: 'var(--farbe-text)', padding: 'var(--abstand-eng) 0' },
  '.cm-cursor': { borderLeftColor: 'var(--farbe-text)' },
  '.cm-gutters': {
    backgroundColor: 'var(--farbe-flaeche-neutral)',
    color: 'var(--farbe-text-gedaempft)',
    border: 'none',
    borderRight: '1px solid var(--farbe-rahmen)',
  },
  '.cm-activeLine': { backgroundColor: 'var(--farbe-hover-neutral)' },
  '.cm-activeLineGutter': { backgroundColor: 'var(--farbe-aktiv-neutral)' },
  '&.cm-focused .cm-selectionBackground, .cm-selectionBackground, ::selection': {
    backgroundColor: 'var(--farbe-akzent-weich)',
  },
  '.cm-matchingBracket': { backgroundColor: 'var(--farbe-akzent-weich)', outline: '1px solid var(--farbe-akzent)' },
  '.cm-error-line': { backgroundColor: 'var(--farbe-fehler-weich)' },
});

const highlight = HighlightStyle.define([
  { tag: [tags.keyword, tags.controlKeyword, tags.definitionKeyword], color: 'var(--farbe-akzent)', fontWeight: '600' },
  { tag: [tags.string, tags.regexp], color: 'var(--farbe-erfolg)' },
  { tag: [tags.number, tags.bool, tags.null], color: 'var(--farbe-info)' },
  { tag: tags.comment, color: 'var(--farbe-text-gedaempft)', fontStyle: 'italic' },
  { tag: [tags.function(tags.variableName), tags.function(tags.propertyName)], color: 'var(--farbe-sekundaer-tief)' },
]);

// Fehlerzeile von außen setzen (1-basiert, null = keine).
const setErrorLine = StateEffect.define<number | null>();
const errorLineField = StateField.define({
  create: () => Decoration.none,
  update(deco, tr) {
    let next = deco.map(tr.changes);
    for (const effect of tr.effects) {
      if (!effect.is(setErrorLine)) continue;
      const builder = new RangeSetBuilder<Decoration>();
      const line = effect.value;
      if (line !== null && line >= 1 && line <= tr.state.doc.lines) {
        builder.add(
          tr.state.doc.line(line).from,
          tr.state.doc.line(line).from,
          Decoration.line({ class: 'cm-error-line' }),
        );
      }
      next = builder.finish();
    }
    return next;
  },
  provide: (field) => EditorView.decorations.from(field),
});

export function Editor({
  value,
  onChange,
  onRun,
  label,
  errorLine = null,
}: {
  value: string;
  onChange(v: string): void;
  onRun(): void;
  label: string;
  errorLine?: number | null;
}) {
  const host = useRef<HTMLDivElement>(null);
  const view = useRef<EditorView | null>(null);
  // Aktuelle Callbacks, ohne den Editor bei jedem Rendern neu zu bauen.
  const handlers = useRef({ onChange, onRun });
  handlers.current = { onChange, onRun };

  useEffect(() => {
    const instance = new EditorView({
      parent: host.current!,
      doc: value,
      extensions: [
        lineNumbers(),
        history(),
        indentOnInput(),
        bracketMatching(),
        closeBrackets(),
        javascript(),
        syntaxHighlighting(highlight),
        theme,
        errorLineField,
        EditorView.contentAttributes.of({ 'aria-label': label }),
        Prec.highest(
          keymap.of([
            {
              key: 'Mod-Enter',
              run: () => {
                handlers.current.onRun();
                return true;
              },
            },
          ]),
        ),
        keymap.of([...defaultKeymap, ...historyKeymap, indentWithTab]),
        EditorView.updateListener.of((update) => {
          if (update.docChanged) handlers.current.onChange(update.state.doc.toString());
        }),
      ],
    });
    view.current = instance;
    return () => {
      instance.destroy();
      view.current = null;
    };
    // Der Editor entsteht einmal; Wert und Fehlerzeile werden unten nachgeführt.
  }, []);

  // Von außen geänderter Wert (Zurücksetzen): ins Dokument übernehmen.
  useEffect(() => {
    const v = view.current;
    if (v && v.state.doc.toString() !== value) {
      v.dispatch({ changes: { from: 0, to: v.state.doc.length, insert: value } });
    }
  }, [value]);

  useEffect(() => {
    view.current?.dispatch({ effects: setErrorLine.of(errorLine) });
  }, [errorLine]);

  return <div ref={host} className="code-editor" />;
}
