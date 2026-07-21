/**
 * Loads the parent dashboard data without displaying fake child information.
 */

import { useEffect, useMemo, useState } from "react";

import {
  normalizeAvatarId,
  type AvatarId,
} from "@/constants/avatars";
import {
  formatEmotionLabel,
  isEmotionId,
  type EmotionId,
} from "@/constants/emotions";
import { useAuth } from "@/contexts/AuthContext";
import { listCheckIns } from "@/services/checkIns";
import {
  ageFromBirthdate,
  listChildren,
} from "@/services/children";

type DashboardStatus = "loading" | "ready" | "empty" | "error";

type DashboardData = {
  childId: string;
  childName: string;
  childAge: number | null;
  avatarId: AvatarId;
  todaysMood: EmotionId | null;
  progress: {
    phase: number;
    completedActivities: number;
    totalActivities: number;
  };
};

type Options = {
  moodOverride?: unknown;
};

/**
 * Progress stays temporary until the backend provides activity progress.
 */
const TEMPORARY_PROGRESS = {
  phase: 1,
  completedActivities: 3,
  totalActivities: 5,
};

export function useParentDashboardData(options: Options = {}) {
  const { user } = useAuth();

  const moodOverride = isEmotionId(options.moodOverride)
    ? options.moodOverride
    : null;

  const [data, setData] = useState<DashboardData | null>(null);
  const [status, setStatus] =
    useState<DashboardStatus>("loading");

  useEffect(() => {
    let cancelled = false;

    async function loadDashboardData() {
      setData(null);

      if (!user?.uid) {
        setStatus("empty");
        return;
      }

      setStatus("loading");

      try {
        const children = await listChildren(user.uid);
        const firstChild = children[0];

        if (!firstChild) {
          if (!cancelled) {
            setData(null);
            setStatus("empty");
          }

          return;
        }

        let latestMood: EmotionId | null = null;

        try {
          const checkIns = await listCheckIns(
            user.uid,
            firstChild.id,
          );

          const savedEmotion = checkIns[0]?.emotions;

          if (isEmotionId(savedEmotion)) {
            latestMood = savedEmotion;
          }
        } catch {
          latestMood = null;
        }

        if (!cancelled) {
          setData({
            childId: firstChild.id,
            childName: firstChild.name,
            childAge: ageFromBirthdate(firstChild.birthdate),
            avatarId: normalizeAvatarId(firstChild.avatar),
            todaysMood: moodOverride ?? latestMood,
            progress: TEMPORARY_PROGRESS,
          });

          setStatus("ready");
        }
      } catch (error) {
        console.error("Unable to load dashboard:", error);

        if (!cancelled) {
          setData(null);
          setStatus("error");
        }
      }
    }

    void loadDashboardData();

    return () => {
      cancelled = true;
    };
  }, [user?.uid, moodOverride]);

  const progressPercent = useMemo(() => {
    if (!data || data.progress.totalActivities === 0) {
      return 0;
    }

    return (
      data.progress.completedActivities /
      data.progress.totalActivities
    );
  }, [data]);

  const roundedProgressPercent = Math.round(
    progressPercent * 100,
  );

  return {
    status,
    loading: status === "loading",
    ready: status === "ready",
    empty: status === "empty",
    error: status === "error",

    childId: data?.childId ?? null,
    childName: data?.childName ?? null,
    childAge: data?.childAge ?? null,
    avatarId: data?.avatarId ?? null,
    todaysMood: data?.todaysMood ?? null,

    moodLabel: data?.todaysMood
      ? formatEmotionLabel(data.todaysMood)
      : null,

    progressPercent,

    progressLabel: data
      ? `Phase ${data.progress.phase}: ${roundedProgressPercent}% complete`
      : "",

    activitiesLabel: data
      ? `(${data.progress.completedActivities}/${data.progress.totalActivities} Activities Done)`
      : "",
  };
}