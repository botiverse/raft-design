import assert from "node:assert/strict";
import test from "node:test";

import { buildLoginEntryState } from "./loginEntryState";

test("buildLoginEntryState uses in-app auth when local encryption is available", () => {
  const state = buildLoginEntryState(true);

  assert.equal(state.shouldAuthenticateInApp, true);
  assert.equal(state.buttonLabel, "Login with Slock");
  assert.match(state.description, /secure Slock sign-in window/i);
});

test("buildLoginEntryState falls back to saving the server locally when encryption is unavailable", () => {
  const state = buildLoginEntryState(false);

  assert.equal(state.shouldAuthenticateInApp, false);
  assert.equal(state.buttonLabel, "Save server locally");
  assert.match(state.description, /cannot store a Slock session on this machine/i);
  assert.match(state.description, /in-app Slock login remains unavailable/i);
});
