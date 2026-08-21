/**
 * Parent preference helpers stored on parents/{uid}.
 */

import {
  doc,
  getDoc,
  serverTimestamp,
  updateDoc,
} from "firebase/firestore";

import { db } from "@/config/firebase";

export type ParentPreferences = {
  audioEnabled: boolean;
  pushNotifications: boolean;
  weeklyEmailReports: boolean;
  /**
   * Last known Expo/FCM push token when notifications are enabled.
   * Delivery still requires a Cloud Function / push server.
   */
  pushToken?: string | null;
};

const DEFAULT_PREFERENCES: ParentPreferences = {
  audioEnabled: false,
  pushNotifications: false,
  weeklyEmailReports: false,
  pushToken: null,
};

function parentRef(parentUid: string) {
  return doc(db, "parents", parentUid);
}

export async function getParentPreferences(
  parentUid: string,
): Promise<ParentPreferences> {
  const snapshot = await getDoc(parentRef(parentUid));

  if (!snapshot.exists()) {
    return { ...DEFAULT_PREFERENCES };
  }

  const data = snapshot.data() as Record<
    string,
    unknown
  >;
  const preferences =
    data.preferences &&
    typeof data.preferences === "object" &&
    !Array.isArray(data.preferences)
      ? (data.preferences as Record<string, unknown>)
      : {};

  return {
    audioEnabled: preferences.audioEnabled === true,
    pushNotifications:
      preferences.pushNotifications === true,
    weeklyEmailReports:
      preferences.weeklyEmailReports === true,
    pushToken:
      typeof preferences.pushToken === "string"
        ? preferences.pushToken
        : null,
  };
}

export async function updateParentPreferences(
  parentUid: string,
  patch: Partial<ParentPreferences>,
): Promise<ParentPreferences> {
  const current = await getParentPreferences(parentUid);
  const next: ParentPreferences = {
    ...current,
    ...patch,
  };

  await updateDoc(parentRef(parentUid), {
    preferences: next,
    updatedAt: serverTimestamp(),
  });

  return next;
}

/**
 * Stores a device push token when the parent enables notifications.
 * Does not send pushes by itself — a server/Cloud Function must use the token.
 */
export async function registerPushToken(
  parentUid: string,
  pushToken: string,
): Promise<void> {
  const token = pushToken.trim();

  if (!token) {
    return;
  }

  await updateParentPreferences(parentUid, {
    pushNotifications: true,
    pushToken: token,
  });

  await updateDoc(parentRef(parentUid), {
    pushToken: token,
    pushTokenUpdatedAt: serverTimestamp(),
    updatedAt: serverTimestamp(),
  });
}
