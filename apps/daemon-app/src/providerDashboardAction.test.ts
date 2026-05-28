import assert from "node:assert/strict";
import test from "node:test";
import { buildProviderDashboardActionLabel, buildProviderDashboardBannerState } from "./providerDashboardAction";

test("dashboard CTA says Add Provider when none are configured yet", () => {
  assert.equal(buildProviderDashboardActionLabel(0, 0, 0, true), "Add Provider");
});

test("dashboard CTA says Finish Provider Setup when only pending providers exist", () => {
  assert.equal(buildProviderDashboardActionLabel(0, 1, 0, true), "Finish Provider Setup");
});

test("dashboard CTA says Review Provider Setup when a system provider still needs attention", () => {
  assert.equal(buildProviderDashboardActionLabel(0, 0, 1, true), "Review Provider Setup");
});

test("dashboard CTA says Manage Providers when onboarding can still continue", () => {
  assert.equal(buildProviderDashboardActionLabel(2, 0, 0, true), "Manage Providers");
});

test("dashboard CTA says View Providers when every provider type is already configured", () => {
  assert.equal(buildProviderDashboardActionLabel(4, 0, 0, false), "View Providers");
});

test("dashboard banner surfaces system-provider guidance before local key setup", () => {
  assert.deepEqual(
    buildProviderDashboardBannerState(0, 0, "Not logged in — run `claude login` in terminal."),
    {
      message: "Not logged in — run `claude login` in terminal.",
      actionLabel: "Review setup",
    },
  );
});

test("dashboard banner prompts users to finish setup when pending providers exist", () => {
  assert.deepEqual(buildProviderDashboardBannerState(0, 1, null), {
    message: "Provider setup still needs local credentials.",
    actionLabel: "Finish setup",
  });
});

test("dashboard banner prompts users to add a provider when none exist yet", () => {
  assert.deepEqual(buildProviderDashboardBannerState(0, 0, null), {
    message: "No model provider configured.",
    actionLabel: "Add one now",
  });
});

test("dashboard banner disappears once a configured provider exists", () => {
  assert.equal(buildProviderDashboardBannerState(1, 0, null), null);
});
