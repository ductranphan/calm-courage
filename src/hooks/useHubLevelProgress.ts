import { useFocusEffect } from "expo-router";
import {
  useCallback,
  useState,
} from "react";

import { useAuth } from "@/contexts/AuthContext";
import { getCompletedHubLevels } from "@/services/hubLevelProgress";

export function useHubLevelProgress(
  childId: string | null | undefined,
  activityId: string,
  totalLevels: number,
): {
  completedLevels: number[];
  loading: boolean;
} {
  const { user } = useAuth();

  const [completedLevels, setCompletedLevels] =
    useState<number[]>([]);

  const [loading, setLoading] =
    useState(true);

  useFocusEffect(
    useCallback(() => {
      let stillActive = true;

      async function loadProgress() {
        if (!user?.uid || !childId) {
          if (stillActive) {
            setCompletedLevels([]);
            setLoading(false);
          }
          return;
        }

        setLoading(true);

        try {
          const levels =
            await getCompletedHubLevels(
              user.uid,
              childId,
              activityId,
              totalLevels,
            );

          if (stillActive) {
            setCompletedLevels(levels);
          }
        } catch (error) {
          console.warn(
            "Unable to load hub level progress:",
            error,
          );

          if (stillActive) {
            setCompletedLevels([]);
          }
        } finally {
          if (stillActive) {
            setLoading(false);
          }
        }
      }

      void loadProgress();

      return () => {
        stillActive = false;
      };
    }, [
      activityId,
      childId,
      totalLevels,
      user?.uid,
    ]),
  );

  return {
    completedLevels,
    loading,
  };
}

export function isSequentialHubLevelLocked(
  levelNumber: number,
  completedLevels: readonly number[],
): boolean {
  if (levelNumber <= 1) {
    return false;
  }

  const completedSet = new Set(
    completedLevels,
  );

  for (
    let previousLevel = 1;
    previousLevel < levelNumber;
    previousLevel += 1
  ) {
    if (!completedSet.has(previousLevel)) {
      return true;
    }
  }

  return false;
}