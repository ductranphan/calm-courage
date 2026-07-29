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
  runTransaction,
  serverTimestamp,
  updateDoc,
} from "firebase/firestore";

import { db } from "@/config/firebase";
import type { AvatarId } from "@/constants/avatars";

export type ChildProfile = {
  id: string;
  name: string;
  age: number;
  avatarId: AvatarId;
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

function timestampToMilliseconds(value: unknown): number | null {
  if (!value || typeof value !== "object") {
    return null;
  }

  if (
    "toMillis" in value &&
    typeof (value as { toMillis?: unknown }).toMillis === "function"
  ) {
    return (value as { toMillis: () => number }).toMillis();
  }

  if (
    "seconds" in value &&
    typeof (value as { seconds?: unknown }).seconds === "number"
  ) {
    return (value as { seconds: number }).seconds * 1000;
  }

  return null;
}

/**
 * Returns every child in a stable order.
 *
 * Firestore does not guarantee document order unless a query specifies one.
 * Sorting locally keeps older test documents that may be missing createdAt,
 * while still showing normally-created profiles from oldest to newest.
 */
export async function listChildren(
  parentUid: string,
): Promise<ChildProfile[]> {
  const snapshot = await getDocs(
    collection(db, "parents", parentUid, "children"),
  );

  const children = snapshot.docs.map((childDoc) => ({
    id: childDoc.id,
    ...(childDoc.data() as Omit<ChildProfile, "id">),
  }));

  return children.sort((firstChild, secondChild) => {
    const firstCreatedAt = timestampToMilliseconds(firstChild.createdAt);
    const secondCreatedAt = timestampToMilliseconds(secondChild.createdAt);

    if (firstCreatedAt !== null && secondCreatedAt !== null) {
      return firstCreatedAt - secondCreatedAt;
    }

    if (firstCreatedAt !== null) {
      return -1;
    }

    if (secondCreatedAt !== null) {
      return 1;
    }

    return firstChild.id.localeCompare(secondChild.id);
  });
}

export async function getChild(
  parentUid: string,
  childId: string,
): Promise<ChildProfile | null> {
  const childRef = doc(
    db,
    "parents",
    parentUid,
    "children",
    childId,
  );

  const snapshot = await getDoc(childRef);

  if (!snapshot.exists()) {
    return null;
  }

  return {
    id: snapshot.id,
    ...(snapshot.data() as Omit<ChildProfile, "id">),
  };
}

export async function createChild(
  parentUid: string,
  data: CreateChildInput,
): Promise<string> {
  const parentRef = doc(db, "parents", parentUid);
  const childRef = doc(collection(parentRef, "children"));

  /*
   * Create the first child and complete onboarding atomically.
   * This prevents a child profile from being created while the parent
   * document incorrectly remains onboardingComplete: false.
   */
  await runTransaction(db, async (transaction) => {
    const parentSnapshot = await transaction.get(parentRef);

    if (!parentSnapshot.exists()) {
      throw new Error("Parent profile not found.");
    }

    transaction.set(childRef, {
      name: data.name.trim(),
      age: data.age,
      avatarId: data.avatarId,
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp(),
    });

    if (parentSnapshot.data().onboardingComplete !== true) {
      transaction.update(parentRef, {
        onboardingComplete: true,
        onboardingCompletedAt: serverTimestamp(),
      });
    }
  });

  return childRef.id;
}

export async function updateChild(
  parentUid: string,
  childId: string,
  data: UpdateChildInput,
): Promise<void> {
  const childRef = doc(
    db,
    "parents",
    parentUid,
    "children",
    childId,
  );

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

export async function deleteChild(
  parentUid: string,
  childId: string,
): Promise<void> {
  const childRef = doc(
    db,
    "parents",
    parentUid,
    "children",
    childId,
  );

  await deleteDoc(childRef);
}