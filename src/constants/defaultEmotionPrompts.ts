/**
 * Default emotion encouragement copy.
 *
 * Used when Firestore emotionPrompts/{id} is missing so the child
 * flow still works before/without a seed deploy. Firestore remains
 * the editable source of truth when documents exist.
 */

import type { EmotionId } from "@/constants/emotions";

export type DefaultEmotionPrompt = {
  title: string;
  body: string[];
  question: string;
  ctaLabel: string;
  enabled: boolean;
  sortOrder: number;
};

export const DEFAULT_EMOTION_PROMPTS: Record<
  EmotionId,
  DefaultEmotionPrompt
> = {
  happy: {
    title: "Happy",
    body: [
      "Feeling happy is wonderful. Notice what helped you feel this way.",
      "You can share that joy with someone you trust, or keep it as a quiet warm feeling inside.",
    ],
    question: "What is one thing that made you smile today?",
    ctaLabel: "Continue",
    enabled: true,
    sortOrder: 1,
  },
  nervous: {
    title: "Nervous",
    body: [
      "Feeling nervous is okay. It means something matters to you.",
      "Take a slow breath in and a longer breath out. You can face this one small step at a time.",
    ],
    question: "What is one tiny step that might help right now?",
    ctaLabel: "Continue",
    enabled: true,
    sortOrder: 2,
  },
  excited: {
    title: "Excited",
    body: [
      "Excitement is full of energy. Enjoy that spark.",
      "You can use that energy to try something brave, or to celebrate something good coming up.",
    ],
    question: "What are you most excited about?",
    ctaLabel: "Continue",
    enabled: true,
    sortOrder: 3,
  },
  sad: {
    title: "Sad",
    body: [
      "It is okay to feel sad. Your feelings are real and important.",
      "You do not have to fix everything right away. Being gentle with yourself is a courageous choice.",
    ],
    question: "Who or what helps you feel a little safer when you are sad?",
    ctaLabel: "Continue",
    enabled: true,
    sortOrder: 4,
  },
  frustrated: {
    title: "Frustrated",
    body: [
      "Frustration often shows up when you care and something feels stuck.",
      "Pause for a moment. You can name the problem, then choose one calm next move.",
    ],
    question: "What is frustrating you the most right now?",
    ctaLabel: "Continue",
    enabled: true,
    sortOrder: 5,
  },
  calm: {
    title: "Calm",
    body: [
      "Calm is a strong feeling too. Your body and mind feel steady.",
      "Notice what helped you feel this way so you can return to it when you need it.",
    ],
    question: "What helps you stay calm?",
    ctaLabel: "Continue",
    enabled: true,
    sortOrder: 6,
  },
  proud: {
    title: "Proud",
    body: [
      "Feeling proud means you did something that took courage or effort.",
      "Take a moment to celebrate yourself. You earned this feeling.",
    ],
    question: "What are you proud of today?",
    ctaLabel: "Continue",
    enabled: true,
    sortOrder: 7,
  },
};
