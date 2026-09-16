/**
 * Build-time feature flags.
 *
 * QA_PURCHASE_ENABLED controls the simulated purchase sheet on the paywall.
 * It exists so internal builds can unlock premium content before real
 * StoreKit / Play Billing is wired up. It must stay off for store builds:
 * presenting purchase UI that does not charge through in-app purchase
 * violates App Store 3.1.1 and Google Play's payments policy.
 *
 * The paywall screen still needs to read this flag before shipping to stores.
 */

export const QA_PURCHASE_ENABLED =
  process.env.EXPO_PUBLIC_ENABLE_QA_PURCHASE === "true";
