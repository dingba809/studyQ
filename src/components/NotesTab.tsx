"use client";

import { useRef, useState } from "react";

const MAX_BYTES = 1 * 1024 * 1024;

type Props = {
  busy: boolean;
  error: string | null;
  lastProvider?: string | null;
  fallback?: boolean;
  keyPointCount?: number;
  onSubmit: (content: string, title?: string) => Promise<void>;
};

export function NotesTab({
  busy,
  error,
  lastProvider,
  fallback,
  keyPointCount,
  onSubmit,
}: Props) {
  const [text, setText] = useState("");
  const [localError, setLocalError] = useState<string | null>(null);
  const fileRef = useRef<HTMLInputElement>(null);

  async function handleFile(file: File | null) {
    setLocalError(null);
    if (!file) return;
    if (!/\.(txt|md)$/i.test(file.name)) {
      setLocalError("Only .txt or .md files are supported.");
      return;
    }
    if (file.size > MAX_BYTES) {
      setLocalError("File larger than 1 MB — please use a smaller note.");
      return;
    }
    const content = await file.text();
    setText(content);
  }

  async function handleGenerate() {
    setLocalError(null);
    const content = text.trim();
    if (!content) {
      setLocalError("Paste or upload some study notes first.");
      return;
    }
    if (new TextEncoder().encode(content).length > MAX_BYTES) {
      setLocalError("Note larger than 1 MB.");
      return;
    }
    await onSubmit(content);
  }

  return (
    <div className="space-y-4">
      <div>
        <h2 className="text-lg font-semibold tracking-tight">Study notes</h2>
        <p className="mt-1 text-sm text-zinc-500 dark:text-zinc-400">
          Paste lecture notes or a topic summary. StudyQ extracts key points, builds a
          knowledge framework, and creates spaced-repetition flashcards.
        </p>
      </div>

      <textarea
        className="min-h-56 w-full resize-y rounded-xl border border-zinc-200 bg-white p-4 text-sm leading-6 shadow-sm outline-none ring-indigo-500/40 placeholder:text-zinc-400 focus:ring-2 dark:border-zinc-700 dark:bg-zinc-900"
        placeholder="e.g. Photosynthesis converts light energy into chemical energy in chloroplasts. The light-dependent reactions occur in the thylakoid membrane…"
        value={text}
        onChange={(e) => setText(e.target.value)}
        disabled={busy}
      />

      <div className="flex flex-wrap items-center gap-3">
        <button
          type="button"
          onClick={handleGenerate}
          disabled={busy}
          className="rounded-lg bg-indigo-600 px-4 py-2 text-sm font-medium text-white shadow hover:bg-indigo-500 disabled:cursor-not-allowed disabled:opacity-60"
        >
          {busy ? "Generating…" : "Generate study pack"}
        </button>

        <button
          type="button"
          onClick={() => fileRef.current?.click()}
          disabled={busy}
          className="rounded-lg border border-zinc-300 bg-white px-4 py-2 text-sm font-medium text-zinc-800 hover:bg-zinc-50 disabled:opacity-60 dark:border-zinc-600 dark:bg-zinc-900 dark:text-zinc-100 dark:hover:bg-zinc-800"
        >
          Upload .txt / .md
        </button>
        <input
          ref={fileRef}
          type="file"
          accept=".txt,.md,text/plain,text/markdown"
          className="hidden"
          onChange={(e) => void handleFile(e.target.files?.[0] ?? null)}
        />

        {lastProvider && (
          <span className="text-xs text-zinc-500">
            Last run: <strong>{lastProvider}</strong>
            {fallback ? " (fell back to mock)" : ""}
            {typeof keyPointCount === "number" ? ` · ${keyPointCount} key points` : ""}
          </span>
        )}
      </div>

      {(localError || error) && (
        <p className="rounded-lg border border-rose-200 bg-rose-50 px-3 py-2 text-sm text-rose-700 dark:border-rose-900 dark:bg-rose-950/40 dark:text-rose-300">
          {localError || error}
        </p>
      )}
    </div>
  );
}
