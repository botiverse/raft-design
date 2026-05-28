import type { AuthRestoreState } from "./authRestoreMachine";
import { getAuthVerdict } from "./authVerdict";

export function shouldRetryLoadUserAfterError(status: number | undefined): boolean {
  return status === 401 || status === 403;
}

export function shouldKeepSessionAfterLoadUserFailure(status: number | undefined): boolean {
  return status !== 401 && status !== 403;
}

export function shouldLogoutAfterRefreshFailure(params: {
  status: number | undefined;
  hasRefreshToken: boolean;
}): boolean {
  return getAuthVerdict({
    signal: {
      type: "refresh_failed",
      status: params.status,
      hasRefreshToken: params.hasRefreshToken,
    },
    initialized: true,
    restoreState: "authenticated",
  }) === "logout";
}

export function shouldLogoutAfterPostRefreshLoadUserFailure(params: {
  status: number | undefined;
  initialized: boolean;
  restoreState: AuthRestoreState;
}): boolean {
  return getAuthVerdict({
    signal: { type: "post_refresh_me_failed", status: params.status },
    initialized: params.initialized,
    restoreState: params.restoreState,
  }) === "logout";
}
