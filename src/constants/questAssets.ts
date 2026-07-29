/**
 * Quest Board image registry and preload helper.
 *
 * The exported image references are shared by the Quest Board screen and
 * the root asset loader. Preloading them during app startup prevents the
 * quest cards from briefly appearing without their illustrations.
 */

import { Asset } from "expo-asset";
import type { ImageSourcePropType } from "react-native";

/**
 * Central image map used by the Quest Board.
 *
 * Keeping the require calls in one place ensures that preloading and
 * rendering use the same bundled asset references.
 */
export const questImages = {
  confidenceClimb: require(
    "../../assets/images/quest-confidence-climb.png",
  ),

  kindnessRanger: require(
    "../../assets/images/quest-kindness-ranger.png",
  ),

  emotionExplorer: require(
    "../../assets/images/quest-emotion-explorer.png",
  ),

  gratitudeGarden: require(
    "../../assets/images/quest-gratitude-garden.png",
  ),
} satisfies Record<
  string,
  ImageSourcePropType
>;

/**
 * Flat list passed to Expo Asset when the application starts.
 */
export const questImageModules = [
  questImages.confidenceClimb,
  questImages.kindnessRanger,
  questImages.emotionExplorer,
  questImages.gratitudeGarden,
];

/*
 * Stores the current preload operation so multiple callers do not start
 * separate downloads for the same assets.
 */
let questImagesPreloadPromise:
  | Promise<Asset[]>
  | null = null;

/**
 * Loads the Quest Board illustrations into Expo's local asset cache.
 *
 * The same promise is returned while loading is in progress. When loading
 * fails, the stored promise is cleared so a later call can retry.
 */
export function preloadQuestImages(): Promise<
  Asset[]
> {
  if (!questImagesPreloadPromise) {
    questImagesPreloadPromise =
      Asset.loadAsync(
        questImageModules,
      ).catch((error: unknown) => {
        questImagesPreloadPromise = null;
        throw error;
      });
  }

  return questImagesPreloadPromise;
}