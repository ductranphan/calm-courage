/**
 * Reusable app button.
 *
 * Keeps all primary buttons visually consistent with the Figma design.
 * Extra style can be passed for screen-specific sizing/positioning.
 */
import { Pressable, StyleSheet, Text, ViewStyle } from "react-native";
import { colors } from "@/constants/colors";
import { typography } from "@/constants/typography";

// Component props shared by all button instances.
type Props = {
  title: string;
  onPress: () => void;
  style?: ViewStyle;
};

export default function AppButton({ title, onPress, style }: Props) {
  return (
    <Pressable onPress={onPress} style={[styles.button, style]}>
      <Text style={styles.text}>{title}</Text>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  button: {
    width: 209,
    height: 52,
    borderRadius: 20,
    backgroundColor: colors.lavender,
    alignItems: "center",
    justifyContent: "center",

    // Figma-style soft shadow.
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.25,
    shadowRadius: 4,
    elevation: 5,
  },
  text: {
    color: colors.primary,
    textAlign: "center",
    ...typography.button,
  },
});
