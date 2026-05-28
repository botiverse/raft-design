import assert from "node:assert/strict";
import test from "node:test";

import { buildProviderSetupState, getProviderSetupOptionState } from "./providerSetupState";

test("buildProviderSetupState enables provider onboarding when local encryption is available", () => {
  const state = buildProviderSetupState(true, true);

  assert.equal(state.canAddProviders, true);
  assert.match(state.description, /Add at least one provider/i);
  assert.match(state.emphasis, /never leave your machine/i);
  assert.match(state.helperText, /OS keychain/i);
});

test("buildProviderSetupState disables provider onboarding when local encryption is unavailable", () => {
  const state = buildProviderSetupState(false, true);

  assert.equal(state.canAddProviders, false);
  assert.match(state.description, /cannot store provider secrets locally/i);
  assert.match(state.emphasis, /requires local secret encryption/i);
  assert.match(state.helperText, /will not let you add a provider/i);
});

test("buildProviderSetupState disables provider onboarding when all provider kinds are already added", () => {
  const state = buildProviderSetupState(true, false);

  assert.equal(state.canAddProviders, false);
  assert.match(state.description, /already added on this machine/i);
  assert.match(state.emphasis, /already added/i);
  assert.match(state.helperText, /finish setup, verify, update, or remove/i);
});

test("getProviderSetupOptionState marks existing provider kinds without a local key as pending", () => {
  assert.equal(
    getProviderSetupOptionState("anthropic", ["anthropic"], [], true),
    "pending",
  );
});

test("getProviderSetupOptionState still distinguishes configured and unavailable provider kinds", () => {
  assert.equal(
    getProviderSetupOptionState("anthropic", ["anthropic"], ["anthropic"], false),
    "configured",
  );
  assert.equal(
    getProviderSetupOptionState("openai", ["anthropic", "custom"], ["anthropic"], false),
    "unavailable",
  );
  assert.equal(
    getProviderSetupOptionState("openai", ["anthropic"], ["anthropic"], true),
    "available",
  );
});
