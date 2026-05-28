import { expect, test } from "@playwright/test";
import { loginViaApi } from "../../fixtures/auth";
import { waitForSeedState } from "../../fixtures/seedState";
import { dismissOwnerOnboarding, newAuthenticatedContext } from "../../fixtures/session";

test.describe("P0 thread reopen consistency", () => {
  test("replies stay in thread and reopening preserves the same thread history", async ({
    browser,
    request,
  }) => {
    const seedState = await waitForSeedState();
    const login = await loginViaApi(request, seedState);
    await dismissOwnerOnboarding(request, seedState, login.accessToken);

    const context = await newAuthenticatedContext(browser, {
      accessToken: login.accessToken,
      refreshToken: login.refreshToken,
      serverSlug: seedState.server.slug,
    });
    const threadPage = await context.newPage();

    try {
      const parentContent = `P0 thread parent ${Date.now()}`;
      const firstReply = `P0 thread first reply ${Date.now()}`;
      const secondReply = `P0 thread second reply ${Date.now()}`;

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

      await threadPage.goto(`/s/${seedState.server.slug}/channel/${seedState.channel.id}`);
      const parentMessageCard = threadPage.locator(`#message-${parentMessage.id}`).first();
      await parentMessageCard.scrollIntoViewIfNeeded();
      await expect(parentMessageCard).toBeVisible();
      await parentMessageCard.hover();
      await parentMessageCard.getByTitle("Reply in thread").click();

      const threadScroller = threadPage.getByTestId("thread-message-scroller");
      const threadComposer = threadPage.getByPlaceholder("Message thread");

      await expect(threadPage.getByText("Thread").first()).toBeVisible();
      await expect(threadScroller.getByText(firstReply)).toBeVisible();
      await expect(threadPage.getByTestId("message-scroller").getByText(firstReply)).toHaveCount(0);

      await threadPage.getByTitle("Close thread").click();
      await expect(threadScroller).toHaveCount(0);
      await expect(threadComposer).toHaveCount(0);

      await parentMessageCard.hover();
      await parentMessageCard.getByTitle("Reply in thread").click();
      await expect(threadScroller.getByText(firstReply)).toBeVisible();

      await threadComposer.fill(secondReply);
      await threadComposer.press("Enter");

      await expect(threadScroller.getByText(secondReply)).toBeVisible();
      await expect(threadPage.getByTestId("message-scroller").getByText(secondReply)).toHaveCount(0);
    } finally {
      await context.close();
    }
  });
});
