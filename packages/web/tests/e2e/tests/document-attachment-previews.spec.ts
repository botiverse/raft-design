import { expect, test } from "@playwright/test";
import { randomUUID } from "node:crypto";
import { loginViaApi } from "../fixtures/auth";
import { waitForSeedState } from "../fixtures/seedState";
import { dismissOwnerOnboarding } from "../fixtures/session";

const CSV_FIXTURE = Buffer.from(`name,score,owner\nAlpha,98,Koda\nBeta,87,Martin\nGamma,91,tygg\n`, "utf8");
const MARKDOWN_FIXTURE = Buffer.from(`# Preview Notes\n\nThis is a **markdown** document.\n\n- Raw HTML below must not execute.\n\n<script>window.__bad = true</script>\n`, "utf8");
const HTML_FIXTURE = Buffer.from(`<!doctype html><html><body><h1>HTML Escape Preview</h1></body></html>`, "utf8");
const PDF_FIXTURE = Buffer.from(`%PDF-1.4\n1 0 obj\n<< /Type /Catalog /Pages 2 0 R >>\nendobj\n2 0 obj\n<< /Type /Pages /Kids [3 0 R] /Count 1 >>\nendobj\n3 0 obj\n<< /Type /Page /Parent 2 0 R /MediaBox [0 0 300 144] /Contents 4 0 R >>\nendobj\n4 0 obj\n<< /Length 44 >>\nstream\nBT /F1 18 Tf 40 80 Td (Slock PDF Preview) Tj ET\nendstream\nendobj\nxref\n0 5\n0000000000 65535 f \n0000000009 00000 n \n0000000058 00000 n \n0000000115 00000 n \n0000000214 00000 n \ntrailer\n<< /Root 1 0 R /Size 5 >>\nstartxref\n307\n%%EOF\n`, "utf8");

async function uploadAttachment(request: Parameters<Parameters<typeof test>[2]>[0]["request"], seedState: Awaited<ReturnType<typeof waitForSeedState>>, accessToken: string, file: { name: string; mimeType: string; buffer: Buffer }) {
  const response = await request.post(`${seedState.urls.api}/api/attachments/upload`, {
    headers: {
      Authorization: `Bearer ${accessToken}`,
      "X-Server-Id": seedState.server.id,
    },
    multipart: {
      channelId: seedState.channel.id,
      files: file,
    },
  });
  expect(response.ok()).toBeTruthy();
  const body = (await response.json()) as { attachments: Array<{ id: string }> };
  return body.attachments[0].id;
}

test("CSV Markdown and PDF attachments open document previews", async ({ page, request }) => {
  const seedState = await waitForSeedState();
  const login = await loginViaApi(request, seedState);
  await dismissOwnerOnboarding(request, seedState, login.accessToken);

  const suffix = randomUUID();
  const attachmentIds = await Promise.all([
    uploadAttachment(request, seedState, login.accessToken, { name: `preview-${suffix}.csv`, mimeType: "text/csv", buffer: CSV_FIXTURE }),
    uploadAttachment(request, seedState, login.accessToken, { name: `preview-${suffix}.md`, mimeType: "text/markdown", buffer: MARKDOWN_FIXTURE }),
    uploadAttachment(request, seedState, login.accessToken, { name: `preview-${suffix}.pdf`, mimeType: "application/pdf", buffer: PDF_FIXTURE }),
  ]);

  const tag = `document preview ${suffix}`;
  const message = await request.post(`${seedState.urls.api}/api/messages`, {
    headers: {
      Authorization: `Bearer ${login.accessToken}`,
      "X-Server-Id": seedState.server.id,
    },
    data: {
      channelId: seedState.channel.id,
      content: tag,
      attachmentIds,
    },
  });
  expect(message.ok()).toBeTruthy();
  const messageBody = (await message.json()) as { id: string };

  await page.goto(`/s/${seedState.server.slug}/channel/${seedState.channel.id}`);
  const messageCard = page.locator(`#message-${messageBody.id}`).first();
  await expect(messageCard.getByText(tag)).toBeVisible();
  await expect(messageCard.getByText("3 rows · 3 columns")).toBeVisible();
  await expect(messageCard.getByText("Markdown document")).toBeVisible();
  await expect(messageCard.getByText("PDF document")).toBeVisible();

  await messageCard.getByTitle(`preview-${suffix}.csv`).click();
  await expect(page.getByText("CSV preview").first()).toBeVisible();
  await expect(page.getByText("Alpha")).toBeVisible();
  await page.getByTitle("Close").click();

  await messageCard.getByTitle(`preview-${suffix}.md`).click();
  await expect(page.getByRole("heading", { name: "Preview Notes" })).toBeVisible();
  await expect(page.getByText("window.__bad = true")).toHaveCount(0);
  await page.getByTitle("Close").click();

  await messageCard.getByTitle(`preview-${suffix}.pdf`).click();
  await expect(page.getByText("PDF preview").first()).toBeVisible();
  await expect(page.locator('iframe[title^="PDF preview"]')).toBeVisible();
});

test("HTML attachment preview closes on Escape", async ({ page, request }) => {
  const seedState = await waitForSeedState();
  const login = await loginViaApi(request, seedState);
  await dismissOwnerOnboarding(request, seedState, login.accessToken);

  const suffix = randomUUID();
  const attachmentId = await uploadAttachment(request, seedState, login.accessToken, {
    name: `preview-${suffix}.html`,
    mimeType: "text/html",
    buffer: HTML_FIXTURE,
  });

  const tag = `html preview escape ${suffix}`;
  const message = await request.post(`${seedState.urls.api}/api/messages`, {
    headers: {
      Authorization: `Bearer ${login.accessToken}`,
      "X-Server-Id": seedState.server.id,
    },
    data: {
      channelId: seedState.channel.id,
      content: tag,
      attachmentIds: [attachmentId],
    },
  });
  expect(message.ok()).toBeTruthy();
  const messageBody = (await message.json()) as { id: string };

  await page.goto(`/s/${seedState.server.slug}/channel/${seedState.channel.id}`);
  const messageCard = page.locator(`#message-${messageBody.id}`).first();
  await expect(messageCard.getByText(tag)).toBeVisible();

  await messageCard.getByTitle(`preview-${suffix}.html`).click();
  await expect(page.getByText("HTML preview").first()).toBeVisible();
  const iframe = page.locator('iframe[title^="HTML preview"]');
  await expect(iframe).toBeVisible();

  // Keep focus in the parent document before pressing Escape. Chromium can
  // occasionally leave focus in the sandboxed iframe after it finishes loading,
  // and parent-document Escape handlers cannot observe iframe key events.
  await page.getByRole("button", { name: "Close", exact: true }).focus();
  await page.keyboard.press("Escape");
  await expect(iframe).toHaveCount(0);
});

// Long filenames must not push the modal-header label badge off-screen.
// Before the fix, both filename text and label badge shared the same
// `truncate` envelope, so a long filename clipped the badge entirely on
// narrow viewports — the user couldn't tell what kind of preview they
// were looking at. Fix: separate flex children with shrink-0 on the
// badge. (#proj-uiux task #133, Nana7mi/tygg.)
test("long filename keeps preview-shell label badge visible on narrow viewport", async ({
  page,
  request,
}) => {
  const seedState = await waitForSeedState();
  const login = await loginViaApi(request, seedState);
  await dismissOwnerOnboarding(request, seedState, login.accessToken);

  const longName = `this-is-an-extremely-long-markdown-filename-that-should-truncate-but-not-clip-the-label-badge-${randomUUID()}.md`;
  const attachmentId = await uploadAttachment(request, seedState, login.accessToken, {
    name: longName,
    mimeType: "text/markdown",
    buffer: MARKDOWN_FIXTURE,
  });

  const tag = `long filename preview ${randomUUID()}`;
  const message = await request.post(`${seedState.urls.api}/api/messages`, {
    headers: {
      Authorization: `Bearer ${login.accessToken}`,
      "X-Server-Id": seedState.server.id,
    },
    data: {
      channelId: seedState.channel.id,
      content: tag,
      attachmentIds: [attachmentId],
    },
  });
  expect(message.ok()).toBeTruthy();
  const messageBody = (await message.json()) as { id: string };

  // Test on the narrowest realistic mobile viewport — that's where the
  // overlap was visible.
  await page.setViewportSize({ width: 390, height: 844 });
  await page.goto(`/s/${seedState.server.slug}/channel/${seedState.channel.id}`);
  const messageCard = page.locator(`#message-${messageBody.id}`).first();
  await expect(messageCard.getByText(tag)).toBeVisible();

  // Open the preview modal.
  await messageCard.getByTitle(longName).click();

  // Badge must be visible AND fully on-screen (not clipped by viewport).
  // Before the fix, the badge rode inside the filename's truncate envelope
  // and the long filename pushed it past the right viewport edge.
  const badge = page.getByText("MARKDOWN PREVIEW").first();
  await expect(badge).toBeVisible();
  const viewport = page.viewportSize();
  expect(viewport).not.toBeNull();
  const badgeBox = await badge.boundingBox();
  expect(badgeBox).not.toBeNull();
  expect(badgeBox!.x).toBeGreaterThanOrEqual(0);
  expect(badgeBox!.x + badgeBox!.width).toBeLessThanOrEqual(viewport!.width);
  // Badge must have non-trivial width — proves it wasn't clipped to zero.
  expect(badgeBox!.width).toBeGreaterThan(40);

  // Filename element should still truncate (scrollWidth > clientWidth) so
  // long names don't push the close/download buttons off-screen.
  const filenameSpan = page
    .locator('[title*="' + longName + '"] > span')
    .first();
  await expect(filenameSpan).toBeVisible();
  const overflow = await filenameSpan.evaluate((el) => ({
    scrollWidth: (el as HTMLElement).scrollWidth,
    clientWidth: (el as HTMLElement).clientWidth,
  }));
  expect(overflow.scrollWidth).toBeGreaterThan(overflow.clientWidth);
});

// Long filenames in the small attachment card must truncate inside the
// fixed-width card (w-44 = 176px) and not push the card itself wider.
test("long filename truncates inside markdown attachment card", async ({ page, request }) => {
  const seedState = await waitForSeedState();
  const login = await loginViaApi(request, seedState);
  await dismissOwnerOnboarding(request, seedState, login.accessToken);

  // Use a hyphenated mobile-style filename (the regression tygg flagged on
  // 2026-05-10 #proj-uiux:28ac87a7) — hyphens are natural break opportunities,
  // so truncate at the chip's fixed width is the only thing keeping it inside.
  const longName = `web-frontend-tracing-rfc-2026-05-10-${randomUUID()}.md`;
  const attachmentId = await uploadAttachment(request, seedState, login.accessToken, {
    name: longName,
    mimeType: "text/markdown",
    buffer: MARKDOWN_FIXTURE,
  });

  const tag = `card truncate ${randomUUID()}`;
  const message = await request.post(`${seedState.urls.api}/api/messages`, {
    headers: {
      Authorization: `Bearer ${login.accessToken}`,
      "X-Server-Id": seedState.server.id,
    },
    data: {
      channelId: seedState.channel.id,
      content: tag,
      attachmentIds: [attachmentId],
    },
  });
  expect(message.ok()).toBeTruthy();
  const messageBody = (await message.json()) as { id: string };

  // Mobile-width viewport — the regression was reported on a Huawei browser
  // capture, and a narrow viewport makes a wider chip visually obvious.
  await page.setViewportSize({ width: 390, height: 844 });
  await page.goto(`/s/${seedState.server.slug}/channel/${seedState.channel.id}`);
  const messageCard = page.locator(`#message-${messageBody.id}`).first();
  await expect(messageCard.getByText(tag)).toBeVisible();

  const card = messageCard.getByTitle(longName).first();
  await expect(card).toBeVisible();

  // Card must stay at its fixed width (w-44 = 176px) regardless of
  // filename length.
  const cardBox = await card.boundingBox();
  expect(cardBox).not.toBeNull();
  expect(cardBox!.width).toBe(176);

  // The filename element inside must overflow its container (proof
  // truncate is doing work) but visible width fits the card.
  const fname = card.getByText(longName).first();
  const dims = await fname.evaluate((el) => ({
    scrollWidth: (el as HTMLElement).scrollWidth,
    clientWidth: (el as HTMLElement).clientWidth,
  }));
  expect(dims.scrollWidth).toBeGreaterThan(dims.clientWidth);
  expect(dims.clientWidth).toBeLessThanOrEqual(176);

  // Regression for mobile browsers: the rendered text must not paint beyond
  // the card border even when the filename has natural hyphen breakpoints.
  const fnameBox = await fname.boundingBox();
  expect(fnameBox).not.toBeNull();
  expect(fnameBox!.x).toBeGreaterThanOrEqual(cardBox!.x);
  expect(fnameBox!.x + fnameBox!.width).toBeLessThanOrEqual(cardBox!.x + cardBox!.width);
});
