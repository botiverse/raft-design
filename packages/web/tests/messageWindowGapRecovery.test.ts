import assert from "node:assert/strict";
import test from "node:test";
import {
  createMessageWindowHarness,
  flushAsyncWork,
} from "./messageWindowHarness.js";
import type { Message } from "../src/store/messageStore.js";

const CHANNEL_ID = "channel-1";
const SERIAL = { concurrency: false };

function message(seq: number): Message {
  return {
    id: `m-${seq}`,
    seq,
    channelId: CHANNEL_ID,
    senderType: "user",
    senderId: "u-1",
    senderName: "ray",
    messageType: "chat",
    content: `message ${seq}`,
    createdAt: new Date(2026, 3, 5, 0, 0, seq).toISOString(),
  };
}

test("keeps contiguous socket messages on the normal append path", SERIAL, async () => {
  const harness = createMessageWindowHarness();
  try {
    harness.primeWindow(CHANNEL_ID, [message(10)]);

    harness.socketMessage(message(11));

    const snapshot = harness.snapshot(CHANNEL_ID);
    assert.deepEqual(snapshot.messageIds, ["m-10", "m-11"]);
    assert.equal(snapshot.hasGap, false);
    assert.equal(snapshot.unreadCount, 0);
    assert.deepEqual(harness.getCalls(), []);
  } finally {
    harness.restore();
  }
});

test("replaces optimistic self messages even when sender profile was not loaded yet", SERIAL, async () => {
  const harness = createMessageWindowHarness();
  try {
    const optimistic: Message = {
      ...message(11),
      id: "optimistic-local-send",
      senderId: "",
      senderName: "You",
      content: "sent while auth profile loads",
    };
    const persisted: Message = {
      ...message(11),
      id: "server-message-11",
      senderId: "u-1",
      senderName: "Ray",
      content: optimistic.content,
    };

    harness.primeWindow(CHANNEL_ID, [message(10)]);
    harness.optimisticMessage(optimistic);
    harness.socketMessage(persisted);

    assert.deepEqual(harness.snapshot(CHANNEL_ID).messageIds, ["m-10", "server-message-11"]);
  } finally {
    harness.restore();
  }
});

test("removes the exact optimistic row when the HTTP response resolves after a sender mismatch", SERIAL, async () => {
  const harness = createMessageWindowHarness();
  try {
    const optimistic: Message = {
      ...message(11),
      id: "optimistic-local-send",
      senderId: "stale-user-id",
      senderName: "Playwright Owner",
      content: "sent while auth profile is stale",
    };
    const persisted: Message = {
      ...message(11),
      id: "server-message-11",
      senderId: "u-1",
      senderName: "Playwright Owner",
      content: optimistic.content,
    };

    harness.primeWindow(CHANNEL_ID, [message(10)]);
    harness.optimisticMessage(optimistic);
    harness.enqueuePostResponses(persisted);

    await harness.sendMessage(CHANNEL_ID, optimistic.content, optimistic.id);

    assert.deepEqual(harness.snapshot(CHANNEL_ID).messageIds, ["m-10", "server-message-11"]);
  } finally {
    harness.restore();
  }
});

test("removes the exact optimistic row even if the socket echo already inserted the real message", SERIAL, async () => {
  const harness = createMessageWindowHarness();
  try {
    const optimistic: Message = {
      ...message(11),
      id: "optimistic-local-send",
      senderId: "stale-user-id",
      senderName: "Playwright Owner",
      content: "socket wins before ack cleanup",
    };
    const persisted: Message = {
      ...message(11),
      id: "server-message-11",
      senderId: "u-1",
      senderName: "Playwright Owner",
      content: optimistic.content,
    };

    harness.primeWindow(CHANNEL_ID, [message(10)]);
    harness.optimisticMessage(optimistic);
    harness.socketMessage(persisted);
    harness.enqueuePostResponses(persisted);

    await harness.sendMessage(CHANNEL_ID, optimistic.content, optimistic.id);

    assert.deepEqual(harness.snapshot(CHANNEL_ID).messageIds, ["m-10", "server-message-11"]);
  } finally {
    harness.restore();
  }
});

test("keeps local image preview through socket optimistic replacement", SERIAL, async () => {
  const harness = createMessageWindowHarness();
  try {
    const optimistic: Message = {
      ...message(11),
      id: "optimistic-local-send",
      senderId: "",
      senderName: "You",
      content: "[1 attachment]",
      attachments: [{
        id: "optimistic-att-0",
        filename: "proof.png",
        mimeType: "image/png",
        sizeBytes: 12345,
        width: 1600,
        height: 900,
        localPreviewUrl: "blob:http://localhost/proof",
        thumbnailUrl: null,
      }],
    };
    const persisted: Message = {
      ...message(11),
      id: "server-message-11",
      senderId: "u-1",
      senderName: "Ray",
      content: optimistic.content,
      attachments: [{
        id: "real-att-0",
        filename: "proof.png",
        mimeType: "image/png",
        sizeBytes: 12345,
        width: null,
        height: null,
        thumbnailUrl: "/api/attachments/real-att-0/thumbnail",
      }],
    };

    harness.primeWindow(CHANNEL_ID, [message(10)]);
    harness.optimisticMessage(optimistic);
    harness.socketMessage(persisted);

    const messages = harness.messages(CHANNEL_ID);
    assert.deepEqual(messages.map((msg) => msg.id), ["m-10", "server-message-11"]);
    assert.equal(messages[1].attachments?.[0]?.localPreviewUrl, "blob:http://localhost/proof");
    assert.equal(messages[1].attachments?.[0]?.width, 1600);
    assert.equal(messages[1].attachments?.[0]?.height, 900);
  } finally {
    harness.restore();
  }
});

test("keeps local image preview through HTTP ack optimistic replacement", SERIAL, async () => {
  const harness = createMessageWindowHarness();
  try {
    const optimistic: Message = {
      ...message(11),
      id: "optimistic-local-send",
      senderId: "stale-user-id",
      senderName: "Playwright Owner",
      content: "[1 attachment]",
      attachments: [{
        id: "optimistic-att-0",
        filename: "proof.png",
        mimeType: "image/png",
        sizeBytes: 12345,
        width: 1600,
        height: 900,
        localPreviewUrl: "blob:http://localhost/proof",
        thumbnailUrl: null,
      }],
    };
    const persisted: Message = {
      ...message(11),
      id: "server-message-11",
      senderId: "u-1",
      senderName: "Playwright Owner",
      content: optimistic.content,
      attachments: [{
        id: "real-att-0",
        filename: "proof.png",
        mimeType: "image/png",
        sizeBytes: 12345,
        width: null,
        height: null,
        thumbnailUrl: "/api/attachments/real-att-0/thumbnail",
      }],
    };

    harness.primeWindow(CHANNEL_ID, [message(10)]);
    harness.optimisticMessage(optimistic);
    harness.enqueuePostResponses(persisted);

    await harness.sendMessage(CHANNEL_ID, optimistic.content, optimistic.id);

    const messages = harness.messages(CHANNEL_ID);
    assert.deepEqual(messages.map((msg) => msg.id), ["m-10", "server-message-11"]);
    assert.equal(messages[1].attachments?.[0]?.localPreviewUrl, "blob:http://localhost/proof");
    assert.equal(messages[1].attachments?.[0]?.width, 1600);
    assert.equal(messages[1].attachments?.[0]?.height, 900);
  } finally {
    harness.restore();
  }
});

test("reuses a loaded channel window for focused message context navigation", SERIAL, async () => {
  const harness = createMessageWindowHarness();
  try {
    harness.primeWindow(CHANNEL_ID, [message(10), message(11), message(12)]);

    await harness.loadMessageContext(CHANNEL_ID, "m-11");

    const snapshot = harness.snapshot(CHANNEL_ID);
    assert.deepEqual(snapshot.messageIds, ["m-10", "m-11", "m-12"]);
    assert.equal(snapshot.highlightedMessageId, "m-11");
    assert.equal(snapshot.loading, false);
    assert.equal(snapshot.hasGap, false);
    assert.deepEqual(harness.getCalls(), []);
  } finally {
    harness.restore();
  }
});

test("falls back to the channel timeline when focused message context is missing", SERIAL, async () => {
  const harness = createMessageWindowHarness();
  try {
    harness.enqueueChannelPages([message(20), message(21), message(22)]);

    await harness.loadMessageContext(CHANNEL_ID, "missing-message");

    const snapshot = harness.snapshot(CHANNEL_ID);
    assert.deepEqual(snapshot.messageIds, ["m-20", "m-21", "m-22"]);
    assert.equal(snapshot.highlightedMessageId, null);
    assert.equal(snapshot.loading, false);
    assert.equal(snapshot.contextLoadError, "Message not found");
    assert.deepEqual(harness.getCalls(), [
      "/messages/context/missing-message",
      "/messages/channel/channel-1?limit=50",
    ]);
  } finally {
    harness.restore();
  }
});

test("defers non-contiguous socket messages until gap recovery fills the missing seqs", SERIAL, async () => {
  const harness = createMessageWindowHarness();
  try {
    harness.primeWindow(CHANNEL_ID, [message(10)]);
    harness.enqueueSyncPages([message(11), message(12), message(13)]);

    harness.socketMessage(message(13));

    const beforeRecovery = harness.snapshot(CHANNEL_ID);
    assert.deepEqual(beforeRecovery.messageIds, ["m-10"]);
    assert.equal(beforeRecovery.hasGap, true);
    assert.equal(beforeRecovery.unreadCount, 1);

    await flushAsyncWork();

    const afterRecovery = harness.snapshot(CHANNEL_ID);
    assert.deepEqual(afterRecovery.messageIds, ["m-10", "m-11", "m-12", "m-13"]);
    assert.equal(afterRecovery.hasGap, false);
    assert.equal(afterRecovery.loadingGap, false);
    assert.equal(afterRecovery.unreadCount, 0);
    assert.deepEqual(harness.getCalls(), ["/messages/sync?since_seq=10&limit=200&channel_id=channel-1"]);
  } finally {
    harness.restore();
  }
});

test("re-stitches a deferred socket message even if sync returns only the missing range", SERIAL, async () => {
  const harness = createMessageWindowHarness();
  try {
    harness.primeWindow(CHANNEL_ID, [message(10)]);
    harness.enqueueSyncPages([message(11), message(12)]);

    harness.socketMessage(message(13));

    const beforeRecovery = harness.snapshot(CHANNEL_ID);
    assert.deepEqual(beforeRecovery.messageIds, ["m-10"]);
    assert.equal(beforeRecovery.hasGap, true);

    await flushAsyncWork();

    const afterRecovery = harness.snapshot(CHANNEL_ID);
    assert.deepEqual(afterRecovery.messageIds, ["m-10", "m-11", "m-12", "m-13"]);
    assert.equal(afterRecovery.hasGap, false);
    assert.equal(afterRecovery.loadingGap, false);
    assert.deepEqual(harness.getCalls(), ["/messages/sync?since_seq=10&limit=200&channel_id=channel-1"]);
  } finally {
    harness.restore();
  }
});

test("channel-scoped gap sync starts from the loaded window tail, not the global lastSeq", SERIAL, async () => {
  const harness = createMessageWindowHarness();
  try {
    harness.primeWindow(CHANNEL_ID, [message(10)], { lastSeq: 100 });
    harness.enqueueSyncPages([[]]);

    await harness.syncGap(CHANNEL_ID);

    assert.deepEqual(harness.getCalls(), ["/messages/sync?since_seq=10&limit=200&channel_id=channel-1"]);
  } finally {
    harness.restore();
  }
});

test("gap recovery paginates until the missing range is fully stitched back together", SERIAL, async () => {
  const harness = createMessageWindowHarness();
  try {
    const firstPage = Array.from({ length: 200 }, (_, index) => message(11 + index));
    const secondPage = [message(211), message(212), message(213)];

    harness.primeWindow(CHANNEL_ID, [message(10)]);
    harness.enqueueSyncPages(firstPage, secondPage);

    harness.socketMessage(message(213));
    await flushAsyncWork();

    const snapshot = harness.snapshot(CHANNEL_ID);
    assert.equal(snapshot.messageIds.length, 204);
    assert.equal(snapshot.messageIds[0], "m-10");
    assert.equal(snapshot.messageIds.at(-1), "m-213");
    assert.deepEqual(harness.getCalls(), [
      "/messages/sync?since_seq=10&limit=200&channel_id=channel-1",
      "/messages/sync?since_seq=210&limit=200&channel_id=channel-1",
    ]);
  } finally {
    harness.restore();
  }
});
