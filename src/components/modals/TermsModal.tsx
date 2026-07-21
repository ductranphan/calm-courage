/**
 * Terms of Service and Privacy Policy overlay.
 *
 * Figma-style grey overlay displayed inside the email sign-up screen.
 * The grey card stays fixed, while the terms text can scroll if needed.
 */

import { Pressable, ScrollView, StyleSheet, Text, View } from "react-native";

import { colors } from "@/constants/colors";
import { x, y } from "@/utils/scaling";

type Props = {
  visible: boolean;
  onClose: () => void;
};

export default function TermsModal({ visible, onClose }: Props) {
  if (!visible) {
    return null;
  }

  return (
    <View style={styles.card}>
      <Pressable onPress={onClose} style={styles.closeButton}>
        <View style={styles.closeLineOne} />
        <View style={styles.closeLineTwo} />
      </Pressable>

      <ScrollView
        style={styles.scroll}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        <Text style={styles.title}>Terms of Service & Privacy Policy</Text>

        <Text style={styles.text}>
          Welcome to Calm Courage Co.{"\n"}
          
          Please review how we protect your family{"'"}s data:{"\n\n"}

          1. Data Protection & Privacy{"\n"}
          • We do not share your child{"'"}s emotional data or drawings with any third parties.{"\n"}
          • All voice recordings and canvas activities are encrypted and securely stored.{"\n\n"}

          2. Parental Control{"\n"}
          • Parents maintain full access to view, edit, or delete their child{"'"}s profile and progress reports.{"\n\n"}

          3. Subscription & Billing{"\n"}
          • Phase 1 features include free trials, followed by our monthly membership plan ($7.99/mo).{"\n"}
          • Cancel anytime through your Parent Settings.
        </Text>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    position: "absolute",
    left: x(20),
    top: y(258),
    width: x(362),
    height: y(570),
    borderRadius: x(20),
    backgroundColor: "rgba(217, 217, 217, 0.85)",
    overflow: "hidden",
    zIndex: 100,
  },

  closeButton: {
    position: "absolute",
    left: x(321),
    top: y(21),
    width: x(21),
    height: y(19),
    alignItems: "center",
    justifyContent: "center",
    zIndex: 20,
  },

  closeLineOne: {
    position: "absolute",
    width: x(27),
    height: y(3),
    backgroundColor: colors.primary,
    transform: [{ rotate: "45deg" }],
  },

  closeLineTwo: {
    position: "absolute",
    width: x(27),
    height: y(3),
    backgroundColor: colors.primary,
    transform: [{ rotate: "-45deg" }],
  },

  scroll: {
    position: "absolute",
    left: x(28),
    top: y(57),
    width: x(300),
    height: y(470),
  },

  scrollContent: {
    paddingBottom: y(24),
  },

  title: {
    width: x(300),
    color: colors.primary,
    fontFamily: "Literata",
    fontSize: x(20),
    lineHeight: y(24),
    fontWeight: "700",
    marginBottom: y(32),
  },

  text: {
    width: x(300),
    color: colors.primary,
    fontFamily: "Literata",
    fontSize: x(16),
    lineHeight: y(19),
  },
});