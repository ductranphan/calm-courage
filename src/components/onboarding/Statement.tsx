/**
 * Onboarding statement text.
 *
 * Displays each onboarding message inside the Figma statement area.
 */
import { StyleSheet, Text, View } from "react-native";

import { colors } from "@/constants/colors";
import { x, y } from "@/utils/scaling";

type Props = {
  text: string;
};

export default function Statement({ text }: Props) {
  return (
    <View style={styles.container}>
      <Text style={styles.text}>{text}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    width: x(362),
    height: y(200),
    alignItems: "center",
    justifyContent: "center",
  },

  text: {
    width: x(295),
    color: colors.primary,
    fontFamily: "Literata",
    fontSize: x(20),
    lineHeight: y(28),
    textAlign: "center",
  },
});