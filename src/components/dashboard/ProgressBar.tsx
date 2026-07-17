/**
 * Reusable progress bar.
 *
 * Used for parent dashboard activity progress.
 */

import { StyleSheet, View } from "react-native";

import { colors } from "@/constants/colors";
import { x, y } from "@/utils/scaling";

type Props = {
  progress: number;
};

export default function ProgressBar({ progress }: Props) {
  const safeProgress = Math.max(0, Math.min(progress, 1));

  return (
    <View style={styles.track}>
      <View style={[styles.fill, { width: x(362 * safeProgress) }]} />
    </View>
  );
}

const styles = StyleSheet.create({
  track: {
    width: x(362),
    height: y(19),
    borderRadius: x(10),
    backgroundColor: "#D9D9D9",
    overflow: "hidden",

    shadowColor: "#000000",
    shadowOffset: {
      width: 0,
      height: y(4),
    },
    shadowOpacity: 0.25,
    shadowRadius: x(4),
    elevation: 5,
  },

  fill: {
    height: y(19),
    borderTopLeftRadius: x(10),
    borderBottomLeftRadius: x(10),
    backgroundColor: colors.primary,
  },
});