import { expect, test } from "@playwright/test";
import { loginViaApi } from "../../fixtures/auth";
import { waitForSeedState } from "../../fixtures/seedState";
import { dismissOwnerOnboarding } from "../../fixtures/session";

function escapeRegExp(value: string): string {
  return value.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
}

test("clicking the current unread sidebar channel marks it read immediately", async ({ page, request }) => {
  const seedState = await waitForSeedState();
  const login = await loginViaApi(request, seedState);
  await dismissOwnerOnboarding(request, seedState, login.accessToken);

  await page.goto(`/s/${seedState.server.slug}/channel/${seedState.channel.id}`, { waitUntil: "domcontentloaded" });
  await expect(page.getByTestId("message-scroller")).toBeVisible();

  const channelRow = page
    .getByRole("button", { name: new RegExp(escapeRegExp(seedState.channel.name)) })
    .first();
  await expect(channelRow).toBeVisible();

  await channelRow.click({ button: "right" });
  await expect(page.getByRole("menuitem", { name: "Mark as Unread" })).toBeVisible();

  const [unreadResponse] = await Promise.all([
    page.waitForResponse((response) =>
      response.request().method() === "POST"
      && response.url().includes(`/api/channels/${seedState.channel.id}/unread`)
    ),
    page.getByRole("menuitem", { name: "Mark as Unread" }).click(),
  ]);
  expect(unreadResponse.ok()).toBeTruthy();

  const unreadBadge = channelRow.locator("span.bg-brutal-pink");
  await expect(unreadBadge).toHaveText("1");

  const [readResponse] = await Promise.all([
    page.waitForResponse((response) =>
      response.request().method() === "POST"
      && response.url().includes(`/api/channels/${seedState.channel.id}/read-all`)
    ),
    channelRow.click(),
  ]);
  expect(readResponse.ok()).toBeTruthy();
  await expect(unreadBadge).toHaveCount(0);
});
