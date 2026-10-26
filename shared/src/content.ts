export type TrackId = 'experimentation' | 'web' | 'personalization' | 'experience' | 'ai';

export const TRACKS: { id: TrackId; label: string; symbol: string }[] = [
  { id: 'experimentation', label: 'Experimentation & Data', symbol: '◆' },
  { id: 'web', label: 'Web & APIs', symbol: '■' },
  { id: 'personalization', label: 'Personalization', symbol: '●' },
  { id: 'experience', label: 'Digital Experience', symbol: '▲' },
  { id: 'ai', label: 'AI & Automation', symbol: '★' },
];

export interface Card {
  id: string;
  front: string;
  back: string;
}

export type QuizQuestion =
  | {
      id: string;
      type: 'choice';
      prompt: string;
      options: string[];
      correctIndex: number;
      explanation: string;
    }
  | {
      id: string;
      type: 'estimate';
      prompt: string;
      answer: number;
      /** relativ: richtig, wenn |guess - answer| <= tolerance * answer */
      tolerance: number;
      unit: string;
      explanation: string;
    };

export interface ReflectionPrompt {
  id: string;
  prompt: string;
}

/** Eine Code-Aufgabe: reines JavaScript, läuft im Browser gegen versteckte Tests. */
export interface CodeTaskMeta {
  /** <projekt-id>-code-NN */
  id: string;
  title: string;
  prompt: string;
  /** Startcode im Editor */
  starter: string;
  /** Hinweise, vom leichtesten zum deutlichsten */
  hints: string[];
  /** Musterlösung, wird erst auf Wunsch gezeigt */
  solution: string;
}

export interface ContentMeta {
  id: string;
  slug: string;
  title: string;
  track: TrackId;
  kind: 'project' | 'unit';
  /** die eine Kernfrage, für Lernpfad und Kopf */
  question: string;
  buildsOn: string[];
  leadsTo: string[];
  /** nur bei units */
  attachedTo?: string;
  intro: { text: string; estimateQuestionId?: string };
  quiz: QuizQuestion[];
  reflection: ReflectionPrompt[];
  cards: Card[];
  codeTasks?: CodeTaskMeta[];
}
