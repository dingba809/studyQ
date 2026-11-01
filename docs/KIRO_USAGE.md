# Kiro usage — StudyQ (Kiroween 2026)

This document lists **Kiro features actually used** while building StudyQ on this machine.
Do not claim features, credit totals, or chat transcripts that were not exercised.

## Project facts

| Item | Value |
|------|-------|
| Event / category | Kiroween 2026 · Frankenstein |
| Builder | Solo — Bo Zhou |
| Repo | https://github.com/dingba809/studyQ |
| Live demo | https://study-q-mu.vercel.app |
| License | MIT |
| Stack | Next.js App Router + TypeScript + Tailwind CSS · Vercel |
| LLM | Optional `OPENAI_API_KEY`; without it `/api/generate` uses mock data |

## Products used

| Product | Used? | Notes |
|---------|-------|-------|
| Kiro CLI | Yes | `kiro-cli` **2.37.0** at `/home/box/.local/bin/kiro-cli`; Google login as `uiodcman@gmail.com` |
| Kiro Web | Account only | Used earlier for User ID / credits request outside this repo build; **not** used to author code or `.kiro` files in this session |
| Kiro IDE | No | Not used for this box build |
| Kiro Crew | No | Explicitly not used |

## Commands actually run

Evidence is captured in `docs/KIRO_SESSION_LOG.md` (environment dump dated Sun Nov 1 20:15:12 CST 2026).

| Command | Purpose |
|---------|---------|
| `kiro-cli whoami` | Confirm Google login (`uiodcman@gmail.com`) |
| `kiro-cli doctor` | Environment / install health check |
| `kiro-cli chat --no-interactive --trust-all-tools --trust-workspace` | Draft steering and create specs / hook files with tools |

No other Kiro CLI subcommands were relied on for this MVP. Interactive IDE chat was not used.

## Features used

### Steering (`inclusion: always`)

Created under `.kiro/steering/`:

- `product.md` — product goals, Frankenstein framing, student-first principles
- `tech.md` — Next.js / Tailwind / pluggable LLM / no secrets / keep `.kiro` in git
- `structure.md` — `src/app`, `src/components`, `src/lib`, `.kiro` layout

Drafted and written via **`kiro-cli chat --no-interactive --trust-all-tools --trust-workspace`** (see session log).

### Spec-driven workflow

Created under `.kiro/specs/study-core/`:

- `requirements.md` — EARS-style requirements (WHEN / IF / WHILE / THE SYSTEM SHALL)
- `design.md` — architecture, types, providers, API route, UI tabs
- `tasks.md` — phased implementation checklist

Requirements, design, and tasks were produced via the same non-interactive Kiro CLI chat sessions (agent wrote files with tools).

### Hooks

- `.kiro/hooks/test-on-save.json` — `PostFileSave` matcher `\.(ts|tsx)$` runs `npx tsc --noEmit`

### Spec vs vibe coding

- **Spec first:** requirements → design → tasks under `.kiro/specs/study-core/` before implementing the MVP UI and `/api/generate`.
- **Implementation:** TypeScript modules and React tabs follow the design doc; mock LLM keeps the demo offline when no API key is set.

### MCP / PBT / Powers / custom agents

- **MCP:** not configured for this project (`mcp.json` not added).
- **PBT:** not used (IDE-only feature).
- **Powers:** not used.
- **Custom agents:** default CLI chat agent only; no custom agent config authored.

## Follow-up build steps (outside Kiro chat)

After the `.kiro` artifacts existed:

1. Next.js app scaffolded with `npx create-next-app@latest` (folder renamed to `studyQ`).
2. MVP implemented under `src/` per `.kiro/specs/study-core/design.md`.
3. Verified locally: `npx tsc --noEmit` OK; `npm run build` OK; `POST /api/generate` returns mock key points + framework + flashcards without `OPENAI_API_KEY`.
4. Public GitHub repo `dingba809/studyQ`; production deploy on Vercel → https://study-q-mu.vercel.app (Hobby; no `OPENAI_API_KEY` env set, so live demo uses mock generation).

## What not to claim

- Do **not** invent Kiro credit balances or redemption counts.
- Do **not** invent full chat transcripts beyond what `docs/KIRO_SESSION_LOG.md` records.
- Do **not** claim Kiro IDE, Crew, MCP, PBT, Powers, or custom agents were used for this build.
