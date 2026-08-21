/**
 * Premium / subscription access helpers.
 *
 * Activity 1 in each hub is free.
 * Activities 2+ require an active parent subscription entitlement.
 */

import { useCallback, useEffect, useState } from "react";

import { useAuth } from "@/contexts/AuthContext";
import {
  getSubscriptionEntitlement,
} from "@/services/subscription";

export const FREE_ACTIVITY_NUMBER = 1;

export function isPremiumActivity(
  activityNumber: number,
): boolean {
  return activityNumber > FREE_ACTIVITY_NUMBER;
}

/**
 * True when the activity requires paywall navigation
 * for a parent who does not have an active subscription.
 */
export function requiresPaywall(
  activityNumber: number,
  hasActiveSubscription: boolean,
): boolean {
  return (
    isPremiumActivity(activityNumber) &&
    !hasActiveSubscription
  );
}

export function usePremiumAccess() {
  const { user } = useAuth();
  const [hasPremium, setHasPremium] = useState(false);
  const [loading, setLoading] = useState(true);

  const refresh = useCallback(async () => {
    if (!user?.uid) {
      setHasPremium(false);
      setLoading(false);
      return;
    }

    setLoading(true);

    try {
      const entitlement =
        await getSubscriptionEntitlement(user.uid);
      setHasPremium(entitlement.isActive);
    } catch (error) {
      console.warn(
        "Unable to load subscription entitlement:",
        error,
      );
      setHasPremium(false);
    } finally {
      setLoading(false);
    }
  }, [user?.uid]);

  useEffect(() => {
    void refresh();
  }, [refresh]);

  return {
    hasPremium,
    loading,
    refresh,
  };
}
