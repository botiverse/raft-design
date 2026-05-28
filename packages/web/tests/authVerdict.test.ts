import assert from "node:assert/strict";
import test from "node:test";
import { getAuthVerdict } from "../src/utils/authVerdict.js";

test("auth verdict treats refresh auth failures as terminal during restore", () => {
  const common = {
    initialized: true,
    restoreState: "restoring_auth" as const,
  };

  assert.equal(
    getAuthVerdict({
      ...common,
      signal: { type: "refresh_failed", status: 401, hasRefreshToken: true },
    }),
    "logout",
  );
  assert.equal(
    getAuthVerdict({
      ...common,
      signal: { type: "refresh_failed", status: undefined, hasRefreshToken: false },
    }),
    "logout",
  );
});

test("auth verdict defers post-refresh /auth/me auth failures during restore", () => {
  const common = {
    initialized: true,
    restoreState: "restoring_auth" as const,
  };

  assert.equal(
    getAuthVerdict({
      ...common,
      signal: { type: "post_refresh_me_failed", status: 401 },
    }),
    "defer-to-auth-restore",
  );
});

test("auth verdict allows hard logout after restore is settled", () => {
  const common = {
    initialized: true,
    restoreState: "authenticated" as const,
  };

  assert.equal(
    getAuthVerdict({
      ...common,
      signal: { type: "refresh_failed", status: 401, hasRefreshToken: true },
    }),
    "logout",
  );
  assert.equal(
    getAuthVerdict({
      ...common,
      signal: { type: "post_refresh_me_failed", status: 401 },
    }),
    "logout",
  );
});

test("auth verdict keeps session on transient failures", () => {
  assert.equal(
    getAuthVerdict({
      initialized: true,
      restoreState: "authenticated",
      signal: { type: "refresh_failed", status: 503, hasRefreshToken: true },
    }),
    "keep-session",
  );
});
