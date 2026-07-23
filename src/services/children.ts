/**
 * Child profile service.
 *
 * CRUD for child profiles under parents/{parentUid}/children/{childId}.
 * Schema matches product slides (Screen 3 / 3.1).
 */
import {
  collection,
  doc,
  getDoc,
  getDocs,
  serverTimestamp,
  setDoc,
  Timestamp,
  updateDoc,
} from "firebase/firestore";

import { db } from "@/config/firebase";
import type { AvatarId } from "@/constants/avatars";

export type ChildProfile = {
  id: string;
  name: string;
  birthdate: Timestamp | { seconds: number; nanoseconds: number };
  avatar: AvatarId;
  createdAt?: unknown;
  stars: number;
  gems: number;
  badges: string[];
};

export type CreateChildInput = {
  name: string;
  /** Screen 3 collects age; stored as approximate birthdate in Firestore. */
  age: number;
  avatar: AvatarId;
};

export type UpdateChildInput = {
  name?: string;
  /** Screen 3 collects age; stored as approximate birthdate in Firestore. */
  age?: number;
  avatar?: AvatarId;
};

function childrenCollection(parentUid: string) {
  return collection(db, "parents", parentUid, "children");
}

function childDoc(parentUid: string, childId: string) {
  return doc(db, "parents", parentUid, "children", childId);
}

/** Convert age (years) into a birthdate timestamp (Jan 1 of birth year). */
export function birthdateFromAge(age: number): Timestamp {
  const year = new Date().getFullYear() - age;
  return Timestamp.fromDate(new Date(year, 0, 1));
}

/** Derive approximate age in years from a stored birthdate. */
export function ageFromBirthdate(
  birthdate: ChildProfile["birthdate"] | null | undefined
): number | null {
  if (!birthdate || typeof birthdate !== "object" || !("seconds" in birthdate)) {
    return null;
  }

  const birth = new Date(birthdate.seconds * 1000);
  const now = new Date();
  let age = now.getFullYear() - birth.getFullYear();
  const monthDiff = now.getMonth() - birth.getMonth();
  if (monthDiff < 0 || (monthDiff === 0 && now.getDate() < birth.getDate())) {
    age -= 1;
  }
  return age >= 0 ? age : null;
}

function mapChildDoc(
  id: string,
  data: Record<string, unknown>
): ChildProfile {
  return {
    id,
    name: typeof data.name === "string" ? data.name : "",
    birthdate: data.birthdate as ChildProfile["birthdate"],
    avatar: data.avatar as AvatarId,
    createdAt: data.createdAt,
    stars: typeof data.stars === "number" ? data.stars : 0,
    gems: typeof data.gems === "number" ? data.gems : 0,
    badges: Array.isArray(data.badges)
      ? data.badges.filter(
          (badge): badge is string => typeof badge === "string"
        )
      : [],
  };
}

export async function listChildren(parentUid: string): Promise<ChildProfile[]> {
  const snapshot = await getDocs(childrenCollection(parentUid));

  return snapshot.docs.map((childSnapshot) =>
    mapChildDoc(childSnapshot.id, childSnapshot.data())
  );
}

export async function getChild(
  parentUid: string,
  childId: string
): Promise<ChildProfile | null> {
  const snapshot = await getDoc(childDoc(parentUid, childId));
  if (!snapshot.exists()) {
    return null;
  }

  return mapChildDoc(snapshot.id, snapshot.data());
}

export async function createChild(
  parentUid: string,
  data: CreateChildInput
): Promise<string> {
  const childRef = doc(childrenCollection(parentUid));

  await setDoc(childRef, {
    name: data.name.trim(),
    birthdate: birthdateFromAge(data.age),
    avatar: data.avatar,
    createdAt: serverTimestamp(),
    stars: 0,
    gems: 0,
    badges: [],
  });

  return childRef.id;
}

/**
 * Update an existing child profile.
 *
 * Only the supplied fields are updated. Existing rewards and createdAt data
 * remain unchanged.
 */
export async function updateChild(
  parentUid: string,
  childId: string,
  data: UpdateChildInput
): Promise<void> {
  const updates: Record<string, unknown> = {};

  if (data.name !== undefined) {
    const trimmedName = data.name.trim();

    if (!trimmedName) {
      throw new Error("Child name cannot be empty.");
    }

    updates.name = trimmedName;
  }

  if (data.age !== undefined) {
    if (
      !Number.isInteger(data.age) ||
      data.age < 1 ||
      data.age > 17
    ) {
      throw new Error("Child age must be between 1 and 17.");
    }

    updates.birthdate = birthdateFromAge(data.age);
  }

  if (data.avatar !== undefined) {
    updates.avatar = data.avatar;
  }

  if (Object.keys(updates).length === 0) {
    return;
  }

  await updateDoc(childDoc(parentUid, childId), updates);
}

export type AwardRewardsInput = {
  stars?: number;
  gems?: number;
  badges?: string[];
};

/**
 * Increment a child's reward totals after an activity or check-in.
 */
export async function awardRewards(
  parentUid: string,
  childId: string,
  rewards: AwardRewardsInput,
): Promise<void> {
  const child = await getChild(parentUid, childId);

  if (!child) {
    throw new Error("Child profile not found.");
  }

  const nextBadges = [...child.badges];

  for (const badge of rewards.badges ?? []) {
    if (!nextBadges.includes(badge)) {
      nextBadges.push(badge);
    }
  }

  await updateDoc(childDoc(parentUid, childId), {
    stars: child.stars + Math.max(0, rewards.stars ?? 0),
    gems: child.gems + Math.max(0, rewards.gems ?? 0),
    badges: nextBadges,
  });
}