import type { Flashcard, Rating } from "./types";

const DAY_MS = 24 * 60 * 60 * 1000;

/**
 * Simplified SM-2 scheduler.
 * Successful recall increases interval; "again" resets toward a short interval.
 */
export function scheduleCard(card: Flashcard, rating: Rating): Flashcard {
  const now = Date.now();
  let { ease, interval, repetitions } = card;

  if (rating === "again") {
    repetitions = 0;
    interval = 0; // due again "today" (minutes later in UI feel)
    ease = Math.max(1.3, ease - 0.2);
    return {
      ...card,
      ease,
      interval,
      repetitions,
      due: now + 10 * 60 * 1000, // 10 minutes
    };
  }

  const quality =
    rating === "hard" ? 3 : rating === "good" ? 4 : 5; /* easy */

  ease = Math.max(
    1.3,
    ease + (0.1 - (5 - quality) * (0.08 + (5 - quality) * 0.02)),
  );

  if (repetitions === 0) {
    interval = rating === "hard" ? 0.5 : 1;
  } else if (repetitions === 1) {
    interval = rating === "hard" ? 1 : rating === "good" ? 3 : 4;
  } else {
    const factor =
      rating === "hard" ? Math.max(1.2, ease - 0.15) : rating === "good" ? ease : ease * 1.3;
    interval = Math.round(interval * factor * 10) / 10;
  }

  repetitions += 1;

  return {
    ...card,
    ease,
    interval,
    repetitions,
    due: now + interval * DAY_MS,
  };
}

export function isDue(card: Flashcard, now = Date.now()): boolean {
  return card.due <= now;
}

export function sortForReview(cards: Flashcard[], now = Date.now()): Flashcard[] {
  return [...cards].sort((a, b) => {
    const aDue = isDue(a, now) ? 0 : 1;
    const bDue = isDue(b, now) ? 0 : 1;
    if (aDue !== bDue) return aDue - bDue;
    return a.due - b.due;
  });
}
