/**
 * Reusable app button.
 *
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
      <Text style={styles.text}>{title}</Text>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  button: {
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