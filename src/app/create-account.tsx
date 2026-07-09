/**
 * Create Parent Account screen.
 *
 * Gives parents the option to start email sign-up or use social login.
 * Social login buttons are UI-only for now; backend auth will be connected later.
 */
import { router } from "expo-router";
import { StyleSheet, Text, View } from "react-native";

import AppButton from "@/components/ui/AppButton";
import BackButton from "@/components/ui/BackButton";
import Logo from "@/components/ui/Logo";
import { colors } from "@/constants/colors";
import { typography } from "@/constants/typography";
import { x, y } from "@/utils/scaling";

import AppleIcon from "../../assets/images/apple.svg";
import FacebookIcon from "../../assets/images/facebook.svg";
import GoogleIcon from "../../assets/images/google.svg";

export default function CreateAccountScreen() {
  return (
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

      <Text style={styles.or}>OR</Text>

      <View style={styles.socials}>
        <GoogleIcon width={x(52)} height={y(52)} />
        <AppleIcon width={x(52)} height={y(52)} />
        <FacebookIcon width={x(52)} height={y(52)} />
      </View>

      <View style={styles.bottomLogo}>
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
    left: x(35),
    top: y(123),
    width: x(331),
    height: y(39),
    color: colors.primary,
    textAlign: "center",
    fontSize: x(30),
    lineHeight: y(39),
    fontFamily: "Quiche",
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

  or: {
    position: "absolute",
    left: x(186),
    top: y(384),
    width: x(31),
    height: y(24),
    color: colors.primary,
    textAlign: "center",
    ...typography.body,
  },

  socials: {
    position: "absolute",
    left: x(109),
    top: y(477),
    width: x(184),
    height: y(53),
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
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