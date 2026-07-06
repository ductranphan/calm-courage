/**
 * Email sign-up screen.
 *
 * Matches Figma Screen 2.0: Parent Sign-Up & Security.
 * Collects email, password, PIN, and terms agreement before account creation.
 */

import { useState } from "react";
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
import PinInput from "@/components/PinInput";
import TermsModal from "@/components/TermsModal";
import { useAuth } from "@/contexts/AuthContext";
import { colors } from "@/constants/colors";
import { isValidPin } from "@/utils/pin";

const FIGMA_WIDTH = 402;
const { width } = Dimensions.get("window");

const scale = width / FIGMA_WIDTH;
const x = (value: number) => value * scale;
const y = (value: number) => value * scale;

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
      router.replace("/terms");
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
              <PinInput value={pin} onChange={setPin} />
            </View>
          </View>

          <View style={styles.termsRow}>
            <Pressable
              onPress={() => setTermsAccepted((current) => !current)}
              style={styles.checkbox}
            >
              {termsAccepted ? <View style={styles.checkboxFill} /> : null}
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
        </View>
      </ScrollView>

      <TermsModal
        visible={termsModalVisible}
        onClose={() => setTermsModalVisible(false)}
      />
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
});
