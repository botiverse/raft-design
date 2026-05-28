import assert from "node:assert/strict";
import test from "node:test";
import { getNextOnboardingWizardStep, type OnboardingWizardStepState } from "../src/utils/onboardingWizard.js";

const baseState: OnboardingWizardStepState = {
  serverId: "server-1",
  hasUser: true,
  canManageMachines: true,
  canManageAgents: true,
  canManageMembers: true,
  hasMachine: true,
  hasAgent: true,
  setupOptedOut: false,
  sessionSkippedAddComputerStep: false,
  sessionSkippedCreateAgentStep: false,
  sessionSkippedReferralSourceStep: false,
  dismissedAddComputerStepAt: null,
  dismissedCreateAgentStepAt: null,
  referralSource: "twitter_x",
  referralSourceSkippedAt: null,
  nonSelfHumanCount: 1,
  dismissedInviteStepAt: "2026-05-09T00:00:00.000Z",
  ownedServerCount: 1,
  hasCommunityServer: true,
  dismissedCommunityStepAt: "2026-05-09T00:00:00.000Z",
  pushEligible: false,
  completionStepAvailable: false,
  resumeStep: null,
  settingsLoaded: true,
};

test("onboarding wizard starts with computer setup before agent creation", () => {
  assert.equal(
    getNextOnboardingWizardStep({
      ...baseState,
      hasMachine: false,
      hasAgent: false,
      referralSource: null,
    }),
    "add-computer",
  );
});

test("onboarding wizard creates the first agent before asking referral source", () => {
  assert.equal(
    getNextOnboardingWizardStep({
      ...baseState,
      hasAgent: false,
      referralSource: null,
    }),
    "create-agent",
  );
});

test("setup step skips/dismissals advance to referral source", () => {
  assert.equal(
    getNextOnboardingWizardStep({
      ...baseState,
      hasMachine: false,
      hasAgent: false,
      dismissedAddComputerStepAt: "2026-05-09T00:00:00.000Z",
      referralSource: null,
    }),
    "referral-source",
  );

  assert.equal(
    getNextOnboardingWizardStep({
      ...baseState,
      hasAgent: false,
      dismissedCreateAgentStepAt: "2026-05-09T00:00:00.000Z",
      referralSource: null,
    }),
    "referral-source",
  );

  assert.equal(
    getNextOnboardingWizardStep({
      ...baseState,
      hasMachine: false,
      hasAgent: false,
      sessionSkippedAddComputerStep: true,
      referralSource: null,
    }),
    "referral-source",
  );

  assert.equal(
    getNextOnboardingWizardStep({
      ...baseState,
      hasAgent: false,
      sessionSkippedCreateAgentStep: true,
      referralSource: null,
    }),
    "referral-source",
  );
});

test("legacy setup opt-out still suppresses setup and advances to referral source", () => {
  assert.equal(
    getNextOnboardingWizardStep({
      ...baseState,
      hasMachine: false,
      hasAgent: false,
      setupOptedOut: true,
      referralSource: null,
    }),
    "referral-source",
  );

  assert.equal(
    getNextOnboardingWizardStep({
      ...baseState,
      hasAgent: false,
      setupOptedOut: true,
      referralSource: null,
    }),
    "referral-source",
  );
});

test("new owner on first server follows the soft-step sequence after setup exists", () => {
  const state = {
    ...baseState,
    referralSource: null,
    referralSourceSkippedAt: null,
    nonSelfHumanCount: 0,
    dismissedInviteStepAt: null,
    hasCommunityServer: false,
    dismissedCommunityStepAt: null,
    pushEligible: true,
  };

  assert.equal(getNextOnboardingWizardStep(state), "referral-source");
  assert.equal(
    getNextOnboardingWizardStep({
      ...state,
      referralSourceSkippedAt: "2026-05-09T00:00:00.000Z",
    }),
    "invite-teammates",
  );
  assert.equal(
    getNextOnboardingWizardStep({
      ...state,
      referralSourceSkippedAt: "2026-05-09T00:00:00.000Z",
      dismissedInviteStepAt: "2026-05-09T00:00:00.000Z",
    }),
    "join-community",
  );
  assert.equal(
    getNextOnboardingWizardStep({
      ...state,
      referralSourceSkippedAt: "2026-05-09T00:00:00.000Z",
      dismissedInviteStepAt: "2026-05-09T00:00:00.000Z",
      dismissedCommunityStepAt: "2026-05-09T00:00:00.000Z",
    }),
    "enable-notifications",
  );
  assert.equal(
    getNextOnboardingWizardStep({
      ...state,
      sessionSkippedReferralSourceStep: true,
    }),
    "invite-teammates",
  );
});

test("referral source appears after first agent exists or setup was skipped", () => {
  assert.equal(
    getNextOnboardingWizardStep({
      ...baseState,
      referralSource: null,
      referralSourceSkippedAt: null,
    }),
    "referral-source",
  );

  assert.equal(
    getNextOnboardingWizardStep({
      ...baseState,
      hasMachine: false,
      hasAgent: false,
      sessionSkippedAddComputerStep: true,
      referralSource: null,
      referralSourceSkippedAt: null,
    }),
    "referral-source",
  );
});

test("invite step requires one live agent, manage-member permission, and zero other humans", () => {
  assert.equal(
    getNextOnboardingWizardStep({
      ...baseState,
      nonSelfHumanCount: 0,
      dismissedInviteStepAt: null,
    }),
    "invite-teammates",
  );

  assert.equal(
    getNextOnboardingWizardStep({
      ...baseState,
      nonSelfHumanCount: 0,
      dismissedInviteStepAt: null,
      canManageMembers: false,
    }),
    null,
  );
});

test("community and notification steps come after setup/referral/invite gates", () => {
  assert.equal(
    getNextOnboardingWizardStep({
      ...baseState,
      hasCommunityServer: false,
      dismissedCommunityStepAt: null,
    }),
    "join-community",
  );

  assert.equal(
    getNextOnboardingWizardStep({
      ...baseState,
      pushEligible: true,
    }),
    "enable-notifications",
  );
});

test("completion step appears only after the component arms it from a user action", () => {
  assert.equal(
    getNextOnboardingWizardStep({
      ...baseState,
      completionStepAvailable: true,
    }),
    "complete",
  );

  assert.equal(
    getNextOnboardingWizardStep({
      ...baseState,
      completionStepAvailable: true,
      pushEligible: true,
    }),
    "enable-notifications",
  );

  assert.equal(getNextOnboardingWizardStep(baseState), null);
});

test("community step is skipped for invited members and additional owned-server setup", () => {
  assert.equal(
    getNextOnboardingWizardStep({
      ...baseState,
      canManageMembers: false,
      hasCommunityServer: false,
      dismissedCommunityStepAt: null,
    }),
    null,
  );

  assert.equal(
    getNextOnboardingWizardStep({
      ...baseState,
      ownedServerCount: 2,
      hasCommunityServer: false,
      dismissedCommunityStepAt: null,
    }),
    null,
  );
});

test("notification step is user-level and does not repeat during additional owned-server setup", () => {
  assert.equal(
    getNextOnboardingWizardStep({
      ...baseState,
      ownedServerCount: 2,
      pushEligible: true,
    }),
    null,
  );
});

test("first owned server follows owner onboarding even if the user has invited memberships", () => {
  assert.equal(
    getNextOnboardingWizardStep({
      ...baseState,
      ownedServerCount: 1,
      hasCommunityServer: false,
      dismissedCommunityStepAt: null,
    }),
    "join-community",
  );
});

test("saved active step resumes when it is still eligible", () => {
  assert.equal(
    getNextOnboardingWizardStep({
      ...baseState,
      referralSource: "twitter_x",
      nonSelfHumanCount: 0,
      dismissedInviteStepAt: null,
      resumeStep: "invite-teammates",
    }),
    "invite-teammates",
  );
});

test("saved active step falls back when gates make it ineligible", () => {
  assert.equal(
    getNextOnboardingWizardStep({
      ...baseState,
      referralSource: null,
      referralSourceSkippedAt: null,
      nonSelfHumanCount: 0,
      dismissedInviteStepAt: null,
      resumeStep: "join-community",
    }),
    "referral-source",
  );
});

test("saved completion step can resume after re-entry", () => {
  assert.equal(
    getNextOnboardingWizardStep({
      ...baseState,
      completionStepAvailable: false,
      resumeStep: "complete",
    }),
    "complete",
  );
});
