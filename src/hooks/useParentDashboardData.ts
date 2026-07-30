/**
 * Parent dashboard data hook.
 *
 * Reads real child profile data from Firebase:
 * - child name
 * - child age
 * - child avatar
 * - today's emotion check-in
 */

import { useEffect, useMemo, useState } from "react";

import type { AvatarId } from "@/constants/avatars";
import { normalizeAvatarId } from "@/constants/avatars";
import {
  formatEmotionLabel,
  isEmotionId,
  type EmotionId,
} from "@/constants/emotions";
import { useAuth } from "@/contexts/AuthContext";
import {
  getChildActivityProgress,
  seedPhaseActivities,
} from "@/services/activityAttempts";
import { getTodayCheckIn } from "@/services/checkIns";
import { listChildren } from "@/services/children";

type ProgressData = {
  phase: number;
  completedActivities: number;
  totalActivities: number;
};

type DashboardData = {
  childId: string;
  childName: string;
  childAge: number;
  avatarId: AvatarId;
  todaysMood: EmotionId | null;
  progress: ProgressData | null;
};

type Options = {
  moodOverride?: unknown;
};

function getValidEmotionId(value: unknown): EmotionId | null {
  if (typeof value !== "string") {
    return null;
  }

  const normalized = value.trim().toLowerCase();

  return isEmotionId(normalized)
    ? normalized
    : null;
}

export function useParentDashboardData(options?: Options) {
  const { user } = useAuth();

  const moodOverride = useMemo(
    () => getValidEmotionId(options?.moodOverride),
    [options?.moodOverride],
  );

  const [data, setData] =
    useState<DashboardData | null>(null);

  const [loading, setLoading] =
    useState(true);

  const [empty, setEmpty] =
    useState(false);

  const [error, setError] =
    useState<string | null>(null);

  useEffect(() => {
    let stillMounted = true;

    async function loadDashboardData() {
      /*
       * Clear the previous dashboard information before loading.
       * This prevents data from another user or child flashing briefly.
       */
      if (stillMounted) {
        setData(null);
        setEmpty(false);
        setError(null);
      }

      if (!user?.uid) {
        if (stillMounted) {
          setLoading(false);
        }

        return;
      }

      if (stillMounted) {
        setLoading(true);
      }

      try {
        const children = await listChildren(user.uid);
        const firstChild = children[0];

        if (!firstChild) {
          if (stillMounted) {
            setEmpty(true);
          }

          return;
        }

        let todaysMood: EmotionId | null =
          moodOverride;

        /*
         * Only read today's check-in.
         * An old emotion should not appear as today's mood.
         */
        if (!todaysMood) {
          const todayCheckIn =
            await getTodayCheckIn(
              user.uid,
              firstChild.id,
            );

          todaysMood = getValidEmotionId(
            todayCheckIn?.emotion,
          );
        }

        /*
         * Older children created before seeding may have no attempts yet.
         * Idempotent seed keeps the progress bar accurate.
         */
        await seedPhaseActivities(
          user.uid,
          firstChild.id,
        );

        const progress = await getChildActivityProgress(
          user.uid,
          firstChild.id,
        );

        if (stillMounted) {
          setData({
            childId: firstChild.id,
            childName: firstChild.name,
            childAge: firstChild.age,
            avatarId: normalizeAvatarId(
              firstChild.avatarId,
            ),
            todaysMood,
            progress,
          });
        }
      } catch (loadError) {
        console.error(
          "Unable to load parent dashboard:",
          loadError,
        );

        if (stillMounted) {
          setError(
            "We couldn’t load the dashboard. Please try again.",
          );
        }
      } finally {
        if (stillMounted) {
          setLoading(false);
        }
      }
    }

    void loadDashboardData();

    return () => {
      stillMounted = false;
    };
  }, [user?.uid, moodOverride]);

  const progressPercent = useMemo(() => {
    if (
      !data?.progress ||
      data.progress.totalActivities === 0
    ) {
      return 0;
    }

    return (
      data.progress.completedActivities /
      data.progress.totalActivities
    );
  }, [data?.progress]);

  const progressAvailable =
    data?.progress !== null &&
    data?.progress !== undefined;

  const roundedProgressPercent =
    Math.round(progressPercent * 100);

  return {
    childId: data?.childId ?? null,
    childName: data?.childName ?? null,
    childAge: data?.childAge ?? null,
    avatarId: data?.avatarId ?? null,
    todaysMood: data?.todaysMood ?? null,

    loading,
    empty,
    error,

    moodLabel: data?.todaysMood
      ? formatEmotionLabel(data.todaysMood)
      : "Not checked in yet",

    progressAvailable,
    progressPercent,

    progressLabel: data?.progress
      ? `Phase ${data.progress.phase}: ${roundedProgressPercent}% complete`
      : "Progress tracking is not available yet",

    activitiesLabel: data?.progress
      ? `(${data.progress.completedActivities}/${data.progress.totalActivities} Activities Done)`
      : "",
  };
}