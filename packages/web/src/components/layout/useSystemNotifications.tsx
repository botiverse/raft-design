import { useCallback, useEffect, useMemo, useRef, useState, type ReactNode } from "react";
import { AlertTriangle, ArrowUpCircle, Download, WifiOff } from "lucide-react";
import {
  PLAN_CONFIG,
  DOWNGRADE_GRACE_PERIOD_DAYS,
  getEffectiveLimits,
  isDaemonOutdated,
} from "@slock-ai/shared";
import { useServerStore } from "../../store/serverStore";
import { useAgentStore } from "../../store/agentStore";
import { useMachineStore } from "../../store/machineStore";
import { useChannelStore } from "../../store/channelStore";
import { useAppNavigate } from "../../hooks/useAppNavigate";
import {
  PWA_INSTALL_ELIGIBLE_DAILY_KEY,
  PWA_INSTALL_OPEN_EVENT,
  PWA_INSTALL_SESSION_COUNT_KEY,
  PWA_INSTALL_SESSION_DISMISSED_KEY,
  PWA_INSTALL_SESSION_SEEN_KEY,
  getCooldownState,
  getPwaInstallDisplayMode,
  getPwaInstallPlatform,
  getSessionCountBucket,
  isPwaStandalone,
  readNumberStorage,
  recordPwaInstallEvent,
  shouldShowPwaInstallPrompt,
  type BeforeInstallPromptEvent,
  type PwaInstallCooldownState,
  type PwaInstallPlatform,
  type PwaInstallSurface,
} from "../../utils/pwaInstall";
import type { NotificationKind } from "./notificationKind";
import { useDismissedNotificationStore } from "./dismissedNotificationStore";
export { compareNotificationKind, topNotificationKind } from "./notificationKind";
export type { NotificationKind } from "./notificationKind";

// Originating direction: stdrc 2026-05-02 #proj-uiux:f87f6eb9 (task #94).
//
// Single hook that aggregates everything we'd previously surface as a top
// banner stack into one ordered list of system notifications. The
// Notification Center popup renders this list verbatim. Kinds are ordered
// "error > warning > info" so the worst kind wins for indicator color and
// inbox-style sort.
//
// Adding a new notification source is two steps: build a `NotificationEntry`
// for the new condition and append it to the array returned by this hook. Do
// NOT duplicate kind ordering or default icon decisions in the trigger.

export interface NotificationAction {
  label: string;
  onClick: () => void;
  variant?: "primary" | "secondary";
  disabled?: boolean;
}

export interface NotificationEntry {
  id: string;
  kind: NotificationKind;
  icon?: ReactNode;
  title: string;
  body: ReactNode;
  action?: NotificationAction;
  secondaryAction?: NotificationAction;
  /** When set, the row gets a Dismiss action that hides this notification until the
   *  fingerprint changes. The fingerprint must encode every dimension of
   *  the notification's state — e.g. for machine-offline include the sorted
   *  ids of currently-offline machines, so the notification re-surfaces when
   *  a *different* machine drops. See dismissedNotificationStore.ts. */
  dismissalKey?: string;
}

export function useSystemNotifications(): NotificationEntry[] {
  const server = useServerStore((s) => s.current);
  const machines = useMachineStore((s) => s.machines);
  const machineLoading = useMachineStore((s) => s.loading);
  const latestDaemonVersion = useMachineStore((s) => s.latestDaemonVersion);
  const allAgents = useAgentStore((s) => s.agents);
  const agentLoading = useAgentStore((s) => s.loading);
  const channelsList = useChannelStore((s) => s.channels);
  const nav = useAppNavigate();

  const serverId = server?.id ?? null;
  const [pwaPlatform, setPwaPlatform] = useState<PwaInstallPlatform>("other");
  const [pwaSessionCount, setPwaSessionCount] = useState(1);
  const [pwaCooldownState, setPwaCooldownState] = useState<PwaInstallCooldownState>("not_dismissed");
  const [pwaStandalone, setPwaStandalone] = useState(false);
  const [pwaDeferredPrompt, setPwaDeferredPrompt] = useState<BeforeInstallPromptEvent | null>(null);
  const [pwaInstallBusy, setPwaInstallBusy] = useState(false);
  const pwaShownRef = useRef(false);
  const pwaEligibleRef = useRef(false);

  // Reset dismissed notifications on server change so the new context starts from a clean slate.
  const resetDismissedNotifications = useDismissedNotificationStore((s) => s.reset);
  useEffect(() => {
    resetDismissedNotifications();
  }, [serverId, resetDismissedNotifications]);

  const trackPwaInstall = useCallback(
    (
      event: Parameters<typeof recordPwaInstallEvent>[0]["event"],
      surface: PwaInstallSurface,
      extra: Partial<Parameters<typeof recordPwaInstallEvent>[0]> = {},
    ) => {
      if (typeof window === "undefined") return;
      recordPwaInstallEvent({
        event,
        platform: pwaPlatform,
        surface,
        trigger: "supported_browser",
        displayMode: getPwaInstallDisplayMode(window),
        sessionCountBucket: getSessionCountBucket(pwaSessionCount),
        cooldownState: pwaCooldownState,
        ...extra,
      });
    },
    [pwaCooldownState, pwaPlatform, pwaSessionCount],
  );

  useEffect(() => {
    if (typeof window === "undefined") return;
    setPwaPlatform(getPwaInstallPlatform(window.navigator.userAgent));
    setPwaStandalone(isPwaStandalone(window));

    const alreadySeen = window.sessionStorage.getItem(PWA_INSTALL_SESSION_SEEN_KEY) === "1";
    const current = readNumberStorage(window.localStorage, PWA_INSTALL_SESSION_COUNT_KEY) ?? 0;
    const next = alreadySeen ? Math.max(current, 1) : current + 1;
    if (!alreadySeen) {
      window.sessionStorage.setItem(PWA_INSTALL_SESSION_SEEN_KEY, "1");
      window.localStorage.setItem(PWA_INSTALL_SESSION_COUNT_KEY, String(next));
    }
    setPwaSessionCount(Math.max(next, 1));
    setPwaCooldownState(
      window.sessionStorage.getItem(PWA_INSTALL_SESSION_DISMISSED_KEY) === "1"
        ? "dismissed_active"
        : getCooldownState(Date.now(), null),
    );
  }, []);

  useEffect(() => {
    if (typeof window === "undefined") return;
    const onBeforeInstallPrompt = (event: Event) => {
      event.preventDefault();
      setPwaDeferredPrompt(event as BeforeInstallPromptEvent);
    };
    const onAppInstalled = () => {
      setPwaStandalone(true);
      recordPwaInstallEvent({
        event: "pwa_install_appinstalled",
        platform: pwaPlatform,
        surface: "notification_center",
        trigger: "supported_browser",
        displayMode: getPwaInstallDisplayMode(window),
        sessionCountBucket: getSessionCountBucket(pwaSessionCount),
        cooldownState: pwaCooldownState,
      });
    };
    window.addEventListener("beforeinstallprompt", onBeforeInstallPrompt);
    window.addEventListener("appinstalled", onAppInstalled);
    return () => {
      window.removeEventListener("beforeinstallprompt", onBeforeInstallPrompt);
      window.removeEventListener("appinstalled", onAppInstalled);
    };
  }, [pwaCooldownState, pwaPlatform, pwaSessionCount]);

  const pwaInstallVisible = shouldShowPwaInstallPrompt({
    platform: pwaPlatform,
    standalone: pwaStandalone,
    cooldownState: pwaCooldownState,
    hasNativePrompt: !!pwaDeferredPrompt,
  });

  useEffect(() => {
    if (!pwaInstallVisible || pwaEligibleRef.current || typeof window === "undefined") return;
    const key = `${new Date().toISOString().slice(0, 10)}:${pwaPlatform}`;
    if (window.localStorage.getItem(PWA_INSTALL_ELIGIBLE_DAILY_KEY) !== key) {
      trackPwaInstall("pwa_install_eligible", "notification_center");
      window.localStorage.setItem(PWA_INSTALL_ELIGIBLE_DAILY_KEY, key);
    }
    pwaEligibleRef.current = true;
  }, [pwaInstallVisible, pwaPlatform, trackPwaInstall]);

  useEffect(() => {
    if (!pwaInstallVisible || pwaShownRef.current) return;
    pwaShownRef.current = true;
    trackPwaInstall("pwa_install_cta_shown", "notification_center");
  }, [pwaInstallVisible, trackPwaInstall]);

  const handleDismissPwaInstall = useCallback(() => {
    if (typeof window !== "undefined") {
      window.sessionStorage.setItem(PWA_INSTALL_SESSION_DISMISSED_KEY, "1");
    }
    setPwaCooldownState("dismissed_active");
  }, []);

  const handlePwaInstall = useCallback(async () => {
    if (pwaPlatform === "android_chromium" || pwaPlatform === "desktop_chromium") {
      if (!pwaDeferredPrompt) return;
      setPwaInstallBusy(true);
      trackPwaInstall("pwa_install_cta_clicked", "notification_center");
      try {
        await pwaDeferredPrompt.prompt();
        const choice = await pwaDeferredPrompt.userChoice;
        trackPwaInstall("pwa_install_native_prompt_result", "notification_center", { outcome: choice.outcome });
        setPwaDeferredPrompt(null);
        if (choice.outcome === "dismissed") handleDismissPwaInstall();
      } finally {
        setPwaInstallBusy(false);
      }
      return;
    }

    window.dispatchEvent(new CustomEvent(PWA_INSTALL_OPEN_EVENT, { detail: { source: "notification_center" } }));
  }, [handleDismissPwaInstall, pwaDeferredPrompt, pwaPlatform, trackPwaInstall]);

  return useMemo<NotificationEntry[]>(() => {
    const out: NotificationEntry[] = [];

    // ── 1. Plan downgrade ────────────────────────────────────────────────
    if (server && server.plan === "free" && server.planDowngradedAt) {
      const downgradedAt = new Date(server.planDowngradedAt);
      const graceEnd = new Date(downgradedAt);
      graceEnd.setDate(graceEnd.getDate() + DOWNGRADE_GRACE_PERIOD_DAYS);
      const now = new Date();
      const graceExpired = now >= graceEnd;
      const daysLeft = graceExpired
        ? 0
        : Math.ceil((graceEnd.getTime() - now.getTime()) / (1000 * 60 * 60 * 24));

      const limits = getEffectiveLimits("free");
      const liveAgents = allAgents.filter((a) => !a.deletedAt);
      const excessAgents = Math.max(0, liveAgents.length - limits.maxAgents);
      const excessMachines = Math.max(0, machines.length - limits.maxMachines);
      const excessChannels =
        limits.maxChannels !== -1 ? Math.max(0, channelsList.length - limits.maxChannels) : 0;

      out.push({
        id: "plan-downgrade",
        kind: graceExpired ? "error" : "warning",
        icon: <AlertTriangle size={16} className="text-black" />,
        // Dismissal fingerprint: anchor on which phase + how much of an excess
        // remains so the notification re-surfaces if the user adds more resources
        // or grace expires.
        dismissalKey: `plan-downgrade:${graceExpired ? "expired" : "grace"}:${excessAgents}:${excessMachines}:${excessChannels}`,
        title: graceExpired ? "Excess agents have been stopped" : "Plan downgraded to Free",
        body: graceExpired ? (
          <span>Upgrade to reactivate the agents that were stopped.</span>
        ) : (
          <span>
            {excessAgents > 0 && (
              <>
                {excessAgents} {excessAgents === 1 ? "agent" : "agents"} over the limit.{" "}
              </>
            )}
            {excessMachines > 0 && (
              <>
                {excessMachines} {excessMachines === 1 ? "computer" : "computers"} over the limit.{" "}
              </>
            )}
            {excessChannels > 0 && (
              <>
                {excessChannels} {excessChannels === 1 ? "channel" : "channels"} over the limit.{" "}
              </>
            )}
            <span>
              <span className="font-bold">
                {daysLeft} {daysLeft === 1 ? "day" : "days"}
              </span>{" "}
              left to reduce resources or upgrade.
            </span>
          </span>
        ),
        action: {
          label: "Upgrade",
          onClick: () => nav.toSettings("server"),
          variant: "primary",
        },
      });

      // Keep the configured plan name visible somewhere in the codebase so
      // a future refactor doesn't drop the dependency without noticing.
      void PLAN_CONFIG;
    }

    // ── 2. Machine state notifications ─────────────────────────────────────────
    if (!machineLoading && !agentLoading) {
      const offlineMachines = machines.filter((m) => m.status === "offline");
      const outdatedMachines = machines.filter(
        (m) => m.status === "online" && isDaemonOutdated(m.daemonVersion, latestDaemonVersion),
      );
      const liveAgents = allAgents.filter((a) => !a.deletedAt);

      if (offlineMachines.length > 0) {
        // Kind follows impact, not status: an offline machine without
        // any *active* agents is a warning-level notification the user can clean up later; one
        // carrying agents the user expects to be running blocks live work
        // and is escalated to error. Per stdrc 2026-05-02
        // #proj-uiux:f87f6eb9 msg=fc60d1c2 ("Machine 掉线如果有 active 任务
        // 确实应该是 error") — only `status === "active"` counts; `stopped`
        // / `inactive` agents already aren't running, so them being on an
        // offline machine doesn't change anything for the user right now.
        const offlineIds = new Set(offlineMachines.map((m) => m.id));
        const activeAgentsOnOffline = liveAgents.filter(
          (a) =>
            a.machineId &&
            offlineIds.has(a.machineId) &&
            a.status === "active",
        );
        const offlineKind: NotificationKind =
          activeAgentsOnOffline.length > 0 ? "error" : "warning";
        const names = offlineMachines.map((m) => m.name).join(", ");
        const verb = offlineMachines.length === 1 ? "is offline" : "are offline";
        const sortedIds = [...offlineIds].sort().join(",");
        out.push({
          id: "machine-offline",
          kind: offlineKind,
          icon: <WifiOff size={16} className="text-black" />,
          // Fingerprint = which machines are offline. If a different set goes
          // offline (different machine id, or the count changes), the
          // dismissal no longer matches and the notification shows again.
          dismissalKey: `machine-offline:${sortedIds}`,
          title: `${names} ${verb}`,
          body:
            activeAgentsOnOffline.length > 0 ? (
              <span className="text-black/60">
                {activeAgentsOnOffline.length}{" "}
                {activeAgentsOnOffline.length === 1 ? "agent is" : "agents are"} active
                on this computer and can't run until it reconnects.
              </span>
            ) : (
              <span className="text-black/60">
                No agents are active on this computer right now — reconnect when you
                need it next.
              </span>
            ),
          action: {
            label: "View",
            onClick: () => nav.toMachine(offlineMachines[0].id),
            variant: "primary",
          },
        });
      }

      if (outdatedMachines.length > 0) {
        const names = outdatedMachines.map((m) => m.name).join(", ");
        const verb =
          outdatedMachines.length === 1
            ? "is running an outdated daemon"
            : "are running outdated daemons";
        const outdatedIds = outdatedMachines.map((m) => m.id).sort().join(",");
        // Fingerprint also includes the latest target version so a freshly
        // released daemon resurfaces the notification even if the same machine
        // set was previously dismissed.
        const versionFingerprint = `${latestDaemonVersion ?? "unknown"}:${outdatedIds}`;
        out.push({
          id: "machine-outdated",
          kind: "warning",
          icon: <ArrowUpCircle size={16} className="text-black" />,
          dismissalKey: `machine-outdated:${versionFingerprint}`,
          title: `${names} ${verb}`,
          body: <span className="text-black/60">Stop the daemon and reconnect to update.</span>,
          action: {
            label: "View",
            onClick: () => nav.toMachine(outdatedMachines[0].id),
            variant: "primary",
          },
        });
      }

      // "No computer connected" / "No agents yet" used to live here, but per
      // stdrc 2026-05-02 #proj-uiux:f87f6eb9 msg=fc60d1c2 the OwnerOnboarding
      // modal already handles that surface; surfacing the same condition in
      // the notification center is duplicate noise. Don't add them back without
      // first removing the modal.
    }

    // ── 3. PWA install prompt ───────────────────────────────────────────
    if (pwaInstallVisible) {
      out.push({
        id: "pwa-install",
        kind: "info",
        icon: <Download size={16} className="text-black" />,
        title: "Install Slock",
        body: <span className="text-black/60">Open Slock faster from this device.</span>,
        action: {
          label: pwaInstallBusy ? "Opening…" : "Install",
          onClick: () => {
            if (!pwaInstallBusy) void handlePwaInstall();
          },
          variant: "primary",
          disabled: pwaInstallBusy,
        },
        secondaryAction: {
          label: "Dismiss",
          onClick: handleDismissPwaInstall,
          disabled: pwaInstallBusy,
        },
      });
    }

    return out;
  }, [
    server,
    machines,
    machineLoading,
    latestDaemonVersion,
    allAgents,
    agentLoading,
    channelsList,
    nav,
    pwaInstallVisible,
    pwaInstallBusy,
    handlePwaInstall,
    handleDismissPwaInstall,
  ]);
}

/**
 * Filtered version of useSystemNotifications: drops entries whose dismissalKey is
 * in the session-scoped dismissed set. The notification badge reads this so
 * dismissals immediately quiet the trigger.
 */
export function useVisibleNotifications(): NotificationEntry[] {
  const all = useSystemNotifications();
  const dismissed = useDismissedNotificationStore((s) => s.dismissedKeys);
  return useMemo(
    () => all.filter((w) => !w.dismissalKey || !dismissed.has(w.dismissalKey)),
    [all, dismissed],
  );
}
