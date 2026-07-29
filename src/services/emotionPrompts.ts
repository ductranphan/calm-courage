/**
 * Shared emotion encouragement content service.
 *
 * Prompts are stored in Firestore under:
 * emotionPrompts/{emotionId}
 */

import { doc, getDoc } from "firebase/firestore";

import { db } from "@/config/firebase";
import { type EmotionId } from "@/constants/emotions";

export type EmotionPrompt = {
  id: EmotionId;
  title: string;
  body: string[];
  question: string;
  ctaLabel: string;
  enabled: boolean;
  sortOrder: number;
};

function isStringArray(value: unknown): value is string[] {
  return (
    Array.isArray(value) &&
    value.every(
      (item) => typeof item === "string" && item.trim().length > 0,
    )
  );
}

/**
 * Reads and validates one emotion prompt.
 *
 * Returning null means the document does not exist. Invalid documents throw
 * an error so configuration mistakes are not silently displayed to children.
 */
export async function getEmotionPrompt(
  emotionId: EmotionId,
): Promise<EmotionPrompt | null> {
  const snapshot = await getDoc(
    doc(db, "emotionPrompts", emotionId),
  );

  if (!snapshot.exists()) {
    return null;
  }

  const data = snapshot.data() as Record<string, unknown>;

  if (
    typeof data.title !== "string" ||
    !data.title.trim() ||
    !isStringArray(data.body) ||
    typeof data.question !== "string" ||
    !data.question.trim() ||
    typeof data.ctaLabel !== "string" ||
    !data.ctaLabel.trim() ||
    typeof data.enabled !== "boolean" ||
    typeof data.sortOrder !== "number"
  ) {
    throw new Error(
      `Emotion prompt "${emotionId}" has missing or invalid fields.`,
    );
  }

  return {
    id: emotionId,
    title: data.title.trim(),
    body: data.body.map((paragraph) => paragraph.trim()),
    question: data.question.trim(),
    ctaLabel: data.ctaLabel.trim(),
    enabled: data.enabled,
    sortOrder: data.sortOrder,
  };
}