/**
 * Preloads local raster images used throughout the app.
 *
 * Loading these assets once during app startup prevents
 * visible image delays when navigating between screens.
 *
 * SVG assets do not need to be included here because they
 * are imported as React components and bundled with the app.
 */

import { Asset } from "expo-asset";

const APP_IMAGES = [
  /*
   * Child avatars
   */
  require("../../assets/images/lion.png"),
  require("../../assets/images/koala.png"),
  require("../../assets/images/panda.png"),
  require("../../assets/images/rabbit.png"),

  /*
   * Daily emotion images
   */
  require("../../assets/images/happy.jpg"),
  require("../../assets/images/nervous.jpg"),
  require("../../assets/images/excited.jpg"),
  require("../../assets/images/sad.jpg"),
  require("../../assets/images/frustrated.jpg"),
  require("../../assets/images/calm.jpg"),
  require("../../assets/images/proud.jpg"),

  /*
   * General app images
   */
  require("../../assets/images/pass-device.jpg"),
  require("../../assets/images/logo.png"),

  /*
   * Choose Your Courage
   */
  require(
    "../../assets/images/scenarios/scenario-front-template.png",
  ),

  /*
   * Emotion Match
   */
  require(
    "../../assets/images/emotion-match/emotion-match-front-template.png",
  ),

  require(
    "../../assets/images/emotion-match/emotion-match-text-template.png",
  ),

  /*
   * Roleplay templates
   */
  require(
    "../../assets/images/roleplay/roleplay-front-template.png",
  ),

  require(
    "../../assets/images/roleplay/roleplay-back-template.png",
  ),

  /*
   * Roleplay illustrations
   */
  require(
    "../../assets/images/roleplay/roleplay-01.png",
  ),

  require(
    "../../assets/images/roleplay/roleplay-02.png",
  ),

  require(
    "../../assets/images/roleplay/roleplay-03.png",
  ),

  require(
    "../../assets/images/roleplay/roleplay-04.png",
  ),

  require(
    "../../assets/images/roleplay/roleplay-05.png",
  ),

  require(
    "../../assets/images/roleplay/roleplay-06.png",
  ),

  require(
    "../../assets/images/roleplay/roleplay-07.png",
  ),

  require(
    "../../assets/images/roleplay/roleplay-08.png",
  ),

  require(
    "../../assets/images/roleplay/roleplay-09.png",
  ),

  require(
    "../../assets/images/roleplay/roleplay-10.png",
  ),
];

/**
 * Downloads and caches the app's local raster assets.
 */
export async function preloadImages(): Promise<void> {
  await Asset.loadAsync(
    APP_IMAGES,
  );
}