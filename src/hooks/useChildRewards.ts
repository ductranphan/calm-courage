/**
 * Loads a child's star, gem, and badge totals from Firestore.
 *
 * The data refreshes whenever the current screen gains focus and exposes
 * an error state plus a retry function for child-mode error pages.
 */

import { useFocusEffect } from "expo-router";
import {
  useCallback,
  useState,
} from "react";

import { useAuth } from "@/contexts/AuthContext";
import { getChild } from "@/services/children";

export type ChildRewardsState = {
  stars: number;
  gems: number;
  badges: string[];
  loading: boolean;
  error: string | null;
  retry: () => void;
};

type ChildRewardsData = Omit<
  ChildRewardsState,
  "retry"
>;

const EMPTY_REWARDS: ChildRewardsData = {
  stars: 0,
  gems: 0,
  badges: [],
  loading: true,
  error: null,
};

export function useChildRewards(
  childId: string | null | undefined,
): ChildRewardsState {
  const { user } = useAuth();

  const [rewards, setRewards] =
    useState<ChildRewardsData>(
      EMPTY_REWARDS,
    );

  const [reloadKey, setReloadKey] =
    useState(0);

  const retry = useCallback(() => {
    setReloadKey(
      (currentKey) => currentKey + 1,
    );
  }, []);

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
            error: null,
          }));
        }

        try {
          const child = await getChild(
            user.uid,
            childId,
          );

          if (!stillMounted) {
            return;
          }

          if (!child) {
            setRewards({
              stars: 0,
              gems: 0,
              badges: [],
              loading: false,
              error:
                "We couldn't load this child profile. Please try again.",
            });

            return;
          }

          setRewards({
            stars:
              typeof child.stars ===
              "number"
                ? child.stars
                : 0,

            gems:
              typeof child.gems ===
              "number"
                ? child.gems
                : 0,

            badges: Array.isArray(
              child.badges,
            )
              ? child.badges
              : [],

            loading: false,
            error: null,
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
              error:
                "Please check your internet connection and try again.",
            }));
          }
        }
      }

      void loadRewards();

      return () => {
        stillMounted = false;
      };
    }, [
      childId,
      reloadKey,
      user?.uid,
    ]),
  );

  return {
    ...rewards,
    retry,
  };
}