/**
 * App entry route.
 *
 * Sends users to onboarding, terms, email verification, child setup, or home.
 */

import { Redirect, type Href } from "expo-router";
import { useEffect, useState } from "react";
import {
  ActivityIndicator,
  Pressable,
  StyleSheet,
  Text,
  View,
} from "react-native";

import { colors } from "@/constants/colors";
import { useAuth } from "@/contexts/AuthContext";
import { getUserProfile } from "@/services/auth";
import { listChildren } from "@/services/children";

type EntryRoute =
  | "/onboarding"
  | "/terms"
  | "/verify-email"
  | "/child-profile-info"
  | "/home";

export default function Index() {
  const { user, loading } = useAuth();

  const [nextRoute, setNextRoute] = useState<Href | null>(null);
  const [routeError, setRouteError] = useState<string | null>(null);
  const [retryKey, setRetryKey] = useState(0);

  useEffect(() => {
    let cancelled = false;

    async function resolveRoute() {
      if (loading) {
        return;
      }

      setNextRoute(null);
      setRouteError(null);

      try {
        if (!user) {
          if (!cancelled) {
            setNextRoute("/onboarding");
          }

          return;
        }

        const profile = await getUserProfile(user.uid);

        if (cancelled) {
          return;
        }

        /*
         * The parent must accept the terms before continuing
         * to email verification or the main application.
         */
        if (!profile?.termsAccepted) {
          setNextRoute("/terms");
          return;
        }

        /*
         * Email verification must be completed before the parent
         * can create child profiles or access the dashboard.
         */
        if (!user.emailVerified) {
          setNextRoute("/verify-email");
          return;
        }

        const children = await listChildren(user.uid);

        if (cancelled) {
          return;
        }

        /*
         * Use the new Figma-aligned child setup flow when onboarding
         * is incomplete or the parent has no child profiles.
         */
        if (
          !profile.onboardingComplete ||
          children.length === 0
        ) {
          setNextRoute("/child-profile-info");
          return;
        }

        setNextRoute("/home");
      } catch (error) {
        console.error(
          "Unable to determine the application route:",
          error,
        );

        if (!cancelled) {
          setNextRoute(null);
          setRouteError(
            "We couldn’t load your account information. Please try again.",
          );
        }
      }
    }

    void resolveRoute();

    return () => {
      cancelled = true;
    };
  }, [user, loading, retryKey]);

  if (loading || (!nextRoute && !routeError)) {
    return (
      <View style={styles.stateScreen}>
        <ActivityIndicator
          size="large"
          color={colors.primary}
        />

        <Text style={styles.stateText}>
          Loading your account...
        </Text>
      </View>
    );
  }

  if (routeError) {
    return (
      <View style={styles.stateScreen}>
        <Text style={styles.errorTitle}>
          Unable to continue
        </Text>

        <Text style={styles.stateText}>
          {routeError}
        </Text>

        <Pressable
          style={styles.retryButton}
          onPress={() =>
            setRetryKey((current) => current + 1)
          }
          accessibilityRole="button"
          accessibilityLabel="Try loading the account again"
        >
          <Text style={styles.retryButtonText}>
            Try Again
          </Text>
        </Pressable>
      </View>
    );
  }

  return <Redirect href={nextRoute as EntryRoute} />;
}

const styles = StyleSheet.create({
  stateScreen: {
    flex: 1,
    paddingHorizontal: 30,
    backgroundColor: colors.background,
    alignItems: "center",
    justifyContent: "center",
  },

  errorTitle: {
    color: colors.primary,
    fontFamily: "Quiche",
    fontSize: 28,
    lineHeight: 36,
    textAlign: "center",
  },

  stateText: {
    marginTop: 16,
    color: colors.primary,
    fontFamily: "Literata",
    fontSize: 18,
    lineHeight: 26,
    textAlign: "center",
  },

  retryButton: {
    minWidth: 140,
    minHeight: 48,
    marginTop: 24,
    paddingHorizontal: 24,
    borderRadius: 18,
    backgroundColor: colors.primary,
    alignItems: "center",
    justifyContent: "center",
  },

  retryButtonText: {
    color: colors.white,
    fontFamily: "Literata",
    fontSize: 17,
    lineHeight: 23,
  },
});