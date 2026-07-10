/**
 * App entry route.
 *
 * Sends users to onboarding, terms, email verification, child setup, or home.
 */
import { Redirect, type Href } from "expo-router";
import { useEffect, useState } from "react";

import { useAuth } from "@/contexts/AuthContext";
import { getUserProfile } from "@/services/auth";
import { listChildren } from "@/services/children";

export default function Index() {
  const { user, loading } = useAuth();
  const [nextRoute, setNextRoute] = useState<Href | null>(null);

  useEffect(() => {
    let cancelled = false;

    async function resolveRoute() {
      if (loading) {
        return;
      }

      if (!user) {
        setNextRoute("/onboarding");
        return;
      }

      if (!user.emailVerified) {
        const profile = await getUserProfile(user.uid);
        if (cancelled) {
          return;
        }

        setNextRoute(profile?.termsAccepted ? "/verify-email" : "/terms");
        return;
      }

      const [profile, children] = await Promise.all([
        getUserProfile(user.uid),
        listChildren(user.uid),
      ]);

      if (cancelled) {
        return;
      }

      if (!profile?.onboardingComplete || children.length === 0) {
        setNextRoute("/add-child");
        return;
      }

      setNextRoute("/home");
    }

    resolveRoute();

    return () => {
      cancelled = true;
    };
  }, [user, loading]);

  if (loading || !nextRoute) {
    return null;
  }

  return <Redirect href={nextRoute} />;
}
