/**
 * Preset avatar options for child profiles.
 */
export const avatars = [
  { id: "bear", label: "Bear", emoji: "🐻", color: "#E6D8EB" },
  { id: "bunny", label: "Bunny", emoji: "🐰", color: "#EAF7FA" },
  { id: "star", label: "Star", emoji: "⭐", color: "#FFF4CC" },
  { id: "heart", label: "Heart", emoji: "💜", color: "#FFD6E8" },
] as const;

export type AvatarId = (typeof avatars)[number]["id"];
