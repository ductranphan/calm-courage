/**
 * Parent/child access state.
 *
 * This state is intentionally kept only in memory:
 * - a returning verified user must enter the parent PIN after reopening the app
 * - parent access remains available while the parent is using the app
 * - handing the device to the child immediately locks parent-only screens
 */

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from "react";

import { useAuth } from "@/contexts/AuthContext";

export type AppAccessMode = "locked" | "parent" | "child";

type ParentAccessContextValue = {
  accessMode: AppAccessMode;
  parentAccessGranted: boolean;
  childModeActive: boolean;
  unlockParentAccess: () => void;
  enterChildMode: () => void;
  lockAccess: () => void;
};

const ParentAccessContext =
  createContext<ParentAccessContextValue | null>(null);

export function ParentAccessProvider({
  children,
}: {
  children: ReactNode;
}) {
  const { user } = useAuth();

  const [accessMode, setAccessMode] =
    useState<AppAccessMode>("locked");

  /*
   * A different Firebase session must never inherit parent access
   * from the previous account.
   */
  useEffect(() => {
    setAccessMode("locked");
  }, [user?.uid]);

  const unlockParentAccess = useCallback(() => {
    setAccessMode("parent");
  }, []);

  const enterChildMode = useCallback(() => {
    setAccessMode("child");
  }, []);

  const lockAccess = useCallback(() => {
    setAccessMode("locked");
  }, []);

  const value = useMemo(
    () => ({
      accessMode,

      parentAccessGranted:
        accessMode === "parent",

      childModeActive:
        accessMode === "child",

      unlockParentAccess,
      enterChildMode,
      lockAccess,
    }),
    [
      accessMode,
      enterChildMode,
      lockAccess,
      unlockParentAccess,
    ],
  );

  return (
    <ParentAccessContext.Provider value={value}>
      {children}
    </ParentAccessContext.Provider>
  );
}

export function useParentAccess() {
  const context = useContext(ParentAccessContext);

  if (!context) {
    throw new Error(
      "useParentAccess must be used within a ParentAccessProvider.",
    );
  }

  return context;
}