import { expect, test } from "@playwright/test";
import { loginViaApi } from "../../fixtures/auth";
import { waitForSeedState } from "../../fixtures/seedState";
import { dismissOwnerOnboarding } from "../../fixtures/session";

// After the channel Tasks tab and the server-wide Tasks page were unified onto
// TasksPanel (PR #1439, #proj-task task #3), the channel-mode panel:
//   - exposes Board/List view toggle (default Board)
//   - shows a +New Task CTA (channel-mode only)
//   - renders 4 status columns in board view (TODO / IN PROGRESS / IN REVIEW / DONE)
//   - drops the per-status filter tabs that the legacy TaskBoard exposed —
//     filtering by status is implicit in the column layout.
test.describe("channel task board view", () => {
  test("channel Tasks tab can switch between list and board views", async ({ page, request }) => {
    const seedState = await waitForSeedState();
    const login = await loginViaApi(request, seedState);
    await dismissOwnerOnboarding(request, seedState, login.accessToken);

    const tag = `channel-task-board-${Date.now()}`;
    const createResponse = await request.post(`${seedState.urls.api}/api/tasks/channel/${seedState.channel.id}`, {
      headers: {
        Authorization: `Bearer ${login.accessToken}`,
        "X-Server-Id": seedState.server.id,
      },
      data: {
        tasks: [
          { title: `${tag} todo` },
          { title: `${tag} progress` },
          { title: `${tag} done` },
        ],
      },
    });
    expect(createResponse.ok()).toBeTruthy();
    const createBody = await createResponse.json() as { tasks: Array<{ id: string; title: string }> };
    const progressTask = createBody.tasks.find((task) => task.title.endsWith("progress"));
    const doneTask = createBody.tasks.find((task) => task.title.endsWith("done"));
    expect(progressTask).toBeTruthy();
    expect(doneTask).toBeTruthy();

    for (const [task, status] of [[progressTask, "in_progress"], [doneTask, "done"]] as const) {
      const statusResponse = await request.patch(`${seedState.urls.api}/api/tasks/${task!.id}/status`, {
        headers: {
          Authorization: `Bearer ${login.accessToken}`,
          "X-Server-Id": seedState.server.id,
        },
        data: { status },
      });
      expect(statusResponse.ok()).toBeTruthy();
    }

    await page.goto(`/s/${seedState.server.slug}/channel/${seedState.channel.id}`);
    await expect(page.getByTestId("message-scroller")).toBeVisible();
    await page.getByRole("button", { name: /^Tasks$/ }).last().click();

    // TasksPanel mounted in channel mode — the channel-task-panel testid lives
    // on the panel root regardless of view mode.
    await expect(page.getByTestId("channel-task-panel")).toBeVisible();
    await expect(page).toHaveURL(/chatTab=tasks/);

    await expect(page.getByRole("button", { name: /^Chat$/ }).last()).toHaveCSS(
      "background-color",
      "rgb(255, 255, 255)",
    );

    // Default view is Board.
    await expect(page.getByTestId("channel-task-view-board")).toHaveAttribute("aria-checked", "true");
    await expect(page.getByTestId("channel-task-view-list")).toHaveAttribute("aria-checked", "false");
    await expect(page.getByTestId("channel-task-view-list")).toHaveCSS(
      "background-color",
      "rgb(255, 255, 255)",
    );
    await expect(page.getByTestId("channel-task-board-view")).toBeVisible();

    // Channel-mode-only CTA.
    await expect(page.getByRole("button", { name: /new task/i }).first()).toBeVisible();

    // All five status columns render in board view (todo / in_progress /
    // in_review / done / closed). The 5th column (Closed = won't-do) was
    // added in the closed-status PR; both terminal columns (Done, Closed)
    // start collapsed.
    await expect(page.getByText("TODO").first()).toBeVisible();
    await expect(page.getByText("IN PROGRESS").first()).toBeVisible();
    await expect(page.getByText("IN REVIEW").first()).toBeVisible();
    await expect(page.getByText("DONE").first()).toBeVisible();
    await expect(page.getByText("CLOSED").first()).toBeVisible();

    // Cards in expanded columns are visible. DONE is collapsed by default
    // (TasksPanel.tsx initial collapsedStatuses.done = true) in BOTH board
    // and list view — that intentional state hides the seeded `done` card
    // until the user explicitly expands DONE. Expand it once to confirm the
    // card renders, then leave the rest of the test on the default state.
    await expect(page.getByText(`${tag} todo`)).toBeVisible();
    await expect(page.getByText(`${tag} progress`)).toBeVisible();
    await page.getByRole("button", { name: /^Show Done$/ }).click();
    await expect(page.getByText(`${tag} done`)).toBeVisible();
    await expect(page.getByTestId("channel-task-board-view").getByTitle("Delete")).toHaveCount(0);

    // Switch to List view — board grid disappears, expanded-column cards
    // remain visible.
    await page.getByTestId("channel-task-view-list").click();
    await expect(page.getByTestId("channel-task-view-list")).toHaveAttribute("aria-checked", "true");
    await expect(page.getByTestId("channel-task-view-board")).toHaveAttribute("aria-checked", "false");
    await expect(page.getByTestId("channel-task-board-view")).toHaveCount(0);
    await expect(page.getByText(`${tag} progress`)).toBeVisible();

    // Route changes drop the `view=list` URL param when users switch channels.
    // The explicit List choice should still survive because TasksPanel stores
    // the last user-selected view outside the route.
    await page.goto(`/s/${seedState.server.slug}/channel/${seedState.channel.id}`);
    await expect(page.getByTestId("message-scroller")).toBeVisible();
    await page.getByRole("button", { name: /^Tasks$/ }).last().click();
    await expect(page.getByTestId("channel-task-view-list")).toHaveAttribute("aria-checked", "true");
    await expect(page.getByTestId("channel-task-view-board")).toHaveAttribute("aria-checked", "false");
    await expect(page.getByTestId("channel-task-board-view")).toHaveCount(0);

    // Back to Board view.
    await page.getByTestId("channel-task-view-board").click();
    await expect(page.getByTestId("channel-task-view-board")).toHaveAttribute("aria-checked", "true");
    await expect(page.getByTestId("channel-task-view-list")).toHaveAttribute("aria-checked", "false");
    await expect(page.getByTestId("channel-task-board-view")).toBeVisible();
  });

  test("board task card follows the pointer while dragging", async ({ page, request }) => {
    const seedState = await waitForSeedState();
    const login = await loginViaApi(request, seedState);
    await dismissOwnerOnboarding(request, seedState, login.accessToken);

    const title = `task-drag-visual-${Date.now()}`;
    const createResponse = await request.post(`${seedState.urls.api}/api/tasks/channel/${seedState.channel.id}`, {
      headers: {
        Authorization: `Bearer ${login.accessToken}`,
        "X-Server-Id": seedState.server.id,
      },
      data: { tasks: [{ title }] },
    });
    expect(createResponse.ok()).toBeTruthy();

    await page.goto(`/s/${seedState.server.slug}/channel/${seedState.channel.id}`);
    await expect(page.getByTestId("message-scroller")).toBeVisible();
    await page.getByRole("button", { name: /^Tasks$/ }).last().click();
    await expect(page.getByTestId("channel-task-board-view")).toBeVisible();

    const card = page.getByTestId("task-board-draggable-card").filter({ hasText: title }).first();
    await expect(card).toBeVisible();
    const before = await card.boundingBox();
    expect(before).toBeTruthy();

    await page.mouse.move(before!.x + before!.width / 2, before!.y + before!.height / 2);
    await page.mouse.down();
    await page.mouse.move(before!.x + before!.width / 2 + 90, before!.y + before!.height / 2 + 20, {
      steps: 8,
    });

    await expect.poll(async () => {
      const box = await card.boundingBox();
      return box ? box.x - before!.x : 0;
    }).toBeGreaterThan(40);

    await page.mouse.up();
  });

  test("message task status badge updates inline without leaving the chat", async ({ page, request }) => {
    const seedState = await waitForSeedState();
    const login = await loginViaApi(request, seedState);
    await dismissOwnerOnboarding(request, seedState, login.accessToken);

    const tag = `message-task-status-${Date.now()}`;
    const createResponse = await request.post(`${seedState.urls.api}/api/tasks/channel/${seedState.channel.id}`, {
      headers: {
        Authorization: `Bearer ${login.accessToken}`,
        "X-Server-Id": seedState.server.id,
      },
      data: {
        tasks: [{ title: `${tag} progress` }],
      },
    });
    expect(createResponse.ok()).toBeTruthy();
    const createBody = await createResponse.json() as { tasks: Array<{ id: string; title: string }> };
    const task = createBody.tasks[0];
    expect(task).toBeTruthy();

    const statusResponse = await request.patch(`${seedState.urls.api}/api/tasks/${task.id}/status`, {
      headers: {
        Authorization: `Bearer ${login.accessToken}`,
        "X-Server-Id": seedState.server.id,
      },
      data: { status: "in_progress" },
    });
    expect(statusResponse.ok()).toBeTruthy();

    await page.goto(`/s/${seedState.server.slug}/channel/${seedState.channel.id}`);
    await expect(page.getByTestId("message-scroller")).toBeVisible();

    const message = page.locator(`#message-${task.id}`).first();
    const badge = message.locator('[data-testid="message-task-badge"]');
    await expect(badge).toHaveAttribute("data-task-status", "in_progress");

    await badge.click();
    await expect(page.getByTestId("message-task-status-menu")).toBeVisible();
    await page.getByTestId("message-task-status-option-done").click();

    await expect(badge).toHaveAttribute("data-task-status", "done");
    await expect(page.getByTestId("message-scroller")).toBeVisible();
    await expect(page.getByTestId("channel-task-panel")).toHaveCount(0);
    await expect(page).not.toHaveURL(/chatTab=tasks/);
  });
});
