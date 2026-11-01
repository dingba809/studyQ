/** Shared StudyQ types — client, server, and providers. */

export interface Note {
  id: string;
  content: string;
  createdAt: number;
  title?: string;
}

export interface KeyPoint {
  id: string;
  noteId: string;
  text: string;
}

export interface FrameworkNode {
  id: string;
  label: string;
  children?: FrameworkNode[];
  keyPointIds?: string[];
}

export interface Framework {
  noteId: string;
  root: FrameworkNode;
}

export interface Flashcard {
  id: string;
  noteId: string;
  keyPointId: string;
  question: string;
  answer: string;
  ease: number;
  interval: number;
  repetitions: number;
  due: number;
}

export interface GenerateRequest {
  noteId: string;
  content: string;
}

export interface GenerateResponse {
  keyPoints: KeyPoint[];
  framework: Framework;
  flashcards: Flashcard[];
  provider: "mock" | "openai";
  fallback?: boolean;
}

export type Rating = "again" | "hard" | "good" | "easy";

export interface GenerationProvider {
  generateKeyPoints(noteId: string, content: string): Promise<KeyPoint[]>;
  generateFramework(
    noteId: string,
    content: string,
    keyPoints: KeyPoint[],
  ): Promise<Framework>;
  generateFlashcards(
    noteId: string,
    keyPoints: KeyPoint[],
  ): Promise<Flashcard[]>;
}

export type TabId = "notes" | "framework" | "review";
