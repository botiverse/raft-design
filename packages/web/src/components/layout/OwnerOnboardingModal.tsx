import { type ReactNode, useCallback, useEffect, useMemo, useRef, useState } from "react";
import {
  Bell,
  Bot,
  Check,
  Copy,
  Link2,
  Mail,
  Monitor,
  PartyPopper,
  Users,
} from "lucide-react";
import { RUNTIMES } from "@slock-ai/shared";
import api from "../../api/client";
import { useAuthStore } from "../../store/authStore";
import { useServerStore } from "../../store/serverStore";
import { useMachineStore } from "../../store/machineStore";
import { useAgentStore } from "../../store/agentStore";
import { useServerPermissions } from "../../hooks/useServerPermissions";
import { useJoinCommunityFlow } from "../../hooks/useJoinCommunityFlow";
import {
  enablePushNotifications,
  getPushPermissionState,
  isPushServerConfigured,
  isPushSubscribed,
  recordWebPushPromptEvent,
} from "../../utils/pushNotifications";
import { getNextOnboardingWizardStep, type OnboardingWizardStepId } from "../../utils/onboardingWizard";
import {
  isTrackedOnboardingWizardStep,
  recordOnboardingWizardEvent,
  type OnboardingWizardProductEventType,
} from "../../utils/onboardingWizardEvents";
import {
  CHINESE_COMMUNITY_SERVER_SLUG,
  DEFAULT_COMMUNITY_SERVER_SLUG,
  browserPrefersChineseCommunity,
  hasJoinedCommunity,
  recommendedCommunitySlug,
} from "../../utils/communityServers";
import OnboardingStepDialog from "../onboarding/OnboardingStepDialog";
import Checkbox from "../ui/Checkbox";

type OnboardingSettingsResponse = {
  onboardingAgentId: string | null;
  setupModalReminderOptOut: boolean;
  onboardingReminderOptOut?: boolean;
  dismissedAddComputerStepAt: string | null;
  dismissedCreateAgentStepAt: string | null;
  dismissedInviteStepAt: string | null;
  dismissedCommunityStepAt: string | null;
  dismissedNotificationStepAt: string | null;
  onboardingWizardCurrentStep: OnboardingWizardStepId | null;
  onboardingDmSentAt: string | null;
  onboardingDmSentByAgentId: string | null;
};

type PushPromptState = {
  loading: boolean;
  eligible: boolean;
  permission: NotificationPermission | "unsupported";
  subscribed: boolean;
  configured: boolean;
};

const REFERRAL_OPTIONS = [
  { value: "twitter_x", label: "Twitter / X" },
  { value: "linkedin", label: "LinkedIn" },
  { value: "friend_colleague", label: "A friend or colleague" },
  { value: "search", label: "Search" },
  { value: "hn_reddit", label: "Hacker News / Reddit" },
  { value: "podcast_blog_newsletter", label: "Podcast / blog / newsletter" },
  { value: "other", label: "Other" },
] as const;

const REFERRAL_SOURCE_FORM_ID = "onboarding-referral-source-form";
const INVITE_TEAMMATES_FORM_ID = "onboarding-invite-teammates-form";
const SUPPORTED_RUNTIME_NAMES = RUNTIMES
  .filter((runtime) => runtime.supported)
  .map((runtime) => runtime.displayName);

function formatList(items: string[]) {
  if (items.length <= 1) return items[0] ?? "";
  if (items.length === 2) return `${items[0]} or ${items[1]}`;
  return `${items.slice(0, -1).join(", ")}, or ${items[items.length - 1]}`;
}

function onboardingWizardSkippedStepsKey(serverId: string) {
  return `slock_onboarding_wizard_skipped_steps:${serverId}`;
}

function readSessionSkippedSteps(serverId: string | null) {
  if (!serverId || typeof window === "undefined") return new Set<OnboardingWizardStepId>();
  try {
    const raw = window.sessionStorage.getItem(onboardingWizardSkippedStepsKey(serverId));
    if (!raw) return new Set<OnboardingWizardStepId>();
    const parsed = JSON.parse(raw);
    if (!Array.isArray(parsed)) return new Set<OnboardingWizardStepId>();
    return new Set<OnboardingWizardStepId>(
      parsed.filter((step) => step === "add-computer" || step === "create-agent" || step === "referral-source"),
    );
  } catch {
    return new Set<OnboardingWizardStepId>();
  }
}

function writeSessionSkippedSteps(serverId: string | null, steps: Set<OnboardingWizardStepId>) {
  if (!serverId || typeof window === "undefined") return;
  const setupSteps = [...steps].filter(
    (step) => step === "add-computer" || step === "create-agent" || step === "referral-source",
  );
  window.sessionStorage.setItem(onboardingWizardSkippedStepsKey(serverId), JSON.stringify(setupSteps));
}

async function patchOnboardingSettings(serverId: string, body: Record<string, unknown>) {
  const { data } = await api.patch(`/servers/${serverId}/onboarding-settings`, body);
  return data as OnboardingSettingsResponse;
}

function stepTitle(step: OnboardingWizardStepId) {
  switch (step) {
    case "add-computer":
      return "ADD A COMPUTER";
    case "create-agent":
      return "YOUR ONBOARDING AGENT";
    case "referral-source":
      return "HOW DID YOU FIND US?";
    case "invite-teammates":
      return "BRING YOUR TEAM";
    case "join-community":
      return "JOIN THE COMMUNITY";
    case "enable-notifications":
      return "TURN ON NOTIFICATIONS";
    case "complete":
      return "START BUILDING WITH SLOCK";
  }
}

function stepDescription(step: OnboardingWizardStepId) {
  switch (step) {
    case "add-computer":
      return "Your agents need somewhere to run. Connect a computer and they'll come online there.";
    case "create-agent":
      return "The onboarding agent will help you get set up and start building with Slock.";
    case "referral-source":
      return null;
    case "invite-teammates":
      return "Your team gets to work with your agents, too.";
    case "join-community":
      return "Latest updates from the team drop here first. Plus other builders sharing what they're shipping.";
    case "enable-notifications":
      return "Always stay tuned for messages from Slock.";
    case "complete":
      return null;
  }
}

export default function OwnerOnboardingModal() {
  const user = useAuthStore((s) => s.user);
  const updateProfile = useAuthStore((s) => s.updateProfile);
  const currentServer = useServerStore((s) => s.current);
  const servers = useServerStore((s) => s.servers);
  const members = useServerStore((s) => s.members);
  const loadMembers = useServerStore((s) => s.loadMembers);
  const serverId = currentServer?.id ?? null;
  const communityServer = servers.find((s) => s.slug === DEFAULT_COMMUNITY_SERVER_SLUG || s.slug === CHINESE_COMMUNITY_SERVER_SLUG) ?? null;

  const machines = useMachineStore((s) => s.machines);
  const machineLoading = useMachineStore((s) => s.loading);
  const showAddMachine = useMachineStore((s) => s.showAddMachine);
  const setShowAddMachine = useMachineStore((s) => s.setShowAddMachine);

  const allAgents = useAgentStore((s) => s.agents);
  const agentLoading = useAgentStore((s) => s.loading);
  const showCreateAgent = useAgentStore((s) => s.showCreateAgent);
  const setShowCreateAgent = useAgentStore((s) => s.setShowCreateAgent);
  const { capabilities } = useServerPermissions();

  const [settings, setSettings] = useState<OnboardingSettingsResponse | null>(null);
  const [loadingSettings, setLoadingSettings] = useState(false);
  const [sessionSkippedSteps, setSessionSkippedSteps] = useState<Set<OnboardingWizardStepId>>(() => new Set());
  const [optOut, setOptOut] = useState(false);
  const [persisting, setPersisting] = useState(false);
  const [error, setError] = useState("");
  const [completionStepArmed, setCompletionStepArmed] = useState(false);
  const [sessionCompletedWizard, setSessionCompletedWizard] = useState(false);
  const [inviteSending, setInviteSending] = useState(false);
  const [pushState, setPushState] = useState<PushPromptState>({
    loading: true,
    eligible: false,
    permission: "unsupported",
    subscribed: false,
    configured: false,
  });
  const [shownPushPromptKey, setShownPushPromptKey] = useState("");
  const [shownWizardStepKey, setShownWizardStepKey] = useState("");
  const [closedStepKey, setClosedStepKey] = useState("");
  const [persistedStepKey, setPersistedStepKey] = useState("");
  const currentStepStartedAtRef = useRef<number | null>(null);

  const agents = useMemo(() => allAgents.filter((agent) => !agent.deletedAt), [allAgents]);
  const hasMachine = machines.length > 0;
  const hasAgent = agents.length > 0;
  const ownedServerCount = servers.filter((server) => server.role === "owner").length;
  const nonSelfHumanCount = members.filter((member) => member.userId !== user?.id).length;
  const setupOptedOut = !!(settings?.setupModalReminderOptOut ?? settings?.onboardingReminderOptOut);

  const refreshSettings = useCallback(async () => {
    if (!serverId) {
      setSettings(null);
      return;
    }
    setLoadingSettings(true);
    try {
      const { data } = await api.get(`/servers/${serverId}/onboarding-settings`);
      setSettings(data as OnboardingSettingsResponse);
    } catch {
      setSettings(null);
    } finally {
      setLoadingSettings(false);
    }
  }, [serverId]);

  useEffect(() => {
    setSessionSkippedSteps(readSessionSkippedSteps(serverId));
    setOptOut(false);
    setError("");
    setCompletionStepArmed(false);
    setSessionCompletedWizard(false);
    setShownPushPromptKey("");
    setShownWizardStepKey("");
    setClosedStepKey("");
    setPersistedStepKey("");
    currentStepStartedAtRef.current = null;
    void refreshSettings();
  }, [refreshSettings, serverId]);

  const refreshPushState = useCallback(async () => {
    if (!serverId || !hasAgent) {
      setPushState({
        loading: false,
        eligible: false,
        permission: getPushPermissionState(),
        subscribed: false,
        configured: false,
      });
      return;
    }

    setPushState((prev) => ({ ...prev, loading: true }));
    const permission = getPushPermissionState();
    const [configured, subscribed, notificationSettings] = await Promise.all([
      isPushServerConfigured(),
      isPushSubscribed(),
      api
        .get(`/servers/${serverId}/notification-settings`)
        .then((res) => res.data as { serverPushMuted: boolean })
        .catch(() => null),
    ]);
    let nextSubscribed = subscribed;
    const muted = !!notificationSettings?.serverPushMuted;
    if (configured && permission === "granted" && !subscribed && !muted) {
      const result = await enablePushNotifications();
      if (result === "granted") {
        nextSubscribed = await isPushSubscribed();
      }
    }
    const eligible =
      configured &&
      !nextSubscribed &&
      permission === "default" &&
      !muted &&
      !settings?.dismissedNotificationStepAt;
    setPushState({ loading: false, eligible, permission, subscribed: nextSubscribed, configured });
  }, [hasAgent, serverId, settings?.dismissedNotificationStepAt]);

  useEffect(() => {
    void refreshPushState();
  }, [refreshPushState]);

  const currentStep = useMemo<OnboardingWizardStepId | null>(
    () =>
      getNextOnboardingWizardStep({
        serverId,
        hasUser: !!user,
        canManageMachines: capabilities.manageMachines,
        canManageAgents: capabilities.manageAgents,
        canManageMembers: capabilities.manageMembers,
        hasMachine,
        hasAgent,
        setupOptedOut,
        sessionSkippedAddComputerStep: sessionSkippedSteps.has("add-computer"),
        sessionSkippedCreateAgentStep: sessionSkippedSteps.has("create-agent"),
        sessionSkippedReferralSourceStep: sessionSkippedSteps.has("referral-source"),
        dismissedAddComputerStepAt: settings?.dismissedAddComputerStepAt,
        dismissedCreateAgentStepAt: settings?.dismissedCreateAgentStepAt,
        referralSource: user?.referralSource,
        referralSourceSkippedAt: user?.referralSourceSkippedAt,
        nonSelfHumanCount,
        dismissedInviteStepAt: settings?.dismissedInviteStepAt,
        ownedServerCount,
        hasCommunityServer: !!communityServer,
        dismissedCommunityStepAt: settings?.dismissedCommunityStepAt,
        pushEligible: pushState.eligible,
        completionStepAvailable: completionStepArmed && !sessionCompletedWizard,
        resumeStep: settings?.onboardingWizardCurrentStep,
        settingsLoaded: !!settings,
      }),
    [
      capabilities.manageAgents,
      capabilities.manageMachines,
      capabilities.manageMembers,
      communityServer,
      hasAgent,
      hasMachine,
      nonSelfHumanCount,
      pushState.eligible,
      serverId,
      ownedServerCount,
      sessionCompletedWizard,
      completionStepArmed,
      settings,
      settings?.dismissedAddComputerStepAt,
      settings?.dismissedCreateAgentStepAt,
      sessionSkippedSteps,
      setupOptedOut,
      user,
    ],
  );

  useEffect(() => {
    setOptOut(false);
    setError("");
    setInviteSending(false);
  }, [currentStep]);

  useEffect(() => {
    if (currentStep !== "enable-notifications" || !serverId) return;
    const key = `${serverId}:${currentStep}`;
    if (shownPushPromptKey === key) return;
    setShownPushPromptKey(key);
    void recordWebPushPromptEvent({
      event: "web_push_prompt_shown",
      trigger: "onboarding_wizard",
      permissionBefore: pushState.permission,
    });
  }, [currentStep, pushState.permission, serverId, shownPushPromptKey]);

  const waitingForActionDialog = showAddMachine || showCreateAgent;
  const loading = machineLoading || agentLoading || loadingSettings || (currentStep === "enable-notifications" && pushState.loading);
  const currentStepKey = serverId && currentStep ? `${serverId}:${currentStep}` : "";
  const open = !!currentStep && !loading && !waitingForActionDialog && closedStepKey !== currentStepKey;

  const getCurrentStepLatencyMs = useCallback(() => {
    if (!currentStepStartedAtRef.current) return undefined;
    return Math.max(0, Date.now() - currentStepStartedAtRef.current);
  }, []);

  const recordCurrentWizardEvent = useCallback(
    (
      eventType: OnboardingWizardProductEventType,
      details: {
        action?: string;
        result?: string;
        reason?: string;
        idempotencyKey?: string;
        includeLatency?: boolean;
      } = {},
    ) => {
      void recordOnboardingWizardEvent({
        serverId,
        stepId: currentStep,
        eventType,
        action: details.action,
        result: details.result,
        reason: details.reason,
        latencyMs: details.includeLatency ? getCurrentStepLatencyMs() : undefined,
        idempotencyKey: details.idempotencyKey,
      });
    },
    [currentStep, getCurrentStepLatencyMs, serverId],
  );

  const armCompletionStep = () => {
    setCompletionStepArmed(true);
  };

  const communityJoinFlow = useJoinCommunityFlow({
    onJoined: () => {
      recordCurrentWizardEvent("onboarding_wizard.completed", {
        action: "join_community",
        result: "joined",
        includeLatency: true,
      });
      armCompletionStep();
    },
    onError: () => {
      recordCurrentWizardEvent("onboarding_wizard.error", {
        action: "join_community",
        reason: "join_failed",
        includeLatency: true,
      });
    },
  });

  useEffect(() => {
    if (!open || !serverId || !isTrackedOnboardingWizardStep(currentStep)) return;
    const key = `${serverId}:${currentStep}`;
    if (shownWizardStepKey === key) return;
    setShownWizardStepKey(key);
    currentStepStartedAtRef.current = Date.now();
    void recordOnboardingWizardEvent({
      serverId,
      stepId: currentStep,
      eventType: "onboarding_wizard.step_shown",
    });
  }, [currentStep, open, serverId, shownWizardStepKey]);

  useEffect(() => {
    if (!open || !serverId || !currentStep) return;
    if (settings?.onboardingWizardCurrentStep === currentStep) return;
    const key = `${serverId}:${currentStep}`;
    if (persistedStepKey === key) return;
    setPersistedStepKey(key);
    void patchOnboardingSettings(serverId, { onboardingWizardCurrentStep: currentStep })
      .then((next) => {
        setSettings((prev) => prev ? {
          ...prev,
          onboardingWizardCurrentStep: next.onboardingWizardCurrentStep,
        } : next);
      })
      .catch(() => {
        setPersistedStepKey("");
      });
  }, [currentStep, open, persistedStepKey, serverId, settings?.onboardingWizardCurrentStep]);

  if (!serverId || !currentStep || !open) {
    return null;
  }

  const isSetupStep = currentStep === "add-computer" || currentStep === "create-agent";
  const showOptOut = isSetupStep || currentStep === "referral-source";

  const skipStepForSession = (step: "add-computer" | "create-agent" | "referral-source") => {
    const next = new Set(sessionSkippedSteps);
    next.add(step);
    writeSessionSkippedSteps(serverId, next);
    setSessionSkippedSteps(next);
    setOptOut(false);
  };

  const persistCurrentStepOptOut = async () => {
    if (currentStep === "add-computer") {
      const next = await patchOnboardingSettings(serverId, { dismissedAddComputerStep: true });
      setSettings(next);
      return;
    }
    if (currentStep === "create-agent") {
      const next = await patchOnboardingSettings(serverId, { dismissedCreateAgentStep: true });
      setSettings(next);
      return;
    }
    if (currentStep === "referral-source") {
      await updateProfile({ referralSourceSkipped: true });
      return;
    }
    const body =
      currentStep === "invite-teammates"
        ? { dismissedInviteStep: true }
        : currentStep === "join-community"
          ? { dismissedCommunityStep: true }
          : { dismissedNotificationStep: true };
    const next = await patchOnboardingSettings(serverId, body);
    setSettings(next);
  };

  const handleSkip = async (reason: "footer_skip" | "modal_close" = "footer_skip") => {
    if (persisting) return;
    setError("");
    recordCurrentWizardEvent("onboarding_wizard.skip_clicked", {
      reason,
      result: optOut ? "dismiss_requested" : "session_skip",
      includeLatency: true,
    });
    if (currentStep === "complete") {
      setSessionCompletedWizard(true);
      void patchOnboardingSettings(serverId, { onboardingWizardCurrentStep: null })
        .then((next) => setSettings(next))
        .catch(() => {
          recordCurrentWizardEvent("onboarding_wizard.error", {
            reason: "clear_resume_step_failed",
            result: "dismiss_failed",
            includeLatency: true,
          });
        });
      return;
    }
    if (isSetupStep) {
      if (!optOut) {
        skipStepForSession(currentStep);
        armCompletionStep();
        return;
      }
      setPersisting(true);
      try {
        await persistCurrentStepOptOut();
        recordCurrentWizardEvent("onboarding_wizard.dismissed", {
          reason,
          result: "dismissed",
          includeLatency: true,
        });
        skipStepForSession(currentStep);
        armCompletionStep();
      } catch {
        recordCurrentWizardEvent("onboarding_wizard.error", {
          reason: "save_preference_failed",
          result: "dismiss_failed",
          includeLatency: true,
        });
        skipStepForSession(currentStep);
        setError("Failed to save your preference.");
      } finally {
        setPersisting(false);
      }
      return;
    }
    if (currentStep === "referral-source" && !optOut) {
      skipStepForSession(currentStep);
      armCompletionStep();
      return;
    }
    setPersisting(true);
    try {
      await persistCurrentStepOptOut();
      recordCurrentWizardEvent("onboarding_wizard.dismissed", {
        reason,
        result: "dismissed",
        includeLatency: true,
      });
      if (currentStep === "referral-source") skipStepForSession(currentStep);
      armCompletionStep();
      setOptOut(false);
    } catch {
      recordCurrentWizardEvent("onboarding_wizard.error", {
        reason: "save_preference_failed",
        result: "dismiss_failed",
        includeLatency: true,
      });
      if (currentStep === "referral-source") {
        skipStepForSession(currentStep);
        armCompletionStep();
      }
      setError("Failed to save your preference.");
    } finally {
      setPersisting(false);
    }
  };

  const handlePrimarySetup = () => {
    if (currentStep === "add-computer") {
      recordCurrentWizardEvent("onboarding_wizard.primary_clicked", {
        action: "open_add_computer_dialog",
        includeLatency: true,
      });
      armCompletionStep();
      setShowAddMachine(true);
    } else if (currentStep === "create-agent") {
      recordCurrentWizardEvent("onboarding_wizard.primary_clicked", {
        action: "open_create_agent_dialog",
        includeLatency: true,
      });
      armCompletionStep();
      setShowCreateAgent(true, true);
    }
  };

  const handleJoinCommunity = async (slug: typeof DEFAULT_COMMUNITY_SERVER_SLUG | typeof CHINESE_COMMUNITY_SERVER_SLUG) => {
    if (persisting || communityJoinFlow.joiningCommunitySlug) return;
    setPersisting(true);
    setError("");
    const result = slug === CHINESE_COMMUNITY_SERVER_SLUG ? "community_cn" : "community";
    recordCurrentWizardEvent("onboarding_wizard.primary_clicked", {
      action: "join_community",
      result,
      includeLatency: true,
    });
    const outcome = await communityJoinFlow.joinCommunity(slug);
    if (outcome.status === "error") setError(outcome.message);
    setPersisting(false);
  };

  const handleEnableNotifications = async () => {
    if (persisting || pushState.permission === "unsupported") return;
    setPersisting(true);
    setError("");
    const permissionBefore = getPushPermissionState();
    const result = await enablePushNotifications();
    const permissionAfter = getPushPermissionState();
    await recordWebPushPromptEvent({
      event: "web_push_native_result",
      trigger: "onboarding_wizard",
      result,
      permissionBefore,
      permissionAfter,
    });
    if (result === "granted") {
      await recordWebPushPromptEvent({
        event: "web_push_subscription_saved",
        trigger: "onboarding_wizard",
        result,
        permissionBefore,
        permissionAfter,
      });
      await refreshPushState();
      armCompletionStep();
    } else {
      if (result === "error") {
        await recordWebPushPromptEvent({
          event: "web_push_subscription_failed",
          trigger: "onboarding_wizard",
          result,
          permissionBefore,
          permissionAfter,
        });
      }
      setError(notificationErrorMessage(result));
    }
    setPersisting(false);
  };

  const primaryAction = (() => {
    if (currentStep === "add-computer" || currentStep === "create-agent") {
      const label = currentStep === "add-computer" ? "Add Computer" : "Create First Agent";
      const Icon = currentStep === "add-computer" ? Monitor : Bot;
      return (
        <button
          type="button"
          onClick={handlePrimarySetup}
          disabled={persisting}
          className="btn-brutal inline-flex items-center gap-1.5 bg-brutal-pink px-4 py-2 text-sm disabled:opacity-50"
          data-testid={`onboarding-${currentStep}-primary`}
        >
          <Icon size={14} />
          {label}
        </button>
      );
    }
    if (currentStep === "referral-source") {
      return (
        <button
          type="submit"
          form={REFERRAL_SOURCE_FORM_ID}
          disabled={persisting}
          className="btn-brutal bg-brutal-pink px-4 py-2 text-sm disabled:opacity-50"
          data-testid="referral-source-submit"
        >
          {persisting ? "Saving…" : "Submit"}
        </button>
      );
    }
    if (currentStep === "invite-teammates") {
      return (
        <button
          type="submit"
          form={INVITE_TEAMMATES_FORM_ID}
          disabled={persisting || inviteSending}
          className="btn-brutal inline-flex items-center gap-1.5 bg-brutal-pink px-4 py-2 text-sm disabled:opacity-50"
          data-testid="invite-send-button"
        >
          <Mail size={14} />
          {inviteSending ? "Sending…" : "Send Invites"}
        </button>
      );
    }
    if (currentStep === "join-community") {
      const preferredSlug = recommendedCommunitySlug(servers);
      const primarySlug =
        browserPrefersChineseCommunity() && !hasJoinedCommunity(servers, CHINESE_COMMUNITY_SERVER_SLUG)
          ? CHINESE_COMMUNITY_SERVER_SLUG
          : preferredSlug;
      return (
        <button
          type="button"
          onClick={() => void handleJoinCommunity(primarySlug)}
          disabled={persisting || !!communityJoinFlow.joiningCommunitySlug}
          className="btn-brutal bg-brutal-pink px-4 py-2 text-sm disabled:opacity-50"
          data-testid="join-community-button"
        >
          {persisting || communityJoinFlow.joiningCommunitySlug
            ? "Joining…"
            : primarySlug === CHINESE_COMMUNITY_SERVER_SLUG
              ? "Join Chinese Community"
              : "Join Community"}
        </button>
      );
    }
    if (currentStep === "enable-notifications") {
      return (
        <button
          type="button"
          onClick={() => void handleEnableNotifications()}
          disabled={persisting || pushState.permission === "unsupported"}
          className="btn-brutal inline-flex items-center gap-1.5 bg-brutal-pink px-4 py-2 text-sm disabled:opacity-50"
          data-testid="enable-notifications-button"
        >
          <Bell size={14} />
          {persisting ? "Enabling…" : "Enable Notifications"}
        </button>
      );
    }
    if (currentStep === "complete") {
      return (
        <button
          type="button"
          onClick={() => void handleSkip("footer_skip")}
          disabled={persisting}
          className="btn-brutal bg-brutal-pink px-4 py-2 text-sm disabled:opacity-50"
          data-testid="onboarding-complete-button"
        >
          {persisting ? "Saving…" : "Let's Go"}
        </button>
      );
    }
    return null;
  })();

  const StepIcon =
    currentStep === "add-computer"
      ? Monitor
      : currentStep === "create-agent"
        ? Bot
        : currentStep === "enable-notifications"
          ? Bell
          : currentStep === "complete"
            ? PartyPopper
            : Users;
  const introDescription = stepDescription(currentStep);
  const showStepIcon = currentStep !== "referral-source";
  const centerIntro = currentStep === "invite-teammates" || currentStep === "enable-notifications";
  const stepIcon = showStepIcon ? <StepIcon size={17} className="text-black" /> : null;
  const introContent = (() => {
    if (currentStep === "add-computer") {
      return (
        <p className="text-xs text-black/60">
          Need an agent runtime installed — {formatList(SUPPORTED_RUNTIME_NAMES)}.
        </p>
      );
    }
    if (currentStep === "complete") {
      return (
        <div className="space-y-2 text-sm leading-relaxed text-black/70">
          <p>One thing: agents here have persistent identity across channels. They remember. Work with them like teammates:</p>
          <ul className="list-disc space-y-1 pl-5">
            <li>Talk to them directly</li>
            <li>Hand them tasks</li>
            <li>Correct them when they miss</li>
          </ul>
          <p>Ask for what you need. They&apos;ll come back when they need you.</p>
        </div>
      );
    }
    return null;
  })();

  const handleModalClose = () => {
    if (currentStepKey) setClosedStepKey(currentStepKey);
    recordCurrentWizardEvent("onboarding_wizard.dismissed", {
      reason: "modal_close",
      result: "closed",
      includeLatency: true,
    });
  };

  return (
    <>
      <OnboardingStepDialog
        step={currentStep}
        title={stepTitle(currentStep)}
        icon={stepIcon}
        description={introDescription}
        centerIntro={centerIntro}
        introChildren={introContent}
        error={error}
        onClose={handleModalClose}
        footer={
          <WizardFooter
            showOptOut={showOptOut}
            optOut={optOut}
            setOptOut={setOptOut}
            persisting={persisting}
            onSkip={() => void handleSkip("footer_skip")}
            primaryAction={primaryAction}
            hideSkip={currentStep === "complete"}
          />
        }
      >
        {currentStep === "referral-source" && (
          <ReferralSourceStep
            formId={REFERRAL_SOURCE_FORM_ID}
            disabled={persisting}
            onComplete={async (source, other) => {
              setPersisting(true);
              setError("");
              recordCurrentWizardEvent("onboarding_wizard.primary_clicked", {
                action: "submit_referral",
                result: source,
                includeLatency: true,
              });
              try {
                await updateProfile({ referralSource: source, referralSourceOther: other });
                recordCurrentWizardEvent("onboarding_wizard.completed", {
                  action: "submit_referral",
                  result: source,
                  includeLatency: true,
                });
                skipStepForSession("referral-source");
                armCompletionStep();
                await refreshSettings();
              } catch {
                recordCurrentWizardEvent("onboarding_wizard.error", {
                  action: "submit_referral",
                  reason: "save_referral_failed",
                  includeLatency: true,
                });
                skipStepForSession("referral-source");
                armCompletionStep();
                setError("Failed to save your answer.");
              } finally {
                setPersisting(false);
              }
            }}
          />
        )}
        {currentStep === "invite-teammates" && (
          <InviteTeammatesStep
            formId={INVITE_TEAMMATES_FORM_ID}
            serverId={serverId}
            disabled={persisting}
            sending={inviteSending}
            setSending={setInviteSending}
            onPrimaryClick={(count) => {
              recordCurrentWizardEvent("onboarding_wizard.primary_clicked", {
                action: "send_invites",
                result: String(count),
                includeLatency: true,
              });
            }}
            onError={(reason) => {
              recordCurrentWizardEvent("onboarding_wizard.error", {
                action: "send_invites",
                reason,
                includeLatency: true,
              });
            }}
            onComplete={async () => {
              setPersisting(true);
              setError("");
              try {
                const next = await patchOnboardingSettings(serverId, { dismissedInviteStep: true });
                setSettings(next);
                armCompletionStep();
                void loadMembers();
                recordCurrentWizardEvent("onboarding_wizard.completed", {
                  action: "send_invites",
                  result: "invites_sent",
                  includeLatency: true,
                });
              } catch {
                recordCurrentWizardEvent("onboarding_wizard.error", {
                  action: "send_invites",
                  reason: "save_invite_step_failed",
                  includeLatency: true,
                });
                setError("Failed to save invite step.");
              } finally {
                setPersisting(false);
              }
            }}
          />
        )}
        {currentStep === "enable-notifications" && (
          <EnableNotificationsStep
            permission={pushState.permission}
          />
        )}
      </OnboardingStepDialog>
      {communityJoinFlow.agreementDialog}
    </>
  );
}

function ReferralSourceStep({
  formId,
  disabled,
  onComplete,
}: {
  formId: string;
  disabled: boolean;
  onComplete: (source: string, other: string | null) => Promise<void>;
}) {
  const [source, setSource] = useState<string>("twitter_x");
  const [other, setOther] = useState("");
  const isOther = source === "other";

  return (
    <form
      id={formId}
      className="mb-5 space-y-3"
      onSubmit={(event) => {
        event.preventDefault();
        void onComplete(source, isOther ? other.trim() || null : null);
      }}
    >
      <div role="radiogroup" aria-label="Where did you hear about us?" className="grid gap-2">
        {REFERRAL_OPTIONS.map((option) => (
          <button
            type="button"
            role="radio"
            aria-checked={source === option.value}
            key={option.value}
            onClick={() => setSource(option.value)}
            disabled={disabled}
            className={`flex w-full items-center justify-between gap-3 border-2 border-black px-3 py-2 text-left text-sm font-bold transition-colors disabled:cursor-not-allowed disabled:opacity-60 ${
              source === option.value
                ? "bg-brutal-yellow shadow-brutal-sm"
                : "bg-white hover:bg-brutal-yellow"
            }`}
            data-testid={`referral-option-${option.value}`}
          >
            <span>{option.label}</span>
            <Check size={14} className={`shrink-0 ${source === option.value ? "opacity-100" : "opacity-0"}`} />
          </button>
        ))}
      </div>
      {isOther && (
        <input
          type="text"
          value={other}
          onChange={(event) => setOther(event.target.value)}
          maxLength={200}
          className="input-brutal w-full"
          placeholder="Where did you hear about us?"
          disabled={disabled}
          data-testid="referral-source-other-input"
        />
      )}
    </form>
  );
}

type JoinLinkRecord = {
  id: string;
  token: string;
};

function InviteTeammatesStep({
  formId,
  serverId,
  disabled,
  sending,
  setSending,
  onPrimaryClick,
  onError,
  onComplete,
}: {
  formId: string;
  serverId: string;
  disabled: boolean;
  sending: boolean;
  setSending: (sending: boolean) => void;
  onPrimaryClick: (recipientCount: number) => void;
  onError: (reason: string) => void;
  onComplete: () => Promise<void>;
}) {
  const [emails, setEmails] = useState(["", "", ""]);
  const [joinLink, setJoinLink] = useState<JoinLinkRecord | null>(null);
  const [loadingLink, setLoadingLink] = useState(false);
  const [copied, setCopied] = useState(false);
  const [error, setError] = useState("");
  const joinUrl = joinLink ? `${window.location.origin}/join/${joinLink.token}` : "";

  useEffect(() => {
    let cancelled = false;
    setLoadingLink(true);
    setError("");
    void (async () => {
      try {
        const { data: links } = await api.get(`/servers/${serverId}/join-links`);
        const existing = Array.isArray(links) ? links[0] as JoinLinkRecord | undefined : undefined;
        if (existing) {
          if (!cancelled) setJoinLink(existing);
          return;
        }
        const { data } = await api.post(`/servers/${serverId}/join-links`, {
          maxUses: null,
          expiresAt: null,
        });
        if (!cancelled) setJoinLink(data.link);
      } catch (err: unknown) {
        const axiosErr = err as { response?: { data?: { error?: string } } };
        if (!cancelled) setError(axiosErr.response?.data?.error || "Failed to prepare join link.");
      } finally {
        if (!cancelled) setLoadingLink(false);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [serverId]);

  const copyLink = async () => {
    if (!joinUrl) return;
    await navigator.clipboard.writeText(joinUrl);
    setCopied(true);
    window.setTimeout(() => setCopied(false), 1500);
  };

  const sendInvites = async (event: React.FormEvent) => {
    event.preventDefault();
    const targets = emails.map((email) => email.trim()).filter(Boolean);
    if (targets.length === 0) {
      setError("Enter at least one email, or copy the join link.");
      onError("empty_invite_targets");
      return;
    }
    setSending(true);
    setError("");
    onPrimaryClick(targets.length);
    try {
      await Promise.all(targets.map((email) => api.post(`/servers/${serverId}/invites`, { email })));
      await onComplete();
    } catch (err: unknown) {
      const axiosErr = err as { response?: { data?: { error?: string } } };
      onError("send_invites_failed");
      setError(axiosErr.response?.data?.error || "Failed to send invites.");
    } finally {
      setSending(false);
    }
  };

  return (
    <form id={formId} className="mb-5 space-y-4" onSubmit={sendInvites}>
      {error && <div className="border-2 border-black bg-brutal-orange/20 p-2 text-xs font-bold">{error}</div>}
      <div>
        <label className="mb-1 block text-xs font-bold uppercase tracking-wide text-black/60">Join link</label>
        <div className="flex items-center gap-2">
          <div className="min-w-0 flex-1 border-2 border-black bg-white px-2 py-2 font-mono text-xs truncate select-all">
            {loadingLink ? "Preparing join link…" : joinUrl || "Join link unavailable"}
          </div>
          <button
            type="button"
            onClick={copyLink}
            disabled={disabled || loadingLink || !joinUrl}
            className="btn-brutal-sm shrink-0 bg-white p-2 disabled:opacity-50"
            title="Copy join link"
            data-testid="invite-copy-join-link"
          >
            {copied ? <Check size={14} /> : <Copy size={14} />}
          </button>
        </div>
        <div className="mt-1 flex items-center gap-1 text-xs text-black/50">
          <Link2 size={12} />
          Anyone with this link can join this server.
        </div>
      </div>
      <div>
        <label className="mb-1 block text-xs font-bold uppercase tracking-wide text-black/60">Emails</label>
        <div className="space-y-2">
          {emails.map((email, index) => (
            <input
              key={index}
              type="email"
              value={email}
              onChange={(event) => setEmails((prev) => prev.map((value, idx) => idx === index ? event.target.value : value))}
              className="input-brutal w-full"
              placeholder={index === 0 ? "teammate@example.com" : "optional"}
              disabled={disabled || sending}
              data-testid={`invite-email-${index + 1}`}
            />
          ))}
        </div>
      </div>
    </form>
  );
}

function EnableNotificationsStep({ permission }: { permission: NotificationPermission | "unsupported" }) {
  return (
    <div className="mb-5">
      {permission === "unsupported" && (
        <div className="border-2 border-black bg-brutal-orange/20 p-2 text-xs font-bold">
          This browser does not support web push notifications.
        </div>
      )}
    </div>
  );
}

function WizardFooter({
  showOptOut,
  optOut,
  setOptOut,
  persisting,
  onSkip,
  primaryAction,
  hideSkip = false,
}: {
  showOptOut: boolean;
  optOut: boolean;
  setOptOut: (value: boolean) => void;
  persisting: boolean;
  onSkip: () => void;
  primaryAction?: ReactNode;
  hideSkip?: boolean;
}) {
  return (
    <div className="grid grid-cols-[minmax(0,1fr)_auto] items-center gap-4 border-t-2 border-black/20 pt-4">
      {showOptOut ? (
        <label className="inline-flex min-w-0 select-none items-center gap-1.5">
          <Checkbox
            checked={optOut}
            onChange={(event) => setOptOut(event.target.checked)}
            disabled={persisting}
            data-testid="onboarding-opt-out-checkbox"
          />
          <span className="truncate text-xs font-bold text-black/60">Don&apos;t remind me again</span>
        </label>
      ) : (
        <div />
      )}

      <div className="flex shrink-0 items-center gap-2">
        {!hideSkip && (
          <button
            type="button"
            onClick={onSkip}
            disabled={persisting}
            className="btn-brutal whitespace-nowrap bg-white px-4 py-2 text-sm"
            data-testid="onboarding-skip-button"
          >
            {persisting ? "Saving…" : "Skip"}
          </button>
        )}
        {primaryAction}
      </div>
    </div>
  );
}

function notificationErrorMessage(result: Awaited<ReturnType<typeof enablePushNotifications>>) {
  if (result === "denied") {
    return "Browser notification permission was denied. Re-enable it in browser site settings.";
  }
  if (result === "unavailable") {
    return "Push notifications are not configured on this server yet.";
  }
  if (result === "unsupported") {
    return "This browser does not support web push notifications.";
  }
  if (result === "error") {
    return "Failed to enable push notifications.";
  }
  return "Notifications were not enabled.";
}
