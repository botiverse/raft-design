import { expect, test, type APIRequestContext, type Page } from "@playwright/test";
import { loginViaApi } from "../../fixtures/auth";
import { waitForSeedState, type PlaywrightSeedState } from "../../fixtures/seedState";
import { dismissOwnerOnboarding, loginWithCredentials } from "../../fixtures/session";

function headers(seedState: PlaywrightSeedState, accessToken: string) {
  return {
    Authorization: `Bearer ${accessToken}`,
    "X-Server-Id": seedState.server.id,
  };
}

async function createChannel(
  request: APIRequestContext,
  seedState: PlaywrightSeedState,
  accessToken: string,
  name: string,
): Promise<{ id: string; name: string }> {
  const response = await request.post(`${seedState.urls.api}/api/channels`, {
    headers: headers(seedState, accessToken),
    data: { name },
  });
  expect(response.ok()).toBeTruthy();
  return response.json() as Promise<{ id: string; name: string }>;
}

async function createMessage(
  request: APIRequestContext,
  seedState: PlaywrightSeedState,
  accessToken: string,
  channelId: string,
  content: string,
): Promise<{ id: string }> {
  const response = await request.post(`${seedState.urls.api}/api/messages`, {
    headers: headers(seedState, accessToken),
    data: { channelId, content },
  });
  expect(response.ok()).toBeTruthy();
  return response.json() as Promise<{ id: string }>;
}

async function addChannelHuman(
  request: APIRequestContext,
  seedState: PlaywrightSeedState,
  accessToken: string,
  channelId: string,
  userId: string,
) {
  const response = await request.post(`${seedState.urls.api}/api/channels/${channelId}/members`, {
    headers: headers(seedState, accessToken),
    data: { userId },
  });
  expect(response.ok()).toBeTruthy();
}

async function loadNextInboxPage(page: Page) {
  const rows = page.getByTestId("inbox-row");
  await expect(rows.first()).toBeVisible();
  const before = await rows.count();
  await page.getByTestId("inbox-scroll").evaluate((node) => {
    node.scrollTop = node.scrollHeight;
    node.dispatchEvent(new Event("scroll", { bubbles: true }));
  });
  await expect.poll(async () => page.getByTestId("inbox-row").count()).toBeGreaterThan(before);
}

test.describe("Inbox contract", () => {
  test("shows active chats, keeps unread as a filter, and lazy-loads by scroll", async ({ page, request }) => {
    const seedState = await waitForSeedState();
    const ownerLogin = await loginViaApi(request, seedState);
    await dismissOwnerOnboarding(request, seedState, ownerLogin.accessToken);
    const runId = Date.now().toString(36);

    const emptyChannel = await createChannel(
      request,
      seedState,
      ownerLogin.accessToken,
      `inbox-empty-${runId}`,
    );

    const systemOnlyChannel = await createChannel(
      request,
      seedState,
      ownerLogin.accessToken,
      `inbox-system-${runId}`,
    );
    const archive = await request.post(`${seedState.urls.api}/api/channels/${systemOnlyChannel.id}/archive`, {
      headers: headers(seedState, ownerLogin.accessToken),
    });
    expect(archive.ok()).toBeTruthy();
    const unarchive = await request.post(`${seedState.urls.api}/api/channels/${systemOnlyChannel.id}/unarchive`, {
      headers: headers(seedState, ownerLogin.accessToken),
    });
    expect(unarchive.ok()).toBeTruthy();

    await expect.poll(async () => {
      const response = await request.get(`${seedState.urls.api}/api/channels/inbox`, {
        headers: headers(seedState, ownerLogin.accessToken),
      });
      const body = await response.json() as { items: Array<{ channelId?: string; lastMessagePreview?: string }> };
      return body.items.some((item) =>
        item.channelId === systemOnlyChannel.id
        && (item.lastMessagePreview ?? "").includes("unarchived this channel")
      );
    }).toBeTruthy();

    const activeChannel = await createChannel(
      request,
      seedState,
      ownerLogin.accessToken,
      `inbox-active-${runId}`,
    );
    const activeFirstUnreadMessage = `inbox active first unread ${runId}`;
    await createMessage(request, seedState, ownerLogin.accessToken, activeChannel.id, activeFirstUnreadMessage);
    const activeLatestMessage = `inbox active latest message ${runId}`;
    const activeLatestMessageRecord = await createMessage(request, seedState, ownerLogin.accessToken, activeChannel.id, activeLatestMessage);

    const dmResponse = await request.post(`${seedState.urls.api}/api/channels/dm`, {
      headers: headers(seedState, ownerLogin.accessToken),
      data: { userId: seedState.extraHuman.userId },
    });
    expect(dmResponse.ok()).toBeTruthy();
    const dm = await dmResponse.json() as { id: string };
    const dmMessage = `inbox dm message ${runId}`;
    const dmMessageRecord = await createMessage(request, seedState, ownerLogin.accessToken, dm.id, dmMessage);

    const participatedParent = `inbox participated thread parent ${runId}`;
    const participatedReply = `inbox participated thread reply ${runId}`;
    const participatedParentMessage = await createMessage(
      request,
      seedState,
      ownerLogin.accessToken,
      seedState.channel.id,
      participatedParent,
    );
    const followResponse = await request.post(`${seedState.urls.api}/api/channels/threads/follow`, {
      headers: headers(seedState, ownerLogin.accessToken),
      data: { parentMessageId: participatedParentMessage.id },
    });
    expect(followResponse.ok()).toBeTruthy();
    const participatedReplyResponse = await request.post(`${seedState.urls.api}/api/channels/${seedState.channel.id}/threads`, {
      headers: headers(seedState, ownerLogin.accessToken),
      data: { parentMessageId: participatedParentMessage.id, content: participatedReply },
    });
    expect(participatedReplyResponse.ok()).toBeTruthy();

    const extraHumanLogin = await loginWithCredentials(
      request,
      seedState.urls.api,
      seedState.extraHuman.email,
      seedState.extraHuman.password,
    );
    const nonParticipantParent = `inbox non participant thread parent ${runId}`;
    const nonParticipantParentMessage = await createMessage(
      request,
      seedState,
      extraHumanLogin.accessToken,
      seedState.channel.id,
      nonParticipantParent,
    );
    const hiddenReplyResponse = await request.post(`${seedState.urls.api}/api/channels/${seedState.channel.id}/threads`, {
      headers: headers(seedState, extraHumanLogin.accessToken),
      data: { parentMessageId: nonParticipantParentMessage.id, content: `hidden reply ${runId}` },
    });
    expect(hiddenReplyResponse.ok()).toBeTruthy();
    await createMessage(
      request,
      seedState,
      ownerLogin.accessToken,
      seedState.channel.id,
      `inbox cover parent channel latest ${runId}`,
    );

    for (let idx = 0; idx < 35; idx += 1) {
      const parent = await createMessage(
        request,
        seedState,
        ownerLogin.accessToken,
        seedState.channel.id,
        `inbox lazy thread parent ${runId} ${idx.toString().padStart(2, "0")}`,
      );
      const lazyFollow = await request.post(`${seedState.urls.api}/api/channels/threads/follow`, {
        headers: headers(seedState, ownerLogin.accessToken),
        data: { parentMessageId: parent.id },
      });
      expect(lazyFollow.ok()).toBeTruthy();
      const lazyReply = await request.post(`${seedState.urls.api}/api/channels/${seedState.channel.id}/threads`, {
        headers: headers(seedState, ownerLogin.accessToken),
        data: {
          parentMessageId: parent.id,
          content: `inbox lazy thread reply ${runId} ${idx.toString().padStart(2, "0")}`,
        },
      });
      expect(lazyReply.ok()).toBeTruthy();
    }

    await page.goto(`/s/${seedState.server.slug}/inbox`);
    await expect(page.getByRole("heading", { name: "Activity" })).toBeVisible();
    await expect(page.getByTestId("inbox-filter-all")).toBeVisible();
    await expect(page.getByTestId("inbox-filter-unread")).toBeVisible();
    await expect(page.getByRole("button", { name: /Load More/i })).toHaveCount(0);

    const rows = page.getByTestId("inbox-row");
    await expect(rows).toHaveCount(30);
    await loadNextInboxPage(page);
    const loadedRowCount = await page.getByTestId("inbox-row").count();
    const savedScrollTop = await page.getByTestId("inbox-scroll").evaluate((node) => node.scrollTop);
    expect(savedScrollTop).toBeGreaterThan(0);

    await rows.filter({ hasText: activeLatestMessage }).click();
    await expect(page).toHaveURL(new RegExp(`/s/${seedState.server.slug}/channel/${activeChannel.id}\\?msg=${activeLatestMessageRecord.id}$`));
    await expect(page.getByTestId("message-scroller")).toBeVisible();

    await page.goBack();
    await expect(page).toHaveURL(new RegExp(`/s/${seedState.server.slug}/inbox$`));
    await expect.poll(async () => page.getByTestId("inbox-row").count()).toBe(loadedRowCount);
    await expect.poll(async () => page.getByTestId("inbox-scroll").evaluate((node) => node.scrollTop)).toBeGreaterThan(0);

    await expect(rows.filter({ hasText: emptyChannel.name })).toHaveCount(0);
    await expect(rows.filter({ hasText: "unarchived this channel" })).toBeVisible();
    await expect(rows.filter({ hasText: activeLatestMessage })).toBeVisible();
    await expect(rows.filter({ hasText: dmMessage })).toBeVisible();
    const participatedRow = rows.filter({ hasText: participatedReply });
    await expect(participatedRow).toBeVisible();
    await expect(participatedRow).toContainText(participatedParent);
    await expect(rows.filter({ hasText: nonParticipantParent })).toHaveCount(0);

    await page.goto(`/s/${seedState.server.slug}/inbox`);
    await loadNextInboxPage(page);
    await expect(page.getByTestId("inbox-row").filter({ hasText: dmMessage })).toBeVisible();
    await page.getByTestId("inbox-row").filter({ hasText: dmMessage }).click();
    await expect(page).toHaveURL(new RegExp(`/s/${seedState.server.slug}/dm/${dm.id}\\?msg=${dmMessageRecord.id}$`));
    await expect(page.getByTestId("message-scroller")).toBeVisible();

    await page.goto(`/s/${seedState.server.slug}/inbox`);
    await loadNextInboxPage(page);
    await expect(page.getByTestId("inbox-row").filter({ hasText: dmMessage })).toBeVisible();
    await expect(page.getByTestId("inbox-row").filter({ hasText: participatedReply })).toBeVisible();
    await page.getByTestId("inbox-row").filter({ hasText: participatedReply }).click();
    await expect(page).toHaveURL(new RegExp(
      `/s/${seedState.server.slug}/inbox\\?thread=${seedState.channel.id}%3A${participatedParentMessage.id}$`,
    ));
    await expect(page.getByRole("heading", { name: "Activity" })).toBeVisible();
    await expect(page.getByTestId("thread-message-scroller")).toBeVisible();

    await page.goto(`/s/${seedState.server.slug}/inbox`);
    await loadNextInboxPage(page);
    await expect(page.getByTestId("inbox-row").filter({ hasText: participatedReply })).toBeVisible();
    await expect(page.getByTestId("inbox-row").filter({ hasText: activeLatestMessage })).toBeVisible();

    const activeRow = rows.filter({ hasText: activeLatestMessage });
    await activeRow.getByTitle("Mark as Done").click();
    await expect(rows.filter({ hasText: activeLatestMessage })).toHaveCount(0);
    const reopenedMessage = `inbox active reopened ${runId}`;
    await createMessage(request, seedState, ownerLogin.accessToken, activeChannel.id, reopenedMessage);
    await expect(page.getByTestId("inbox-row").filter({ hasText: reopenedMessage })).toBeVisible();

    await page.getByTestId("inbox-filter-unread").click();
    await expect(page.getByTestId("inbox-row").filter({ hasText: " new" }).first()).toBeVisible();

    await page.getByTestId("inbox-filter-all").click();
  });

  test("opens a chat at the earliest unread message while previewing the latest message", async ({ page, request }) => {
    const seedState = await waitForSeedState();
    const ownerLogin = await loginViaApi(request, seedState);
    await dismissOwnerOnboarding(request, seedState, ownerLogin.accessToken);
    const extraHumanLogin = await loginWithCredentials(
      request,
      seedState.urls.api,
      seedState.extraHuman.email,
      seedState.extraHuman.password,
    );
    const runId = Date.now().toString(36);

    const readAll = await request.post(`${seedState.urls.api}/api/channels/${seedState.channel.id}/read-all`, {
      headers: headers(seedState, ownerLogin.accessToken),
    });
    expect(readAll.ok()).toBeTruthy();

    const firstUnreadText = `inbox first unread target ${runId}`;
    const firstUnread = await createMessage(request, seedState, extraHumanLogin.accessToken, seedState.channel.id, firstUnreadText);
    const latestText = `inbox latest preview ${runId}`;
    await createMessage(request, seedState, extraHumanLogin.accessToken, seedState.channel.id, latestText);

    await page.goto(`/s/${seedState.server.slug}/inbox`);
    const row = page.getByTestId("inbox-row").filter({ hasText: latestText });
    await expect(row).toBeVisible();
    await expect(row).not.toContainText(firstUnreadText);

    await row.click();
    await expect(page).toHaveURL(new RegExp(`/s/${seedState.server.slug}/channel/${seedState.channel.id}\\?msg=${firstUnread.id}$`));
    await expect(page.getByTestId("message-scroller")).toBeVisible();

    await page.goBack();
    await expect(page).toHaveURL(new RegExp(`/s/${seedState.server.slug}/inbox$`));
    const reopenedRow = page.getByTestId("inbox-row").filter({ hasText: latestText });
    await expect(reopenedRow).toBeVisible();
    await expect(reopenedRow).not.toContainText("new");

    await expect.poll(async () => {
      const response = await request.get(`${seedState.urls.api}/api/channels/inbox`, {
        headers: headers(seedState, ownerLogin.accessToken),
      });
      const body = await response.json() as { items: Array<{ channelId?: string; unreadCount?: number }> };
      return body.items.find((item) => item.channelId === seedState.channel.id)?.unreadCount ?? -1;
    }).toBe(0);
  });

  test("marks all Inbox rows read and double-clicks the header to jump through unread rows", async ({ page, request }) => {
    const seedState = await waitForSeedState();
    const ownerLogin = await loginViaApi(request, seedState);
    await dismissOwnerOnboarding(request, seedState, ownerLogin.accessToken);
    const extraHumanLogin = await loginWithCredentials(
      request,
      seedState.urls.api,
      seedState.extraHuman.email,
      seedState.extraHuman.password,
    );
    const runId = Date.now().toString(36);

    const firstUnreadChannel = await createChannel(
      request,
      seedState,
      ownerLogin.accessToken,
      `inbox-header-one-${runId}`,
    );
    const secondUnreadChannel = await createChannel(
      request,
      seedState,
      ownerLogin.accessToken,
      `inbox-header-two-${runId}`,
    );
    const firstUnreadText = `inbox header unread one ${runId}`;
    const secondUnreadText = `inbox header unread two ${runId}`;
    await addChannelHuman(request, seedState, ownerLogin.accessToken, firstUnreadChannel.id, seedState.extraHuman.userId);
    await addChannelHuman(request, seedState, ownerLogin.accessToken, secondUnreadChannel.id, seedState.extraHuman.userId);
    await createMessage(request, seedState, extraHumanLogin.accessToken, firstUnreadChannel.id, firstUnreadText);
    await createMessage(request, seedState, extraHumanLogin.accessToken, secondUnreadChannel.id, secondUnreadText);

    await page.goto(`/s/${seedState.server.slug}/inbox`);
    const header = page.getByTestId("inbox-header-title");
    await expect(header).toBeVisible();
    await expect(page.getByTestId("inbox-row").filter({ hasText: secondUnreadText })).toBeVisible();
    await expect(page.getByTestId("inbox-row").filter({ hasText: firstUnreadText })).toBeVisible();

    await header.dblclick();
    await expect(
      page.locator('[data-testid="inbox-row"][data-focused="true"]').filter({ hasText: secondUnreadText }),
    ).toBeVisible();
    await header.dblclick();
    await expect(
      page.locator('[data-testid="inbox-row"][data-focused="true"]').filter({ hasText: firstUnreadText }),
    ).toBeVisible();

    const allFilterBox = await page.getByTestId("inbox-filter-all").boundingBox();
    const markAllReadBox = await page.getByTestId("inbox-mark-all-read").boundingBox();
    expect(allFilterBox).not.toBeNull();
    expect(markAllReadBox).not.toBeNull();
    expect(Math.abs(allFilterBox!.y - markAllReadBox!.y)).toBeLessThanOrEqual(2);
    expect(Math.abs(allFilterBox!.height - markAllReadBox!.height)).toBeLessThanOrEqual(2);

    await page.getByTestId("inbox-mark-all-read").click();
    await expect(page.getByTestId("inbox-mark-all-read")).toHaveCount(0);
    await expect(page.getByTestId("inbox-row").filter({ hasText: firstUnreadText })).not.toContainText("new");
    await expect(page.getByTestId("inbox-row").filter({ hasText: secondUnreadText })).not.toContainText("new");

    await expect.poll(async () => {
      const response = await request.get(`${seedState.urls.api}/api/channels/inbox?filter=unread`, {
        headers: headers(seedState, ownerLogin.accessToken),
      });
      const body = await response.json() as { totalUnreadCount: number };
      return body.totalUnreadCount;
    }).toBe(0);
  });
});
