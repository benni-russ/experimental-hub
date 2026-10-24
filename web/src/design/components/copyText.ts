// Schreibt Text in die Zwischenablage. Meldet, ob es geklappt hat; wirft nie.
export async function copyText(text: string, clipboard: Pick<Clipboard, 'writeText'> | undefined): Promise<boolean> {
  if (!clipboard) return false;
  try {
    await clipboard.writeText(text);
    return true;
  } catch {
    return false;
  }
}
