import { expect, test } from "@playwright/test";
import { loginViaApi } from "../../fixtures/auth";
import { waitForSeedState } from "../../fixtures/seedState";
import { dismissOwnerOnboarding } from "../../fixtures/session";

test.describe("thread view-in-channel profile close", () => {
  test("closing a profile after View in channel does not pollute thread replies with channel context", async ({
    page,
    request,
  }) => {
    const seedState = await waitForSeedState();
    const login = await loginViaApi(request, seedState);
    await dismissOwnerOnboarding(request, seedState, login.accessToken);

    const parentContent = `Thread profile parent ${Date.now()}`;
    const firstReply = `Thread profile first reply ${Date.now()}`;
    const channelFollowup = `Channel follow-up after view-in-channel ${Date.now()}`;

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
    const parentMessage = (await parentResponse.json()) as { id: string };

    const threadResponse = await request.post(
      `${seedState.urls.api}/api/channels/${seedState.channel.id}/threads`,
      {
        headers: {
          Authorization: `Bearer ${login.accessToken}`,
          "X-Server-Id": seedState.server.id,
        },
        data: {
          parentMessageId: parentMessage.id,
          content: firstReply,
        },
      },
    );
    expect(threadResponse.ok()).toBeTruthy();

    const followResponse = await request.post(`${seedState.urls.api}/api/channels/threads/follow`, {
      headers: {
        Authorization: `Bearer ${login.accessToken}`,
        "X-Server-Id": seedState.server.id,
      },
      data: { parentMessageId: parentMessage.id },
    });
    expect(followResponse.ok()).toBeTruthy();

    const channelFollowupResponse = await request.post(`${seedState.urls.api}/api/messages`, {
      headers: {
        Authorization: `Bearer ${login.accessToken}`,
        "X-Server-Id": seedState.server.id,
      },
      data: {
        channelId: seedState.channel.id,
        content: channelFollowup,
      },
    });
    expect(channelFollowupResponse.ok()).toBeTruthy();

    await page.goto(`/s/${seedState.server.slug}/threads`);

    const threadCard = page.getByText(firstReply).first();
    await expect(threadCard).toBeVisible();
    await threadCard.click();

    const threadPanel = page.getByTestId("thread-message-scroller");
    await expect(threadPanel).toBeVisible();
    await expect(threadPanel.getByText(firstReply)).toBeVisible();
    await expect(threadPanel.getByText(channelFollowup)).toHaveCount(0);

    await page.getByTitle("View in channel").click();
    await expect(page).toHaveURL(new RegExp(`msg=${parentMessage.id}`));
    await expect(page.getByTestId("thread-message-scroller")).toHaveCount(0);

    const parentMessageCard = page.locator(`#message-${parentMessage.id}`).first();
    await parentMessageCard.scrollIntoViewIfNeeded();
    await expect(parentMessageCard).toBeVisible();
    await parentMessageCard.hover();
    await parentMessageCard.getByTitle("Reply in thread").click();

    const threadParent = page.locator('[data-testid="thread-panel-parent"]');
    await expect(threadParent).toBeVisible();
    await page.getByTestId("thread-parent-avatar").click();

    const profilePanel = page.getByTestId("profile-panel");
    await expect(profilePanel).toBeVisible();
    await profilePanel.getByTitle("Close").click();

    await expect(threadPanel.getByText(firstReply)).toBeVisible();
    await expect(threadPanel.getByText(channelFollowup)).toHaveCount(0);
  });
});
