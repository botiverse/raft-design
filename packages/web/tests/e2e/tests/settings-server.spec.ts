import { expect, test, type APIRequestContext, type Browser } from "@playwright/test";
import { loginViaApi, loginViaApiWithCredentials } from "../fixtures/auth";
import { waitForSeedState, type PlaywrightSeedState } from "../fixtures/seedState";

type Login = { accessToken: string; refreshToken: string };

// The seeded announcement is pre-dismissed only for the playwright owner.
// extraHuman has not dismissed, so without this call the modal pops up over
// /settings/server and intercepts every UI interaction. announcement-modal
// .spec.ts drives the contract end-to-end, but it lives in a separate spec
// file and Playwright shards by file — when settings-server lands in a
// different shard than announcement-modal (as it does on shard 3 of 4),
// nothing else dismisses the modal for extraHuman first. Doing it ourselves
// makes the test order- and shard-independent.
async function dismissAnnouncementForUser(
  request: APIRequestContext,
  seedState: PlaywrightSeedState,
  login: Login,
) {
  await request.post(
    `${seedState.urls.api}/api/announcements/${seedState.announcement.id}/dismiss`,
    { headers: { Authorization: `Bearer ${login.accessToken}` } },
  );
}

async function openAsUser(
  browser: Browser,
  seedState: PlaywrightSeedState,
  login: Login,
  path: string,
) {
  const context = await browser.newContext({ storageState: undefined });
  const page = await context.newPage();

  await page.addInitScript(
    (data) => {
      localStorage.setItem("slock_access_token", data.accessToken);
      localStorage.setItem("slock_refresh_token", data.refreshToken);
      localStorage.setItem("slock_last_server_slug", data.serverSlug);
    },
    { ...login, serverSlug: seedState.server.slug },
  );
  // Settings member tests do not exercise the account-level announcement
  // contract. Keep this local to the browser context so it cannot consume the
  // extraHuman dismissal that announcement-modal.spec intentionally owns.
  await page.route("**/api/announcements/active", async (route) => {
    await route.fulfill({
      status: 200,
      contentType: "application/json",
      body: JSON.stringify({ announcements: [] }),
    });
  });
  await page.goto(path);
  const waitForRoomsJoined = () =>
    page
      .waitForFunction(
        () => (window as Window & { __slockRoomsJoined?: boolean }).__slockRoomsJoined === true,
        undefined,
        { timeout: 15_000 },
      )
      .then(() => {});
  return { context, page, waitForRoomsJoined };
}

test.describe.serial("Settings › Server tab", () => {
  test("owner: profile name Save button gates on dirty state", async ({ page, request }) => {
    const seedState = await waitForSeedState();

    await page.goto(`/s/${seedState.server.slug}/settings/server`);

    const input = page.getByTestId("server-profile-name-input");
    const save = page.getByTestId("server-profile-save-button");

    await expect(input).toHaveValue(seedState.server.name);
    await expect(save).toBeDisabled();

    await input.fill(`${seedState.server.name} renamed`);
    await expect(save).toBeEnabled();

    await input.fill(seedState.server.name);
    await expect(save).toBeDisabled();

    await input.fill("   ");
    await expect(save).toBeDisabled();

    const newName = `${seedState.server.name} e2e`;
    await input.fill(newName);
    await expect(save).toBeEnabled();
    await save.click();
    await expect(save).toBeDisabled();

    // Confirm persisted via API.
    const login = await loginViaApi(request, seedState);
    const res = await request.get(`${seedState.urls.api}/api/servers/${seedState.server.id}`, {
      headers: {
        Authorization: `Bearer ${login.accessToken}`,
        "X-Server-Id": seedState.server.id,
      },
    });
    expect(res.ok()).toBeTruthy();
    const body = await res.json();
    expect(body.name).toBe(newName);

    // Restore so later specs that assert seedState.server.name still match.
    await request.patch(`${seedState.urls.api}/api/servers/${seedState.server.id}`, {
      headers: {
        Authorization: `Bearer ${login.accessToken}`,
        "X-Server-Id": seedState.server.id,
      },
      data: { name: seedState.server.name },
    });
  });

  test("member: profile is read-only (no input, no Save button)", async ({ browser, request }) => {
    const seedState = await waitForSeedState();
    const login = await loginViaApiWithCredentials(request, seedState, {
      email: seedState.extraHuman.email,
      password: seedState.extraHuman.password,
    });

    const { context, page } = await openAsUser(
      browser,
      seedState,
      login,
      `/s/${seedState.server.slug}/settings/server`,
    );

    try {
      await expect(page.getByTestId("server-profile-name-readonly")).toHaveText(seedState.server.name);
      await expect(page.getByTestId("server-profile-name-input")).toHaveCount(0);
      await expect(page.getByTestId("server-profile-save-button")).toHaveCount(0);
      await expect(page.getByTestId("server-danger-delete-button")).toHaveCount(0);
      await expect(page.getByTestId("server-danger-leave-button")).toBeVisible();
    } finally {
      await context.close();
    }
  });

  test("owner: delete dialog gates submit on exact slug match", async ({ page, request }) => {
    const seedState = await waitForSeedState();

    // Create a throwaway server so we can actually delete without breaking the seed.
    const login = await loginViaApi(request, seedState);
    const throwawaySlug = `e2e-del-${Date.now().toString(36)}`;
    const createRes = await request.post(`${seedState.urls.api}/api/servers`, {
      headers: { Authorization: `Bearer ${login.accessToken}` },
      data: { name: "E2E Delete Me", slug: throwawaySlug },
    });
    expect(createRes.ok()).toBeTruthy();
    const created = await createRes.json();
    const throwawayId: string = created.id;

    // Owner-only throwaway servers can auto-open onboarding wizard steps
    // (z-[60]) which would intercept clicks on the delete button. Flip the
    // opt-out flags server-side before the page loads so the modal never races
    // against our click.
    await request.patch(`${seedState.urls.api}/api/servers/${throwawayId}/onboarding-settings`, {
      headers: {
        Authorization: `Bearer ${login.accessToken}`,
        "X-Server-Id": throwawayId,
      },
      data: {
        setupModalReminderOptOut: true,
        dismissedAddComputerStep: true,
        dismissedCreateAgentStep: true,
        dismissedInviteStep: true,
        dismissedCommunityStep: true,
        dismissedNotificationStep: true,
      },
    });

    await page.goto(`/s/${throwawaySlug}/settings/server`);

    await page.getByTestId("server-danger-delete-button").click();

    const slugInput = page.getByTestId("server-delete-slug-input");
    const confirm = page.getByTestId("server-delete-confirm-button");
    await expect(slugInput).toBeVisible();
    await expect(confirm).toBeDisabled();

    await slugInput.fill("wrong-slug");
    await expect(confirm).toBeDisabled();

    await slugInput.fill(throwawaySlug);
    await expect(confirm).toBeEnabled();

    await confirm.click();

    await expect(page.getByRole("heading", { name: "Choose Server" })).toBeVisible();
    await expect(page).toHaveURL(/\/$/);

    // Confirm server is no longer listed for this user.
    const listRes = await request.get(`${seedState.urls.api}/api/servers`, {
      headers: { Authorization: `Bearer ${login.accessToken}` },
    });
    expect(listRes.ok()).toBeTruthy();
    const list = await listRes.json();
    expect(list.find((s: { id: string }) => s.id === throwawayId)).toBeUndefined();
  });

  test("member: Leave Server redirects to server selector", async ({ browser, request }) => {
    const seedState = await waitForSeedState();
    const login = await loginViaApiWithCredentials(request, seedState, {
      email: seedState.extraHuman.email,
      password: seedState.extraHuman.password,
    });
    await dismissAnnouncementForUser(request, seedState, login);

    const { context, page } = await openAsUser(
      browser,
      seedState,
      login,
      `/s/${seedState.server.slug}/settings/server`,
    );

    try {
      await page.getByTestId("server-danger-leave-button").click();
      const confirm = page.getByTestId("server-leave-confirm-button");
      await expect(confirm).toBeVisible();
      await confirm.click();

      await expect(page.getByRole("heading", { name: "Create your first server" })).toBeVisible();
      await expect(page).toHaveURL(/\/$/);

      // Confirm membership actually removed server-side.
      const res = await request.get(`${seedState.urls.api}/api/servers`, {
        headers: { Authorization: `Bearer ${login.accessToken}` },
      });
      expect(res.ok()).toBeTruthy();
      const servers = await res.json();
      expect(servers.find((s: { id: string }) => s.id === seedState.server.id)).toBeUndefined();
    } finally {
      await context.close();

      // Re-add the extra human so later specs that depend on their membership
      // (mobile-back deep-link into /human/:id) still find them in the server.
      const ownerLogin = await loginViaApi(request, seedState);
      await request.post(`${seedState.urls.api}/api/servers/${seedState.server.id}/members`, {
        headers: {
          Authorization: `Bearer ${ownerLogin.accessToken}`,
          "X-Server-Id": seedState.server.id,
        },
        data: { userId: seedState.extraHuman.userId, role: "member" },
      });
    }
  });

  test("member: owner removes active member and member is redirected immediately", async ({
    browser,
    request,
  }) => {
    const seedState = await waitForSeedState();
    const memberLogin = await loginViaApiWithCredentials(request, seedState, {
      email: seedState.extraHuman.email,
      password: seedState.extraHuman.password,
    });
    await dismissAnnouncementForUser(request, seedState, memberLogin);

    const { context, page, waitForRoomsJoined } = await openAsUser(
      browser,
      seedState,
      memberLogin,
      `/s/${seedState.server.slug}`,
    );

    try {
      await expect(page).toHaveURL(new RegExp(`/s/${seedState.server.slug}(/|$)`));
      // The redirect path is server -> socket emit to `user:<id>` room ->
      // frontend handler. The room is joined inside socket.io's connection
      // handler; if we DELETE before that, the emit lands in an empty room
      // and is lost (no room buffer). Block until the join completes.
      await waitForRoomsJoined();

      const ownerLogin = await loginViaApi(request, seedState);
      const removeRes = await request.delete(
        `${seedState.urls.api}/api/servers/${seedState.server.id}/members/${seedState.extraHuman.userId}`,
        {
          headers: {
            Authorization: `Bearer ${ownerLogin.accessToken}`,
            "X-Server-Id": seedState.server.id,
          },
        },
      );
      expect(removeRes.ok()).toBeTruthy();

      await expect(page.getByRole("heading", { name: "Create your first server" })).toBeVisible();
      await expect(page).toHaveURL(/\/$/);
    } finally {
      await context.close();

      // Restore membership so other e2e specs can continue using extraHuman.
      const ownerLogin = await loginViaApi(request, seedState);
      await request.post(`${seedState.urls.api}/api/servers/${seedState.server.id}/members`, {
        headers: {
          Authorization: `Bearer ${ownerLogin.accessToken}`,
          "X-Server-Id": seedState.server.id,
        },
        data: { userId: seedState.extraHuman.userId, role: "member" },
      });
    }
  });
});
