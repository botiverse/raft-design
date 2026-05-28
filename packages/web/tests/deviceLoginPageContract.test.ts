import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { resolve } from "node:path";
import test from "node:test";

const repoRoot = resolve(import.meta.dirname, "..");

test("device login approval uses the canonical /login/device web route", () => {
  const appSource = readFileSync(resolve(repoRoot, "src/App.tsx"), "utf8");
  const pageSource = readFileSync(resolve(repoRoot, "src/pages/DeviceLoginPage.tsx"), "utf8");

  assert.match(appSource, /import DeviceLoginPage from "\.\/pages\/DeviceLoginPage";/);
  assert.match(appSource, /<Route path="\/login\/device" element=\{<DeviceLoginPage \/>\} \/>/);
  assert.doesNotMatch(appSource, /path="\/device"/);
  assert.match(pageSource, /api\.post\("\/auth\/device\/approve"/);
  assert.match(pageSource, /user_code/);
});

test("device login page is login-into-Slock, not Login with Slock IdP", () => {
  const pageSource = readFileSync(resolve(repoRoot, "src/pages/DeviceLoginPage.tsx"), "utf8");

  assert.match(pageSource, /Approve Device Login/);
  assert.doesNotMatch(pageSource, /Login with Slock/);
});
