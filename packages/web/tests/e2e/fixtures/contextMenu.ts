import { expect, type Locator, type Page } from "@playwright/test";

export function shareMessagesMenu(page: Page) {
  return page.getByRole("menuitem", { name: /Share messages/i });
}

export async function openShareMessagesMenu(page: Page, target: Locator) {
  const menu = shareMessagesMenu(page);
  for (let attempt = 0; attempt < 3; attempt += 1) {
    await target.scrollIntoViewIfNeeded();
    await target.click({ button: "right" });
    try {
      await expect(menu).toBeVisible({ timeout: 3000 });
      return menu;
    } catch (error) {
      if (attempt === 2) throw error;
      await page.keyboard.press("Escape").catch(() => {});
    }
  }
  return menu;
}

export async function clickShareMessagesMenu(page: Page, target: Locator) {
  for (let attempt = 0; attempt < 3; attempt += 1) {
    const menu = await openShareMessagesMenu(page, target);
    try {
      await menu.click({ timeout: 3000 });
      return;
    } catch (error) {
      if (attempt === 2) throw error;
      await page.keyboard.press("Escape").catch(() => {});
    }
  }
}
