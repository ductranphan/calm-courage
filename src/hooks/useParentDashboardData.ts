/**
 * Loads the child profile and daily data shown on the parent dashboard.
 *
 * A child explicitly requested by the route takes priority. Otherwise the
 * hook uses the child selected in ActiveChildContext, then falls back to the
 * first profile for accounts that have not selected a child yet.
 */

import {
  useEffect,
  useMemo,
  useState,
} from "react";

import {
  normalizeAvatarId,
  type AvatarId,
} from "@/constants/avatars";
import {
  formatEmotionLabel,
  isEmotionId,
  type EmotionId,
} from "@/constants/emotions";
import { useActiveChild } from "@/contexts/ActiveChildContext";
import { useAuth } from "@/contexts/AuthContext";
import {
  getChildActivityProgress,
  getRecentCompletions,
  seedPhaseActivities,
  type RecentCompletion,
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
  recentCompletions: RecentCompletion[];
};

type Options = {
  childId?: unknown;
  moodOverride?: unknown;
};

function getValidEmotionId(
  value: unknown,
): EmotionId | null {
  if (typeof value !== "string") {
    return null;
  }

  const normalized = value
    .trim()
    .toLowerCase();

  return isEmotionId(normalized)
    ? normalized
    : null;
}

function getValidChildId(
  value: unknown,
): string | null {
  if (typeof value !== "string") {
    return null;
  }

  const normalized = value.trim();

  return normalized.length > 0
    ? normalized
    : null;
}

export function useParentDashboardData(
  options?: Options,
) {
  const { user } = useAuth();
  const { activeChild } = useActiveChild();

  const requestedChildId = useMemo(
    () =>
      getValidChildId(options?.childId),
    [options?.childId],
  );

  const moodOverride = useMemo(
    () =>
      getValidEmotionId(
        options?.moodOverride,
      ),
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
        const children =
          await listChildren(user.uid);

        if (children.length === 0) {
          if (stillMounted) {
            setEmpty(true);
          }

          return;
        }

        /*
         * Selection order:
         * 1. Child requested through the route
         * 2. Child already selected in context
         * 3. First profile as a safe initial fallback
         */
        const selectedChild =
          (requestedChildId
            ? children.find(
                (child) =>
                  child.id ===
                  requestedChildId,
              )
            : undefined) ??
          (activeChild
            ? children.find(
                (child) =>
                  child.id ===
                  activeChild.id,
              )
            : undefined) ??
          children[0];

        let todaysMood:
          | EmotionId
          | null = moodOverride;

        /* Old check-ins must not be displayed as today's mood. */
        if (!todaysMood) {
          const todayCheckIn =
            await getTodayCheckIn(
              user.uid,
              selectedChild.id,
            );

          todaysMood =
            getValidEmotionId(
              todayCheckIn?.emotion,
            );
        }

        /*
         * Ensure older child profiles also receive the Phase 1 catalog,
         * then calculate live progress from their completed attempts.
         */
        await seedPhaseActivities(
          user.uid,
          selectedChild.id,
          1,
        );

        const progress =
          await getChildActivityProgress(
            user.uid,
            selectedChild.id,
            1,
          );

        const recentCompletions =
          await getRecentCompletions(
            user.uid,
            selectedChild.id,
            5,
          );

        if (stillMounted) {
          setData({
            childId: selectedChild.id,
            childName:
              selectedChild.name,
            childAge: selectedChild.age,
            avatarId:
              normalizeAvatarId(
                selectedChild.avatarId,
              ),
            todaysMood,
            progress,
            recentCompletions,
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
  }, [
    activeChild?.id,
    moodOverride,
    requestedChildId,
    user?.uid,
  ]);

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
    todaysMood:
      data?.todaysMood ?? null,

    loading,
    empty,
    error,

    moodLabel: data?.todaysMood
      ? formatEmotionLabel(
          data.todaysMood,
        )
      : "Not checked in yet",

    progressAvailable,
    progressPercent,

    progressLabel: data?.progress
      ? `Phase ${data.progress.phase}: ${roundedProgressPercent}% complete`
      : "Progress tracking is not available yet",

    activitiesLabel: data?.progress
      ? `(${data.progress.completedActivities}/${data.progress.totalActivities} Activities Done)`
      : "",

    recentCompletions:
      data?.recentCompletions ?? [],

    recentCompletionsLabel:
      data?.recentCompletions &&
      data.recentCompletions.length > 0
        ? data.recentCompletions
            .map((item) => item.title)
            .join(" · ")
        : "No games completed yet this phase",
  };
}