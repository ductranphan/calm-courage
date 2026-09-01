/**
 * Create Parent Account screen.
 *
 * Email sign-up is the production path. Social providers are not
 * wired yet, so they are hidden for launch.
 */
import { router } from "expo-router";
import { Pressable, StyleSheet, Text, View } from "react-native";

import RequireAdultAgeGate from "@/components/RequireAdultAgeGate";
import AppButton from "@/components/ui/AppButton";
import BackButton from "@/components/ui/BackButton";
import Logo from "@/components/ui/Logo";
import { colors } from "@/constants/colors";
import { typography } from "@/constants/typography";
import { x, y } from "@/utils/scaling";

export default function CreateAccountScreen() {
  return (
    <RequireAdultAgeGate>
      <View style={styles.screen}>
        <BackButton />

        <Text style={styles.title}>Create Parent Account</Text>

        <View style={styles.emailButton}>
          <AppButton
            title="Email Sign-Up"
            onPress={() => router.push("/email-signup")}
            style={styles.emailButtonSize}
          />
        </View>

        <Text style={styles.emailOnlyNote}>
          Sign up with email for now. More sign-in options are coming soon.
        </Text>

        <Pressable
          onPress={() => router.push("/login")}
          style={styles.loginLink}
          accessibilityRole="button"
        >
          <Text style={styles.loginLinkText}>
            Already have an account? Log in
          </Text>
        </Pressable>

        <Pressable
          onPress={() => router.push("/privacy-policy")}
          style={styles.privacyLink}
          accessibilityRole="link"
          accessibilityLabel="Read Privacy Policy"
        >
          <Text style={styles.privacyLinkText}>Privacy Policy</Text>
        </Pressable>

        <View style={styles.bottomLogo}>
          <Logo width={x(168)} height={y(62)} shadow />
        </View>
      </View>
    </RequireAdultAgeGate>
  );
}

const styles = StyleSheet.create({
  screen: {
    flex: 1,
    backgroundColor: colors.background,
  },

  title: {
    position: "absolute",
    left: x(35),
    top: y(123),
    width: x(331),
    height: y(39),
    color: colors.primary,
    textAlign: "center",
    fontSize: x(30),
    lineHeight: y(39),
    fontFamily: "Outfit",
  },

  emailButton: {
    position: "absolute",
    left: x(96),
    top: y(231),
  },

  emailButtonSize: {
    width: x(210),
    height: y(84),
    borderRadius: x(20),
  },

  emailOnlyNote: {
    position: "absolute",
    left: x(48),
    top: y(360),
    width: x(305),
    color: colors.primary,
    textAlign: "center",
    ...typography.body,
  },

  loginLink: {
    position: "absolute",
    left: x(48),
    top: y(440),
    width: x(305),
    alignItems: "center",
  },

  loginLinkText: {
    color: colors.primary,
    textAlign: "center",
    textDecorationLine: "underline",
    ...typography.body,
  },

  privacyLink: {
    position: "absolute",
    left: x(48),
    top: y(500),
    width: x(305),
    alignItems: "center",
  },

  privacyLinkText: {
    color: colors.primary,
    textAlign: "center",
    textDecorationLine: "underline",
    ...typography.body,
  },

  bottomLogo: {
    position: "absolute",
    left: x(117),
    top: y(622),
    width: x(168),
    height: y(62),
    alignItems: "center",
    justifyContent: "center",
  },
});
