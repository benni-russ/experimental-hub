import { CheckFailure, expectEqual, formatValue } from '../../../codeTask/assert';
import type { Check, CheckModule } from '../../../codeTask/types';

type CheckAlt = (images: Image[]) => unknown;
type State = 'missing' | 'decorative' | 'suspicious' | 'ok';

interface Image {
  src: string;
  alt?: string;
}

/** Ruft `checkAlt` auf, vergleicht die Zustände und prüft, dass die Eingabe unverändert bleibt. */
function expectStates(name: string, images: Image[], expected: State[]): Check {
  return {
    name,
    run({ exports }) {
      const fn = exports.checkAlt;
      if (typeof fn !== 'function') {
        throw new CheckFailure(`\`checkAlt\` soll eine Funktion sein, ist aber ${formatValue(fn)}.`);
      }
      const before = structuredClone(images);
      const result = (fn as CheckAlt)(images);
      expectEqual(result, expected, 'Zustände je Bild');
      expectEqual(images, before, 'Eingabe nach dem Aufruf');
    },
  };
}

const img = (alt?: string): Image => (alt === undefined ? { src: 'schuh.jpg' } : { src: 'schuh.jpg', alt });

const module: CheckModule = {
  exportsNeeded: ['checkAlt'],
  checks: [
    expectStates('Eine echte Beschreibung ist `ok`', [img('Laufschuh in Blau, seitlich')], ['ok']),
    expectStates('Fehlt `alt`, ist das Bild `missing`', [img()], ['missing']),
    expectStates('Leerer Text ist `decorative`', [img('')], ['decorative']),
    expectStates('Ein Dateiname ist `suspicious`', [img('IMG_2041.jpg')], ['suspicious']),
    expectStates(
      'Alle Endungen, auch groß geschrieben',
      [img('a.jpeg'), img('b.PNG'), img('c.webp'), img('d.Gif'), img('e.JPG')],
      ['suspicious', 'suspicious', 'suspicious', 'suspicious', 'suspicious'],
    ),
    expectStates('Nur „Bild“, „Foto“ oder „image“ ist `suspicious`', [img('Bild'), img('FOTO'), img('image')], ['suspicious', 'suspicious', 'suspicious']),
    expectStates('„Bild“ als Teil einer Beschreibung ist `ok`', [img('Bild eines Laufschuhs von der Seite')], ['ok']),
    expectStates(
      'Mehrere Bilder in Eingabereihenfolge',
      [img('Logo von Nordlicht Sport'), img(), img('foto.png'), img('')],
      ['ok', 'missing', 'suspicious', 'decorative'],
    ),
    expectStates('Leere Liste ergibt `[]`', [], []),
  ],
};

export default module;
