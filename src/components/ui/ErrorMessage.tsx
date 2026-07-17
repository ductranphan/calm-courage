/**
 * Reusable form error message.
 *
 * Matches the Figma error style:
 * red X icon + red Literata error text.
 */

import { StyleProp, StyleSheet, Text, View, ViewStyle } from "react-native";

import { x, y } from "@/utils/scaling";

type Props = {
  message: string | null;
  style?: StyleProp<ViewStyle>;
};

export default function ErrorMessage({ message, style }: Props) {
  if (!message) {
    return null;
  }

  return (
    <View style={[styles.container, style]}>
      <Text style={styles.message}>{message}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    width: x(362),
    minHeight: y(22),
    flexDirection: "row",
    alignItems: "center",
  },

  icon: {
    color: "#ED0000",
    fontFamily: "Literata",
    fontSize: x(24),
    lineHeight: y(24),
    marginRight: x(6),
  },

  message: {
    flex: 1,
    color: "#ED0000",
    fontFamily: "Literata",
    fontSize: x(18),
    lineHeight: y(22),
  },
});