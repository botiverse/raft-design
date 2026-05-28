import type { APIRequestContext, Browser, BrowserContext, Page } from "@playwright/test";
import type { PlaywrightSeedState } from "./seedState";

type LoginResult = {
  accessToken: string;
  refreshToken: string;
};

export async function loginWithCredentials(
  request: APIRequestContext,
  apiBaseUrl: string,
  email: string,
  password: string,
): Promise<LoginResult> {
  const response = await request.post(`${apiBaseUrl}/api/auth/login`, {
    data: { email, password },
  });
  if (!response.ok()) {
    throw new Error(`Playwright login failed: ${response.status()} ${response.statusText()}`);
  }
  return response.json() as Promise<LoginResult>;
}

export async function dismissOwnerOnboarding(
  request: APIRequestContext,
  seedState: PlaywrightSeedState,
  accessToken: string,
) {
  const response = await request.patch(
    `${seedState.urls.api}/api/servers/${seedState.server.id}/onboarding-settings`,
    {
      headers: {
        Authorization: `Bearer ${accessToken}`,
        "X-Server-Id": seedState.server.id,
      },
      data: {
        setupModalReminderOptOut: true,
        dismissedAddComputerStep: true,
        dismissedCreateAgentStep: true,
        dismissedInviteStep: true,
        dismissedCommunityStep: true,
        dismissedNotificationStep: true,
      },
    },
  );
  if (!response.ok()) {
    throw new Error(
      `Failed to opt out of onboarding modal: ${response.status()} ${response.statusText()}`,
    );
  }
}

export async function injectSessionBeforeBoot(
  page: Page,
  session: {
    accessToken: string;
    refreshToken: string;
    serverSlug: string;
  },
) {
  await page.addInitScript((data) => {
    localStorage.setItem("slock_access_token", data.accessToken);
    localStorage.setItem("slock_refresh_token", data.refreshToken);
    localStorage.setItem("slock_last_server_slug", data.serverSlug);
  }, session);
}

export async function newAuthenticatedContext(
  browser: Browser,
  session: {
    accessToken: string;
    refreshToken: string;
    serverSlug: string;
  },
): Promise<BrowserContext> {
  const context = await browser.newContext();
  await context.addInitScript((data) => {
    localStorage.setItem("slock_access_token", data.accessToken);
    localStorage.setItem("slock_refresh_token", data.refreshToken);
    localStorage.setItem("slock_last_server_slug", data.serverSlug);
  }, session);
  return context;
}
