import { describe, expect, it } from "vite-plus/test";

import { getPlaygroundActor } from "./actors.ts";
import { PLAYGROUND_CONVERSATIONS, isPlaygroundThreadId } from "./conversations.ts";
import { PLAYGROUND_SAVED_MESSAGES } from "./saved-messages.ts";

const allMessages = PLAYGROUND_CONVERSATIONS.flatMap(({ conversation, messages }) =>
  messages.map((message) => ({ channel: conversation, message })),
);

describe("playground message domain", () => {
  it("covers structured message-family states without presentation string protocols", () => {
    const frontend = PLAYGROUND_CONVERSATIONS.find(
      ({ conversation }) => conversation.id === "frontend",
    );
    expect(frontend).toBeDefined();

    const chatMessages = frontend?.messages.filter((message) => message.kind === "chat") ?? [];
    const presentations = chatMessages.flatMap((message) =>
      message.presentation ? [message.presentation] : [],
    );

    expect(
      presentations
        .filter((presentation) => presentation.kind === "action-card")
        .map((presentation) => presentation.resolution.kind),
    ).toEqual(["ready", "completed", "failed"]);
    expect(
      presentations
        .filter((presentation) => presentation.kind === "forwarded-bundle")
        .map((presentation) => presentation.display),
    ).toEqual(["compact", "collapsible"]);
    expect(
      presentations
        .filter((presentation) => presentation.kind === "quoted-preview")
        .map((presentation) => presentation.state),
    ).toEqual(["ready", "loading", "unavailable"]);
  });

  it("keeps system events outside chat-row interaction state", () => {
    const systemMessages = allMessages
      .map(({ message }) => message)
      .filter((message) => message.kind === "system");

    expect(systemMessages.some((message) => message.event.kind === "single")).toBe(true);
    expect(systemMessages.some((message) => message.event.kind === "group")).toBe(true);
    expect(systemMessages.every((message) => !("senderId" in message))).toBe(true);
    expect(systemMessages.every((message) => !("translation" in message))).toBe(true);
  });

  it("keeps lifecycle and outbound receipt constraints logically valid", () => {
    const lifecycleMessages = allMessages.filter(
      ({ message }) => message.kind === "chat" && message.senderLifecycle,
    );
    for (const { channel, message } of lifecycleMessages) {
      if (message.kind !== "chat" || !message.senderLifecycle) continue;
      const sender = getPlaygroundActor(message.senderId);
      expect(channel.memberIds).not.toContain(message.senderId);
      expect(
        message.senderLifecycle === "deleted" ? sender.type === "agent" : sender.type === "human",
      ).toBe(true);
    }

    const receiptMessages = allMessages.filter(
      ({ message }) => message.kind === "chat" && message.readReceipt,
    );
    expect(receiptMessages.length).toBeGreaterThan(0);
    expect(
      receiptMessages.every(
        ({ channel, message }) =>
          channel.kind === "dm" && message.kind === "chat" && message.senderId === "robin",
      ),
    ).toBe(true);
  });

  it("keeps attachment, sender, and translation lifecycle coverage explicit", () => {
    const chatMessages = allMessages.flatMap(({ message }) =>
      message.kind === "chat" ? [message] : [],
    );

    expect(
      new Set(
        chatMessages.flatMap(
          (message) => message.attachments?.map((attachment) => attachment.state.kind) ?? [],
        ),
      ),
    ).toEqual(new Set(["ready", "processing", "failed"]));
    expect(new Set(chatMessages.flatMap((message) => message.senderLifecycle ?? []))).toEqual(
      new Set(["left", "removed", "deleted"]),
    );
    expect(
      new Set(chatMessages.flatMap((message) => message.translation?.initialState ?? [])),
    ).toEqual(new Set(["pending", "translated", "original", "failed"]));
  });

  it("derives the saved registry from each message savedAt value", () => {
    const savedFromMessages = allMessages
      .flatMap(({ channel, message }) =>
        message.kind === "chat" && message.savedAt && message.savedAtDateTime
          ? [
              {
                channelId: channel.id,
                messageId: message.id,
                savedAt: message.savedAt,
                savedAtDateTime: message.savedAtDateTime,
              },
            ]
          : [],
      )
      .sort((left, right) => Date.parse(right.savedAtDateTime) - Date.parse(left.savedAtDateTime));

    expect(PLAYGROUND_SAVED_MESSAGES).toEqual(savedFromMessages);
    expect(
      PLAYGROUND_SAVED_MESSAGES.map(({ savedAtDateTime }) => Date.parse(savedAtDateTime)),
    ).toEqual(
      [...PLAYGROUND_SAVED_MESSAGES]
        .map(({ savedAtDateTime }) => Date.parse(savedAtDateTime))
        .sort((left, right) => right - left),
    );
  });

  it("accepts only registered message threads", () => {
    expect(isPlaygroundThreadId("frontend:opening")).toBe(true);
    expect(isPlaygroundThreadId("task:frontend:11")).toBe(false);
    expect(isPlaygroundThreadId("frontend:missing")).toBe(false);
  });
});
