import assert from "node:assert/strict";
import test from "node:test";
import {
  findThreadParentMessageIdByShortId,
  resolveThreadParentMessageIdByShortId,
  resolveThreadTargetByShortId,
} from "../src/utils/threadRefNavigation";
import type { FollowedThread, ThreadSummary } from "../src/store/threadStore";

const summary: ThreadSummary = {
  threadChannelId: "thread-1",
  replyCount: 1,
  lastReplyAt: null,
  participantIds: [],
  unreadCount: 0,
  firstUnreadMessageId: null,
};

function followed(parentChannelId: string, parentMessageId: string): Pick<FollowedThread, "parentChannelId" | "parentMessageId"> {
  return { parentChannelId, parentMessageId };
}

test("findThreadParentMessageIdByShortId resolves a unique loaded summary", () => {
  assert.equal(
    findThreadParentMessageIdByShortId({
      parentChannelId: "channel-1",
      shortId: "abcdef12",
      summaries: {
        "abcdef12-1111-2222-3333-444444444444": summary,
      },
      followedThreads: [],
    }),
    "abcdef12-1111-2222-3333-444444444444",
  );
});

test("findThreadParentMessageIdByShortId filters followed threads by parent channel", () => {
  assert.equal(
    findThreadParentMessageIdByShortId({
      parentChannelId: "channel-1",
      shortId: "abcdef12",
      summaries: {},
      followedThreads: [
        followed("channel-other", "abcdef12-0000-0000-0000-000000000000"),
        followed("channel-1", "abcdef12-1111-2222-3333-444444444444"),
      ],
    }),
    "abcdef12-1111-2222-3333-444444444444",
  );
});

test("findThreadParentMessageIdByShortId returns null for ambiguous local matches", () => {
  assert.equal(
    findThreadParentMessageIdByShortId({
      parentChannelId: "channel-1",
      shortId: "abcdef",
      summaries: {
        "abcdef12-1111-2222-3333-444444444444": summary,
        "abcdef99-1111-2222-3333-444444444444": summary,
      },
      followedThreads: [],
    }),
    null,
  );
});

test("resolveThreadParentMessageIdByShortId falls back to message context lookup", async () => {
  const calls: Array<{ parentChannelId: string; shortId: string }> = [];
  const parentMessageId = await resolveThreadParentMessageIdByShortId({
    parentChannelId: "channel-1",
    shortId: "29a90e07",
    summaries: {},
    followedThreads: [],
    loadContext: async (parentChannelId, shortId) => {
      calls.push({ parentChannelId, shortId });
      return { targetMessageId: "29a90e07-1111-2222-3333-444444444444" };
    },
  });

  assert.equal(parentMessageId, "29a90e07-1111-2222-3333-444444444444");
  assert.deepEqual(calls, [{ parentChannelId: "channel-1", shortId: "29a90e07" }]);
});

test("resolveThreadParentMessageIdByShortId does not call fallback when local match is unique", async () => {
  let fallbackCalled = false;
  const parentMessageId = await resolveThreadParentMessageIdByShortId({
    parentChannelId: "channel-1",
    shortId: "abcdef12",
    summaries: {
      "abcdef12-1111-2222-3333-444444444444": summary,
    },
    followedThreads: [],
    loadContext: async () => {
      fallbackCalled = true;
      return { targetMessageId: "remote" };
    },
  });

  assert.equal(parentMessageId, "abcdef12-1111-2222-3333-444444444444");
  assert.equal(fallbackCalled, false);
});

test("resolveThreadTargetByShortId maps thread replies to parent thread with focus", async () => {
  const target = await resolveThreadTargetByShortId({
    parentChannelId: "channel-1",
    shortId: "feedface",
    summaries: {},
    followedThreads: [],
    loadContext: async () => ({
      targetMessageId: "feedface-1111-2222-3333-444444444444",
      canonicalTarget: {
        kind: "thread",
        messageId: "feedface-1111-2222-3333-444444444444",
        threadParentMessageId: "29a90e07-1111-2222-3333-444444444444",
      },
    }),
  });

  assert.deepEqual(target, {
    parentMessageId: "29a90e07-1111-2222-3333-444444444444",
    focusedMessageId: "feedface-1111-2222-3333-444444444444",
  });
});
