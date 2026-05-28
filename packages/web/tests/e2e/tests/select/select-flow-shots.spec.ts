import { expect, test } from "@playwright/test";
import { loginViaApi } from "../../fixtures/auth";
import { waitForSeedState } from "../../fixtures/seedState";
import { dismissOwnerOnboarding } from "../../fixtures/session";
import { openShareMessagesMenu } from "../../fixtures/contextMenu";

// Captures the four key states of the multi-select share flow as PNGs +
// asserts the rendered image isn't a blank-canvas regression. The screenshots
// double as design-validation artifacts for huxijin / Joy / Duoyu.
test("select mode → non-contiguous selection → rendered image has real content", async ({ page, request }) => {
  const seedState = await waitForSeedState();
  const login = await loginViaApi(request, seedState);
  await dismissOwnerOnboarding(request, seedState, login.accessToken);

  await page.setViewportSize({ width: 1280, height: 800 });
  await page.goto(`/s/${seedState.server.slug}/channel/${seedState.channel.id}`);
  await page.waitForSelector('[data-testid="message-scroller"]');
  await page.waitForTimeout(800);

  // Five conversational messages — different senders if the seed had them,
  // otherwise just five lines. We then pick three NON-CONTIGUOUS rows
  // (#0, #2, #4) to prove gaps in selection are handled correctly.
  const tag = `flowshot-${Date.now()}`;
  const lines = [
    "got the PR up for the auth refresh fix",
    "nice — does it cover the safari edge case?",
    "yep, e2e is green and Adspectum signed off",
    "ok merging then. anything left for tonight?",
    "just the changelog, I'll push it before bed.",
  ];
  for (let i = 0; i < lines.length; i++) {
    await request.post(`${seedState.urls.api}/api/messages`, {
      headers: { Authorization: `Bearer ${login.accessToken}`, "X-Server-Id": seedState.server.id },
      data: { channelId: seedState.channel.id, content: `${tag} ${i}: ${lines[i]}` },
    });
  }
  await page.waitForSelector(`text=${tag} 4:`);
  await page.waitForTimeout(600);

  // Step 1 — right-click context menu (idle, with "Share messages…" item)
  const shareMenu = await openShareMessagesMenu(page, page.getByText(`${tag} 0:`).first());
  await page.screenshot({ path: "test-results/share-flow-1-ctx-menu.png", fullPage: false });

  // Step 2 — entered select mode, 1 selected (the row that was right-clicked)
  await shareMenu.click();
  await page.waitForSelector('[data-testid="select-mode-toolbar"]');
  await page.waitForTimeout(200);
  await page.screenshot({ path: "test-results/share-flow-2-select-mode-1.png", fullPage: false });

  // Step 3 — non-contiguous selection: skip #1, add #2 and #4 (skip #3)
  await page.getByText(`${tag} 2:`).first().click();
  await page.getByText(`${tag} 4:`).first().click();
  await page.waitForFunction(() => {
    const el = document.querySelector('[data-testid="select-mode-count"]');
    return el?.textContent?.trim() === "3 selected";
  });
  await page.waitForTimeout(200);
  await page.screenshot({ path: "test-results/share-flow-3-select-3-noncontiguous.png", fullPage: false });

  // Step 4 — Save as pic → preview lightbox (the rendered image is the
  // three picked rows stacked, with the unselected rows omitted)
  await page.getByTestId("select-mode-save-pic").click();
  await page.waitForSelector('[data-testid="select-share-lightbox"]');
  await page.waitForTimeout(1000);
  await page.screenshot({ path: "test-results/share-flow-4-preview-lightbox.png", fullPage: false });

  // Also dump the raw rendered PNG to disk, decoded from the data URL.
  // The test asserts non-trivial size to catch the html-to-image silent
  // blank-canvas regression that pushed us to html2canvas-pro.
  const pngBytes = await page.evaluate(() => {
    const img = document.querySelector('[data-testid="select-share-lightbox"] img') as HTMLImageElement | null;
    if (!img) return null;
    const src = img.getAttribute("src") || "";
    const m = src.match(/^data:image\/png;base64,(.+)$/);
    if (!m) return null;
    return { base64: m[1], length: m[1].length };
  });
  if (pngBytes) {
    const fs = await import("node:fs");
    fs.writeFileSync(
      "test-results/share-flow-4b-rendered.png",
      Buffer.from(pngBytes.base64, "base64"),
    );
  }
  // 50KB is conservatively above the cream-only blank-canvas baseline
  // (~27KB) and well below a real captured image with text content.
  expect(pngBytes?.length ?? 0).toBeGreaterThan(50_000);
});
