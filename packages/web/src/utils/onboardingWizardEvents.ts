import api from "../api/client";
import type { OnboardingWizardStepId } from "./onboardingWizard";

export const ONBOARDING_WIZARD_VERSION = "owner-wizard-v3";

export type TrackedOnboardingWizardStepId = Exclude<OnboardingWizardStepId, "enable-notifications">;

export type OnboardingWizardProductEventType =
  | "onboarding_wizard.step_shown"
  | "onboarding_wizard.primary_clicked"
  | "onboarding_wizard.skip_clicked"
  | "onboarding_wizard.dismissed"
  | "onboarding_wizard.completed"
  | "onboarding_wizard.error";

const TRACKED_STEPS = new Set<TrackedOnboardingWizardStepId>([
  "add-computer",
  "create-agent",
  "referral-source",
  "invite-teammates",
  "join-community",
]);

function sessionStorageKey(serverId: string) {
  return `slock_onboarding_wizard_event_session:${serverId}`;
}

function createSessionId() {
  if (typeof crypto !== "undefined" && typeof crypto.randomUUID === "function") {
    return crypto.randomUUID();
  }
  return `${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 10)}`;
}

function getOnboardingWizardSessionId(serverId: string) {
  if (typeof window === "undefined") return createSessionId();
  const key = sessionStorageKey(serverId);
  const existing = window.sessionStorage.getItem(key);
  if (existing) return existing;
  const next = createSessionId();
  window.sessionStorage.setItem(key, next);
  return next;
}

export function isTrackedOnboardingWizardStep(
  stepId: OnboardingWizardStepId | null,
): stepId is TrackedOnboardingWizardStepId {
  return !!stepId && TRACKED_STEPS.has(stepId as TrackedOnboardingWizardStepId);
}

export async function recordOnboardingWizardEvent(args: {
  serverId: string | null;
  stepId: OnboardingWizardStepId | null;
  eventType: OnboardingWizardProductEventType;
  action?: string;
  result?: string;
  reason?: string;
  latencyMs?: number;
  idempotencyKey?: string;
}) {
  if (!args.serverId || !isTrackedOnboardingWizardStep(args.stepId)) return;
  try {
    const sessionId = getOnboardingWizardSessionId(args.serverId);
    await api.post("/product-events/onboarding-wizard", {
      eventType: args.eventType,
      idempotencyKey:
        args.idempotencyKey ??
        (args.eventType === "onboarding_wizard.step_shown"
          ? `${args.stepId}:${sessionId}:shown`
          : undefined),
      metadata: {
        step_id: args.stepId,
        wizard_version: ONBOARDING_WIZARD_VERSION,
        session_id: sessionId,
        action: args.action,
        result: args.result,
        reason: args.reason,
        latency_ms: args.latencyMs,
      },
    });
  } catch (err) {
    console.warn("[onboardingWizardEvents] failed to record product event", err);
  }
}
