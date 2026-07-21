/**
 * Reusable app button.
 *
<<<<<<< HEAD
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
=======
 * Matches the Calm Courage Figma button style:
 * lavender background, rounded corners, soft shadow,
 * and Quiche font for the button text.
 */

import {
  Pressable,
  PressableProps,
  StyleProp,
  StyleSheet,
  Text,
  ViewStyle,
} from "react-native";

import { colors } from "@/constants/colors";
import { x, y } from "@/utils/scaling";

type Props = PressableProps & {
  title: string;
  style?: StyleProp<ViewStyle>;
};

export default function AppButton({ title, style, disabled, ...props }: Props) {
  return (
    <Pressable
      {...props}
      disabled={disabled}
      style={({ pressed }) => [
        styles.button,
        style,
        pressed && !disabled && styles.pressed,
        disabled && styles.disabled,
      ]}
    >
>>>>>>> 085db16234b9c8005b24ff1b18f08fb73e237d40
      <Text style={styles.text}>{title}</Text>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  button: {
<<<<<<< HEAD
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
=======
    width: x(210),
    height: y(52),
    borderRadius: x(20),
    backgroundColor: colors.lavender,

    alignItems: "center",
    justifyContent: "center",

    shadowColor: "#000000",
    shadowOffset: {
      width: 0,
      height: y(4),
    },
    shadowOpacity: 0.25,
    shadowRadius: x(4),
    elevation: 5,
  },

  pressed: {
    opacity: 0.8,
  },

  disabled: {
    opacity: 0.5,
  },

  text: {
    color: colors.primary,
    fontFamily: "Quiche",
    fontSize: x(20),
    lineHeight: y(24),
    textAlign: "center",
  },
});
>>>>>>> 085db16234b9c8005b24ff1b18f08fb73e237d40
