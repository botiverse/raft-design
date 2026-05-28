import axios from "axios";
import { useServerStore } from "../store/serverStore";
import {
  isMissingRefreshTokenError,
} from "../utils/authErrors";
import { getProtectedRequestAuthFailureAction } from "../utils/protectedRequestAuthPolicy";
import { refreshTokensWithDedupe } from "../utils/refreshCoordinator";
import { getAuthRuntimeSnapshot } from "../utils/authSessionRuntime";

const VITE_API_URL = typeof import.meta.env?.VITE_API_URL === "string"
  ? import.meta.env.VITE_API_URL
  : "";

const API_BASE = VITE_API_URL
  ? `${VITE_API_URL}/api`
  : "/api";

const api = axios.create({
  baseURL: API_BASE,
});

// Request interceptor — attach token and server ID
api.interceptors.request.use((config) => {
  const token = localStorage.getItem("slock_access_token");
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }

  const serverId = useServerStore.getState().current?.id;
  if (serverId) {
    config.headers["X-Server-Id"] = serverId;
  }

  return config;
});

function clearAuthAndRedirect() {
  localStorage.removeItem("slock_access_token");
  localStorage.removeItem("slock_refresh_token");
  window.location.href = "/";
}

// Response interceptor — handle 401 with deduplicated token refresh
api.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config;

    // Don't retry auth endpoints or already-retried requests
    if (
      error.response?.status === 401 &&
      !originalRequest._retry &&
      !originalRequest.url?.includes("/auth/")
    ) {
      originalRequest._retry = true;

      try {
        const { accessToken: newToken } = await refreshTokensWithDedupe();

        originalRequest.headers.Authorization = `Bearer ${newToken}`;
        return api(originalRequest);
      } catch (refreshError: any) {
        const status = refreshError?.response?.status as number | undefined;
        const noRefreshToken = isMissingRefreshTokenError(refreshError);
        const action = getProtectedRequestAuthFailureAction({
          status,
          hasRefreshToken: !noRefreshToken,
          ...getAuthRuntimeSnapshot(),
        });
        if (action === "logout") {
          clearAuthAndRedirect();
          return;
        }

        return Promise.reject(refreshError);
      }
    }

    return Promise.reject(error);
  }
);

export default api;
