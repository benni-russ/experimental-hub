import type { IconName } from '../design/components/Icon';
import { parseLinks } from './links';

// Wohin die App führt – einmal aufgeschrieben, von Seitenleiste und unterer
// Leiste gemeinsam gelesen.

export interface NavItem {
  to: string;
  label: string;
  icon: IconName;
  /** nur bei „/“: sonst wäre „Heute“ auf jeder Seite aktiv */
  end: boolean;
}

export const HOME: NavItem = { to: '/', label: 'Heute', icon: 'home', end: true };
export const PATH: NavItem = { to: '/pfad', label: 'Lernpfad', icon: 'path', end: false };
export const REVIEW: NavItem = { to: '/lernrunde', label: 'Lernrunde', icon: 'cards', end: false };
export const NOTES: NavItem = { to: '/notizen', label: 'Notizen', icon: 'note', end: false };
export const NAV: NavItem[] = [HOME, PATH, REVIEW, NOTES];

/** Weitere Links außerhalb dieser App, beim Bauen gesetzt (siehe links.ts). */
export const EXTRA_LINKS = parseLinks(import.meta.env.VITE_LINKS as string | undefined);
