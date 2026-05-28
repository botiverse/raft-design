import assert from "node:assert/strict";
import test from "node:test";

import {
  formatAlreadyNotJoined,
  formatLeaveChannelResult,
  parseRegularChannelTarget,
} from "./leave.js";

test("parseRegularChannelTarget accepts only top-level channel targets", () => {
  assert.equal(parseRegularChannelTarget("#engineering"), "engineering");
  assert.equal(parseRegularChannelTarget("#engineering "), "engineering");
  assert.equal(parseRegularChannelTarget("engineering"), null);
  assert.equal(parseRegularChannelTarget("dm:@alice"), null);
  assert.equal(parseRegularChannelTarget("#engineering:abcd1234"), null);
  assert.equal(parseRegularChannelTarget("#"), null);
});

test("leave channel output explains post-leave access", () => {
  assert.equal(
    formatLeaveChannelResult("#engineering"),
    "Left #engineering. You can still inspect visible public channel history there, but you can no longer send or receive ordinary channel delivery until you join the public channel again or a human re-adds you to a private channel.",
  );
  assert.equal(formatAlreadyNotJoined("#engineering"), "Already not joined in #engineering.");
});
