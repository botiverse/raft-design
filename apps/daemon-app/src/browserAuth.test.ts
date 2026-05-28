import assert from "node:assert/strict";
import test from "node:test";
import { extractBrowserAuthSession } from "./browserAuth";

test("extractBrowserAuthSession accepts valid browser localStorage payloads", () => {
  assert.deepEqual(
    extractBrowserAuthSession({
      accessToken: " access-token ",
      refreshToken: " refresh-token ",
    }),
    {
      accessToken: "access-token",
      refreshToken: "refresh-token",
    },
  );
});

test("extractBrowserAuthSession rejects incomplete payloads", () => {
  assert.equal(extractBrowserAuthSession(null), null);
  assert.equal(extractBrowserAuthSession({ accessToken: "token" }), null);
  assert.equal(extractBrowserAuthSession({ accessToken: "", refreshToken: "token" }), null);
});
