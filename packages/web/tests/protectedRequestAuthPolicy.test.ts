import assert from "node:assert/strict";
import test from "node:test";
import { getProtectedRequestAuthFailureAction } from "../src/utils/protectedRequestAuthPolicy.js";

test("protected request keeps the session on transient refresh failure", () => {
  assert.equal(
    getProtectedRequestAuthFailureAction({
      status: 502,
      hasRefreshToken: true,
      initialized: true,
      restoreState: "authenticated",
    }),
    "keep-session",
  );
});

test("protected request logs out on refresh auth failure while auth bootstrap is still restoring", () => {
  assert.equal(
    getProtectedRequestAuthFailureAction({
      status: 401,
      hasRefreshToken: true,
      initialized: false,
      restoreState: "booting",
    }),
    "logout",
  );

  assert.equal(
    getProtectedRequestAuthFailureAction({
      status: 401,
      hasRefreshToken: true,
      initialized: true,
      restoreState: "restoring_auth",
    }),
    "logout",
  );
});

test("protected request logs out on explicit auth failure once restore is settled", () => {
  assert.equal(
    getProtectedRequestAuthFailureAction({
      status: 401,
      hasRefreshToken: true,
      initialized: true,
      restoreState: "authenticated",
    }),
    "logout",
  );
});

test("missing refresh token still logs out once restore is settled", () => {
  assert.equal(
    getProtectedRequestAuthFailureAction({
      status: undefined,
      hasRefreshToken: false,
      initialized: true,
      restoreState: "authenticated",
    }),
    "logout",
  );
});
