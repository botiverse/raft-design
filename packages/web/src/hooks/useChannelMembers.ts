import { useEffect, useState, useCallback } from "react";
import type { AgentActivity } from "@slock-ai/shared";
import type { Agent } from "../store/agentStore";
import { useAgentStore } from "../store/agentStore";
import api from "../api/client";
import { getSocket } from "../api/socket";
import { notifyChannelMembersChanged, subscribeChannelMembersChanged } from "./channelMemberEvents";

export interface ChannelHuman {
  id: string;
  serverId?: string;
  serverName?: string | null;
  serverSlug?: string | null;
  name: string;
  displayName: string | null;
  description: string | null;
  avatarUrl: string | null;
  gravatarHash: string;
}

export type ChannelAgent = Agent & {
  activity?: AgentActivity;
  activityDetail?: string;
};

function hydrateChannelAgentActivities(agents: ChannelAgent[]) {
  const updateActivity = useAgentStore.getState().updateActivity;
  for (const agent of agents) {
    if (typeof agent.activity === "string") {
      updateActivity(agent.id, agent.activity, agent.activityDetail || "");
    }
  }
}

/**
 * Fetches and manages the list of all members (agents + humans) assigned to a channel.
 * Automatically re-fetches when a `channel:members-updated` socket event fires for this channel.
 */
export function useChannelMembers(channelId: string) {
  const [channelAgents, setChannelAgents] = useState<ChannelAgent[]>([]);
  const [channelHumans, setChannelHumans] = useState<ChannelHuman[]>([]);

  const loadMembers = useCallback(async () => {
    if (!channelId) {
      setChannelAgents([]);
      setChannelHumans([]);
      return;
    }
    try {
      const { data } = await api.get(`/channels/${channelId}/members`);
      const agents = (data.agents ?? []) as ChannelAgent[];
      hydrateChannelAgentActivities(agents);
      setChannelAgents(agents);
      setChannelHumans(data.humans ?? []);
    } catch (err) {
      console.error(`Failed to load members for channel ${channelId}:`, err);
    }
  }, [channelId]);

  useEffect(() => {
    loadMembers();
  }, [loadMembers]);

  // Listen for real-time membership changes
  useEffect(() => {
    if (!channelId) return;
    const socket = getSocket();
    const handler = (data: { channelId: string }) => {
      if (data.channelId === channelId) {
        loadMembers();
      }
    };
    socket.on("channel:members-updated", handler);
    return () => {
      socket.off("channel:members-updated", handler);
    };
  }, [channelId, loadMembers]);

  useEffect(() => {
    return subscribeChannelMembersChanged((changedChannelId) => {
      if (changedChannelId === channelId) {
        loadMembers();
      }
    });
  }, [channelId, loadMembers]);

  const addAgent = useCallback(async (agentId: string) => {
    try {
      await api.post(`/channels/${channelId}/members`, { agentId });
      notifyChannelMembersChanged(channelId);
      await loadMembers();
    } catch (err) {
      console.error(`Failed to add agent ${agentId} to channel ${channelId}:`, err);
    }
  }, [channelId, loadMembers]);

  const removeAgent = useCallback(async (agentId: string) => {
    try {
      await api.delete(`/channels/${channelId}/members/agent/${agentId}`);
      notifyChannelMembersChanged(channelId);
      await loadMembers();
    } catch (err) {
      console.error(`Failed to remove agent ${agentId} from channel ${channelId}:`, err);
    }
  }, [channelId, loadMembers]);

  const addHuman = useCallback(async (userId: string) => {
    try {
      await api.post(`/channels/${channelId}/members`, { userId });
      notifyChannelMembersChanged(channelId);
      await loadMembers();
    } catch (err) {
      console.error(`Failed to add human ${userId} to channel ${channelId}:`, err);
    }
  }, [channelId, loadMembers]);

  const removeHuman = useCallback(async (userId: string) => {
    try {
      await api.delete(`/channels/${channelId}/members/user/${userId}`);
      notifyChannelMembersChanged(channelId);
      await loadMembers();
    } catch (err) {
      console.error(`Failed to remove human ${userId} from channel ${channelId}:`, err);
    }
  }, [channelId, loadMembers]);

  return { channelAgents, channelHumans, loadMembers, addAgent, removeAgent, addHuman, removeHuman };
}
