import { expect, test } from "@playwright/test";
import { loginViaApi } from "../../fixtures/auth";
import { waitForSeedState } from "../../fixtures/seedState";
import { dismissOwnerOnboarding } from "../../fixtures/session";

// Repro: task #141 (#proj-uiux:c697be7a 2026-05-08 stdrc).
//
//   "在 channel 的 tasks tab，点开 task thread panel 之后，
//    在主面板切换 task 状态，thread panel 的状态 badge 没有及时更新"
//
// PR #1037 (e4fa2df5b) added the ThreadPanel ↔ taskStore subscription that
// keeps the parent badge in sync with mark-as-done from the THREAD HEADER.
// PR #1439 (62c507cb) unified the channel Task tab with TasksPanel and added
// inline status editing on TaskCard / TaskItem in the MAIN panel. The bug
// reported in #141 is that those main-panel status edits do NOT propagate
// to the thread panel header badge until a page refresh.
test.describe("P0 thread task status sync from main panel", () => {
  test("BOARD view: changing task status from channel Tasks tab updates thread badge without refresh", async ({
    page,
    request,
  }) => {
    const seedState = await waitForSeedState();
    const login = await loginViaApi(request, seedState);
    await dismissOwnerOnboarding(request, seedState, login.accessToken);

    const tag = `task-141-repro-${Date.now()}`;

    const createResponse = await request.post(
      `${seedState.urls.api}/api/tasks/channel/${seedState.channel.id}`,
      {
        headers: {
          Authorization: `Bearer ${login.accessToken}`,
          "X-Server-Id": seedState.server.id,
        },
        data: { tasks: [{ title: tag }] },
      },
    );
    expect(createResponse.ok()).toBeTruthy();
    const createBody = await createResponse.json() as {
      tasks: Array<{ id: string; messageId: string; title: string }>;
    };
    const task = createBody.tasks[0];
    expect(task).toBeTruthy();

    await page.goto(`/s/${seedState.server.slug}/channel/${seedState.channel.id}`);
    await expect(page.getByTestId("message-scroller")).toBeVisible();

    // Switch to the channel Tasks tab.
    await page.getByRole("button", { name: /^Tasks$/ }).last().click();
    await expect(page.getByTestId("channel-task-panel")).toBeVisible();

    // Find the TaskCard subtree for our task (board view).
    // Locate the unique TaskCard via a locator that walks up from the title
    // text to the card's bordered container (TaskCard.tsx wraps in a
    // `.shadow-brutal-sm` div). `.first()` on a bare `hasText` filter would
    // match any ancestor and trip strict mode when prior tests pollute the
    // DB with same-channel tasks.
    const taskTitle = page.getByTestId("channel-task-panel").getByText(tag, { exact: true });
    const taskCard = taskTitle.locator("xpath=ancestor::div[contains(@class, 'shadow-brutal-sm')][1]");
    await expect(taskCard).toBeVisible();

    // Open the thread panel by clicking the task title button on the card.
    await taskTitle.click();

    const threadParent = page.locator('[data-testid="thread-panel-parent"]');
    await expect(threadParent).toBeVisible();

    const threadBadge = threadParent.locator('[data-testid="message-task-badge"]');
    await expect(threadBadge).toHaveAttribute("data-task-status", "todo");

    // Change status from the MAIN panel TaskCard's inline status pill.
    // STATUS_STYLES.todo.label is "Todo" (Title Case) — the InlineBadgeEditor
    // button shows that text. Status badges sit next to case-sensitive
    // identifiers (`@assignee`) so they opt out of the brutal uppercase
    // transform — stdrc msg=ce25da45 + msg=65681d15 (option B). Click it to
    // open the dropdown, then pick the "In Progress" option (matches
    // STATUS_LABELS).
    await taskCard.getByRole("button", { name: /Todo/ }).click();
    await page.getByTestId("task-status-option-in_progress").click();

    // Bug: thread panel parent badge stays "todo" until a page refresh.
    // Pre-fix this assertion fails. Post-fix it passes.
    await expect(threadBadge).toHaveAttribute("data-task-status", "in_progress");
  });

  test("LIST view: changing task status from channel Tasks tab updates thread badge without refresh", async ({
    page,
    request,
  }) => {
    const seedState = await waitForSeedState();
    const login = await loginViaApi(request, seedState);
    await dismissOwnerOnboarding(request, seedState, login.accessToken);

    const tag = `task-141-repro-list-${Date.now()}`;

    const createResponse = await request.post(
      `${seedState.urls.api}/api/tasks/channel/${seedState.channel.id}`,
      {
        headers: {
          Authorization: `Bearer ${login.accessToken}`,
          "X-Server-Id": seedState.server.id,
        },
        data: { tasks: [{ title: tag }] },
      },
    );
    expect(createResponse.ok()).toBeTruthy();

    await page.goto(`/s/${seedState.server.slug}/channel/${seedState.channel.id}`);
    await expect(page.getByTestId("message-scroller")).toBeVisible();
    await page.getByRole("button", { name: /^Tasks$/ }).last().click();
    await expect(page.getByTestId("channel-task-panel")).toBeVisible();

    // Switch to LIST view.
    await page.getByTestId("channel-task-view-list").click();

    const taskTitle = page.getByTestId("channel-task-panel").getByText(tag, { exact: true });
    const taskCard = taskTitle.locator("xpath=ancestor::div[contains(@class, 'shadow-brutal-sm')][1]");
    await expect(taskCard).toBeVisible();

    // Open the thread panel by clicking the task title.
    await taskTitle.click();

    const threadParent = page.locator('[data-testid="thread-panel-parent"]');
    await expect(threadParent).toBeVisible();
    const threadBadge = threadParent.locator('[data-testid="message-task-badge"]');
    await expect(threadBadge).toHaveAttribute("data-task-status", "todo");

    await taskCard.getByRole("button", { name: /Todo/ }).click();
    await page.getByTestId("task-status-option-in_progress").click();

    await expect(threadBadge).toHaveAttribute("data-task-status", "in_progress");
  });

  test("CLOSED status: changing task status to closed updates thread badge without refresh", async ({
    page,
    request,
  }) => {
    const seedState = await waitForSeedState();
    const login = await loginViaApi(request, seedState);
    await dismissOwnerOnboarding(request, seedState, login.accessToken);

    const tag = `task-141-repro-closed-${Date.now()}`;

    const createResponse = await request.post(
      `${seedState.urls.api}/api/tasks/channel/${seedState.channel.id}`,
      {
        headers: {
          Authorization: `Bearer ${login.accessToken}`,
          "X-Server-Id": seedState.server.id,
        },
        data: { tasks: [{ title: tag }] },
      },
    );
    expect(createResponse.ok()).toBeTruthy();

    await page.goto(`/s/${seedState.server.slug}/channel/${seedState.channel.id}`);
    await expect(page.getByTestId("message-scroller")).toBeVisible();
    await page.getByRole("button", { name: /^Tasks$/ }).last().click();
    await expect(page.getByTestId("channel-task-panel")).toBeVisible();

    const taskTitle = page.getByTestId("channel-task-panel").getByText(tag, { exact: true });
    const taskCard = taskTitle.locator("xpath=ancestor::div[contains(@class, 'shadow-brutal-sm')][1]");
    await expect(taskCard).toBeVisible();
    await taskTitle.click();

    const threadParent = page.locator('[data-testid="thread-panel-parent"]');
    await expect(threadParent).toBeVisible();
    const threadBadge = threadParent.locator('[data-testid="message-task-badge"]');
    await expect(threadBadge).toHaveAttribute("data-task-status", "todo");

    // todo → closed. After the fix, the below-content variant must include
    // a `closed` config; pre-fix the variant fell back to statusConfig.todo,
    // so the badge stayed visually orange/Circle even though the
    // data-task-status attribute correctly read "closed".
    await taskCard.getByRole("button", { name: /Todo/ }).click();
    await page.getByTestId("task-status-option-closed").click();

    await expect(threadBadge).toHaveAttribute("data-task-status", "closed");
    // Visual sanity: the badge background must change away from the "todo"
    // orange. The exact background color is owned by Bugen (#proj-uiux task
    // #145 — CLOSED neutral color). Here we just verify the badge is no
    // longer using the todo orange — i.e. the variant has a real entry for
    // "closed" rather than silently falling through to statusConfig.todo.
    await expect(threadBadge).not.toHaveClass(/bg-brutal-orange/);
  });
});
