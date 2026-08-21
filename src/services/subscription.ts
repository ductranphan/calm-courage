/**
 * Parent subscription entitlement service.
 *
 * Writes/reads subscription fields on parents/{uid}.
 * Real App Store / Play Billing should call activateSubscription
 * only after a verified purchase receipt. The paywall currently
 * activates a founding-member trial for QA and soft-launch testing.
 */

import {
  doc,
  getDoc,
  serverTimestamp,
  updateDoc,
} from "firebase/firestore";

import { db } from "@/config/firebase";

export type SubscriptionPlan =
  | "trial"
  | "monthly"
  | "yearly";

export type SubscriptionEntitlement = {
  plan: SubscriptionPlan;
  foundingMember: boolean;
  priceLabel: string | null;
  renewsAt: Date | null;
  trialEndsAt: Date | null;
  isActive: boolean;
};

const DEFAULT_ENTITLEMENT: SubscriptionEntitlement = {
  plan: "trial",
  foundingMember: false,
  priceLabel: null,
  renewsAt: null,
  trialEndsAt: null,
  isActive: false,
};

function parentRef(parentUid: string) {
  return doc(db, "parents", parentUid);
}

function parseDateValue(value: unknown): Date | null {
  if (!value) {
    return null;
  }

  if (value instanceof Date) {
    return Number.isNaN(value.getTime()) ? null : value;
  }

  if (
    typeof value === "object" &&
    value !== null &&
    "toDate" in value &&
    typeof (value as { toDate?: unknown }).toDate === "function"
  ) {
    const date = (value as { toDate: () => Date }).toDate();
    return Number.isNaN(date.getTime()) ? null : date;
  }

  if (typeof value === "string" || typeof value === "number") {
    const date = new Date(value);
    return Number.isNaN(date.getTime()) ? null : date;
  }

  return null;
}

function computeIsActive(
  plan: SubscriptionPlan,
  trialEndsAt: Date | null,
  renewsAt: Date | null,
): boolean {
  const now = Date.now();

  if (plan === "monthly" || plan === "yearly") {
    if (trialEndsAt && trialEndsAt.getTime() > now) {
      return true;
    }

    if (renewsAt && renewsAt.getTime() > now) {
      return true;
    }

    /*
     * Active paid plan without an expired renew date.
     * Soft-launch: treat monthly/yearly as active until cancelled.
     */
    return !renewsAt || renewsAt.getTime() > now;
  }

  return false;
}

export async function getSubscriptionEntitlement(
  parentUid: string,
): Promise<SubscriptionEntitlement> {
  const snapshot = await getDoc(parentRef(parentUid));

  if (!snapshot.exists()) {
    return { ...DEFAULT_ENTITLEMENT };
  }

  const data = snapshot.data() as Record<string, unknown>;

  const plan: SubscriptionPlan =
    data.subscription === "monthly" ||
    data.subscription === "yearly"
      ? data.subscription
      : "trial";

  const renewsAt = parseDateValue(
    data.subscriptionRenewsAt ?? data.nextBillingDate,
  );
  const trialEndsAt = parseDateValue(
    data.subscriptionTrialEndsAt ?? data.trialEndsAt,
  );

  return {
    plan,
    foundingMember: data.foundingMember === true,
    priceLabel:
      typeof data.subscriptionPriceLabel === "string"
        ? data.subscriptionPriceLabel.trim()
        : null,
    renewsAt,
    trialEndsAt,
    isActive: computeIsActive(plan, trialEndsAt, renewsAt),
  };
}

export type ActivateSubscriptionInput = {
  plan?: "monthly" | "yearly";
  foundingMember?: boolean;
  priceLabel?: string;
  trialDays?: number;
  source?: string;
};

/**
 * Activates a founding-member subscription/trial on the parent profile.
 * Call only after a successful (or QA-simulated) purchase confirmation.
 */
export async function activateSubscription(
  parentUid: string,
  input: ActivateSubscriptionInput = {},
): Promise<SubscriptionEntitlement> {
  const plan = input.plan ?? "monthly";
  const trialDays = input.trialDays ?? 7;
  const priceLabel =
    input.priceLabel ??
    (plan === "yearly" ? "$79.99/year" : "$7.99/month");

  const trialEndsAt = new Date();
  trialEndsAt.setDate(trialEndsAt.getDate() + trialDays);

  const renewsAt = new Date(trialEndsAt);

  await updateDoc(parentRef(parentUid), {
    subscription: plan,
    foundingMember: input.foundingMember !== false,
    subscriptionPriceLabel: priceLabel,
    subscriptionTrialEndsAt: trialEndsAt.toISOString(),
    trialEndsAt: trialEndsAt.toISOString(),
    subscriptionRenewsAt: renewsAt.toISOString(),
    nextBillingDate: renewsAt.toISOString(),
    subscriptionSource: input.source ?? "paywall",
    subscriptionActivatedAt: serverTimestamp(),
    updatedAt: serverTimestamp(),
  });

  return getSubscriptionEntitlement(parentUid);
}

export async function clearSubscription(
  parentUid: string,
): Promise<void> {
  await updateDoc(parentRef(parentUid), {
    subscription: "trial",
    foundingMember: false,
    subscriptionPriceLabel: null,
    subscriptionTrialEndsAt: null,
    trialEndsAt: null,
    subscriptionRenewsAt: null,
    nextBillingDate: null,
    subscriptionCancelledAt: serverTimestamp(),
    updatedAt: serverTimestamp(),
  });
}
