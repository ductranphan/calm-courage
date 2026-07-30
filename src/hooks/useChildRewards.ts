/**
 * Loads live star / gem / badge totals for the active child from Firestore.
 * Refreshes whenever the screen gains focus so completions show up immediately.
 */

import { useFocusEffect } from "expo-router";
import { useCallback, useState } from "react";

import { useAuth } from "@/contexts/AuthContext";
import { getChild } from "@/services/children";

export type ChildRewardsState = {
  stars: number;
  gems: number;
  badges: string[];
  loading: boolean;
};

const EMPTY_REWARDS: ChildRewardsState = {
  stars: 0,
  gems: 0,
  badges: [],
  loading: true,
};

export function useChildRewards(
  childId: string | null | undefined,
): ChildRewardsState {
  const { user } = useAuth();
  const [rewards, setRewards] =
    useState<ChildRewardsState>(EMPTY_REWARDS);

  useFocusEffect(
    useCallback(() => {
      let stillMounted = true;

      async function loadRewards() {
        if (!user?.uid || !childId) {
          if (stillMounted) {
            setRewards({
              ...EMPTY_REWARDS,
              loading: false,
            });
          }
          return;
        }

        if (stillMounted) {
          setRewards((current) => ({
            ...current,
            loading: true,
          }));
        }

        try {
          const child = await getChild(user.uid, childId);

          if (!stillMounted) {
            return;
          }

          if (!child) {
            setRewards({
              ...EMPTY_REWARDS,
              loading: false,
            });
            return;
          }

          setRewards({
            stars: child.stars,
            gems: child.gems,
            badges: child.badges,
            loading: false,
          });
        } catch (loadError) {
          console.error(
            "Unable to load child rewards:",
            loadError,
          );

          if (stillMounted) {
            setRewards((current) => ({
              ...current,
              loading: false,
            }));
          }
        }
      }

      void loadRewards();

      return () => {
        stillMounted = false;
      };
    }, [user?.uid, childId]),
  );

  return rewards;
}
