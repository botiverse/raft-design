import assert from "node:assert/strict";
import test from "node:test";

import { DEFAULT_SLOCK_SERVER_URL, resolveServerUrl } from "./serverUrl.js";

test("resolveServerUrl falls back to the production API", () => {
  assert.equal(resolveServerUrl(undefined, "", "   "), DEFAULT_SLOCK_SERVER_URL);
});

test("resolveServerUrl preserves explicit precedence", () => {
  assert.equal(
    resolveServerUrl(undefined, " https://session.example.test ", "https://env.example.test"),
    "https://session.example.test",
  );
  assert.equal(
    resolveServerUrl(" https://flag.example.test ", "https://session.example.test"),
    "https://flag.example.test",
  );
});
