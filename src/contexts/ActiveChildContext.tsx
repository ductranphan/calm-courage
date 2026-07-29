/**
 * Active child session state.
 *
 * Keeps track of the exact child selected by the parent before the device
 * is handed over. The state is intentionally stored only in memory and is
 * cleared whenever the authenticated Firebase account changes.
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

import type { AvatarId } from "@/constants/avatars";
import { useAuth } from "@/contexts/AuthContext";

export type ActiveChild = {
  id: string;
  name: string;
  avatarId: AvatarId;
};

type ActiveChildContextValue = {
  activeChild: ActiveChild | null;
  selectActiveChild: (child: ActiveChild) => void;
  clearActiveChild: () => void;
};

const ActiveChildContext =
  createContext<ActiveChildContextValue | null>(null);

export function ActiveChildProvider({
  children,
}: {
  children: ReactNode;
}) {
  const { user } = useAuth();
  const [activeChild, setActiveChild] =
    useState<ActiveChild | null>(null);

  /*
   * A different Firebase account must never inherit the child selected
   * by the previous account.
   */
  useEffect(() => {
    setActiveChild(null);
  }, [user?.uid]);

  const selectActiveChild = useCallback(
    (child: ActiveChild) => {
      setActiveChild(child);
    },
    [],
  );

  const clearActiveChild = useCallback(() => {
    setActiveChild(null);
  }, []);

  const value = useMemo(
    () => ({
      activeChild,
      selectActiveChild,
      clearActiveChild,
    }),
    [
      activeChild,
      clearActiveChild,
      selectActiveChild,
    ],
  );

  return (
    <ActiveChildContext.Provider value={value}>
      {children}
    </ActiveChildContext.Provider>
  );
}

export function useActiveChild() {
  const context = useContext(ActiveChildContext);

  if (!context) {
    throw new Error(
      "useActiveChild must be used within an ActiveChildProvider.",
    );
  }

  return context;
}