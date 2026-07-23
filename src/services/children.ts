/**
 * Child profile service.
 *
 * CRUD for child profiles under parents/{uid}/children/{childId}.
 */

import {
  collection,
  deleteDoc,
  doc,
  getDoc,
  getDocs,
  serverTimestamp,
  setDoc,
  updateDoc,
} from "firebase/firestore";

import { db } from "@/config/firebase";
import type { AvatarId } from "@/constants/avatars";

export type ChildProfile = {
  id: string;
  name: string;
  age: number;
  avatarId: AvatarId;
  stars: number;
  gems: number;
  badges: string[];
  createdAt?: unknown;
  updatedAt?: unknown;
};

export type CreateChildInput = {
  name: string;
  age: number;
  avatarId: AvatarId;
};

export type UpdateChildInput = {
  name?: string;
  age?: number;
  avatarId?: AvatarId;
};

export type AwardRewardsInput = {
  stars?: number;
  gems?: number;
  badges?: string[];
};

function mapChildDoc(
  id: string,
  data: Record<string, unknown>,
): ChildProfile {
  return {
    id,
    name: typeof data.name === "string" ? data.name : "",
    age: typeof data.age === "number" ? data.age : 0,
    avatarId: data.avatarId as AvatarId,
    stars: typeof data.stars === "number" ? data.stars : 0,
    gems: typeof data.gems === "number" ? data.gems : 0,
    badges: Array.isArray(data.badges)
      ? data.badges.filter(
          (badge): badge is string => typeof badge === "string",
        )
      : [],
    createdAt: data.createdAt,
    updatedAt: data.updatedAt,
  };
}

export async function listChildren(parentUid: string): Promise<ChildProfile[]> {
  const snapshot = await getDocs(
    collection(db, "parents", parentUid, "children"),
  );

  return snapshot.docs.map((childDoc) =>
    mapChildDoc(childDoc.id, childDoc.data()),
  );
}

export async function getChild(
  parentUid: string,
  childId: string,
): Promise<ChildProfile | null> {
  const childRef = doc(db, "parents", parentUid, "children", childId);
  const snapshot = await getDoc(childRef);

  if (!snapshot.exists()) {
    return null;
  }

  return mapChildDoc(snapshot.id, snapshot.data());
}

export async function createChild(
  parentUid: string,
  data: CreateChildInput,
): Promise<string> {
  const childRef = doc(collection(db, "parents", parentUid, "children"));

  await setDoc(childRef, {
    name: data.name.trim(),
    age: data.age,
    avatarId: data.avatarId,
    stars: 0,
    gems: 0,
    badges: [],
    createdAt: serverTimestamp(),
    updatedAt: serverTimestamp(),
  });

  return childRef.id;
}

export async function updateChild(
  parentUid: string,
  childId: string,
  data: UpdateChildInput,
): Promise<void> {
  const childRef = doc(db, "parents", parentUid, "children", childId);

  const updateData: Record<
    string,
    string | number | AvatarId | ReturnType<typeof serverTimestamp>
  > = {
    updatedAt: serverTimestamp(),
  };

  if (data.name !== undefined) {
    updateData.name = data.name.trim();
  }

  if (data.age !== undefined) {
    updateData.age = data.age;
  }

  if (data.avatarId !== undefined) {
    updateData.avatarId = data.avatarId;
  }

  await updateDoc(childRef, updateData);
}

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

  const childRef = doc(db, "parents", parentUid, "children", childId);

  await updateDoc(childRef, {
    stars: child.stars + Math.max(0, rewards.stars ?? 0),
    gems: child.gems + Math.max(0, rewards.gems ?? 0),
    badges: nextBadges,
    updatedAt: serverTimestamp(),
  });
}

export async function deleteChild(
  parentUid: string,
  childId: string,
): Promise<void> {
  const childRef = doc(db, "parents", parentUid, "children", childId);
  await deleteDoc(childRef);
}
