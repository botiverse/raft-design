import { expect, test } from "@playwright/test";
import { loginViaApi, loginViaApiWithCredentials } from "../../fixtures/auth";
import { waitForSeedState } from "../../fixtures/seedState";
import {
  dismissOwnerOnboarding,
  newAuthenticatedContext,
} from "../../fixtures/session";

// Pins the user-visible side of the Agent visibility ACL introduced in PR #1394:
// non-creator server members must only see the Profile tab on the Agent detail
// panel. This complements the helper unit tests in agentVisibility.test.ts and
// the API contract tests in agents.api.test.ts by asserting the actually
// rendered DOM for both audiences.
//
// Seed setup (see seedPlaywrightScenario.ts):
// - playwright-owner = server owner → manager → sees all private surfaces
// - playwright-extra = server member, NOT the creator of any agent → must only
//   see the Profile tab. The seed agent is created with creatorType=null, so
//   no human is the creator and only managers (owner/admin) qualify for
//   private-surface access — exactly the non-creator-member case we want to
//   pin.

const PRIVATE_TAB_LABELS = ["Agent DMs", "Reminders", "Workspace", "Activity"];

test.describe("Agent detail visibility (PR #1394)", () => {
  test("server owner / agent manager sees all five tabs and the Skills section", async ({
    page,
    request,
  }) => {
    const seedState = await waitForSeedState();
    const ownerLogin = await loginViaApi(request, seedState);
    await dismissOwnerOnboarding(request, seedState, ownerLogin.accessToken);

    // The AgentSkills component fires GET /api/agents/:id/skills the moment it
    // mounts. Intercepting the request lets us pin "Skills section rendered"
    // in a way that does not depend on whether the daemon is connected (the
    // dev/test harness may surface a loading / error / loaded state — all
    // three count as "the section was rendered").
    const skillsRequest = page.waitForRequest((req) =>
      req.url().includes(`/api/agents/${seedState.agent.id}/skills`),
    );

    await page.goto(`/s/${seedState.server.slug}/agent/${seedState.agent.id}`);

    // Profile tab plus all four private tabs render for a manager.
    await expect(page.getByRole("button", { name: "Profile" })).toBeVisible();
    for (const label of PRIVATE_TAB_LABELS) {
      await expect(page.getByRole("button", { name: label })).toBeVisible();
    }

    // Skills section mounted → its API request was issued.
    await skillsRequest;
  });

  test("non-creator member only sees the Profile tab and no Skills section", async ({
    browser,
    request,
  }) => {
    const seedState = await waitForSeedState();
    const memberLogin = await loginViaApiWithCredentials(request, seedState, {
      email: seedState.extraHuman.email,
      password: seedState.extraHuman.password,
    });

    const memberContext = await newAuthenticatedContext(browser, {
      accessToken: memberLogin.accessToken,
      refreshToken: memberLogin.refreshToken,
      serverSlug: seedState.server.slug,
    });
    const memberPage = await memberContext.newPage();

    // Track whether the page ever issues the skills request — for
    // non-creators the AgentSkills component must not mount, and therefore
    // must never fire the GET. We attach the listener before navigation so
    // a request fired during initial render is captured.
    let skillsRequestSeen = false;
    memberPage.on("request", (req) => {
      if (req.url().includes(`/api/agents/${seedState.agent.id}/skills`)) {
        skillsRequestSeen = true;
      }
    });

    try {
      await memberPage.goto(
        `/s/${seedState.server.slug}/agent/${seedState.agent.id}`,
      );

      // Profile tab is visible.
      await expect(
        memberPage.getByRole("button", { name: "Profile" }),
      ).toBeVisible();

      // None of the private tabs render in the tab bar for a non-creator
      // member. We assert each label has zero matches inside the tab bar
      // rather than .not.toBeVisible() so a hidden-but-rendered tab would
      // still fail the assertion.
      for (const label of PRIVATE_TAB_LABELS) {
        await expect(
          memberPage.getByRole("button", { name: label }),
        ).toHaveCount(0);
      }

      // Wait long enough for any deferred mount to fire its initial fetch,
      // then assert the skills endpoint was never hit (i.e. the AgentSkills
      // component never mounted).
      await memberPage.waitForLoadState("networkidle");
      expect(skillsRequestSeen).toBe(false);
    } finally {
      await memberContext.close();
    }
  });

  test("non-creator member loading ?agentTab=workspace falls back to Profile without leaking Workspace UI", async ({
    browser,
    request,
  }) => {
    const seedState = await waitForSeedState();
    const memberLogin = await loginViaApiWithCredentials(request, seedState, {
      email: seedState.extraHuman.email,
      password: seedState.extraHuman.password,
    });

    const memberContext = await newAuthenticatedContext(browser, {
      accessToken: memberLogin.accessToken,
      refreshToken: memberLogin.refreshToken,
      serverSlug: seedState.server.slug,
    });
    const memberPage = await memberContext.newPage();

    try {
      await memberPage.goto(
        `/s/${seedState.server.slug}/agent/${seedState.agent.id}?agentTab=workspace`,
      );

      // The page must still render with only the Profile tab — the visibility
      // filter strips workspace from the visible tab list before the active
      // tab is resolved, so the deep-link falls back to Profile.
      await expect(
        memberPage.getByRole("button", { name: "Profile" }),
      ).toBeVisible();
      await expect(
        memberPage.getByRole("button", { name: "Workspace" }),
      ).toHaveCount(0);

      // No 403 / error surface, no Workspace tab content (e.g. the file tree
      // header is not present in the DOM).
      await expect(memberPage.getByText(/Failed to/i)).toHaveCount(0);
      await expect(memberPage.getByText(/Forbidden/i)).toHaveCount(0);
    } finally {
      await memberContext.close();
    }
  });
});
