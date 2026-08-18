/**
 * Access rule for activity-based content.
 *
 * The first activity in each game is free.
 * Activities 2 and above require a subscription.
 *
 * This helper only decides whether an activity is premium.
 * Real subscription ownership should be checked separately
 * once the store purchase flow is connected.
 */

export const FREE_ACTIVITY_NUMBER = 1;

export function isPremiumActivity(
  activityNumber: number,
): boolean {
  return activityNumber > FREE_ACTIVITY_NUMBER;
}