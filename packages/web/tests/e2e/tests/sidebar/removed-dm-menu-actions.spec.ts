import { expect, test, type APIRequestContext, type Page } from "@playwright/test";
import { CURRENT_LEGAL_ACCEPTANCE } from "@slock-ai/shared";
import { loginViaApi } from "../../fixtures/auth";
import { dismissOwnerOnboarding } from "../../fixtures/session";
import { waitForSeedState, type PlaywrightSeedState } from "../../fixtures/seedState";

function authHeaders(accessToken: string, serverId: string) {
  return {
    Authorization: `Bearer ${accessToken}`,
    "X-Server-Id": serverId,
  };
}

function escapeRegExp(value: string): string {
  return value.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
}

async function getSidebarOrder(
  request: APIRequestContext,
  seedState: PlaywrightSeedState,
  accessToken: string,
) {
  const response = await request.get(`${seedState.urls.api}/api/servers/${seedState.server.id}/sidebar-order`, {
    headers: authHeaders(accessToken, seedState.server.id),
  });
  expect(response.ok()).toBeTruthy();
  return response.json() as Promise<{
    pinnedChannelIds: string[];
    pinnedOrder: string[];
    hiddenDmIds: string[];
  }>;
}

async function markChannelRead(
  request: APIRequestContext,
  seedState: PlaywrightSeedState,
  accessToken: string,
  channelId: string,
) {
  const response = await request.post(`${seedState.urls.api}/api/channels/${channelId}/read-all`, {
    headers: authHeaders(accessToken, seedState.server.id),
  });
  expect(response.ok()).toBeTruthy();
}

async function registerEphemeralUser(
  request: APIRequestContext,
  seedState: PlaywrightSeedState,
  ownerAccessToken: string,
  unique: number,
) {
  const name = `removed-human-${unique}`;
  const registerResponse = await request.post(`${seedState.urls.api}/api/auth/register`, {
    data: {
      email: `${name}@example.test`,
      password: "password123",
      name,
      acceptTerms: true,
      termsVersion: CURRENT_LEGAL_ACCEPTANCE.termsVersion,
      privacyVersion: CURRENT_LEGAL_ACCEPTANCE.privacyVersion,
    },
  });
  expect(registerResponse.ok()).toBeTruthy();
  const registered = await registerResponse.json() as { user: { id: string; name: string } };

  const addMemberResponse = await request.post(`${seedState.urls.api}/api/servers/${seedState.server.id}/members`, {
    headers: authHeaders(ownerAccessToken, seedState.server.id),
    data: { userId: registered.user.id, role: "member" },
  });
  expect(addMemberResponse.ok()).toBeTruthy();

  return registered.user;
}

async function openRowMenu(page: Page, channelId: string) {
  const row = page.locator(`button[data-sidebar-channel-id="${channelId}"]`).first();
  await expect(row).toBeVisible();
  await row.scrollIntoViewIfNeeded();
  const markAction = page.getByRole("menuitem", { name: /Mark as (Read|Unread)/ });
  for (let attempt = 0; attempt < 2; attempt += 1) {
    await row.click({ button: "right" });
    try {
      await expect(markAction).toBeVisible({ timeout: 5000 });
      return row;
    } catch (error) {
      if (attempt === 1) throw error;
      await page.keyboard.press("Escape").catch(() => {});
    }
  }
  return row;
}

async function verifyConversationActions(
  page: Page,
  request: APIRequestContext,
  seedState: PlaywrightSeedState,
  accessToken: string,
  channelId: string,
) {
  await openRowMenu(page, channelId);
  const [unreadResponse] = await Promise.all([
    page.waitForResponse((response) =>
      response.request().method() === "POST"
      && response.url().includes(`/api/channels/${channelId}/unread`)
    ),
    page.getByRole("menuitem", { name: "Mark as Unread" }).click(),
  ]);
  expect(unreadResponse.ok()).toBeTruthy();
  expect((await unreadResponse.json() as { unreadCount: number }).unreadCount).toBe(1);

  await openRowMenu(page, channelId);
  await page.getByRole("menuitem", { name: "Pin", exact: true }).click();
  await expect.poll(async () => {
    const order = await getSidebarOrder(request, seedState, accessToken);
    return order.pinnedChannelIds.includes(channelId) && order.pinnedOrder.includes(channelId);
  }).toBe(true);

  await openRowMenu(page, channelId);
  await page.getByRole("menuitem", { name: "Unpin", exact: true }).click();
  await expect.poll(async () => {
    const order = await getSidebarOrder(request, seedState, accessToken);
    return order.pinnedChannelIds.includes(channelId) || order.pinnedOrder.includes(channelId);
  }).toBe(false);

  await openRowMenu(page, channelId);
  await page.getByRole("menuitem", { name: "Close Chat" }).click();
  await expect.poll(async () => {
    const order = await getSidebarOrder(request, seedState, accessToken);
    return order.hiddenDmIds.includes(channelId);
  }).toBe(true);
}

test("removed human/agent DM context menu actions actually update state", async ({ page, request }) => {
  const seedState = await waitForSeedState();
  const ownerLogin = await loginViaApi(request, seedState);
  await dismissOwnerOnboarding(request, seedState, ownerLogin.accessToken);
  const headers = authHeaders(ownerLogin.accessToken, seedState.server.id);
  const unique = Date.now();
  const agentName = `removed-menu-${unique}`;
  const removedHuman = await registerEphemeralUser(request, seedState, ownerLogin.accessToken, unique);
  let humanDmId: string | null = null;
  let agentDmId: string | null = null;
  let humanRowName = removedHuman.name;

  try {
    const humanDmResponse = await request.post(`${seedState.urls.api}/api/channels/dm`, {
      headers,
      data: { userId: removedHuman.id },
    });
    expect(humanDmResponse.ok()).toBeTruthy();
    const humanDm = await humanDmResponse.json() as {
      id: string;
      peerDisplayName?: string | null;
      peerName?: string | null;
    };
    humanDmId = humanDm.id;
    humanRowName = humanDm.peerDisplayName || humanDm.peerName || removedHuman.name;
    await request.post(`${seedState.urls.api}/api/messages`, {
      headers,
      data: { channelId: humanDmId, content: `removed human DM action proof ${unique}` },
    });
    await markChannelRead(request, seedState, ownerLogin.accessToken, humanDmId);

    const agentResponse = await request.post(`${seedState.urls.api}/api/agents`, {
      headers,
      data: { name: agentName, runtime: "codex" },
    });
    expect(agentResponse.ok()).toBeTruthy();
    const agent = await agentResponse.json() as { id: string; name: string };
    const agentDmResponse = await request.post(`${seedState.urls.api}/api/channels/dm`, {
      headers,
      data: { agentId: agent.id },
    });
    expect(agentDmResponse.ok()).toBeTruthy();
    agentDmId = ((await agentDmResponse.json()) as { id: string }).id;
    await request.post(`${seedState.urls.api}/api/messages`, {
      headers,
      data: { channelId: agentDmId, content: `removed agent DM action proof ${unique}` },
    });
    await markChannelRead(request, seedState, ownerLogin.accessToken, agentDmId);

    await page.goto(`/s/${seedState.server.slug}`);
    await expect(page.getByRole("button", { name: new RegExp(escapeRegExp(humanRowName)) }).first()).toBeVisible();
    await expect(page.getByRole("button", { name: new RegExp(escapeRegExp(agentName)) }).first()).toBeVisible();

    const removeHumanResponse = await request.delete(
      `${seedState.urls.api}/api/servers/${seedState.server.id}/members/${removedHuman.id}`,
      { headers },
    );
    expect(removeHumanResponse.ok()).toBeTruthy();
    const deleteAgentResponse = await request.delete(`${seedState.urls.api}/api/agents/${agent.id}`, { headers });
    expect(deleteAgentResponse.ok()).toBeTruthy();

    await verifyConversationActions(page, request, seedState, ownerLogin.accessToken, humanDmId);
    await verifyConversationActions(page, request, seedState, ownerLogin.accessToken, agentDmId);
  } finally {
    if (humanDmId || agentDmId) {
      const current = await getSidebarOrder(request, seedState, ownerLogin.accessToken).catch(() => null);
      if (current) {
        await request.patch(`${seedState.urls.api}/api/servers/${seedState.server.id}/sidebar-order`, {
          headers,
          data: {
            pinnedChannelIds: current.pinnedChannelIds.filter((id) => id !== humanDmId && id !== agentDmId),
            pinnedOrder: current.pinnedOrder.filter((id) => id !== humanDmId && id !== agentDmId),
            hiddenDmIds: current.hiddenDmIds.filter((id) => id !== humanDmId && id !== agentDmId),
          },
        }).catch(() => {});
      }
    }
  }
});
