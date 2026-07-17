/**
 * Forgot password success screen.
 *
 * Matches Figma Screen 1.1.2: Sending password reset link.
 * Shows confirmation after the password reset email is sent.
 */
import { router, useLocalSearchParams } from "expo-router";
import { sendPasswordResetEmail } from "firebase/auth";
import { useState } from "react";
import {
  ActivityIndicator,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from "react-native";

import AppButton from "@/components/ui/AppButton";
import ErrorMessage from "@/components/ui/ErrorMessage";
import Logo from "@/components/ui/Logo";
import { auth } from "@/config/firebase";
import { colors } from "@/constants/colors";
import { x, y } from "@/utils/scaling";

export default function ForgotPasswordSuccessScreen() {
  const { email = "" } = useLocalSearchParams<{ email?: string }>();

  const [resending, setResending] = useState(false);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  async function handleResendEmail() {
    setSuccessMessage(null);
    setError(null);

    if (!email) {
      router.replace("/forgot-password");
      return;
    }

    setResending(true);

    try {
      await sendPasswordResetEmail(auth, email.trim());
      setSuccessMessage("Reset link sent again.");
    } catch {
      setError("Unable to resend. Please try again.");
    } finally {
      setResending(false);
    }
  }

  return (
    <ScrollView
      style={styles.screen}
      contentContainerStyle={styles.scrollContent}
      showsVerticalScrollIndicator={false}
    >
      <View style={styles.figmaFrame}>
        <View style={styles.logoWrapper}>
          <Logo width={x(360.31)} height={y(134)} shadow />
        </View>

        <View style={styles.textWrapper}>
          <Text style={styles.title}>Check Your Email</Text>

          <Text style={styles.description}>
            We’ve sent a password reset link to{"\n"}
            your email.{"\n\n"}
            Please check your inbox and follow{"\n"}
            instructions.
          </Text>
        </View>

        <View style={styles.buttonWrapper}>
          <AppButton
            title="Back to Login"
            onPress={() => router.replace("/login")}
            style={styles.backButton}
          />
        </View>

        {successMessage ? (
          <Text style={styles.successMessage}>{successMessage}</Text>
        ) : null}

        <ErrorMessage message={error} style={styles.errorMessage} />

        <Pressable
          onPress={handleResendEmail}
          style={styles.resendWrapper}
          disabled={resending}
        >
          {resending ? (
            <ActivityIndicator color={colors.primary} />
          ) : (
            <Text style={styles.resendText}>
              Didn&apos;t get an email? Resend
            </Text>
          )}
        </Pressable>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  screen: {
    flex: 1,
    backgroundColor: colors.background,
  },

  scrollContent: {
    minHeight: y(874),
    backgroundColor: colors.background,
  },

  figmaFrame: {
    width: "100%",
    height: y(874),
    position: "relative",
    backgroundColor: colors.background,
  },

  logoWrapper: {
    position: "absolute",
    left: x(21),
    top: y(140),
    width: x(360.31),
    height: y(134),
    alignItems: "center",
    justifyContent: "center",
  },

  textWrapper: {
    position: "absolute",
    left: x(20),
    top: y(358),
    width: x(362),
    height: y(168),
    alignItems: "center",
  },

  title: {
    width: x(362),
    color: colors.primary,
    fontFamily: "Literata",
    fontSize: x(20),
    lineHeight: y(24),
    textAlign: "center",
    marginBottom: y(32),
  },

  description: {
    width: x(362),
    color: colors.primary,
    fontFamily: "Literata",
    fontSize: x(20),
    lineHeight: y(24),
    textAlign: "center",
  },

  buttonWrapper: {
    position: "absolute",
    left: x(96),
    top: y(610),
    width: x(210),
    height: y(84),
  },

  backButton: {
    width: x(210),
    height: y(84),
    borderRadius: x(20),
  },

  successMessage: {
    position: "absolute",
    left: x(20),
    top: y(720),
    width: x(362),
    color: "#28B775",
    fontFamily: "Literata",
    fontSize: x(16),
    lineHeight: y(22),
    textAlign: "center",
  },

  errorMessage: {
    position: "absolute",
    left: x(20),
    top: y(720),
  },

  resendWrapper: {
    position: "absolute",
    left: x(20),
    top: y(814),
    width: x(263),
    height: y(24),
    justifyContent: "center",
  },

  resendText: {
    color: colors.primary,
    fontFamily: "Literata",
    fontSize: x(20),
    lineHeight: y(24),
    textDecorationLine: "underline",
  },
});