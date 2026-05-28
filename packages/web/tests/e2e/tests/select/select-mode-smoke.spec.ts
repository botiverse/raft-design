import { expect, test } from "@playwright/test";
import { loginViaApi } from "../../fixtures/auth";
import { waitForSeedState } from "../../fixtures/seedState";
import { dismissOwnerOnboarding } from "../../fixtures/session";
import { clickShareMessagesMenu } from "../../fixtures/contextMenu";

test("select mode entry + check circles + toolbar render", async ({ page, request }) => {
  const seedState = await waitForSeedState();
  const login = await loginViaApi(request, seedState);
  await dismissOwnerOnboarding(request, seedState, login.accessToken);

  await page.goto(`/s/${seedState.server.slug}/channel/${seedState.channel.id}`);

  // Wait until the channel is rendered (latest seeded message visible) so the
  // socket.io per-channel room is joined. Otherwise messages we POST below
  // get broadcast to a room that doesn't include this client yet — see
  // "socket.io rooms have no buffer" feedback.
  await expect(page.getByTestId("message-scroller")).toBeVisible();
  await expect(page.getByText(seedState.messages.latestContent)).toBeVisible();

  // Send a couple messages so we have something to right-click.
  const tag = `selectsmoke-${Date.now()}`;
  for (let i = 0; i < 2; i++) {
    await request.post(`${seedState.urls.api}/api/messages`, {
      headers: { Authorization: `Bearer ${login.accessToken}`, "X-Server-Id": seedState.server.id },
      data: { channelId: seedState.channel.id, content: `${tag} ${i}` },
    });
  }

  // Wait for our messages to render
  await expect(page.getByText(`${tag} 0`).first()).toBeVisible();
  await expect(page.getByText(`${tag} 1`).first()).toBeVisible();

  // Right-click the first message → context menu shows "Share messages…" first
  const firstMsg = page.getByText(`${tag} 0`).first();
  await clickShareMessagesMenu(page, firstMsg);

  // Toolbar visible at bottom
  const toolbar = page.getByTestId("select-mode-toolbar");
  await expect(toolbar).toBeVisible();
  await expect(page.getByTestId("select-mode-count")).toHaveText("1 selected");
  // Save as pic enabled (1 selected)
  await expect(page.getByTestId("select-mode-save-pic")).toBeEnabled();

  // Exactly one message has the filled (yellow) check circle — the one we
  // entered select mode on. Filter the testid set by the bg-brutal-yellow
  // class on the same element (`.has(.bg-brutal-yellow)` would look at
  // descendants).
  const filledCircles = page.locator(
    '[data-testid^="message-select-circle-"].bg-brutal-yellow',
  );
  await expect(filledCircles).toHaveCount(1);

  // Click another message → 2 selected
  await page.getByText(`${tag} 1`).first().click();
  await expect(page.getByTestId("select-mode-count")).toHaveText("2 selected");

  // Cancel exits
  await page.getByTestId("select-mode-cancel").click();
  await expect(toolbar).toHaveCount(0);
});

test("select mode → Save as pic → preview lightbox → Save image triggers download", async ({ page, request }) => {
  const seedState = await waitForSeedState();
  const login = await loginViaApi(request, seedState);
  await dismissOwnerOnboarding(request, seedState, login.accessToken);

  await page.goto(`/s/${seedState.server.slug}/channel/${seedState.channel.id}`);
  await expect(page.getByTestId("message-scroller")).toBeVisible();
  await expect(page.getByText(seedState.messages.latestContent)).toBeVisible();

  const tag = `selectsave-${Date.now()}`;
  for (let i = 0; i < 2; i++) {
    await request.post(`${seedState.urls.api}/api/messages`, {
      headers: { Authorization: `Bearer ${login.accessToken}`, "X-Server-Id": seedState.server.id },
      data: { channelId: seedState.channel.id, content: `${tag} ${i}` },
    });
  }
  await expect(page.getByText(`${tag} 1`).first()).toBeVisible();

  // Enter select mode on the first message + add the second
  await clickShareMessagesMenu(page, page.getByText(`${tag} 0`).first());
  await page.getByText(`${tag} 1`).first().click();
  await expect(page.getByTestId("select-mode-count")).toHaveText("2 selected");

  // Listen for download trigger via the data: anchor click — html-to-image
  // produces a data URL, Playwright surfaces it as a Download event.
  const downloadPromise = page.waitForEvent("download");

  // Save as pic → lightbox renders preview
  await page.getByTestId("select-mode-save-pic").click();
  const lightbox = page.getByTestId("select-share-lightbox");
  await expect(lightbox).toBeVisible({ timeout: 10000 });
  await expect(lightbox.locator("img")).toHaveAttribute("src", /^data:image\/png;base64,/);

  // Click Save image → download fires + lightbox closes + select mode exits
  await page.getByTestId("select-share-lightbox-save").click();
  const download = await downloadPromise;
  expect(download.suggestedFilename()).toMatch(/\.png$/);

  await expect(lightbox).toHaveCount(0);
  await expect(page.getByTestId("select-mode-toolbar")).toHaveCount(0);
});

test("select mode → Save as pic → close lightbox preserves selection (v1.3)", async ({ page, request }) => {
  const seedState = await waitForSeedState();
  const login = await loginViaApi(request, seedState);
  await dismissOwnerOnboarding(request, seedState, login.accessToken);

  await page.goto(`/s/${seedState.server.slug}/channel/${seedState.channel.id}`);
  await expect(page.getByTestId("message-scroller")).toBeVisible();
  await expect(page.getByText(seedState.messages.latestContent)).toBeVisible();

  const tag = `selectclose-${Date.now()}`;
  for (let i = 0; i < 2; i++) {
    await request.post(`${seedState.urls.api}/api/messages`, {
      headers: { Authorization: `Bearer ${login.accessToken}`, "X-Server-Id": seedState.server.id },
      data: { channelId: seedState.channel.id, content: `${tag} ${i}` },
    });
  }
  await expect(page.getByText(`${tag} 1`).first()).toBeVisible();

  await clickShareMessagesMenu(page, page.getByText(`${tag} 0`).first());
  await page.getByText(`${tag} 1`).first().click();
  await expect(page.getByTestId("select-mode-count")).toHaveText("2 selected");

  // Open preview, then close via the X button. Select mode + selection must persist.
  await page.getByTestId("select-mode-save-pic").click();
  const lightbox = page.getByTestId("select-share-lightbox");
  await expect(lightbox).toBeVisible({ timeout: 10000 });

  await page.getByTestId("select-share-lightbox-close").click();
  await expect(lightbox).toHaveCount(0);
  await expect(page.getByTestId("select-mode-toolbar")).toBeVisible();
  await expect(page.getByTestId("select-mode-count")).toHaveText("2 selected");

  // Re-open + Cancel (footer button) — same contract.
  await page.getByTestId("select-mode-save-pic").click();
  await expect(lightbox).toBeVisible({ timeout: 10000 });
  await page.getByTestId("select-share-lightbox-cancel").click();
  await expect(lightbox).toHaveCount(0);
  await expect(page.getByTestId("select-mode-count")).toHaveText("2 selected");
});
