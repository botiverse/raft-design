import { expect, test } from "@playwright/test";
import { CURRENT_LEGAL_ACCEPTANCE } from "@slock-ai/shared";
import { waitForSeedState } from "../../fixtures/seedState";

test.use({ storageState: { cookies: [], origins: [] } });

async function acceptLegalTerms(page: import("@playwright/test").Page) {
  await page
    .locator("label")
    .filter({ hasText: /I agree to the Terms of Service/ })
    .click();
}

test.describe("P0 auth register", () => {
  test("new user creates an account and lands on email verification", async ({ page }) => {
    const name = `pwuser_${Date.now()}`;
    const email = `${name}@slock.test`;

    await page.goto("/");

    await page.getByRole("button", { name: "Create One" }).click();
    await expect(page.getByRole("heading", { name: "Create Account" })).toBeVisible();

    await page.locator('input[type="text"]').fill(name);
    await page.locator('input[type="email"]').fill(email);
    await page.locator('input[type="password"]').fill("playwright-password-123");
    await expect(page.getByRole("button", { name: "Create Account" })).toBeDisabled();
    await acceptLegalTerms(page);
    await page.getByRole("button", { name: "Create Account" }).click();

    await expect(page.getByRole("heading", { name: "Check your email" })).toBeVisible();
    await expect(page.getByText(email)).toBeVisible();
    await expect(page.getByRole("button", { name: "Resend Verification Email" })).toBeVisible();
  });

  test("duplicate email shows a registration error", async ({ page }) => {
    const seedState = await waitForSeedState();

    await page.goto("/");

    await page.getByRole("button", { name: "Create One" }).click();
    await page.locator('input[type="text"]').fill("pwdup_user");
    await page.locator('input[type="email"]').fill(seedState.user.email);
    await page.locator('input[type="password"]').fill("playwright-password-123");
    await acceptLegalTerms(page);
    await page.getByRole("button", { name: "Create Account" }).click();

    await expect(page.getByText("Email is already registered")).toBeVisible();
    await expect(page.getByRole("heading", { name: "Create Account" })).toBeVisible();
  });

  test("register API rejects stale legal versions", async ({ request }) => {
    const name = `pwstale_${Date.now()}`;
    const response = await request.post("/api/auth/register", {
      data: {
        email: `${name}@slock.test`,
        password: "playwright-password-123",
        name,
        acceptTerms: true,
        termsVersion: "stale",
        privacyVersion: CURRENT_LEGAL_ACCEPTANCE.privacyVersion,
      },
    });

    expect(response.status()).toBe(409);
    await expect(response.json()).resolves.toEqual(expect.objectContaining({ error: "TERMS_CHANGED" }));
  });
});
