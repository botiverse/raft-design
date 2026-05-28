import { expect, test, type APIRequestContext, type Browser, type Page } from "@playwright/test";
import { loginViaApi, loginViaApiWithCredentials } from "../fixtures/auth";
import { waitForSeedState, type PlaywrightSeedState } from "../fixtures/seedState";

type Login = { accessToken: string; refreshToken: string };
type ServerRecord = { id: string; slug: string; name: string };

function uniqueSlug(prefix: string) {
  return `${prefix}-${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 7)}`.toLowerCase();
}

function authHeaders(login: Login, serverId?: string) {
  return {
    Authorization: `Bearer ${login.accessToken}`,
    ...(serverId ? { "X-Server-Id": serverId } : {}),
  };
}

async function createServer(request: APIRequestContext, seedState: PlaywrightSeedState, login: Login, prefix: string) {
  const slug = uniqueSlug(prefix);
  const res = await request.post(`${seedState.urls.api}/api/servers`, {
    headers: authHeaders(login),
    data: { name: `E2E ${prefix}`, slug },
  });
  expect(res.ok()).toBeTruthy();
  return await res.json() as ServerRecord;
}

async function deleteServer(request: APIRequestContext, seedState: PlaywrightSeedState, login: Login, serverId: string) {
  await request.delete(`${seedState.urls.api}/api/servers/${serverId}`, {
    headers: authHeaders(login, serverId),
  });
}

async function createMachineAndAgent(
  request: APIRequestContext,
  seedState: PlaywrightSeedState,
  login: Login,
  serverId: string,
) {
  const machineRes = await request.post(`${seedState.urls.api}/api/servers/${serverId}/machines`, {
    headers: authHeaders(login, serverId),
    data: { name: "e2e-machine" },
  });
  expect(machineRes.ok()).toBeTruthy();
  const machineBody = await machineRes.json() as { machine: { id: string } };

  const agentRes = await request.post(`${seedState.urls.api}/api/agents`, {
    headers: authHeaders(login, serverId),
    data: {
      name: uniqueSlug("agent").replace(/-/g, ""),
      runtime: "claude",
      machineId: machineBody.machine.id,
      onboarding: true,
    },
  });
  expect(agentRes.ok()).toBeTruthy();
}

async function resetReferralSource(request: APIRequestContext, seedState: PlaywrightSeedState, login: Login) {
  const res = await request.patch(`${seedState.urls.api}/api/auth/me`, {
    headers: authHeaders(login),
    data: { referralSource: null },
  });
  expect(res.ok()).toBeTruthy();
}

async function restoreReferralSkip(request: APIRequestContext, seedState: PlaywrightSeedState, login: Login) {
  const res = await request.patch(`${seedState.urls.api}/api/auth/me`, {
    headers: authHeaders(login),
    data: { referralSourceSkipped: true },
  });
  expect(res.ok()).toBeTruthy();
}

async function openServer(
  browser: Browser,
  login: Login,
  serverSlug: string,
  path = `/s/${serverSlug}`,
) {
  const context = await browser.newContext({ storageState: undefined });
  await context.addInitScript((data) => {
    localStorage.setItem("slock_access_token", data.accessToken);
    localStorage.setItem("slock_refresh_token", data.refreshToken);
    localStorage.setItem("slock_last_server_slug", data.serverSlug);
  }, { ...login, serverSlug });
  const page = await context.newPage();
  await page.route("**/api/announcements/active", async (route) => {
    await route.fulfill({
      status: 200,
      contentType: "application/json",
      body: JSON.stringify({ announcements: [] }),
    });
  });
  await page.goto(path);
  return { context, page };
}

async function expectWizardStep(page: Page, step: string, heading: string) {
  const modal = page.getByTestId("onboarding-wizard-modal");
  await expect(modal).toBeVisible();
  await expect(modal).toHaveAttribute("data-step", step);
  await expect(page.getByText("Meet Slock")).toBeVisible();
  await expect(page.getByRole("heading", { name: heading })).toBeVisible();
}

test.describe.serial("Onboarding wizard", () => {
  test("pre-existing seeded membership does not backfill-trigger the wizard", async ({ page }) => {
    const seedState = await waitForSeedState();
    await page.goto(`/s/${seedState.server.slug}`);
    await expect(page.getByTestId("onboarding-wizard-modal")).toHaveCount(0);
  });

  test("setup step skip is session-scoped, while don't-remind persists per server", async ({
    browser,
    request,
  }) => {
    const seedState = await waitForSeedState();
    const login = await loginViaApi(request, seedState);
    const server = await createServer(request, seedState, login, "wizard-setup");

    try {
      await resetReferralSource(request, seedState, login);

      const first = await openServer(browser, login, server.slug);
      await expectWizardStep(first.page, "add-computer", "ADD A COMPUTER");
      await expect(first.page.getByText("Don't remind me again")).toBeVisible();
      await expect(first.page.getByTestId("onboarding-wizard-close")).toHaveCount(0);
      await first.page.getByTestId("onboarding-skip-button").click();
      await expectWizardStep(first.page, "referral-source", "HOW DID YOU FIND US?");
      await expect(first.page.getByText("Don't remind me again")).toBeVisible();
      await first.page.getByTestId("onboarding-skip-button").click();

      await expectWizardStep(first.page, "complete", "START BUILDING WITH SLOCK");
      await first.page.keyboard.press("Escape");
      await expect(first.page.getByTestId("onboarding-wizard-modal")).toHaveCount(0);
      await first.page.reload();
      await expectWizardStep(first.page, "complete", "START BUILDING WITH SLOCK");
      await first.page.getByTestId("onboarding-complete-button").click();
      await expect(first.page.getByTestId("onboarding-wizard-modal")).toHaveCount(0);
      await first.context.close();

      const second = await openServer(browser, login, server.slug);
      await expectWizardStep(second.page, "add-computer", "ADD A COMPUTER");
      await second.page.getByTestId("onboarding-opt-out-checkbox").check({ force: true });
      await second.page.getByTestId("onboarding-skip-button").click();
      await expectWizardStep(second.page, "referral-source", "HOW DID YOU FIND US?");
      await second.context.close();

      const settingsRes = await request.get(`${seedState.urls.api}/api/servers/${server.id}/onboarding-settings`, {
        headers: authHeaders(login, server.id),
      });
      expect(settingsRes.ok()).toBeTruthy();
      const settings = await settingsRes.json() as { dismissedAddComputerStepAt: string | null };
      expect(settings.dismissedAddComputerStepAt).toBeTruthy();

      const third = await openServer(browser, login, server.slug);
      await expectWizardStep(third.page, "referral-source", "HOW DID YOU FIND US?");
      await third.context.close();
    } finally {
      await restoreReferralSkip(request, seedState, login);
      await deleteServer(request, seedState, login, server.id);
    }
  });

  test("soft-step skip permanently dismisses the current step and advances", async ({
    browser,
    request,
  }) => {
    const seedState = await waitForSeedState();
    const login = await loginViaApi(request, seedState);
    const server = await createServer(request, seedState, login, "wizard-soft");

    try {
      await createMachineAndAgent(request, seedState, login, server.id);
      await resetReferralSource(request, seedState, login);

      const { context, page } = await openServer(browser, login, server.slug);
      await expectWizardStep(page, "referral-source", "HOW DID YOU FIND US?");
      await expect(page.getByText("Don't remind me again")).toBeVisible();
      await page.getByTestId("onboarding-skip-button").click();
      await expectWizardStep(page, "invite-teammates", "BRING YOUR TEAM");
      await context.close();

      const retry = await openServer(browser, login, server.slug);
      await expectWizardStep(retry.page, "referral-source", "HOW DID YOU FIND US?");
      await retry.page.getByTestId("onboarding-opt-out-checkbox").check({ force: true });
      await retry.page.getByTestId("onboarding-skip-button").click();

      await expectWizardStep(retry.page, "invite-teammates", "BRING YOUR TEAM");
      await expect(retry.page.getByTestId("invite-email-1")).toBeVisible();
      await expect(retry.page.getByText("Don't remind me again")).toHaveCount(0);
      await retry.page.getByTestId("onboarding-skip-button").click();
      await expectWizardStep(retry.page, "complete", "START BUILDING WITH SLOCK");
      await retry.page.getByTestId("onboarding-complete-button").click();
      await expect(retry.page.getByTestId("onboarding-wizard-modal")).toHaveCount(0);
      await retry.context.close();

      const settingsRes = await request.get(`${seedState.urls.api}/api/servers/${server.id}/onboarding-settings`, {
        headers: authHeaders(login, server.id),
      });
      expect(settingsRes.ok()).toBeTruthy();
      const settings = await settingsRes.json() as { dismissedInviteStepAt: string | null };
      expect(settings.dismissedInviteStepAt).toBeTruthy();

      const reopened = await openServer(browser, login, server.slug);
      await expect(reopened.page.getByTestId("onboarding-wizard-modal")).toHaveCount(0);
      await reopened.context.close();
    } finally {
      await restoreReferralSkip(request, seedState, login);
      await deleteServer(request, seedState, login, server.id);
    }
  });

  test("invited member gets user-level referral but not community CTA", async ({ browser, request }) => {
    const seedState = await waitForSeedState();
    const ownerLogin = await loginViaApi(request, seedState);
    const memberLogin = await loginViaApiWithCredentials(request, seedState, {
      email: seedState.extraHuman.email,
      password: seedState.extraHuman.password,
    });
    const server = await createServer(request, seedState, ownerLogin, "wizard-member");

    try {
      await createMachineAndAgent(request, seedState, ownerLogin, server.id);
      const addMemberRes = await request.post(`${seedState.urls.api}/api/servers/${server.id}/members`, {
        headers: authHeaders(ownerLogin, server.id),
        data: { userId: seedState.extraHuman.userId, role: "member" },
      });
      expect(addMemberRes.ok()).toBeTruthy();
      await resetReferralSource(request, seedState, memberLogin);

      const { context, page } = await openServer(browser, memberLogin, server.slug);
      await expectWizardStep(page, "referral-source", "HOW DID YOU FIND US?");
      await expect(page.getByText("Don't remind me again")).toBeVisible();
      await page.getByTestId("onboarding-skip-button").click();
      await expect(page.getByRole("heading", { name: "JOIN THE COMMUNITY" })).toHaveCount(0);
      await expectWizardStep(page, "complete", "START BUILDING WITH SLOCK");
      await page.getByTestId("onboarding-complete-button").click();
      await expect(page.getByTestId("onboarding-wizard-modal")).toHaveCount(0);
      await context.close();
    } finally {
      await restoreReferralSkip(request, seedState, memberLogin);
      await deleteServer(request, seedState, ownerLogin, server.id);
    }
  });
});
