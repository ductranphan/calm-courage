/**
 * Email sign-up screen.
 *
 * Collects parent email, password, PIN, and terms agreement before account creation.
 */
import { useState } from "react";
import {
  ActivityIndicator,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from "react-native";
import { router } from "expo-router";

import AppButton from "@/components/AppButton";
import AppTextInput from "@/components/AppTextInput";
import BackButton from "@/components/BackButton";
import PinInput from "@/components/PinInput";
import TermsModal from "@/components/TermsModal";
import { useAuth } from "@/contexts/AuthContext";
import { colors } from "@/constants/colors";
import { isValidPin } from "@/utils/pin";

export default function EmailSignupScreen() {
  const { signUp } = useAuth();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [pin, setPin] = useState("");
  const [termsAccepted, setTermsAccepted] = useState(false);
  const [termsModalVisible, setTermsModalVisible] = useState(false);
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

    if (!isValidPin(pin)) {
      setError("Please enter a 4-digit PIN.");
      return;
    }

    if (!termsAccepted) {
      setError("Please agree to the Terms of Service and Privacy Policy.");
      return;
    }

    setLoading(true);

    try {
      await signUp(email, password, pin);
      router.replace("/terms");
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
        <Text style={styles.title}>Create Parent Account</Text>
        <Text style={styles.subtitle}>
          Join us to start your child&apos;s confidence journey.
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
            placeholder="Create password"
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

        <Text style={styles.pinLabel}>Create PIN</Text>
        <PinInput value={pin} onChange={setPin} />

        <Pressable
          style={styles.termsRow}
          onPress={() => setTermsAccepted((current) => !current)}
        >
          <View style={[styles.checkbox, termsAccepted && styles.checkboxChecked]}>
            {termsAccepted ? <Text style={styles.checkmark}>✓</Text> : null}
          </View>
          <Text style={styles.termsText}>
            I agree to the{" "}
            <Text
              style={styles.termsLink}
              onPress={() => setTermsModalVisible(true)}
            >
              Terms of Service
            </Text>{" "}
            and{" "}
            <Text
              style={styles.termsLink}
              onPress={() => setTermsModalVisible(true)}
            >
              Privacy Policy
            </Text>
            .
          </Text>
        </Pressable>

        {error ? <Text style={styles.error}>{error}</Text> : null}

        <View style={styles.button}>
          {loading ? (
            <ActivityIndicator color={colors.primary} />
          ) : (
            <AppButton title="Send Verification Email" onPress={handleSignUp} />
          )}
        </View>
      </ScrollView>

      <TermsModal
        visible={termsModalVisible}
        onClose={() => setTermsModalVisible(false)}
      />
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
  pinLabel: {
    color: colors.primary,
    fontFamily: "Literata",
    fontSize: 20,
    lineHeight: 24,
    marginTop: 4,
  },
  termsRow: {
    flexDirection: "row",
    alignItems: "flex-start",
    gap: 12,
    marginTop: 4,
  },
  checkbox: {
    width: 22,
    height: 22,
    borderWidth: 1,
    borderColor: colors.primary,
    borderRadius: 4,
    backgroundColor: colors.white,
    alignItems: "center",
    justifyContent: "center",
    marginTop: 2,
  },
  checkboxChecked: {
    backgroundColor: colors.lavender,
  },
  checkmark: {
    color: colors.primary,
    fontSize: 14,
    lineHeight: 16,
  },
  termsText: {
    flex: 1,
    color: colors.primary,
    fontFamily: "Literata",
    fontSize: 16,
    lineHeight: 22,
  },
  termsLink: {
    textDecorationLine: "underline",
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
