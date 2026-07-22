import { describe, expect, it } from "vitest";

import {
  SYSTEM_MESSAGE_GROUPED_GENERIC,
  SYSTEM_MESSAGE_GROUPED_UPDATES,
} from "./system-message.fixtures.ts";
import { buildSystemMessageRenderStates } from "./system-message-grouping.ts";

describe("docs system-message grouping", () => {
  it("summarizes a mixed current producer run without inventing reminder rows", () => {
    expect(buildSystemMessageRenderStates(SYSTEM_MESSAGE_GROUPED_UPDATES)[0]).toMatchObject({
      kind: "summary",
      content: "There are 3 system updates: 2 task updates, 1 system message",
      messageIndexes: [0, 1, 2],
    });
  });

  it("summarizes current channel system events", () => {
    expect(buildSystemMessageRenderStates(SYSTEM_MESSAGE_GROUPED_GENERIC)[0]).toMatchObject({
      kind: "summary",
      content: "There are 2 system messages",
      messageIndexes: [0, 1],
    });
  });
});
