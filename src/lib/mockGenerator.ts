import type {
  Flashcard,
  Framework,
  FrameworkNode,
  GenerationProvider,
  KeyPoint,
} from "./types";

const STOP = new Set([
  "the",
  "a",
  "an",
  "and",
  "or",
  "but",
  "in",
  "on",
  "at",
  "to",
  "for",
  "of",
  "is",
  "are",
  "was",
  "were",
  "be",
  "been",
  "being",
  "have",
  "has",
  "had",
  "do",
  "does",
  "did",
  "will",
  "would",
  "could",
  "should",
  "may",
  "might",
  "must",
  "shall",
  "can",
  "this",
  "that",
  "these",
  "those",
  "it",
  "its",
  "as",
  "by",
  "with",
  "from",
  "into",
  "about",
  "than",
  "then",
  "so",
  "if",
  "not",
  "no",
  "yes",
  "we",
  "you",
  "they",
  "he",
  "she",
  "i",
  "our",
  "your",
  "their",
]);

function uid(prefix: string): string {
  return `${prefix}_${Math.random().toString(36).slice(2, 10)}`;
}

function splitSentences(text: string): string[] {
  return text
    .replace(/\r\n/g, "\n")
    .split(/(?<=[.!?。！？])\s+|\n+/)
    .map((s) => s.trim())
    .filter((s) => s.length >= 20);
}

function tokenize(s: string): string[] {
  return s
    .toLowerCase()
    .replace(/[^a-z0-9\u4e00-\u9fff\s-]/gi, " ")
    .split(/\s+/)
    .filter((t) => t.length > 2 && !STOP.has(t));
}

function scoreSentence(sentence: string, index: number, freq: Map<string, number>): number {
  const tokens = tokenize(sentence);
  const uniqueness = new Set(tokens).size;
  const keywordScore = tokens.reduce((acc, t) => acc + (freq.get(t) ?? 0), 0);
  const positionBonus = index < 3 ? 3 : index < 8 ? 1.5 : 0;
  const lengthPenalty = sentence.length > 220 ? -2 : 0;
  return uniqueness * 0.8 + keywordScore * 0.15 + positionBonus + lengthPenalty;
}

function nearDuplicate(a: string, b: string): boolean {
  const ta = new Set(tokenize(a));
  const tb = tokenize(b);
  if (ta.size === 0 || tb.length === 0) return false;
  let overlap = 0;
  for (const t of tb) if (ta.has(t)) overlap++;
  const ratio = overlap / Math.max(ta.size, tb.length);
  return ratio >= 0.72;
}

function buildFreq(sentences: string[]): Map<string, number> {
  const freq = new Map<string, number>();
  for (const s of sentences) {
    for (const t of tokenize(s)) freq.set(t, (freq.get(t) ?? 0) + 1);
  }
  return freq;
}

function topTopicLabels(keyPoints: KeyPoint[], limit = 4): string[] {
  const freq = new Map<string, number>();
  for (const kp of keyPoints) {
    for (const t of tokenize(kp.text)) freq.set(t, (freq.get(t) ?? 0) + 1);
  }
  return [...freq.entries()]
    .sort((a, b) => b[1] - a[1])
    .slice(0, limit)
    .map(([w]) => w.replace(/^\w/, (c) => c.toUpperCase()));
}

export const mockGenerator: GenerationProvider = {
  async generateKeyPoints(noteId, content) {
    const sentences = splitSentences(content);
    if (sentences.length === 0) {
      const fallback = content.trim().slice(0, 160) || "Study this topic carefully.";
      return [
        {
          id: uid("kp"),
          noteId,
          text: fallback.endsWith(".") ? fallback : `${fallback}.`,
        },
      ];
    }
    const freq = buildFreq(sentences);
    const ranked = sentences
      .map((text, index) => ({ text, index, score: scoreSentence(text, index, freq) }))
      .sort((a, b) => b.score - a.score);

    const selected: string[] = [];
    for (const item of ranked) {
      if (selected.some((s) => nearDuplicate(s, item.text))) continue;
      selected.push(item.text.replace(/\s+/g, " ").trim());
      if (selected.length >= 12) break;
    }

    return selected.map((text) => ({
      id: uid("kp"),
      noteId,
      text: text.length > 180 ? `${text.slice(0, 177)}…` : text,
    }));
  },

  async generateFramework(noteId, _content, keyPoints) {
    const topics = topTopicLabels(keyPoints, Math.min(4, Math.max(2, Math.ceil(keyPoints.length / 3))));
    const buckets: { label: string; ids: string[]; labels: string[] }[] = topics.map(
      (label) => ({ label, ids: [], labels: [] }),
    );
    const other = { label: "Other concepts", ids: [] as string[], labels: [] as string[] };

    for (const kp of keyPoints) {
      const tokens = new Set(tokenize(kp.text));
      let best = -1;
      let bestScore = 0;
      topics.forEach((topic, i) => {
        const stem = topic.toLowerCase();
        if (tokens.has(stem) || kp.text.toLowerCase().includes(stem)) {
          const score = (freqBoost(tokens, stem) || 1) + 1;
          if (score > bestScore) {
            bestScore = score;
            best = i;
          }
        }
      });
      const target = best >= 0 ? buckets[best] : other;
      target.ids.push(kp.id);
      target.labels.push(kp.text);
    }

    const children: FrameworkNode[] = [...buckets, other]
      .filter((b) => b.ids.length > 0)
      .map((b) => ({
        id: uid("node"),
        label: b.label,
        children: b.labels.map((label, i) => ({
          id: uid("leaf"),
          label: truncate(label, 90),
          keyPointIds: [b.ids[i]],
        })),
      }));

    const root: FrameworkNode = {
      id: uid("root"),
      label: "Knowledge framework",
      children:
        children.length > 0
          ? children
          : [
              {
                id: uid("leaf"),
                label: "No structure yet — paste richer notes",
                keyPointIds: keyPoints.map((k) => k.id),
              },
            ],
    };

    return { noteId, root };
  },

  async generateFlashcards(noteId, keyPoints) {
    const now = Date.now();
    return keyPoints.map((kp) => {
      const { question, answer } = toQA(kp.text);
      const card: Flashcard = {
        id: uid("card"),
        noteId,
        keyPointId: kp.id,
        question,
        answer,
        ease: 2.5,
        interval: 0,
        repetitions: 0,
        due: now,
      };
      return card;
    });
  },
};

function freqBoost(tokens: Set<string>, stem: string): number {
  return tokens.has(stem) ? 2 : 0;
}

function truncate(s: string, n: number): string {
  return s.length > n ? `${s.slice(0, n - 1)}…` : s;
}

function toQA(text: string): { question: string; answer: string } {
  const clean = text.replace(/\s+/g, " ").trim();
  // Definition-like: "X is Y"
  const m = clean.match(/^(.{3,60}?)\s+(is|are|means|refers to)\s+(.+)$/i);
  if (m) {
    return {
      question: `What ${m[2].toLowerCase() === "are" ? "are" : "is"} ${m[1].trim()}?`,
      answer: m[3].replace(/[.。]+$/, ""),
    };
  }
  const tokens = tokenize(clean).slice(0, 4);
  const hint = tokens.length ? tokens.join(" / ") : "this idea";
  return {
    question: `Explain the key idea about: ${hint}`,
    answer: clean.length > 220 ? `${clean.slice(0, 217)}…` : clean,
  };
}
