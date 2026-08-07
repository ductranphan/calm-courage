/**
 * Application entry route.
 *
 * Displays the Figma loading screen while Firebase restores
 * the saved session and verifies the current user's state.
 */

import type { User } from "firebase/auth";
import { Redirect } from "expo-router";
import {
  useEffect,
  useState,
} from "react";

import LoadingScreen from "@/components/ui/LoadingScreen";
import { useAuth } from "@/contexts/AuthContext";

export default function Index() {
  const {
    user,
    loading: authLoading,
    reloadUser,
  } = useAuth();

  const [resolvedUser, setResolvedUser] =
    useState<User | null>(null);

  const [
    checkingVerification,
    setCheckingVerification,
  ] = useState(true);

  useEffect(() => {
    let cancelled = false;

    async function resolveCurrentUser() {
      if (authLoading) {
        return;
      }

      if (!user) {
        setResolvedUser(null);
        setCheckingVerification(false);
        return;
      }

      setCheckingVerification(true);

      try {
        const refreshedUser =
          await reloadUser();

        if (!cancelled) {
          setResolvedUser(
            refreshedUser ?? user,
          );
        }
      } catch (error) {
        console.error(
          "Unable to refresh the saved Firebase session:",
          error,
        );

        if (!cancelled) {
          setResolvedUser(user);
        }
      } finally {
        if (!cancelled) {
          setCheckingVerification(false);
        }
      }
    }

    void resolveCurrentUser();

    return () => {
      cancelled = true;
    };
  }, [
    authLoading,
    user,
    reloadUser,
  ]);

  if (
    authLoading ||
    checkingVerification
  ) {
    return <LoadingScreen />;
  }

  if (!resolvedUser) {
    return (
      <Redirect href="/onboarding" />
    );
  }

  if (!resolvedUser.emailVerified) {
    return (
      <Redirect href="/verify-email" />
    );
  }

  return (
    <Redirect href="/parent-verification" />
  );
}