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
    badges: Array.isArray(data.badges) ? (data.badges as string[]) : [],
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
