import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { resolve } from "node:path";
import test from "node:test";
import type { InboxItem } from "../src/store/inboxStore.js";

class MemoryStorage {
  private readonly map = new Map<string, string>();

  getItem(key: string) {
    return this.map.get(key) ?? null;
  }

  setItem(key: string, value: string) {
    this.map.set(key, value);
  }

  removeItem(key: string) {
    this.map.delete(key);
  }
}

Object.defineProperty(globalThis, "localStorage", {
  value: new MemoryStorage(),
  configurable: true,
});
Object.defineProperty(globalThis, "sessionStorage", {
  value: new MemoryStorage(),
  configurable: true,
});

const repoRoot = resolve(import.meta.dirname, "..");
const { useInboxStore, getInboxItemKey } = await import("../src/store/inboxStore.js");
const { default: api } = await import("../src/api/client.js");

const originalPost = api.post.bind(api);
const originalGet = api.get.bind(api);

function makeChannelItem(overrides: Partial<Extract<InboxItem, { kind: "channel" | "dm" }>> = {}): Extract<InboxItem, { kind: "channel" | "dm" }> {
  return {
    kind: "channel",
    channelId: "channel-1",
    channelName: "general",
    channelType: "channel",
    lastMessageId: "message-2",
    firstUnreadMessageId: "message-1",
    lastMessageAt: "2026-05-10T00:00:00.000Z",
    lastMessagePreview: "hello @me",
    lastMessageSenderType: "user",
    lastMessageSenderId: "user-1",
    lastMessageSenderName: "alice",
    unreadCount: 2,
    hasMention: true,
    ...overrides,
  };
}

function resetInbox(items: InboxItem[] = []) {
  useInboxStore.setState({
    items,
    filter: "all",
    loading: false,
    loadingMore: false,
    hasMore: true,
    totalCount: items.length,
    totalUnreadCount: items.reduce((sum, item) => sum + item.unreadCount, 0),
    scrollTop: 0,
    focusedItemKey: null,
  });
}

function restoreApi() {
  api.post = originalPost;
  api.get = originalGet;
}

function deferred<T>() {
  let resolve!: (value: T) => void;
  let reject!: (reason?: unknown) => void;
  const promise = new Promise<T>((res, rej) => {
    resolve = res;
    reject = rej;
  });
  return { promise, resolve, reject };
}

async function flushPromises() {
  await new Promise((resolve) => setTimeout(resolve, 0));
}

test("inbox mention badge is wired to the unread-range hasMention flag", () => {
  const source = readFileSync(resolve(repoRoot, "src/components/thread/ThreadsInbox.tsx"), "utf8");

  assert.match(source, /const shouldShowMentionBadge = filter !== "mentions" && item\.hasMention && unreadCount > 0;/);
  assert.match(source, /data-testid="inbox-mention-badge"/);
  assert.match(source, /title="Unread messages mention you"/);
});

test("mentions filter hides the redundant mention-you badge", () => {
  const source = readFileSync(resolve(repoRoot, "src/components/thread/ThreadsInbox.tsx"), "utf8");

  assert.match(source, /filter: InboxFilter;/);
  assert.match(source, /item=\{item\}\s+filter=\{filter\}/);
  assert.match(source, /\{shouldShowMentionBadge && \(/);
});

test("markRead clears the unread-range mention bit optimistically", async () => {
  const item = makeChannelItem();
  const postCalls: string[] = [];
  api.post = (async (url: string) => {
    postCalls.push(url);
    return { data: {} };
  }) as typeof api.post;

  try {
    resetInbox([item]);

    await useInboxStore.getState().markRead(item);

    const updated = useInboxStore.getState().items.find((entry) => getInboxItemKey(entry) === getInboxItemKey(item));
    assert.ok(updated);
    assert.equal(updated.unreadCount, 0);
    assert.equal(updated.firstUnreadMessageId, null);
    assert.equal(updated.hasMention, false);
    assert.equal(useInboxStore.getState().totalUnreadCount, 0);
    assert.deepEqual(postCalls, ["/channels/channel-1/read-all"]);
  } finally {
    restoreApi();
    resetInbox();
  }
});

test("markAllRead clears mention badges on retained inbox rows", async () => {
  const channelItem = makeChannelItem({ channelId: "channel-1", unreadCount: 2, hasMention: true });
  const dmItem = makeChannelItem({
    kind: "dm",
    channelId: "dm-1",
    channelName: "dm-alice",
    channelType: "dm",
    unreadCount: 1,
    hasMention: true,
  });
  let resolvePost: (() => void) | null = null;
  api.post = (() => new Promise((resolve) => {
    resolvePost = () => resolve({ data: {} });
  })) as typeof api.post;
  api.get = (async (url: string) => {
    if (url === "/channels/unread") return { data: {} };
    if (url === "/channels/threads/followed") return { data: { threads: [] } };
    if (url === "/channels/inbox") return { data: { items: [], hasMore: false, totalCount: 0, totalUnreadCount: 0 } };
    return { data: {} };
  }) as typeof api.get;

  try {
    resetInbox([channelItem, dmItem]);

    const markAllPromise = useInboxStore.getState().markAllRead();

    const state = useInboxStore.getState();
    assert.equal(state.totalUnreadCount, 0);
    assert.deepEqual(
      state.items.map((item) => ({ key: getInboxItemKey(item), unreadCount: item.unreadCount, hasMention: item.hasMention })),
      [
        { key: "channel:channel-1", unreadCount: 0, hasMention: false },
        { key: "dm:dm-1", unreadCount: 0, hasMention: false },
      ],
    );
    assert.ok(resolvePost);
    resolvePost();
    await markAllPromise;
  } finally {
    restoreApi();
    resetInbox();
  }
});

test("markDone removes the activity row before the server responds", async () => {
  const item = makeChannelItem({ channelId: "channel-done", unreadCount: 3 });
  const postResponse = deferred<{ data: Record<string, never> }>();
  const postCalls: string[] = [];
  api.post = ((url: string) => {
    postCalls.push(url);
    return postResponse.promise;
  }) as typeof api.post;

  try {
    resetInbox([item]);

    const markDonePromise = useInboxStore.getState().markDone(item);

    assert.deepEqual(useInboxStore.getState().items, []);
    assert.equal(useInboxStore.getState().totalCount, 0);
    assert.equal(useInboxStore.getState().totalUnreadCount, 0);
    assert.deepEqual(postCalls, ["/channels/inbox/done"]);

    postResponse.resolve({ data: {} });
    await markDonePromise;
  } finally {
    restoreApi();
    resetInbox();
  }
});

test("markDone refreshes activity if the optimistic done request fails", async () => {
  const item = makeChannelItem({ channelId: "channel-fail", unreadCount: 2 });
  const getCalls: string[] = [];
  const originalConsoleError = console.error;
  api.post = (async () => {
    throw new Error("done failed");
  }) as typeof api.post;
  api.get = (async (url: string) => {
    getCalls.push(url);
    if (url === "/channels/inbox") {
      return { data: { items: [item], hasMore: false, totalCount: 1, totalUnreadCount: 2 } };
    }
    if (url === "/channels/unread") return { data: { "channel-fail": 2 } };
    return { data: {} };
  }) as typeof api.get;

  try {
    console.error = () => {};
    resetInbox([item]);

    await useInboxStore.getState().markDone(item);

    assert.deepEqual(useInboxStore.getState().items.map((entry) => getInboxItemKey(entry)), ["channel:channel-fail"]);
    assert.equal(useInboxStore.getState().totalCount, 1);
    assert.equal(useInboxStore.getState().totalUnreadCount, 2);
    assert.ok(getCalls.includes("/channels/inbox"));
  } finally {
    console.error = originalConsoleError;
    restoreApi();
    resetInbox();
  }
});

test("stale inbox filter response cannot overwrite the current filter view", async () => {
  const unreadItem = makeChannelItem({
    channelId: "unread-channel",
    channelName: "unread",
    lastMessagePreview: "unread-only row",
    unreadCount: 1,
  });
  const allItem = makeChannelItem({
    channelId: "all-channel",
    channelName: "all",
    lastMessagePreview: "all row",
    unreadCount: 0,
    hasMention: false,
  });
  const unreadResponse = deferred<{ data: { items: InboxItem[]; hasMore: boolean; totalCount: number; totalUnreadCount: number } }>();
  const allResponse = deferred<{ data: { items: InboxItem[]; hasMore: boolean; totalCount: number; totalUnreadCount: number } }>();
  const requestedFilters: string[] = [];

  api.get = ((url: string, config?: { params?: { filter?: string } }) => {
    if (url !== "/channels/inbox") return Promise.resolve({ data: {} });
    const filter = config?.params?.filter ?? "all";
    requestedFilters.push(filter);
    if (filter === "unread") return unreadResponse.promise;
    if (filter === "all") return allResponse.promise;
    return Promise.resolve({ data: { items: [], hasMore: false, totalCount: 0, totalUnreadCount: 0 } });
  }) as typeof api.get;

  try {
    resetInbox();

    useInboxStore.getState().setFilter("unread");
    useInboxStore.getState().setFilter("all");

    assert.deepEqual(requestedFilters, ["unread", "all"]);

    unreadResponse.resolve({
      data: { items: [unreadItem], hasMore: false, totalCount: 1, totalUnreadCount: 1 },
    });
    await flushPromises();

    assert.equal(useInboxStore.getState().filter, "all");
    assert.deepEqual(useInboxStore.getState().items, [], "stale unread response must not populate the all view");
    assert.equal(useInboxStore.getState().loading, true, "current all request should remain authoritative");

    allResponse.resolve({
      data: { items: [allItem], hasMore: false, totalCount: 1, totalUnreadCount: 0 },
    });
    await flushPromises();

    assert.equal(useInboxStore.getState().filter, "all");
    assert.deepEqual(useInboxStore.getState().items.map((item) => item.channelId), ["all-channel"]);
    assert.equal(useInboxStore.getState().loading, false);
  } finally {
    restoreApi();
    resetInbox();
  }
});
