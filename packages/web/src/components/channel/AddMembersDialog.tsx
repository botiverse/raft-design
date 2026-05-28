// AddMembersDialog — opened from an `<ActionCard>` whose action is
// `channel:add_member`. The agent prefilled a list of humans and agents
// it wants pulled into a specific channel; this dialog shows that list
// with each row toggleable so the human can deselect anyone they don't
// want added.
//
// Contract (per stdrc 2026-05-11 #proj-permission msg=670d903f):
//   - Visual mirrors ChannelMembers panel so it feels familiar.
//   - One-click "Add Members" commits everything selected under the
//     human's identity using the existing /channels/:id/members API.
//   - The agent's list is a suggestion. The dialog reports back the
//     actual add list (post-deselection) so the action card's "Done"
//     state records what really happened, not what the agent proposed.
//   - Already-members are filtered out client-side so the dialog only
//     shows net new additions; if everyone is already a member, the
//     submit button is disabled with a hint.

import { useEffect, useMemo, useState } from "react";
import { X, Hash, Lock } from "lucide-react";
import Modal from "../Modal";
import Banner from "../ui/Banner";
import {
  ChannelMemberListShell,
  ChannelMemberRemoveButton,
  ChannelMemberRow,
  ChannelMemberSectionHeader,
} from "./ChannelMemberList";
import { useAgentStore } from "../../store/agentStore";
import { useServerStore } from "../../store/serverStore";
import { useChannelStore } from "../../store/channelStore";
import { useChannelMembers } from "../../hooks/useChannelMembers";

interface Props {
  channelId: string;
  prefilledHumanIds?: string[];
  prefilledAgentIds?: string[];
  /** Why the agent prepared this — surfaced as a quote near the top. */
  draftHint?: string;
  onClose: () => void;
  /**
   * Fires after the dialog actually adds the selected members. The argument
   * carries the channelId and the IDs that were successfully added — only
   * those that the user kept selected AND whose add API call succeeded.
   * The ActionCard caller uses this to flip the card to "Done" with the
   * effective result, not the agent's original suggestion.
   */
  onSubmitted: (result: {
    channelId: string;
    channelName: string;
    addedHumanIds: string[];
    addedAgentIds: string[];
  }) => void;
  /**
   * Action-card funnel hook: fired right before the batch add starts (after
   * client-side validation). Records `execute_attempt` for the dialog-
   * driven path. No-op for non-card launches.
   */
  onSubmitStart?: () => void;
  /**
   * Action-card funnel hook: fired when the batch add fails (no rows
   * added, or thrown error). Records `execute_fail`. Receives the raw
   * error.
   */
  onSubmitError?: (err: unknown) => void;
}

export default function AddMembersDialog({
  channelId,
  prefilledHumanIds,
  prefilledAgentIds,
  draftHint,
  onClose,
  onSubmitted,
  onSubmitStart,
  onSubmitError,
}: Props) {
  const channels = useChannelStore((s) => s.channels);
  const members = useServerStore((s) => s.members);
  const agents = useAgentStore((s) => s.agents);
  const { channelAgents, channelHumans, loadMembers, addAgent, addHuman } = useChannelMembers(channelId);
  const channel = channels.find((c) => c.id === channelId) ?? null;

  // Already-members get filtered out so the dialog only proposes net new
  // additions. We compute this once on mount (after loadMembers populates)
  // and again whenever channelAgents/channelHumans changes.
  const existingHumanIds = useMemo(
    () => new Set(channelHumans.map((m) => m.id)),
    [channelHumans],
  );
  const existingAgentIds = useMemo(
    () => new Set(channelAgents.map((a) => a.id)),
    [channelAgents],
  );

  // Candidate lists: prefilled IDs that aren't already members and that
  // we can resolve to a known server member / agent.
  const candidateHumans = useMemo(() => {
    return (prefilledHumanIds ?? [])
      .filter((id) => !existingHumanIds.has(id))
      .map((id) => members.find((m) => m.userId === id))
      .filter((m): m is NonNullable<typeof m> => !!m);
  }, [prefilledHumanIds, existingHumanIds, members]);

  const candidateAgents = useMemo(() => {
    return (prefilledAgentIds ?? [])
      .filter((id) => !existingAgentIds.has(id))
      .map((id) => agents.find((a) => a.id === id))
      .filter((a): a is NonNullable<typeof a> => !!a);
  }, [prefilledAgentIds, existingAgentIds, agents]);

  // Selection state — every candidate starts selected. Toggling deselects.
  const [selectedHumanIds, setSelectedHumanIds] = useState<Set<string>>(new Set());
  const [selectedAgentIds, setSelectedAgentIds] = useState<Set<string>>(new Set());

  useEffect(() => {
    setSelectedHumanIds(new Set(candidateHumans.map((m) => m.userId)));
  }, [candidateHumans]);

  useEffect(() => {
    setSelectedAgentIds(new Set(candidateAgents.map((a) => a.id)));
  }, [candidateAgents]);

  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  function toggleHuman(id: string) {
    setSelectedHumanIds((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  }

  function toggleAgent(id: string) {
    setSelectedAgentIds((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  }

  const nothingToAdd = candidateHumans.length === 0 && candidateAgents.length === 0;
  const nothingSelected = selectedHumanIds.size === 0 && selectedAgentIds.size === 0;
  const canSubmit = !submitting && !nothingToAdd && !nothingSelected;

  async function handleSubmit() {
    if (!canSubmit || !channel) return;
    setSubmitting(true);
    setError(null);
    // Funnel hook: dialog-driven `execute_attempt` (action-card flow only).
    onSubmitStart?.();
    const addedHumans: string[] = [];
    const addedAgents: string[] = [];
    try {
      // Serial submit — `addHuman`/`addAgent` already log failures and
      // reload the member list. Per-row errors don't abort the batch;
      // we only flag the overall dialog as failed if everything fails.
      for (const id of selectedHumanIds) {
        try {
          await addHuman(id);
          addedHumans.push(id);
        } catch {
          // continue with the rest; addHuman has already logged.
        }
      }
      for (const id of selectedAgentIds) {
        try {
          await addAgent(id);
          addedAgents.push(id);
        } catch {
          // continue.
        }
      }
      if (addedHumans.length === 0 && addedAgents.length === 0) {
        throw new Error("None of the selected members could be added.");
      }
      onSubmitted({
        channelId: channel.id,
        channelName: channel.name,
        addedHumanIds: addedHumans,
        addedAgentIds: addedAgents,
      });
      onClose();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to add members.");
      // Funnel hook: dialog-driven `execute_fail`. We treat "all rows
      // failed" (the throw above) as a single funnel failure — per-row
      // failures are already swallowed silently.
      onSubmitError?.(err);
    } finally {
      setSubmitting(false);
    }
  }

  // Ensure the dialog reflects the latest channel membership before
  // computing candidate filters — without this, freshly-added members
  // from another tab would still appear as candidates.
  useEffect(() => {
    void loadMembers();
  }, [loadMembers]);

  return (
    <Modal onClose={onClose}>
      <div className="card-brutal w-full max-w-md p-6">
        <div className="mb-4 flex items-center justify-between">
          <h2 className="text-lg font-bold uppercase">Add Members</h2>
          <button onClick={onClose} className="btn-brutal-sm bg-white p-1" type="button">
            <X size={20} />
          </button>
        </div>

        <div className="mb-3 flex items-center gap-2 border-2 border-black/15 bg-brutal-cream p-2 text-sm">
          {channel?.type === "private" ? (
            <Lock size={14} className="shrink-0" />
          ) : (
            <Hash size={14} className="shrink-0" />
          )}
          <span className="font-bold">{channel?.name ?? "(unknown channel)"}</span>
          <span className="text-black/55">— target channel</span>
        </div>

        {draftHint ? (
          <div className="mb-3 border-l-2 border-black/20 pl-2 text-xs italic text-black/55">
            {draftHint}
          </div>
        ) : null}

        {error ? (
          <Banner intent="warning" className="mb-3 text-xs font-bold">
            {error}
          </Banner>
        ) : null}

        {nothingToAdd ? (
          <div className="mb-4 border-2 border-black/15 bg-white p-3 text-sm text-black/55">
            Everyone the agent suggested is already a member of this channel. Nothing to add.
          </div>
        ) : (
          <ChannelMemberListShell className="mb-4" data-testid="add-members-action-list">
            {candidateAgents.length > 0 ? (
              <section>
                <ChannelMemberSectionHeader>Agents</ChannelMemberSectionHeader>
                <ul>
                  {candidateAgents.map((a) => {
                    if (!selectedAgentIds.has(a.id)) return null;
                    return (
                      <li key={a.id}>
                        <ChannelMemberRow
                          type="agent"
                          agentId={a.id}
                          agentAvatarUrl={a.avatarUrl}
                          name={a.displayName ?? a.name}
                          secondary={a.description}
                          trailing={(
                            <ChannelMemberRemoveButton
                              label={`Remove ${a.displayName ?? a.name} from add list`}
                              onClick={() => toggleAgent(a.id)}
                            />
                          )}
                        />
                      </li>
                    );
                  })}
                </ul>
              </section>
            ) : null}

            {candidateHumans.length > 0 ? (
              <section>
                <ChannelMemberSectionHeader>Humans</ChannelMemberSectionHeader>
                <ul>
                  {candidateHumans.map((m) => {
                    if (!selectedHumanIds.has(m.userId)) return null;
                    return (
                      <li key={m.userId}>
                        <ChannelMemberRow
                          type="human"
                          humanAvatarUrl={m.avatarUrl}
                          gravatarHash={m.gravatarHash}
                          name={m.displayName ?? m.name}
                          secondary={m.description ?? (m.displayName && m.displayName !== m.name ? `@${m.name}` : null)}
                          trailing={(
                            <ChannelMemberRemoveButton
                              label={`Remove ${m.displayName ?? m.name} from add list`}
                              onClick={() => toggleHuman(m.userId)}
                            />
                          )}
                        />
                      </li>
                    );
                  })}
                </ul>
              </section>
            ) : null}
          </ChannelMemberListShell>
        )}

        <div className="flex justify-end gap-2">
          <button
            type="button"
            onClick={onClose}
            disabled={submitting}
            className="btn-brutal bg-white px-4 py-2 text-sm disabled:opacity-50 disabled:cursor-not-allowed"
          >
            Cancel
          </button>
          <button
            type="button"
            onClick={handleSubmit}
            disabled={!canSubmit}
            className="btn-brutal bg-brutal-pink px-4 py-2 text-sm disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {submitting
              ? "Adding…"
              : `Add ${selectedHumanIds.size + selectedAgentIds.size} member${
                  selectedHumanIds.size + selectedAgentIds.size === 1 ? "" : "s"
                }`}
          </button>
        </div>
      </div>
    </Modal>
  );
}
