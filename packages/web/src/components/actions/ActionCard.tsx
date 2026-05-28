// Action card — rendered inline as the body of a regular agent message
// row when the message's `actionMetadata.kind === "action-card"`. The
// agent prepared the form; the human admin clicks the action verb button
// to commit it under their own identity.
//
// Per stdrc 2026-05-10 #proj-approval msg=cb1aa609 + msg=7d662135: the
// card stays a *summary* — agent-prefilled fields shown as readonly
// labels, plus the action verb button. We deliberately do NOT inline the
// rest of the create-form on the card (overcrowds the message row); the
// dialog is the place to fill remaining fields. v1 simply fires the
// execute endpoint with the agent's prefilled action; v2 will open the
// existing modal dialog in prefilled mode if any required fields are
// still missing.

import { useRef, useState } from "react";
import { Check } from "lucide-react";
import type {
  ActionCardAction,
  ActionCardMetadata,
  ActionCardResult,
} from "@slock-ai/shared";
import { useAgentStore } from "../../store/agentStore";
import { useServerStore } from "../../store/serverStore";
import { useChannelStore } from "../../store/channelStore";
import { useMachineStore } from "../../store/machineStore";
import { Badge } from "../ui/Badge";
import Banner from "../ui/Banner";
import CreateAgentDialog from "../agent/CreateAgentDialog";
import CreateChannelDialog from "../channel/CreateChannelDialog";
import AddMembersDialog from "../channel/AddMembersDialog";
import api from "../../api/client";

// Product-funnel event types this component is allowed to emit. Mirrors the
// server-side `CLIENT_EVENT_TYPES` whitelist in routes/actions.ts. Server
// rejects anything else; DB check constraint is the second line of defense.
//
// Note: `action_card.execute_success` is intentionally NOT here — server-
// only per Dozy guardrail (#proj-permission:13b42cc0 msg=a1dbc464). Funnel
// "successes" must come from the server-authoritative path (executeActionCard
// or markActionCardExecuted) so a client can't manufacture them.
type ClientEventType =
  | "action_card.open"
  | "action_card.dismiss"
  | "action_card.execute_attempt"
  | "action_card.execute_fail";

type ActionCardErrorClass =
  | "validation"
  | "permission"
  | "not_found"
  | "conflict"
  | "network"
  | "unknown";

interface DismissMetadata {
  dismiss_reason?: "close_button" | "esc" | "backdrop" | "route_change";
}

// `OpenMetadata` and `AttemptMetadata` are intentionally empty: server
// derives `action_type` from the validated card row, so client-side
// hints would be ignored anyway.
type OpenMetadata = Record<string, never>;
type AttemptMetadata = Record<string, never>;

interface FailMetadata {
  error_class?: ActionCardErrorClass;
  error_code?: string;
  http_status?: number;
}

/**
 * Coarse client-side classifier mirroring server `classifyExecuteError`.
 * Used for `execute_fail` events emitted by the dialog-driven path. Only
 * returns categorical buckets — never raw caught text. Matches the
 * server's enum so SQL groups consistently across both emit paths.
 */
function classifyClientError(err: unknown): FailMetadata {
  const e = err as
    | { response?: { status?: number; data?: { error?: string; code?: string } }; code?: string; message?: string }
    | null;
  if (!e || typeof e !== "object") return { error_class: "unknown" };

  const status = e.response?.status;
  const code = e.response?.data?.code ?? (typeof e.code === "string" ? e.code : undefined);
  const out: FailMetadata = { error_class: "unknown" };
  if (typeof status === "number") out.http_status = status;
  if (typeof code === "string" && code.length > 0 && code.length <= 64) out.error_code = code;

  if (status === 400) out.error_class = "validation";
  else if (status === 401 || status === 403) out.error_class = "permission";
  else if (status === 404) out.error_class = "not_found";
  else if (status === 409) out.error_class = "conflict";
  else if (status === undefined && (e.code === "ERR_NETWORK" || /network/i.test(String(e.message ?? "")))) {
    out.error_class = "network";
  }
  return out;
}

interface Props {
  messageId: string;
  metadata: ActionCardMetadata;
  /** Channel of the carrier message (currently unused but reserved for
   *  per-action context lookups). */
  channelId: string;
}

export function ActionCard({ messageId, metadata, channelId }: Props) {
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [agentDialogOpen, setAgentDialogOpen] = useState(false);
  const [channelDialogOpen, setChannelDialogOpen] = useState(false);
  const [addMembersDialogOpen, setAddMembersDialogOpen] = useState(false);
  // Suppress `dismiss` emit when the dialog closes after a successful
  // submit. Dialogs call `onCreated`/`onSubmitted` then `onClose`; flagging
  // success in the success handler lets the close handler tell the
  // difference between "user closed" and "dialog auto-closed after submit".
  const submitSucceededRef = useRef(false);
  void channelId;

  // Render directly from the `metadata` prop. The server emits
  // `message:updated` from `markActionCardExecuted` (actionCardsService.ts),
  // MainLayout's socket handler dispatches `messageStore.updateMessage`, and
  // the merged `actionMetadata` flows back down here. A local
  // `useState(metadata)` mirror would freeze on first mount and then ignore
  // every subsequent prop change — the classic derived-state anti-pattern.
  const action = metadata.action;
  const isExecuted = metadata.state === "executed";

  // Best-effort: emit a product-funnel event for this card. Failures are
  // swallowed here just like on the server side — a wobbly funnel must
  // never block the underlying user action. The server validates the card
  // + access and re-derives `action_type` from the canonical card row, so
  // the metadata we pass here is intentionally minimal.
  function emitEvent(
    eventType: ClientEventType,
    payload?: OpenMetadata | DismissMetadata | AttemptMetadata | FailMetadata,
  ): void {
    api
      .post(`/actions/${messageId}/event`, {
        eventType,
        metadata: payload ?? {},
      })
      .catch((err) => {
        // Silent: the funnel is best-effort.
        console.debug("[actionCard] event emit failed:", eventType, err);
      });
  }

  // Unified click flow per stdrc 2026-05-10 #proj-approval msg=23709dea +
  // msg=40cb9342: every action card opens the corresponding regular create
  // dialog with prefilled values (editable). Dialog submit runs the
  // standard user-facing API; `onCreated` fires; we POST mark-executed so
  // the card flips to Done. No "fully-prefilled one-click" path — UX is
  // uniform across all action types.
  function handleClick() {
    setError(null);
    submitSucceededRef.current = false;
    // Funnel hook: human opened the dialog. Emit before opening so a stuck
    // dialog doesn't lose the signal. Best-effort; swallowed on failure.
    // No metadata — server derives `action_type` from the card row.
    emitEvent("action_card.open", {});
    switch (action.type) {
      case "channel:create":
        setChannelDialogOpen(true);
        return;
      case "agent:create":
        setAgentDialogOpen(true);
        return;
      case "channel:add_member":
        setAddMembersDialogOpen(true);
        return;
    }
  }

  // Funnel hook: dialog closed without a successful submit. The
  // `submitSucceededRef` flag is set in onCreated/onSubmitted handlers
  // before the dialog calls onClose, so we can distinguish "user dismissed"
  // from "dialog auto-closed after success". v1 doesn't distinguish
  // close-button / ESC / backdrop on the FE — all collapse to a single
  // dismiss without a `dismiss_reason`. Adding that resolution is a
  // follow-up.
  function handleDialogClose(closeFn: () => void) {
    return () => {
      if (!submitSucceededRef.current) {
        // No metadata — server derives `action_type` from the card row.
        // dismiss_reason omitted in v1 (FE doesn't distinguish X / ESC /
        // backdrop yet). Adding that resolution is a follow-up.
        emitEvent("action_card.dismiss", {});
      }
      submitSucceededRef.current = false;
      closeFn();
    };
  }

  // Funnel hooks for the dialog-driven submit lifecycle. The dialogs run
  // their own create API and may fail before mark-executed is reached,
  // which the server can't observe. We emit:
  //   - `execute_attempt` when the dialog actually starts the create call
  //     (after client-side validation passed).
  //   - `execute_fail` when the dialog's create API throws. The dialog
  //     stays open for retry; on a successful retry, the corresponding
  //     `execute_success` will arrive server-side via mark-executed.
  // Per Dozy guardrail msg=a1dbc464: client may NOT emit `execute_success`.
  function handleSubmitStart() {
    emitEvent("action_card.execute_attempt", {});
  }

  function handleSubmitError(err: unknown) {
    emitEvent("action_card.execute_fail", classifyClientError(err));
  }

  async function markExecuted(result: ActionCardResult) {
    try {
      await api.post<{ messageId: string; metadata: ActionCardMetadata }>(
        `/actions/${messageId}/mark-executed`,
        { result },
      );
      // The server emits `message:updated` synchronously from
      // markActionCardExecuted; messageStore.updateMessage on the socket
      // handler will flow the new actionMetadata back down via props.
    } catch (err) {
      // Don't surface mark-executed failure — the resource is already
      // created. Worst case the card stays "prepared" until refresh.
      console.error("Failed to mark action card executed:", err);
      // Funnel hook: dialog-driven `execute_fail` for the mark-executed leg.
      // The create dialog already emitted `execute_attempt` via
      // `handleSubmitStart`; if mark-executed sync fails the submit's funnel
      // outcome would otherwise stop at `execute_attempt` with no terminal
      // event. Per Leiysky/Dozy/meichen review 2026-05-13 (msg=5cb29566 /
      // msg=e2d25035 / DM e270834b): emit `execute_fail` here too, reusing
      // the same client classifier. `execute_success` stays server-only —
      // when mark-executed succeeds the server emits it via the canonical
      // `markActionCardExecuted` path, so this client branch only needs the
      // failure leg.
      handleSubmitError(err);
    }
  }

  function handleAgentCreated(agent: { id: string; name: string }) {
    submitSucceededRef.current = true;
    void markExecuted({ kind: "agent", id: agent.id, name: agent.name });
  }

  function handleChannelCreated(channel: { id: string; name: string }) {
    submitSucceededRef.current = true;
    void markExecuted({ kind: "channel", id: channel.id, name: channel.name });
  }

  function handleMembersAdded(result: {
    channelId: string;
    channelName: string;
    addedHumanIds: string[];
    addedAgentIds: string[];
  }) {
    submitSucceededRef.current = true;
    void markExecuted({
      kind: "channel-members",
      channelId: result.channelId,
      channelName: result.channelName,
      addedHumanIds: result.addedHumanIds,
      addedAgentIds: result.addedAgentIds,
    });
  }

  return (
    <div className="action-card relative mt-1 flex w-full items-start gap-3 border-2 border-black/30 bg-white p-3 text-left">
      <div className="min-w-0 flex-1">
        {/* Bold action title with optional Done pill on the right. */}
        <div className="flex flex-wrap items-center gap-2 text-sm font-bold leading-snug">
          <ActionTitleLine action={action} />
          {isExecuted ? (
            <Badge tone="lime" className="ml-auto">
              <Check size={10} className="shrink-0" />
              <span className="shrink-0">Done</span>
            </Badge>
          ) : null}
        </div>

        {/* Compact readonly summary of agent-prefilled fields. */}
        <div className="mt-1 text-xs text-black/55">
          <ActionDetail action={action} />
        </div>

        {action.draftHint ? (
          <div className="mt-1 border-l-2 border-black/20 pl-2 text-xs italic text-black/55">
            {action.draftHint}
          </div>
        ) : null}

        {isExecuted && metadata.executedByUserName ? (
          <div className="mt-1 text-xs text-black/55">
            Committed by{" "}
            <span className="font-bold text-black/70">{metadata.executedByUserName}</span>
            {metadata.result ? (
              <>
                {" "}
                <ResultLink result={metadata.result} />
              </>
            ) : null}
          </div>
        ) : null}

        {error ? (
          <Banner intent="warning" density="sm" className="mt-1">{error}</Banner>
        ) : null}

        {!isExecuted ? (
          <div className="mt-2 flex flex-wrap items-center gap-3">
            <button
              type="button"
              className="btn-brutal bg-brutal-pink px-3 py-1.5 text-xs disabled:opacity-50 disabled:cursor-not-allowed"
              disabled={busy}
              onClick={handleClick}
            >
              {busy ? "…" : actionVerb(action)}
            </button>
          </div>
        ) : null}
      </div>

      {action.type === "agent:create" && agentDialogOpen ? (
        <CreateAgentDialog
          onClose={handleDialogClose(() => setAgentDialogOpen(false))}
          prefilledName={action.name}
          prefilledDescription={action.description}
          prefilledMachineId={action.requiredComputer ?? action.suggestedComputer}
          prefilledMachineMode={action.requiredComputer ? "required" : action.suggestedComputer ? "preferred" : undefined}
          onCreated={handleAgentCreated}
          onSubmitStart={handleSubmitStart}
          onSubmitError={handleSubmitError}
          fromActionCard
        />
      ) : null}

      {action.type === "channel:create" && channelDialogOpen ? (
        <CreateChannelDialog
          onClose={handleDialogClose(() => setChannelDialogOpen(false))}
          prefilledName={action.name}
          prefilledDescription={action.description}
          prefilledVisibility={action.visibility}
          prefilledHumanIds={action.initialHumans}
          prefilledAgentIds={action.initialAgents}
          onCreated={handleChannelCreated}
          onSubmitStart={handleSubmitStart}
          onSubmitError={handleSubmitError}
        />
      ) : null}

      {action.type === "channel:add_member" && addMembersDialogOpen ? (
        <AddMembersDialog
          channelId={action.channel}
          prefilledHumanIds={action.humans}
          prefilledAgentIds={action.agents}
          draftHint={action.draftHint}
          onClose={handleDialogClose(() => setAddMembersDialogOpen(false))}
          onSubmitted={handleMembersAdded}
          onSubmitStart={handleSubmitStart}
          onSubmitError={handleSubmitError}
        />
      ) : null}
    </div>
  );
}

function actionVerb(action: ActionCardAction): string {
  switch (action.type) {
    case "channel:create":
      return "Create Channel";
    case "agent:create":
      return "Create Agent";
    case "channel:add_member":
      return "Add Members";
  }
}

function ActionTitleLine({ action }: { action: ActionCardAction }) {
  const channels = useChannelStore((s) => s.channels);
  const dmChannels = useChannelStore((s) => s.dmChannels);
  const members = useServerStore((s) => s.members);
  const agents = useAgentStore((s) => s.agents);

  switch (action.type) {
    case "channel:create": {
      const vis = action.visibility === "private" ? "private" : "public";
      return (
        <>
          Create {vis} channel <span>#{action.name}</span>
        </>
      );
    }
    case "agent:create":
      return (
        <>
          Create Agent <span>@{action.name}</span>
        </>
      );
    case "channel:add_member": {
      const channel = channels.find((c) => c.id === action.channel);
      const targetLabel = channel?.name ? `#${channel.name}` : "channel";
      const count = (action.humans?.length ?? 0) + (action.agents?.length ?? 0);
      return (
        <>
          Add {count} member{count === 1 ? "" : "s"} to <span>{targetLabel}</span>
        </>
      );
    }
  }

  void dmChannels;
  void members;
  void agents;
}

function ActionDetail({ action }: { action: ActionCardAction }) {
  const channels = useChannelStore((s) => s.channels);
  const members = useServerStore((s) => s.members);
  const agents = useAgentStore((s) => s.agents);
  const machines = useMachineStore((s) => s.machines);

  switch (action.type) {
    case "channel:create": {
      const humans = (action.initialHumans ?? [])
        .map((id) => members.find((m) => m.userId === id)?.displayName ?? members.find((m) => m.userId === id)?.name ?? id.slice(0, 8))
        .filter(Boolean);
      const initialAgents = (action.initialAgents ?? [])
        .map((id) => agents.find((a) => a.id === id)?.displayName ?? agents.find((a) => a.id === id)?.name ?? id.slice(0, 8));
      return (
        <div className="space-y-0.5">
          {action.description ? (
            <div>
              <span className="text-black/45">Description:</span>{" "}
              <span className="text-black/75">{action.description}</span>
            </div>
          ) : null}
          {humans.length > 0 ? (
            <div>
              <span className="text-black/45">Humans:</span>{" "}
              <span className="text-black/75">{humans.join(", ")}</span>
            </div>
          ) : null}
          {initialAgents.length > 0 ? (
            <div>
              <span className="text-black/45">Agents:</span>{" "}
              <span className="text-black/75">{initialAgents.join(", ")}</span>
            </div>
          ) : null}
        </div>
      );
    }
    case "agent:create": {
      const targetComputer = action.requiredComputer ?? action.suggestedComputer;
      const targetMachine = targetComputer
        ? machines.find((machine) => machine.id === targetComputer)
        : undefined;
      return (
        <div className="space-y-0.5">
          {action.description ? (
            <div>
              <span className="text-black/45">Description:</span>{" "}
              <span className="text-black/75">{action.description}</span>
            </div>
          ) : (
            <div className="text-black/45">No description prefilled.</div>
          )}
          {targetComputer ? (
            <div>
              <span className="text-black/45">
                {action.requiredComputer ? "Required computer:" : "Suggested computer:"}
              </span>{" "}
              <span className="text-black/75">
                {targetMachine?.name ?? targetComputer.slice(0, 8)}
              </span>
            </div>
          ) : null}
        </div>
      );
    }
    case "channel:add_member": {
      const channel = channels.find((c) => c.id === action.channel);
      const humans = (action.humans ?? [])
        .map((id) => members.find((m) => m.userId === id)?.displayName ?? members.find((m) => m.userId === id)?.name ?? id.slice(0, 8))
        .filter(Boolean);
      const addAgents = (action.agents ?? [])
        .map((id) => agents.find((a) => a.id === id)?.displayName ?? agents.find((a) => a.id === id)?.name ?? id.slice(0, 8));
      return (
        <div className="space-y-0.5">
          {channel?.name ? (
            <div>
              <span className="text-black/45">Channel:</span>{" "}
              <span className="text-black/75">#{channel.name}</span>
            </div>
          ) : null}
          {humans.length > 0 ? (
            <div>
              <span className="text-black/45">Humans:</span>{" "}
              <span className="text-black/75">{humans.join(", ")}</span>
            </div>
          ) : null}
          {addAgents.length > 0 ? (
            <div>
              <span className="text-black/45">Agents:</span>{" "}
              <span className="text-black/75">{addAgents.join(", ")}</span>
            </div>
          ) : null}
        </div>
      );
    }
  }
}

function ResultLink({ result }: { result: ActionCardResult }) {
  switch (result.kind) {
    case "channel":
      return <span className="font-bold text-black/70">→ #{result.name}</span>;
    case "agent":
      return <span className="font-bold text-black/70">→ @{result.name}</span>;
    case "channel-members": {
      const total = result.addedHumanIds.length + result.addedAgentIds.length;
      return (
        <span className="font-bold text-black/70">
          → {total} added to #{result.channelName}
        </span>
      );
    }
  }
}
