import assert from "node:assert/strict";
import test from "node:test";
import { planActivityHintResolutionAction } from "./agentOrchestrator.js";

test("planActivityHintResolutionAction returns the snapshot when the machine is locally reachable", () => {
  assert.equal(
    planActivityHintResolutionAction({
      reachability: "local",
      shouldTrustRecoveredOfflineHint: false,
      source: "local-cache",
      isFreshLocalCache: false,
    }),
    "return-snapshot",
  );
});

test("planActivityHintResolutionAction returns offline when the machine is offline", () => {
  assert.equal(
    planActivityHintResolutionAction({
      reachability: "offline",
      shouldTrustRecoveredOfflineHint: false,
      source: "redis",
      isFreshLocalCache: true,
    }),
    "return-offline",
  );
});

test("planActivityHintResolutionAction returns offline when the agent has no machine", () => {
  assert.equal(
    planActivityHintResolutionAction({
      reachability: "none",
      shouldTrustRecoveredOfflineHint: false,
      source: "local-cache",
      isFreshLocalCache: true,
    }),
    "return-offline",
  );
});

test("planActivityHintResolutionAction ignores recovered offline hints", () => {
  assert.equal(
    planActivityHintResolutionAction({
      reachability: "remote",
      shouldTrustRecoveredOfflineHint: true,
      source: "redis",
      isFreshLocalCache: true,
    }),
    "ignore-hint",
  );
});

test("planActivityHintResolutionAction only trusts fresh local-cache hints", () => {
  assert.equal(
    planActivityHintResolutionAction({
      reachability: "remote",
      shouldTrustRecoveredOfflineHint: false,
      source: "local-cache",
      isFreshLocalCache: true,
    }),
    "return-snapshot",
  );
  assert.equal(
    planActivityHintResolutionAction({
      reachability: "remote",
      shouldTrustRecoveredOfflineHint: false,
      source: "local-cache",
      isFreshLocalCache: false,
    }),
    "ignore-hint",
  );
});

test("planActivityHintResolutionAction caches and returns remote soft hints", () => {
  assert.equal(
    planActivityHintResolutionAction({
      reachability: "remote",
      shouldTrustRecoveredOfflineHint: false,
      source: "redis",
      isFreshLocalCache: false,
    }),
    "cache-and-return-snapshot",
  );
});
