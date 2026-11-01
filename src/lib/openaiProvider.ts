import type {
  Flashcard,
  FrameworkNode,
  GenerationProvider,
  KeyPoint,
} from "./types";

function uid(prefix: string): string {
  return `${prefix}_${Math.random().toString(36).slice(2, 10)}`;
}

async function chatJson(system: string, user: string): Promise<unknown> {
  const key = process.env.OPENAI_API_KEY;
  if (!key) throw new Error("OPENAI_API_KEY missing");
  const model = process.env.OPENAI_MODEL || "gpt-4o-mini";

  const res = await fetch("https://api.openai.com/v1/chat/completions", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${key}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      model,
      temperature: 0.3,
      response_format: { type: "json_object" },
      messages: [
        { role: "system", content: system },
        { role: "user", content: user },
      ],
    }),
  });

  if (!res.ok) {
    const body = await res.text();
    throw new Error(`OpenAI HTTP ${res.status}: ${body.slice(0, 200)}`);
  }

  const data = (await res.json()) as {
    choices?: { message?: { content?: string } }[];
  };
  const content = data.choices?.[0]?.message?.content;
  if (!content) throw new Error("OpenAI empty response");
  return JSON.parse(content);
}

export const openaiProvider: GenerationProvider = {
  async generateKeyPoints(noteId, content) {
    const raw = (await chatJson(
      'Extract up to 12 distinct key study points from the learner notes. Return JSON: {"points":["..."]}. Each point one sentence. Stay grounded in the notes.',
      content.slice(0, 12000),
    )) as { points?: string[] };

    const points = (raw.points ?? []).filter((p) => typeof p === "string" && p.trim());
    if (!points.length) throw new Error("OpenAI returned no key points");
    return points.slice(0, 12).map((text) => ({
      id: uid("kp"),
      noteId,
      text: text.trim(),
    }));
  },

  async generateFramework(noteId, content, keyPoints) {
    const raw = (await chatJson(
      'Build a hierarchical knowledge framework for study notes. Return JSON: {"label":"root","children":[{"label":"...","children":[{"label":"...","keyPointIndex":0}]}]}. keyPointIndex refers to the provided key points array (0-based). Max depth 3.',
      JSON.stringify({
        notesExcerpt: content.slice(0, 6000),
        keyPoints: keyPoints.map((k, i) => ({ index: i, text: k.text })),
      }),
    )) as FrameworkNode & { children?: unknown[] };

    // Attach keyPointIds from keyPointIndex if present
    const attach = (node: Record<string, unknown>): FrameworkNode => {
      const kids = Array.isArray(node.children)
        ? (node.children as Record<string, unknown>[]).map(attach)
        : undefined;
      let keyPointIds: string[] | undefined;
      if (typeof node.keyPointIndex === "number") {
        const kp = keyPoints[node.keyPointIndex];
        if (kp) keyPointIds = [kp.id];
      }
      return {
        id: uid("node"),
        label: String(node.label || "Topic"),
        children: kids,
        keyPointIds,
      };
    };

    const root = attach(raw as unknown as Record<string, unknown>);
    root.label = root.label || "Knowledge framework";
    return { noteId, root };
  },

  async generateFlashcards(noteId, keyPoints) {
    const raw = (await chatJson(
      'Create one flashcard per key point. Return JSON: {"cards":[{"keyPointIndex":0,"question":"...","answer":"..."}]}. Questions should test understanding; answers concise.',
      JSON.stringify({
        keyPoints: keyPoints.map((k, i) => ({ index: i, text: k.text })),
      }),
    )) as {
      cards?: { keyPointIndex?: number; question?: string; answer?: string }[];
    };

    const now = Date.now();
    const cards: Flashcard[] = [];
    for (let i = 0; i < keyPoints.length; i++) {
      const kp = keyPoints[i];
      const found = raw.cards?.find((c) => c.keyPointIndex === i) ?? raw.cards?.[i];
      cards.push({
        id: uid("card"),
        noteId,
        keyPointId: kp.id,
        question: (found?.question || `Explain: ${kp.text.slice(0, 80)}`).trim(),
        answer: (found?.answer || kp.text).trim(),
        ease: 2.5,
        interval: 0,
        repetitions: 0,
        due: now,
      });
    }
    if (!cards.length) throw new Error("OpenAI returned no flashcards");
    return cards;
  },
};
