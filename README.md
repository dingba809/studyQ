# StudyQ

AI study assistant for **Kiroween 2026** (Frankenstein category).

StudyQ helps students:

1. Paste or upload study notes
2. Extract **key points**
3. Build a **knowledge framework** (collapsible concept tree)
4. Review with **spaced-repetition** flashcards (SM-2 style)

It stitches an LLM layer (OpenAI when configured, offline mock otherwise), a knowledge-graph-style outline, and spaced repetition into one demoable flow.

## Stack

- Next.js (App Router) + TypeScript + Tailwind CSS
- Pluggable LLM: `OPENAI_API_KEY` → OpenAI Chat Completions; else local heuristic mock
- Browser `localStorage` for notes / cards (no database in MVP)
- Built with **Kiro CLI** (steering, specs, hooks) — see `docs/KIRO_USAGE.md`

## Quick start

```bash
cd studyQ
npm install
npm run dev
```

Open [http://localhost:3000](http://localhost:3000).

### Optional OpenAI

```bash
cp .env.local.example .env.local
# edit .env.local and set OPENAI_API_KEY=sk-...
npm run dev
```

Without a key, generation still works via the mock provider (fully offline demo).

## Judge demo steps

1. Open the app → **Notes** tab
2. Paste a short lecture excerpt (or upload `.txt` / `.md`)
3. Click **Generate study pack**
4. Inspect the **Framework** tab (tree + key points)
5. Switch to **Review**, reveal answers, rate Again / Hard / Good / Easy
6. Reload the page — data persists in `localStorage`

## Scripts

| Command | Purpose |
|---------|---------|
| `npm run dev` | Local dev server |
| `npm run build` | Production build |
| `npm start` | Serve production build |
| `npx tsc --noEmit` | Typecheck (also wired in `.kiro/hooks/test-on-save.json`) |

## Repo layout (Kiro)

```
.kiro/
  steering/     product.md, tech.md, structure.md
  specs/study-core/  requirements.md, design.md, tasks.md
  hooks/        test-on-save.json
```

`.kiro` is **not** gitignored (Kiroween requirement).

## License

MIT © 2026 Bo Zhou
