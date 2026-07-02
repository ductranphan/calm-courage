/**
 * Child profile service (stub).
 *
 * Future: CRUD for child profiles under users/{uid}/children/{childId}.
 */
import {
  collection,
  doc,
  getDocs,
  serverTimestamp,
  setDoc,
} from "firebase/firestore";

import { db } from "@/config/firebase";

export type ChildProfile = {
  id: string;
  name: string;
  avatarId?: string;
  createdAt?: unknown;
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
  childId: string,
  data: Pick<ChildProfile, "name" | "avatarId">
) {
  await setDoc(doc(db, "users", parentUid, "children", childId), {
    ...data,
    createdAt: serverTimestamp(),
  });
}
