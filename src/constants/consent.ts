/**
 * Consent agreement copy and version for parent registration.
 *
 * The version string is stored on the parent profile whenever consent
 * is recorded so legal updates can be tracked later.
 */

export const CONSENT_VERSION = "2026-08-26";

export type ConsentDocumentKind =
  | "termsOfUse"
  | "privacyPolicy"
  | "parentGuardianConsent";

export const consentDocuments: Record<
  ConsentDocumentKind,
  {
    title: string;
    body: string;
  }
> = {
  termsOfUse: {
    title: "Terms of Service",
    body: [
      "Welcome to Calm Courage Co.",
      "",
      "By creating a parent account, you agree to use Calm Courage for family emotional-learning activities under your supervision.",
      "",
      "1. Accounts",
      "• Parent/guardian accounts are for adults. Children do not create independent accounts in Version 1.",
      "• You are responsible for keeping your login and parent PIN confidential.",
      "",
      "2. Child profiles",
      "• Child profiles exist only under your parent account and require your Parent/Guardian Consent.",
      "",
      "3. Subscription & Billing",
      "• Some activities are free; additional content may require a membership.",
      "• Founding-member pricing and trial terms are shown on the paywall before purchase.",
      "• Cancel according to the App Store or Google Play rules for your platform.",
      "",
      "4. Acceptable use",
      "• Do not misuse the service, attempt unauthorized access, or upload unlawful content.",
      "",
      "Contact support from in-app Help if you have questions about these terms.",
    ].join("\n"),
  },

  privacyPolicy: {
    title: "Privacy Policy",
    body: [
      "Effective date: August 26, 2026",
      "",
      "Calm Courage (“we,” “us”) provides a parent-managed app for family emotional courage activities. This Privacy Policy explains what we collect, how we use it, and how parents can request deletion.",
      "",
      "1. Who the app is for",
      "• Accounts are created by parents or legal guardians.",
      "• We use a neutral birth-year age gate before sign-up. Users under 13 are directed to have a parent set up the app and we do not collect their information through that path.",
      "• Child profile data is collected only after a parent creates an account and provides Parent/Guardian Consent.",
      "",
      "2. Information we collect",
      "Parents:",
      "• Email address and authentication credentials (handled by Firebase Authentication)",
      "• Parent PIN (stored as a hash)",
      "• Consent records (Terms, Privacy Policy, Parent/Guardian Consent, consent version, timestamps)",
      "• Optional support messages you send (email, subject, message)",
      "• Optional account-deletion feedback you choose to provide",
      "• Subscription entitlement fields written by our servers after a purchase/trial activation",
      "• Optional notification preferences and push tokens if you enable notifications",
      "",
      "Children (under the parent account, after parental consent):",
      "• Name, age, avatar choice",
      "• Emotion check-ins and related activity/progress records",
      "• Quest progress and reward totals (for example stars, gems, badges)",
      "• Optional media you allow the app to store (such as audio) under your parent account in Firebase Storage",
      "",
      "Device / technical:",
      "• Basic app configuration needed to run Firebase services",
      "• Local on-device flags such as adult age-gate clearance (we do not store under-13 birth years)",
      "",
      "3. How we use information",
      "• Create and secure parent accounts",
      "• Personalize child activities and show progress on the Parent Dashboard",
      "• Provide support when you contact us",
      "• Operate subscriptions and enforce access to premium activities",
      "• Meet legal obligations, including children’s privacy requirements",
      "",
      "4. Sharing",
      "• We do not sell children’s personal information.",
      "• We do not share a child’s emotional data or drawings with advertisers.",
      "• Service providers (for example Firebase/Google Cloud) process data only to run authentication, database, storage, and related infrastructure.",
      "",
      "5. Retention & deletion",
      "• We keep account and child-profile data while your account is active.",
      "• Parents may delete a child profile or delete the entire account from Parent Settings. Account deletion removes associated child data we store for that account, subject to short-term backups and legal retention needs.",
      "• To request deletion or ask a privacy question, use in-app Contact Us / Help or email the support address published in the app store listing.",
      "",
      "6. Children’s privacy (COPPA)",
      "• Calm Courage is designed for parent-managed use.",
      "• We obtain Parent/Guardian Consent before creating child profiles or collecting child information through those profiles.",
      "• We do not condition a child’s participation on disclosing more information than reasonably necessary for the activity.",
      "",
      "7. Security",
      "• We use industry-standard provider security (including Firebase Authentication and access rules).",
      "• No method of transmission or storage is 100% secure; please protect your password and PIN.",
      "",
      "8. Changes",
      "• We may update this Policy. Material changes will be reflected in-app (consent version) and in the hosted policy linked from our store listings.",
      "",
      "9. Contact",
      "• Use Help & Support or Contact Us in the app for privacy requests, including access or deletion.",
    ].join("\n"),
  },

  parentGuardianConsent: {
    title: "Parent / Guardian Consent",
    body: [
      "I confirm that I am the parent or legal guardian of each child profile I create in Calm Courage, or I have authority to consent for that child.",
      "",
      "Before any child profile is created, I consent to Calm Courage collecting and storing limited information about my child (such as name, age, avatar, emotion check-ins, activity progress, rewards, and optional media I allow) so the app can personalize their experience and show progress on my Parent Dashboard.",
      "",
      "I understand that:",
      "• Children do not create independent accounts in Version 1.",
      "• Child information is collected only under my parent account after this consent.",
      "• I can review my children’s progress while signed in as the parent.",
      "• I can delete a child profile or request deletion of my account and associated child data from Parent Settings.",
      "• This consent is recorded with a consent version and timestamp on my parent profile for compliance documentation.",
      "",
      "If I am not a parent or legal guardian (or lack authority to consent), I will not create child profiles.",
    ].join("\n"),
  },
};
