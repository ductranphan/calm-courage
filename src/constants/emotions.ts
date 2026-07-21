/**
 * Emotion options used across the app.
 *
 * The backend saves only the emotion id, for example:
 * "happy", "nervous", "sad".
 *
 * The frontend uses the id to show the correct label and image.
 */

import type { ImageSourcePropType } from "react-native";

export const emotions = [
  {
    id: "happy",
    label: "Happy",
    image: require("../../assets/images/happy.jpg"),
  },
  {
    id: "nervous",
    label: "Nervous",
    image: require("../../assets/images/nervous.jpg"),
  },
  {
    id: "excited",
    label: "Excited",
    image: require("../../assets/images/excited.jpg"),
  },
  {
    id: "sad",
    label: "Sad",
    image: require("../../assets/images/sad.jpg"),
  },
  {
    id: "frustrated",
    label: "Frustrated",
    image: require("../../assets/images/frustrated.jpg"),
  },
  {
    id: "calm",
    label: "Calm",
    image: require("../../assets/images/calm.jpg"),
  },
  {
    id: "proud",
    label: "Proud",
    image: require("../../assets/images/proud.jpg"),
  },
] as const;

export type EmotionId = (typeof emotions)[number]["id"];

export const defaultEmotionId: EmotionId = "nervous";

export const emotionImages: Record<EmotionId, ImageSourcePropType> = {
  happy: require("../../assets/images/happy.jpg"),
  nervous: require("../../assets/images/nervous.jpg"),
  excited: require("../../assets/images/excited.jpg"),
  sad: require("../../assets/images/sad.jpg"),
  frustrated: require("../../assets/images/frustrated.jpg"),
  calm: require("../../assets/images/calm.jpg"),
  proud: require("../../assets/images/proud.jpg"),
};

export const emotionLabels: Record<EmotionId, string> = {
  happy: "Happy",
  nervous: "Nervous",
  excited: "Excited",
  sad: "Sad",
  frustrated: "Frustrated",
  calm: "Calm",
  proud: "Proud",
};

export function isEmotionId(value: unknown): value is EmotionId {
  return emotions.some((emotion) => emotion.id === value);
}

export function normalizeEmotionId(value: unknown): EmotionId {
  if (typeof value !== "string") {
    return defaultEmotionId;
  }

  const normalized = value.trim().toLowerCase();

  if (isEmotionId(normalized)) {
    return normalized;
  }

  return defaultEmotionId;
}

export function formatEmotionLabel(value: unknown): string {
  const emotionId = normalizeEmotionId(value);
  return emotionLabels[emotionId];
}

export function getEmotionImage(value: unknown): ImageSourcePropType {
  const emotionId = normalizeEmotionId(value);
  return emotionImages[emotionId];
}