import { StyleSheet, Text, View } from "react-native";
import { router } from "expo-router";

import AppButton from "@/components/AppButton";
import BackButton from "@/components/BackButton";
import { colors } from "@/constants/colors";

export default function SwitchToChildScreen() {
  return (
    <View style={styles.screen}>
      <BackButton fallback="/child-profile-avatar" />

      <Text style={styles.title}>Switch to Child</Text>

      <Text style={styles.subtitle}>
        This screen is temporary so you can test the profile setup flow.
      </Text>

      <AppButton title="Continue to Home" onPress={() => router.replace("/home")} />
    </View>
  );
}

const styles = StyleSheet.create({
  screen: {
    flex: 1,
    backgroundColor: colors.background,
    alignItems: "center",
    justifyContent: "center",
    paddingHorizontal: 24,
    gap: 24,
  },

  title: {
    color: colors.primary,
    fontFamily: "Literata",
    fontSize: 30,
    lineHeight: 39,
    textAlign: "center",
  },

  subtitle: {
    color: colors.primary,
    fontFamily: "Literata",
    fontSize: 20,
    lineHeight: 26,
    textAlign: "center",
  },
});