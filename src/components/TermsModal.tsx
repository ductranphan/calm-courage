/**
 * Modal overlay for Terms of Service and Privacy Policy.
 */
import {
  Modal,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from "react-native";

import { termsContent } from "@/constants/terms";
import { colors } from "@/constants/colors";

type Props = {
  visible: boolean;
  onClose: () => void;
};

export default function TermsModal({ visible, onClose }: Props) {
  return (
    <Modal visible={visible} transparent animationType="fade" onRequestClose={onClose}>
      <View style={styles.overlay}>
        <View style={styles.card}>
          <Pressable onPress={onClose} style={styles.closeButton}>
            <Text style={styles.closeText}>X</Text>
          </Pressable>

          <ScrollView
            style={styles.scroll}
            contentContainerStyle={styles.scrollContent}
            showsVerticalScrollIndicator={false}
          >
            <Text style={styles.title}>{termsContent.title}</Text>
            <Text style={styles.intro}>{termsContent.intro}</Text>

            {termsContent.sections.map((section) => (
              <View key={section.heading} style={styles.section}>
                <Text style={styles.heading}>{section.heading}</Text>
                {section.bullets.map((bullet) => (
                  <Text key={bullet} style={styles.bullet}>
                    • {bullet}
                  </Text>
                ))}
              </View>
            ))}
          </ScrollView>
        </View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: "rgba(0, 0, 0, 0.35)",
    justifyContent: "center",
    paddingHorizontal: 24,
  },
  card: {
    maxHeight: "80%",
    borderRadius: 20,
    backgroundColor: colors.background,
    paddingTop: 20,
    paddingHorizontal: 20,
    paddingBottom: 16,
  },
  closeButton: {
    alignSelf: "flex-end",
    padding: 4,
  },
  closeText: {
    color: colors.primary,
    fontFamily: "Literata",
    fontSize: 22,
    lineHeight: 24,
  },
  scroll: {
    flexGrow: 0,
  },
  scrollContent: {
    gap: 12,
    paddingBottom: 8,
  },
  title: {
    color: colors.primary,
    fontFamily: "Literata",
    fontSize: 22,
    lineHeight: 28,
    textAlign: "center",
    marginBottom: 4,
  },
  intro: {
    color: colors.primary,
    fontFamily: "Literata",
    fontSize: 16,
    lineHeight: 22,
  },
  section: {
    gap: 6,
  },
  heading: {
    color: colors.primary,
    fontFamily: "Literata",
    fontSize: 16,
    lineHeight: 22,
  },
  bullet: {
    color: colors.primary,
    fontFamily: "Literata",
    fontSize: 16,
    lineHeight: 22,
    paddingLeft: 4,
  },
});
