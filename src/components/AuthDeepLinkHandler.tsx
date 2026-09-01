/**
 * Listens for Firebase Auth / app deep links and routes password-reset
 * flows to /reset-password with the oobCode query param.
 */

import * as Linking from "expo-linking";
import { useRouter } from "expo-router";
import { useEffect } from "react";

import { parseAuthActionLink } from "@/utils/authActionLinks";

export default function AuthDeepLinkHandler() {
  const router = useRouter();

  useEffect(() => {
    function handleUrl(url: string | null | undefined) {
      const { mode, oobCode } = parseAuthActionLink(url);

      if (!oobCode) {
        return;
      }

      const normalizedMode = (mode ?? "").toLowerCase();

      if (
        normalizedMode &&
        normalizedMode !== "resetpassword" &&
        normalizedMode !== "reset_password"
      ) {
        return;
      }

      router.push({
        pathname: "/reset-password",
        params: {
          oobCode,
          mode: mode ?? "resetPassword",
        },
      });
    }

    void Linking.getInitialURL().then(handleUrl);

    const subscription = Linking.addEventListener(
      "url",
      ({ url }) => {
        handleUrl(url);
      },
    );

    return () => {
      subscription.remove();
    };
  }, [router]);

  return null;
}
