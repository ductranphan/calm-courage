/**
 * Forgot password screen.
 *
 * Sends a Firebase password reset email to the parent.
 */
import { useState } from "react";
import { ActivityIndicator, StyleSheet, Text, View } from "react-native";

import AppButton from "@/components/ui/AppButton";
import AppTextInput from "@/components/ui/AppTextInput";
import BackButton from "@/components/ui/BackButton";
import { colors } from "@/constants/colors";
import { useAuth } from "@/contexts/AuthContext";
import { x, y } from "@/utils/scaling";

export default function ForgotPasswordScreen() {
  const { resetPassword } = useAuth();
  const [email, setEmail] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  async function handleResetPassword() {
    setError(null);
    setSuccess(null);
    setLoading(true);

    try {
      await resetPassword(email);
      setSuccess("Check your inbox for a password reset link.");
    } catch (err) {
      setError(
        err instanceof Error ? err.message : "Unable to send reset email.",
      );
    } finally {
      setLoading(false);
    }
  }

  return (
    <View style={styles.container}>
      <BackButton />

      <Text style={styles.title}>Forgot Password</Text>

      <Text style={styles.subtitle}>
        Enter your email and we will send you a reset link.
      </Text>

      <View style={styles.form}>
        <AppTextInput
          placeholder="Enter your email"
          value={email}
          onChangeText={setEmail}
          autoCapitalize="none"
          autoCorrect={false}
          keyboardType="email-address"
          textContentType="emailAddress"
        />
      </View>

      {error ? <Text style={styles.error}>{error}</Text> : null}
      {success ? <Text style={styles.success}>{success}</Text> : null}

      <View style={styles.button}>
        {loading ? (
          <ActivityIndicator color={colors.primary} />
        ) : (
          <AppButton title="Send Reset Link" onPress={handleResetPassword} />
        )}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
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
});