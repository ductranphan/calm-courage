/**
 * Application entry route.
 *
 * Redirects users based on their authentication state:
 *
 * - Not signed in --> Onboarding screen
 * - Signed in but email not verified --> Email verification screen
 * - Signed in and verified --> Home screen
 */
import { Redirect } from "expo-router";

import { useAuth } from "@/contexts/AuthContext";

export default function Index() {
  const { user, loading } = useAuth();

  // Wait until Firebase finishes restoring the user's session.
  if (loading) {
    return null;
  }

  // First-time or signed-out users.
  if (!user) {
    return <Redirect href="/onboarding" />;
  }

  // Require email verification before allowing access.
  if (!user.emailVerified) {
    return <Redirect href="/verify-email" />;
  }

  // Authenticated and verified users.
  return <Redirect href="/home" />;
}