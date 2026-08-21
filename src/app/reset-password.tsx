/**
 * Reset password screen.
 *
 * Completes Firebase password reset using the oobCode from the email link
 * (query param on /reset-password?oobCode=...).
 */

import { router, useLocalSearchParams } from "expo-router";
import { useMemo, useState } from "react";
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
import { colors } from "@/constants/colors";
import { useAuth } from "@/contexts/AuthContext";
import { x, y } from "@/utils/scaling";

const MIN_PASSWORD_LENGTH = 6;

export default function ResetPasswordScreen() {
  const { confirmPasswordReset } = useAuth();

  const params = useLocalSearchParams<{
    oobCode?: string | string[];
    mode?: string | string[];
  }>();

  const oobCode = useMemo(() => {
    const raw = Array.isArray(params.oobCode)
      ? params.oobCode[0]
      : params.oobCode;
    return typeof raw === "string" ? raw.trim() : "";
  }, [params.oobCode]);

  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);

  function handleNewPasswordChange(text: string) {
    setNewPassword(text);

    if (
      error &&
      text === confirmPassword &&
      text.length >= MIN_PASSWORD_LENGTH
    ) {
      setError(null);
    }
  }

  function handleConfirmPasswordChange(text: string) {
    setConfirmPassword(text);

    if (
      error &&
      newPassword === text &&
      newPassword.length >= MIN_PASSWORD_LENGTH
    ) {
      setError(null);
    }
  }

  async function handleUpdatePassword() {
    setError(null);

    if (!oobCode) {
      setError(
        "Open the reset link from your email to continue, or request a new reset email.",
      );
      return;
    }

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

    setLoading(true);

    try {
      await confirmPasswordReset(oobCode, newPassword);
      setSuccess(true);
    } catch (resetError) {
      setError(
        resetError instanceof Error
          ? resetError.message
          : "Unable to reset password. Please try again.",
      );
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

          <View style={styles.textWrapper}>
            <Text style={styles.title}>
              {success
                ? "Password Updated"
                : "Reset Your Password"}
            </Text>

            <Text style={styles.description}>
              {success
                ? "Your password was changed.\nYou can sign in with your new password."
                : "Please enter a new password for your\naccount."}
            </Text>
          </View>

          {!success ? (
            <>
              <View style={styles.newPasswordInput}>
                <FloatingTextInput
                  label="New password"
                  placeholder="New password"
                  value={newPassword}
                  onChangeText={handleNewPasswordChange}
                  secureTextEntry
                  editable={!loading}
                />
              </View>

              <View style={styles.confirmPasswordInput}>
                <FloatingTextInput
                  label="Confirm new password"
                  placeholder="Confirm new password"
                  value={confirmPassword}
                  onChangeText={handleConfirmPasswordChange}
                  secureTextEntry
                  editable={!loading}
                />
              </View>

              <ErrorMessage
                message={error}
                style={styles.errorText}
              />

              <View style={styles.buttonWrapper}>
                {loading ? (
                  <ActivityIndicator
                    size="large"
                    color={colors.primary}
                  />
                ) : (
                  <AppButton
                    title="Update Password"
                    onPress={() => {
                      void handleUpdatePassword();
                    }}
                    style={styles.updateButton}
                  />
                )}
              </View>
            </>
          ) : (
            <View style={styles.buttonWrapper}>
              <AppButton
                title="Go to Login"
                onPress={() => router.replace("/login")}
                style={styles.updateButton}
              />
            </View>
          )}

          <Pressable
            onPress={() => router.replace("/login")}
            style={styles.backLoginWrapper}
          >
            <Text style={styles.backLoginText}>
              ← Back to Login
            </Text>
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
    alignItems: "center",
    justifyContent: "center",
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
