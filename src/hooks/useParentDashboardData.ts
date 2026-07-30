/**
 * Parent dashboard data hook.
 *
 * Loads every child for the signed-in parent, remembers which child is
 * selected for the dashboard, and returns that child's mood + progress.
 */

import AsyncStorage from "@react-native-async-storage/async-storage";
import { useCallback, useEffect, useMemo, useState } from "react";

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
import {
  listChildren,
  type ChildProfile,
} from "@/services/children";

type ProgressData = {
  phase: number;
  completedActivities: number;
  totalActivities: number;
};

export type DashboardChildOption = {
  id: string;
  name: string;
  age: number;
  avatarId: AvatarId;
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

function selectedChildStorageKey(parentUid: string) {
  return `parentDashboardSelectedChild:${parentUid}`;
}

function getValidEmotionId(value: unknown): EmotionId | null {
  if (typeof value !== "string") {
    return null;
  }

  const normalized = value.trim().toLowerCase();

  return isEmotionId(normalized)
    ? normalized
    : null;
}

function toDashboardOption(child: ChildProfile): DashboardChildOption {
  return {
    id: child.id,
    name: child.name,
    age: child.age,
    avatarId: normalizeAvatarId(child.avatarId),
  };
}

export function useParentDashboardData(options?: Options) {
  const { user } = useAuth();

  const moodOverride = useMemo(
    () => getValidEmotionId(options?.moodOverride),
    [options?.moodOverride],
  );

  const [children, setChildren] = useState<DashboardChildOption[]>([]);
  const [selectedChildId, setSelectedChildId] =
    useState<string | null>(null);
  const [data, setData] =
    useState<DashboardData | null>(null);

  const [loading, setLoading] =
    useState(true);

  const [empty, setEmpty] =
    useState(false);

  const [error, setError] =
    useState<string | null>(null);

  const selectChild = useCallback(
    async (childId: string) => {
      if (!user?.uid) {
        return;
      }

      setSelectedChildId(childId);

      try {
        await AsyncStorage.setItem(
          selectedChildStorageKey(user.uid),
          childId,
        );
      } catch (storageError) {
        console.warn(
          "Unable to persist selected dashboard child:",
          storageError,
        );
      }
    },
    [user?.uid],
  );

  useEffect(() => {
    let stillMounted = true;

    async function loadChildrenList() {
      if (stillMounted) {
        setData(null);
        setEmpty(false);
        setError(null);
      }

      if (!user?.uid) {
        if (stillMounted) {
          setChildren([]);
          setSelectedChildId(null);
          setLoading(false);
        }

        return;
      }

      if (stillMounted) {
        setLoading(true);
      }

      try {
        const loadedChildren = await listChildren(user.uid);

        if (!stillMounted) {
          return;
        }

        if (loadedChildren.length === 0) {
          setChildren([]);
          setSelectedChildId(null);
          setEmpty(true);
          setLoading(false);
          return;
        }

        const options = loadedChildren.map(toDashboardOption);
        setChildren(options);

        let preferredId: string | null = null;

        try {
          preferredId = await AsyncStorage.getItem(
            selectedChildStorageKey(user.uid),
          );
        } catch {
          preferredId = null;
        }

        const preferredExists = options.some(
          (child) => child.id === preferredId,
        );

        setSelectedChildId(
          preferredExists && preferredId
            ? preferredId
            : options[0].id,
        );
      } catch (loadError) {
        console.error(
          "Unable to load parent dashboard children:",
          loadError,
        );

        if (stillMounted) {
          setError(
            "We couldn’t load the dashboard. Please try again.",
          );
          setLoading(false);
        }
      }
    }

    void loadChildrenList();

    return () => {
      stillMounted = false;
    };
  }, [user?.uid]);

  useEffect(() => {
    let stillMounted = true;

    async function loadSelectedChildData() {
      if (!user?.uid || !selectedChildId) {
        return;
      }

      if (stillMounted) {
        setLoading(true);
        setError(null);
      }

      try {
        let todaysMood: EmotionId | null =
          moodOverride;

        if (!todaysMood) {
          const todayCheckIn =
            await getTodayCheckIn(
              user.uid,
              selectedChildId,
            );

          todaysMood = getValidEmotionId(
            todayCheckIn?.emotion,
          );
        }

        await seedPhaseActivities(
          user.uid,
          selectedChildId,
        );

        const progress = await getChildActivityProgress(
          user.uid,
          selectedChildId,
        );

        const selectedChild = children.find(
          (child) => child.id === selectedChildId,
        );

        if (!selectedChild) {
          return;
        }

        if (stillMounted) {
          setData({
            childId: selectedChild.id,
            childName: selectedChild.name,
            childAge: selectedChild.age,
            avatarId: selectedChild.avatarId,
            todaysMood,
            progress,
          });
          setEmpty(false);
        }
      } catch (loadError) {
        console.error(
          "Unable to load selected child dashboard data:",
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

    void loadSelectedChildData();

    return () => {
      stillMounted = false;
    };
  }, [
    user?.uid,
    selectedChildId,
    moodOverride,
    children,
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
    children,
    selectedChildId,
    selectChild,

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
