---
inclusion: always
---

# StudyQ — Product Steering

## Overview

StudyQ is an AI study assistant built for the Kiroween 2026 hackathon (Frankenstein category). It helps students turn raw study notes into a structured, reviewable knowledge base through three interconnected capabilities:

1. **Key-point extraction** — Analyze submitted notes and surface the essential concepts, definitions, and relationships the student should focus on.
2. **Knowledge framework / concept map** — Organize extracted concepts into a hierarchical concept map that shows how ideas connect, so students can see the structure of a topic, not just a list of facts.
3. **Spaced-repetition flashcards** — Generate flashcards from the extracted concepts and schedule reviews using a spaced-repetition algorithm (SM-2 style) so retention improves over time with minimal study effort.

## Core Principles

- **Student-first.** Every feature should reduce friction for a student studying; avoid admin/configuration surfaces that don't serve learners.
- **Notes are the source of truth.** Generated content (key points, maps, cards) must stay grounded in the student's own notes, not generic knowledge.
- **Explainable AI.** When the model extracts or connects concepts, show the source span in the notes so the student can verify and trust the result.
- **Progressive complexity.** Start with a simple note-to-cards flow; the concept map and spaced-repetition scheduler layer on top without blocking the core loop.
- **Hackathon scope.** Favor a focused, demoable vertical slice over speculative breadth. Prefer one polished flow over several half-built features.

## Stack

- **Framework:** Next.js (App Router). Follow the conventions documented in `node_modules/next/dist/docs/` per `AGENTS.md` — this version may differ from training data; read the relevant guide before writing code.
- **Language:** TypeScript (strict mode).
- **Styling:** Tailwind CSS.
- **Hosting/Deployment:** Vercel.
- **Runtime:** Prefer Server Components by default; use Client Components only where interactivity (note input, card review, tree toggle) requires it.

## Project Context

- **Event:** Kiroween 2026 (Frankenstein category).
- **Builder:** Solo — Bo Zhou. Optimize for one person's velocity: fewer moving parts, minimal infra to operate, sensible defaults over configuration.
- **Repo root:** `/workspace/studyQ`.
