import axios from "axios";
import {
  isAuthErrorStatus,
  MissingRefreshTokenError,
} from "./authErrors";
import { authTokenSync } from "./authTokenSync";

const VITE_API_URL = typeof import.meta.env?.VITE_API_URL === "string"
  ? import.meta.env.VITE_API_URL
  : "";

const API_BASE = VITE_API_URL
  ? `${VITE_API_URL}/api`
  : "/api";

const REFRESH_RETRY_DELAYS_MS = [250, 750];
// Allows a small chain of tabs to recover from single-use refresh-token
// rotation races without turning real revocation into an endless retry loop.
const ROTATED_REFRESH_TOKEN_RETRY_LIMIT = 3;

export type RefreshTokens = {
  accessToken: string;
  refreshToken: string;
};

export function createRefreshCoordinator(params: {
  readRefreshToken: () => string | null;
  writeTokens: (tokens: RefreshTokens) => void;
  requestRefresh: (refreshToken: string) => Promise<RefreshTokens>;
  onTokensRefreshed?: (tokens: RefreshTokens) => void;
}) {
  let refreshPromise: Promise<RefreshTokens> | null = null;

  async function sleep(ms: number): Promise<void> {
    return new Promise((resolve) => setTimeout(resolve, ms));
  }

  async function runRefresh(): Promise<RefreshTokens> {
    let refreshToken = params.readRefreshToken();
    if (!refreshToken) throw new MissingRefreshTokenError();
    let rotatedTokenRetries = 0;

    while (true) {
      for (let attempt = 0; attempt <= REFRESH_RETRY_DELAYS_MS.length; attempt += 1) {
        try {
          const tokens = await params.requestRefresh(refreshToken);
          params.writeTokens(tokens);
          params.onTokensRefreshed?.(tokens);
          return tokens;
        } catch (error: any) {
          const status = error?.response?.status as number | undefined;
          if (isAuthErrorStatus(status)) {
            const latestRefreshToken = params.readRefreshToken();
            if (
              latestRefreshToken
              && latestRefreshToken !== refreshToken
              && rotatedTokenRetries < ROTATED_REFRESH_TOKEN_RETRY_LIMIT
            ) {
              refreshToken = latestRefreshToken;
              rotatedTokenRetries += 1;
              break;
            }

            if (
              latestRefreshToken === refreshToken
              && rotatedTokenRetries < ROTATED_REFRESH_TOKEN_RETRY_LIMIT
            ) {
              await sleep(REFRESH_RETRY_DELAYS_MS[0]);
              const delayedRefreshToken = params.readRefreshToken();
              if (delayedRefreshToken && delayedRefreshToken !== refreshToken) {
                refreshToken = delayedRefreshToken;
                rotatedTokenRetries += 1;
                break;
              }
            }

            throw error;
          }

          // Retries intentionally reuse the same refresh token. This relies on
          // the server only revoking the old token after a successful rotation.
          if (attempt < REFRESH_RETRY_DELAYS_MS.length) {
            await sleep(REFRESH_RETRY_DELAYS_MS[attempt]);
            continue;
          }

          throw error;
        }
      }
    }
  }

  return {
    async refresh(): Promise<RefreshTokens> {
      if (!refreshPromise) {
        refreshPromise = runRefresh().finally(() => {
          refreshPromise = null;
        });
      }
      return refreshPromise;
    },
  };
}

const browserRefreshCoordinator = createRefreshCoordinator({
  readRefreshToken: () => localStorage.getItem("slock_refresh_token"),
  writeTokens: (tokens) => {
    localStorage.setItem("slock_access_token", tokens.accessToken);
    localStorage.setItem("slock_refresh_token", tokens.refreshToken);
  },
  onTokensRefreshed: (tokens) => {
    authTokenSync.publish(tokens);
  },
  requestRefresh: async (refreshToken) => {
    const { data } = await axios.post(`${API_BASE}/auth/refresh`, { refreshToken });
    return {
      accessToken: data.accessToken,
      refreshToken: data.refreshToken,
    };
  },
});

export function refreshTokensWithDedupe(): Promise<RefreshTokens> {
  return browserRefreshCoordinator.refresh();
}
