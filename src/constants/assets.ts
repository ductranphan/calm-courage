/**
 * Shared image assets.
 */

export const buddyImages = {
  lion: require("../../assets/images/lion.png"),
  koala: require("../../assets/images/koala.png"),
  panda: require("../../assets/images/panda.png"),
  rabbit: require("../../assets/images/rabbit.png"),
};

export type BuddyId = keyof typeof buddyImages;

export const defaultBuddyId: BuddyId = "panda";

export const passDeviceImage = require("../../assets/images/pass-device.jpg");

export const imagesToPreload = [
  buddyImages.lion,
  buddyImages.koala,
  buddyImages.panda,
  buddyImages.rabbit,
  passDeviceImage,
];