import { getAuthVerdict } from "./authVerdict";
import type { AuthRestoreState } from "./authRestoreMachine";

export type ProtectedRequestAuthFailureAction =
  | "keep-session"
  | "defer-to-auth-restore"
  | "logout";

export function getProtectedRequestAuthFailureAction(params: {
  status: number | undefined;
  hasRefreshToken: boolean;
  initialized: boolean;
  restoreState: AuthRestoreState;
}): ProtectedRequestAuthFailureAction {
  const verdict = getAuthVerdict({
    signal: {
      type: "refresh_failed",
      status: params.status,
      hasRefreshToken: params.hasRefreshToken,
    },
    initialized: params.initialized,
    restoreState: params.restoreState,
  });

  if (verdict === "keep-session") {
    return "keep-session";
  }
  if (verdict === "defer-to-auth-restore") {
    return "defer-to-auth-restore";
  }
  return "logout";
}
