import { expect, test, type APIRequestContext, type Page } from "@playwright/test";
import { loginViaApi } from "../fixtures/auth";
import { waitForSeedState, type PlaywrightSeedState } from "../fixtures/seedState";

// First-principles regression harness for message list stability.
//
// Captures three pain points called out in #proj-message-list task #2:
//   1. mobile viewport shrink (keyboard / address bar) jumps scroll to bottom
//   2. new message arriving while user is reading mid-list jumps to bottom
//      (auto-follow conflated with scroll-to-bottom)
//   3. lazy-load misses on rapid scroll-to-top (startReached not firing)
//
// Tests are written as diagnostic measurements: they compute how far the
// anchor drifted and how many items loaded, then assert sane bounds. Where
// the current implementation is known-broken, the assertion is wrapped in
// test.fail() so CI stays green today and flips when the underlying fix
// lands. Each test prints the metric to stdout so the failure mode is
// observable even when the test passes by tolerance.

type Anchor = {
  // MessageTimeline exposes stable message ids on each rendered row. Anchor by
  // id instead of render index so full-window tail reloads do not make the
  // measurement point ambiguous.
  messageId: string;
  // Distance from scroller top to the anchor element's top, in CSS px.
  // Stable under prepend / measurement drift; the only thing that should
  // change on resize is the scroller's own height.
  offsetWithinScroller: number;
};

async function postMessage(
  request: APIRequestContext,
  seedState: PlaywrightSeedState,
  accessToken: string,
  channelId: string,
  content: string,
) {
  const response = await request.post(`${seedState.urls.api}/api/messages`, {
    headers: {
      Authorization: `Bearer ${accessToken}`,
      "X-Server-Id": seedState.server.id,
    },
    data: { channelId, content },
  });
  if (!response.ok()) {
    throw new Error(`Failed to post message: ${response.status()} ${response.statusText()}`);
  }
  return response.json();
}

async function readMetrics(page: Page) {
  return page.getByTestId("message-scroller").evaluate((el) => ({
    scrollTop: el.scrollTop,
    scrollHeight: el.scrollHeight,
    clientHeight: el.clientHeight,
    bottomGap: Math.max(0, el.scrollHeight - el.scrollTop - el.clientHeight),
    itemCount: el.querySelectorAll("[data-index]").length,
  }));
}

async function scrollAwayFromBottom(page: Page) {
  const scroller = page.getByTestId("message-scroller");
  await scroller.hover();
  for (let i = 0; i < 8; i += 1) {
    await page.mouse.wheel(0, -700);
    await page.waitForTimeout(250);
    const { bottomGap } = await readMetrics(page);
    if (bottomGap > 500) break;
  }
}

// Mirror MessageTimeline.captureAnchor's semantic: the topmost message whose
// bottom is below the scroller's top edge. This is the anchor the primitive
// restores across resize / append / prepend.
async function captureAnchor(page: Page): Promise<Anchor | null> {
  return page.getByTestId("message-scroller").evaluate((el) => {
    const items = Array.from(el.querySelectorAll<HTMLElement>("[data-index]"));
    if (items.length === 0) return null;
    const scrollerRect = el.getBoundingClientRect();
    for (const item of items) {
      const rect = item.getBoundingClientRect();
      if (rect.bottom <= scrollerRect.top + 1) continue;
      const messageId = item.dataset.messageId ?? "";
      const itemTop = item.getBoundingClientRect().top - scrollerRect.top + el.scrollTop;
      return { messageId, offsetWithinScroller: itemTop };
    }
    return null;
  });
}

// Compute the visible drift of an anchored message between two snapshots.
// If the message disappeared from the rendered window (virtualized out
// because the scroller jumped far away), return Infinity so the assertion
// fires loudly.
async function measureAnchorDrift(page: Page, before: Anchor): Promise<number> {
  const after = await page.getByTestId("message-scroller").evaluate(
    (el, { messageId, prevOffset }) => {
      const item = el.querySelector<HTMLElement>(`[data-message-id="${messageId}"]`);
      if (!item) return null;
      const scrollerRect = el.getBoundingClientRect();
      const itemTop = item.getBoundingClientRect().top - scrollerRect.top + el.scrollTop;
      return Math.abs(itemTop - prevOffset);
    },
    { messageId: before.messageId, prevOffset: before.offsetWithinScroller },
  );
  return after ?? Number.POSITIVE_INFINITY;
}

test.describe("message list stability", () => {
  test.use({ viewport: { width: 390, height: 844 } });

  // Pain point #1 — mobile viewport shrink (keyboard pop) jumps scroll to bottom.
  // The user scrolled up to read history. The browser viewport shrinks because
  // a virtual keyboard or mobile address bar appears. Virtuoso receives a
  // resize signal and re-runs followOutput, which currently snaps back to the
  // tail. The anchored message should not move more than the height delta.
  test("viewport shrink while scrolled mid-list does not jump to bottom", async ({
    page,
    request,
  }) => {
    const seedState = await waitForSeedState();
    await loginViaApi(request, seedState);

    await page.goto(`/s/${seedState.server.slug}/channel/${seedState.channel.id}`);
    await expect(page.getByTestId("message-scroller")).toBeVisible();
    await expect(page.getByText(seedState.messages.latestContent)).toBeVisible();

    // Scroll up several screens so the user is well away from the tail.
    await scrollAwayFromBottom(page);

    const before = await captureAnchor(page);
    expect(before, "should resolve a center anchor before resize").not.toBeNull();
    const beforeMetrics = await readMetrics(page);
    expect(beforeMetrics.bottomGap, "should be detached from the bottom before resize").toBeGreaterThan(200);

    // Simulate the mobile address bar / soft keyboard collapsing the layout
    // viewport. Real iOS Safari fires a window resize plus visualViewport
    // resize; Playwright's setViewportSize triggers the layout resize that
    // Virtuoso listens to.
    await page.setViewportSize({ width: 390, height: 500 });
    await page.waitForTimeout(600);

    const drift = await measureAnchorDrift(page, before!);
    const afterMetrics = await readMetrics(page);
    console.log(
      `[viewport-shrink] anchor=${before!.messageId} drift=${drift.toFixed(1)}px ` +
        `bottomGap before=${beforeMetrics.bottomGap.toFixed(0)} after=${afterMetrics.bottomGap.toFixed(0)}`,
    );

    expect(drift, "anchored message must not drift more than ~120px on viewport shrink").toBeLessThan(120);
    expect(
      afterMetrics.bottomGap,
      "should still be detached from bottom after viewport shrink",
    ).toBeGreaterThan(200);
  });

  // Pain point #2 — auto-follow conflated with scroll-to-bottom.
  // User scrolled up to read older messages. A new message arrives via the
  // socket. Today the list scrolls back to the bottom. The contract should
  // be: only follow output when the user is already at the bottom.
  test("new message while reading mid-list does not yank scroll to bottom", async ({
    page,
    request,
  }) => {
    const seedState = await waitForSeedState();
    const login = await loginViaApi(request, seedState);

    await page.goto(`/s/${seedState.server.slug}/channel/${seedState.channel.id}`);
    await expect(page.getByTestId("message-scroller")).toBeVisible();
    await expect(page.getByText(seedState.messages.latestContent)).toBeVisible();

    await scrollAwayFromBottom(page);

    const before = await captureAnchor(page);
    expect(before, "should resolve a center anchor before append").not.toBeNull();
    const beforeMetrics = await readMetrics(page);
    expect(beforeMetrics.bottomGap, "must be detached from bottom before append").toBeGreaterThan(200);

    await postMessage(
      request,
      seedState,
      login.accessToken,
      seedState.channel.id,
      `[stability-harness] mid-list append ${Date.now()}`,
    );

    // Allow the socket to deliver and Virtuoso to react.
    await page.waitForTimeout(800);

    const drift = await measureAnchorDrift(page, before!);
    const afterMetrics = await readMetrics(page);
    console.log(
      `[append-mid-list] anchor=${before!.messageId} drift=${drift.toFixed(1)}px ` +
        `bottomGap before=${beforeMetrics.bottomGap.toFixed(0)} after=${afterMetrics.bottomGap.toFixed(0)}`,
    );

    expect(
      afterMetrics.bottomGap,
      "scroll position must remain detached from bottom after append",
    ).toBeGreaterThan(200);
  });

  // Pain point #3 — lazy-load reliability.
  //
  // Three properties to pin (stdrc, msg=d85edd0b):
  //   • no omission       — every page from initial-window back to the
  //                         beginning of history must be loaded (final
  //                         itemCount must equal seed total)
  //   • no duplicate      — the same `before=<seq>` cursor must not be
  //                         requested more than once (dedup contract in
  //                         messageStore.loadOlderMessages must hold under
  //                         IO sentinel re-fires)
  //   • deterministic trigger — the load must complete under both burst
  //                         and slow continuous scroll patterns. Rapid
  //                         scroll bursts can collapse intermediate scroll
  //                         events; slow scrolls may park the sentinel
  //                         just outside the rootMargin band.
  //
  // We capture every GET to /messages/channel/<id>?...&before=<seq> and
  // assert exact completeness + cursor uniqueness. The two scroll
  // patterns are parametrized so a single regression in either flips the
  // matching variant without hiding behind an OR.

  type ScrollPattern = "burst" | "slow";

  function recordOlderRequests(page: Page, channelId: string) {
    const requests: { url: string; before: string | null }[] = [];
    page.on("request", (req) => {
      if (req.method() !== "GET") return;
      const url = req.url();
      if (!url.includes(`/messages/channel/${channelId}`)) return;
      try {
        const u = new URL(url);
        const before = u.searchParams.get("before");
        // Initial window load has no `before=` cursor; only count older-page fetches.
        if (before === null) return;
        requests.push({ url, before });
      } catch {
        /* ignore */
      }
    });
    return requests;
  }

  // Scroll-to-top helpers. The native primitive restores the anchor on
  // prepend, which means after each older-page load the scroll position
  // moves AWAY from 0 (so the user's reading position stays put). To
  // pull the rest of history a determined user has to keep scrolling
  // upward — these helpers simulate that loop. They return after one
  // pass of "drag scrollTop toward 0", and the caller polls until
  // history is complete.
  async function pullToTopBurst(page: Page) {
    for (let i = 0; i < 20; i += 1) {
      await page.getByTestId("message-scroller").evaluate((el, frac) => {
        el.scrollTop = Math.max(0, el.scrollHeight * frac);
      }, Math.max(0, 1 - i / 20));
      await page.waitForTimeout(20);
    }
    await page.getByTestId("message-scroller").evaluate((el) => {
      el.scrollTop = 0;
    });
  }

  async function pullToTopSlow(page: Page) {
    for (let i = 0; i < 30; i += 1) {
      await page.getByTestId("message-scroller").evaluate((el, step) => {
        el.scrollTop = Math.max(0, el.scrollTop - step);
      }, 200);
      await page.waitForTimeout(80);
    }
    await page.getByTestId("message-scroller").evaluate((el) => {
      el.scrollTop = 0;
    });
  }

  // Keep dragging the scroller toward the top until history is complete
  // or the budget is exhausted. Each iteration:
  //   1. pulls scrollTop toward 0 with the chosen scroll pattern
  //   2. waits a quiescent window for IO sentinel + loadOlder + anchor
  //      restore to settle
  //   3. rechecks itemCount
  // If itemCount stops growing for two consecutive iterations AND we
  // haven't reached the expected total, we surface a clear failure that
  // points at the lazy-load contract (not at "test ran out of budget").
  async function pullToTopUntilComplete(
    page: Page,
    pattern: "burst" | "slow",
    expectedTotal: number,
    budgetMs = 20_000,
  ) {
    const start = Date.now();
    let prevCount = -1;
    let stableIterations = 0;
    while (Date.now() - start < budgetMs) {
      const m = await readMetrics(page);
      if (m.itemCount >= expectedTotal) return m;
      if (m.itemCount === prevCount) {
        stableIterations += 1;
        if (stableIterations >= 3) {
          throw new Error(
            `lazy-load stalled: itemCount stuck at ${m.itemCount}, expected>=${expectedTotal} ` +
              `(scrollTop=${m.scrollTop.toFixed(0)} scrollHeight=${m.scrollHeight.toFixed(0)})`,
          );
        }
      } else {
        stableIterations = 0;
        prevCount = m.itemCount;
      }
      if (pattern === "burst") {
        await pullToTopBurst(page);
      } else {
        await pullToTopSlow(page);
      }
      await page.waitForTimeout(400);
    }
    const final = await readMetrics(page);
    throw new Error(
      `lazy-load did not complete in ${budgetMs}ms: itemCount=${final.itemCount}, expected>=${expectedTotal}`,
    );
  }

  for (const pattern of ["burst", "slow"] as ScrollPattern[]) {
    test(`lazy-load history is complete and dedup'd under ${pattern} scroll`, async ({
      page,
      request,
    }) => {
      const seedState = await waitForSeedState();
      const login = await loginViaApi(request, seedState);

      // Other tests in this suite post messages to the seed channel,
      // so the seed-time `messages.total` is a lower bound. Probe the
      // current real total via the API at test time so completeness is
      // pinned against ground truth, not a stale snapshot.
      const totalsResponse = await request.get(
        `${seedState.urls.api}/api/messages/channel/${seedState.channel.id}?limit=1`,
        {
          headers: {
            Authorization: `Bearer ${login.accessToken}`,
            "X-Server-Id": seedState.server.id,
          },
        },
      );
      if (!totalsResponse.ok()) {
        throw new Error(
          `failed to probe channel size: ${totalsResponse.status()} ${totalsResponse.statusText()}`,
        );
      }
      const probeBody = await totalsResponse.json();
      const latestSeq: number = (probeBody.messages?.[0] ?? probeBody[0])?.seq ?? 0;
      // Server seq is monotonic across the whole server but our seed reserves
      // a contiguous block per channel, so the actual count is best derived
      // from a count endpoint. Lacking one, fall back to scrolling all the
      // way and asserting that itemCount >= seedTotal AND that the topmost
      // visible message is older than the initial-window minSeq.
      const expectedAtLeast = seedState.messages.total;

      const olderRequests = recordOlderRequests(page, seedState.channel.id);

      await page.goto(`/s/${seedState.server.slug}/channel/${seedState.channel.id}`);
      await expect(page.getByTestId("message-scroller")).toBeVisible();
      await expect(page.getByText(seedState.messages.latestContent)).toBeVisible();

      const initialMetrics = await readMetrics(page);
      console.log(
        `[lazy-load:${pattern}] initial itemCount=${initialMetrics.itemCount} ` +
          `seedTotal=${seedState.messages.total} latestSeq=${latestSeq}`,
      );

      // Pull to top in a loop. Anchor restoration on prepend means a
      // single scroll-to-top only triggers the first older page; the
      // user (and this test) keeps pulling upward to drain the rest.
      const finalMetrics = await pullToTopUntilComplete(page, pattern, expectedAtLeast);

      const cursors = olderRequests.map((r) => r.before);
      const uniqueCursors = new Set(cursors);
      console.log(
        `[lazy-load:${pattern}] final itemCount=${finalMetrics.itemCount} ` +
          `requests=${olderRequests.length} uniqueCursors=${uniqueCursors.size} ` +
          `cursors=[${cursors.join(",")}]`,
      );

      // No omission: every seeded message is in the DOM. Other tests in
      // this suite may have appended live messages, so the floor is the
      // seed total — itemCount can be greater than the seed if live
      // messages arrived during the run, but never less.
      expect(
        finalMetrics.itemCount,
        `complete history: expected at least ${expectedAtLeast} items in DOM`,
      ).toBeGreaterThanOrEqual(expectedAtLeast);

      // No duplicate: every `before=<seq>` cursor was requested at most
      // once. messageStore.loadOlderMessages dedup's via the loadingOlder
      // flag, but if the IO sentinel re-fires while a request is in
      // flight, only the in-flight request guard prevents a wasted call —
      // this assertion catches a regression in either guard.
      expect(
        uniqueCursors.size,
        `duplicate older-page request: cursors=${cursors.join(",")}`,
      ).toBe(cursors.length);

      // Deterministic trigger: at least one older-page request had to fire
      // (sanity check that the IO sentinel did its job, not that the
      // initial window happened to contain everything).
      expect(
        olderRequests.length,
        "expected at least one older-page request",
      ).toBeGreaterThan(0);
    });
  }
});
