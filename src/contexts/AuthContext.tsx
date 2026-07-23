/**
 * Auth context provider.
 *
 * Tracks the current Firebase user and exposes auth actions to the app.
 */
import {
  createContext,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from "react";
import type { User } from "firebase/auth";

import {
  acceptTerms,
  completeOnboarding,
  reloadCurrentUser,
  resetPassword,
  sendVerificationEmail,
  signIn,
  signOutUser,
  signUp,
  subscribeToAuthChanges,
  verifyPin,
} from "@/services/auth";

type AuthContextValue = {
  user: User | null;
  loading: boolean;
  signIn: typeof signIn;
  signUp: typeof signUp;
  signOut: typeof signOutUser;
  resetPassword: typeof resetPassword;
  sendVerificationEmail: typeof sendVerificationEmail;
  reloadUser: typeof reloadCurrentUser;
  acceptTerms: typeof acceptTerms;
  completeOnboarding: typeof completeOnboarding;
  verifyPin: typeof verifyPin;
};

const AuthContext = createContext<AuthContextValue | null>(null);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const unsubscribe = subscribeToAuthChanges((nextUser) => {
      setUser(nextUser);
      setLoading(false);
    });

    return unsubscribe;
  }, []);

  async function reloadUser() {
    const refreshedUser = await reloadCurrentUser();
    setUser(refreshedUser);
    return refreshedUser;
  }

  const value = useMemo(
    () => ({
      user,
      loading,
      signIn,
      signUp,
      signOut: signOutUser,
      resetPassword,
      sendVerificationEmail,
      reloadUser,
      acceptTerms,
      completeOnboarding,
      verifyPin,
    }),
    [user, loading]
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth must be used within an AuthProvider.");
  }

  return context;
}
