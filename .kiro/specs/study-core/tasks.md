# StudyQ MVP — Tasks

Ordered implementation checklist. Each task maps to the design in `design.md` and the requirements in `requirements.md`. Do not implement app code until the spec files are complete.

## Phase 0 — Specs & Steering (complete before coding)

- [x] 0.1 Write product steering (`.kiro/steering/product.md`)
- [x] 0.2 Write tech steering (`.kiro/steering/tech.md`)
- [x] 0.3 Write structure steering (`.kiro/steering/structure.md`)
- [x] 0.4 Write requirements (`.kiro/specs/study-core/requirements.md`)
- [x] 0.5 Write design (`.kiro/specs/study-core/design.md`)
- [x] 0.6 Write tasks (`.kiro/specs/study-core/tasks.md`)
- [x] 0.7 Add type-check-on-save hook (`.kiro/hooks/test-on-save.json`)

## Phase 1 — Shared Types & Pure Logic

- [x] 1.1 Create `src/lib/types.ts` with `Note`, `KeyPoint`, `FrameworkNode`, `Framework`, `Flashcard`, `GenerateRequest`, `GenerateResponse`, `Rating`, and `GenerationProvider` interface.
- [x] 1.2 Create `src/lib/srs.ts` — pure SM-2 scheduler: `scheduleCard(card: Flashcard, rating: Rating): Flashcard`. Successful recall increases interval; "again" resets to short interval.
- [x] 1.3 Create `src/lib/storage.ts` — typed localStorage helpers (namespaced keys) for notes, key points, frameworks, flashcards, and review state.

## Phase 2 — Mock LLM Provider

- [x] 2.1 Create `src/lib/mockGenerator.ts` implementing `GenerationProvider`.
- [x] 2.2 `generateKeyPoints` — split note into sentences, rank by keyword frequency/position, deduplicate near-duplicates, cap at 12 (REQ-5, REQ-6).
- [x] 2.3 `generateFramework` — group key points by detected topic keywords into a shallow parent-child tree; every key point maps to ≥1 leaf (REQ-7).
- [x] 2.4 `generateFlashcards` — at least one card per key point; question from key point text, concise answer (REQ-9).
- [x] 2.5 Verify mock returns within 2 s for a 5,000-char note (REQ-15).

## Phase 3 — OpenAI Provider

- [x] 3.1 Create `src/lib/openaiProvider.ts` implementing `GenerationProvider` (server-only).
- [x] 3.2 Wire Chat Completions calls with prompts grounded in the supplied note content.
- [x] 3.3 Return the same shapes (`KeyPoint[]`, `Framework`, `Flashcard[]`) so the route can compose results uniformly.
- [x] 3.4 Throw on any error so the route can fall back to mock (REQ-17).

## Phase 4 — API Route

- [x] 4.1 Create `src/app/api/generate/route.ts` `POST` handler.
- [x] 4.2 Parse `GenerateRequest` from the body; validate non-empty content.
- [x] 4.3 Select provider: OpenAI if `OPENAI_API_KEY` set and non-empty, else mock (REQ-12, REQ-13).
- [x] 4.4 Run `generateKeyPoints` → `generateFramework` → `generateFlashcards`.
- [x] 4.5 On OpenAI error, fall back to mock for the affected step; set `provider: "mock"`, `fallback: true` (REQ-17).
- [x] 4.6 Return `GenerateResponse` JSON; never expose `OPENAI_API_KEY` to the client.

## Phase 5 — UI Components

- [x] 5.1 Create shared UI primitives in `src/components/ui/` (button, tab trigger, card) as needed — keep minimal.
- [x] 5.2 Create `src/components/NotesTab.tsx` — textarea + `.txt`/`.md` upload; reject empty / >1 MB (REQ-1, REQ-2, REQ-3); on store, trigger generation.
- [x] 5.3 Create `src/components/FrameworkTab.tsx` — render `Framework.root` as indented, collapsible outline (REQ-8).
- [x] 5.4 Create `src/components/ReviewTab.tsx` — due cards first, progress indicator (REQ-11); reveal answer; Again/Hard/Good/Easy rating → `srs.ts` → update storage (REQ-10).

## Phase 6 — Home Page Wiring

- [x] 6.1 Convert `src/app/page.tsx` into a Client Component tabbed shell (Notes | Framework | Review).
- [x] 6.2 Hold active note + last `GenerateResponse` in state; hydrate from localStorage on mount, persist on change (REQ-16).
- [x] 6.3 Wire NotesTab submit → store note → `POST /api/generate` → store response → switch to Framework/Review tabs.
- [x] 6.4 Update page metadata/title in `src/app/layout.tsx` to reflect StudyQ.

## Phase 7 — Environment & Docs

- [x] 7.1 Create `.env.local.example` with `OPENAI_API_KEY=` placeholder (no real key).
- [x] 7.2 Confirm `.gitignore` ignores `.env*` and does NOT ignore `.kiro/`.
- [x] 7.3 Update `README.md` with StudyQ run instructions (dev, build, env setup).

## Phase 8 — Verification

- [x] 8.1 `npx tsc --noEmit` passes (hook runs on save).
- [x] 8.2 `npm run build` passes.
- [x] 8.3 Manual smoke test: paste a note → key points render → framework tree renders → review a card → rating updates due date.
- [x] 8.4 Verify mock path works with no `OPENAI_API_KEY` set.
- [x] 8.5 (If key available) verify OpenAI path works and falls back to mock on error.
