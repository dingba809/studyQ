"use client";

import type {
  Flashcard,
  Framework,
  GenerateResponse,
  KeyPoint,
  Note,
} from "./types";

const NS = "studyq:v1:";

function read<T>(key: string, fallback: T): T {
  if (typeof window === "undefined") return fallback;
  try {
    const raw = localStorage.getItem(NS + key);
    if (!raw) return fallback;
    return JSON.parse(raw) as T;
  } catch {
    return fallback;
  }
}

function write<T>(key: string, value: T): void {
  if (typeof window === "undefined") return;
  localStorage.setItem(NS + key, JSON.stringify(value));
}

export function loadNotes(): Note[] {
  return read<Note[]>("notes", []);
}

export function saveNotes(notes: Note[]): void {
  write("notes", notes);
}

export function upsertNote(note: Note): Note[] {
  const notes = loadNotes().filter((n) => n.id !== note.id);
  notes.unshift(note);
  saveNotes(notes);
  return notes;
}

export function loadActiveNoteId(): string | null {
  return read<string | null>("activeNoteId", null);
}

export function saveActiveNoteId(id: string | null): void {
  write("activeNoteId", id);
}

export function loadKeyPoints(noteId: string): KeyPoint[] {
  return read<KeyPoint[]>(`keypoints:${noteId}`, []);
}

export function saveKeyPoints(noteId: string, points: KeyPoint[]): void {
  write(`keypoints:${noteId}`, points);
}

export function loadFramework(noteId: string): Framework | null {
  return read<Framework | null>(`framework:${noteId}`, null);
}

export function saveFramework(framework: Framework): void {
  write(`framework:${framework.noteId}`, framework);
}

export function loadFlashcards(noteId: string): Flashcard[] {
  return read<Flashcard[]>(`flashcards:${noteId}`, []);
}

export function saveFlashcards(noteId: string, cards: Flashcard[]): void {
  write(`flashcards:${noteId}`, cards);
}

export function persistGenerateResponse(
  noteId: string,
  response: GenerateResponse,
): void {
  saveKeyPoints(noteId, response.keyPoints);
  saveFramework(response.framework);
  saveFlashcards(noteId, response.flashcards);
  write(`lastProvider:${noteId}`, {
    provider: response.provider,
    fallback: response.fallback ?? false,
  });
}

export function loadLastProvider(
  noteId: string,
): { provider: "mock" | "openai"; fallback: boolean } | null {
  return read(`lastProvider:${noteId}`, null);
}

export function clearAllStudyQ(): void {
  if (typeof window === "undefined") return;
  const keys: string[] = [];
  for (let i = 0; i < localStorage.length; i++) {
    const k = localStorage.key(i);
    if (k?.startsWith(NS)) keys.push(k);
  }
  keys.forEach((k) => localStorage.removeItem(k));
}
