import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import type {
  AllNotesResponse,
  ApiErrorBody,
  ApiErrorCode,
  NotesBody,
  NotesResponse,
  OpenProjectBody,
  OwnCard,
  OwnCardBody,
  QuizAttempt,
  QuizAttemptBody,
  ReflectionBody,
  ReviewItem,
  ReviewResponse,
  StateResponse,
  UpcomingItem,
} from '@hub/shared';

/** Fehler der API; `code` stammt aus dem Fehlerkörper des Servers. */
export class ApiError extends Error {
  readonly code: ApiErrorCode | 'NETWORK';
  readonly status: number;

  constructor(code: ApiErrorCode | 'NETWORK', message: string, status: number) {
    super(message);
    this.name = 'ApiError';
    this.code = code;
    this.status = status;
  }
}

const API_PREFIX = `${import.meta.env.BASE_URL}api`;

export async function apiFetch<T>(path: string, init?: RequestInit): Promise<T> {
  const headers = new Headers(init?.headers);
  if (init?.body !== undefined && !headers.has('Content-Type')) {
    headers.set('Content-Type', 'application/json');
  }
  let response: Response;
  try {
    response = await fetch(`${API_PREFIX}${path}`, { ...init, headers });
  } catch {
    throw new ApiError('NETWORK', 'Der Server ist nicht erreichbar.', 0);
  }
  if (!response.ok) {
    let body: Partial<ApiErrorBody> | undefined;
    try {
      body = (await response.json()) as Partial<ApiErrorBody>;
    } catch {
      body = undefined;
    }
    throw new ApiError(
      body?.error?.code ?? 'INTERNAL',
      body?.error?.message ?? `Fehler ${response.status}`,
      response.status,
    );
  }
  // 204 und andere leere Antworten haben keinen Körper.
  if (response.status === 204) return undefined as T;
  const text = await response.text();
  if (!text) return undefined as T;
  try {
    return JSON.parse(text) as T;
  } catch {
    throw new ApiError('INTERNAL', 'Ungültige Serverantwort', response.status);
  }
}

const json = (method: string, body: unknown): RequestInit => ({
  method,
  body: JSON.stringify(body),
});

// keepalive überlebt das Verlassen der Seite, erlaubt aber nur 64 KB pro
// Anfrage; größere Notizen gehen als normale Anfrage.
const KEEPALIVE_LIMIT = 60_000;
const jsonKeepalive = (method: string, body: unknown): RequestInit => {
  const init = json(method, body);
  const bytes = new TextEncoder().encode(init.body as string).length;
  return bytes <= KEEPALIVE_LIMIT ? { ...init, keepalive: true } : init;
};

const enc = encodeURIComponent;

export const queryKeys = {
  state: ['state'] as const,
  notes: (projectId: string) => ['notes', projectId] as const,
  allNotes: ['notes', 'all'] as const,
  quizAttempts: (projectId: string) => ['quiz-attempts', projectId] as const,
  /** Präfix: trifft die Karten eines Projekts und die Liste aller eigenen Karten. */
  ownCardsAny: ['own-cards'] as const,
  ownCards: (projectId: string) => ['own-cards', projectId] as const,
  allOwnCards: ['own-cards', 'all'] as const,
  /** Präfix: trifft die fälligen Karten und die Vorschau. */
  reviewAny: ['review'] as const,
  due: ['review', 'due'] as const,
  upcoming: ['review', 'upcoming'] as const,
};

/** Reine Cache-Aktualisierungen (getestet), siehe useSaveNotes/useSaveReflection. */
export function withNotes(
  data: AllNotesResponse,
  projectId: string,
  body: NotesBody,
  updatedAt: string,
): AllNotesResponse {
  const rest = data.notes.filter((n) => n.projectId !== projectId);
  return { ...data, notes: [...rest, { projectId, ...body, updatedAt }] };
}

export function withReflection(
  data: AllNotesResponse,
  vars: ReflectionBody & { questionId: string },
  updatedAt: string,
): AllNotesResponse {
  const rest = data.reflections.filter((r) => r.questionId !== vars.questionId);
  // Leere Antwort löscht sie auf dem Server.
  if (vars.answer.trim() === '') return { ...data, reflections: rest };
  return {
    ...data,
    reflections: [
      ...rest,
      { projectId: vars.projectId, questionId: vars.questionId, answer: vars.answer, updatedAt },
    ],
  };
}

export function useAppState() {
  return useQuery({
    queryKey: queryKeys.state,
    queryFn: () => apiFetch<StateResponse>('/state'),
  });
}

export function useOpenProject() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ projectId, cardIds }: { projectId: string } & OpenProjectBody) =>
      apiFetch<void>(`/projects/${enc(projectId)}/open`, json('POST', { cardIds })),
    onSuccess: () => {
      void qc.invalidateQueries({ queryKey: queryKeys.state });
      void qc.invalidateQueries({ queryKey: queryKeys.reviewAny });
    },
  });
}

export function useNotes(projectId: string) {
  return useQuery({
    queryKey: queryKeys.notes(projectId),
    queryFn: () => apiFetch<NotesResponse>(`/projects/${enc(projectId)}/notes`),
  });
}

export function useSaveNotes(projectId: string) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (body: NotesBody) =>
      apiFetch<void>(`/projects/${enc(projectId)}/notes`, jsonKeepalive('PUT', body)),
    // Sofort in den Cache, damit ein späteres Öffnen den letzten Stand als
    // Startwert sieht, auch wenn die Seite beim Speichern schon verlassen wurde.
    onMutate: (body) => {
      const at = new Date().toISOString();
      qc.setQueryData<NotesResponse>(queryKeys.notes(projectId), (old) => ({
        ...body,
        updatedAt: old?.updatedAt ?? at,
      }));
      qc.setQueryData<AllNotesResponse>(queryKeys.allNotes, (old) =>
        old ? withNotes(old, projectId, body, at) : old,
      );
    },
    onSuccess: () => {
      void qc.invalidateQueries({ queryKey: queryKeys.state });
      void qc.invalidateQueries({ queryKey: queryKeys.notes(projectId) });
      void qc.invalidateQueries({ queryKey: queryKeys.allNotes });
    },
  });
}

export function useAllNotes() {
  return useQuery({
    queryKey: queryKeys.allNotes,
    queryFn: () => apiFetch<AllNotesResponse>('/notes'),
  });
}

export function useSaveReflection() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ questionId, ...body }: ReflectionBody & { questionId: string }) =>
      apiFetch<void>(`/reflections/${enc(questionId)}`, jsonKeepalive('PUT', body)),
    onMutate: (vars) => {
      qc.setQueryData<AllNotesResponse>(queryKeys.allNotes, (old) =>
        old ? withReflection(old, vars, new Date().toISOString()) : old,
      );
    },
    onSuccess: () => {
      void qc.invalidateQueries({ queryKey: queryKeys.state });
      void qc.invalidateQueries({ queryKey: queryKeys.allNotes });
    },
  });
}

export function useQuizAttempts(projectId: string) {
  return useQuery({
    queryKey: queryKeys.quizAttempts(projectId),
    queryFn: () => apiFetch<QuizAttempt[]>(`/quiz-attempts?projectId=${enc(projectId)}`),
  });
}

export function useSaveQuizAttempt() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (body: QuizAttemptBody) =>
      apiFetch<void>('/quiz-attempts', json('POST', body)),
    onSuccess: (_data, body) => {
      void qc.invalidateQueries({ queryKey: queryKeys.state });
      void qc.invalidateQueries({ queryKey: queryKeys.quizAttempts(body.projectId) });
    },
  });
}

export function useOwnCards(projectId: string) {
  return useQuery({
    queryKey: queryKeys.ownCards(projectId),
    queryFn: () => apiFetch<OwnCard[]>(`/own-cards?projectId=${enc(projectId)}`),
  });
}

/** Alle eigenen Karten, für die Suche. */
export function useAllOwnCards() {
  return useQuery({
    queryKey: queryKeys.allOwnCards,
    queryFn: () => apiFetch<OwnCard[]>('/own-cards'),
  });
}

export function useCreateOwnCard() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (body: OwnCardBody) => apiFetch<OwnCard>('/own-cards', json('POST', body)),
    onSuccess: () => {
      void qc.invalidateQueries({ queryKey: queryKeys.state });
      void qc.invalidateQueries({ queryKey: queryKeys.ownCardsAny });
      void qc.invalidateQueries({ queryKey: queryKeys.reviewAny });
    },
  });
}

export function useDeleteOwnCard() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ id }: { id: string; projectId: string }) =>
      apiFetch<void>(`/own-cards/${enc(id)}`, { method: 'DELETE' }),
    onSuccess: () => {
      void qc.invalidateQueries({ queryKey: queryKeys.state });
      void qc.invalidateQueries({ queryKey: queryKeys.ownCardsAny });
      void qc.invalidateQueries({ queryKey: queryKeys.reviewAny });
    },
  });
}

export function useDueCards() {
  return useQuery({
    queryKey: queryKeys.due,
    queryFn: () => apiFetch<ReviewItem[]>('/review/due'),
    // Die Lernrunde friert die Liste ein; ein veralteter Cache-Stand (z. B. vor
    // dem Öffnen eines Projekts) darf dafür nicht reichen.
    refetchOnMount: 'always',
  });
}

export function useUpcomingCards() {
  return useQuery({
    queryKey: queryKeys.upcoming,
    queryFn: () => apiFetch<UpcomingItem[]>('/review/upcoming'),
  });
}

export function useReviewCard() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ cardId, known }: { cardId: string; known: boolean }) =>
      apiFetch<ReviewResponse>(`/review/${enc(cardId)}`, json('POST', { known })),
    onSuccess: () => {
      void qc.invalidateQueries({ queryKey: queryKeys.state });
      void qc.invalidateQueries({ queryKey: queryKeys.reviewAny });
    },
  });
}
