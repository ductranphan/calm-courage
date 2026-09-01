/**
 * Redirects unauthenticated users who have not completed the COPPA
 * adult age gate away from account entry screens.
 */

import { Redirect, type Href } from "expo-router";
import {
  useEffect,
  useState,
  type ReactNode,
} from "react";

import LoadingScreen from "@/components/ui/LoadingScreen";
import { getAgeGateRecord } from "@/utils/ageGate";

type Props = {
  children: ReactNode;
};

export default function RequireAdultAgeGate({
  children,
}: Props) {
  const [ready, setReady] = useState(false);
  const [allowed, setAllowed] = useState(false);

  useEffect(() => {
    let cancelled = false;

    async function check() {
      const record = await getAgeGateRecord();

      if (!cancelled) {
        setAllowed(record?.status === "allowed");
        setReady(true);
      }
    }

    void check();

    return () => {
      cancelled = true;
    };
  }, []);

  if (!ready) {
    return <LoadingScreen />;
  }

  if (!allowed) {
    return <Redirect href={"/age-gate" as Href} />;
  }

  return <>{children}</>;
}
