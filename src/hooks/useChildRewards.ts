/**
 * Loads a child's star, gem, and badge totals from Firestore.
 *
 * Rewards are cached for the current app session so previously loaded
 * values stay visible while Firestore refreshes in the background.
 *
 * The hook still exposes `loading`, `error`, and `retry` for screens that
 * need explicit first-load or retry states, but normal focus refreshes do
 * not reset the visible rewards to zero or show a new loading state.
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

type RewardTotals = {
  stars: number;
  gems: number;
  badges: string[];
};

type ChildRewardsData = RewardTotals & {
  loading: boolean;
  error: string | null;
};

const EMPTY_TOTALS: RewardTotals = {
  stars: 0,
  gems: 0,
  badges: [],
};

/**
 * Runtime-only cache.
 *
 * Firestore remains the source of truth. The cache simply prevents
 * reward totals from visibly jumping back to zero every time a child
 * screen is revisited.
 */
const childRewardsCache =
  new Map<string, RewardTotals>();

function getRewardsCacheKey(
  parentUid: string,
  childId: string,
): string {
  return `${parentUid}:${childId}`;
}

function createInitialRewards(
  parentUid: string | undefined,
  childId: string | null | undefined,
): ChildRewardsData {
  if (!parentUid || !childId) {
    return {
      ...EMPTY_TOTALS,
      loading: false,
      error: null,
    };
  }

  const cached =
    childRewardsCache.get(
      getRewardsCacheKey(
        parentUid,
        childId,
      ),
    );

  if (cached) {
    return {
      ...cached,
      loading: false,
      error: null,
    };
  }

  return {
    ...EMPTY_TOTALS,
    loading: true,
    error: null,
  };
}

export function useChildRewards(
  childId: string | null | undefined,
): ChildRewardsState {
  const { user } = useAuth();

  const [
    rewards,
    setRewards,
  ] =
    useState<ChildRewardsData>(() =>
      createInitialRewards(
        user?.uid,
        childId,
      ),
    );

  const [
    reloadKey,
    setReloadKey,
  ] = useState(0);

  const retry = useCallback(() => {
    setReloadKey(
      (currentKey) =>
        currentKey + 1,
    );
  }, []);

  useFocusEffect(
    useCallback(() => {
      let stillMounted = true;

      async function loadRewards() {
        if (
          !user?.uid ||
          !childId
        ) {
          if (stillMounted) {
            setRewards({
              ...EMPTY_TOTALS,
              loading: false,
              error: null,
            });
          }

          return;
        }

        const cacheKey =
          getRewardsCacheKey(
            user.uid,
            childId,
          );

        const cached =
          childRewardsCache.get(
            cacheKey,
          );

        /*
         * If rewards were already loaded during this app session,
         * show them immediately and refresh silently.
         *
         * If this is the first-ever load for this child, preserve
         * the hook's `loading` signal for screens that care about it.
         */
        if (stillMounted) {
          if (cached) {
            setRewards({
              ...cached,
              loading: false,
              error: null,
            });
          } else {
            setRewards(
              (current) => ({
                ...current,
                loading: true,
                error: null,
              }),
            );
          }
        }

        try {
          const child =
            await getChild(
              user.uid,
              childId,
            );

          if (!stillMounted) {
            return;
          }

          if (!child) {
            setRewards(
              (current) => ({
                ...current,
                loading: false,
                error:
                  "We couldn't load this child profile. Please try again.",
              }),
            );

            return;
          }

          const nextTotals: RewardTotals =
            {
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

              badges:
                Array.isArray(
                  child.badges,
                )
                  ? child.badges
                  : [],
            };

          childRewardsCache.set(
            cacheKey,
            nextTotals,
          );

          setRewards({
            ...nextTotals,
            loading: false,
            error: null,
          });
        } catch (loadError) {
          console.error(
            "Unable to load child rewards:",
            loadError,
          );

          if (stillMounted) {
            /*
             * Keep the last visible values if a background refresh
             * fails. Only the error/loading metadata changes.
             */
            setRewards(
              (current) => ({
                ...current,
                loading: false,
                error:
                  "Please check your internet connection and try again.",
              }),
            );
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