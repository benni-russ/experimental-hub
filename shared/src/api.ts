// Nur Typen; die zod-Schemas liegen im Server. Zeitstempel sind ISO-Strings.

export type ApiErrorCode = 'INVALID_INPUT' | 'NOT_FOUND' | 'INTERNAL';

export interface ApiErrorBody {
  error: { code: ApiErrorCode; message: string };
}

export interface HealthResponse {
  status: 'ok';
}

export interface ProgressEntry {
  projectId: string;
  startedAt: string;
  lastOpenedAt: string;
}

export interface AnsweredReflection {
  questionId: string;
  projectId: string;
}

export interface StateResponse {
  progress: ProgressEntry[];
  answeredReflections: AnsweredReflection[];
  dueCount: number;
}

export interface OpenProjectBody {
  cardIds: string[];
}

export interface NotesBody {
  note: string;
  postIdea: string;
}

export interface NotesResponse extends NotesBody {
  updatedAt: string | null;
}

export interface ProjectNotes extends NotesBody {
  projectId: string;
  updatedAt: string;
}

export interface ReflectionAnswer {
  projectId: string;
  questionId: string;
  answer: string;
  updatedAt: string;
}

export interface AllNotesResponse {
  notes: ProjectNotes[];
  reflections: ReflectionAnswer[];
}

export interface ReflectionBody {
  projectId: string;
  answer: string;
}

export type QuizPhase = 'before' | 'after';

export interface QuizAttemptBody {
  projectId: string;
  questionId: string;
  phase: QuizPhase;
  answer: string;
  correct: boolean;
}

export interface QuizAttempt extends QuizAttemptBody {
  createdAt: string;
}

export interface OwnCardBody {
  projectId: string;
  front: string;
  back: string;
}

export interface OwnCard extends OwnCardBody {
  id: string;
}

export interface ReviewItem {
  cardId: string;
  projectId: string;
  box: number;
  dueAt: string;
  /** nur bei eigenen Karten */
  front?: string;
  back?: string;
}

/** Vorschau fälliger Karten (Überfälliges und die nächsten sieben Tage). */
export interface UpcomingItem {
  cardId: string;
  projectId: string;
  dueAt: string;
}

export interface ReviewBody {
  known: boolean;
}

export interface ReviewResponse {
  box: number;
  dueAt: string;
}
