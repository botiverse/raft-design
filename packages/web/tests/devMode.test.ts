import test from "node:test";
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";

import {
  getEnvironmentLabel,
  getSlockdevSeedCommand,
  shouldAutoDismissSlockdevAnnouncement,
  shouldAutoLoginSlockdev,
} from "../src/utils/devMode";

test("getEnvironmentLabel only labels supported deployment modes", () => {
  assert.equal(getEnvironmentLabel("slockdev"), "Dev");
  assert.equal(getEnvironmentLabel("staging"), "Staging");
  assert.equal(getEnvironmentLabel("production"), null);
  assert.equal(getEnvironmentLabel(undefined), null);
});

test("shouldAutoLoginSlockdev is gated to an empty slockdev login screen", () => {
  const base = {
    deploymentEnv: "slockdev",
    initialized: true,
    attempted: false,
    hasUser: false,
    hasStoredSession: false,
    authView: "login" as const,
    authCallback: null,
    resetToken: null,
    inviteToken: null,
  };

  assert.equal(shouldAutoLoginSlockdev(base), true);
  assert.equal(shouldAutoLoginSlockdev({ ...base, deploymentEnv: "staging" }), false);
  assert.equal(shouldAutoLoginSlockdev({ ...base, attempted: true }), false);
  assert.equal(shouldAutoLoginSlockdev({ ...base, hasUser: true }), false);
  assert.equal(shouldAutoLoginSlockdev({ ...base, hasStoredSession: true }), false);
  assert.equal(shouldAutoLoginSlockdev({ ...base, authView: "register" }), false);
  assert.equal(shouldAutoLoginSlockdev({ ...base, authCallback: "social" }), false);
  assert.equal(shouldAutoLoginSlockdev({ ...base, resetToken: "reset-token" }), false);
  assert.equal(shouldAutoLoginSlockdev({ ...base, inviteToken: "invite-token" }), false);
});

test("getSlockdevSeedCommand includes the slockdev environment name", () => {
  assert.equal(getSlockdevSeedCommand("preview-a"), "./slockdev seed preview-a");
  assert.equal(getSlockdevSeedCommand(""), "./slockdev seed <env>");
});

test("shouldAutoDismissSlockdevAnnouncement is gated to slockdev", () => {
  assert.equal(shouldAutoDismissSlockdevAnnouncement("slockdev"), true);
  assert.equal(shouldAutoDismissSlockdevAnnouncement("staging"), false);
  assert.equal(shouldAutoDismissSlockdevAnnouncement("production"), false);
  assert.equal(shouldAutoDismissSlockdevAnnouncement(undefined), false);
});

test("slockdev start passes preview descriptions into the web dev tools", () => {
  // slockdev was rewritten from bash → tsx (PR #1922 / task #15). The repo-root
  // ./slockdev is now a thin bash shim that execs the tsx impl, so the
  // preview-description handling now lives in scripts/slockdev.ts.
  const slockdevSource = readFileSync(new URL("../../../scripts/slockdev.ts", import.meta.url), "utf8");
  const appSource = readFileSync(new URL("../src/App.tsx", import.meta.url), "utf8");
  const viteEnvSource = readFileSync(new URL("../src/vite-env.d.ts", import.meta.url), "utf8");

  assert.match(slockdevSource, /--description <text>/);
  assert.match(slockdevSource, /VITE_SLOCKDEV_PREVIEW_DESCRIPTION/);
  assert.match(appSource, /VITE_SLOCKDEV_PREVIEW_DESCRIPTION/);
  assert.match(appSource, /Preview description/);
  assert.match(appSource, /<details[\s\S]+title=\{previewDescription\}/);
  assert.match(viteEnvSource, /VITE_SLOCKDEV_PREVIEW_DESCRIPTION\?: string/);
});
