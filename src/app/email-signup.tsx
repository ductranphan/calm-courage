/**
 * Email sign-up screen.
 *
 * Matches Figma Screen 2.0: Parent Sign-Up & Security.
 * Collects email, password, PIN, and the three required consent records.
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
import {
  type ConsentDocumentKind,
} from "@/constants/consent";
import { colors } from "@/constants/colors";
import { useAuth } from "@/contexts/AuthContext";
import type { SignUpConsent } from "@/services/auth";
import { isValidPin } from "@/utils/pin";
import { x, y } from "@/utils/scaling";

const CONTENT_HEIGHT = 1100;

type ConsentRowProps = {
  checked: boolean;
  disabled: boolean;
  label: string;
  accessibilityLabel: string;
  onToggle: () => void;
  onOpenDocument: () => void;
  style: object;
};

function ConsentRow({
  checked,
  disabled,
  label,
  accessibilityLabel,
  onToggle,
  onOpenDocument,
  style,
}: ConsentRowProps) {
  return (
    <View style={[styles.consentRow, style]}>
      <Pressable
        onPress={onToggle}
        disabled={disabled}
        style={[
          styles.checkbox,
          disabled && styles.disabledControl,
        ]}
        accessibilityRole="checkbox"
        accessibilityLabel={accessibilityLabel}
        accessibilityState={{
          checked,
          disabled,
        }}
      >
        {checked ? (
          <CheckIcon
            width={x(14)}
            height={x(14)}
          />
        ) : null}
      </Pressable>

      <Pressable
        onPress={onOpenDocument}
        disabled={disabled}
        accessibilityRole="button"
        accessibilityLabel={`Read ${label}`}
      >
        <Text style={styles.consentText}>
          {label}
        </Text>
      </Pressable>
    </View>
  );
}

export default function EmailSignupScreen() {
  const {
    signUp,
    sendVerificationEmail,
  } = useAuth();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [pin, setPin] = useState("");

  const [consent, setConsent] = useState<SignUpConsent>({
    termsOfUse: false,
    privacyPolicy: false,
    parentGuardianConsent: false,
  });

  const [consentModalDocument, setConsentModalDocument] =
    useState<ConsentDocumentKind | null>(null);

  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  function updateConsent(
    key: keyof SignUpConsent,
  ) {
    setConsent((current) => ({
      ...current,
      [key]: !current[key],
    }));
    setError(null);
  }

  function validateForm(): string | null {
    const normalizedEmail = email.trim().toLowerCase();

    if (!normalizedEmail) {
      return "Please enter your email address.";
    }

    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(normalizedEmail)) {
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

    if (
      !consent.termsOfUse ||
      !consent.privacyPolicy ||
      !consent.parentGuardianConsent
    ) {
      return "Please accept all three consent documents to create a parent account.";
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

    const normalizedEmail = email.trim().toLowerCase();
    setLoading(true);

    try {
      /*
       * Creates both the Firebase Authentication user and the parent
       * Firestore profile with versioned consent timestamps.
       */
      await signUp(
        normalizedEmail,
        password,
        pin,
        consent,
      );
    } catch (signUpError) {
      console.error("Unable to create parent account:", signUpError);

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
       * The account already exists at this point. If sending fails, the
       * parent can still continue and use Resend on the verification page.
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
      behavior={Platform.OS === "ios" ? "padding" : "height"}
    >
      <ScrollView
        contentContainerStyle={styles.scrollContent}
        keyboardShouldPersistTaps="handled"
        showsVerticalScrollIndicator={false}
        bounces={false}
        alwaysBounceVertical={false}
        overScrollMode="never"
      >
        <View style={styles.figmaFrame}>
          <BackButton />

          <Text style={styles.title}>
            Create Parent Account
          </Text>

          <Text style={styles.subtitle}>
            Join us to start your child{"'"}s{"\n"}
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

          <ConsentRow
            checked={consent.termsOfUse}
            disabled={loading}
            label="I agree to the Terms of Use."
            accessibilityLabel="Agree to Terms of Use"
            onToggle={() => updateConsent("termsOfUse")}
            onOpenDocument={() =>
              setConsentModalDocument("termsOfUse")
            }
            style={styles.termsRow}
          />

          <ConsentRow
            checked={consent.privacyPolicy}
            disabled={loading}
            label="I agree to the Privacy Policy."
            accessibilityLabel="Agree to Privacy Policy"
            onToggle={() => updateConsent("privacyPolicy")}
            onOpenDocument={() =>
              setConsentModalDocument("privacyPolicy")
            }
            style={styles.privacyRow}
          />

          <ConsentRow
            checked={consent.parentGuardianConsent}
            disabled={loading}
            label="I give Parent / Guardian Consent."
            accessibilityLabel="Give Parent or Guardian Consent"
            onToggle={() => updateConsent("parentGuardianConsent")}
            onOpenDocument={() =>
              setConsentModalDocument("parentGuardianConsent")
            }
            style={styles.parentConsentRow}
          />

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
                title={"Send\nVerification Email"}
                onPress={handleSignUp}
                style={styles.sendButton}
              />
            )}
          </View>

          <TermsModal
            visible={consentModalDocument !== null}
            document={consentModalDocument}
            onClose={() => setConsentModalDocument(null)}
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
    minHeight: y(CONTENT_HEIGHT),
    backgroundColor: colors.background,
  },

  figmaFrame: {
    width: "100%",
    height: y(CONTENT_HEIGHT),
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
    fontFamily: "Outfit",
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

  secureInput: {
    fontFamily: Platform.OS === "ios" ? "System" : "Literata",
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

  consentRow: {
    position: "absolute",
    left: x(20),
    width: x(362),
    minHeight: y(40),
    flexDirection: "row",
    alignItems: "flex-start",
  },

  termsRow: {
    top: y(735),
  },

  privacyRow: {
    top: y(787),
  },

  parentConsentRow: {
    top: y(839),
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

  consentText: {
    width: x(328),
    minHeight: y(30),
    color: colors.primary,
    fontFamily: "Literata",
    fontSize: x(18),
    lineHeight: y(24),
    textDecorationLine: "underline",
  },

  error: {
    position: "absolute",
    left: x(20),
    top: y(892),
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
    top: y(960),
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
