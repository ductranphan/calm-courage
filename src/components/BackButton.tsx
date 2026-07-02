/**
 * Reusable back button.
 *
 * Uses Expo Router to navigate back to the previous screen.
 * The icon comes from the exported Figma SVG assets.
 */
import { Pressable } from "react-native";
import { router } from "expo-router";

import BackIcon from "../../assets/icons/back.svg";

export default function BackButton() {
  return (
    <Pressable
      onPress={() => router.back()}
      style={{
        position: "absolute",
        top: 60,
        left: 25,
      }}
    >
      <BackIcon width={32} height={32} />
    </Pressable>
  );
}
