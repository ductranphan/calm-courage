/**
 * Preset avatar options for child profiles.
 *
 * These IDs are saved in Firestore as avatarId.
 */

import type { ImageSourcePropType } from "react-native";

export const avatars = [
  {
    id: "lion",
    label: "Lion",
    image: require("../../assets/images/lion.png"),
  },
  {
    id: "koala",
    label: "Koala",
    image: require("../../assets/images/koala.png"),
  },
  {
    id: "panda",
    label: "Panda",
    image: require("../../assets/images/panda.png"),
  },
  {
    id: "rabbit",
    label: "Rabbit",
    image: require("../../assets/images/rabbit.png"),
  },
] as const;

export type AvatarId = (typeof avatars)[number]["id"];

export const defaultAvatarId: AvatarId = "panda";

export const avatarImages: Record<AvatarId, ImageSourcePropType> = {
  lion: require("../../assets/images/lion.png"),
  koala: require("../../assets/images/koala.png"),
  panda: require("../../assets/images/panda.png"),
  rabbit: require("../../assets/images/rabbit.png"),
};

export function isAvatarId(value: unknown): value is AvatarId {
  return (
    value === "lion" ||
    value === "koala" ||
    value === "panda" ||
    value === "rabbit"
  );
}

export function normalizeAvatarId(value: unknown): AvatarId {
  if (isAvatarId(value)) {
    return value;
  }

  // Safety for old backend/mock values.
  if (value === "bear") return "panda";
  if (value === "bunny") return "rabbit";

  return defaultAvatarId;
}