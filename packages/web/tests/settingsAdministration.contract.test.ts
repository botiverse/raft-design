import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { resolve } from "node:path";
import test from "node:test";

const repoRoot = resolve(import.meta.dirname, "..");

function readSettingsPanel(): string {
  return readFileSync(
    resolve(repoRoot, "src/components/settings/SettingsPanel.tsx"),
    "utf8",
  );
}

test("pre-join agreement uses checkbox reveal and section-level dirty save", () => {
  const source = readSettingsPanel();

  assert.match(source, /function PreJoinAgreementSection\(\)/);
  assert.match(source, /savedEnabled/);
  assert.match(source, /savedTitle/);
  assert.match(source, /savedBodyMarkdown/);
  assert.match(source, /const dirty =\s*enabled !== savedEnabled[\s\S]*title !== savedTitle[\s\S]*bodyMarkdown !== savedBodyMarkdown/);
  assert.match(source, /<Checkbox\s+size="md"[\s\S]*checked=\{enabled\}[\s\S]*Require agreement before joining/);
  assert.match(source, /\{enabled && \([\s\S]*<FormField label="Title"[\s\S]*<FormField label="Body"/);
  assert.match(source, /disabled=\{!dirty \|\| saving \|\| loading \|\| \(enabled && bodyTooLong\)\}/);
  assert.doesNotMatch(source, /Enabled" : "Disabled"/);
});

test("onboarding settings page is named Onboarding and saves only dirty sections", () => {
  const source = readSettingsPanel();

  assert.match(source, /function OnboardingAgentSection\(\)/);
  assert.match(source, /label="Onboarding"/);
  assert.doesNotMatch(source, /label="Onboarding Behavior"/);
  assert.match(source, /savedOnboardingAgentId/);
  assert.match(source, /savedAgentAllChannelGreetingEnabled/);
  assert.match(source, /const dirty =\s*onboardingAgentId !== savedOnboardingAgentId[\s\S]*agentAllChannelGreetingEnabled !== savedAgentAllChannelGreetingEnabled/);
  assert.match(source, /disabled=\{!isAdminOrOwner \|\| !dirty \|\| saving \|\| loading\}/);
});

test("profile and notification settings use section-level dirty save", () => {
  const source = readSettingsPanel();

  assert.match(source, /savedDisplayName/);
  assert.match(source, /const profileDirty = displayName !== savedDisplayName/);
  assert.match(source, /disabled=\{!profileDirty \|\| saving\}/);

  assert.match(source, /savedServerPushMuted/);
  assert.match(source, /<Checkbox\s+size="md"[\s\S]*checked=\{serverPushMuted\}[\s\S]*Mute this server/);
  assert.match(source, /disabled=\{serverPushMuted === savedServerPushMuted \|\| loading \|\| busy \|\| testing \|\| muting\}/);
  assert.doesNotMatch(source, /serverPushMuted \? "Unmute Server" : "Mute Server"/);
});

test("language and region settings save dirty sections instead of persisting on selection", () => {
  const source = readSettingsPanel();

  assert.match(source, /function LanguageRegionSection\(\)/);
  assert.match(source, /languageRegionDirty/);
  assert.match(source, /dateTimeDirty/);
  assert.match(source, /handleSaveLanguageRegion/);
  assert.match(source, /handleSaveDateTime/);
  assert.match(source, /disabled=\{!languageRegionDirty \|\| savingLanguageRegion \|\| settingsLoading\}/);
  assert.match(source, /disabled=\{!dateTimeDirty \|\| savingDateTime \|\| settingsLoading\}/);
  assert.match(source, /await updatePreferredLanguage/);
  assert.match(source, /await updatePreferredTranslationDisplay/);
  assert.match(source, /await updatePreferredTimezone/);
  assert.match(source, /await updatePreferredTimeFormat/);
  assert.doesNotMatch(source, /onChange=\{handleLanguageChange\}/);
  assert.doesNotMatch(source, /handleTranslationDisplayChange/);
  assert.doesNotMatch(source, /handleTimezoneChange/);
  assert.doesNotMatch(source, /handleTimeFormatChange/);
});
