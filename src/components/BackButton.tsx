/**
 * Reusable back button.
 *
 * Uses Expo Router to navigate back to the previous screen.
 * The icon comes from the exported Figma SVG assets.
 */

import { Pressable, StyleSheet } from "react-native";
import { router, type Href } from "expo-router";

import BackIcon from "../../assets/icons/back.svg";

type Props = {
  fallback?: Href;
};

export default function BackButton({ fallback = "/" }: Props) {
  function handlePress() {
    if (router.canGoBack()) {
      router.back();
    } else {
      router.replace(fallback);
    }
  }

  return (
    <Pressable onPress={handlePress} style={styles.button}>
      <BackIcon width={37.24} height={22.18} />
    </Pressable>
  );
}

const styles = StyleSheet.create({
  button: {
    position: "absolute",
    left: 30,
    top: 90,
    zIndex: 50,
  },
});