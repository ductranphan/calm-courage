/**
 * Shared helper: whether a Phase 1 catalog activity is completed.
 * Used by game hubs to unlock levels after Level 1 finishes.
 */

import { useEffect, useState } from "react";

import { useAuth } from "@/contexts/AuthContext";
import { getActivityAttempt } from "@/services/activityAttempts";

export function useActivityCompleted(
  childId: string | null | undefined,
  activityId: string,
): { completed: boolean; loading: boolean } {
  const { user } = useAuth();
  const [completed, setCompleted] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let stillMounted = true;

    async function load() {
      if (!user?.uid || !childId) {
        if (stillMounted) {
          setCompleted(false);
          setLoading(false);
        }
        return;
      }

      setLoading(true);

      try {
        const attempt = await getActivityAttempt(
          user.uid,
          childId,
          activityId,
        );

        if (stillMounted) {
          setCompleted(attempt?.status === "completed");
        }
      } catch (error) {
        console.warn(
          "Unable to load activity completion:",
          error,
        );

        if (stillMounted) {
          setCompleted(false);
        }
      } finally {
        if (stillMounted) {
          setLoading(false);
        }
      }
    }

    void load();

    return () => {
      stillMounted = false;
    };
  }, [activityId, childId, user?.uid]);

  return { completed, loading };
}

/**
 * Level 1 always unlocked. Levels 2+ unlock after the hub's
 * linked Phase 1 activity is completed.
 */
export function isHubLevelLocked(
  levelNumber: number,
  phaseActivityCompleted: boolean,
): boolean {
  if (levelNumber <= 1) {
    return false;
  }

  return !phaseActivityCompleted;
}
