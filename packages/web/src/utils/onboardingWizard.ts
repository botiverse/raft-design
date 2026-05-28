export type OnboardingWizardStepId =
  | "add-computer"
  | "create-agent"
  | "referral-source"
  | "invite-teammates"
  | "join-community"
  | "enable-notifications"
  | "complete";

export interface OnboardingWizardStepState {
  serverId: string | null;
  hasUser: boolean;
  canManageMachines: boolean;
  canManageAgents: boolean;
  canManageMembers: boolean;
  hasMachine: boolean;
  hasAgent: boolean;
  setupOptedOut: boolean;
  sessionSkippedAddComputerStep: boolean;
  sessionSkippedCreateAgentStep: boolean;
  sessionSkippedReferralSourceStep: boolean;
  dismissedAddComputerStepAt: string | null | undefined;
  dismissedCreateAgentStepAt: string | null | undefined;
  referralSource: string | null | undefined;
  referralSourceSkippedAt: string | null | undefined;
  nonSelfHumanCount: number;
  dismissedInviteStepAt: string | null | undefined;
  ownedServerCount: number;
  hasCommunityServer: boolean;
  dismissedCommunityStepAt: string | null | undefined;
  pushEligible: boolean;
  completionStepAvailable: boolean;
  resumeStep: OnboardingWizardStepId | null | undefined;
  settingsLoaded: boolean;
}

export function getNextOnboardingWizardStep(state: OnboardingWizardStepState): OnboardingWizardStepId | null {
  if (!state.serverId || !state.hasUser || !state.settingsLoaded) return null;
  const addComputerSuppressed =
    state.setupOptedOut ||
    state.sessionSkippedAddComputerStep ||
    !!state.dismissedAddComputerStepAt;
  const createAgentSuppressed =
    state.setupOptedOut ||
    state.sessionSkippedCreateAgentStep ||
    !!state.dismissedCreateAgentStepAt;
  const setupWasSkippedOrDismissed = addComputerSuppressed || createAgentSuppressed;
  const eligibleSteps: OnboardingWizardStepId[] = [];
  if (
    state.canManageMachines &&
    !state.hasMachine &&
    !addComputerSuppressed
  ) {
    eligibleSteps.push("add-computer");
  }
  if (
    state.canManageAgents &&
    state.hasMachine &&
    !state.hasAgent &&
    !createAgentSuppressed
  ) {
    eligibleSteps.push("create-agent");
  }
  if (
    (state.hasAgent || setupWasSkippedOrDismissed) &&
    !state.sessionSkippedReferralSourceStep &&
    !state.referralSource &&
    !state.referralSourceSkippedAt
  ) {
    eligibleSteps.push("referral-source");
  }
  if (
    state.canManageMembers &&
    state.hasAgent &&
    state.nonSelfHumanCount === 0 &&
    !state.dismissedInviteStepAt
  ) {
    eligibleSteps.push("invite-teammates");
  }
  if (
    state.canManageMembers &&
    state.ownedServerCount <= 1 &&
    !state.hasCommunityServer &&
    !state.dismissedCommunityStepAt
  ) {
    eligibleSteps.push("join-community");
  }
  if (state.ownedServerCount <= 1 && state.pushEligible) eligibleSteps.push("enable-notifications");
  if (state.completionStepAvailable || state.resumeStep === "complete") eligibleSteps.push("complete");
  return eligibleSteps[0] ?? null;
}
