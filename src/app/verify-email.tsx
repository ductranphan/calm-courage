/**
 * Email verification screen.
 *
 * Matches Figma Screen 2.1: Email Verification Gateway.
 * Keeps Firebase verification logic connected through useAuth().
 */

import { useState } from "react";
import {
  ActivityIndicator,
  Dimensions,
  Pressable,
  StyleSheet,
  Text,
  View,
} from "react-native";
import { router } from "expo-router";

import AppButton from "@/components/AppButton";
import BackButton from "@/components/BackButton";
import Logo from "@/components/Logo";
import { useAuth } from "@/contexts/AuthContext";
import { colors } from "@/constants/colors";

import EmailIcon from "../../assets/images/email.svg";

const FIGMA_WIDTH = 402;
const { width } = Dimensions.get("window");

const scale = width / FIGMA_WIDTH;
const x = (value: number) => value * scale;
const y = (value: number) => value * scale;

export default function VerifyEmailScreen() {
  const { sendVerificationEmail, reloadUser, signOut } = useAuth();

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

  async function handleSignOut() {
    await signOut();
    router.replace("/onboarding");
  }

  return (
    <View style={styles.screen}>
      <BackButton fallback="/onboarding" />

      <View style={styles.emailIcon}>
        <EmailIcon width={x(76)} height={y(57)} />
      </View>

      <Text style={styles.title}>Verify Your Email</Text>

      <Text style={styles.body}>
        We&apos;ve sent a verification link to your{"\n"}
        registered email. Please check your{"\n"}
        inbox and click the link to complete{"\n"}
        your setup.
      </Text>

      <View style={styles.buttonWrapper}>
        {loading ? (
          <ActivityIndicator color={colors.primary} />
        ) : (
          <AppButton
            title="I’ve Verified My Email"
            onPress={handleVerified}
            style={styles.verifyButton}
          />
        )}
      </View>

      <View style={styles.resendWrapper}>
        <Pressable onPress={handleResend}>
          <Text style={styles.resendText}>
            Didn&apos;t receive the email?{"\n"}
            Resend link
          </Text>
        </Pressable>
      </View>

      <Pressable onPress={handleSignOut} style={styles.signOutWrapper}>
        <Text style={styles.signOutText}>Sign out</Text>
      </Pressable>

      {message ? <Text style={styles.message}>{message}</Text> : null}
      {error ? <Text style={styles.error}>{error}</Text> : null}

      <View style={styles.logoWrapper}>
        <Logo width={x(168)} height={y(62)} shadow />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  screen: {
    flex: 1,
    backgroundColor: colors.background,
  },

  emailIcon: {
    position: "absolute",
    left: x(163),
    top: y(154),
    width: x(76),
    height: y(57),
  },

  title: {
    position: "absolute",
    left: x(20),
    top: y(256),
    width: x(362),
    height: y(39),
    color: colors.primary,
    fontFamily: "Literata",
    fontSize: x(30),
    lineHeight: y(39),
    textAlign: "center",
  },

  body: {
    position: "absolute",
    left: x(20),
    top: y(348),
    width: x(362),
    height: y(96),
    color: colors.primary,
    fontFamily: "Literata",
    fontSize: x(20),
    lineHeight: y(24),
  },

  buttonWrapper: {
    position: "absolute",
    left: x(76),
    top: y(510),
    width: x(250),
    height: y(52),
    alignItems: "center",
    justifyContent: "center",
  },

  verifyButton: {
    width: x(250),
    height: y(52),
  },

  resendWrapper: {
    position: "absolute",
    left: x(84),
    top: y(630),
    width: x(234),
    height: y(60),
    alignItems: "center",
  },

  resendText: {
    color: colors.primary,
    fontFamily: "Literata",
    fontSize: x(20),
    lineHeight: y(30),
    textAlign: "center",
    textDecorationLine: "underline",
  },

  signOutWrapper: {
    position: "absolute",
    top: y(700),
    width: "100%",
    alignItems: "center",
  },

  signOutText: {
    color: colors.primary,
    fontFamily: "Literata",
    fontSize: x(16),
    textDecorationLine: "underline",
  },

  message: {
    position: "absolute",
    left: x(20),
    top: y(725),
    width: x(362),
    color: colors.primary,
    fontFamily: "Literata",
    fontSize: x(14),
    textAlign: "center",
  },

  error: {
    position: "absolute",
    left: x(20),
    top: y(725),
    width: x(362),
    color: "#B00020",
    fontFamily: "Literata",
    fontSize: x(14),
    textAlign: "center",
  },

  logoWrapper: {
    position: "absolute",
    left: x(117),
    top: y(760),
    width: x(168),
    height: y(62),
  },
});