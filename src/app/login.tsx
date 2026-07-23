/**
 * Parent Login screen.
 *
 * Matches Figma Screen 1.1: Parent Login.
 * Allows existing parents to enter their email and password,
 * then signs them in with Firebase Authentication.
 */

import { router } from "expo-router";
import { useState } from "react";
import {
  ActivityIndicator,
  KeyboardAvoidingView,
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from "react-native";

import GoogleIcon from "../../assets/images/google.svg";
import AppleIcon from "../../assets/images/apple.svg";
import FacebookIcon from "../../assets/images/facebook.svg";

import AppButton from "@/components/ui/AppButton";
import BackButton from "@/components/ui/BackButton";
import ErrorMessage from "@/components/ui/ErrorMessage";
import FloatingTextInput from "@/components/ui/FloatingTextInput";
import { colors } from "@/constants/colors";
import { useAuth } from "@/contexts/AuthContext";
import { x, y } from "@/utils/scaling";

export default function LoginScreen() {
  const { signIn } = useAuth();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  async function handleLogin() {
    setError(null);

    if (!email.trim() || !password.trim()) {
      setError("Please enter your email and password.");
      return;
    }

    setLoading(true);

    try {
      await signIn(email.trim(), password);
      router.replace("/");
    } catch {
      setError("Unable to log in. Please check your email and password.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <KeyboardAvoidingView
      style={styles.screen}
      behavior={Platform.OS === "ios" ? "padding" : "height"}
    >
      <ScrollView
        contentContainerStyle={styles.scrollContent}
        keyboardShouldPersistTaps="handled"
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.figmaFrame}>
          <BackButton fallback="/onboarding" />

          <Text style={styles.title}>Parent Log In</Text>

          <Text style={styles.subtitle}>
            Welcome Back!{"\n"}
            Please enter your details to sign in.
          </Text>

          <View style={styles.emailInput}>
            <FloatingTextInput
              label="Email address"
              placeholder="Enter your email"
              value={email}
              onChangeText={setEmail}
              autoCapitalize="none"
              autoCorrect={false}
              keyboardType="email-address"
            />
          </View>

          <View style={styles.passwordInput}>
            <FloatingTextInput
              label="Password"
              placeholder="Enter password"
              value={password}
              onChangeText={setPassword}
              secureTextEntry
            />
          </View>

          <Pressable
            onPress={() => router.push("/forgot-password")}
            style={styles.forgotPasswordWrapper}
          >
            <Text style={styles.forgotPasswordText}>Forgot?</Text>
          </Pressable>

          <ErrorMessage message={error} style={styles.errorText} />

          <View style={styles.buttonWrapper}>
            {loading ? (
              <ActivityIndicator color={colors.primary} />
            ) : (
              <AppButton
                title="Log In"
                onPress={handleLogin}
                style={styles.loginButton}
              />
            )}
          </View>

          <Text style={styles.orText}>OR</Text>

          <View style={styles.socialRow}>
            <Pressable style={styles.socialButton}>
              <GoogleIcon width={x(55)} height={x(55)} />
            </Pressable>

            <Pressable style={styles.socialButton}>
              <AppleIcon width={x(55)} height={x(55)} />
            </Pressable>

            <Pressable style={styles.socialButton}>
              <FacebookIcon width={x(55)} height={x(55)} />
            </Pressable>
          </View>

          <Pressable
            onPress={() => router.push("/create-account")}
            style={styles.createAccountWrapper}
          >
            <Text style={styles.createAccountText}>Don’t have an account?</Text>
          </Pressable>
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  screen: {
    flex: 1,
    backgroundColor: colors.background,
  },

  scrollContent: {
    minHeight: y(940),
    backgroundColor: colors.background,
  },

  figmaFrame: {
    width: "100%",
    height: y(940),
    position: "relative",
    backgroundColor: colors.background,
  },

  title: {
    position: "absolute",
    left: x(20),
    top: y(123),
    width: x(362),
    height: y(39),
    color: colors.primary,
    fontFamily: "Quiche",
    fontSize: x(30),
    lineHeight: y(39),
    textAlign: "center",
  },

  subtitle: {
    position: "absolute",
    left: x(20),
    top: y(205),
    width: x(362),
    height: y(48),
    color: colors.primary,
    fontFamily: "Literata",
    fontSize: x(20),
    lineHeight: y(24),
  },

  emailInput: {
    position: "absolute",
    left: x(20),
    top: y(288),
  },

  passwordInput: {
    position: "absolute",
    left: x(20),
    top: y(396),
  },

  forgotPasswordWrapper: {
    position: "absolute",
    left: x(299),
    top: y(504),
    width: x(83),
    height: y(24),
    alignItems: "flex-end",
    justifyContent: "center",
  },

  forgotPasswordText: {
    color: colors.primary,
    fontFamily: "Literata",
    fontSize: x(20),
    lineHeight: y(24),
    textDecorationLine: "underline",
  },

  errorText: {
    position: "absolute",
    left: x(20),
    top: y(535),
  },

  buttonWrapper: {
    position: "absolute",
    left: x(96),
    top: y(573),
    width: x(210),
    height: y(52),
  },

  loginButton: {
    width: x(210),
    height: y(52),
    borderRadius: x(20),
  },

  orText: {
    position: "absolute",
    left: x(20),
    top: y(686),
    width: x(362),
    height: y(24),
    color: colors.primary,
    fontFamily: "Literata",
    fontSize: x(20),
    lineHeight: y(24),
    textAlign: "center",
  },

  socialRow: {
    position: "absolute",
    left: x(104),
    top: y(766),
    width: x(194),
    height: y(60),
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },

  socialButton: {
    width: x(55),
    height: x(55),
    alignItems: "center",
    justifyContent: "center",
  },

  createAccountWrapper: {
    position: "absolute",
    left: x(20),
    top: y(872),
    width: x(250),
    height: y(24),
    justifyContent: "center",
  },

  createAccountText: {
    color: colors.primary,
    fontFamily: "Literata",
    fontSize: x(20),
    lineHeight: y(24),
    textDecorationLine: "underline",
  },
});