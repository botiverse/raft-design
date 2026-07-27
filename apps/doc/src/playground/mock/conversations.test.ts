import { describe, expect, it } from "vite-plus/test";

import { getPlaygroundThread, PLAYGROUND_CONVERSATIONS } from "./conversations.ts";

describe("playground conversation thread targets", () => {
  it("lets every timeline message open a thread", () => {
    for (const conversation of PLAYGROUND_CONVERSATIONS) {
      for (const message of conversation.messages) {
        const context = getPlaygroundThread(message.id);
        expect(context?.channel.id).toBe(conversation.conversation.id);
        expect(context?.thread.parent).toBe(message);
      }
    }
  });

  it("preserves explicit replies when a timeline message already has a thread", () => {
    for (const conversation of PLAYGROUND_CONVERSATIONS) {
      for (const thread of conversation.threads) {
        expect(getPlaygroundThread(thread.parent.id)?.thread).toBe(thread);
      }
    }
  });

  it("keeps every thread unread count addressable by a reply", () => {
    for (const conversation of PLAYGROUND_CONVERSATIONS) {
      for (const thread of conversation.threads) {
        const unreadReplyCount = thread.replies.filter((reply) => reply.unread).length;
        expect(unreadReplyCount).toBe(thread.unreadCount ?? 0);
      }
    }
  });

  it("keeps structured message presentations in the timeline domain model", () => {
    const migration = PLAYGROUND_CONVERSATIONS.find(
      ({ conversation }) => conversation.id === "all",
    );
    const messageTypes = new Set(migration?.messages.map((message) => message.messageType));

    expect(messageTypes.has("action-card")).toBe(true);
    expect(messageTypes.has("chat")).toBe(true);
    expect(messageTypes.has("forwarded-bundle")).toBe(true);
    expect(messageTypes.has("quoted-preview")).toBe(true);
  });
});
