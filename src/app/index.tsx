/**
 * Application entry route.
 *
 * Displays the Figma loading screen while Firebase restores
 * the saved session and verifies the current user's state.
 * Unauthenticated users must clear the COPPA age gate first.
 */

import type { User } from "firebase/auth";
import { Redirect, type Href } from "expo-router";
import {
  useEffect,
  useState,
} from "react";

import LoadingScreen from "@/components/ui/LoadingScreen";
import { useAuth } from "@/contexts/AuthContext";
import { getAgeGateRecord } from "@/utils/ageGate";

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

  const [ageGateAllowed, setAgeGateAllowed] =
    useState<boolean | null>(null);

  useEffect(() => {
    let cancelled = false;

    async function resolveCurrentUser() {
      if (authLoading) {
        return;
      }

      if (!user) {
        const ageGate = await getAgeGateRecord();

        if (!cancelled) {
          setResolvedUser(null);
          setAgeGateAllowed(ageGate?.status === "allowed");
          setCheckingVerification(false);
        }
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
          setAgeGateAllowed(true);
        }
      } catch (error) {
        console.error(
          "Unable to refresh the saved Firebase session:",
          error,
        );

        if (!cancelled) {
          setResolvedUser(user);
          setAgeGateAllowed(true);
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
    checkingVerification ||
    (!resolvedUser && ageGateAllowed === null)
  ) {
    return <LoadingScreen />;
  }

  if (!resolvedUser) {
    if (!ageGateAllowed) {
      return (
        <Redirect href={"/age-gate" as Href} />
      );
    }

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
