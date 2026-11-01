import { NextResponse } from "next/server";
import { mockGenerator } from "@/lib/mockGenerator";
import { openaiProvider } from "@/lib/openaiProvider";
import type {
  Flashcard,
  Framework,
  GenerateRequest,
  GenerateResponse,
  GenerationProvider,
  KeyPoint,
} from "@/lib/types";


const MAX_CHARS = 100_000;

export async function POST(req: Request) {
  let body: GenerateRequest;
  try {
    body = (await req.json()) as GenerateRequest;
  } catch {
    return NextResponse.json({ error: "Invalid JSON body" }, { status: 400 });
  }

  const content = (body.content ?? "").trim();
  const noteId = (body.noteId ?? "").trim();
  if (!noteId || !content) {
    return NextResponse.json(
      { error: "noteId and non-empty content are required" },
      { status: 400 },
    );
  }
  if (content.length > MAX_CHARS) {
    return NextResponse.json({ error: "Note too large" }, { status: 400 });
  }

  const hasKey = Boolean(process.env.OPENAI_API_KEY?.trim());
  let providerName: GenerateResponse["provider"] = hasKey ? "openai" : "mock";
  let fallback = false;
  let provider: GenerationProvider = hasKey ? openaiProvider : mockGenerator;

  let keyPoints: KeyPoint[];
  let framework: Framework;
  let flashcards: Flashcard[];

  try {
    keyPoints = await provider.generateKeyPoints(noteId, content);
  } catch (err) {
    if (providerName === "openai") {
      fallback = true;
      providerName = "mock";
      provider = mockGenerator;
      keyPoints = await provider.generateKeyPoints(noteId, content);
    } else {
      throw err;
    }
  }

  try {
    framework = await provider.generateFramework(noteId, content, keyPoints);
  } catch (err) {
    if (hasKey && !fallback) {
      fallback = true;
      providerName = "mock";
      framework = await mockGenerator.generateFramework(noteId, content, keyPoints);
    } else if (providerName === "openai") {
      fallback = true;
      providerName = "mock";
      framework = await mockGenerator.generateFramework(noteId, content, keyPoints);
    } else {
      throw err;
    }
  }

  try {
    flashcards = await provider.generateFlashcards(noteId, keyPoints);
  } catch (err) {
    if (hasKey) {
      fallback = true;
      providerName = "mock";
      flashcards = await mockGenerator.generateFlashcards(noteId, keyPoints);
    } else {
      throw err;
    }
  }

  const response: GenerateResponse = {
    keyPoints,
    framework,
    flashcards,
    provider: providerName,
    fallback: fallback || undefined,
  };

  return NextResponse.json(response);
}
