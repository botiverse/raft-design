import assert from "node:assert/strict";
import test from "node:test";

import {
  formatUnfollowThreadResult,
  parseThreadTarget,
} from "./unfollow.js";

test("parseThreadTarget accepts explicit thread targets and UUIDs", () => {
  assert.equal(parseThreadTarget("#engineering:abcd1234"), "#engineering:abcd1234");
  assert.equal(parseThreadTarget("dm:@alice:abcd1234"), "dm:@alice:abcd1234");
  assert.equal(parseThreadTarget("DM:@alice:abcd1234"), "DM:@alice:abcd1234");
  assert.equal(
    parseThreadTarget("11111111-2222-4333-8444-555555555555"),
    "11111111-2222-4333-8444-555555555555",
  );
});

test("parseThreadTarget rejects non-thread targets", () => {
  assert.equal(parseThreadTarget("#engineering"), null);
  assert.equal(parseThreadTarget("dm:@alice"), null);
  assert.equal(parseThreadTarget("#engineering:abc"), null);
  assert.equal(parseThreadTarget("engineering:abcd1234"), null);
  assert.equal(parseThreadTarget(""), null);
});

test("unfollow thread output explains delivery semantics", () => {
  assert.equal(
    formatUnfollowThreadResult("#engineering:abcd1234"),
    "Unfollowed #engineering:abcd1234. You can still inspect the thread when its parent conversation is visible, but you will no longer receive ordinary thread delivery unless you follow it again or are mentioned.",
  );
});
