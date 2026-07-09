/**
 * Temporary switch-to-child screen.
 *
 * Placeholder screen shown after the child profile setup flow.
 * This will later be replaced by the real child mode/home transition.
 */
import { router } from "expo-router";
import { StyleSheet, Text, View } from "react-native";

import AppButton from "@/components/ui/AppButton";
import BackButton from "@/components/ui/BackButton";
import { colors } from "@/constants/colors";
import { x, y } from "@/utils/scaling";

export default function SwitchToChildScreen() {
  return (
    <View style={styles.screen}>
      <BackButton fallback="/child-profile-avatar" />

      <Text style={styles.title}>Switch to Child</Text>

      <Text style={styles.subtitle}>
        This screen is temporary so you can test the profile setup flow.
      </Text>

      <AppButton
        title="Continue to Home"
        onPress={() => router.replace("/home")}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  screen: {
    flex: 1,
    backgroundColor: colors.background,
    alignItems: "center",
    justifyContent: "center",
    paddingHorizontal: x(24),
    gap: y(24),
  },

  title: {
    color: colors.primary,
    fontFamily: "Quiche",
    fontSize: x(30),
    lineHeight: y(39),
    textAlign: "center",
  },

  subtitle: {
    color: colors.primary,
    fontFamily: "Literata",
    fontSize: x(20),
    lineHeight: y(26),
    textAlign: "center",
  },
});