/**
 * Parses Firebase Auth / app deep links for password-reset oob codes.
 */

import * as Linking from "expo-linking";

export type AuthActionLink = {
  mode: string | null;
  oobCode: string | null;
};

export function parseAuthActionLink(
  url: string | null | undefined,
): AuthActionLink {
  if (!url) {
    return { mode: null, oobCode: null };
  }

  try {
    const parsed = Linking.parse(url);
    const query = parsed.queryParams ?? {};

    const modeRaw = query.mode;
    const codeRaw = query.oobCode ?? query.oobcode;

    const mode =
      typeof modeRaw === "string"
        ? modeRaw
        : Array.isArray(modeRaw)
          ? modeRaw[0] ?? null
          : null;

    const oobCode =
      typeof codeRaw === "string"
        ? codeRaw
        : Array.isArray(codeRaw)
          ? codeRaw[0] ?? null
          : null;

    return {
      mode: mode?.trim() || null,
      oobCode: oobCode?.trim() || null,
    };
  } catch {
    return { mode: null, oobCode: null };
  }
}
