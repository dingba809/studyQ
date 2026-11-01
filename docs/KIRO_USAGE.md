# Kiro usage — StudyQ (Kiroween 2026)

This document lists **Kiro features actually used** while building StudyQ. Do not claim features that were not exercised.

## Products used

| Product | Used? | Notes |
|---------|-------|-------|
| Kiro CLI | Yes | `kiro-cli` 2.x on Linux; Google login as `uiodcman@gmail.com` |
| Kiro Web | Previously (account) | Used for User ID / credits flow outside this repo build |
| Kiro IDE | No | Not used for this box build |
| Kiro Crew | No | Explicitly not used |

## Features used

### Steering (`inclusion: always`)

Created under `.kiro/steering/`:

- `product.md` — product goals, Frankenstein framing, student-first principles
- `tech.md` — Next.js / Tailwind / pluggable LLM / no secrets / keep `.kiro` in git
- `structure.md` — `src/app`, `src/components`, `src/lib`, `.kiro` layout

Drafted with **`kiro-cli chat --no-interactive --trust-all-tools --trust-workspace`**, then refined/written into the repo by the agent session (see `docs/KIRO_SESSION_LOG.md`).

### Spec-driven workflow

Created under `.kiro/specs/study-core/`:

- `requirements.md` — EARS-style requirements (WHEN / IF / WHILE / THE SYSTEM SHALL)
- `design.md` — architecture, types, providers, API route, UI tabs
- `tasks.md` — phased implementation checklist

Requirements and design/tasks were produced via **Kiro CLI non-interactive chat** (agent wrote files with tools).

### Hooks

- `.kiro/hooks/test-on-save.json` — `PostFileSave` matcher `\.(ts|tsx)$` runs `npx tsc --noEmit`

### Spec vs vibe coding

- **Spec first:** requirements → design → tasks under `.kiro/specs/study-core/` before implementing the MVP UI and `/api/generate`.
- **Implementation:** TypeScript modules and React tabs follow the design doc; mock LLM keeps the demo offline.

### MCP / PBT / Powers / custom agents

- **MCP:** not configured for this project (`mcp.json` not added).
- **PBT:** not used (IDE-only feature).
- **Powers:** not used.
- **Custom agents:** default CLI chat agent only; no custom agent config authored.

## Commands run (evidence)

See `docs/KIRO_SESSION_LOG.md` for captured `kiro-cli whoami` / `kiro-cli chat --no-interactive` sessions that created steering and specs.
