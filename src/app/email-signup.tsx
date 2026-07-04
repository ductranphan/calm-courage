/**
 * Email sign-up screen.
 *
 * Matches Figma Screen 2.0: Parent Sign-Up & Security.
 * Collects email, password, PIN, terms agreement,
 * and sends the user to email verification.
 */

import { useRef, useState } from "react";
import {
  ActivityIndicator,
  Dimensions,
  KeyboardAvoidingView,
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View,
} from "react-native";
import { router } from "expo-router";

import AppButton from "@/components/AppButton";
import BackButton from "@/components/BackButton";
import { useAuth } from "@/contexts/AuthContext";
import { colors } from "@/constants/colors";

const FIGMA_WIDTH = 402;
const { width } = Dimensions.get("window");

const scale = width / FIGMA_WIDTH;
const x = (value: number) => value * scale;
const y = (value: number) => value * scale;

export default function EmailSignupScreen() {
  const { signUp, sendVerificationEmail } = useAuth();

  const pinRefs = useRef<Array<TextInput | null>>([]);

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [pin, setPin] = useState(["", "", "", ""]);
  const [termsAccepted, setTermsAccepted] = useState(false);
  const [showTermsModal, setShowTermsModal] = useState(false);

  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  async function handleSignUp() {
    setError(null);

    if (!termsAccepted) {
      setError("Please agree to the Terms of Service and Privacy Policy.");
      return;
    }

    if (pin.some((digit) => digit === "")) {
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
    <KeyboardAvoidingView
      style={styles.screen}
      behavior={Platform.OS === "ios" ? "padding" : "height"}
      keyboardVerticalOffset={0}
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

          <TextInput
            placeholder="Enter your email"
            placeholderTextColor="#B8B3D6"
            value={email}
            onChangeText={setEmail}
            autoCapitalize="none"
            autoCorrect={false}
            keyboardType="email-address"
            style={[styles.input, styles.emailInput]}
          />

          <TextInput
            placeholder="Create password"
            placeholderTextColor="#B8B3D6"
            value={password}
            onChangeText={setPassword}
            secureTextEntry
            style={[styles.input, styles.passwordInput]}
          />

          <TextInput
            placeholder="Confirm password"
            placeholderTextColor="#B8B3D6"
            value={confirmPassword}
            onChangeText={setConfirmPassword}
            secureTextEntry
            style={[styles.input, styles.confirmInput]}
          />

          <View style={styles.pinSection}>
            <Text style={styles.pinLabel}>Create PIN</Text>

            <View style={styles.pinRow}>
              {pin.map((digit, index) => (
                <TextInput
                  key={index}
                  ref={(ref) => {
                    pinRefs.current[index] = ref;
                  }}
                  value={digit}
                  onChangeText={(value) => {
                    const nextPin = [...pin];
                    const newValue = value.slice(-1);

                    nextPin[index] = newValue;
                    setPin(nextPin);

                    if (newValue && index < pin.length - 1) {
                      pinRefs.current[index + 1]?.focus();
                    }
                  }}
                  onKeyPress={({ nativeEvent }) => {
                    if (
                      nativeEvent.key === "Backspace" &&
                      !pin[index] &&
                      index > 0
                    ) {
                      pinRefs.current[index - 1]?.focus();
                    }
                  }}
                  keyboardType="number-pad"
                  maxLength={1}
                  secureTextEntry
                  style={styles.pinBox}
                />
              ))}
            </View>
          </View>

          <View style={styles.termsRow}>
            <Pressable
              onPress={() => setTermsAccepted(!termsAccepted)}
              style={styles.checkbox}
            >
              {termsAccepted ? <View style={styles.checkboxFill} /> : null}
            </Pressable>

            <Pressable onPress={() => setShowTermsModal(true)}>
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

          {showTermsModal ? (
            <View style={styles.modalBox}>
              <Pressable
                onPress={() => setShowTermsModal(false)}
                style={styles.closeButton}
              >
                <Text style={styles.closeText}>×</Text>
              </Pressable>

              <Text style={styles.modalTitle}>
                Terms of Service & Privacy Policy
              </Text>

              <Text style={styles.modalBody}>
                Welcome to Calm Courage Co.{"\n"}
                Please review how we protect your family's data:{"\n\n"}
                1. Data Protection & Privacy{"\n"}
                • We do not share your child's emotional data or drawings with
                any third parties.{"\n"}
                • All voice recordings and canvas activities are encrypted and
                securely stored.{"\n\n"}
                2. Parental Control{"\n"}
                • Parents maintain full access to view, edit, or delete their
                child's profile and progress reports.{"\n\n"}
                3. Subscription & Billing{"\n"}
                • Phase 1 features include free trials, followed by our monthly
                membership plan ($7.99/mo).{"\n"}
                • Cancel anytime through your Parent Settings.
              </Text>
            </View>
          ) : null}
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
    fontFamily: "Literata",
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

  input: {
    position: "absolute",
    left: x(20),
    width: x(362),
    height: y(72),
    borderWidth: 1,
    borderColor: colors.primary,
    borderRadius: x(20),
    backgroundColor: colors.white,
    paddingHorizontal: x(26),
    color: colors.primary,
    fontFamily: "Literata",
    fontSize: x(20),
  },

  emailInput: {
    top: y(262),
  },

  passwordInput: {
    top: y(370),
  },

  confirmInput: {
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
    flexDirection: "row",
    justifyContent: "space-between",
  },

  pinBox: {
    width: x(76),
    height: y(85),
    borderRadius: x(20),
    backgroundColor: colors.white,
    textAlign: "center",
    fontFamily: "Literata",
    fontSize: x(24),
    color: colors.primary,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.25,
    shadowRadius: 4,
    elevation: 5,
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

  checkboxFill: {
    width: x(14),
    height: x(14),
    backgroundColor: colors.primary,
  },

  termsText: {
    width: x(328),
    height: y(48),
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

  modalBox: {
    position: "absolute",
    left: x(20),
    top: y(258),
    width: x(362),
    height: y(570),
    borderRadius: x(20),
    backgroundColor: "rgba(217, 217, 217, 0.85)",
    paddingTop: y(55),
    paddingHorizontal: x(17),
    zIndex: 20,
  },

  closeButton: {
    position: "absolute",
    right: x(18),
    top: y(12),
    zIndex: 21,
  },

  closeText: {
    color: colors.primary,
    fontFamily: "Literata",
    fontSize: x(42),
    lineHeight: y(42),
  },

  modalTitle: {
    color: colors.primary,
    fontFamily: "Literata",
    fontSize: x(20),
    fontWeight: "700",
    lineHeight: y(24),
    marginBottom: y(28),
  },

  modalBody: {
    width: x(328),
    height: y(418),
    color: colors.primary,
    fontFamily: "Literata",
    fontSize: x(16),
    lineHeight: y(16),
  },
});