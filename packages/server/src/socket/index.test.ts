import assert from "node:assert/strict";
import test from "node:test";
import { requiresSocketChannelAccessCheck } from "./index.js";

test("socket join access check treats joint channels as explicit-membership surfaces", () => {
  assert.equal(requiresSocketChannelAccessCheck("channel"), false);
  assert.equal(requiresSocketChannelAccessCheck("private"), true);
  assert.equal(requiresSocketChannelAccessCheck("joint"), true);
  assert.equal(requiresSocketChannelAccessCheck("dm"), true);
  assert.equal(requiresSocketChannelAccessCheck("thread"), true);
});
