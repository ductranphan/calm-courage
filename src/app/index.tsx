/**
 * App entry route.
 */
import { Redirect } from "expo-router";

import { useAuth } from "@/contexts/AuthContext";

export default function Index() {
  const { user, loading } = useAuth();

  if (loading) {
    return null;
  }

  if (!user) {
    return <Redirect href="/onboarding" />;
  }

  if (!user.emailVerified) {
    return <Redirect href="/verify-email" />;
  }

  return <Redirect href="/home" />;
}