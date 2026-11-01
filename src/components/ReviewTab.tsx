"use client";

import { useMemo, useState } from "react";
import { isDue, scheduleCard, sortForReview } from "@/lib/srs";
import type { Flashcard, Rating } from "@/lib/types";

type Props = {
  cards: Flashcard[];
  onUpdate: (cards: Flashcard[]) => void;
};

export function ReviewTab({ cards, onUpdate }: Props) {
  const ordered = useMemo(() => sortForReview(cards), [cards]);
  const dueCount = useMemo(
    () => cards.filter((c) => isDue(c)).length,
    [cards],
  );
  const [index, setIndex] = useState(0);
  const [revealed, setRevealed] = useState(false);
  const [reviewed, setReviewed] = useState(0);

  if (cards.length === 0) {
    return (
      <div className="rounded-xl border border-dashed border-zinc-300 bg-zinc-50 px-6 py-12 text-center dark:border-zinc-700 dark:bg-zinc-900/40">
        <p className="font-medium">No flashcards yet</p>
        <p className="mt-1 text-sm text-zinc-500">
          Generate a study pack first — each key point becomes a review card.
        </p>
      </div>
    );
  }

  const card = ordered[Math.min(index, ordered.length - 1)];
  const progress = `${reviewed} / ${cards.length} reviewed · ${dueCount} due`;

  function rate(rating: Rating) {
    const next = scheduleCard(card, rating);
    const updated = cards.map((c) => (c.id === next.id ? next : c));
    onUpdate(updated);
    setReviewed((n) => n + 1);
    setRevealed(false);
    setIndex((i) => (i + 1) % ordered.length);
  }

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap items-end justify-between gap-2">
        <div>
          <h2 className="text-lg font-semibold tracking-tight">Spaced review</h2>
          <p className="mt-1 text-sm text-zinc-500 dark:text-zinc-400">
            Due cards first. Rate your recall to schedule the next review (SM-2 style).
          </p>
        </div>
        <p className="text-xs font-medium text-zinc-500">{progress}</p>
      </div>

      <div className="rounded-2xl border border-zinc-200 bg-gradient-to-br from-white to-indigo-50/40 p-6 shadow-sm dark:border-zinc-700 dark:from-zinc-900 dark:to-indigo-950/20">
        <p className="text-xs font-semibold uppercase tracking-wide text-indigo-600 dark:text-indigo-400">
          Question
        </p>
        <p className="mt-3 text-lg font-medium leading-relaxed text-zinc-900 dark:text-zinc-50">
          {card.question}
        </p>

        {revealed ? (
          <div className="mt-6 rounded-xl bg-white/80 p-4 dark:bg-zinc-950/50">
            <p className="text-xs font-semibold uppercase tracking-wide text-emerald-600">
              Answer
            </p>
            <p className="mt-2 text-sm leading-relaxed text-zinc-800 dark:text-zinc-200">
              {card.answer}
            </p>
          </div>
        ) : (
          <button
            type="button"
            onClick={() => setRevealed(true)}
            className="mt-6 rounded-lg bg-zinc-900 px-4 py-2 text-sm font-medium text-white hover:bg-zinc-700 dark:bg-zinc-100 dark:text-zinc-900 dark:hover:bg-white"
          >
            Reveal answer
          </button>
        )}
      </div>

      {revealed && (
        <div className="grid grid-cols-2 gap-2 sm:grid-cols-4">
          {(
            [
              ["again", "Again", "bg-rose-600 hover:bg-rose-500"],
              ["hard", "Hard", "bg-amber-600 hover:bg-amber-500"],
              ["good", "Good", "bg-emerald-600 hover:bg-emerald-500"],
              ["easy", "Easy", "bg-indigo-600 hover:bg-indigo-500"],
            ] as const
          ).map(([value, label, cls]) => (
            <button
              key={value}
              type="button"
              onClick={() => rate(value)}
              className={`rounded-lg px-3 py-2 text-sm font-medium text-white ${cls}`}
            >
              {label}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
