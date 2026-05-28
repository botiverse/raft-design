import { expect, test } from "@playwright/test";
import { loginViaApi } from "../../fixtures/auth";
import { waitForSeedState } from "../../fixtures/seedState";
import { dismissOwnerOnboarding } from "../../fixtures/session";

test.describe("P0 thread task status sync", () => {
  test("mark-as-done from the thread header updates the parent status badge without refresh", async ({
    page,
    request,
  }) => {
    const seedState = await waitForSeedState();
    const login = await loginViaApi(request, seedState);
    await dismissOwnerOnboarding(request, seedState, login.accessToken);

    const parentContent = `P0 thread task parent ${Date.now()}`;

    const parentResponse = await request.post(`${seedState.urls.api}/api/messages`, {
      headers: {
        Authorization: `Bearer ${login.accessToken}`,
        "X-Server-Id": seedState.server.id,
      },
      data: {
        channelId: seedState.channel.id,
        content: parentContent,
      },
    });
    expect(parentResponse.ok()).toBeTruthy();
    const parentMessage = await parentResponse.json() as { id: string };

    const convertResponse = await request.post(`${seedState.urls.api}/api/tasks/convert-message`, {
      headers: {
        Authorization: `Bearer ${login.accessToken}`,
        "X-Server-Id": seedState.server.id,
      },
      data: { messageId: parentMessage.id },
    });
    expect(convertResponse.ok()).toBeTruthy();

    await page.goto(`/s/${seedState.server.slug}/channel/${seedState.channel.id}`);

    const parentMessageCard = page.locator(`#message-${parentMessage.id}`).first();
    await parentMessageCard.scrollIntoViewIfNeeded();
    await expect(parentMessageCard).toBeVisible();
    await parentMessageCard.hover();
    await parentMessageCard.getByTitle("Reply in thread").click();

    const threadParent = page.locator('[data-testid="thread-panel-parent"]');
    await expect(threadParent).toBeVisible();

    const threadBadge = threadParent.locator('[data-testid="message-task-badge"]');
    await expect(threadBadge).toHaveAttribute("data-task-status", "todo");

    await threadBadge.click();
    await expect(page.getByTestId("message-task-status-menu")).toBeVisible();
    await page.getByTestId("message-task-status-option-done").click();

    // The bug was: thread panel's parent badge stayed stale at "todo" until a
    // hard refresh. This assertion fails before the ThreadPanel ↔ taskStore
    // subscription fix; it passes after.
    await expect(threadBadge).toHaveAttribute("data-task-status", "done");
  });
});
