/**
 * Onboarding statement text.
 *
 * Receives text from the onboarding constants and displays it with the
 * Figma-matched font, alignment, and line height.
 */
import { StyleSheet, Text, View } from "react-native";

import { colors } from "@/constants/colors";
import { typography } from "@/constants/typography";

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
    width: 290,
    minHeight: 90,
    justifyContent: "center",
    alignItems: "center",
  },

  text: {
    color: colors.primary,
    textAlign: "center",
    lineHeight: 28,
    ...typography.body,
  },
});
