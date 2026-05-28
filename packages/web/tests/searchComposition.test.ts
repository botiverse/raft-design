import assert from "node:assert/strict";
import test from "node:test";
import { getCommittedSearchQuery } from "../src/components/search/searchComposition.js";

test("defers committed search query while IME composition is active", () => {
  assert.equal(getCommittedSearchQuery("nihao", true), null);
});

test("commits the final trimmed query after composition ends", () => {
  assert.equal(getCommittedSearchQuery("  nihao  ", false), "nihao");
  assert.equal(getCommittedSearchQuery("   ", false), null);
});
