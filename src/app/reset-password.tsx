/**
 * Reset password screen.
 *
 * Matches Figma Screen 1.1.3.
 * Lets the user enter and confirm a new password.
 *
 * Firebase note:
 * Later, this screen should receive the Firebase reset code from the email link
 * and use confirmPasswordReset(auth, oobCode, newPassword).
 */

import { router } from "expo-router";
import { useState } from "react";
import {
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
import { colors } from "@/constants/colors";
import { x, y } from "@/utils/scaling";

const MIN_PASSWORD_LENGTH = 6;

export default function ResetPasswordScreen() {
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [error, setError] = useState<string | null>(null);

  function handleNewPasswordChange(text: string) {
    setNewPassword(text);

    if (error && text === confirmPassword && text.length >= MIN_PASSWORD_LENGTH) {
      setError(null);
    }
  }

  function handleConfirmPasswordChange(text: string) {
    setConfirmPassword(text);

    if (error && newPassword === text && newPassword.length >= MIN_PASSWORD_LENGTH) {
      setError(null);
    }
  }

  function handleUpdatePassword() {
    setError(null);

    if (!newPassword || !confirmPassword) {
      return;
    }

    if (newPassword.length < MIN_PASSWORD_LENGTH) {
      setError("Password must be at least 6 characters.");
      return;
    }

    if (newPassword !== confirmPassword) {
      setError("Passwords do not match.");
      return;
    }

    router.replace("/login");
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

          <View style={styles.textWrapper}>
            <Text style={styles.title}>Reset Your Password</Text>

            <Text style={styles.description}>
              Please enter a new password for your{"\n"}account.
            </Text>
          </View>

          <View style={styles.newPasswordInput}>
            <FloatingTextInput
              label="New password"
              placeholder="New password"
              value={newPassword}
              onChangeText={handleNewPasswordChange}
              secureTextEntry
            />
          </View>

          <View style={styles.confirmPasswordInput}>
            <FloatingTextInput
              label="Confirm new password"
              placeholder="Confirm new password"
              value={confirmPassword}
              onChangeText={handleConfirmPasswordChange}
              secureTextEntry
            />
          </View>

          <ErrorMessage message={error} style={styles.errorText} />

          <View style={styles.buttonWrapper}>
            <AppButton
              title="Update Password"
              onPress={handleUpdatePassword}
              style={styles.updateButton}
            />
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
    height: y(96),
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

  newPasswordInput: {
    position: "absolute",
    left: x(20),
    top: y(490),
  },

  confirmPasswordInput: {
    position: "absolute",
    left: x(20),
    top: y(600),
  },

  errorText: {
    position: "absolute",
    left: x(20),
    top: y(675),
  },

  buttonWrapper: {
    position: "absolute",
    left: x(96),
    top: y(710),
    width: x(210),
    height: y(84),
  },

  updateButton: {
    width: x(210),
    height: y(84),
    borderRadius: x(20),
  },

  backLoginWrapper: {
    position: "absolute",
    left: x(20),
    top: y(825),
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
});