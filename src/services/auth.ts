/**
 * Authentication service.
 *
 * Wraps Firebase Auth and creates a parent profile in Firestore on sign-up.
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

async function createUserProfile(user: User, pinHash: string) {
  await setDoc(doc(db, "users", user.uid), {
    email: user.email ?? "",
    pinHash,
    createdAt: serverTimestamp(),
    onboardingComplete: false,
    termsAccepted: false,
  });
}

export async function getUserProfile(userId: string) {
  const snapshot = await getDoc(doc(db, "users", userId));
  return snapshot.exists() ? snapshot.data() : null;
}

export async function acceptTerms(userId: string) {
  try {
    await updateDoc(doc(db, "users", userId), {
      termsAccepted: true,
      termsAcceptedAt: serverTimestamp(),
    });
  } catch (error) {
    throw new Error(getErrorMessage(error));
  }
}

export async function completeOnboarding(userId: string) {
  try {
    await updateDoc(doc(db, "users", userId), {
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
    await createUserProfile(credential.user, pinHash);
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
