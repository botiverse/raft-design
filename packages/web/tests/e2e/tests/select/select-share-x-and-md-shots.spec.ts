import { expect, test } from "@playwright/test";
import { loginViaApi } from "../../fixtures/auth";
import { waitForSeedState } from "../../fixtures/seedState";
import { dismissOwnerOnboarding } from "../../fixtures/session";
import { clickShareMessagesMenu } from "../../fixtures/contextMenu";

// Captures Share-to-X and Copy-MD interactions as PNGs and asserts the
// pieces a reviewer cares about: the Twitter Web Intent URL is shaped
// correctly (text=via slock.ai, url=https://slock.ai), and the markdown
// copied to the clipboard matches the agreed `**sender**: content` format.
//
// Note: per @huxijin 2026-05-01 review (#proj-mobile:fd343bd8 msg 938a65ff)
// Share-to-X no longer auto-captures/downloads a PNG. "Save as Pic" is the
// separate path for users who want an image. We assert the intent URL only.
//
// SKIPPED 2026-05-02 #engineering:e65947f9 (task #346): PR #1289
// (huxijin 254b9148 "先把 share to x 入口隐藏起来") gates the
// `select-mode-share-x` button behind `{false && (...)}` until the
// share-with-image path lands (OG-image / navigator.share files —
// see thread #proj-mobile:fd343bd8). Re-enable this test in the same
// PR that un-hides the toolbar entry. Bugen 2026-05-03.
test.skip("select mode → Share to X → intent URL only (no auto-download)", async ({ page, request, browserName }) => {
  const seedState = await waitForSeedState();
  const login = await loginViaApi(request, seedState);
  await dismissOwnerOnboarding(request, seedState, login.accessToken);

  await page.setViewportSize({ width: 1280, height: 800 });
  await page.goto(`/s/${seedState.server.slug}/channel/${seedState.channel.id}`);
  await page.waitForSelector('[data-testid="message-scroller"]');
  await page.waitForTimeout(800);

  const tag = `sharex-${Date.now()}`;
  const lines = [
    "PR is up for the multi-select share flow",
    "nice — does Save as pic still produce a real PNG?",
    "yep, html2canvas-pro is solid",
  ];
  for (let i = 0; i < lines.length; i++) {
    await request.post(`${seedState.urls.api}/api/messages`, {
      headers: { Authorization: `Bearer ${login.accessToken}`, "X-Server-Id": seedState.server.id },
      data: { channelId: seedState.channel.id, content: `${tag} ${i}: ${lines[i]}` },
    });
  }
  await page.waitForSelector(`text=${tag} 2:`);
  await page.waitForTimeout(400);

  // Stub window.open so the intent doesn't actually try to navigate during
  // the test, and we can read back the URL it was called with.
  await page.addInitScript(() => {
    (window as unknown as { __openCalls: string[] }).__openCalls = [];
    const orig = window.open;
    window.open = function (url?: string | URL) {
      (window as unknown as { __openCalls: string[] }).__openCalls.push(String(url ?? ""));
      // Return a fake Window-like object so the caller's null check passes.
      return { closed: false, close() {} } as unknown as Window;
    } as typeof orig;
  });
  await page.reload();
  await page.waitForSelector('[data-testid="message-scroller"]');
  await page.waitForSelector(`text=${tag} 2:`);
  await page.waitForTimeout(400);

  // Enter select mode → pick all 3 messages
  await clickShareMessagesMenu(page, page.getByText(`${tag} 0:`).first());
  await page.getByText(`${tag} 1:`).first().click();
  await page.getByText(`${tag} 2:`).first().click();
  await expect(page.getByTestId("select-mode-count")).toHaveText("3 selected");

  await page.getByTestId("select-mode-share-x").click();

  // Give the click handler a tick to fire window.open synchronously.
  await page.waitForTimeout(300);
  await page.screenshot({ path: "test-results/share-x-intent.png", fullPage: false });

  // The Twitter intent should have been opened with the agreed text + url
  const opened = await page.evaluate(
    () => (window as unknown as { __openCalls: string[] }).__openCalls,
  );
  expect(opened.length).toBeGreaterThan(0);
  const intentUrl = opened[0];
  expect(intentUrl).toContain("twitter.com/intent/tweet");
  expect(intentUrl).toContain(`text=${encodeURIComponent("via slock.ai")}`);
  expect(intentUrl).toContain(`url=${encodeURIComponent("https://slock.ai")}`);

  // Selection mode exits after Share-to-X. (The two paths are orthogonal —
  // users who want a PNG use the separate "Save as Pic" button.)
  await expect(page.getByTestId("select-mode-count")).toHaveCount(0);

  // (browserName arg is unused but kept for parity with other tests if ever
  // we need to skip on a specific engine that mishandles window.open stubs.)
  void browserName;
});

test("select mode → Copy MD → clipboard contains **sender**: content format", async ({ page, request, context }) => {
  await context.grantPermissions(["clipboard-read", "clipboard-write"]);

  const seedState = await waitForSeedState();
  const login = await loginViaApi(request, seedState);
  await dismissOwnerOnboarding(request, seedState, login.accessToken);

  await page.setViewportSize({ width: 1280, height: 800 });
  await page.goto(`/s/${seedState.server.slug}/channel/${seedState.channel.id}`);
  await page.waitForSelector('[data-testid="message-scroller"]');
  await page.waitForTimeout(800);

  const tag = `copymd-${Date.now()}`;
  const lines = [
    "PR is up for the multi-select share flow",
    "nice — does Save as pic still produce a real PNG?",
    "yep, html2canvas-pro is solid",
  ];
  for (let i = 0; i < lines.length; i++) {
    await request.post(`${seedState.urls.api}/api/messages`, {
      headers: { Authorization: `Bearer ${login.accessToken}`, "X-Server-Id": seedState.server.id },
      data: { channelId: seedState.channel.id, content: `${tag} ${i}: ${lines[i]}` },
    });
  }
  await page.waitForSelector(`text=${tag} 2:`);
  await page.waitForTimeout(400);

  // Enter select mode → pick all 3 messages
  await clickShareMessagesMenu(page, page.getByText(`${tag} 0:`).first());
  await page.getByText(`${tag} 1:`).first().click();
  await page.getByText(`${tag} 2:`).first().click();
  await expect(page.getByTestId("select-mode-count")).toHaveText("3 selected");

  await page.getByTestId("select-mode-copy-md").click();

  // Wait for the "Copied" affordance — a real success path swaps the icon.
  await expect(page.getByTestId("select-mode-copy-md")).toHaveText(/Copied/);
  await page.screenshot({ path: "test-results/copy-md-success.png", fullPage: false });

  const clip = await page.evaluate(() => navigator.clipboard.readText());

  // Format contract: **sender**: content per line, blank line between, no
  // hover-only buttons leaking in, sorted by chat order.
  expect(clip).toMatch(new RegExp(`\\*\\*[^*]+\\*\\*: ${tag} 0:`));
  expect(clip).toMatch(new RegExp(`\\*\\*[^*]+\\*\\*: ${tag} 1:`));
  expect(clip).toMatch(new RegExp(`\\*\\*[^*]+\\*\\*: ${tag} 2:`));
  // Order: 0 then 1 then 2
  const i0 = clip.indexOf(`${tag} 0:`);
  const i1 = clip.indexOf(`${tag} 1:`);
  const i2 = clip.indexOf(`${tag} 2:`);
  expect(i0).toBeLessThan(i1);
  expect(i1).toBeLessThan(i2);

  // Persist the clipboard text to disk so we can show it to product.
  const fs = await import("node:fs");
  fs.writeFileSync("test-results/copy-md-clipboard.txt", clip);
});
