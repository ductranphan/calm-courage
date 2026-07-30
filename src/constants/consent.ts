/**
 * Consent agreement copy and version for parent registration.
 *
 * The version string is stored on the parent profile whenever consent
 * is recorded so legal updates can be tracked later.
 */

export const CONSENT_VERSION = "2026-07-30";

export type ConsentDocumentKind =
  | "termsOfUse"
  | "privacyPolicy"
  | "parentGuardianConsent";

export const consentDocuments: Record<
  ConsentDocumentKind,
  { title: string; body: string }
> = {
  termsOfUse: {
    title: "Terms of Use",
    body: [
      "Welcome to Calm Courage Co.",
      "",
      "By creating a parent account, you agree to use Calm Courage for your family in accordance with these Terms of Use.",
      "",
      "• You must be a parent or legal guardian to create an account.",
      "• Child profiles are managed only under your parent account.",
      "• You are responsible for safeguarding your password and parent PIN.",
      "• Subscription features, when enabled, are billed through the Apple App Store or Google Play Store.",
      "",
      "Calm Courage may update these terms. Continued use after updates constitutes acceptance of the revised terms.",
    ].join("\n"),
  },
  privacyPolicy: {
    title: "Privacy Policy",
    body: [
      "Calm Courage collects only what is needed to run the family experience.",
      "",
      "Parents: email, account credentials (handled by Firebase Authentication), parent PIN hash, and consent records.",
      "Children: name, age, avatar choice, emotion check-ins, activity progress, and reward totals.",
      "",
      "• We do not create independent child login accounts in Version 1.",
      "• Emotional check-ins and progress stay linked to each child profile under your parent account.",
      "• Voice recordings and drawings are kept on-device unless a future release uploads them with your consent.",
      "• We do not sell children's personal information.",
      "",
      "You may request deletion of your account and associated child data from Parent Settings.",
    ].join("\n"),
  },
  parentGuardianConsent: {
    title: "Parent / Guardian Consent",
    body: [
      "I confirm that I am the parent or legal guardian of each child profile I create in Calm Courage.",
      "",
      "I consent to Calm Courage collecting and storing limited information about my child (such as name, age, avatar, emotion check-ins, activity progress, and rewards) so the app can personalize their experience and show progress on my Parent Dashboard.",
      "",
      "I understand that:",
      "• Children do not create independent accounts in Version 1.",
      "• I can review my children's progress while signed in as the parent.",
      "• I can request deletion of my account and associated child data from Parent Settings.",
    ].join("\n"),
  },
};
