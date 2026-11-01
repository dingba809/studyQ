---
inclusion: always
---

# StudyQ — Tech Steering

## Stack

| Layer | Choice | Notes |
|-------|--------|-------|
| Framework | Next.js 16 App Router | See `AGENTS.md` — read `node_modules/next/dist/docs/` before writing code; APIs may differ from training data. `cacheComponents` and `partialPrefetching` are enabled in `next.config.ts`. |
| Language | TypeScript 5 (strict) | Path alias `@/*` → `./src/*` (see `tsconfig.json`). |
| Styling | Tailwind CSS v4 | Loaded via `@tailwindcss/turbopack` rule in `next.config.ts`. |
| LLM | Pluggable provider interface | Mock by default; OpenAI when key is present. |
| Persistence | localStorage | Browser-only for MVP; no backend database. |
| Deployment | Vercel | Push to deploy; env vars set in Vercel dashboard. |

## LLM Provider Strategy

The LLM layer is behind a shared generation interface so the note intake, review, and UI layers never import provider-specific code.

- **Mock provider (default).** Deterministic, offline generator using local heuristics. Used when `OPENAI_API_KEY` is unset or empty, and as a fallback if the OpenAI provider errors. No outbound network requests.
- **OpenAI provider.** Activated when `OPENAI_API_KEY` is set and non-empty. Calls the OpenAI Chat Completions API. If a call fails, surface the error to the learner and fall back to the mock for the affected generation step.
- **Adding a new provider.** Implement the shared generation interface (`generateKeyPoints`, `generateFramework`, `generateFlashcards`). No changes to intake, review, or UI layers required.

## Secrets & Environment

- `.env*` is gitignored (see `.gitignore`). Never commit secrets.
- `OPENAI_API_KEY` is read server-side only (API route). It is never exposed to the client.
- For local development, copy `.env.local.example` to `.env.local` and fill in the key. Never create `.env.local` with a real key in the repo.
- For Vercel, set the key in the project's environment variables dashboard.

## `.kiro` Directory

- `.kiro/` MUST NOT be gitignored. It contains steering, specs, and hooks that are part of the project's source of truth and should travel with the repository.
- Steering files use frontmatter `inclusion: always` so Kiro includes them in every context.

## Verification

- Type-check on every `.ts`/`.tsx` save via `.kiro/hooks/test-on-save.json` (`npx tsc --noEmit`).
- `npm run build` must pass before deployment.
- No secrets in repo — enforced by `.gitignore` and review discipline.
