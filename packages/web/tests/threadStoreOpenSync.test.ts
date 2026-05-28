import assert from "node:assert/strict";
import test from "node:test";
import { useThreadStore, type ThreadSummary } from "../src/store/threadStore.js";
import api from "../src/api/client.js";

const originalPost = api.post.bind(api);

function resetStore() {
  useThreadStore.setState({
    openParentMessageId: null,
    openThreadChannelId: null,
    openParentChannelId: null,
    focusedMessageId: null,
    openedAt: 0,
    summaries: {},
    followedThreads: [],
  });
}

function makeSummary(threadChannelId: string): ThreadSummary {
  return {
    threadChannelId,
    replyCount: 1,
    lastReplyAt: new Date().toISOString(),
    participantIds: ["agent-1"],
    unreadCount: 0,
    firstUnreadMessageId: null,
  };
}

function restoreApi() {
  api.post = originalPost;
}

test("updateSummary promotes threadChannelId into openThreadChannelId when a summary arrives for the currently-open empty panel", () => {
  resetStore();
  useThreadStore.setState({
    openParentMessageId: "parent-1",
    openParentChannelId: "channel-1",
    openThreadChannelId: null,
    openedAt: Date.now(),
  });

  useThreadStore.getState().updateSummary("parent-1", makeSummary("thread-1"));

  const state = useThreadStore.getState();
  assert.equal(state.openThreadChannelId, "thread-1");
  assert.equal(state.summaries["parent-1"].threadChannelId, "thread-1");
});

test("updateSummary does not touch openThreadChannelId when the summary is for a different parent", () => {
  resetStore();
  useThreadStore.setState({
    openParentMessageId: "parent-1",
    openParentChannelId: "channel-1",
    openThreadChannelId: null,
    openedAt: Date.now(),
  });

  useThreadStore.getState().updateSummary("parent-other", makeSummary("thread-other"));

  assert.equal(useThreadStore.getState().openThreadChannelId, null);
});

test("updateSummary does not overwrite an already-known openThreadChannelId", () => {
  resetStore();
  useThreadStore.setState({
    openParentMessageId: "parent-1",
    openParentChannelId: "channel-1",
    openThreadChannelId: "thread-existing",
    openedAt: Date.now(),
  });

  useThreadStore.getState().updateSummary("parent-1", makeSummary("thread-different"));

  assert.equal(useThreadStore.getState().openThreadChannelId, "thread-existing");
});

test("openThread creates-or-gets the thread channel without waiting for a summary push", async () => {
  resetStore();
  const postCalls: Array<{ url: string; body: unknown }> = [];
  api.post = (async (url: string, body?: unknown) => {
    postCalls.push({ url, body });
    return {
      data: {
        threadChannelId: "thread-1",
        replyCount: 0,
        lastReplyAt: null,
        participantIds: [],
      },
    };
  }) as typeof api.post;

  try {
    await useThreadStore.getState().openThread("channel-1", "parent-1");

    const state = useThreadStore.getState();
    assert.deepEqual(postCalls, [{
      url: "/channels/channel-1/threads",
      body: { parentMessageId: "parent-1" },
    }]);
    assert.equal(state.openParentMessageId, "parent-1");
    assert.equal(state.openParentChannelId, "channel-1");
    assert.equal(state.openThreadChannelId, "thread-1");
    assert.deepEqual(state.summaries["parent-1"], {
      threadChannelId: "thread-1",
      replyCount: 0,
      lastReplyAt: null,
      participantIds: [],
      unreadCount: 0,
      firstUnreadMessageId: null,
    });
  } finally {
    restoreApi();
    resetStore();
  }
});
