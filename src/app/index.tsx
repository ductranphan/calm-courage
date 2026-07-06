/**
 * App entry route.
 *
 * Sends users to onboarding, terms, email verification, or home based on auth state.
 */
import { useEffect, useState } from "react";
import { Redirect, type Href } from "expo-router";

import { useAuth } from "@/contexts/AuthContext";
import { getUserProfile } from "@/services/auth";

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
