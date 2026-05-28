import { expect, test, type APIRequestContext, type Page } from "@playwright/test";
import { loginViaApi } from "../../fixtures/auth";
import { waitForSeedState, type PlaywrightSeedState } from "../../fixtures/seedState";
import { dismissOwnerOnboarding, newAuthenticatedContext } from "../../fixtures/session";

type LoginResult = {
  accessToken: string;
  refreshToken: string;
};

async function postChannelMessage(
  request: APIRequestContext,
  seedState: PlaywrightSeedState,
  login: LoginResult,
  content: string,
) {
  const response = await request.post(`${seedState.urls.api}/api/messages`, {
    headers: {
      Authorization: `Bearer ${login.accessToken}`,
      "X-Server-Id": seedState.server.id,
    },
    data: {
      channelId: seedState.channel.id,
      content,
    },
  });
  expect(
    response.ok(),
    `postChannelMessage failed with ${response.status()} ${await response.text()}`,
  ).toBeTruthy();
  return response.json() as Promise<{ id: string }>;
}

async function postThreadReply(
  request: APIRequestContext,
  seedState: PlaywrightSeedState,
  login: LoginResult,
  parentMessageId: string,
  content: string,
) {
  const response = await request.post(
    `${seedState.urls.api}/api/channels/${seedState.channel.id}/threads`,
    {
      headers: {
        Authorization: `Bearer ${login.accessToken}`,
        "X-Server-Id": seedState.server.id,
      },
      data: { parentMessageId, content },
    },
  );
  expect(response.ok()).toBeTruthy();
}

async function readChannelMetrics(page: Page) {
  return page.getByTestId("message-scroller").evaluate((el) => ({
    scrollTop: el.scrollTop,
    scrollHeight: el.scrollHeight,
    clientHeight: el.clientHeight,
    bottomGap: Math.max(0, el.scrollHeight - el.scrollTop - el.clientHeight),
    itemCount: el.querySelectorAll("[data-message-id]").length,
    loadingText: el.textContent?.includes("Loading") ?? false,
  }));
}

async function captureChannelAnchor(page: Page) {
  return page.getByTestId("message-scroller").evaluate((el) => {
    const scrollerRect = el.getBoundingClientRect();
    const items = Array.from(el.querySelectorAll<HTMLElement>("[data-message-id]"));
    for (const item of items) {
      const rect = item.getBoundingClientRect();
      if (rect.bottom <= scrollerRect.top + 1) continue;
      return {
        messageId: item.dataset.messageId ?? "",
        visualTop: rect.top - scrollerRect.top,
      };
    }
    return null;
  });
}

async function measureChannelAnchorDrift(
  page: Page,
  before: { messageId: string; visualTop: number },
) {
  const drift = await page.getByTestId("message-scroller").evaluate(
    (el, { messageId, prevVisualTop }) => {
      const item = el.querySelector<HTMLElement>(`[data-message-id="${messageId}"]`);
      if (!item) return null;
      const scrollerRect = el.getBoundingClientRect();
      const nextVisualTop = item.getBoundingClientRect().top - scrollerRect.top;
      return Math.abs(nextVisualTop - prevVisualTop);
    },
    { messageId: before.messageId, prevVisualTop: before.visualTop },
  );
  return drift ?? Number.POSITIVE_INFINITY;
}

test.describe("thread open preserves channel list", () => {
  test("clicking N replies opens thread without reloading or jumping the channel scroller", async ({
    browser,
    request,
  }) => {
    const seedState = await waitForSeedState();
    const login = await loginViaApi(request, seedState);
    await dismissOwnerOnboarding(request, seedState, login.accessToken);

    const runId = Date.now();
    const fillerContents = Array.from({ length: 8 }, (_, index) =>
      `thread open preserve filler ${runId} ${index.toString().padStart(2, "0")} `.repeat(18),
    );
    for (const content of fillerContents) {
      await postChannelMessage(request, seedState, login, content);
    }
    const parentContent = `thread open preserve parent ${runId}`;
    const replyContent = `thread open preserve reply ${runId}`;
    const parentMessage = await postChannelMessage(request, seedState, login, parentContent);
    await postThreadReply(request, seedState, login, parentMessage.id, replyContent);
    for (let i = 0; i < 5; i += 1) {
      await postChannelMessage(
        request,
        seedState,
        login,
        `thread open preserve tail ${runId} ${i.toString().padStart(2, "0")} `.repeat(14),
      );
    }

    const context = await newAuthenticatedContext(browser, {
      accessToken: login.accessToken,
      refreshToken: login.refreshToken,
      serverSlug: seedState.server.slug,
    });
    const page = await context.newPage();
    const mainChannelFetches: string[] = [];
    page.on("request", (req) => {
      const url = req.url();
      if (req.method() === "GET" && url.includes(`/messages/channel/${seedState.channel.id}`)) {
        mainChannelFetches.push(url);
      }
    });

    try {
      await page.goto(`/s/${seedState.server.slug}/channel/${seedState.channel.id}`);
      await expect(page.getByTestId("message-scroller")).toBeVisible();
      await expect(page.getByText(parentContent)).toBeVisible();

      const parentMessageCard = page.locator(`#message-${parentMessage.id}`).first();
      await parentMessageCard.scrollIntoViewIfNeeded();
      await expect(parentMessageCard).toBeVisible();

      const anchorBefore = await captureChannelAnchor(page);
      expect(anchorBefore, "channel should have a visible anchor before opening thread").not.toBeNull();
      const metricsBefore = await readChannelMetrics(page);
      const fetchCountBefore = mainChannelFetches.length;

      await parentMessageCard.getByTestId("message-thread-replies-badge").click();
      await expect(page.getByTestId("thread-message-scroller")).toBeVisible();
      await expect(page.getByTestId("thread-message-scroller").getByText(replyContent)).toBeVisible();
      await page.waitForTimeout(500);

      const metricsAfter = await readChannelMetrics(page);
      const drift = await measureChannelAnchorDrift(page, anchorBefore!);
      const fetchesAfterOpen = mainChannelFetches.slice(fetchCountBefore);
      console.log(
        `[thread-open-preserve] drift=${drift.toFixed(1)}px ` +
          `bottomGap ${metricsBefore.bottomGap.toFixed(0)}->${metricsAfter.bottomGap.toFixed(0)} ` +
          `mainFetches=${fetchesAfterOpen.length}`,
      );

      expect(fetchesAfterOpen, "opening a thread must not refetch the parent channel window").toHaveLength(0);
      expect(metricsAfter.loadingText, "parent channel scroller must not show a loading state").toBe(false);
      expect(drift, "parent channel anchor should survive thread panel open").toBeLessThan(120);
    } finally {
      await context.close();
    }
  });
});
