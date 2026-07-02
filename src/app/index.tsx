/**
 * App entry route.
 *
 * For now, the first route redirects users to the onboarding flow.
 * Later this file can decide whether to send users to onboarding,
 * login, or dashboard based on authentication/onboarding status.
 */
import { Redirect } from "expo-router";

export default function Index() {
  return <Redirect href="/onboarding" />;
}
