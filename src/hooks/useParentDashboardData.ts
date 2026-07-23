/**
 * Parent dashboard data hook.
 *
 * Reads real child profile data from Firebase:
 * - child name
 * - child age
 * - child avatarId
 * - latest mood/check-in
 * - Phase 1 activity progress
 */

import { useEffect, useMemo, useState } from "react";

import {
  defaultAvatarId,
  normalizeAvatarId,
  type AvatarId,
} from "@/constants/avatars";
import {
  defaultEmotionId,
  formatEmotionLabel,
  normalizeEmotionId,
  type EmotionId,
} from "@/constants/emotions";
import { useAuth } from "@/contexts/AuthContext";
import {
  getChildActivityProgress,
  seedPhaseActivities,
} from "@/services/activityAttempts";
import { listCheckIns } from "@/services/checkIns";
import { listChildren } from "@/services/children";

type DashboardData = {
  childId: string | null;
  childName: string;
  childAge: number;
  avatarId: AvatarId;
  todaysMood: EmotionId;
  progress: {
    phase: number;
    completedActivities: number;
    totalActivities: number;
  };
};

type Options = {
  moodOverride?: unknown;
};

const FALLBACK_DATA: DashboardData = {
  childId: null,
  childName: "Emma",
  childAge: 4,
  avatarId: defaultAvatarId,
  todaysMood: defaultEmotionId,
  progress: {
    phase: 1,
    completedActivities: 0,
    totalActivities: 5,
  },
};

export function useParentDashboardData(options: Options = {}) {
  const { user } = useAuth();

  const moodOverride = options?.moodOverride
    ? normalizeEmotionId(options.moodOverride)
    : null;

  const [data, setData] = useState<DashboardData>({
    ...FALLBACK_DATA,
    todaysMood: moodOverride ?? FALLBACK_DATA.todaysMood,
  });

  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let stillMounted = true;

    async function loadDashboardData() {
      if (!user?.uid) {
        setData({
          ...FALLBACK_DATA,
          todaysMood: moodOverride ?? FALLBACK_DATA.todaysMood,
        });
        setLoading(false);
        return;
      }

      setLoading(true);

      try {
        const children = await listChildren(user.uid);
        const firstChild = children[0];

        if (!firstChild) {
          if (stillMounted) {
            setData({
              ...FALLBACK_DATA,
              todaysMood: moodOverride ?? FALLBACK_DATA.todaysMood,
            });
          }
          return;
        }

        let latestMood: EmotionId = defaultEmotionId;

        try {
          const checkIns = await listCheckIns(user.uid, firstChild.id);
          latestMood = normalizeEmotionId(checkIns[0]?.emotion);
        } catch {
          latestMood = defaultEmotionId;
        }

        // Ensure Phase 1 attempts exist for children created before seeding.
        await seedPhaseActivities(user.uid, firstChild.id, 1);

        const progress = await getChildActivityProgress(
          user.uid,
          firstChild.id,
          1,
        );

        if (stillMounted) {
          setData({
            childId: firstChild.id,
            childName: firstChild.name,
            childAge: firstChild.age,
            avatarId: normalizeAvatarId(firstChild.avatarId),
            todaysMood: moodOverride ?? latestMood,
            progress,
          });
        }
      } catch {
        if (stillMounted) {
          setData({
            ...FALLBACK_DATA,
            todaysMood: moodOverride ?? FALLBACK_DATA.todaysMood,
          });
        }
      } finally {
        if (stillMounted) {
          setLoading(false);
        }
      }
    }

    loadDashboardData();

    return () => {
      stillMounted = false;
    };
  }, [user?.uid, moodOverride]);

  const progressPercent = useMemo(() => {
    if (data.progress.totalActivities === 0) {
      return 0;
    }

    return data.progress.completedActivities / data.progress.totalActivities;
  }, [data.progress.completedActivities, data.progress.totalActivities]);

  const roundedProgressPercent = Math.round(progressPercent * 100);

  return {
    ...data,
    loading,
    moodLabel: formatEmotionLabel(data.todaysMood),
    progressPercent,
    progressLabel: `Phase ${data.progress.phase}: ${roundedProgressPercent}% complete`,
    activitiesLabel: `(${data.progress.completedActivities}/${data.progress.totalActivities} Activities Done)`,
  };
}
