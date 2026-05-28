import { useEffect, useState, useCallback } from "react";
import type { Agent } from "../store/agentStore";
import api from "../api/client";

/**
 * Fetches and manages the list of agents assigned to a channel.
 * Shared by ChannelMembers and other components that manage channel agents.
 */
export function useChannelAgents(channelId: string) {
  const [channelAgents, setChannelAgents] = useState<Agent[]>([]);

  const loadChannelAgents = useCallback(async () => {
    try {
      const { data } = await api.get(`/channels/${channelId}/agents`);
      setChannelAgents(data);
    } catch (err) {
      console.error(`Failed to load agents for channel ${channelId}:`, err);
    }
  }, [channelId]);

  useEffect(() => {
    loadChannelAgents();
  }, [loadChannelAgents]);

  const addAgent = useCallback(async (agentId: string) => {
    try {
      await api.post(`/channels/${channelId}/agents`, { agentId });
      await loadChannelAgents();
    } catch (err) {
      console.error(`Failed to add agent ${agentId} to channel ${channelId}:`, err);
    }
  }, [channelId, loadChannelAgents]);

  const removeAgent = useCallback(async (agentId: string) => {
    try {
      await api.delete(`/channels/${channelId}/agents/${agentId}`);
      await loadChannelAgents();
    } catch (err) {
      console.error(`Failed to remove agent ${agentId} from channel ${channelId}:`, err);
    }
  }, [channelId, loadChannelAgents]);

  return { channelAgents, loadChannelAgents, addAgent, removeAgent };
}
