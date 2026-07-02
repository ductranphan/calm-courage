/**
 * Parent Login screen.
 *
 * Allows existing parents to enter email/password, navigate to forgot password,
 * or choose a social login option. Authentication logic is not connected yet.
 */
import {
  Dimensions,
  Pressable,
  StyleSheet,
  Text,
  TextInput,
  View,
} from "react-native";
import { router } from "expo-router";

import AppButton from "@/components/AppButton";
import BackButton from "@/components/BackButton";
import { colors } from "@/constants/colors";

import GoogleIcon from "../../assets/images/google.svg";
import AppleIcon from "../../assets/images/apple.svg";
import FacebookIcon from "../../assets/images/facebook.svg";

const FIGMA_WIDTH = 402;

const { width } = Dimensions.get("window");

// Width-based scaling keeps this screen closer to the Figma proportions on iPhone.
const x = (value: number) => value * (width / FIGMA_WIDTH);
const y = (value: number) => value * (width / FIGMA_WIDTH);

export default function LoginScreen() {
  return (
    <View style={styles.screen}>
      <BackButton />

      <Text style={styles.title}>Parent Log In</Text>

      <Text style={styles.welcome}>
        Welcome Back!{"\n"}Please enter your details to sign in.
      </Text>

      {/* Email input; Firebase Auth will be connected later. */}
      <TextInput
        placeholder="Enter your email"
        placeholderTextColor={colors.muted}
        style={[styles.input, styles.emailInput]}
      />

      {/* Password input; value/state handling will be added with auth integration. */}
      <TextInput
        placeholder="Enter password"
        placeholderTextColor={colors.muted}
        secureTextEntry
        style={[styles.input, styles.passwordInput]}
      />

      <Pressable onPress={() => router.push("/forgot-password")}>
        <Text style={styles.forgot}>Forgot?</Text>
      </Pressable>

      <View style={styles.loginButton}>
        <AppButton title="Log In" onPress={() => {}} />
      </View>

      <Text style={styles.or}>OR</Text>

      {/* Social login UI placeholders. */}
      <View style={styles.socials}>
        <GoogleIcon width={x(52)} height={y(52)} />
        <AppleIcon width={x(52)} height={y(52)} />
        <FacebookIcon width={x(52)} height={y(52)} />
      </View>

      <Pressable onPress={() => router.push("/create-account")}>
        <Text style={styles.createAccount}>Don’t have an account?</Text>
      </Pressable>
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
    left: x(103),
    top: y(90),
    width: x(195),
    height: y(39),
    color: colors.primary,
    textAlign: "center",
    fontFamily: "Literata",
    fontSize: 30,
    lineHeight: 39,
  },

  welcome: {
    position: "absolute",
    left: x(20),
    top: y(159),
    width: x(329),
    height: y(48),
    color: colors.primary,
    fontFamily: "Literata",
    fontSize: 20,
    lineHeight: 24,
  },

  input: {
    position: "absolute",
    left: x(20),
    width: x(362),
    height: y(72),
    borderWidth: 1,
    borderColor: colors.primary,
    borderRadius: 20,
    backgroundColor: colors.white,
    paddingHorizontal: x(26),
    color: colors.primary,
    fontFamily: "Literata",
    fontSize: 20,
  },

  emailInput: {
    top: y(237),
  },

  passwordInput: {
    top: y(345),
  },

  forgot: {
    position: "absolute",
    left: x(308),
    top: y(447),
    width: x(90),
    height: y(32),
    color: colors.primary,
    fontFamily: "Literata",
    fontSize: 20,
    lineHeight: 28,
    textDecorationLine: "underline",
  },

  loginButton: {
    position: "absolute",
    left: x(96),
    top: y(509),
  },

  or: {
    position: "absolute",
    left: x(186),
    top: y(622),
    width: x(31),
    height: y(24),
    color: colors.primary,
    fontFamily: "Literata",
    fontSize: 20,
    textAlign: "center",
  },

  socials: {
    position: "absolute",
    left: x(109),
    top: y(707),
    width: x(184),
    height: y(53),
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },

  createAccount: {
    position: "absolute",
    left: x(20),
    top: y(821),
    width: x(260),
    height: y(32),
    color: colors.primary,
    fontFamily: "Literata",
    fontSize: 20,
    lineHeight: 28,
    textDecorationLine: "underline",
  },
});
