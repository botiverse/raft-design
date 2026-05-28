import { create } from "zustand";
import api from "../api/client";
import { disconnectSocket, updateSocketAuthFromStorage } from "../api/socket";
import {
  shouldKeepSessionAfterLoadUserFailure,
  shouldLogoutAfterRefreshFailure,
  shouldLogoutAfterPostRefreshLoadUserFailure,
  shouldRetryLoadUserAfterError,
} from "../utils/authSessionPolicy";
import { refreshTokensWithDedupe } from "../utils/refreshCoordinator";
import { authTokenSync } from "../utils/authTokenSync";
import {
  deriveInitialAuthRestoreState,
  nextAuthRestoreState,
  nextAuthRestoreStateAfterExternalTokenSync,
  type AuthRestoreState,
} from "../utils/authRestoreMachine";
import { updateAuthRuntimeSnapshot } from "../utils/authSessionRuntime";
import { useAppearanceStore } from "./appearanceStore";

export interface User {
  id: string;
  email: string;
  gravatarHash: string;
  name: string;
  displayName: string | null;
  description: string | null;
  avatarUrl: string | null;
  emailVerified: boolean;
  preferredLanguage: string | null;
  preferredTimezone: string | null;
  autoTranslationEnabled: boolean;
  preferredTranslationDisplay: "translated" | "original";
  preferredTimeFormat: "12h" | "24h" | null;
  preferredMessageBodyFontSize: "sm" | "md" | "lg" | null;
  referralSource: string | null;
  referralSourceOther: string | null;
  referralSourceSkippedAt: string | null;
}

interface AuthState {
  user: User | null;
  accessToken: string | null;
  refreshToken: string | null;
  loading: boolean;
  initialized: boolean;
  restoreState: AuthRestoreState;

  login: (email: string, password: string) => Promise<void>;
  register: (email: string, password: string, name: string, legalAcceptance: { acceptTerms: boolean; termsVersion: string; privacyVersion: string; legalAcceptanceSource?: "signup" | "invite" }) => Promise<void>;
  logout: () => void;
  loadUser: () => Promise<void>;
  refreshAccessToken: () => Promise<boolean>;
  setTokens: (accessToken: string, refreshToken: string) => void;

  // Email verification
  verifyEmail: (token: string) => Promise<void>;
  resendVerification: () => Promise<void>;

  // Password reset
  forgotPassword: (email: string) => Promise<void>;
  resetPassword: (token: string, password: string) => Promise<void>;

  // Profile update
  updateProfile: (fields: {
    displayName?: string;
    description?: string | null;
    avatarUrl?: string | null;
    preferredLanguage?: string | null;
    preferredTimezone?: string | null;
    autoTranslationEnabled?: boolean;
    preferredTranslationDisplay?: "translated" | "original";
    preferredTimeFormat?: "12h" | "24h" | null;
    preferredMessageBodyFontSize?: "sm" | "md" | "lg" | null;
    referralSource?: string | null;
    referralSourceOther?: string | null;
    referralSourceSkipped?: boolean;
    currentPassword?: string;
    newPassword?: string;
  }) => Promise<void>;
  uploadAvatar: (file: File) => Promise<void>;

  // Invite
  acceptInvite: (token: string, agreementId?: string | null) => Promise<{ serverId: string; serverName: string }>;
}

function syncAppearancePreference(user: User | null | undefined) {
  useAppearanceStore.getState().hydrateMessageBodyFontSize(user?.preferredMessageBodyFontSize ?? null);
}

export const useAuthStore = create<AuthState>((set, get) => ({
  user: null,
  accessToken: localStorage.getItem("slock_access_token"),
  refreshToken: localStorage.getItem("slock_refresh_token"),
  loading: false,
  initialized: false,
  restoreState: deriveInitialAuthRestoreState(
    !!(localStorage.getItem("slock_access_token") && localStorage.getItem("slock_refresh_token")),
  ),

  login: async (email, password) => {
    set({ loading: true });
    try {
      const { data } = await api.post("/auth/login", { email, password });
      localStorage.setItem("slock_access_token", data.accessToken);
      localStorage.setItem("slock_refresh_token", data.refreshToken);
      syncAppearancePreference(data.user);
      set({
        user: data.user,
        accessToken: data.accessToken,
        refreshToken: data.refreshToken,
        loading: false,
        initialized: true,
        restoreState: nextAuthRestoreState(get().restoreState, { type: "LOGIN_SUCCEEDED" }),
      });
    } catch (err: any) {
      set({ loading: false });
      throw err;
    }
  },

  register: async (email, password, name, legalAcceptance) => {
    set({ loading: true });
    try {
      const { data } = await api.post("/auth/register", { email, password, name, ...legalAcceptance });
      localStorage.setItem("slock_access_token", data.accessToken);
      localStorage.setItem("slock_refresh_token", data.refreshToken);
      syncAppearancePreference(data.user);
      set({
        user: data.user,
        accessToken: data.accessToken,
        refreshToken: data.refreshToken,
        loading: false,
        initialized: true,
        restoreState: nextAuthRestoreState(get().restoreState, { type: "LOGIN_SUCCEEDED" }),
      });
    } catch (err: any) {
      set({ loading: false });
      throw err;
    }
  },

  logout: () => {
    const { refreshToken } = get();
    if (refreshToken) {
      api.post("/auth/logout", { refreshToken }).catch(() => {});
    }
    // Disconnect socket before clearing auth state
    disconnectSocket();
    localStorage.removeItem("slock_access_token");
    localStorage.removeItem("slock_refresh_token");
    syncAppearancePreference(null);
    set({
      user: null,
      accessToken: null,
      refreshToken: null,
      initialized: true,
      restoreState: nextAuthRestoreState(get().restoreState, { type: "LOGOUT" }),
    });
  },

  loadUser: async () => {
    const { accessToken } = get();
    if (!accessToken) {
      set({
        initialized: true,
        restoreState: nextAuthRestoreState(get().restoreState, {
          type: "BOOT",
          hasStoredSession: false,
        }),
      });
      return;
    }
    set({
      restoreState: nextAuthRestoreState(get().restoreState, { type: "RESTORE_STARTED" }),
    });
    try {
      const { data } = await api.get("/auth/me");
      syncAppearancePreference(data);
      set({
        user: data,
        initialized: true,
        restoreState: nextAuthRestoreState(get().restoreState, { type: "RESTORE_SUCCEEDED" }),
      });
    } catch (err: any) {
      const status = err?.response?.status as number | undefined;
      const hasStoredSession = !!(get().accessToken && get().refreshToken);
      // Non-auth failures should not force logout.
      if (shouldKeepSessionAfterLoadUserFailure(status)) {
        set({
          initialized: true,
          restoreState: nextAuthRestoreState(get().restoreState, {
            type: "RESTORE_TRANSIENT_FAILURE",
            hasStoredSession,
          }),
        });
        return;
      }

      // Token might be expired — try refresh.
      if (!shouldRetryLoadUserAfterError(status)) {
        set({
          initialized: true,
          restoreState: nextAuthRestoreState(get().restoreState, {
            type: "RESTORE_TRANSIENT_FAILURE",
            hasStoredSession,
          }),
        });
        return;
      }

      try {
        const refreshed = await get().refreshAccessToken();
        if (refreshed) {
          try {
            const { data } = await api.get("/auth/me");
            syncAppearancePreference(data);
            set({
              user: data,
              initialized: true,
              restoreState: nextAuthRestoreState(get().restoreState, { type: "RESTORE_SUCCEEDED" }),
            });
          } catch (meErr: any) {
            const meStatus = meErr?.response?.status as number | undefined;
            if (shouldLogoutAfterPostRefreshLoadUserFailure({
              status: meStatus,
              initialized: get().initialized,
              restoreState: get().restoreState,
            })) {
              get().logout();
            } else {
              set({
                initialized: true,
                restoreState: nextAuthRestoreState(get().restoreState, {
                  type: "RESTORE_TRANSIENT_FAILURE",
                  hasStoredSession: !!(get().accessToken && get().refreshToken),
                }),
              });
            }
          }
        } else {
          // /auth/refresh is authoritative for stored-session viability. If
          // it returns an auth failure, do not let the bootstrap retry loop
          // produce repeated /auth/me -> /auth/refresh 401s for 30s.
          get().logout();
        }
      } catch {
        // Transient refresh failure — keep session and let later calls retry.
        set({
          initialized: true,
          restoreState: nextAuthRestoreState(get().restoreState, {
            type: "RESTORE_TRANSIENT_FAILURE",
            hasStoredSession: !!(get().accessToken && get().refreshToken),
          }),
        });
      }
    }
  },

  refreshAccessToken: async () => {
    try {
      const tokens = await refreshTokensWithDedupe();
      set({
        accessToken: tokens.accessToken,
        refreshToken: tokens.refreshToken,
      });
      return true;
    } catch (err: any) {
      const status = err?.response?.status as number | undefined;
      if (shouldLogoutAfterRefreshFailure({
        status,
        hasRefreshToken: !!localStorage.getItem("slock_refresh_token"),
      })) {
        return false;
      }
      throw err;
    }
  },

  setTokens: (accessToken, refreshToken) => {
    localStorage.setItem("slock_access_token", accessToken);
    localStorage.setItem("slock_refresh_token", refreshToken);
    set({
      accessToken,
      refreshToken,
      restoreState: nextAuthRestoreState(get().restoreState, { type: "TOKENS_STORED" }),
    });
  },

  // ── Email Verification ──

  verifyEmail: async (token) => {
    await api.post("/auth/verify-email", { token });
    // Refresh user data to get updated emailVerified status
    const { data } = await api.get("/auth/me");
    syncAppearancePreference(data);
    set({ user: data });
  },

  resendVerification: async () => {
    await api.post("/auth/resend-verification");
  },

  // ── Password Reset ──

  forgotPassword: async (email) => {
    await api.post("/auth/forgot-password", { email });
  },

  resetPassword: async (token, password) => {
    await api.post("/auth/reset-password", { token, password });
  },

  // ── Profile Update ──

  updateProfile: async (fields) => {
    const { data } = await api.patch("/auth/me", fields);
    syncAppearancePreference(data);
    set({ user: data });
  },

  uploadAvatar: async (file) => {
    const formData = new FormData();
    formData.append("avatar", file);
    const { data } = await api.post("/auth/me/avatar", formData, {
      headers: { "Content-Type": "multipart/form-data" },
    });
    syncAppearancePreference(data);
    set({ user: data });
  },

  // ── Invite ──

  acceptInvite: async (token, agreementId) => {
    const { data } = await api.post("/auth/accept-invite", { token, agreementId });
    return data;
  },
}));

authTokenSync.subscribe((tokens) => {
  useAuthStore.setState((state) => {
    if (
      state.accessToken === tokens.accessToken
      && state.refreshToken === tokens.refreshToken
    ) {
      return state;
    }
    localStorage.setItem("slock_access_token", tokens.accessToken);
    localStorage.setItem("slock_refresh_token", tokens.refreshToken);
    updateSocketAuthFromStorage();
    return {
      ...state,
      accessToken: tokens.accessToken,
      refreshToken: tokens.refreshToken,
      restoreState: nextAuthRestoreStateAfterExternalTokenSync(state.restoreState),
    };
  });
});

updateAuthRuntimeSnapshot({
  initialized: useAuthStore.getState().initialized,
  restoreState: useAuthStore.getState().restoreState,
});

useAuthStore.subscribe((state) => {
  updateAuthRuntimeSnapshot({
    initialized: state.initialized,
    restoreState: state.restoreState,
  });
});
