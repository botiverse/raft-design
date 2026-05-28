import { useCallback, useState, useEffect } from "react";
import { X } from "lucide-react";
import { useProfileStore } from "../../store/profileStore";
import { useAgentStore, type Agent } from "../../store/agentStore";
import { useServerStore } from "../../store/serverStore";
import { useResizablePanel } from "../../hooks/useResizablePanel";
import AgentDetailPanel from "../agent/AgentDetailPanel";
import HumanDetailPanel, { type HumanProfile } from "../member/HumanDetailPanel";
import { resolveHumanProfile } from "../member/resolveHumanProfile";
import api from "../../api/client";
import {
  getCachedAgentProfile,
  getCachedHumanProfile,
  setCachedAgentProfile,
  setCachedHumanProfile,
} from "./profileFallbackCache";

export default function ProfilePanel() {
  const profileType = useProfileStore((s) => s.profileType);
  const profileId = useProfileStore((s) => s.profileId);
  const closeProfile = useProfileStore((s) => s.closeProfile);

  const agent = useAgentStore(
    useCallback((s) => s.agents.find((a) => a.id === profileId), [profileId])
  );
  const updateAgentActivity = useAgentStore((s) => s.updateActivity);
  const members = useServerStore((s) => s.members);
  const currentServerId = useServerStore((s) => s.current?.id);
  const human = profileType === "human" ? members.find((m) => m.userId === profileId) : undefined;
  const [fallbackAgent, setFallbackAgent] = useState<Agent | null>(null);
  const [fallbackHuman, setFallbackHuman] = useState<HumanProfile | null>(null);

  useEffect(() => {
    let cancelled = false;
    if (profileType !== "agent" || !profileId || agent) {
      setFallbackAgent(null);
      return;
    }

    setFallbackAgent(getCachedAgentProfile(profileId));
    void api.get(`/agents/${profileId}`)
      .then(({ data }) => {
        if (!cancelled) {
          const fallback = data as Agent & { activity?: string; activityDetail?: string };
          setCachedAgentProfile(fallback);
          setFallbackAgent(fallback);
          if (typeof fallback.activity === "string") {
            updateAgentActivity(fallback.id, fallback.activity, fallback.activityDetail || "");
          }
        }
      })
      .catch(() => {
        if (!cancelled) {
          setFallbackAgent(null);
        }
      });

    return () => {
      cancelled = true;
    };
  }, [agent, profileId, profileType, updateAgentActivity]);

  useEffect(() => {
    let cancelled = false;
    if (profileType !== "human" || !profileId || !currentServerId) {
      setFallbackHuman(null);
      return;
    }

    setFallbackHuman(getCachedHumanProfile(currentServerId, profileId));
    void api.get(`/servers/${currentServerId}/members/${profileId}/profile`)
      .then(({ data }) => {
        if (!cancelled) {
          const fallback = data as HumanProfile;
          setCachedHumanProfile(currentServerId, fallback);
          setFallbackHuman(fallback);
        }
      })
      .catch(() => {
        if (!cancelled) {
          setFallbackHuman(null);
        }
      });

    return () => {
      cancelled = true;
    };
  }, [currentServerId, profileId, profileType]);

  const { width, handleResizeStart, handleResizeMove, handleResizeEnd } = useResizablePanel({
    storageKey: "slock:profilePanelWidth",
    min: 300,
    max: 600,
    defaultWidth: 380,
    direction: "left",
  });

  // Track desktop vs mobile
  const [isDesktop, setIsDesktop] = useState(() =>
    typeof window !== "undefined" ? window.matchMedia("(min-width: 1024px)").matches : true
  );
  useEffect(() => {
    const mq = window.matchMedia("(min-width: 1024px)");
    const handler = (e: MediaQueryListEvent) => setIsDesktop(e.matches);
    mq.addEventListener("change", handler);
    return () => mq.removeEventListener("change", handler);
  }, []);

  // Close on Escape
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") closeProfile();
    };
    document.addEventListener("keydown", handleKeyDown);
    return () => document.removeEventListener("keydown", handleKeyDown);
  }, [closeProfile]);

  const resolvedAgent = profileType === "agent" ? agent ?? fallbackAgent : null;

  if (profileType === "agent" && resolvedAgent) {
    return (
      <div
        data-testid="profile-panel"
        className="absolute inset-0 z-30 flex flex-col bg-white lg:relative lg:inset-auto lg:z-auto lg:border-l-2 lg:border-black"
        style={isDesktop ? { width } : undefined}
      >
        {/* Resize handle (desktop only) */}
        <div
          className="hidden md:block absolute left-0 top-0 bottom-0 w-2 -ml-1 z-10 cursor-col-resize select-none"
          onPointerDown={handleResizeStart}
          onPointerMove={handleResizeMove}
          onPointerUp={handleResizeEnd}
          onPointerCancel={handleResizeEnd}
        />
        <AgentDetailPanel agent={resolvedAgent} onClose={closeProfile} />
      </div>
    );
  }

  const resolvedHuman: HumanProfile | null = profileType === "human"
    ? resolveHumanProfile(human, fallbackHuman)
    : null;

  if (profileType === "human" && resolvedHuman) {
    return (
      <div
        data-testid="profile-panel"
        className="absolute inset-0 z-30 flex flex-col bg-white lg:relative lg:inset-auto lg:z-auto lg:border-l-2 lg:border-black"
        style={isDesktop ? { width } : undefined}
      >
        {/* Resize handle (desktop only) */}
        <div
          className="hidden md:block absolute left-0 top-0 bottom-0 w-2 -ml-1 z-10 cursor-col-resize select-none"
          onPointerDown={handleResizeStart}
          onPointerMove={handleResizeMove}
          onPointerUp={handleResizeEnd}
          onPointerCancel={handleResizeEnd}
        />
        <HumanDetailPanel human={resolvedHuman} onClose={closeProfile} />
      </div>
    );
  }

  return null;
}
