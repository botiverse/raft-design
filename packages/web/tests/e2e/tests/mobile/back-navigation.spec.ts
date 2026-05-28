import { expect, test, type APIRequestContext } from "@playwright/test";
import { loginViaApi } from "../../fixtures/auth";
import { waitForSeedState, type PlaywrightSeedState } from "../../fixtures/seedState";

test.use({ viewport: { width: 390, height: 844 } });

// Seeded owner has no machines/agents, so OwnerOnboardingModal would
// otherwise intercept clicks. Mirrors the back-to-bottom spec helper.
async function dismissOwnerOnboarding(
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
      data: { setupModalReminderOptOut: true },
    },
  );
  if (!response.ok()) {
    throw new Error(
      `Failed to opt out of onboarding modal: ${response.status()} ${response.statusText()}`,
    );
  }
}

// Reproduces the "notification → deep link → back is a no-op" bug fixed in
// PR #937: cold-starting at a deep URL leaves the browser history stack
// empty, so naive history.back() did nothing. The fix lifts to a semantic
// fallback when the in-app push counter is 0.
//
// Post-rail refactor (#1176): sidebar surfaces moved from `?sidebarTab=...`
// query params to path-based routes. Agent/Human detail now falls back to
// `/members`, Machine detail falls back to `/settings`, and the chat root
// stays at `/s/<slug>`.
test.describe("mobile back from cold-start deep URL", () => {
  test("channel deep link → back → chat tab root", async ({ page, request }) => {
    const seedState = await waitForSeedState();
    const login = await loginViaApi(request, seedState);
    await dismissOwnerOnboarding(request, seedState, login.accessToken);

    const deepUrl = `/s/${seedState.server.slug}/channel/${seedState.channel.id}`;
    await page.goto(deepUrl);
    await expect(page.getByTestId("message-scroller")).toBeVisible();
    await expect(page).toHaveURL(new RegExp(`/channel/${seedState.channel.id}$`));

    await page.getByTestId("chat-mobile-back").click();
    await expect(page).toHaveURL(new RegExp(`/s/${seedState.server.slug}/?$`));
  });

  test("thread deep link → back → parent channel → back → chat tab root", async ({
    page,
    request,
  }) => {
    const seedState = await waitForSeedState();
    const login = await loginViaApi(request, seedState);
    await dismissOwnerOnboarding(request, seedState, login.accessToken);

    // Cold start with the thread overlay open via the ?thread=... query
    // param — same shape produced by a thread permalink in a notification.
    const deepUrl = `/s/${seedState.server.slug}/channel/${seedState.channel.id}?thread=${seedState.channel.id}:${seedState.messages.focusMessageId}`;
    await page.goto(deepUrl);
    await expect(page.getByTestId("thread-mobile-back")).toBeVisible();

    // First back: thread → parent channel (clears ?thread=).
    await page.getByTestId("thread-mobile-back").click();
    await expect(page).toHaveURL(new RegExp(`/channel/${seedState.channel.id}$`));
    await expect(page.getByTestId("message-scroller")).toBeVisible();

    // Second back: channel → chat tab root. The first hop was a REPLACE so
    // depth is still 0; without the REPLACE-as-no-op rule we'd get stuck
    // here (history.back would unwind into the thread URL).
    await page.getByTestId("chat-mobile-back").click();
    await expect(page).toHaveURL(new RegExp(`/s/${seedState.server.slug}/?$`));
  });

  test("tasks thread deep link → back closes thread and preserves task filters", async ({
    page,
    request,
  }) => {
    const seedState = await waitForSeedState();
    const login = await loginViaApi(request, seedState);
    await dismissOwnerOnboarding(request, seedState, login.accessToken);

    const creator = `user:${seedState.extraHuman.userId}`;
    const deepUrl =
      `/s/${seedState.server.slug}/tasks?creator=${encodeURIComponent(creator)}` +
      `&thread=${seedState.channel.id}:${seedState.messages.focusMessageId}`;
    await page.goto(deepUrl);
    await expect(page.getByTestId("thread-mobile-back")).toBeVisible();

    await page.getByTestId("thread-mobile-back").click();

    await expect(page).toHaveURL(
      new RegExp(`/s/${seedState.server.slug}/tasks\\?creator=${encodeURIComponent(creator)}$`),
    );
    await expect(page.getByRole("heading", { name: "Tasks" })).toBeVisible();
    await expect(page.getByTestId("thread-mobile-back")).toHaveCount(0);
  });

  // Agent / Human detail panels always fall back to the Members rail
  // (post-rail refactor). The old `?sidebarTab=members` context-preservation
  // branch went away with the path-based routes.
  test("agent detail deep link → back → members rail", async ({ page, request }) => {
    const seedState = await waitForSeedState();
    const login = await loginViaApi(request, seedState);
    await dismissOwnerOnboarding(request, seedState, login.accessToken);

    const deepUrl = `/s/${seedState.server.slug}/agent/${seedState.agent.id}`;
    await page.goto(deepUrl);
    await expect(page.getByTestId("agent-mobile-back")).toBeVisible();

    await page.getByTestId("agent-mobile-back").click();
    await expect(page).toHaveURL(new RegExp(`/s/${seedState.server.slug}/members$`));
  });

  test("human detail deep link → back → members rail", async ({ page, request }) => {
    const seedState = await waitForSeedState();
    const login = await loginViaApi(request, seedState);
    await dismissOwnerOnboarding(request, seedState, login.accessToken);

    const deepUrl = `/s/${seedState.server.slug}/human/${seedState.extraHuman.userId}`;
    await page.goto(deepUrl);
    await expect(page.getByTestId("human-mobile-back")).toBeVisible();

    await page.getByTestId("human-mobile-back").click();
    await expect(page).toHaveURL(new RegExp(`/s/${seedState.server.slug}/members$`));
  });

  // Machine detail falls back to the Settings rail — the Computers list
  // now lives inside server settings.
  test("machine detail deep link → back → settings rail", async ({ page, request }) => {
    const seedState = await waitForSeedState();
    const login = await loginViaApi(request, seedState);
    await dismissOwnerOnboarding(request, seedState, login.accessToken);

    const deepUrl = `/s/${seedState.server.slug}/machine/${seedState.machine.id}`;
    await page.goto(deepUrl);
    await expect(page.getByTestId("machine-mobile-back")).toBeVisible();

    await page.getByTestId("machine-mobile-back").click();
    await expect(page).toHaveURL(new RegExp(`/s/${seedState.server.slug}/settings$`));
  });

  // Profile-as-overlay (`?profile=...`) cold-start: previously the back
  // arrow fell back to /members because useMobileBack's hardcoded fallback
  // didn't know it was an overlay. Result: tapping back from a profile
  // permalink jumped past the underlying channel straight to the Members
  // rail, leaving the chat-tab stack with the channel still on top so
  // tapping Home re-opened the channel — an inescapable loop.
  // (#proj-mobile:b1c622e5 stdrc 2026-05-08).
  // Fix: detail panels rendered as overlays pass `onClose` (closeProfile)
  // to useMobileBack as the cold-start fallback so the back arrow closes
  // the overlay and lands on the underlying channel/DM.
  test("profile overlay deep link → back → underlying channel (not /members)", async ({
    page,
    request,
  }) => {
    const seedState = await waitForSeedState();
    const login = await loginViaApi(request, seedState);
    await dismissOwnerOnboarding(request, seedState, login.accessToken);

    const deepUrl = `/s/${seedState.server.slug}/channel/${seedState.channel.id}?profile=human:${seedState.extraHuman.userId}`;
    await page.goto(deepUrl);
    await expect(page.getByTestId("human-mobile-back")).toBeVisible();

    await page.getByTestId("human-mobile-back").click();
    // Land on the underlying channel, not on the Members rail.
    await expect(page).toHaveURL(
      new RegExp(`/s/${seedState.server.slug}/channel/${seedState.channel.id}$`),
    );
    // Profile overlay should be gone.
    await expect(page.getByTestId("profile-panel")).toHaveCount(0);
  });

  test("agent profile overlay deep link → back → underlying channel (not /members)", async ({
    page,
    request,
  }) => {
    const seedState = await waitForSeedState();
    const login = await loginViaApi(request, seedState);
    await dismissOwnerOnboarding(request, seedState, login.accessToken);

    const deepUrl = `/s/${seedState.server.slug}/channel/${seedState.channel.id}?profile=agent:${seedState.agent.id}`;
    await page.goto(deepUrl);
    await expect(page.getByTestId("agent-mobile-back")).toBeVisible();

    await page.getByTestId("agent-mobile-back").click();
    await expect(page).toHaveURL(
      new RegExp(`/s/${seedState.server.slug}/channel/${seedState.channel.id}$`),
    );
    await expect(page.getByTestId("profile-panel")).toHaveCount(0);
  });

  // Standalone /agent/<id> route still falls back to /members — that's
  // the correct semantic parent for a profile that was navigated to by
  // path (e.g. clicking an agent from the Members rail or sidebar drawer),
  // not by overlay. Guards against regressing the cold-start permalink
  // case while preserving the standalone-route behavior covered above.
  test("agent route + profile overlay: in-app back through both", async ({ page, request }) => {
    const seedState = await waitForSeedState();
    const login = await loginViaApi(request, seedState);
    await dismissOwnerOnboarding(request, seedState, login.accessToken);

    // 1. Land on Home.
    await page.goto(`/s/${seedState.server.slug}`);
    await expect(page).toHaveURL(new RegExp(`/s/${seedState.server.slug}/?$`));

    // 2. Click into the channel (in-app push).
    // Use direct nav to keep the test stable across sidebar UI churn —
    // what matters is that we have an in-app push depth before opening
    // the profile overlay.
    await page.goto(`/s/${seedState.server.slug}/channel/${seedState.channel.id}`);
    await expect(page).toHaveURL(
      new RegExp(`/s/${seedState.server.slug}/channel/${seedState.channel.id}$`),
    );

    // 3. Open profile overlay over the channel (search-only push).
    await page.goto(
      `/s/${seedState.server.slug}/channel/${seedState.channel.id}?profile=human:${seedState.extraHuman.userId}`,
    );
    await expect(page.getByTestId("human-mobile-back")).toBeVisible();

    // 4. Back from profile → underlying channel.
    await page.getByTestId("human-mobile-back").click();
    await expect(page).toHaveURL(
      new RegExp(`/s/${seedState.server.slug}/channel/${seedState.channel.id}$`),
    );

    // 5. Back from channel → Home (NOT /members).
    await page.getByTestId("chat-mobile-back").click();
    await expect(page).toHaveURL(new RegExp(`/s/${seedState.server.slug}/?$`));
  });
});
