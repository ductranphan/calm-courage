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

export async function listChildren(parentUid: string): Promise<ChildProfile[]> {
  const snapshot = await getDocs(
    collection(db, "parents", parentUid, "children"),
  );

  return snapshot.docs.map((childDoc) => ({
    id: childDoc.id,
    ...(childDoc.data() as Omit<ChildProfile, "id">),
  }));
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

  return {
    id: snapshot.id,
    ...(snapshot.data() as Omit<ChildProfile, "id">),
  };
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

export async function deleteChild(
  parentUid: string,
  childId: string,
): Promise<void> {
  const childRef = doc(db, "parents", parentUid, "children", childId);
  await deleteDoc(childRef);
}