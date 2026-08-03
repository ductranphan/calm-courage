/**
 * Evening conversation prompt shown on the parent dashboard.
 *
 * The current text is a V1 fallback based on the selected child's name and
 * today's emotion. It can be replaced by an AI-generated prompt later without
 * changing the dashboard layout.
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
  hasMood: boolean;
  onViewMore?: () => void;
};

export default function InsightPromptCard({
  childName,
  moodLabel,
  hasMood,
  onViewMore,
}: Props) {
  const safeChildName = childName.trim() || "Your child";
  const safeMoodLabel =
    moodLabel.trim().toLowerCase() || "a new emotion";

  const prompt = hasMood
    ? `${safeChildName} felt ${safeMoodLabel} today. Before bedtime, try talking about a moment when ${safeChildName} showed courage.`
    : `${safeChildName} has not checked in yet today. Before bedtime, ask which feeling stood out most and when ${safeChildName} showed courage.`;

  return (
    <View style={styles.card}>
      <View style={styles.promptRow}>
        <View style={styles.quoteLeft}>
          <QuoteLeftIcon width={x(20)} height={x(20)} />
        </View>

        <Text style={styles.promptText}>{prompt}</Text>
      </View>

      <View style={styles.quoteRight}>
        <QuoteRightIcon width={x(20)} height={x(20)} />
      </View>

      <View style={styles.buttonWrapper}>
        <AppButton
          title="View more"
          onPress={onViewMore ?? (() => undefined)}
          style={styles.viewMoreButton}
        />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    width: "100%",
    minHeight: y(271),
    paddingTop: y(30),
    paddingRight: x(24),
    paddingBottom: y(20),
    paddingLeft: x(24),
    borderRadius: x(20),
    borderWidth: 1,
    borderColor: colors.primary,
    backgroundColor: colors.background,
  },

  promptRow: {
    width: "100%",
    flexDirection: "row",
    alignItems: "flex-start",
  },

  quoteLeft: {
    width: x(20),
    height: x(20),
    marginTop: y(9),
    marginRight: x(14),
    flexShrink: 0,
    alignItems: "center",
    justifyContent: "center",
  },

  promptText: {
    flex: 1,
    flexShrink: 1,
    color: colors.primary,
    fontFamily: "Literata",
    fontSize: x(20),
    lineHeight: y(35),
  },

  quoteRight: {
    width: x(20),
    height: x(20),
    marginTop: y(8),
    marginRight: x(4),
    alignSelf: "flex-end",
    alignItems: "center",
    justifyContent: "center",
  },

  buttonWrapper: {
    width: x(133),
    height: y(52),
    marginTop: y(18),
    alignSelf: "center",
  },

  viewMoreButton: {
    width: x(133),
    height: y(52),
    borderRadius: x(20),
  },
});