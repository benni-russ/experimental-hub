import { describe, expect, it } from 'vitest';
import type { ContentMeta } from '@hub/shared';
import { breadcrumbFor } from './breadcrumbs';

// Nur Id und Titel zählen; der Rest ist Beiwerk für den Typ.
const m = (id: string, title: string) => ({ id, title }) as ContentMeta;

describe('breadcrumbFor', () => {
  it('Projekt', () =>
    expect(breadcrumbFor({ kind: 'project', meta: m('A-002', 'Konfidenzintervall') })).toEqual([
      { label: 'Heute', to: '/' },
      { label: 'Lernpfad', to: '/pfad' },
      { label: 'A-002 Konfidenzintervall' },
    ]));
  it('Mini-Einheit mit Eltern', () =>
    expect(
      breadcrumbFor({ kind: 'project', meta: m('A-002.1', 'Zufall & Varianz'), parent: m('A-002', 'Konfidenzintervall') }),
    ).toEqual([
      { label: 'Heute', to: '/' },
      { label: 'Lernpfad', to: '/pfad' },
      { label: 'A-002 Konfidenzintervall', to: '/projekt/A-002' },
      { label: 'A-002.1 Zufall & Varianz' },
    ]));
  it('Lernpfad selbst', () =>
    expect(breadcrumbFor({ kind: 'page', label: 'Lernpfad' })).toEqual([
      { label: 'Heute', to: '/' },
      { label: 'Lernpfad' },
    ]));
});
