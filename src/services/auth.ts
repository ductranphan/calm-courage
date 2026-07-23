/**
 * Authentication service.
 *
 * Wraps Firebase Authentication and stores the parent profile under:
 *
 * parents/{firebaseAuthUid}
 *
 * This path matches the current Firestore security rules.
 */

import {
  createUserWithEmailAndPassword,
  deleteUser,
  onAuthStateChanged,
  sendEmailVerification,
  sendPasswordResetEmail,
  signInWithEmailAndPassword,
  signOut,
  type User,
} from "firebase/auth";
import {
  doc,
  getDoc,
  serverTimestamp,
  setDoc,
  updateDoc,
} from "firebase/firestore";

import { auth, db } from "@/config/firebase";
import { hashPin } from "@/utils/pin";

const PARENT_COLLECTION = "parents";

export type UserProfile = {
  email: string;
  pinHash: string;
  createdAt?: unknown;
  onboardingComplete: boolean;
  onboardingCompletedAt?: unknown;
  termsAccepted: boolean;
  termsAcceptedAt?: unknown;
};

/**
 * Converts Firebase error codes into messages that can be shown
 * directly inside the application.
 */
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

    case "permission-denied":
    case "firestore/permission-denied":
      return "Your account was created, but the parent profile could not be saved.";

    case "unavailable":
    case "firestore/unavailable":
      return "Firebase is temporarily unavailable. Please try again.";

    case "auth/requires-recent-login":
      return "Please sign in again and retry this action.";

    default:
      return "Something went wrong. Please try again.";
  }
}

function getErrorCode(error: unknown): string | null {
  if (
    typeof error === "object" &&
    error !== null &&
    "code" in error &&
    typeof error.code === "string"
  ) {
    return error.code;
  }

  return null;
}

function getErrorMessage(error: unknown): string {
  const code = getErrorCode(error);

  if (code) {
    return mapAuthError(code);
  }

  if (error instanceof Error && error.message) {
    return error.message;
  }

  return "Something went wrong. Please try again.";
}

/**
 * Returns the signed-in parent's Firestore document.
 *
 * Firestore path:
 * parents/{userId}
 */
function parentDocument(userId: string) {
  return doc(db, PARENT_COLLECTION, userId);
}

/**
 * Creates the Firestore parent profile after Firebase Authentication
 * successfully creates the user.
 *
 * The document ID must be exactly the Firebase Authentication UID
 * because the Firestore rules compare parentId with request.auth.uid.
 */
async function createParentProfile(
  user: User,
  pinHash: string,
): Promise<void> {
  await setDoc(parentDocument(user.uid), {
    email: user.email ?? "",
    pinHash,
    createdAt: serverTimestamp(),

    onboardingComplete: false,

    /*
     * The sign-up screen requires the checkbox before account creation,
     * so the accepted terms can be stored immediately.
     */
    termsAccepted: true,
    termsAcceptedAt: serverTimestamp(),
  });
}

export async function getUserProfile(
  userId: string,
): Promise<UserProfile | null> {
  try {
    const snapshot = await getDoc(parentDocument(userId));

    if (!snapshot.exists()) {
      return null;
    }

    const data = snapshot.data();

    return {
      email: typeof data.email === "string" ? data.email : "",
      pinHash: typeof data.pinHash === "string" ? data.pinHash : "",
      createdAt: data.createdAt,

      onboardingComplete:
        data.onboardingComplete === true,

      onboardingCompletedAt:
        data.onboardingCompletedAt,

      termsAccepted:
        data.termsAccepted === true,

      termsAcceptedAt:
        data.termsAcceptedAt,
    };
  } catch (error) {
    throw new Error(getErrorMessage(error));
  }
}

/**
 * Verifies the parent PIN.
 *
 * The entered PIN is hashed and compared with the pinHash stored at:
 *
 * parents/{userId}
 */
export async function verifyParentPin(
  userId: string,
  pin: string,
): Promise<boolean> {
  const currentUser = auth.currentUser;

  if (!currentUser) {
    throw new Error("You must be signed in to verify your PIN.");
  }

  /*
   * Prevent attempting to read another parent's profile.
   * This also matches the Firestore security rules.
   */
  if (currentUser.uid !== userId) {
    throw new Error(
      "You do not have permission to access this parent profile.",
    );
  }

  const profile = await getUserProfile(userId);

  if (!profile) {
    throw new Error(
      "Your parent profile could not be found. Please sign out and create the account again.",
    );
  }

  if (!profile.pinHash) {
    throw new Error(
      "No parent PIN is configured for this account.",
    );
  }

  const enteredPinHash = await hashPin(pin);

  return enteredPinHash === profile.pinHash;
}

export async function acceptTerms(
  userId: string,
): Promise<void> {
  try {
    await updateDoc(parentDocument(userId), {
      termsAccepted: true,
      termsAcceptedAt: serverTimestamp(),
    });
  } catch (error) {
    throw new Error(getErrorMessage(error));
  }
}

export async function completeOnboarding(
  userId: string,
): Promise<void> {
  try {
    await updateDoc(parentDocument(userId), {
      onboardingComplete: true,
      onboardingCompletedAt: serverTimestamp(),
    });
  } catch (error) {
    throw new Error(getErrorMessage(error));
  }
}

/** Alias used by AuthContext; same behavior as verifyParentPin. */
export const verifyPin = verifyParentPin;

/**
 * Creates the Firebase Authentication account and then creates the
 * corresponding parent profile in Firestore.
 */
export async function signUp(
  email: string,
  password: string,
  pin: string,
): Promise<User> {
  let createdUser: User | null = null;

  try {
    const normalizedEmail = email
      .trim()
      .toLowerCase();

    const pinHash = await hashPin(pin);

    const credential =
      await createUserWithEmailAndPassword(
        auth,
        normalizedEmail,
        password,
      );

    createdUser = credential.user;

    /*
     * Firebase Authentication automatically signs in the new user.
     * Therefore request.auth.uid is available when this write runs.
     */
    await createParentProfile(
      credential.user,
      pinHash,
    );

    return credential.user;
  } catch (error) {
    /*
     * Firebase Authentication and Firestore are separate operations.
     *
     * If Authentication succeeds but the Firestore parent document
     * cannot be created, remove the incomplete Authentication account
     * so the same email can be used again.
     */
    if (createdUser) {
      try {
        await deleteUser(createdUser);
      } catch (cleanupError) {
        console.error(
          "Unable to remove incomplete Firebase account:",
          cleanupError,
        );
      }
    }

    throw new Error(getErrorMessage(error));
  }
}

export async function signIn(
  email: string,
  password: string,
): Promise<User> {
  try {
    const normalizedEmail = email
      .trim()
      .toLowerCase();

    const credential =
      await signInWithEmailAndPassword(
        auth,
        normalizedEmail,
        password,
      );

    return credential.user;
  } catch (error) {
    throw new Error(getErrorMessage(error));
  }
}

export async function signOutUser(): Promise<void> {
  try {
    await signOut(auth);
  } catch (error) {
    throw new Error(getErrorMessage(error));
  }
}

export async function resetPassword(
  email: string,
): Promise<void> {
  try {
    const normalizedEmail = email
      .trim()
      .toLowerCase();

    await sendPasswordResetEmail(
      auth,
      normalizedEmail,
    );
  } catch (error) {
    throw new Error(getErrorMessage(error));
  }
}

export async function sendVerificationEmail(): Promise<void> {
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

export async function reloadCurrentUser(): Promise<User | null> {
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

export function subscribeToAuthChanges(
  callback: (user: User | null) => void,
) {
  return onAuthStateChanged(auth, callback);
}