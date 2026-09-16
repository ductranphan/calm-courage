/**
 * Calm Courage Cloud Functions (production entitlement grants).
 *
 * Deploy:
 *   npm run functions:install
 *   npm run firebase:deploy
 *
 * Clients call activateSubscription / clearSubscription via HTTPS callable.
 * Direct client writes to subscription fields are blocked by Firestore rules.
 *
 * Required Functions environment (set in Firebase Console → Functions →
 * Environment variables, or your CI deploy params):
 *   ALLOW_UNVERIFIED_SUBSCRIPTION_GRANT
 *     - unset / anything other than "false": allow soft-launch grants without
 *       a store receipt (internal QA / soft launch only)
 *     - "false": require receiptId (set this before public App Store / Play)
 */

const { initializeApp } = require("firebase-admin/app");
const { getFirestore, FieldValue } = require("firebase-admin/firestore");
const { onCall, HttpsError } = require("firebase-functions/v2/https");
const { setGlobalOptions } = require("firebase-functions/v2");

initializeApp();
setGlobalOptions({ region: "us-central1" });

const db = getFirestore();

const ALLOWED_PLANS = new Set(["monthly", "yearly"]);
const ALLOWED_PLATFORMS = new Set(["ios", "android", "web"]);
const MAX_STRING_LENGTH = 200;
const MAX_RECEIPT_LENGTH = 4096;

function asTrimmedString(value, maxLength) {
  if (typeof value !== "string") {
    return null;
  }

  const trimmed = value.trim();
  if (!trimmed) {
    return null;
  }

  return trimmed.slice(0, maxLength);
}

function buildEntitlementUpdate(input = {}) {
  const plan = ALLOWED_PLANS.has(input.plan) ? input.plan : "monthly";
  const trialDays =
    typeof input.trialDays === "number" &&
    Number.isFinite(input.trialDays) &&
    input.trialDays > 0
      ? Math.min(Math.floor(input.trialDays), 30)
      : 7;
  const priceLabel =
    asTrimmedString(input.priceLabel, MAX_STRING_LENGTH) ||
    (plan === "yearly" ? "$79.99/year" : "$7.99/month");
  const source =
    asTrimmedString(input.source, MAX_STRING_LENGTH) || "cloud_function";
  const platform = ALLOWED_PLATFORMS.has(input.platform)
    ? input.platform
    : null;
  const receiptId = asTrimmedString(input.receiptId, MAX_RECEIPT_LENGTH);

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
    subscriptionSource: source,
    subscriptionPlatform: platform,
    subscriptionReceiptId: receiptId,
    subscriptionActivatedAt: FieldValue.serverTimestamp(),
    updatedAt: FieldValue.serverTimestamp(),
  };
}

/**
 * Activates founding-member trial / subscription for the signed-in parent.
 *
 * Production path:
 * - Pass platform + receiptId from StoreKit / Play Billing after purchase.
 * - Set ALLOW_UNVERIFIED_SUBSCRIPTION_GRANT=false once receipt verification
 *   is implemented (see TODO below).
 *
 * Soft-launch path:
 * - Default allows grants without a store receipt so internal QA can unlock
 *   premium. Do not leave this enabled for public store builds.
 */
exports.activateSubscription = onCall(
  {
    region: "us-central1",
    // Reject unauthenticated callers at the platform layer when possible.
    // Auth is still checked below for a clear client error message.
    enforceAppCheck: false,
  },
  async (request) => {
    if (!request.auth?.uid) {
      throw new HttpsError(
        "unauthenticated",
        "Sign in required to activate a subscription.",
      );
    }

    const allowUnverified =
      process.env.ALLOW_UNVERIFIED_SUBSCRIPTION_GRANT !== "false";

    const data =
      request.data && typeof request.data === "object" ? request.data : {};
    const receiptId = asTrimmedString(data.receiptId, MAX_RECEIPT_LENGTH);
    const hasReceipt = Boolean(receiptId);

    if (!allowUnverified && !hasReceipt) {
      throw new HttpsError(
        "failed-precondition",
        "A verified store receipt is required.",
      );
    }

    /*
     * TODO(store): verify Apple/Google receipts with App Store Server API /
     * Google Play Developer API before writing entitlement.
     *
     * Before public release:
     * 1. Implement receipt verification above.
     * 2. Set Functions env ALLOW_UNVERIFIED_SUBSCRIPTION_GRANT=false
     *    (Firebase Console → Functions → Environment variables, or
     *    firebase functions:secrets / params for your deploy flow).
     * 3. Optionally set enforceAppCheck: true once App Check is wired
     *    in the mobile client.
     */

    const parentUid = request.auth.uid;
    const parentRef = db.collection("parents").doc(parentUid);
    const snapshot = await parentRef.get();

    if (!snapshot.exists) {
      throw new HttpsError("not-found", "Parent profile not found.");
    }

    const update = buildEntitlementUpdate({
      ...data,
      receiptId,
    });
    await parentRef.update(update);

    return {
      ok: true,
      plan: update.subscription,
      trialEndsAt: update.trialEndsAt,
      renewsAt: update.subscriptionRenewsAt,
      foundingMember: update.foundingMember,
    };
  },
);

exports.clearSubscription = onCall(
  {
    region: "us-central1",
    enforceAppCheck: false,
  },
  async (request) => {
    if (!request.auth?.uid) {
      throw new HttpsError("unauthenticated", "Sign in required.");
    }

    const parentRef = db.collection("parents").doc(request.auth.uid);
    const snapshot = await parentRef.get();

    if (!snapshot.exists) {
      throw new HttpsError("not-found", "Parent profile not found.");
    }

    await parentRef.update({
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
  },
);
