/**
 * Reusable insight prompt card.
 *
 * Shows the evening conversation prompt on the parent dashboard.
 */

import { StyleSheet, Text, View } from "react-native";

import AppButton from "@/components/ui/AppButton";
import { colors } from "@/constants/colors";
import { x, y } from "@/utils/scaling";

import QuoteLeftIcon from "../../../assets/icons/double-quotes-L.svg";
import QuoteRightIcon from "../../../assets/icons/double-quotes-R.svg";

type Props = {
  childName: string;
  moodLabel: string;
  onViewMore?: () => void;
};

export default function InsightPromptCard({
  childName,
  moodLabel,
  onViewMore,
}: Props) {
  return (
    <View style={styles.card}>
      <View style={styles.quoteLeft}>
        <QuoteLeftIcon width={x(20)} height={x(20)} />
      </View>

      <Text style={styles.promptText}>
        {childName} felt {moodLabel.toLowerCase()} today.{"\n"}
        Before bedtime, try talking{"\n"}
        about a moment when{"\n"}
        Oliver showed courage.
      </Text>

      <View style={styles.quoteRight}>
        <QuoteRightIcon width={x(20)} height={x(20)} />
      </View>

      <View style={styles.buttonWrapper}>
        <AppButton
          title="View more"
          onPress={onViewMore ?? (() => {})}
          style={styles.viewMoreButton}
        />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    width: x(362),
    height: y(271),
    borderRadius: x(20),
    borderWidth: 1,
    borderColor: colors.primary,
    backgroundColor: colors.background,
  },

  quoteLeft: {
    position: "absolute",
    left: x(25),
    top: y(42),
    width: x(20),
    height: x(20),
    alignItems: "center",
    justifyContent: "center",
  },

  promptText: {
    position: "absolute",
    left: x(64),
    top: y(33),
    width: x(270),
    color: colors.primary,
    fontFamily: "Literata",
    fontSize: x(20),
    lineHeight: y(35),
  },

  quoteRight: {
    position: "absolute",
    left: x(310),
    top: y(150),
    width: x(20),
    height: x(20),
    alignItems: "center",
    justifyContent: "center",
  },

  buttonWrapper: {
    position: "absolute",
    left: x(115),
    top: y(198),
    width: x(133),
    height: y(52),
  },

  viewMoreButton: {
    width: x(133),
    height: y(52),
    borderRadius: x(20),
  },
});