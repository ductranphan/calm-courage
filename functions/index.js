/**
 * Calm Courage Cloud Functions (production entitlement grants).
 *
 * Deploy:
 *   cd functions && npm install
 *   npx firebase-tools deploy --only functions,firestore:rules,storage
 *
 * Clients call activateSubscription / clearSubscription via HTTPS callable.
 * Direct client writes to subscription fields are blocked by Firestore rules.
 */

const { initializeApp } = require("firebase-admin/app");
const { getFirestore, FieldValue } = require("firebase-admin/firestore");
const { onCall, HttpsError } = require("firebase-functions/v2/https");
const { setGlobalOptions } = require("firebase-functions/v2");

initializeApp();
setGlobalOptions({ region: "us-central1" });

const db = getFirestore();

function buildEntitlementUpdate(input = {}) {
  const plan = input.plan === "yearly" ? "yearly" : "monthly";
  const trialDays =
    typeof input.trialDays === "number" && input.trialDays > 0
      ? Math.min(input.trialDays, 30)
      : 7;
  const priceLabel =
    typeof input.priceLabel === "string" && input.priceLabel.trim()
      ? input.priceLabel.trim()
      : plan === "yearly"
        ? "$79.99/year"
        : "$7.99/month";

  const trialEndsAt = new Date();
  trialEndsAt.setDate(trialEndsAt.getDate() + trialDays);
  const renewsAt = new Date(trialEndsAt);

  return {
    subscription: plan,
    foundingMember: input.foundingMember !== false,
    subscriptionPriceLabel: priceLabel,
    subscriptionTrialEndsAt: trialEndsAt.toISOString(),
    trialEndsAt: trialEndsAt.toISOString(),
    subscriptionRenewsAt: renewsAt.toISOString(),
    nextBillingDate: renewsAt.toISOString(),
    subscriptionSource: input.source || "cloud_function",
    subscriptionPlatform: input.platform || null,
    subscriptionReceiptId: input.receiptId || null,
    subscriptionActivatedAt: FieldValue.serverTimestamp(),
    updatedAt: FieldValue.serverTimestamp(),
  };
}

/**
 * Activates founding-member trial / subscription for the signed-in parent.
 *
 * Production path:
 * - Pass platform + receiptId from StoreKit / Play Billing after purchase.
 * - Set ALLOW_UNVERIFIED_SUBSCRIPTION_GRANT=false in Functions config
 *   once real receipt verification is implemented.
 *
 * Soft-launch path:
 * - ALLOW_UNVERIFIED_SUBSCRIPTION_GRANT=true (default) lets the paywall
 *   activate a trial without a store receipt so QA/production can ship today.
 *   Replace with Apple/Google receipt verification ASAP.
 */
exports.activateSubscription = onCall(async (request) => {
  if (!request.auth?.uid) {
    throw new HttpsError(
      "unauthenticated",
      "Sign in required to activate a subscription.",
    );
  }

  const allowUnverified =
    process.env.ALLOW_UNVERIFIED_SUBSCRIPTION_GRANT !== "false";

  const data = request.data || {};
  const hasReceipt =
    typeof data.receiptId === "string" &&
    data.receiptId.trim().length > 0;

  if (!allowUnverified && !hasReceipt) {
    throw new HttpsError(
      "failed-precondition",
      "A verified store receipt is required.",
    );
  }

  /*
   * TODO(store): verify Apple/Google receipts with App Store Server API /
   * Google Play Developer API before writing entitlement.
   */

  const parentUid = request.auth.uid;
  const parentRef = db.collection("parents").doc(parentUid);
  const snapshot = await parentRef.get();

  if (!snapshot.exists) {
    throw new HttpsError(
      "not-found",
      "Parent profile not found.",
    );
  }

  const update = buildEntitlementUpdate(data);
  await parentRef.update(update);

  return {
    ok: true,
    plan: update.subscription,
    trialEndsAt: update.trialEndsAt,
    renewsAt: update.subscriptionRenewsAt,
    foundingMember: update.foundingMember,
  };
});

exports.clearSubscription = onCall(async (request) => {
  if (!request.auth?.uid) {
    throw new HttpsError(
      "unauthenticated",
      "Sign in required.",
    );
  }

  await db.collection("parents").doc(request.auth.uid).update({
    subscription: "trial",
    foundingMember: false,
    subscriptionPriceLabel: null,
    subscriptionTrialEndsAt: null,
    trialEndsAt: null,
    subscriptionRenewsAt: null,
    nextBillingDate: null,
    subscriptionSource: null,
    subscriptionPlatform: null,
    subscriptionReceiptId: null,
    subscriptionCancelledAt: FieldValue.serverTimestamp(),
    updatedAt: FieldValue.serverTimestamp(),
  });

  return { ok: true };
});
