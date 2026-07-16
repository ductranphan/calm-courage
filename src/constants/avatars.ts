/**
 * Preset avatar companions for child profiles (Screen 3.1).
 *
 * IDs match the product slides:
 * brave_lion | calm_koala | friendly_panda | lovely_rabbit
 */
export const avatars = [
  { id: "brave_lion", label: "Brave Lion", emoji: "🦁", color: "#FFF4CC" },
  { id: "calm_koala", label: "Calm Koala", emoji: "🐨", color: "#EAF7FA" },
  { id: "friendly_panda", label: "Friendly Panda", emoji: "🐼", color: "#F1F3F5" },
  { id: "lovely_rabbit", label: "Lovely Rabbit", emoji: "🐰", color: "#FFD6E8" },
] as const;

export type AvatarId = (typeof avatars)[number]["id"];
