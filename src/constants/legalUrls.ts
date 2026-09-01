/**
 * Public privacy / legal URLs for store listings and in-app links.
 *
 * Set EXPO_PUBLIC_PRIVACY_POLICY_URL to the hosted Privacy Policy page
 * used on App Store and Google Play listings before submission.
 */

export const PRIVACY_POLICY_URL =
  process.env.EXPO_PUBLIC_PRIVACY_POLICY_URL?.trim() || "";

export const TERMS_OF_USE_URL =
  process.env.EXPO_PUBLIC_TERMS_OF_USE_URL?.trim() || "";

export function hasHostedPrivacyPolicyUrl(): boolean {
  return PRIVACY_POLICY_URL.length > 0;
}
