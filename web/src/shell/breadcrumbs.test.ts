import { describe, expect, it } from 'vitest';
import type { ContentMeta } from '@hub/shared';
import { breadcrumbFor } from './breadcrumbs';

// Nur Id und Titel zählen; der Rest ist Beiwerk für den Typ.
const m = (id: string, title: string) => ({ id, title }) as ContentMeta;

describe('breadcrumbFor', () => {
  it('Projekt', () =>
    expect(breadcrumbFor({ kind: 'project', meta: m('006', 'Konfidenzintervall') })).toEqual([
      { label: 'Heute', to: '/' },
      { label: 'Lernpfad', to: '/pfad' },
      { label: '006 Konfidenzintervall' },
    ]));
  it('Mini-Einheit mit Eltern', () =>
    expect(
      breadcrumbFor({ kind: 'project', meta: m('002', 'Zufall & Varianz'), parent: m('006', 'Konfidenzintervall') }),
    ).toEqual([
      { label: 'Heute', to: '/' },
      { label: 'Lernpfad', to: '/pfad' },
      { label: '006 Konfidenzintervall', to: '/projekt/006' },
      { label: '002 Zufall & Varianz' },
    ]));
  it('Lernpfad selbst', () =>
    expect(breadcrumbFor({ kind: 'page', label: 'Lernpfad' })).toEqual([
      { label: 'Heute', to: '/' },
      { label: 'Lernpfad' },
    ]));
});
