// „/“ springt ins Suchfeld. Umschalt bleibt erlaubt: Auf deutschen Tastaturen
// liegt „/“ auf Umschalt+7.
export function isSearchHotkey(e: {
  key: string;
  ctrlKey: boolean;
  metaKey: boolean;
  altKey: boolean;
  /** Fokus steht in einem Eingabefeld */
  typing: boolean;
}): boolean {
  return e.key === '/' && !e.ctrlKey && !e.metaKey && !e.altKey && !e.typing;
}

// Eingabefelder, in denen eine Taste Text erzeugt. Kästchen, Optionen, Knöpfe
// und Schieber gehören nicht dazu: Dort darf „/“ oder die Leertaste wirken.
const NON_TEXT_INPUTS = new Set(['checkbox', 'radio', 'button', 'submit', 'reset', 'range', 'color', 'file', 'image', 'hidden']);

/** Schmal gehalten, damit es ohne DOM testbar ist; ein HTMLElement passt. */
export interface TypingTargetLike {
  tagName: string;
  type?: string;
  isContentEditable?: boolean;
}

export function isTypingTarget(target: unknown): boolean {
  if (typeof target !== 'object' || target === null || !('tagName' in target)) return false;
  const el = target as TypingTargetLike;
  if (el.isContentEditable) return true;
  const tag = String(el.tagName).toUpperCase();
  if (tag === 'TEXTAREA' || tag === 'SELECT') return true;
  if (tag !== 'INPUT') return false;
  return !NON_TEXT_INPUTS.has((el.type ?? 'text').toLowerCase());
}
