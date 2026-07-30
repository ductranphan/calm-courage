/**
 * Consent document overlay for parent registration.
 */

import { Pressable, ScrollView, StyleSheet, Text, View } from "react-native";

import {
  consentDocuments,
  type ConsentDocumentKind,
} from "@/constants/consent";
import { colors } from "@/constants/colors";
import { x, y } from "@/utils/scaling";

type Props = {
  visible: boolean;
  document: ConsentDocumentKind | null;
  onClose: () => void;
};

export default function TermsModal({
  visible,
  document,
  onClose,
}: Props) {
  if (!visible || !document) {
    return null;
  }

  const content = consentDocuments[document];

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
        <Text style={styles.title}>{content.title}</Text>
        <Text style={styles.text}>{content.body}</Text>
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
