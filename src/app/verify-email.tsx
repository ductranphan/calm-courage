/**
 * Email verification screen.
 *
 * Matches Figma Screen 2.1: Email Verification Gateway.
 *
 * The user can continue only after Firebase confirms that
 * the email address has been verified.
 */

import { router } from "expo-router";
import { useEffect, useState } from "react";
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
import ErrorMessage from "@/components/ui/ErrorMessage";
import Logo from "@/components/ui/Logo";
import { colors } from "@/constants/colors";
import { useAuth } from "@/contexts/AuthContext";
import {
  reloadCurrentUser,
  sendVerificationEmail,
} from "@/services/auth";
import { x, y } from "@/utils/scaling";

import EmailIcon from "../../assets/images/email.svg";

type LoadingAction = "verify" | "resend" | null;

export default function VerifyEmailScreen() {
  const { user, loading: authLoading } = useAuth();

  const [error, setError] = useState<string | null>(null);
  const [message, setMessage] = useState<string | null>(null);
  const [loadingAction, setLoadingAction] =
    useState<LoadingAction>(null);

  const loading = loadingAction !== null;

  useEffect(() => {
    /*
     * The verification page requires an authenticated Firebase user.
     * Redirect to login if the session no longer exists.
     */
    if (!authLoading && !user) {
      router.replace("/login");
    }
  }, [authLoading, user]);

  async function handleResend() {
    if (loading) {
      return;
    }

    setError(null);
    setMessage(null);
    setLoadingAction("resend");

    try {
      await sendVerificationEmail();

      setMessage(
        "A new verification email has been sent. Please check your inbox.",
      );
    } catch (resendError) {
      console.error(
        "Unable to resend verification email:",
        resendError,
      );

      setError(
        resendError instanceof Error
          ? resendError.message
          : "Unable to send the verification email.",
      );
    } finally {
      setLoadingAction(null);
    }
  }

  async function handleVerified() {
    if (loading) {
      return;
    }

    setError(null);
    setMessage(null);
    setLoadingAction("verify");

    try {
      /*
       * Reload the Firebase user so emailVerified contains
       * the latest value from Firebase Authentication.
       */
      const refreshedUser = await reloadCurrentUser();

      if (!refreshedUser) {
        setError(
          "Your session could not be found. Please sign in again.",
        );
        return;
      }

      if (!refreshedUser.emailVerified) {
        setMessage(
          "Your email has not been verified yet. Open the link in your inbox, then try again.",
        );
        return;
      }

      /*
       * New account flow:
       *
       * Verify email
       * → Who is joining the journey?
       * → Choose a buddy
       */
      router.replace("/child-profile-info");
    } catch (verificationError) {
      console.error(
        "Unable to refresh email verification status:",
        verificationError,
      );

      setError(
        verificationError instanceof Error
          ? verificationError.message
          : "Unable to check your verification status.",
      );
    } finally {
      setLoadingAction(null);
    }
  }

  if (authLoading) {
    return (
      <View style={styles.loadingScreen}>
        <ActivityIndicator
          size="large"
          color={colors.primary}
        />
      </View>
    );
  }

  return (
    <ScrollView
      style={styles.screen}
      contentContainerStyle={styles.scrollContent}
      showsVerticalScrollIndicator={false}
    >
      <View style={styles.figmaFrame}>
        <BackButton fallback="/email-signup" />

        <View style={styles.emailIcon}>
          <EmailIcon
            width={x(76)}
            height={y(57)}
          />
        </View>

        <Text style={styles.title}>
          Verify Your Email
        </Text>

        <Text style={styles.body}>
          We&apos;ve sent a verification link to your{"\n"}
          registered email. Please check your{"\n"}
          inbox and click the link to complete{"\n"}
          your setup.
        </Text>

        <View style={styles.buttonWrapper}>
          {loadingAction === "verify" ? (
            <ActivityIndicator
              color={colors.primary}
            />
          ) : (
            <AppButton
              title="I’ve Verified My Email"
              onPress={handleVerified}
              style={styles.verifyButton}
            />
          )}
        </View>

        <Pressable
          onPress={handleResend}
          disabled={loading}
          style={[
            styles.resendWrapper,
            loading && styles.disabledAction,
          ]}
          accessibilityRole="button"
          accessibilityLabel="Resend verification email"
          accessibilityState={{
            disabled: loading,
          }}
        >
          <Text style={styles.resendLine}>
            Didn&apos;t receive the email?
          </Text>

          {loadingAction === "resend" ? (
            <View style={styles.resendLoadingRow}>
              <ActivityIndicator
                size="small"
                color={colors.primary}
              />

              <Text style={styles.resendStatus}>
                Sending...
              </Text>
            </View>
          ) : (
            <Text style={styles.resendLine}>
              Resend link
            </Text>
          )}
        </Pressable>

        {message ? (
          <Text style={styles.message}>
            {message}
          </Text>
        ) : null}

        <ErrorMessage
          message={error}
          style={styles.error}
        />

        <View style={styles.logoWrapper}>
          <Logo
            width={x(168)}
            height={y(62)}
            shadow
          />
        </View>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  screen: {
    flex: 1,
    backgroundColor: colors.background,
  },

  loadingScreen: {
    flex: 1,
    backgroundColor: colors.background,
    alignItems: "center",
    justifyContent: "center",
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
    minHeight: y(110),
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

  disabledAction: {
    opacity: 0.6,
  },

  resendLine: {
    color: colors.primary,
    fontFamily: "Literata",
    fontSize: x(20),
    lineHeight: y(30),
    textAlign: "center",
    textDecorationLine: "underline",
  },

  resendLoadingRow: {
    minHeight: y(30),
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
  },

  resendStatus: {
    marginLeft: x(8),
    color: colors.primary,
    fontFamily: "Literata",
    fontSize: x(17),
    lineHeight: y(24),
  },

  message: {
    position: "absolute",
    left: x(20),
    top: y(704),
    width: x(362),
    color: "#28B775",
    fontFamily: "Literata",
    fontSize: x(16),
    lineHeight: y(22),
    textAlign: "center",
  },

  error: {
    position: "absolute",
    left: x(20),
    top: y(704),
    width: x(362),
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