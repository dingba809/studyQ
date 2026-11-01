"use client";

import { useEffect, useMemo, useState } from "react";
import { FrameworkTab } from "@/components/FrameworkTab";
import { NotesTab } from "@/components/NotesTab";
import { ReviewTab } from "@/components/ReviewTab";
import {
  loadActiveNoteId,
  loadFlashcards,
  loadFramework,
  loadKeyPoints,
  loadLastProvider,
  loadNotes,
  persistGenerateResponse,
  saveActiveNoteId,
  saveFlashcards,
  upsertNote,
} from "@/lib/storage";
import type {
  Flashcard,
  Framework,
  GenerateResponse,
  KeyPoint,
  Note,
  TabId,
} from "@/lib/types";

const TABS: { id: TabId; label: string }[] = [
  { id: "notes", label: "Notes" },
  { id: "framework", label: "Framework" },
  { id: "review", label: "Review" },
];

export default function HomePage() {
  const [tab, setTab] = useState<TabId>("notes");
  const [notes, setNotes] = useState<Note[]>([]);
  const [activeId, setActiveId] = useState<string | null>(null);
  const [keyPoints, setKeyPoints] = useState<KeyPoint[]>([]);
  const [framework, setFramework] = useState<Framework | null>(null);
  const [cards, setCards] = useState<Flashcard[]>([]);
  const [provider, setProvider] = useState<string | null>(null);
  const [fallback, setFallback] = useState(false);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [hydrated, setHydrated] = useState(false);

  useEffect(() => {
    const loaded = loadNotes();
    const id = loadActiveNoteId() ?? loaded[0]?.id ?? null;
    setNotes(loaded);
    setActiveId(id);
    if (id) {
      setKeyPoints(loadKeyPoints(id));
      setFramework(loadFramework(id));
      setCards(loadFlashcards(id));
      const meta = loadLastProvider(id);
      setProvider(meta?.provider ?? null);
      setFallback(Boolean(meta?.fallback));
    }
    setHydrated(true);
  }, []);

  const activeNote = useMemo(
    () => notes.find((n) => n.id === activeId) ?? null,
    [notes, activeId],
  );

  async function handleSubmit(content: string) {
    setBusy(true);
    setError(null);
    const note: Note = {
      id: crypto.randomUUID(),
      content,
      createdAt: Date.now(),
      title: content.split("\n").find((l) => l.trim())?.slice(0, 60) || "Untitled",
    };
    const nextNotes = upsertNote(note);
    setNotes(nextNotes);
    setActiveId(note.id);
    saveActiveNoteId(note.id);

    try {
      const res = await fetch("/api/generate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ noteId: note.id, content }),
      });
      if (!res.ok) {
        const data = (await res.json().catch(() => null)) as { error?: string } | null;
        throw new Error(data?.error || `Generate failed (${res.status})`);
      }
      const data = (await res.json()) as GenerateResponse;
      persistGenerateResponse(note.id, data);
      setKeyPoints(data.keyPoints);
      setFramework(data.framework);
      setCards(data.flashcards);
      setProvider(data.provider);
      setFallback(Boolean(data.fallback));
      setTab("framework");
    } catch (e) {
      setError(e instanceof Error ? e.message : "Generation failed");
    } finally {
      setBusy(false);
    }
  }

  function handleCardsUpdate(next: Flashcard[]) {
    setCards(next);
    if (activeId) saveFlashcards(activeId, next);
  }

  if (!hydrated) {
    return (
      <main className="mx-auto flex min-h-screen max-w-3xl items-center justify-center p-6 text-sm text-zinc-500">
        Loading StudyQ…
      </main>
    );
  }

  return (
    <main className="mx-auto flex w-full max-w-3xl flex-1 flex-col px-4 py-8 sm:px-6">
      <header className="mb-6">
        <p className="text-xs font-semibold uppercase tracking-[0.2em] text-indigo-600 dark:text-indigo-400">
          Kiroween 2026 · Frankenstein
        </p>
        <h1 className="mt-2 text-3xl font-bold tracking-tight text-zinc-900 dark:text-zinc-50">
          StudyQ
        </h1>
        <p className="mt-2 max-w-2xl text-sm leading-6 text-zinc-600 dark:text-zinc-400">
          AI study assistant that stitches LLM extraction, knowledge frameworks, and
          spaced-repetition review into one flow — so students can see the map, then
          remember it.
        </p>
        {activeNote && (
          <p className="mt-3 truncate text-xs text-zinc-500">
            Active note: {activeNote.title || activeNote.id}
          </p>
        )}
      </header>

      <nav className="mb-6 flex gap-1 rounded-xl border border-zinc-200 bg-zinc-100 p-1 dark:border-zinc-700 dark:bg-zinc-900">
        {TABS.map((t) => (
          <button
            key={t.id}
            type="button"
            onClick={() => setTab(t.id)}
            className={`flex-1 rounded-lg px-3 py-2 text-sm font-medium transition ${
              tab === t.id
                ? "bg-white text-zinc-900 shadow-sm dark:bg-zinc-800 dark:text-white"
                : "text-zinc-600 hover:text-zinc-900 dark:text-zinc-400 dark:hover:text-zinc-100"
            }`}
          >
            {t.label}
          </button>
        ))}
      </nav>

      <section className="rounded-2xl border border-zinc-200 bg-white p-5 shadow-sm dark:border-zinc-800 dark:bg-zinc-950/40 sm:p-6">
        {tab === "notes" && (
          <NotesTab
            busy={busy}
            error={error}
            lastProvider={provider}
            fallback={fallback}
            keyPointCount={keyPoints.length}
            onSubmit={handleSubmit}
          />
        )}
        {tab === "framework" && (
          <FrameworkTab framework={framework} keyPoints={keyPoints} />
        )}
        {tab === "review" && (
          <ReviewTab cards={cards} onUpdate={handleCardsUpdate} />
        )}
      </section>

      <footer className="mt-8 text-center text-xs text-zinc-400">
        Built with Kiro for Kiroween 2026 · MIT · Bo Zhou
      </footer>
    </main>
  );
}
