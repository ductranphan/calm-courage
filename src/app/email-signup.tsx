/**
 * Email sign-up screen.
 *
 * Collects parent email and password, creates a Firebase account, and sends verification.
 */
import { useState } from "react";
import {
  ActivityIndicator,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from "react-native";
import { router } from "expo-router";

import AppButton from "@/components/AppButton";
import AppTextInput from "@/components/AppTextInput";
import BackButton from "@/components/BackButton";
import { useAuth } from "@/contexts/AuthContext";
import { colors } from "@/constants/colors";

export default function EmailSignupScreen() {
  const { signUp, sendVerificationEmail } = useAuth();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  async function handleSignUp() {
    setError(null);

    if (password.length < 6) {
      setError("Password must be at least 6 characters.");
      return;
    }

    if (password !== confirmPassword) {
      setError("Passwords do not match.");
      return;
    }

    setLoading(true);

    try {
      await signUp(email, password);
      await sendVerificationEmail();
      router.replace("/verify-email");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Unable to create account.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <View style={styles.container}>
      <BackButton />

      <ScrollView
        style={styles.scroll}
        contentContainerStyle={styles.content}
        keyboardShouldPersistTaps="handled"
      >
        <Text style={styles.title}>Email Sign-Up</Text>
        <Text style={styles.subtitle}>
          Create your parent account to get started.
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

          <AppTextInput
            placeholder="Create a password"
            value={password}
            onChangeText={setPassword}
            secureTextEntry
            textContentType="newPassword"
          />

          <AppTextInput
            placeholder="Confirm password"
            value={confirmPassword}
            onChangeText={setConfirmPassword}
            secureTextEntry
            textContentType="newPassword"
          />
        </View>

        {error ? <Text style={styles.error}>{error}</Text> : null}

        <View style={styles.button}>
          {loading ? (
            <ActivityIndicator color={colors.primary} />
          ) : (
            <AppButton title="Create Account" onPress={handleSignUp} />
          )}
        </View>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  scroll: {
    flex: 1,
  },
  content: {
    paddingHorizontal: 24,
    paddingTop: 120,
    paddingBottom: 40,
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
    marginBottom: 8,
  },
  form: {
    gap: 16,
    marginTop: 8,
  },
  error: {
    color: "#B00020",
    fontFamily: "Literata",
    fontSize: 16,
    lineHeight: 22,
    textAlign: "center",
  },
  button: {
    alignItems: "center",
    marginTop: 8,
    minHeight: 52,
    justifyContent: "center",
  },
});
