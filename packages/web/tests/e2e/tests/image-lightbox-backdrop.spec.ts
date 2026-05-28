import { expect, test } from "@playwright/test";
import { randomUUID } from "node:crypto";
import { loginViaApi } from "../fixtures/auth";
import { waitForSeedState } from "../fixtures/seedState";
import { dismissOwnerOnboarding } from "../fixtures/session";

const RED_DOT_PNG = Buffer.from(
  "iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAIAAACQd1PeAAAADElEQVR4nGP4z8AAAAMBAQDJ/pLvAAAAAElFTkSuQmCC",
  "base64",
);

test("clicking outside the image closes the message image lightbox", async ({ page, request }) => {
  const seedState = await waitForSeedState();
  const login = await loginViaApi(request, seedState);
  await dismissOwnerOnboarding(request, seedState, login.accessToken);

  const upload = await request.post(`${seedState.urls.api}/api/attachments/upload`, {
    headers: {
      Authorization: `Bearer ${login.accessToken}`,
      "X-Server-Id": seedState.server.id,
    },
    multipart: {
      channelId: seedState.channel.id,
      files: {
        name: `lightbox-${Date.now()}.png`,
        mimeType: "image/png",
        buffer: RED_DOT_PNG,
      },
    },
  });
  expect(upload.ok()).toBeTruthy();
  const attachment = ((await upload.json()) as { attachments: Array<{ id: string }> }).attachments[0];
  expect(attachment?.id).toBeTruthy();

  const tag = `lightbox backdrop ${randomUUID()}`;
  const message = await request.post(`${seedState.urls.api}/api/messages`, {
    headers: {
      Authorization: `Bearer ${login.accessToken}`,
      "X-Server-Id": seedState.server.id,
    },
    data: {
      channelId: seedState.channel.id,
      content: tag,
      attachmentIds: [attachment.id],
    },
  });
  expect(message.ok()).toBeTruthy();
  const messageBody = (await message.json()) as { id: string };

  await page.goto(`/s/${seedState.server.slug}/channel/${seedState.channel.id}`);
  await expect(page.getByText(tag)).toBeVisible();
  await page.locator(`#message-${messageBody.id} button[title^="lightbox-"]`).click();

  const lightbox = page.getByTestId("image-lightbox");
  await expect(lightbox).toBeVisible();

  await page.getByTestId("image-lightbox-image").click();
  await expect(lightbox).toBeVisible();

  await page.getByTestId("image-lightbox-stage").click({ position: { x: 8, y: 8 } });
  await expect(lightbox).toHaveCount(0);
});
