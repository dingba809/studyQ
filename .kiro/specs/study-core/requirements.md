# StudyQ MVP — Requirements

## 1. Overview

StudyQ is a note-driven study companion that converts raw study notes into key points, a knowledge framework tree, and spaced-repetition flashcards. The MVP runs end-to-end on a single developer machine and degrades gracefully when no LLM provider is configured.

## 2. Glossary

- **Note**: A block of pasted text or an uploaded file (`.txt`, `.md`) supplied by the learner as source material.
- **Key Points**: A concise, deduplicated list of the most important concepts extracted from a note.
- **Knowledge Framework Tree**: A hierarchical, indented representation organizing the note's concepts into parent-child topics.
- **Flashcard**: A question/answer pair scheduled by a spaced-repetition algorithm.
- **Spaced Repetition**: A review scheduling strategy that increases intervals between reviews of a card based on the learner's recall performance.
- **Mock LLM**: A deterministic, offline generator that produces key points, framework trees, and flashcards using local heuristics instead of an external API.
- **OpenAI Provider**: A pluggable backend that calls the OpenAI Chat Completions API when an `OPENAI_API_KEY` environment variable is present.

## 3. Functional Requirements

### 3.1 Note Intake

- **REQ-1**: WHEN the learner submits a note by pasting text into the note input, THE SYSTEM SHALL store the note content with a generated identifier and a timestamp.
- **REQ-2**: WHEN the learner uploads a `.txt` or `.md` file through the upload control, THE SYSTEM SHALL read the file contents and store them as a note equivalent to a pasted note.
- **REQ-3**: IF the learner submits an empty note or a file larger than 1 MB, THE SYSTEM SHALL reject the submission and display a validation error without storing anything.
- **REQ-4**: WHEN a note is stored, THE SYSTEM SHALL immediately trigger generation of key points, the knowledge framework tree, and flashcards for that note.

### 3.2 Key Points Generation

- **REQ-5**: WHEN key point generation is triggered for a note, THE SYSTEM SHALL produce a list of no more than 12 key points, each a single sentence summarizing one distinct concept from the note.
- **REQ-6**: WHILE generating key points, THE SYSTEM SHALL remove duplicate or near-duplicate concepts so that each key point addresses a unique idea.

### 3.3 Knowledge Framework Tree

- **REQ-7**: WHEN the framework generation is triggered for a note, THE SYSTEM SHALL produce a hierarchical tree of topics where every key point maps to at least one leaf node.
- **REQ-8**: THE SYSTEM SHALL render the knowledge framework tree as an indented, collapsible outline in the UI.

### 3.4 Spaced-Repetition Flashcards

- **REQ-9**: WHEN flashcard generation is triggered for a note, THE SYSTEM SHALL create at least one flashcard per key point, each with a question prompt and a concise answer.
- **REQ-10**: WHEN the learner reviews a flashcard and rates recall, THE SYSTEM SHALL schedule the next review date using a spaced-repetition interval that increases after successful recall and resets toward a short interval after failed recall.
- **REQ-11**: WHILE a review session is active, THE SYSTEM SHALL present due flashcards before non-due flashcards and display a session progress indicator.

### 3.5 LLM Provider Selection

- **REQ-12**: IF the `OPENAI_API_KEY` environment variable is set and non-empty, THE SYSTEM SHALL use the OpenAI provider for all generation steps.
- **REQ-13**: IF the `OPENAI_API_KEY` environment variable is unset or empty, THE SYSTEM SHALL use the mock LLM for all generation steps without making any outbound network requests.
- **REQ-14**: THE SYSTEM SHALL allow a new LLM provider to be added by implementing a shared generation interface, without modifying the note intake, review, or UI layers.

## 4. Non-Functional Requirements

- **REQ-15**: THE SYSTEM SHALL return mock LLM results within 2 seconds for a note of up to 5,000 characters on the developer's machine.
- **REQ-16**: THE SYSTEM SHALL persist notes, key points, framework trees, flashcards, and review state in local browser storage so that data survives page reloads without a backend database.
- **REQ-17**: WHEN the OpenAI provider is used, THE SYSTEM SHALL surface provider errors to the learner and fall back to the mock LLM for the affected generation step.
