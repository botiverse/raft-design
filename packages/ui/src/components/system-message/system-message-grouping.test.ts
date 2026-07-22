import { describe, expect, it } from "vite-plus/test";

import { buildSystemMessageRenderStates } from "./system-message-grouping";

let nextId = 0;

function system(content: string) {
  return {
    id: `system-${(nextId += 1)}`,
    messageType: "system",
    content,
  };
}

function chat(content: string) {
  return {
    id: `chat-${(nextId += 1)}`,
    messageType: "chat",
    content,
  };
}

describe("buildSystemMessageRenderStates", () => {
  it("collapses adjacent system messages into a summary row", () => {
    const states = buildSystemMessageRenderStates([
      system('✅ Peng moved #61 "有 slock cli 之后，hermes 是不是可以支持了" to Done'),
      system('📌 Akko claimed #86 "Other task"'),
      system(
        '🔔 @Dozy scheduled a reminder: "Check PR #1244" — fires <span data-reminder-fire-at="2026-05-01T08:51:09.444Z">2026-05-01 08:51 UTC</span>',
      ),
    ]);

    expect(states[0]?.kind).toBe("summary");
    expect(states[0]?.kind === "summary" ? states[0].content : "").toBe(
      "There are 2 task updates, 1 reminder update",
    );
    expect(states[0]?.kind === "summary" ? states[0].messageIndexes : []).toEqual([0, 1, 2]);
    expect(states[1]?.kind).toBe("hide");
    expect(states[2]?.kind).toBe("hide");
  });

  it("does not collapse across chat messages", () => {
    const states = buildSystemMessageRenderStates([
      system('📌 Akko claimed #61 "Task title"'),
      chat("human context"),
      system('👀 Akko moved #61 "Task title" to In Review'),
    ]);

    expect(states).toEqual([null, null, null]);
  });

  it("collapses non-ASCII task actors and recurring reminder notices", () => {
    const states = buildSystemMessageRenderStates([
      system('📌 哭哭 claimed #334 "agent dm 的view还是有问题"'),
      system('👀 哭哭 moved #334 "agent dm 的view还是有问题" to In Review'),
      system(
        "Reminder (recurring): #users:a545a4d3 — Check tong07@163.com reply re: outbound DM test result, relay to Kai",
      ),
    ]);

    expect(states[0]?.kind).toBe("summary");
    expect(states[0]?.kind === "summary" ? states[0].content : "").toBe(
      "There are 2 task updates, 1 reminder update",
    );
    expect(states[1]?.kind).toBe("hide");
    expect(states[2]?.kind).toBe("hide");
  });

  it("classifies reminder fire notices as reminder updates", () => {
    const states = buildSystemMessageRenderStates([
      system('📌 Akko claimed #61 "Task title"'),
      system(
        '🔔 Reminder #7ddfdf1d (one-time) — #proj-uiux:141a05fd — "Check PR #1306 CI for task #103"',
      ),
    ]);

    expect(states[0]?.kind).toBe("summary");
    expect(states[0]?.kind === "summary" ? states[0].content : "").toBe(
      "There are 1 task update, 1 reminder update",
    );
    expect(states[1]?.kind).toBe("hide");
  });

  it("collapses generic adjacent system messages without specialized counts", () => {
    const states = buildSystemMessageRenderStates([
      system("Channel archived"),
      system("Channel unarchived"),
    ]);

    expect(states[0]?.kind).toBe("summary");
    expect(states[0]?.kind === "summary" ? states[0].content : "").toBe(
      "There are 2 system messages",
    );
    expect(states[1]?.kind).toBe("hide");
  });
});
