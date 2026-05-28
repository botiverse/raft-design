import { expect, test } from "@playwright/test";
import { waitForSeedState } from "../fixtures/seedState";

test("language and region settings show language and timezone with detected auto values", async ({ page }) => {
  const seedState = await waitForSeedState();

  await page.goto(`/s/${seedState.server.slug}/settings/language-region`);

  await expect(page.getByText("Language & Region", { exact: true })).toBeVisible();
  await expect(page.getByText("Language", { exact: true })).toHaveCount(1);
  await expect(page.getByText("Preferred language", { exact: true })).toBeVisible();
  await expect(page.getByText("Message display", { exact: true })).toBeVisible();
  await expect(page.getByText("Date & Time", { exact: true })).toBeVisible();
  await expect(page.getByText("Timezone", { exact: true })).toHaveCount(1);
  await expect(page.getByText(/Auto-detect browser/)).toHaveCount(0);
  await expect(page.getByText("Auto-translate messages", { exact: true })).toHaveCount(0);
  await expect(page.getByRole("button", { name: "English" })).toBeVisible();
  await expect(page.getByRole("radio", { name: "Translated" })).toBeVisible();
  await expect(page.getByRole("button", { name: /^UTC[+-]\d{2}:\d{2} .+/ })).toBeVisible();
  await expect(page.getByText(/Effective language:/)).toHaveCount(0);
  await expect(page.getByText(/Effective timezone:/)).toHaveCount(0);
});
