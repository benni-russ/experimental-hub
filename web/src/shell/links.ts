import { isIconName, type IconName } from '../design/components/Icon';

// Weitere Links in der Seitenleiste, etwa zu anderen Apps auf demselben Server.
// Sie stehen nicht im Code, sondern kommen beim Bauen aus VITE_LINKS
// (tools/ziel.env, Schlüssel LINKS). Ohne Angabe gibt es den Abschnitt nicht.

export interface ExtraLink {
  href: string;
  label: string;
  icon: IconName;
}

/**
 * Liest `Name|/pfad/|icon; Name|/pfad/` in Links. Das Icon ist optional;
 * ein unbekanntes wird zum Extern-Zeichen. Einträge ohne Name oder Ziel fallen weg.
 */
export function parseLinks(raw: string | undefined): ExtraLink[] {
  if (!raw) return [];
  return raw
    .split(';')
    .map((entry) => entry.split('|').map((part) => part.trim()))
    .filter(([label, href]) => Boolean(label) && Boolean(href))
    .map(([label, href, icon]) => ({
      label: label!,
      href: href!,
      icon: icon && isIconName(icon) ? icon : 'external',
    }));
}
