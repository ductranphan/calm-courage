/**
 * Application entry route.
 *
 * The onboarding screen is displayed when the application
 * is opened through the root route.
 */

import { Redirect } from "expo-router";

export default function Index() {
  return <Redirect href="/onboarding" />;
}