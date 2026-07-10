/**
 * Child profile service.
 *
 * CRUD for child profiles under users/{uid}/children/{childId}.
 */
import {
  collection,
  doc,
  getDocs,
  serverTimestamp,
  setDoc,
} from "firebase/firestore";

import { db } from "@/config/firebase";
import type { AvatarId } from "@/constants/avatars";

export type ChildProfile = {
  id: string;
  name: string;
  age: number;
  avatarId: AvatarId;
  createdAt?: unknown;
};

export type CreateChildInput = {
  name: string;
  age: number;
  avatarId: AvatarId;
};

export async function listChildren(parentUid: string): Promise<ChildProfile[]> {
  const snapshot = await getDocs(
    collection(db, "users", parentUid, "children")
  );

  return snapshot.docs.map((childDoc) => ({
    id: childDoc.id,
    ...(childDoc.data() as Omit<ChildProfile, "id">),
  }));
}

export async function createChild(
  parentUid: string,
  data: CreateChildInput
): Promise<string> {
  const childRef = doc(collection(db, "users", parentUid, "children"));

  await setDoc(childRef, {
    name: data.name.trim(),
    age: data.age,
    avatarId: data.avatarId,
    createdAt: serverTimestamp(),
  });

  return childRef.id;
}
