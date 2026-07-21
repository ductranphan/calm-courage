/**
 * Forgot password screen.
 *
 * Matches Figma Screen 1.1.1.
 * Allows the parent to request a password reset link.
 */

import { router } from "expo-router";
import { sendPasswordResetEmail } from "firebase/auth";
import { useState } from "react";
<<<<<<< HEAD
import { ActivityIndicator, StyleSheet, Text, View } from "react-native";

import AppButton from "@/components/ui/AppButton";
import AppTextInput from "@/components/ui/AppTextInput";
import BackButton from "@/components/ui/BackButton";
import { colors } from "@/constants/colors";
import { useAuth } from "@/contexts/AuthContext";
=======
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

import AppButton from "@/components/ui/AppButton";
import ErrorMessage from "@/components/ui/ErrorMessage";
import FloatingTextInput from "@/components/ui/FloatingTextInput";
import Logo from "@/components/ui/Logo";
import { auth } from "@/config/firebase";
import { colors } from "@/constants/colors";
>>>>>>> 085db16234b9c8005b24ff1b18f08fb73e237d40
import { x, y } from "@/utils/scaling";

export default function ForgotPasswordScreen() {
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleSendResetLink() {
    setError(null);

    if (!email.trim()) {
      setError("This email address is not registered.");
      return;
    }

    setLoading(true);

    try {
<<<<<<< HEAD
      await resetPassword(email);
      setSuccess("Check your inbox for a password reset link.");
    } catch (err) {
      setError(
        err instanceof Error ? err.message : "Unable to send reset email.",
      );
=======
      await sendPasswordResetEmail(auth, email.trim());

      router.replace({
        pathname: "/forgot-password-success",
        params: {
          email: email.trim(),
        },
      });
    } catch {
      setError("This email address is not registered.");
>>>>>>> 085db16234b9c8005b24ff1b18f08fb73e237d40
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
          <View style={styles.logoWrapper}>
            <Logo width={x(360.31)} height={y(134)} shadow />
          </View>

<<<<<<< HEAD
      <Text style={styles.title}>Forgot Password</Text>

      <Text style={styles.subtitle}>
        Enter your email and we will send you a reset link.
      </Text>
=======
          <View style={styles.textWrapper}>
            <Text style={styles.title}>Forgot Password?</Text>
>>>>>>> 085db16234b9c8005b24ff1b18f08fb73e237d40

            <Text style={styles.description}>
              Enter your email address below and{"\n"}
              we&apos;ll send you a link to reset your{"\n"}
              password.
            </Text>
          </View>

          <View style={styles.inputWrapper}>
            <FloatingTextInput
              label="Email address"
              placeholder="Emma@example.com"
              value={email}
              onChangeText={setEmail}
              autoCapitalize="none"
              autoCorrect={false}
              keyboardType="email-address"
            />
          </View>

          <ErrorMessage message={error} style={styles.errorText} />

          <View style={styles.buttonWrapper}>
            {loading ? (
              <ActivityIndicator color={colors.primary} />
            ) : (
              <AppButton
                title={"Send\nReset Link"}
                onPress={handleSendResetLink}
                style={styles.resetButton}
              />
            )}
          </View>

          <Pressable
            onPress={() => router.replace("/login")}
            style={styles.backLoginWrapper}
          >
            <Text style={styles.backLoginText}>← Back to Login</Text>
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
<<<<<<< HEAD
    paddingHorizontal: x(24),
    paddingTop: y(72),
    gap: y(16),
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
    fontSize: x(18),
    lineHeight: y(24),
    textAlign: "center",
  },

  form: {
    marginTop: y(8),
  },

  error: {
    color: "#B00020",
    fontFamily: "Literata",
    fontSize: x(16),
    lineHeight: y(22),
    textAlign: "center",
  },

  success: {
    color: colors.primary,
    fontFamily: "Literata",
    fontSize: x(16),
    lineHeight: y(22),
    textAlign: "center",
  },

  button: {
    alignItems: "center",
    minHeight: y(52),
    justifyContent: "center",
  },
=======
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
    top: y(322),
    width: x(362),
    height: y(120),
    alignItems: "center",
  },

  title: {
    width: x(362),
    color: colors.primary,
    fontFamily: "Literata",
    fontSize: x(20),
    lineHeight: y(24),
    textAlign: "center",
    marginBottom: y(24),
  },

  description: {
    width: x(362),
    color: colors.primary,
    fontFamily: "Literata",
    fontSize: x(20),
    lineHeight: y(24),
    textAlign: "center",
  },

  inputWrapper: {
    position: "absolute",
    left: x(20),
    top: y(490),
    width: x(362),
    height: y(72),
  },

  errorText: {
    position: "absolute",
    left: x(20),
    top: y(565),
  },

  buttonWrapper: {
    position: "absolute",
    left: x(96),
    top: y(610),
    width: x(210),
    height: y(84),
  },

  resetButton: {
    width: x(210),
    height: y(84),
    borderRadius: x(20),
  },

  backLoginWrapper: {
    position: "absolute",
    left: x(20),
    top: y(814),
    width: x(145),
    height: y(24),
  },

  backLoginText: {
    color: colors.primary,
    fontFamily: "Literata",
    fontSize: x(20),
    lineHeight: y(24),
    textDecorationLine: "underline",
  },
>>>>>>> 085db16234b9c8005b24ff1b18f08fb73e237d40
});