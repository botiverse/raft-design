import type { SocialAuthProviderId } from "../hooks/useAuthProviders";

export const PENDING_INVITE_STORAGE_KEY = "slock_pending_invite";

function getApiBaseUrl(): string {
  const apiUrl = typeof import.meta.env?.VITE_API_URL === "string"
    ? import.meta.env.VITE_API_URL
    : "";
  return apiUrl ? `${apiUrl.replace(/\/$/, "")}/api` : "/api";
}

export function sanitizeReturnTo(value: string | null | undefined): string {
  if (!value || !value.startsWith("/") || value.startsWith("//")) return "/";
  return value;
}

export function getCurrentReturnTo(): string {
  return `${window.location.pathname}${window.location.search}`;
}

export function buildSocialAuthStartUrl(provider: SocialAuthProviderId, returnTo: string): string {
  const url = new URL(`${getApiBaseUrl()}/auth/${provider}/start`, window.location.origin);
  url.searchParams.set("returnTo", sanitizeReturnTo(returnTo));
  return url.toString();
}

export function storePendingInvite(token: string, storage: Storage = window.localStorage): void {
  storage.setItem(PENDING_INVITE_STORAGE_KEY, token);
}

export function takePendingInviteRedirectPath(storage: Storage = window.localStorage): string | null {
  const token = storage.getItem(PENDING_INVITE_STORAGE_KEY);
  if (!token) return null;

  storage.removeItem(PENDING_INVITE_STORAGE_KEY);
  const params = new URLSearchParams();
  params.set("invite", token);
  return `/?${params.toString()}`;
}
