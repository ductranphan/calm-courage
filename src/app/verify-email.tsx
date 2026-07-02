/**
 * Email verification screen.
 *
 * Guides parents to verify their email before accessing the app.
 */
import { useState } from "react";
import {
  ActivityIndicator,
  StyleSheet,
  Text,
  View,
} from "react-native";
import { router } from "expo-router";

import AppButton from "@/components/AppButton";
import { useAuth } from "@/contexts/AuthContext";
import { colors } from "@/constants/colors";

export default function VerifyEmailScreen() {
  const { user, sendVerificationEmail, reloadUser, signOut } = useAuth();
  const [error, setError] = useState<string | null>(null);
  const [message, setMessage] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  async function handleResend() {
    setError(null);
    setMessage(null);
    setLoading(true);

    try {
      await sendVerificationEmail();
      setMessage("Verification email sent.");
    } catch (err) {
      setError(
        err instanceof Error ? err.message : "Unable to send verification email."
      );
    } finally {
      setLoading(false);
    }
  }

  async function handleVerified() {
    setError(null);
    setMessage(null);
    setLoading(true);

    try {
      const refreshedUser = await reloadUser();
      if (refreshedUser?.emailVerified) {
        router.replace("/home");
        return;
      }

      setMessage("Email not verified yet. Check your inbox and try again.");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Unable to refresh status.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Verify Email</Text>
      <Text style={styles.subtitle}>
        We sent a verification link to{"\n"}
        {user?.email ?? "your email address"}.
      </Text>
      <Text style={styles.body}>
        Open the link in your inbox, then return here and tap the button below.
      </Text>

      {error ? <Text style={styles.error}>{error}</Text> : null}
      {message ? <Text style={styles.message}>{message}</Text> : null}

      <View style={styles.actions}>
        {loading ? (
          <ActivityIndicator color={colors.primary} />
        ) : (
          <>
            <AppButton title="I've Verified" onPress={handleVerified} />
            <AppButton title="Resend Email" onPress={handleResend} />
            <AppButton title="Sign Out" onPress={() => signOut()} />
          </>
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
    paddingTop: 96,
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
  body: {
    color: colors.primary,
    fontFamily: "Literata",
    fontSize: 16,
    lineHeight: 22,
    textAlign: "center",
  },
  error: {
    color: "#B00020",
    fontFamily: "Literata",
    fontSize: 16,
    lineHeight: 22,
    textAlign: "center",
  },
  message: {
    color: colors.primary,
    fontFamily: "Literata",
    fontSize: 16,
    lineHeight: 22,
    textAlign: "center",
  },
  actions: {
    alignItems: "center",
    gap: 12,
    marginTop: 8,
    minHeight: 52,
  },
});
