import { expect, test } from "@playwright/test";
import { loginViaApi } from "../../fixtures/auth";
import { waitForSeedState } from "../../fixtures/seedState";
import { dismissOwnerOnboarding } from "../../fixtures/session";

// Regression test for #67 (cindyz f84d85ec): a thread with one reply was
// rendering the reply pushed against the very bottom of the panel, leaving a
// large empty gap below the "Beginning of replies / 1 reply" divider. The
// MessageTimeline primitive previously applied a flex-grow spacer above the
// messages unconditionally; the spacer is correct for channels (push sparse
// content flush to the input bar) but wrong for threads, where the divider
// sits at the top and replies must stack downward from it.
//
// This test pins the contract by measuring that the first reply's TOP edge is
// near the TOP of the thread scroller — not the bottom.

test.describe("thread sparse-anchor", () => {
  test("single reply sits near the top of the thread scroller, not the bottom", async ({
    page,
    request,
  }) => {
    const seedState = await waitForSeedState();
    const login = await loginViaApi(request, seedState);
    await dismissOwnerOnboarding(request, seedState, login.accessToken);

    const parentContent = `thread sparse parent ${Date.now()}`;
    const replyContent = `thread sparse reply ${Date.now()}`;

    const parentResponse = await request.post(`${seedState.urls.api}/api/messages`, {
      headers: {
        Authorization: `Bearer ${login.accessToken}`,
        "X-Server-Id": seedState.server.id,
      },
      data: { channelId: seedState.channel.id, content: parentContent },
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
        data: { parentMessageId: parentMessage.id, content: replyContent },
      },
    );
    expect(threadResponse.ok()).toBeTruthy();

    await page.goto(`/s/${seedState.server.slug}/channel/${seedState.channel.id}`);

    const parentMessageCard = page.locator(`#message-${parentMessage.id}`);
    await parentMessageCard.scrollIntoViewIfNeeded();
    await parentMessageCard.hover();
    await parentMessageCard.getByTitle("Reply in thread").click();

    const threadScroller = page.getByTestId("thread-message-scroller");
    await expect(threadScroller).toBeVisible();
    await expect(threadScroller.getByText(replyContent)).toBeVisible();

    // Measure the gap between the reply's top edge and the scroller's top
    // edge. With sparseAnchor="top" (thread default), the reply should sit
    // right under the "Beginning of replies" divider, not flush at the
    // bottom. A value near the divider height indicates correct placement;
    // a value near scroller.height would indicate the broken bottom-anchor.
    await expect
      .poll(
        async () => {
          return threadScroller.evaluate((el) => {
            const items = Array.from(el.querySelectorAll("[data-index]"));
            const first = items[0] as HTMLElement | undefined;
            if (!first) return null;
            const scrollerRect = el.getBoundingClientRect();
            const firstRect = first.getBoundingClientRect();
            return {
              topGap: Math.round(firstRect.top - scrollerRect.top),
              scrollerHeight: Math.round(scrollerRect.height),
            };
          });
        },
        { timeout: 5000 },
      )
      .toMatchObject({ topGap: expect.any(Number) });

    const measurement = await threadScroller.evaluate((el) => {
      const items = Array.from(el.querySelectorAll("[data-index]"));
      const first = items[0] as HTMLElement;
      const scrollerRect = el.getBoundingClientRect();
      const firstRect = first.getBoundingClientRect();
      return {
        topGap: Math.round(firstRect.top - scrollerRect.top),
        scrollerHeight: Math.round(scrollerRect.height),
      };
    });

    // The reply should sit in the upper portion of the scroller. A loose
    // bound (< 50% of scroller height) is enough to catch the regression
    // where the reply was floating right above the input bar.
    expect(measurement.topGap).toBeLessThan(measurement.scrollerHeight / 2);
  });
});
