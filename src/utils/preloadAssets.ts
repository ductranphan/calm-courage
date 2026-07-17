/**
 * Loads bundled images before the application UI appears.
 */

import { Asset } from "expo-asset";

const bundledImages = [
  require("../../assets/images/lion.png"),
  require("../../assets/images/koala.png"),
  require("../../assets/images/panda.png"),
  require("../../assets/images/rabbit.png"),

  require("../../assets/images/happy.jpg"),
  require("../../assets/images/nervous.jpg"),
  require("../../assets/images/excited.jpg"),
  require("../../assets/images/sad.jpg"),
  require("../../assets/images/frustrated.jpg"),
  require("../../assets/images/calm.jpg"),
  require("../../assets/images/proud.jpg"),

  require("../../assets/images/pass-device.jpg"),
  require("../../assets/images/logo.png"),
];

export async function preloadImages(): Promise<void> {
  await Asset.loadAsync(bundledImages);
}