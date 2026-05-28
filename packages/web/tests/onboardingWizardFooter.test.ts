import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { resolve } from "node:path";
import test from "node:test";

const repoRoot = resolve(import.meta.dirname, "..");

test("referral-source submit lives in the Meet Slock footer to the right of Skip", () => {
  const source = readFileSync(
    resolve(repoRoot, "src/components/layout/OwnerOnboardingModal.tsx"),
    "utf8",
  );

  assert.match(source, /const REFERRAL_SOURCE_FORM_ID = "onboarding-referral-source-form";/);
  assert.match(source, /<ReferralSourceStep\s+formId=\{REFERRAL_SOURCE_FORM_ID\}/);
  assert.match(source, /<form\s+id=\{formId\}/);
  assert.match(source, /form=\{REFERRAL_SOURCE_FORM_ID\}/);

  const footerStart = source.indexOf("function WizardFooter");
  assert.notEqual(footerStart, -1, "WizardFooter not found");
  const footer = source.slice(footerStart);
  const skipIndex = footer.indexOf('data-testid="onboarding-skip-button"');
  const primaryIndex = footer.indexOf("{primaryAction}");

  assert.notEqual(skipIndex, -1, "Skip button is not rendered in WizardFooter");
  assert.notEqual(primaryIndex, -1, "Primary action slot is not rendered in WizardFooter");
  assert.ok(
    skipIndex < primaryIndex,
    "WizardFooter must render the primary action after Skip so Submit appears on the right",
  );
});

test("referral-source product events and session suppression stay wired", () => {
  const source = readFileSync(
    resolve(repoRoot, "src/components/layout/OwnerOnboardingModal.tsx"),
    "utf8",
  );

  assert.match(
    source,
    /await updateProfile\(\{ referralSource: source, referralSourceOther: other \}\);\s+recordCurrentWizardEvent\("onboarding_wizard\.completed", \{\s+action: "submit_referral",\s+result: source,\s+includeLatency: true,\s+\}\);\s+skipStepForSession\("referral-source"\);\s+armCompletionStep\(\);/,
  );
  assert.match(
    source,
    /catch \{\s+recordCurrentWizardEvent\("onboarding_wizard\.error", \{\s+action: "submit_referral",\s+reason: "save_referral_failed",\s+includeLatency: true,\s+\}\);\s+skipStepForSession\("referral-source"\);\s+armCompletionStep\(\);\s+setError\("Failed to save your answer\."\);/,
  );
  assert.match(
    source,
    /catch \{\s+recordCurrentWizardEvent\("onboarding_wizard\.error", \{\s+reason: "save_preference_failed",\s+result: "dismiss_failed",\s+includeLatency: true,\s+\}\);\s+if \(currentStep === "referral-source"\) \{\s+skipStepForSession\(currentStep\);\s+armCompletionStep\(\);\s+\}/,
  );
});

test("invite-team submit lives in the Meet Slock footer", () => {
  const source = readFileSync(
    resolve(repoRoot, "src/components/layout/OwnerOnboardingModal.tsx"),
    "utf8",
  );

  assert.match(source, /const INVITE_TEAMMATES_FORM_ID = "onboarding-invite-teammates-form";/);
  assert.match(source, /<InviteTeammatesStep\s+formId=\{INVITE_TEAMMATES_FORM_ID\}/);
  assert.match(source, /<form\s+id=\{formId\}/);
  assert.match(source, /form=\{INVITE_TEAMMATES_FORM_ID\}/);
});

test("Meet Slock footer uses the locked Skip label", () => {
  const source = readFileSync(
    resolve(repoRoot, "src/components/layout/OwnerOnboardingModal.tsx"),
    "utf8",
  );

  assert.doesNotMatch(source, /Skip for now/);
  assert.match(source, /\{persisting \? "Saving…" : "Skip"\}/);
});

test("Meet Slock footer opt-out checkbox uses the shared Checkbox primitive", () => {
  const source = readFileSync(
    resolve(repoRoot, "src/components/layout/OwnerOnboardingModal.tsx"),
    "utf8",
  );

  const footerStart = source.indexOf("function WizardFooter");
  assert.notEqual(footerStart, -1, "WizardFooter not found");
  const footer = source.slice(footerStart);

  assert.match(source, /import Checkbox from "\.\.\/ui\/Checkbox";/);
  assert.match(
    footer,
    /<Checkbox[\s\S]*checked=\{optOut\}[\s\S]*onChange=\{\(event\) => setOptOut\(event\.target\.checked\)\}[\s\S]*disabled=\{persisting\}[\s\S]*data-testid="onboarding-opt-out-checkbox"/,
  );
  assert.doesNotMatch(footer, /type="checkbox"[\s\S]*className="sr-only"[\s\S]*data-testid="onboarding-opt-out-checkbox"/);
  assert.doesNotMatch(footer, /h-3\.5 w-3\.5[\s\S]*border-2 border-black/);
});

test("Meet Slock wizard uses the shared onboarding dialog shell and framed icon", () => {
  const ownerSource = readFileSync(
    resolve(repoRoot, "src/components/layout/OwnerOnboardingModal.tsx"),
    "utf8",
  );
  const dialogSource = readFileSync(
    resolve(repoRoot, "src/components/onboarding/OnboardingStepDialog.tsx"),
    "utf8",
  );

  assert.match(ownerSource, /import OnboardingStepDialog from "\.\.\/onboarding\/OnboardingStepDialog";/);
  assert.match(ownerSource, /<OnboardingStepDialog[\s\S]*icon=\{stepIcon\}[\s\S]*footer=\{/);
  assert.match(dialogSource, /data-testid="onboarding-wizard-modal"/);
  assert.match(dialogSource, /size-7[\s\S]*border-2 border-black bg-brutal-yellow/);
});

test("onboarding wizard product events intentionally exclude push notification prompts", () => {
  const source = readFileSync(
    resolve(repoRoot, "src/utils/onboardingWizardEvents.ts"),
    "utf8",
  );

  assert.match(source, /Exclude<OnboardingWizardStepId, "enable-notifications">/);
  assert.doesNotMatch(source, /TRACKED_STEPS[\s\S]*"enable-notifications"/);
});
