/**
 * Preset avatar companions used by the frontend.
 */

import type { ImageSourcePropType } from "react-native";

export const avatars = [
  {
    id: "brave_lion",
    label: "Brave Lion",
    emoji: "",
    color: "#FFF4CC",
    image: require("../../assets/images/lion.png"),
  },
  {
    id: "calm_koala",
    label: "Calm Koala",
    emoji: "",
    color: "#EAF7FA",
    image: require("../../assets/images/koala.png"),
  },
  {
    id: "friendly_panda",
    label: "Friendly Panda",
    emoji: "",
    color: "#F1F3F5",
    image: require("../../assets/images/panda.png"),
  },
  {
    id: "lovely_rabbit",
    label: "Lovely Rabbit",
    emoji: "",
    color: "#FFD6E8",
    image: require("../../assets/images/rabbit.png"),
  },
] as const;

export type AvatarId = (typeof avatars)[number]["id"];

export const defaultAvatarId: AvatarId = "friendly_panda";

export const avatarImages: Record<AvatarId, ImageSourcePropType> = {
  brave_lion: require("../../assets/images/lion.png"),
  calm_koala: require("../../assets/images/koala.png"),
  friendly_panda: require("../../assets/images/panda.png"),
  lovely_rabbit: require("../../assets/images/rabbit.png"),
};

export function isAvatarId(value: unknown): value is AvatarId {
  return avatars.some((avatar) => avatar.id === value);
}

export function normalizeAvatarId(value: unknown): AvatarId {
  if (isAvatarId(value)) {
    return value;
  }

  if (value === "lion") {
    return "brave_lion";
  }

  if (value === "koala") {
    return "calm_koala";
  }

  if (value === "panda" || value === "bear") {
    return "friendly_panda";
  }

  if (value === "rabbit" || value === "bunny") {
    return "lovely_rabbit";
  }

  return defaultAvatarId;
}