/**
 * Authentication service.
 *
 * Wraps Firebase Auth and creates a parent profile in Firestore on sign-up.
 * Parent docs live at parents/{parentUid} (same ID as Auth uid).
 */
import {
  createUserWithEmailAndPassword,
  onAuthStateChanged,
  sendEmailVerification,
  sendPasswordResetEmail,
  signInWithEmailAndPassword,
  signOut,
  type User,
} from "firebase/auth";
import { doc, getDoc, serverTimestamp, setDoc, updateDoc } from "firebase/firestore";

import { auth, db } from "@/config/firebase";
import { hashPin } from "@/utils/pin";

export type ParentSubscription = "trial" | "monthly" | "yearly";

export type ParentProfile = {
  email: string;
  displayName: string | null;
  pinHash: string;
  subscription: ParentSubscription;
  createdAt?: unknown;
  termsAccepted: boolean;
  termsAcceptedAt?: unknown;
  onboardingComplete: boolean;
  onboardingCompletedAt?: unknown;
};

export function mapAuthError(code: string): string {
  switch (code) {
    case "auth/invalid-email":
      return "Please enter a valid email address.";
    case "auth/user-disabled":
      return "This account has been disabled.";
    case "auth/user-not-found":
    case "auth/wrong-password":
    case "auth/invalid-credential":
      return "Invalid email or password.";
    case "auth/email-already-in-use":
      return "An account with this email already exists.";
    case "auth/weak-password":
      return "Password must be at least 6 characters.";
    case "auth/too-many-requests":
      return "Too many attempts. Please try again later.";
    case "auth/network-request-failed":
      return "Network error. Check your connection and try again.";
    default:
      return "Something went wrong. Please try again.";
  }
}

function getErrorMessage(error: unknown): string {
  if (
    typeof error === "object" &&
    error !== null &&
    "code" in error &&
    typeof error.code === "string"
  ) {
    return mapAuthError(error.code);
  }

  return "Something went wrong. Please try again.";
}

function parentDoc(parentUid: string) {
  return doc(db, "parents", parentUid);
}

async function createParentProfile(user: User, pinHash: string) {
  const profile: ParentProfile = {
    email: user.email ?? "",
    displayName: null,
    pinHash,
    subscription: "trial",
    termsAccepted: false,
    onboardingComplete: false,
  };

  await setDoc(parentDoc(user.uid), {
    ...profile,
    createdAt: serverTimestamp(),
    termsAcceptedAt: null,
  });
}

export async function getParentProfile(
  parentUid: string
): Promise<ParentProfile | null> {
  const snapshot = await getDoc(parentDoc(parentUid));
  return snapshot.exists() ? (snapshot.data() as ParentProfile) : null;
}

/** @deprecated Prefer getParentProfile — kept as an alias for existing imports. */
export async function getUserProfile(parentUid: string) {
  return getParentProfile(parentUid);
}

export async function acceptTerms(parentUid: string) {
  try {
    await updateDoc(parentDoc(parentUid), {
      termsAccepted: true,
      termsAcceptedAt: serverTimestamp(),
    });
  } catch (error) {
    throw new Error(getErrorMessage(error));
  }
}

export async function completeOnboarding(parentUid: string) {
  try {
    await updateDoc(parentDoc(parentUid), {
      onboardingComplete: true,
      onboardingCompletedAt: serverTimestamp(),
    });
  } catch (error) {
    throw new Error(getErrorMessage(error));
  }
}

export async function signUp(email: string, password: string, pin: string) {
  try {
    const pinHash = await hashPin(pin);
    const credential = await createUserWithEmailAndPassword(
      auth,
      email.trim(),
      password
    );
    await createParentProfile(credential.user, pinHash);
    return credential.user;
  } catch (error) {
    throw new Error(getErrorMessage(error));
  }
}

export async function signIn(email: string, password: string) {
  try {
    const credential = await signInWithEmailAndPassword(
      auth,
      email.trim(),
      password
    );
    return credential.user;
  } catch (error) {
    throw new Error(getErrorMessage(error));
  }
}

export async function signOutUser() {
  try {
    await signOut(auth);
  } catch (error) {
    throw new Error(getErrorMessage(error));
  }
}

export async function resetPassword(email: string) {
  try {
    await sendPasswordResetEmail(auth, email.trim());
  } catch (error) {
    throw new Error(getErrorMessage(error));
  }
}

export async function sendVerificationEmail() {
  const user = auth.currentUser;
  if (!user) {
    throw new Error("No signed-in user found.");
  }

  try {
    await sendEmailVerification(user);
  } catch (error) {
    throw new Error(getErrorMessage(error));
  }
}

export async function reloadCurrentUser() {
  const user = auth.currentUser;
  if (!user) {
    throw new Error("No signed-in user found.");
  }

  try {
    await user.reload();
    return auth.currentUser;
  } catch (error) {
    throw new Error(getErrorMessage(error));
  }
}

export function subscribeToAuthChanges(callback: (user: User | null) => void) {
  return onAuthStateChanged(auth, callback);
}
