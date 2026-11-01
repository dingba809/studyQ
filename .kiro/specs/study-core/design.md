# StudyQ MVP — Design

## 1. Overview

This document describes the architecture for the StudyQ MVP: a note-driven study companion that converts raw notes into key points, a knowledge framework tree, and spaced-repetition flashcards. The design satisfies the EARS-style requirements in `requirements.md` and stays within the hackathon scope defined in the product steering.

## 2. Goals & Non-Goals

**Goals**
- End-to-end note-to-cards flow that runs on a single developer machine.
- Graceful degradation: full functionality with the mock LLM, no key required.
- Pluggable LLM layer so a new provider can be added without touching intake, review, or UI.
- Persistence across reloads with localStorage (no backend database).

**Non-Goals (MVP)**
- Multi-user accounts or authentication.
- Server-side storage or sync.
- Rich drag-and-drop concept-map canvas (a collapsible tree outline suffices).
- Import formats beyond `.txt` and `.md`.

## 3. High-Level Architecture

```
┌─────────────────────────────────────────────────────────────┐
│  Browser (Client)                                           │
│                                                             │
│  ┌───────────────┐  ┌──────────────┐  ┌──────────────────┐  │
│  │  NotesTab     │  │ FrameworkTab │  │  ReviewTab        │  │
│  │  (intake UI)  │  │ (concept tree)│  │ (flashcard review)│  │
│  └──────┬────────┘  └──────┬───────┘  └─────────┬────────┘  │
│         │                  │                     │           │
│         └──────────┬───────┴─────────────────────┘           │
│                    │                                        │
│         ┌──────────▼─────────┐    ┌──────────────────────┐   │
│         │  storage.ts         │    │  srs.ts              │   │
│         │  (localStorage)     │    │  (SM-2 scheduler)    │   │
│         └──────────────────────┘    └──────────────────────┘   │
│                    │                                        │
│         fetch POST /api/generate                            │
└────────────────────┼────────────────────────────────────────┘
                     │
┌────────────────────▼───────────────────────────────────────┐
│  Next.js Server — POST /api/generate                       │
│                                                            │
│  ┌──────────────────────────────────────────────────────┐  │
│  │  route.ts  (provider selector)                       │  │
│  │  - reads OPENAI_API_KEY (server-side only)           │  │
│  │  - dispatches to openaiProvider or mockGenerator     │  │
│  │  - falls back to mock on OpenAI error                │  │
│  └────────────┬───────────────────────┬──────────────────┘  │
│               │                       │                     │
│   ┌───────────▼──────────┐  ┌─────────▼──────────────┐     │
│   │  openaiProvider.ts    │  │  mockGenerator.ts       │     │
│   │  (Chat Completions)   │  │  (offline heuristics)   │     │
│   └──────────────────────┘    └──────────────────────┘     │
└────────────────────────────────────────────────────────────┘
```

### Layer responsibilities

| Layer | Location | Responsibility |
|-------|----------|----------------|
| UI / Tabs | `src/components` | Render Notes, Framework, Review tabs; manage local UI state |
| Home page | `src/app/page.tsx` | Tabbed client shell wiring the three tabs together |
| Persistence | `src/lib/storage.ts` | Read/write notes, key points, framework, cards, review state to localStorage |
| Scheduling | `src/lib/srs.ts` | Pure SM-2 interval calculation; no React, no DOM |
| Types | `src/lib/types.ts` | Shared interfaces shared by client, server, and providers |
| API route | `src/app/api/generate/route.ts` | Select provider, dispatch generation, handle fallback |
| OpenAI provider | `src/lib/openaiProvider.ts` | Server-only adapter to OpenAI Chat Completions |
| Mock provider | `src/lib/mockGenerator.ts` | Deterministic offline generator using local heuristics |

## 4. Data Model (`src/lib/types.ts`)

```ts
// A learner-supplied source note.
export interface Note {
  id: string;            // generated identifier (e.g., crypto.randomUUID())
  content: string;       // raw note text
  createdAt: number;     // epoch ms timestamp
}

// A single extracted concept.
export interface KeyPoint {
  id: string;
  noteId: string;
  text: string;          // one-sentence summary of a distinct concept
}

// A node in the hierarchical concept map.
export interface FrameworkNode {
  id: string;
  label: string;
  children?: FrameworkNode[];
  keyPointIds?: string[]; // leaf nodes map back to key points
}

// Top-level framework tree for a note.
export interface Framework {
  noteId: string;
  root: FrameworkNode;
}

// A spaced-repetition flashcard.
export interface Flashcard {
  id: string;
  noteId: string;
  keyPointId: string;
  question: string;
  answer: string;
  // SM-2 scheduling state
  ease: number;          // ease factor (default 2.5)
  interval: number;       // days until next review
  repetitions: number;    // consecutive successful recalls
  due: number;            // epoch ms when next due
}

// What the learner submits for generation.
export interface GenerateRequest {
  noteId: string;
  content: string;
}

// The unified response returned by /api/generate.
export interface GenerateResponse {
  keyPoints: KeyPoint[];
  framework: Framework;
  flashcards: Flashcard[];
  provider: "mock" | "openai";   // which provider produced the result
  fallback?: boolean;             // true if OpenAI failed and mock was used
}

// Recall rating the learner gives during review.
export type Rating = "again" | "hard" | "good" | "easy";

// Shared generation interface every provider must implement.
export interface GenerationProvider {
  generateKeyPoints(noteId: string, content: string): Promise<KeyPoint[]>;
  generateFramework(noteId: string, content: string, keyPoints: KeyPoint[]): Promise<Framework>;
  generateFlashcards(noteId: string, keyPoints: KeyPoint[]): Promise<Flashcard[]>;
}
```

## 5. Component Design

### 5.1 Home Page (`src/app/page.tsx`)

A single Client Component that renders a tabbed shell. It holds the active note and the last `GenerateResponse` in state, and passes data + callbacks down to the three tabs.

- Tabs: **Notes** | **Framework** | **Review**.
- When a note is stored (NotesTab), it triggers a `POST /api/generate` and stores the result.
- State is hydrated from localStorage on mount and persisted on change.

### 5.2 NotesTab (`src/components/NotesTab.tsx`)

- Textarea for pasting note text.
- File upload control accepting `.txt` and `.md`.
- Validation: reject empty notes and files larger than 1 MB (REQ-3).
- On submit: create a `Note` (id + timestamp), persist via `storage.ts`, and call the generation callback.

### 5.3 FrameworkTab (`src/components/FrameworkTab.tsx`)

- Renders the `Framework.root` tree as an indented, collapsible outline (REQ-8).
- Each leaf node optionally shows its linked key point.
- Pure presentation of the framework from `GenerateResponse`.

### 5.4 ReviewTab (`src/components/ReviewTab.tsx`)

- Lists due flashcards first, then non-due cards (REQ-11).
- Shows a session progress indicator (e.g., "3 / 12 reviewed").
- Card front shows the question; revealing shows the answer.
- Rating buttons: Again / Hard / Good / Easy.
- On rating, calls `srs.ts` to compute the next interval and updates the card in storage (REQ-10).

### 5.5 Shared UI primitives (`src/components/ui/`)

Small reusable building blocks (button, tab trigger, card) kept minimal to avoid speculative abstraction.

## 6. API Route (`src/app/api/generate/route.ts`)

A single `POST` handler.

1. Parse `GenerateRequest` from the request body.
2. Read `OPENAI_API_KEY` from `process.env` (server-side only — never exposed to the client).
3. Provider selection:
   - If key is set and non-empty → use `openaiProvider` (REQ-12).
   - Otherwise → use `mockGenerator` (REQ-13).
4. Execute the three generation steps (`generateKeyPoints` → `generateFramework` → `generateFlashcards`).
5. If the OpenAI provider throws, surface a message and re-run the failed step(s) with the mock provider; set `provider: "mock"` and `fallback: true` (REQ-17).
6. Return `GenerateResponse` as JSON.

The route is the **only** server-side module that imports `openaiProvider.ts`, keeping provider-specific code out of the client bundle.

## 7. LLM Providers

### 7.1 Shared interface

Both providers implement `GenerationProvider` (see §4). The intake, review, and UI layers import only the types — never a concrete provider — so adding a provider requires no changes outside `src/lib` and `route.ts` (REQ-14).

### 7.2 Mock provider (`src/lib/mockGenerator.ts`)

- Deterministic, offline heuristics. No network.
- Key points: split note into sentences, rank by keyword frequency / position, deduplicate near-duplicates, cap at 12 (REQ-5, REQ-6).
- Framework: group key points by detected topic keywords into a shallow parent-child tree; every key point maps to at least one leaf (REQ-7).
- Flashcards: at least one card per key point, question derived from the key point text, answer a concise restatement (REQ-9).
- Must return within 2 s for a 5,000-char note on the dev machine (REQ-15).

### 7.3 OpenAI provider (`src/lib/openaiProvider.ts`)

- Server-only. Calls OpenAI Chat Completions.
- Prompts instruct the model to stay grounded in the supplied note content (product principle: notes are the source of truth).
- Returns the same shapes (`KeyPoint[]`, `Framework`, `Flashcard[]`) so the route can compose results uniformly.
- On any error, throws so the route can fall back to the mock (REQ-17).

## 8. Spaced Repetition (`src/lib/srs.ts`)

- Pure function: given a `Flashcard` and a `Rating`, returns an updated `Flashcard` with new `ease`, `interval`, `repetitions`, and `due`.
- SM-2 style: successful recall increases intervals; failed recall resets toward a short interval (REQ-10).
- No React or DOM imports — safe to unit-test and use anywhere.

## 9. Persistence (`src/lib/storage.ts`)

- Wraps localStorage with typed get/set helpers.
- Keys are namespaced (e.g., `studyq:notes`, `studyq:cards`).
- Stores notes, key points, frameworks, flashcards, and review state so data survives reloads (REQ-16).
- Client-only; never imported by server modules or the API route.

## 10. Verification Strategy

- `npx tsc --noEmit` runs on every `.ts`/`.tsx` save via `.kiro/hooks/test-on-save.json`.
- `npm run build` must pass before deployment.
- Unit-testable surface: `srs.ts`, `mockGenerator.ts`, `storage.ts` are pure / browser-isolated and can be tested in isolation.
- The mock provider path is the default and must work with zero configuration.

## 11. Traceability to Requirements

| Requirement | Design section |
|-------------|---------------|
| REQ-1, REQ-2 (note intake / upload) | §5.2 NotesTab |
| REQ-3 (validation) | §5.2 NotesTab |
| REQ-4 (trigger generation on store) | §5.1 Home Page, §6 API Route |
| REQ-5, REQ-6 (key points) | §7.2 Mock, §7.3 OpenAI, §4 KeyPoint |
| REQ-7, REQ-8 (framework tree + render) | §7.2/7.3, §5.3 FrameworkTab |
| REQ-9 (flashcards per key point) | §7.2 Mock, §7.3 OpenAI |
| REQ-10 (SM-2 scheduling) | §8 srs.ts |
| REQ-11 (due-first, progress) | §5.4 ReviewTab |
| REQ-12, REQ-13 (provider selection) | §6 API Route |
| REQ-14 (pluggable interface) | §4 GenerationProvider, §7.1 |
| REQ-15 (mock performance) | §7.2 Mock |
| REQ-16 (persistence) | §9 storage.ts |
| REQ-17 (OpenAI fallback) | §6 API Route |
