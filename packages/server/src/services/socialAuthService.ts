import { createHash, randomBytes } from "node:crypto";
import jwt from "jsonwebtoken";
import { eq, lt } from "drizzle-orm";
import { getDb } from "../db/index.js";
import { socialAuthCompletions } from "../db/schema.js";

export type SocialAuthProvider = "google" | "github";
export type SocialAuthMode = "login" | "link";

export interface SocialAuthProviderConfig {
  id: SocialAuthProvider;
  label: string;
}

export interface SocialAuthProfile {
  provider: SocialAuthProvider;
  providerUserId: string;
  email: string;
  emailVerified: boolean;
  displayName?: string | null;
  avatarUrl?: string | null;
}

export interface SocialAuthStatePayload {
  provider: SocialAuthProvider;
  mode: SocialAuthMode;
  nonce: string;
  linkUserId?: string;
  returnTo?: string;
}

interface CookieOptions {
  maxAge?: number;
  expires?: Date;
  httpOnly?: boolean;
  path?: string;
  sameSite?: "Lax" | "Strict" | "None";
  secure?: boolean;
}

export interface SocialAuthCompletionResult {
  provider: SocialAuthProvider;
  mode: SocialAuthMode;
  intendedAction: SocialAuthMode;
  returnTo: string;
  providerUserId?: string;
  providerEmail?: string;
  providerDisplayName?: string;
  providerAvatarUrl?: string;
  userId?: string;
}

export const SOCIAL_AUTH_PROVIDERS: SocialAuthProviderConfig[] = [
  { id: "google", label: "Google" },
  { id: "github", label: "GitHub" },
];

interface GoogleProfileResponse {
  sub: string;
  email: string;
  email_verified?: boolean;
  name?: string;
  picture?: string;
}

interface GitHubTokenResponse {
  access_token?: string;
  error?: string;
  error_description?: string;
}

interface GitHubProfileResponse {
  id: number;
  login?: string;
  name?: string | null;
  avatar_url?: string | null;
}

interface GitHubEmailResponse {
  email: string;
  verified: boolean;
  primary: boolean;
}

function requireStateSecret(): string {
  const secret = process.env.SOCIAL_AUTH_STATE_SECRET || process.env.JWT_SECRET;
  if (!secret) {
    throw new Error("SOCIAL_AUTH_STATE_SECRET or JWT_SECRET must be configured");
  }
  return secret;
}

function hashValue(value: string): string {
  return createHash("sha256").update(value).digest("hex");
}

function getStateCookieName(provider: SocialAuthProvider): string {
  return `slock_${provider}_oauth_nonce`;
}

function shouldUseSecureCookie(): boolean {
  return getServerUrl().startsWith("https://");
}

function serializeCookie(name: string, value: string, options: CookieOptions = {}): string {
  const parts = [`${name}=${encodeURIComponent(value)}`];
  parts.push(`Path=${options.path || "/"}`);
  if (options.maxAge !== undefined) parts.push(`Max-Age=${options.maxAge}`);
  if (options.expires) parts.push(`Expires=${options.expires.toUTCString()}`);
  if (options.httpOnly !== false) parts.push("HttpOnly");
  if (options.sameSite) parts.push(`SameSite=${options.sameSite}`);
  if (options.secure) parts.push("Secure");
  return parts.join("; ");
}

export function parseCookieHeader(cookieHeader: string | undefined): Record<string, string> {
  if (!cookieHeader) return {};

  return cookieHeader
    .split(";")
    .map((part) => part.trim())
    .filter(Boolean)
    .reduce<Record<string, string>>((accumulator, part) => {
      const separatorIndex = part.indexOf("=");
      if (separatorIndex <= 0) return accumulator;
      const key = part.slice(0, separatorIndex).trim();
      const value = part.slice(separatorIndex + 1).trim();
      accumulator[key] = decodeURIComponent(value);
      return accumulator;
    }, {});
}

export function buildStateCookie(provider: SocialAuthProvider, nonce: string): string {
  return serializeCookie(getStateCookieName(provider), nonce, {
    httpOnly: true,
    sameSite: "Lax",
    secure: shouldUseSecureCookie(),
    path: `/api/auth/${provider}/callback`,
    maxAge: 10 * 60,
  });
}

export function clearStateCookie(provider: SocialAuthProvider): string {
  return serializeCookie(getStateCookieName(provider), "", {
    httpOnly: true,
    sameSite: "Lax",
    secure: shouldUseSecureCookie(),
    path: `/api/auth/${provider}/callback`,
    expires: new Date(0),
  });
}

export function readStateCookie(provider: SocialAuthProvider, cookieHeader: string | undefined): string | null {
  return parseCookieHeader(cookieHeader)[getStateCookieName(provider)] || null;
}

export function getServerUrl(): string {
  return (process.env.SERVER_URL || `http://localhost:${process.env.PORT || 3001}`).replace(/\/$/, "");
}

export function getAppUrl(): string {
  return (process.env.APP_URL || "http://localhost:5173").replace(/\/$/, "");
}

export function sanitizeReturnTo(input: unknown): string {
  if (typeof input !== "string") return "/";
  if (!input.startsWith("/") || input.startsWith("//")) return "/";
  return input;
}

export function createSocialAuthNonce(): string {
  return randomBytes(16).toString("hex");
}

export function signSocialAuthState(payload: SocialAuthStatePayload): string {
  return jwt.sign(payload, requireStateSecret(), {
    expiresIn: "10m",
    issuer: "slock-social-auth",
    audience: "social-auth-state",
  });
}

export function verifySocialAuthState(state: string): SocialAuthStatePayload {
  return jwt.verify(state, requireStateSecret(), {
    issuer: "slock-social-auth",
    audience: "social-auth-state",
  }) as SocialAuthStatePayload;
}

export function validateSocialAuthCallbackState(
  provider: SocialAuthProvider,
  stateToken: string,
  cookieHeader: string | undefined,
): { state: SocialAuthStatePayload; returnTo: string } {
  const state = verifySocialAuthState(stateToken);
  if (state.provider !== provider) {
    throw new Error("Social sign-in browser state mismatch");
  }

  // Login flow starts as a top-level navigation, so we can require the nonce
  // cookie as an additional browser-state check. Link flow starts from a
  // cross-origin XHR in Settings, where modern browsers may not persist that
  // cookie consistently; the signed state token remains the source of truth.
  if (state.mode === "login") {
    const stateCookie = readStateCookie(provider, cookieHeader);
    if (!stateCookie || stateCookie !== state.nonce) {
      throw new Error("Social sign-in browser state mismatch");
    }
  }

  return {
    state,
    returnTo: sanitizeReturnTo(state.returnTo),
  };
}

export function getSocialAuthProvider(providerId: string): SocialAuthProviderConfig | null {
  return SOCIAL_AUTH_PROVIDERS.find((provider) => provider.id === providerId) || null;
}

export function isSocialAuthProviderConfigured(provider: SocialAuthProvider): boolean {
  switch (provider) {
    case "google":
      return !!process.env.GOOGLE_CLIENT_ID && !!process.env.GOOGLE_CLIENT_SECRET;
    case "github":
      return !!process.env.GITHUB_CLIENT_ID && !!process.env.GITHUB_CLIENT_SECRET;
    default:
      return false;
  }
}

export function getSocialAuthRedirectUri(provider: SocialAuthProvider): string {
  switch (provider) {
    case "google":
      if (process.env.GOOGLE_REDIRECT_URI) return process.env.GOOGLE_REDIRECT_URI;
      return `${getServerUrl()}/api/auth/google/callback`;
    case "github":
      if (process.env.GITHUB_REDIRECT_URI) return process.env.GITHUB_REDIRECT_URI;
      return `${getServerUrl()}/api/auth/github/callback`;
    default:
      throw new Error(`Unsupported social auth provider: ${provider satisfies never}`);
  }
}

export function buildAuthorizationUrl(provider: SocialAuthProvider, state: string, mode: SocialAuthMode): string {
  switch (provider) {
    case "google": {
      const params = new URLSearchParams({
        client_id: process.env.GOOGLE_CLIENT_ID!,
        redirect_uri: getSocialAuthRedirectUri("google"),
        response_type: "code",
        scope: "openid email profile",
        state,
      });
      if (mode === "link") {
        params.set("prompt", "select_account");
      }
      return `https://accounts.google.com/o/oauth2/v2/auth?${params.toString()}`;
    }
    case "github": {
      const params = new URLSearchParams({
        client_id: process.env.GITHUB_CLIENT_ID!,
        redirect_uri: getSocialAuthRedirectUri("github"),
        scope: "read:user user:email",
        state,
      });
      return `https://github.com/login/oauth/authorize?${params.toString()}`;
    }
    default:
      throw new Error(`Unsupported social auth provider: ${provider satisfies never}`);
  }
}

export async function exchangeProviderCode(provider: SocialAuthProvider, code: string): Promise<{ accessToken: string }> {
  switch (provider) {
    case "google": {
      const response = await fetch("https://oauth2.googleapis.com/token", {
        method: "POST",
        headers: { "Content-Type": "application/x-www-form-urlencoded" },
        body: new URLSearchParams({
          code,
          client_id: process.env.GOOGLE_CLIENT_ID!,
          client_secret: process.env.GOOGLE_CLIENT_SECRET!,
          redirect_uri: getSocialAuthRedirectUri("google"),
          grant_type: "authorization_code",
        }),
      });

      if (!response.ok) {
        throw new Error(`Google token exchange failed (${response.status})`);
      }

      const data = await response.json() as { access_token?: string };
      if (!data.access_token) {
        throw new Error("Google token exchange returned no access token");
      }

      return { accessToken: data.access_token };
    }
    case "github": {
      const response = await fetch("https://github.com/login/oauth/access_token", {
        method: "POST",
        headers: {
          Accept: "application/json",
          "Content-Type": "application/x-www-form-urlencoded",
        },
        body: new URLSearchParams({
          code,
          client_id: process.env.GITHUB_CLIENT_ID!,
          client_secret: process.env.GITHUB_CLIENT_SECRET!,
          redirect_uri: getSocialAuthRedirectUri("github"),
        }),
      });

      if (!response.ok) {
        throw new Error(`GitHub token exchange failed (${response.status})`);
      }

      const data = await response.json() as GitHubTokenResponse;
      if (!data.access_token) {
        if (data.error_description) {
          throw new Error(`GitHub token exchange failed: ${data.error_description}`);
        }
        throw new Error("GitHub token exchange returned no access token");
      }

      return { accessToken: data.access_token };
    }
    default:
      throw new Error(`Unsupported social auth provider: ${provider satisfies never}`);
  }
}

async function fetchGitHubPrimaryEmail(accessToken: string): Promise<string> {
  const response = await fetch("https://api.github.com/user/emails", {
    headers: {
      Accept: "application/vnd.github+json",
      Authorization: `Bearer ${accessToken}`,
      "User-Agent": "slock-social-auth",
    },
  });

  if (!response.ok) {
    throw new Error(`GitHub email fetch failed (${response.status})`);
  }

  const emails = await response.json() as GitHubEmailResponse[];
  const primaryVerifiedEmail = emails.find((email) => email.primary && email.verified && !!email.email);
  if (!primaryVerifiedEmail) {
    throw new Error("GitHub account does not have a verified primary email");
  }

  return primaryVerifiedEmail.email;
}

export async function fetchSocialAuthProfile(provider: SocialAuthProvider, accessToken: string): Promise<SocialAuthProfile> {
  switch (provider) {
    case "google": {
      const response = await fetch("https://openidconnect.googleapis.com/v1/userinfo", {
        headers: { Authorization: `Bearer ${accessToken}` },
      });
      if (!response.ok) {
        throw new Error(`Google profile fetch failed (${response.status})`);
      }

      const profile = await response.json() as GoogleProfileResponse;
      return {
        provider: "google",
        providerUserId: profile.sub,
        email: profile.email,
        emailVerified: !!profile.email_verified,
        displayName: profile.name ?? null,
        avatarUrl: profile.picture ?? null,
      };
    }
    case "github": {
      const response = await fetch("https://api.github.com/user", {
        headers: {
          Accept: "application/vnd.github+json",
          Authorization: `Bearer ${accessToken}`,
          "User-Agent": "slock-social-auth",
        },
      });
      if (!response.ok) {
        throw new Error(`GitHub profile fetch failed (${response.status})`);
      }

      const profile = await response.json() as GitHubProfileResponse;
      const email = await fetchGitHubPrimaryEmail(accessToken);
      return {
        provider: "github",
        providerUserId: String(profile.id),
        email,
        emailVerified: true,
        displayName: profile.name ?? profile.login ?? null,
        avatarUrl: profile.avatar_url ?? null,
      };
    }
    default:
      throw new Error(`Unsupported social auth provider: ${provider satisfies never}`);
  }
}

export async function createSocialAuthCompletion(params: {
  provider: SocialAuthProvider;
  mode: SocialAuthMode;
  intendedAction: SocialAuthMode;
  userId?: string;
  providerUserId?: string;
  providerEmail?: string;
  providerDisplayName?: string | null;
  providerAvatarUrl?: string | null;
  returnTo?: string;
}): Promise<string> {
  const database = getDb();
  const code = randomBytes(32).toString("hex");
  const codeHash = hashValue(code);

  await cleanupExpiredSocialAuthCompletions();

  await database.insert(socialAuthCompletions).values({
    codeHash,
    provider: params.provider,
    mode: params.mode,
    intendedAction: params.intendedAction,
    userId: params.userId ?? null,
    providerUserId: params.providerUserId ?? null,
    providerEmail: params.providerEmail ?? null,
    providerDisplayName: params.providerDisplayName ?? null,
    providerAvatarUrl: params.providerAvatarUrl ?? null,
    returnTo: sanitizeReturnTo(params.returnTo),
    expiresAt: new Date(Date.now() + 5 * 60 * 1000),
  });

  return code;
}

function toSocialAuthCompletionResult(completion: typeof socialAuthCompletions.$inferSelect): SocialAuthCompletionResult {
  return {
    provider: completion.provider,
    mode: completion.mode,
    intendedAction: completion.intendedAction,
    returnTo: sanitizeReturnTo(completion.returnTo),
    userId: completion.userId ?? undefined,
    providerUserId: completion.providerUserId ?? undefined,
    providerEmail: completion.providerEmail ?? undefined,
    providerDisplayName: completion.providerDisplayName ?? undefined,
    providerAvatarUrl: completion.providerAvatarUrl ?? undefined,
  };
}

function validateSocialAuthCompletion(provider: SocialAuthProvider, completion: typeof socialAuthCompletions.$inferSelect | undefined) {
  if (!completion) {
    throw new Error("Invalid or expired social auth completion");
  }
  if (completion.provider !== provider) {
    throw new Error("Social auth completion provider mismatch");
  }
  if (completion.expiresAt < new Date()) {
    throw new Error("Social auth completion expired");
  }
}

export async function getSocialAuthCompletion(provider: SocialAuthProvider, code: string): Promise<SocialAuthCompletionResult> {
  const database = getDb();
  const codeHash = hashValue(code);

  const [completion] = await database.select()
    .from(socialAuthCompletions)
    .where(eq(socialAuthCompletions.codeHash, codeHash))
    .limit(1);

  validateSocialAuthCompletion(provider, completion);
  return toSocialAuthCompletionResult(completion);
}

export async function exchangeSocialAuthCompletion(provider: SocialAuthProvider, code: string): Promise<SocialAuthCompletionResult> {
  const database = getDb();
  const codeHash = hashValue(code);

  const [completion] = await database.delete(socialAuthCompletions)
    .where(eq(socialAuthCompletions.codeHash, codeHash))
    .returning();

  validateSocialAuthCompletion(provider, completion);
  return toSocialAuthCompletionResult(completion);
}

export async function cleanupExpiredSocialAuthCompletions(): Promise<void> {
  const database = getDb();
  await database.delete(socialAuthCompletions).where(lt(socialAuthCompletions.expiresAt, new Date()));
}

export function buildSocialAuthCallbackUrl(params: {
  provider: SocialAuthProvider;
  mode: SocialAuthMode;
  returnTo?: string;
  code?: string;
  error?: string;
}): string {
  const url = new URL(getAppUrl());
  url.searchParams.set("auth_callback", "social");
  url.searchParams.set("provider", params.provider);
  url.searchParams.set("mode", params.mode);
  if (params.returnTo) url.searchParams.set("returnTo", params.returnTo);
  if (params.code) url.searchParams.set("code", params.code);
  if (params.error) url.searchParams.set("error", params.error);
  return url.toString();
}
