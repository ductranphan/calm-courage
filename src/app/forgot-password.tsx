/**
 * Forgot password screen.
 *
 * Sends a Firebase password reset email to the parent.
 */
import { useState } from "react";
import {
  ActivityIndicator,
  StyleSheet,
  Text,
  View,
} from "react-native";

import AppButton from "@/components/AppButton";
import AppTextInput from "@/components/AppTextInput";
import BackButton from "@/components/BackButton";
import { useAuth } from "@/contexts/AuthContext";
import { colors } from "@/constants/colors";

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
        err instanceof Error ? err.message : "Unable to send reset email."
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
    paddingHorizontal: 24,
    paddingTop: 72,
    gap: 16,
  },
  title: {
    color: colors.primary,
    fontFamily: "Literata",
    fontSize: 30,
    lineHeight: 39,
    textAlign: "center",
  },
  subtitle: {
    color: colors.primary,
    fontFamily: "Literata",
    fontSize: 18,
    lineHeight: 24,
    textAlign: "center",
  },
  form: {
    marginTop: 8,
  },
  error: {
    color: "#B00020",
    fontFamily: "Literata",
    fontSize: 16,
    lineHeight: 22,
    textAlign: "center",
  },
  success: {
    color: colors.primary,
    fontFamily: "Literata",
    fontSize: 16,
    lineHeight: 22,
    textAlign: "center",
  },
  button: {
    alignItems: "center",
    minHeight: 52,
    justifyContent: "center",
  },
});
