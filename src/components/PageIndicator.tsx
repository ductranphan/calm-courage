/**
 * Onboarding page indicator.
 *
 * Displays one active dot and two inactive dots based on the current page.
 * The dots stay fixed while the statement text can swipe/auto-scroll.
 */
import { StyleSheet, View } from "react-native";
import { colors } from "@/constants/colors";
import { onboardingStatements } from "@/constants/onboarding";

type Props = {
  activeIndex: number;
};

export default function PageIndicator({ activeIndex }: Props) {
  return (
    <View style={styles.container}>
      {onboardingStatements.map((item, index) => (
        <View
          key={item.id}
          style={index === activeIndex ? styles.activeDot : styles.dot}
        />
      ))}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: "row",
    gap: 20,
    alignItems: "center",
  },
  activeDot: {
    width: 40,
    height: 20,
    borderRadius: 10,
    backgroundColor: colors.primary,
  },
  dot: {
    width: 20,
    height: 20,
    borderRadius: 10,
    backgroundColor: colors.gray,
  },
});
