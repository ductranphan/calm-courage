/**
 * Loads the child profile and daily data shown on the parent dashboard.
 *
 * The dashboard keeps previously loaded data visible while refreshing
 * Firestore in the background. This prevents the screen from flashing
 * back to a loading state during normal navigation.
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

/**
 * Keeps dashboard data available during the current app session.
 *
 * Firestore remains the source of truth. This cache is only used
 * to avoid showing an empty/loading dashboard while fresh data
 * is being fetched.
 */
const dashboardCache =
  new Map<string, DashboardData>();

function getCacheKey(
  parentUid: string,
  childId: string | null,
): string {
  return `${parentUid}:${childId ?? "__default__"}`;
}

function getValidEmotionId(
  value: unknown,
): EmotionId | null {
  if (
    typeof value !== "string"
  ) {
    return null;
  }

  const normalized =
    value
      .trim()
      .toLowerCase();

  return isEmotionId(
    normalized,
  )
    ? normalized
    : null;
}

function getValidChildId(
  value: unknown,
): string | null {
  if (
    typeof value !== "string"
  ) {
    return null;
  }

  const normalized =
    value.trim();

  return normalized.length > 0
    ? normalized
    : null;
}

/**
 * Creates enough dashboard data from ActiveChildContext to render
 * the page immediately while the full Firestore data is refreshed.
 */
function createPreviewData(
  activeChild:
    | {
        id: string;
        name: string;
        avatarId: AvatarId;
      }
    | null,
  preferredChildId: string | null,
  moodOverride: EmotionId | null,
): DashboardData | null {
  if (!activeChild) {
    return null;
  }

  /*
   * Do not briefly show one child's dashboard when the route
   * explicitly requested another child.
   */
  if (
    preferredChildId &&
    activeChild.id !==
      preferredChildId
  ) {
    return null;
  }

  return {
    childId:
      activeChild.id,

    childName:
      activeChild.name,

    childAge: 0,

    avatarId:
      normalizeAvatarId(
        activeChild.avatarId,
      ),

    todaysMood:
      moodOverride,

    progress: null,

    recentCompletions: [],
  };
}

export function useParentDashboardData(
  options?: Options,
) {
  const { user } =
    useAuth();

  const { activeChild } =
    useActiveChild();

  const requestedChildId =
    useMemo(
      () =>
        getValidChildId(
          options?.childId,
        ),
      [options?.childId],
    );

  const moodOverride =
    useMemo(
      () =>
        getValidEmotionId(
          options?.moodOverride,
        ),
      [options?.moodOverride],
    );

  const preferredChildId =
    requestedChildId ??
    activeChild?.id ??
    null;

  /**
   * Try to render something immediately.
   *
   * Priority:
   * 1. Previously cached dashboard
   * 2. Active child preview
   * 3. Empty state until the first Firestore request finishes
   */
  const initialData =
    useMemo(() => {
      if (!user?.uid) {
        return null;
      }

      const cached =
        dashboardCache.get(
          getCacheKey(
            user.uid,
            preferredChildId,
          ),
        );

      if (cached) {
        return cached;
      }

      return createPreviewData(
        activeChild,
        preferredChildId,
        moodOverride,
      );
    }, [
      activeChild,
      moodOverride,
      preferredChildId,
      user?.uid,
    ]);

  const [
    data,
    setData,
  ] =
    useState<DashboardData | null>(
      initialData,
    );

  /*
   * Loading is only true when there is genuinely nothing useful
   * available to render yet.
   */
  const [
    loading,
    setLoading,
  ] = useState(
    initialData === null,
  );

  const [
    empty,
    setEmpty,
  ] = useState(false);

  const [
    error,
    setError,
  ] =
    useState<
      string | null
    >(null);

  useEffect(() => {
    let stillMounted = true;

    async function loadDashboardData() {
      setError(null);
      setEmpty(false);

      if (!user?.uid) {
        if (stillMounted) {
          setData(null);
          setLoading(false);
        }

        return;
      }

      const cacheKey =
        getCacheKey(
          user.uid,
          preferredChildId,
        );

      const cached =
        dashboardCache.get(
          cacheKey,
        );

      const preview =
        createPreviewData(
          activeChild,
          preferredChildId,
          moodOverride,
        );

      /*
       * Keep existing content visible whenever possible.
       * Firestore refreshes silently behind the current UI.
       */
      if (stillMounted) {
        if (cached) {
          setData(cached);
          setLoading(false);
        } else if (preview) {
          setData(preview);
          setLoading(false);
        } else {
          /*
           * If another child was explicitly requested, do not keep
           * showing data belonging to the previous child.
           */
          setData(
            (current) =>
              current?.childId ===
              preferredChildId
                ? current
                : null,
          );

          setLoading(true);
        }
      }

      try {
        const children =
          await listChildren(
            user.uid,
          );

        if (
          children.length === 0
        ) {
          if (stillMounted) {
            setData(null);
            setEmpty(true);
          }

          return;
        }

        /*
         * Child selection priority:
         * 1. Child requested by the route
         * 2. Current ActiveChildContext child
         * 3. First available child profile
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

        /*
         * Today's mood can be requested immediately because it
         * does not depend on activity seeding.
         */
        const todayCheckInPromise =
          moodOverride
            ? Promise.resolve(
                null,
              )
            : getTodayCheckIn(
                user.uid,
                selectedChild.id,
              );

        /*
         * Ensure the Phase 1 activity catalog exists before
         * calculating activity progress.
         */
        await seedPhaseActivities(
          user.uid,
          selectedChild.id,
          1,
        );

        /*
         * These reads are independent, so run them in parallel
         * instead of waiting for each request one by one.
         */
        const [
          todayCheckIn,
          progress,
          recentCompletions,
        ] =
          await Promise.all([
            todayCheckInPromise,

            getChildActivityProgress(
              user.uid,
              selectedChild.id,
              1,
            ),

            getRecentCompletions(
              user.uid,
              selectedChild.id,
              5,
            ),
          ]);

        const todaysMood =
          moodOverride ??
          getValidEmotionId(
            todayCheckIn?.emotion,
          );

        const nextData: DashboardData =
          {
            childId:
              selectedChild.id,

            childName:
              selectedChild.name,

            childAge:
              selectedChild.age,

            avatarId:
              normalizeAvatarId(
                selectedChild.avatarId,
              ),

            todaysMood,

            progress,

            recentCompletions,
          };

        /*
         * Save the refreshed data so returning to the dashboard
         * during this app session is immediate.
         */
        dashboardCache.set(
          getCacheKey(
            user.uid,
            selectedChild.id,
          ),
          nextData,
        );

        /*
         * Also keep the selected child under the default dashboard
         * key when no explicit child was requested.
         */
        if (
          !requestedChildId
        ) {
          dashboardCache.set(
            getCacheKey(
              user.uid,
              null,
            ),
            nextData,
          );
        }

        if (stillMounted) {
          setData(nextData);
          setEmpty(false);
        }
      } catch (loadError) {
        console.error(
          "Unable to load parent dashboard:",
          loadError,
        );

        if (stillMounted) {
          /*
           * Do not clear already visible dashboard data because a
           * background refresh failed.
           */
          setError(
            "We couldn’t refresh the dashboard. Please try again.",
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
    activeChild,
    moodOverride,
    preferredChildId,
    requestedChildId,
    user?.uid,
  ]);

  const progressPercent =
    useMemo(() => {
      if (
        !data?.progress ||
        data.progress
          .totalActivities === 0
      ) {
        return 0;
      }

      return (
        data.progress
          .completedActivities /
        data.progress
          .totalActivities
      );
    }, [
      data?.progress,
    ]);

  const progressAvailable =
    data?.progress !== null &&
    data?.progress !==
      undefined;

  const roundedProgressPercent =
    Math.round(
      progressPercent * 100,
    );

  return {
    childId:
      data?.childId ??
      null,

    childName:
      data?.childName ??
      null,

    childAge:
      data?.childAge ??
      null,

    avatarId:
      data?.avatarId ??
      null,

    todaysMood:
      data?.todaysMood ??
      null,

    loading,
    empty,
    error,

    moodLabel:
      data?.todaysMood
        ? formatEmotionLabel(
            data.todaysMood,
          )
        : "Not checked in yet",

    progressAvailable,

    progressPercent,

    progressLabel:
      data?.progress
        ? `Phase ${data.progress.phase}: ${roundedProgressPercent}% complete`
        : "Progress tracking is not available yet",

    activitiesLabel:
      data?.progress
        ? `(${data.progress.completedActivities}/${data.progress.totalActivities} Activities Done)`
        : "",

    recentCompletions:
      data?.recentCompletions ??
      [],

    recentCompletionsLabel:
      data?.recentCompletions &&
      data.recentCompletions
        .length > 0
        ? data.recentCompletions
            .map(
              (item) =>
                item.title,
            )
            .join(" · ")
        : "No games completed yet this phase",
  };
}