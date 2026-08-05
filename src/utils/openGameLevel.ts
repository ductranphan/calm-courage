/**
 * Shared navigation helper for child game hub screens.
 */

import { router, type Href } from "expo-router";
import { Alert } from "react-native";

import {
  getGameLevel,
  type GameType,
} from "@/constants/gameLevels";

export function openGameLevel(
  gameType: GameType,
  levelNumber: number,
): void {
  const level = getGameLevel(gameType, levelNumber);

  if (!level) {
    Alert.alert(
      "Coming Soon",
      "More challenges unlock as you grow. Try Level 1 for now!",
    );
    return;
  }

  router.push({
    pathname: "/play-activity",
    params: {
      levelId: level.id,
      gameType: level.gameType,
    },
  } as unknown as Href);
}
