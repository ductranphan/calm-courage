/**
 * Email sign-up screen.
 *
 * Matches Figma Screen 2.0: Parent Sign-Up & Security.
 * Collects the parent's email, password, PIN, and terms agreement.
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

import CheckIcon from "../../assets/icons/check.svg";
import TermsModal from "@/components/modals/TermsModal";
import AppButton from "@/components/ui/AppButton";
import BackButton from "@/components/ui/BackButton";
import FloatingTextInput from "@/components/ui/FloatingTextInput";
import PinInput from "@/components/ui/PinInput";
import { colors } from "@/constants/colors";
import { useAuth } from "@/contexts/AuthContext";
import { isValidPin } from "@/utils/pin";
import { x, y } from "@/utils/scaling";

export default function EmailSignupScreen() {
  const { signUp, sendVerificationEmail } = useAuth();

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

    if (!termsAccepted) {
      setError("Please agree to the Terms of Service and Privacy Policy.");
      return;
    }

    if (!isValidPin(pin)) {
      setError("Please create a 4-digit PIN.");
      return;
    }

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
      await signUp(email, password, pin);
      await sendVerificationEmail();
      router.replace("/verify-email");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Unable to create account.");
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
          <BackButton />

          <Text style={styles.title}>Create Parent Account</Text>

          <Text style={styles.subtitle}>
            Join us to start your child's{"\n"}confidence journey.
          </Text>

          <View style={styles.emailInput}>
            <FloatingTextInput
              label="Enter your email"
              value={email}
              onChangeText={setEmail}
              autoCapitalize="none"
              autoCorrect={false}
              keyboardType="email-address"
            />
          </View>

          <View style={styles.passwordInput}>
            <FloatingTextInput
              label="Create password"
              value={password}
              onChangeText={setPassword}
              secureTextEntry
            />
          </View>

          <View style={styles.confirmInput}>
            <FloatingTextInput
              label="Confirm password"
              value={confirmPassword}
              onChangeText={setConfirmPassword}
              secureTextEntry
            />
          </View>

          <View style={styles.pinSection}>
            <Text style={styles.pinLabel}>Create PIN</Text>

            <View style={styles.pinRow}>
              <PinInput value={pin} onChange={setPin} />
            </View>
          </View>

          <View style={styles.termsRow}>
            <Pressable
              onPress={() => setTermsAccepted((current) => !current)}
              style={styles.checkbox}
            >
              {termsAccepted ? (
                <CheckIcon width={x(14)} height={x(14)} />
              ) : null}
            </Pressable>

            <Pressable onPress={() => setTermsModalVisible(true)}>
              <Text style={styles.termsText}>
                I agree to the Terms of Service and{"\n"}Privacy Policy.
              </Text>
            </Pressable>
          </View>

          {error ? <Text style={styles.error}>{error}</Text> : null}

          <View style={styles.buttonWrapper}>
            {loading ? (
              <ActivityIndicator color={colors.primary} />
            ) : (
              <AppButton
                title={"Send\nVerification Email"}
                onPress={handleSignUp}
                style={styles.sendButton}
              />
            )}
          </View>

          <TermsModal
            visible={termsModalVisible}
            onClose={() => setTermsModalVisible(false)}
          />
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
    minHeight: y(960),
    backgroundColor: colors.background,
  },

  figmaFrame: {
    width: "100%",
    height: y(960),
    position: "relative",
    backgroundColor: colors.background,
  },

  title: {
    position: "absolute",
    left: x(35),
    top: y(123),
    width: x(331),
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
    top: y(188),
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
    top: y(262),
  },

  passwordInput: {
    position: "absolute",
    left: x(20),
    top: y(370),
  },

  confirmInput: {
    position: "absolute",
    left: x(20),
    top: y(478),
  },

  pinSection: {
    position: "absolute",
    left: x(20),
    top: y(583),
    width: x(361),
    height: y(122),
  },

  pinLabel: {
    color: colors.primary,
    fontFamily: "Literata",
    fontSize: x(20),
    lineHeight: y(30),
  },

  pinRow: {
    marginTop: y(9),
    width: x(361),
    alignItems: "center",
  },

  termsRow: {
    position: "absolute",
    left: x(20),
    top: y(758),
    flexDirection: "row",
    alignItems: "flex-start",
  },

  checkbox: {
    width: x(24),
    height: x(24),
    borderWidth: 1,
    borderColor: colors.primary,
    backgroundColor: colors.white,
    alignItems: "center",
    justifyContent: "center",
    marginRight: x(8),
  },

  termsText: {
    width: x(328),
    minHeight: y(48),
    color: colors.primary,
    fontFamily: "Literata",
    fontSize: x(20),
    lineHeight: y(24),
    textDecorationLine: "underline",
  },

  error: {
    position: "absolute",
    left: x(20),
    top: y(812),
    width: x(362),
    color: "#B00020",
    fontFamily: "Literata",
    fontSize: x(13),
    textAlign: "center",
  },

  buttonWrapper: {
    position: "absolute",
    left: x(96),
    top: y(850),
    width: x(210),
    height: y(84),
    alignItems: "center",
    justifyContent: "center",
  },

  sendButton: {
    width: x(210),
    height: y(84),
    borderRadius: x(20),
  },
});