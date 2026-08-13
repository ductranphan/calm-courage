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
};

const DEFAULT_PREFERENCES: ParentPreferences = {
  audioEnabled: false,
  pushNotifications: false,
  weeklyEmailReports: false,
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
