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
  const {
    signUp,
    sendVerificationEmail,
  } = useAuth();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [
    confirmPassword,
    setConfirmPassword,
  ] = useState("");

  const [pin, setPin] = useState("");
  const [
    termsAccepted,
    setTermsAccepted,
  ] = useState(false);

  const [
    termsModalVisible,
    setTermsModalVisible,
  ] = useState(false);

  const [error, setError] =
    useState<string | null>(null);

  const [loading, setLoading] =
    useState(false);

  function validateForm(): string | null {
    const normalizedEmail = email
      .trim()
      .toLowerCase();

    if (!normalizedEmail) {
      return "Please enter your email address.";
    }

    if (
      !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(
        normalizedEmail,
      )
    ) {
      return "Please enter a valid email address.";
    }

    if (password.length < 6) {
      return "Password must be at least 6 characters.";
    }

    if (password !== confirmPassword) {
      return "Passwords do not match.";
    }

    if (!isValidPin(pin)) {
      return "Please create a 4-digit PIN.";
    }

    if (!termsAccepted) {
      return "Please agree to the Terms of Service and Privacy Policy.";
    }

    return null;
  }

  async function handleSignUp() {
    if (loading) {
      return;
    }

    setError(null);

    const validationError = validateForm();

    if (validationError) {
      setError(validationError);
      return;
    }

    const normalizedEmail = email
      .trim()
      .toLowerCase();

    setLoading(true);

    try {
      /*
       * signUp creates both:
       *
       * 1. Firebase Authentication user
       * 2. Firestore parents/{uid} profile
       */
      await signUp(
        normalizedEmail,
        password,
        pin,
      );
    } catch (signUpError) {
      console.error(
        "Unable to create parent account:",
        signUpError,
      );

      setError(
        signUpError instanceof Error
          ? signUpError.message
          : "Unable to create account.",
      );

      setLoading(false);
      return;
    }

    try {
      /*
       * The account already exists at this point.
       *
       * If email sending fails, the parent can still continue to
       * the verification page and press Resend link.
       */
      await sendVerificationEmail();
    } catch (verificationError) {
      console.error(
        "Account created, but verification email could not be sent:",
        verificationError,
      );
    } finally {
      setLoading(false);
    }

    router.replace("/verify-email");
  }

  return (
    <KeyboardAvoidingView
      style={styles.screen}
      behavior={
        Platform.OS === "ios"
          ? "padding"
          : "height"
      }
    >
      <ScrollView
        contentContainerStyle={
          styles.scrollContent
        }
        keyboardShouldPersistTaps="handled"
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.figmaFrame}>
          <BackButton />

          <Text style={styles.title}>
            Create Parent Account
          </Text>

          <Text style={styles.subtitle}>
            Join us to start your child{"'"}s
            {"\n"}
            confidence journey.
          </Text>

          <View style={styles.emailInput}>
            <FloatingTextInput
              label="Enter your email"
              value={email}
              onChangeText={(value) => {
                setEmail(value);
                setError(null);
              }}
              autoCapitalize="none"
              autoCorrect={false}
              spellCheck={false}
              keyboardType="email-address"
              textContentType="emailAddress"
              autoComplete="email"
              returnKeyType="next"
              editable={!loading}
            />
          </View>

          <View style={styles.passwordInput}>
            <FloatingTextInput
              label="Create password"
              value={password}
              onChangeText={(value) => {
                setPassword(value);
                setError(null);
              }}
              secureTextEntry
              autoCapitalize="none"
              autoCorrect={false}
              spellCheck={false}
              textContentType="none"
              autoComplete="off"
              returnKeyType="next"
              editable={!loading}
              style={styles.secureInput}
            />
          </View>

          <View style={styles.confirmInput}>
            <FloatingTextInput
              label="Confirm password"
              value={confirmPassword}
              onChangeText={(value) => {
                setConfirmPassword(value);
                setError(null);
              }}
              secureTextEntry
              autoCapitalize="none"
              autoCorrect={false}
              spellCheck={false}
              textContentType="none"
              autoComplete="off"
              returnKeyType="done"
              editable={!loading}
              style={styles.secureInput}
              onSubmitEditing={handleSignUp}
            />
          </View>

          <View style={styles.pinSection}>
            <Text style={styles.pinLabel}>
              Create PIN
            </Text>

            <View style={styles.pinRow}>
              <PinInput
                value={pin}
                onChange={(value) => {
                  setPin(value);
                  setError(null);
                }}
              />
            </View>
          </View>

          <View style={styles.termsRow}>
            <Pressable
              onPress={() => {
                setTermsAccepted(
                  (current) => !current,
                );
                setError(null);
              }}
              disabled={loading}
              style={[
                styles.checkbox,
                loading &&
                  styles.disabledControl,
              ]}
              accessibilityRole="checkbox"
              accessibilityLabel="Agree to Terms of Service and Privacy Policy"
              accessibilityState={{
                checked: termsAccepted,
                disabled: loading,
              }}
            >
              {termsAccepted ? (
                <CheckIcon
                  width={x(14)}
                  height={x(14)}
                />
              ) : null}
            </Pressable>

            <Pressable
              onPress={() =>
                setTermsModalVisible(true)
              }
              disabled={loading}
              accessibilityRole="button"
              accessibilityLabel="Read Terms of Service and Privacy Policy"
            >
              <Text style={styles.termsText}>
                I agree to the Terms of Service
                and{"\n"}
                Privacy Policy.
              </Text>
            </Pressable>
          </View>

          {error ? (
            <Text
              style={styles.error}
              accessibilityRole="alert"
            >
              {error}
            </Text>
          ) : null}

          <View style={styles.buttonWrapper}>
            {loading ? (
              <ActivityIndicator
                size="large"
                color={colors.primary}
              />
            ) : (
              <AppButton
                title={
                  "Send\nVerification Email"
                }
                onPress={handleSignUp}
                style={styles.sendButton}
              />
            )}
          </View>

          <TermsModal
            visible={termsModalVisible}
            onClose={() =>
              setTermsModalVisible(false)
            }
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

  /*
   * Both password inputs use exactly the same font and spacing.
   *
   * iOS can display secure characters differently when a custom
   * font or password autofill is active. Using the system font for
   * secure fields keeps their dots visually identical.
   */
  secureInput: {
    fontFamily:
      Platform.OS === "ios"
        ? "System"
        : "Literata",
    letterSpacing: 0,
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

  disabledControl: {
    opacity: 0.6,
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
    lineHeight: y(18),
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