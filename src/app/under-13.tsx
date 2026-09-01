/**
 * Under-13 path (COPPA).
 *
 * No personal information is collected here. A parent or legal
 * guardian must set up the account and provide verifiable consent
 * before any child profile data is collected.
 */

import { router, type Href } from "expo-router";
import {
  Pressable,
  StyleSheet,
  Text,
  View,
} from "react-native";

import AppButton from "@/components/ui/AppButton";
import Logo from "@/components/ui/Logo";
import { colors } from "@/constants/colors";
import { x, y } from "@/utils/scaling";

export default function Under13Screen() {
  return (
    <View style={styles.screen}>
      <Text style={styles.title}>Ask a parent to continue</Text>

      <Text style={styles.body}>
        Calm Courage must be set up by a parent or legal guardian.
        We do not collect names, emails, or other personal information
        from this screen.
      </Text>

      <Text style={styles.bodySecondary}>
        A parent can create an account, agree to the Privacy Policy,
        and give Parent/Guardian Consent before any child profile is
        created.
      </Text>

      <View style={styles.buttonWrap}>
        <AppButton
          title="Enter a different birth year"
          onPress={() => router.replace("/age-gate" as Href)}
          style={styles.button}
        />
      </View>

      <Pressable
        onPress={() => router.push("/privacy-policy" as Href)}
        style={styles.privacyLink}
        accessibilityRole="link"
        accessibilityLabel="Read Privacy Policy"
      >
        <Text style={styles.privacyLinkText}>Privacy Policy</Text>
      </Pressable>

      <View style={styles.logo}>
        <Logo width={x(168)} height={y(62)} shadow />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  screen: {
    flex: 1,
    backgroundColor: colors.background,
  },

  title: {
    position: "absolute",
    left: x(24),
    top: y(140),
    width: x(354),
    color: colors.primary,
    fontFamily: "Outfit",
    fontSize: x(28),
    lineHeight: y(36),
    textAlign: "center",
  },

  body: {
    position: "absolute",
    left: x(36),
    top: y(230),
    width: x(330),
    color: colors.primary,
    fontFamily: "Literata",
    fontSize: x(18),
    lineHeight: y(26),
    textAlign: "center",
  },

  bodySecondary: {
    position: "absolute",
    left: x(36),
    top: y(360),
    width: x(330),
    color: colors.primary,
    fontFamily: "Literata",
    fontSize: x(18),
    lineHeight: y(26),
    textAlign: "center",
  },

  buttonWrap: {
    position: "absolute",
    left: x(56),
    top: y(500),
    width: x(290),
    alignItems: "center",
  },

  button: {
    width: x(290),
    height: y(64),
  },

  privacyLink: {
    position: "absolute",
    left: x(20),
    top: y(590),
    width: x(362),
    alignItems: "center",
  },

  privacyLinkText: {
    color: colors.primary,
    fontFamily: "Literata",
    fontSize: x(18),
    lineHeight: y(24),
    textDecorationLine: "underline",
  },

  logo: {
    position: "absolute",
    left: x(117),
    top: y(680),
  },
});
