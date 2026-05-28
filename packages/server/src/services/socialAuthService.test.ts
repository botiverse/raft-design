import assert from "node:assert/strict";
import test from "node:test";
import {
  buildAuthorizationUrl,
  buildSocialAuthCallbackUrl,
  buildStateCookie,
  clearStateCookie,
  exchangeProviderCode,
  fetchSocialAuthProfile,
  getSocialAuthProvider,
  getSocialAuthRedirectUri,
  isSocialAuthProviderConfigured,
  parseCookieHeader,
  readStateCookie,
  sanitizeReturnTo,
  signSocialAuthState,
  validateSocialAuthCallbackState,
  verifySocialAuthState,
} from "./socialAuthService.js";

test("social auth state round-trip preserves provider, mode, and nonce", () => {
  const previousJwtSecret = process.env.JWT_SECRET;
  delete process.env.SOCIAL_AUTH_STATE_SECRET;
  process.env.JWT_SECRET = "test-secret";

  const token = signSocialAuthState({
    provider: "google",
    mode: "login",
    nonce: "nonce-123",
    returnTo: "/s/dev?tab=chat",
  });
  const state = verifySocialAuthState(token);

  assert.equal(state.provider, "google");
  assert.equal(state.mode, "login");
  assert.equal(state.nonce, "nonce-123");
  assert.equal(state.returnTo, "/s/dev?tab=chat");

  if (previousJwtSecret === undefined) {
    delete process.env.JWT_SECRET;
  } else {
    process.env.JWT_SECRET = previousJwtSecret;
  }
});

test("social auth cookies are scoped to provider callback path", () => {
  const previousServerUrl = process.env.SERVER_URL;
  process.env.SERVER_URL = "https://app.example.com";

  const cookie = buildStateCookie("google", "nonce-abc");
  const clearedCookie = clearStateCookie("google");

  assert.match(cookie, /slock_google_oauth_nonce=nonce-abc/);
  assert.match(cookie, /Path=\/api\/auth\/google\/callback/);
  assert.match(cookie, /HttpOnly/);
  assert.match(cookie, /SameSite=Lax/);
  assert.match(cookie, /Secure/);

  const cookies = parseCookieHeader(cookie);
  assert.equal(cookies.slock_google_oauth_nonce, "nonce-abc");
  assert.equal(readStateCookie("google", cookie), "nonce-abc");
  assert.match(clearedCookie, /Expires=/);

  if (previousServerUrl === undefined) {
    delete process.env.SERVER_URL;
  } else {
    process.env.SERVER_URL = previousServerUrl;
  }
});

test("login callback state requires a matching nonce cookie", () => {
  const previousJwtSecret = process.env.JWT_SECRET;
  delete process.env.SOCIAL_AUTH_STATE_SECRET;
  process.env.JWT_SECRET = "test-secret";

  const stateToken = signSocialAuthState({
    provider: "google",
    mode: "login",
    nonce: "nonce-login",
    returnTo: "/settings",
  });

  assert.throws(
    () => validateSocialAuthCallbackState("google", stateToken, undefined),
    /browser state mismatch/,
  );

  const validated = validateSocialAuthCallbackState(
    "google",
    stateToken,
    buildStateCookie("google", "nonce-login"),
  );
  assert.equal(validated.state.mode, "login");
  assert.equal(validated.returnTo, "/settings");

  if (previousJwtSecret === undefined) delete process.env.JWT_SECRET;
  else process.env.JWT_SECRET = previousJwtSecret;
});

test("link callback state can complete without a nonce cookie", () => {
  const previousJwtSecret = process.env.JWT_SECRET;
  delete process.env.SOCIAL_AUTH_STATE_SECRET;
  process.env.JWT_SECRET = "test-secret";

  const stateToken = signSocialAuthState({
    provider: "github",
    mode: "link",
    nonce: "nonce-link",
    linkUserId: "user-123",
    returnTo: "/settings?tab=account",
  });

  const validated = validateSocialAuthCallbackState("github", stateToken, undefined);
  assert.equal(validated.state.mode, "link");
  assert.equal(validated.state.linkUserId, "user-123");
  assert.equal(validated.returnTo, "/settings?tab=account");

  if (previousJwtSecret === undefined) delete process.env.JWT_SECRET;
  else process.env.JWT_SECRET = previousJwtSecret;
});

test("social auth callback URL and provider exposure follow configured Google and GitHub env", () => {
  const previousAppUrl = process.env.APP_URL;
  const previousGoogleClientId = process.env.GOOGLE_CLIENT_ID;
  const previousGoogleClientSecret = process.env.GOOGLE_CLIENT_SECRET;
  const previousGithubClientId = process.env.GITHUB_CLIENT_ID;
  const previousGithubClientSecret = process.env.GITHUB_CLIENT_SECRET;

  process.env.APP_URL = "https://app.example.com";
  process.env.GOOGLE_CLIENT_ID = "google-client-id";
  process.env.GOOGLE_CLIENT_SECRET = "google-client-secret";
  process.env.GITHUB_CLIENT_ID = "github-client-id";
  process.env.GITHUB_CLIENT_SECRET = "github-client-secret";

  const callbackUrl = buildSocialAuthCallbackUrl({
    provider: "google",
    mode: "login",
    returnTo: "/s/dev",
    code: "code-123",
  });

  assert.match(callbackUrl, /auth_callback=social/);
  assert.match(callbackUrl, /provider=google/);
  assert.match(callbackUrl, /mode=login/);
  assert.equal(getSocialAuthProvider("google")?.label, "Google");
  assert.equal(getSocialAuthProvider("github")?.label, "GitHub");
  assert.equal(isSocialAuthProviderConfigured("google"), true);
  assert.equal(isSocialAuthProviderConfigured("github"), true);

  if (previousAppUrl === undefined) delete process.env.APP_URL;
  else process.env.APP_URL = previousAppUrl;
  if (previousGoogleClientId === undefined) delete process.env.GOOGLE_CLIENT_ID;
  else process.env.GOOGLE_CLIENT_ID = previousGoogleClientId;
  if (previousGoogleClientSecret === undefined) delete process.env.GOOGLE_CLIENT_SECRET;
  else process.env.GOOGLE_CLIENT_SECRET = previousGoogleClientSecret;
  if (previousGithubClientId === undefined) delete process.env.GITHUB_CLIENT_ID;
  else process.env.GITHUB_CLIENT_ID = previousGithubClientId;
  if (previousGithubClientSecret === undefined) delete process.env.GITHUB_CLIENT_SECRET;
  else process.env.GITHUB_CLIENT_SECRET = previousGithubClientSecret;
});

test("sanitizeReturnTo only accepts app-local paths", () => {
  assert.equal(sanitizeReturnTo("/settings?tab=account"), "/settings?tab=account");
  assert.equal(sanitizeReturnTo("https://evil.example.com"), "/");
  assert.equal(sanitizeReturnTo("//evil.example.com"), "/");
  assert.equal(sanitizeReturnTo("settings"), "/");
});

test("GitHub authorization URL includes redirect URI and required scopes", () => {
  const previousServerUrl = process.env.SERVER_URL;
  const previousGithubClientId = process.env.GITHUB_CLIENT_ID;
  const previousGithubClientSecret = process.env.GITHUB_CLIENT_SECRET;

  process.env.SERVER_URL = "https://api.example.com";
  process.env.GITHUB_CLIENT_ID = "github-client-id";
  process.env.GITHUB_CLIENT_SECRET = "github-client-secret";

  const authorizationUrl = new URL(buildAuthorizationUrl("github", "state-123", "login"));

  assert.equal(authorizationUrl.origin, "https://github.com");
  assert.equal(authorizationUrl.pathname, "/login/oauth/authorize");
  assert.equal(authorizationUrl.searchParams.get("client_id"), "github-client-id");
  assert.equal(authorizationUrl.searchParams.get("redirect_uri"), getSocialAuthRedirectUri("github"));
  assert.equal(authorizationUrl.searchParams.get("scope"), "read:user user:email");
  assert.equal(authorizationUrl.searchParams.get("state"), "state-123");

  if (previousServerUrl === undefined) delete process.env.SERVER_URL;
  else process.env.SERVER_URL = previousServerUrl;
  if (previousGithubClientId === undefined) delete process.env.GITHUB_CLIENT_ID;
  else process.env.GITHUB_CLIENT_ID = previousGithubClientId;
  if (previousGithubClientSecret === undefined) delete process.env.GITHUB_CLIENT_SECRET;
  else process.env.GITHUB_CLIENT_SECRET = previousGithubClientSecret;
});

test("GitHub token exchange and profile fetch use GitHub OAuth endpoints", async () => {
  const previousServerUrl = process.env.SERVER_URL;
  const previousGithubClientId = process.env.GITHUB_CLIENT_ID;
  const previousGithubClientSecret = process.env.GITHUB_CLIENT_SECRET;
  const originalFetch = globalThis.fetch;
  const fetchCalls: Array<{ url: string; init?: RequestInit }> = [];

  process.env.SERVER_URL = "https://api.example.com";
  process.env.GITHUB_CLIENT_ID = "github-client-id";
  process.env.GITHUB_CLIENT_SECRET = "github-client-secret";

  globalThis.fetch = (async (input: string | URL | Request, init?: RequestInit) => {
    const url = typeof input === "string" ? input : input instanceof URL ? input.toString() : input.url;
    fetchCalls.push({ url, init });

    if (url === "https://github.com/login/oauth/access_token") {
      return new Response(JSON.stringify({ access_token: "github-access-token" }), {
        status: 200,
        headers: { "Content-Type": "application/json" },
      });
    }

    if (url === "https://api.github.com/user") {
      return new Response(JSON.stringify({
        id: 12345,
        login: "octocat",
        name: "The Octocat",
        avatar_url: "https://avatars.example.com/u/12345",
      }), {
        status: 200,
        headers: { "Content-Type": "application/json" },
      });
    }

    if (url === "https://api.github.com/user/emails") {
      return new Response(JSON.stringify([
        { email: "secondary@example.com", verified: true, primary: false },
        { email: "primary@example.com", verified: true, primary: true },
      ]), {
        status: 200,
        headers: { "Content-Type": "application/json" },
      });
    }

    throw new Error(`Unexpected fetch: ${url}`);
  }) as typeof fetch;

  try {
    const token = await exchangeProviderCode("github", "oauth-code-123");
    assert.equal(token.accessToken, "github-access-token");

    const tokenExchangeBody = fetchCalls[0]?.init?.body;
    assert.ok(tokenExchangeBody instanceof URLSearchParams);
    assert.equal(tokenExchangeBody.get("client_id"), "github-client-id");
    assert.equal(tokenExchangeBody.get("client_secret"), "github-client-secret");
    assert.equal(tokenExchangeBody.get("code"), "oauth-code-123");
    assert.equal(tokenExchangeBody.get("redirect_uri"), "https://api.example.com/api/auth/github/callback");

    const profile = await fetchSocialAuthProfile("github", token.accessToken);
    assert.deepEqual(profile, {
      provider: "github",
      providerUserId: "12345",
      email: "primary@example.com",
      emailVerified: true,
      displayName: "The Octocat",
      avatarUrl: "https://avatars.example.com/u/12345",
    });
  } finally {
    globalThis.fetch = originalFetch;
    if (previousServerUrl === undefined) delete process.env.SERVER_URL;
    else process.env.SERVER_URL = previousServerUrl;
    if (previousGithubClientId === undefined) delete process.env.GITHUB_CLIENT_ID;
    else process.env.GITHUB_CLIENT_ID = previousGithubClientId;
    if (previousGithubClientSecret === undefined) delete process.env.GITHUB_CLIENT_SECRET;
    else process.env.GITHUB_CLIENT_SECRET = previousGithubClientSecret;
  }
});

test("GitHub profile fetch fails when there is no verified primary email", async () => {
  const originalFetch = globalThis.fetch;

  globalThis.fetch = (async (input: string | URL | Request) => {
    const url = typeof input === "string" ? input : input instanceof URL ? input.toString() : input.url;

    if (url === "https://api.github.com/user") {
      return new Response(JSON.stringify({
        id: 12345,
        login: "octocat",
      }), {
        status: 200,
        headers: { "Content-Type": "application/json" },
      });
    }

    if (url === "https://api.github.com/user/emails") {
      return new Response(JSON.stringify([
        { email: "primary@example.com", verified: false, primary: true },
        { email: "secondary@example.com", verified: true, primary: false },
      ]), {
        status: 200,
        headers: { "Content-Type": "application/json" },
      });
    }

    throw new Error(`Unexpected fetch: ${url}`);
  }) as typeof fetch;

  try {
    await assert.rejects(
      () => fetchSocialAuthProfile("github", "github-access-token"),
      /GitHub account does not have a verified primary email/,
    );
  } finally {
    globalThis.fetch = originalFetch;
  }
});
