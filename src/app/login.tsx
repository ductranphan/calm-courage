/**
 * Parent Login screen.
 *
 * Allows existing parents to enter their email and password,
 * then signs them in with Firebase Authentication.
 */
import { router } from "expo-router";
import { useState } from "react";
import {
  ActivityIndicator,
  Pressable,
  StyleSheet,
  Text,
  TextInput,
  View,
} from "react-native";

import AppButton from "@/components/ui/AppButton";
import BackButton from "@/components/ui/BackButton";
import { colors } from "@/constants/colors";
import { useAuth } from "@/contexts/AuthContext";
import { x, y } from "@/utils/scaling";

import AppleIcon from "../../assets/images/apple.svg";
import FacebookIcon from "../../assets/images/facebook.svg";
import GoogleIcon from "../../assets/images/google.svg";

export default function LoginScreen() {
  const { signIn } = useAuth();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  async function handleLogin() {
    setError(null);
    setLoading(true);

    try {
      await signIn(email, password);
      router.replace("/");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Unable to sign in.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <View style={styles.screen}>
      <BackButton />

      <Text style={styles.title}>Parent Log In</Text>

      <Text style={styles.welcome}>
        Welcome Back!{"\n"}Please enter your details to sign in.
      </Text>

      <TextInput
        placeholder="Enter your email"
        placeholderTextColor={colors.muted}
        style={[styles.input, styles.emailInput]}
        value={email}
        onChangeText={setEmail}
        autoCapitalize="none"
        autoCorrect={false}
        keyboardType="email-address"
        textContentType="emailAddress"
      />

      <TextInput
        placeholder="Enter password"
        placeholderTextColor={colors.muted}
        secureTextEntry
        style={[styles.input, styles.passwordInput]}
        value={password}
        onChangeText={setPassword}
        textContentType="password"
      />

      {error ? <Text style={styles.error}>{error}</Text> : null}

      <Pressable onPress={() => router.push("/forgot-password")}>
        <Text style={styles.forgot}>Forgot?</Text>
      </Pressable>

      <View style={styles.loginButton}>
        {loading ? (
          <ActivityIndicator color={colors.primary} />
        ) : (
          <AppButton title="Log In" onPress={handleLogin} />
        )}
      </View>

      <Text style={styles.or}>OR</Text>

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
    fontFamily: "Quiche",
    fontSize: x(30),
    lineHeight: y(39),
  },

  welcome: {
    position: "absolute",
    left: x(20),
    top: y(159),
    width: x(329),
    height: y(48),
    color: colors.primary,
    fontFamily: "Literata",
    fontSize: x(20),
    lineHeight: y(24),
  },

  input: {
    position: "absolute",
    left: x(20),
    width: x(362),
    height: y(72),
    borderWidth: 1,
    borderColor: colors.primary,
    borderRadius: x(20),
    backgroundColor: colors.white,
    paddingHorizontal: x(26),
    color: colors.primary,
    fontFamily: "Literata",
    fontSize: x(20),
  },

  emailInput: {
    top: y(237),
  },

  passwordInput: {
    top: y(345),
  },

  error: {
    position: "absolute",
    left: x(20),
    top: y(425),
    width: x(362),
    color: "#B00020",
    fontFamily: "Literata",
    fontSize: x(16),
    lineHeight: y(22),
  },

  forgot: {
    position: "absolute",
    left: x(308),
    top: y(447),
    width: x(90),
    height: y(32),
    color: colors.primary,
    fontFamily: "Literata",
    fontSize: x(20),
    lineHeight: y(28),
    textDecorationLine: "underline",
  },

  loginButton: {
    position: "absolute",
    left: x(96),
    top: y(509),
    width: x(209),
    height: y(52),
    alignItems: "center",
    justifyContent: "center",
  },

  or: {
    position: "absolute",
    left: x(186),
    top: y(622),
    width: x(31),
    height: y(24),
    color: colors.primary,
    fontFamily: "Literata",
    fontSize: x(20),
    lineHeight: y(24),
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
    fontSize: x(20),
    lineHeight: y(28),
    textDecorationLine: "underline",
  },
});