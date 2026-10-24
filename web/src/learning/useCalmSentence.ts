import { useEffect, useState } from 'react';

/** Eine ruhige Ansage für Screenreader: erst wenn sich der Satz ~500 ms nicht mehr ändert. */
export function useCalmSentence(sentence: string): string {
  const [announced, setAnnounced] = useState(sentence);
  useEffect(() => {
    const timer = setTimeout(() => setAnnounced(sentence), 500);
    return () => clearTimeout(timer);
  }, [sentence]);
  return announced;
}
