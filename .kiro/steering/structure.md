---
inclusion: always
---

# StudyQ — Project Structure

## Repository Layout

```
/workspace/studyQ
├── .kiro/                     # Kiro workspace — NOT gitignored
│   ├── agents/                # Agent definitions
│   ├── hooks/                 # PostFileSave / lifecycle hooks (JSON)
│   │   └── test-on-save.json  # Runs `npx tsc --noEmit` on .ts/.tsx save
│   ├── specs/
│   │   └── study-core/        # MVP spec for the study-assistant feature
│   │       ├── requirements.md# EARS-style requirements
│   │       ├── design.md      # Architecture & component design
│   │       └── tasks.md       # Ordered implementation checklist
│   └── steering/              # Always-included context for Kiro
│       ├── product.md         # Product vision & principles
│       ├── tech.md             # Tech stack & provider strategy
│       └── structure.md        # This file
├── src/
│   ├── app/                   # Next.js App Router
│   │   ├── layout.tsx          # Root layout (Geist fonts, global CSS)
│   │   ├── page.tsx            # Home page — tabbed study UI (client)
│   │   ├── globals.css        # Tailwind directives + base styles
│   │   └── api/
│   │       └── generate/       # POST /api/generate — LLM provider route
│   │           └── route.ts    # Selects mock or OpenAI, returns JSON
│   ├── components/            # React components
│   │   ├── NotesTab.tsx       # Note input + upload
│   │   ├── FrameworkTab.tsx   # Collapsible concept-map tree
│   │   ├── ReviewTab.tsx      # Spaced-repetition flashcard review
│   │   └── ui/                # Shared primitives (buttons, tabs, etc.)
│   └── lib/                   # Framework-agnostic logic
│       ├── types.ts           # Shared TypeScript types & interfaces
│       ├── storage.ts         # localStorage helpers
│       ├── srs.ts             # SM-2 spaced-repetition scheduler
│       ├── mockGenerator.ts   # Mock LLM (offline heuristics)
│       └── openaiProvider.ts  # OpenAI Chat Completions adapter
├── docs/
│   └── KIRO_SESSION_LOG.md    # Session log
├── public/                    # Static assets (SVGs)
├── package.json
├── tsconfig.json
├── next.config.ts
├── eslint.config.mjs
└── .gitignore                 # .env* ignored; .kiro NOT ignored
```

## Conventions

- **App Router** — routes live in `src/app/`. API routes are `src/app/api/<name>/route.ts`.
- **Path alias** — `@/*` maps to `./src/*` per `tsconfig.json`. Prefer `@/lib/...` and `@/components/...` over relative imports.
- **Server vs Client** — default to Server Components. Add `"use client"` only when interactivity (state, events, `localStorage`) is required.
- **`src/lib`** — pure, framework-agnostic TypeScript. No React imports. Safe to unit-test and use in both server and client contexts.
- **`src/components`** — React components. Client components colocate their hooks and handlers.
- **`.kiro`** — committed to the repo. Steering files carry `inclusion: always` frontmatter.
