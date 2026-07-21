/**
 * Email verification screen.
 *
 * Matches Figma Screen 2.1: Email Verification Gateway.
 *
 * Development note:
 * The "I've Verified My Email" button temporarily skips the real Firebase
 * verification check so the rest of the app can be developed.
 * Replace handleVerified() with the Firebase version before release.
 */

import { router } from "expo-router";
import { useState } from "react";
import {
  ActivityIndicator,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from "react-native";

import AppButton from "@/components/ui/AppButton";
import BackButton from "@/components/ui/BackButton";
<<<<<<< HEAD
=======
import ErrorMessage from "@/components/ui/ErrorMessage";
>>>>>>> 085db16234b9c8005b24ff1b18f08fb73e237d40
import Logo from "@/components/ui/Logo";
import { colors } from "@/constants/colors";
import { useAuth } from "@/contexts/AuthContext";
import { x, y } from "@/utils/scaling";

import EmailIcon from "../../assets/images/email.svg";

export default function VerifyEmailScreen() {
  const { sendVerificationEmail } = useAuth();

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
<<<<<<< HEAD
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : "Unable to send verification email.",
      );
=======
    } catch {
      setError("Unable to send verification email.");
>>>>>>> 085db16234b9c8005b24ff1b18f08fb73e237d40
    } finally {
      setLoading(false);
    }
  }

  function handleVerified() {
<<<<<<< HEAD
    router.replace("/add-child");
=======
    router.replace("/child-profile-info");
>>>>>>> 085db16234b9c8005b24ff1b18f08fb73e237d40
  }

  /*
  Real Firebase version to use before release:

  const { reloadUser } = useAuth();

  async function handleVerified() {
    setError(null);
    setMessage(null);
    setLoading(true);

    try {
      const refreshedUser = await reloadUser();

      if (refreshedUser?.emailVerified) {
        router.replace("/child-profile-info");
        return;
      }

      setMessage("Email not verified yet. Check your inbox and try again.");
<<<<<<< HEAD
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : "Unable to refresh verification status.",
      );
=======
    } catch {
      setError("Unable to refresh verification status.");
>>>>>>> 085db16234b9c8005b24ff1b18f08fb73e237d40
    } finally {
      setLoading(false);
    }
  }
  */

  return (
<<<<<<< HEAD
    <View style={styles.screen}>
      <BackButton fallback="/email-signup" />
=======
    <ScrollView
      style={styles.screen}
      contentContainerStyle={styles.scrollContent}
      showsVerticalScrollIndicator={false}
    >
      <View style={styles.figmaFrame}>
        <BackButton fallback="/email-signup" />
>>>>>>> 085db16234b9c8005b24ff1b18f08fb73e237d40

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

<<<<<<< HEAD
      <Pressable onPress={handleResend} style={styles.resendWrapper}>
        <Text style={styles.resendText}>
          Didn&apos;t receive the email?{"\n"}
          Resend link
        </Text>
      </Pressable>

      {message ? <Text style={styles.message}>{message}</Text> : null}
      {error ? <Text style={styles.error}>{error}</Text> : null}

      <View style={styles.logoWrapper}>
        <Logo width={x(168)} height={y(62)} shadow />
      </View>
    </View>
=======
        <Pressable onPress={handleResend} style={styles.resendWrapper}>
          <Text style={styles.resendLine}>Didn&apos;t receive the email?</Text>
          <Text style={styles.resendLine}>Resend link</Text>
        </Pressable>

        {message ? <Text style={styles.message}>{message}</Text> : null}
        <ErrorMessage message={error} style={styles.error} />

        <View style={styles.logoWrapper}>
          <Logo width={x(168)} height={y(62)} shadow />
        </View>
      </View>
    </ScrollView>
>>>>>>> 085db16234b9c8005b24ff1b18f08fb73e237d40
  );
}

const styles = StyleSheet.create({
  screen: {
    flex: 1,
    backgroundColor: colors.background,
  },

  scrollContent: {
    minHeight: y(900),
    backgroundColor: colors.background,
  },

  figmaFrame: {
    width: "100%",
    height: y(900),
    position: "relative",
    backgroundColor: colors.background,
  },

  emailIcon: {
    position: "absolute",
    left: x(163),
    top: y(154),
    width: x(76),
    height: y(57),
    alignItems: "center",
    justifyContent: "center",
  },

  title: {
    position: "absolute",
    left: x(20),
    top: y(256),
    width: x(362),
    height: y(39),
    color: colors.primary,
    fontFamily: "Quiche",
    fontSize: x(30),
    lineHeight: y(39),
    textAlign: "center",
  },

  body: {
    position: "absolute",
    left: x(20),
    top: y(348),
    width: x(362),
    height: y(110),
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
    borderRadius: x(20),
  },

  resendWrapper: {
    position: "absolute",
    left: x(54),
    top: y(630),
    width: x(294),
    minHeight: y(64),
    alignItems: "center",
    justifyContent: "center",
  },

  resendLine: {
    color: colors.primary,
    fontFamily: "Literata",
    fontSize: x(20),
    lineHeight: y(30),
    textAlign: "center",
    textDecorationLine: "underline",
  },

  message: {
    position: "absolute",
    left: x(20),
<<<<<<< HEAD
    top: y(710),
=======
    top: y(704),
>>>>>>> 085db16234b9c8005b24ff1b18f08fb73e237d40
    width: x(362),
    color: "#28B775",
    fontFamily: "Literata",
<<<<<<< HEAD
    fontSize: x(14),
    lineHeight: y(18),
=======
    fontSize: x(16),
    lineHeight: y(22),
>>>>>>> 085db16234b9c8005b24ff1b18f08fb73e237d40
    textAlign: "center",
  },

  error: {
    position: "absolute",
    left: x(20),
<<<<<<< HEAD
    top: y(710),
    width: x(362),
    color: "#B00020",
    fontFamily: "Literata",
    fontSize: x(14),
    lineHeight: y(18),
    textAlign: "center",
=======
    top: y(704),
>>>>>>> 085db16234b9c8005b24ff1b18f08fb73e237d40
  },

  logoWrapper: {
    position: "absolute",
    left: x(117),
    top: y(760),
    width: x(168),
    height: y(62),
    alignItems: "center",
    justifyContent: "center",
  },
});