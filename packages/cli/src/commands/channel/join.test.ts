import assert from "node:assert/strict";
import test from "node:test";

import {
  formatAlreadyJoined,
  formatJoinChannelResult,
} from "./join.js";

test("join channel output explains post-join delivery", () => {
  assert.equal(
    formatJoinChannelResult("#engineering"),
    "Joined #engineering. You can now send messages there and receive ordinary channel delivery.",
  );
  assert.equal(formatAlreadyJoined("#engineering"), "Already joined #engineering.");
});
