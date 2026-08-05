/**
 * Playable Level-1 content for child game hubs.
 *
 * Each level maps to a Phase 1 catalog activity so finishing the game
 * advances the parent dashboard progress bar and awards stars/gems once.
 */

import type { CatalogActivity } from "@/constants/activities";
import { ACTIVITIES_BY_ID } from "@/constants/activities";

export type GameType =
  | "scenario"
  | "emotion_puzzle"
  | "roleplay"
  | "confidence"
  | "brave_breath";

export type GameChoice = {
  id: string;
  label: string;
  correct: boolean;
};

export type GameLevel = {
  id: string;
  gameType: GameType;
  levelNumber: number;
  title: string;
  prompt: string;
  choices: GameChoice[];
  successMessage: string;
  /** Phase 1 catalog activity completed when this level is finished. */
  activityId: string;
  hubRoute:
    | "/scenario-challenges"
    | "/emotion-puzzle"
    | "/roleplay-challenges"
    | "/confidence-quests"
    | "/child-dashboard";
};

export const GAME_LEVELS: GameLevel[] = [
  {
    id: "scenario-1",
    gameType: "scenario",
    levelNumber: 1,
    title: "Scenario 1",
    prompt:
      "Your friend looks sad at recess. What is a brave first step?",
    choices: [
      {
        id: "a",
        label: "Ask if they want to talk",
        correct: true,
      },
      {
        id: "b",
        label: "Ignore them and keep playing",
        correct: false,
      },
      {
        id: "c",
        label: "Tell everyone they are sad",
        correct: false,
      },
    ],
    successMessage:
      "Nice courage! Trying something kind and new earns stars.",
    activityId: "phase1_try_something_new",
    hubRoute: "/scenario-challenges",
  },
  {
    id: "emotion-puzzle-1",
    gameType: "emotion_puzzle",
    levelNumber: 1,
    title: "Activity 1",
    prompt:
      "When your tummy feels tight before a test, which calm tool helps most?",
    choices: [
      {
        id: "a",
        label: "Take three brave breaths",
        correct: true,
      },
      {
        id: "b",
        label: "Hold your breath until it passes",
        correct: false,
      },
      {
        id: "c",
        label: "Yell so the feeling goes away",
        correct: false,
      },
    ],
    successMessage:
      "Brave Breath unlocked! Calm tools help feelings shrink.",
    activityId: "phase1_brave_breath",
    hubRoute: "/emotion-puzzle",
  },
  {
    id: "roleplay-1",
    gameType: "roleplay",
    levelNumber: 1,
    title: "Activity 1",
    prompt:
      "Someone bumps into you by accident. What kind words can you use?",
    choices: [
      {
        id: "a",
        label: "It's okay — accidents happen",
        correct: true,
      },
      {
        id: "b",
        label: "You always ruin everything",
        correct: false,
      },
      {
        id: "c",
        label: "I will never talk to you again",
        correct: false,
      },
    ],
    successMessage:
      "Kind words build connection. Great roleplay!",
    activityId: "phase1_kind_words",
    hubRoute: "/roleplay-challenges",
  },
  {
    id: "confidence-1",
    gameType: "confidence",
    levelNumber: 1,
    title: "Mini Session 1",
    prompt:
      "Think of something you did that made you proud. Which is true?",
    choices: [
      {
        id: "a",
        label: "Small brave steps still count",
        correct: true,
      },
      {
        id: "b",
        label: "Only perfect wins count",
        correct: false,
      },
      {
        id: "c",
        label: "Proud moments must be huge",
        correct: false,
      },
    ],
    successMessage:
      "Proud Moment celebrated! Your confidence is growing.",
    activityId: "phase1_proud_moment",
    hubRoute: "/confidence-quests",
  },
];

export const GAME_LEVELS_BY_ID: Record<string, GameLevel> =
  Object.fromEntries(
    GAME_LEVELS.map((level) => [level.id, level]),
  );

export function getGameLevelId(
  gameType: GameType,
  levelNumber: number,
): string {
  switch (gameType) {
    case "scenario":
      return `scenario-${levelNumber}`;
    case "emotion_puzzle":
      return `emotion-puzzle-${levelNumber}`;
    case "roleplay":
      return `roleplay-${levelNumber}`;
    case "confidence":
      return `confidence-${levelNumber}`;
    case "brave_breath":
      return `brave-breath-${levelNumber}`;
    default:
      return `${gameType}-${levelNumber}`;
  }
}

export function getGameLevel(
  gameType: GameType,
  levelNumber: number,
): GameLevel | null {
  return (
    GAME_LEVELS_BY_ID[
      getGameLevelId(gameType, levelNumber)
    ] ?? null
  );
}

export function getCatalogActivityForLevel(
  level: GameLevel,
): CatalogActivity | null {
  return ACTIVITIES_BY_ID[level.activityId] ?? null;
}
