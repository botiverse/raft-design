// Operation cards (B-mode approval replacement).
//
// `prepareActionCard` is called by an agent: it posts a system message in
// the target channel whose `actionMetadata.kind === "action-card"` carries
// the prepared action. The card is the entire body of that message (no extra
// text content rendered). Anyone with read access to the channel can see the
// card; only humans with the relevant authority for that action can click
// "execute" via `executeActionCard`.
//
// `executeActionCard` is called by a logged-in human. It atomically:
//   1. Reads the message + parses metadata
//   2. Verifies the caller is allowed to perform the underlying action
//   3. Performs the action under the *user's* identity (not the agent's)
//   4. Mutates `actionMetadata.state` to `executed` with a result reference
//   5. Broadcasts the updated message via Socket.io
//
// Idempotency: if state is already `executed`, the call is a no-op and
// returns the existing record (so a stale double-click doesn't re-create).

import type { Server as SocketServer } from "socket.io";
import { and, eq, sql } from "drizzle-orm";
import {
  actionCardActionSchema,
  extractHandleName,
  looksLikeUuid,
  validateActionCardAction,

  type ActionCardAction,
  type ActionCardMetadata,
  type ActionCardState,
  type ActionCardResult,
} from "@slock-ai/shared";
import { getDb } from "../db/index.js";
import { actionCards, agents, messages } from "../db/schema.js";
import * as channelService from "./channelService.js";
import * as agentService from "./agentService.js";
import * as serverService from "./serverService.js";
import * as machineService from "./machineService.js";
import * as messageService from "./messageService.js";
import * as productEventsService from "./productEventsService.js";
import type { AgentOrchestrator } from "./agentOrchestrator.js";

export class ActionCardError extends Error {
  status: number;
  code: string;
  constructor(status: number, code: string, message: string) {
    super(message);
    this.status = status;
    this.code = code;
  }
}

export interface PrepareActionCardArgs {
  serverId: string;
  requesterAgentId: string;
  /** Resolved channel id where the card is posted (already validated by route). */
  targetChannelId: string;
  action: ActionCardAction;
  io?: SocketServer | null;
}

/**
 * Resolve a single human reference (UUID-or-handle) to a userId scoped to
 * this server. UUID-looking inputs still must resolve through server
 * membership; otherwise action cards would bypass the handle path's
 * server boundary.
 */
async function resolveHumanRef(
  serverId: string,
  ref: string,
  fieldPath: string,
): Promise<string> {
  if (looksLikeUuid(ref)) {
    const isMember = await serverService.isMember(serverId, ref);
    if (!isMember) {
      throw new ActionCardError(
        422,
        "INVALID_HANDLE",
        `${fieldPath}: human is not a member of this server`,
      );
    }
    return ref;
  }
  const handle = extractHandleName(ref, "@");
  const userId = await channelService.resolveUserByName(serverId, handle);
  if (!userId) {
    throw new ActionCardError(
      422,
      "INVALID_HANDLE",
      `${fieldPath}: no human named "${handle}" in this server`,
    );
  }
  return userId;
}

/**
 * Resolve a single agent reference (UUID-or-handle) to an agentId scoped to
 * this server. Mirror of `resolveHumanRef` but routed through agent lookup.
 */
async function resolveAgentRef(
  serverId: string,
  ref: string,
  fieldPath: string,
): Promise<string> {
  if (looksLikeUuid(ref)) {
    const agent = await agentService.getAgent(ref);
    if (!agent || agent.serverId !== serverId) {
      throw new ActionCardError(
        422,
        "INVALID_HANDLE",
        `${fieldPath}: agent is not in this server`,
      );
    }
    return ref;
  }
  const handle = extractHandleName(ref, "@");
  const agentId = await channelService.resolveAgentByName(serverId, handle);
  if (!agentId) {
    throw new ActionCardError(
      422,
      "INVALID_HANDLE",
      `${fieldPath}: no agent named "${handle}" in this server`,
    );
  }
  return agentId;
}

/**
 * Resolve a channel reference (UUID-or-handle) to a channelId. Reuses
 * `resolveChannelByName` which already understands `#channel` / `dm:@peer`
 * forms and enforces private-channel visibility.
 */
async function resolveChannelRef(
  serverId: string,
  requesterAgentId: string,
  ref: string,
  fieldPath: string,
): Promise<string> {
  if (looksLikeUuid(ref)) {
    const channel = await channelService.getChannel(ref);
    const canAccess = channel?.serverId === serverId
      ? await channelService.canAgentAccessChannel(ref, requesterAgentId)
      : false;
    if (!channel || channel.serverId !== serverId || !canAccess) {
      throw new ActionCardError(
        422,
        "INVALID_HANDLE",
        `${fieldPath}: channel is not visible to this agent in this server`,
      );
    }
    return ref;
  }
  const normalized = ref.trim().startsWith("#") ? ref.trim() : `#${ref.trim()}`;
  const resolved = await channelService.resolveChannelByName(
    serverId,
    requesterAgentId,
    normalized,
  );
  if (!resolved) {
    throw new ActionCardError(
      422,
      "INVALID_HANDLE",
      `${fieldPath}: no channel named "${normalized}" visible to this agent`,
    );
  }
  return resolved.channelId;
}

/**
 * Resolve a computer reference to a machineId scoped to this server.
 * UUID-looking inputs still must belong to the server. Non-UUID inputs match
 * computer name exactly; ambiguous names fail closed so the card cannot
 * silently target the wrong machine.
 */
async function resolveComputerRef(
  serverId: string,
  ref: string,
  fieldPath: string,
): Promise<string> {
  if (looksLikeUuid(ref)) {
    const machine = await machineService.getMachine(ref);
    if (!machine || machine.serverId !== serverId) {
      throw new ActionCardError(
        422,
        "INVALID_HANDLE",
        `${fieldPath}: computer is not in this server`,
      );
    }
    return ref;
  }
  const handle = ref.trim();
  const matches = (await machineService.listMachines(serverId))
    .filter((machine) => machine.name === handle);
  if (matches.length === 0) {
    throw new ActionCardError(
      422,
      "INVALID_HANDLE",
      `${fieldPath}: no computer named "${handle}" in this server`,
    );
  }
  if (matches.length > 1) {
    throw new ActionCardError(
      422,
      "AMBIGUOUS_HANDLE",
      `${fieldPath}: more than one computer named "${handle}" in this server`,
    );
  }
  return matches[0].id;
}

/**
 * Walks an `ActionCardAction` payload and resolves every UUID-or-handle
 * field by principal type. Returns a new action object with all references
 * as UUIDs; callers persist this UUID-only form so card render / dialog /
 * execute paths never need a second resolution step. Per stdrc / xxchan
 * #engineering msg=f629320c (2026-05-11): agents only see handles; UUID
 * resolution happens server-side at prepare time.
 *
 * Cross-type pollution is rejected by construction: each field type uses
 * its own resolver and only its own resolver, so a handle dropped into the
 * wrong array (e.g. an agent handle in `initialHumans`) surfaces as
 * INVALID_HANDLE rather than silently matching the wrong principal.
 */
async function resolveActionHandles(
  serverId: string,
  requesterAgentId: string,
  action: ActionCardAction,
): Promise<ActionCardAction> {
  switch (action.type) {
    case "channel:create": {
      const resolvedInitialHumans = action.initialHumans
        ? await Promise.all(
            action.initialHumans.map((ref, i) =>
              resolveHumanRef(serverId, ref, `initialHumans[${i}]`),
            ),
          )
        : undefined;
      const resolvedInitialAgents = action.initialAgents
        ? await Promise.all(
            action.initialAgents.map((ref, i) =>
              resolveAgentRef(serverId, ref, `initialAgents[${i}]`),
            ),
          )
        : undefined;
      return {
        ...action,
        ...(resolvedInitialHumans ? { initialHumans: resolvedInitialHumans } : {}),
        ...(resolvedInitialAgents ? { initialAgents: resolvedInitialAgents } : {}),
      };
    }
    case "agent:create": {
      const suggestedComputer = action.suggestedComputer
        ? await resolveComputerRef(serverId, action.suggestedComputer, "suggestedComputer")
        : undefined;
      const requiredComputer = action.requiredComputer
        ? await resolveComputerRef(serverId, action.requiredComputer, "requiredComputer")
        : undefined;
      return {
        ...action,
        ...(suggestedComputer ? { suggestedComputer } : {}),
        ...(requiredComputer ? { requiredComputer } : {}),
      };
    }
    case "channel:add_member": {
      const channel = await resolveChannelRef(
        serverId,
        requesterAgentId,
        action.channel,
        "channel",
      );
      const humans = action.humans
        ? await Promise.all(
            action.humans.map((ref, i) =>
              resolveHumanRef(serverId, ref, `humans[${i}]`),
            ),
          )
        : undefined;
      const agents = action.agents
        ? await Promise.all(
            action.agents.map((ref, i) =>
              resolveAgentRef(serverId, ref, `agents[${i}]`),
            ),
          )
        : undefined;
      return {
        ...action,
        channel,
        ...(humans ? { humans } : {}),
        ...(agents ? { agents } : {}),
      };
    }
  }
}

export async function prepareActionCard(args: PrepareActionCardArgs): Promise<{
  messageId: string;
  metadata: ActionCardMetadata;
}> {
  const parsed = actionCardActionSchema.safeParse(args.action);
  if (!parsed.success) {
    throw new ActionCardError(400, "INVALID_PAYLOAD", parsed.error.message);
  }
  const crossFieldError = validateActionCardAction(parsed.data as ActionCardAction);
  if (crossFieldError) {
    throw new ActionCardError(400, "INVALID_PAYLOAD", crossFieldError);
  }
  const action = await resolveActionHandles(
    args.serverId,
    args.requesterAgentId,
    parsed.data as ActionCardAction,
  );

  // Verify the requesting agent belongs to this server.
  const agent = await agentService.getAgent(args.requesterAgentId);
  if (!agent || agent.serverId !== args.serverId) {
    throw new ActionCardError(404, "AGENT_NOT_FOUND", "Requester agent not found in this server");
  }

  // Verify the target channel exists in this server.
  const target = await channelService.getChannel(args.targetChannelId);
  if (!target || target.serverId !== args.serverId) {
    throw new ActionCardError(404, "TARGET_NOT_FOUND", "Target channel not found in this server");
  }
  if (!await channelService.canAgentPostToChannel(args.targetChannelId, args.requesterAgentId)) {
    throw new ActionCardError(403, "TARGET_NOT_ACCESSIBLE", "Requester agent cannot post to this target");
  }

  const metadata: ActionCardMetadata = {
    kind: "action-card",
    action,
    state: "prepared",
    executedAt: null,
    executedByUserId: null,
    executedByUserName: null,
    result: null,
  };

  // Carrier message renders as a regular agent chat row (per stdrc
  // #proj-approval msg=45ca8c31). The card itself is the message body —
  // MessageItem branches on `actionMetadata.kind === "action-card"` and
  // renders the structured card from the metadata. We dual-write to the
  // `action_cards` table for queryability + audit (per stdrc msg=22a82192
  // / msg=174b7e16 — DB persistence, minimum schema).
  const db = getDb();
  const out = await db.transaction(async (tx) => {
    const [msg] = await tx
      .insert(messages)
      .values({
        channelId: args.targetChannelId,
        senderType: "agent",
        senderId: args.requesterAgentId,
        content: "",
        messageType: "chat",
        actionMetadata: metadata,
      })
      .returning();
    await tx
      .insert(actionCards)
      .values({
        serverId: args.serverId,
        messageId: msg.id,
        requesterAgentId: args.requesterAgentId,
        actionType: action.type,
        payload: action,
        state: "prepared",
      });
    return msg;
  });

  messageService.updateMaxSeq(args.serverId, out.seq);

  if (args.io && out) {
    const senderName = agent.displayName ?? agent.name;
    const payload = { ...out, senderName };
    if (target.type === "thread") {
      const followerIds = await messageService.getHumanThreadFollowerIds(args.targetChannelId);
      for (const userId of followerIds) {
        args.io.in(`user:${userId}`).in(`server:${target.serverId}`).socketsJoin(`channel:${args.targetChannelId}`);
        args.io.to(`user:${userId}`).emit("message:new", payload);
      }
    } else {
      args.io.to(`channel:${args.targetChannelId}`).emit("message:new", payload);
    }
  }

  return { messageId: out.id, metadata };
}

export interface ExecuteActionCardArgs {
  messageId: string;
  serverId: string;
  userId: string;
  expectedState?: ActionCardState;
  io?: SocketServer | null;
}

interface ExecutePreflight {
  /** action_cards.id — canonical product entity id, used as subject_id. */
  cardId: string;
  actionType: ActionCardAction["type"];
  state: ActionCardState;
}

/**
 * Validate that `args.messageId` is a real action card the caller can
 * access in this server, and resolve the canonical `action_cards.id`. Used
 * as a gate before emitting `execute_attempt` / `execute_fail` so random
 * UUID probes can't pollute the product funnel with orphan rows
 * (Leiysky/Dozy review 2026-05-13 #proj-permission:13b42cc0
 * msg=086dc014 / msg=9d0f10bd; subject grain per Dozy + meichen
 * msg=174ba78c).
 *
 * Throws `ActionCardError` on any validation failure. Does NOT emit any
 * funnel event — callers handle the emit ordering relative to this.
 */
async function preflightExecuteActionCard(
  args: ExecuteActionCardArgs,
  db: ReturnType<typeof getDb>,
): Promise<ExecutePreflight> {
  const [row] = await db.select().from(messages).where(eq(messages.id, args.messageId));
  if (!row) {
    throw new ActionCardError(404, "NOT_FOUND", "Card message not found");
  }
  const meta = (row.actionMetadata ?? null) as Partial<ActionCardMetadata> | null;
  if (!meta || meta.kind !== "action-card") {
    throw new ActionCardError(400, "NOT_OPERATION_CARD", "Message is not an operation card");
  }
  const channel = await channelService.getChannel(row.channelId);
  if (!channel || channel.serverId !== args.serverId) {
    throw new ActionCardError(403, "WRONG_SERVER", "Card not in this server");
  }
  // Per-channel access gate. Same-server membership alone is not enough —
  // for private channels the caller must actually have read access. Mirrors
  // `/event` route. Without this, a same-server user who knows / guesses a
  // private-channel card's message id could pollute the funnel and even
  // mutate card state via mark-executed (Leiysky/Dozy/meichen review
  // 2026-05-13: msg=5cb29566 / msg=e2d25035 / DM e270834b).
  const allowed = await channelService.canUserAccessChannel(
    row.channelId,
    args.userId,
    args.serverId,
  );
  if (!allowed) {
    throw new ActionCardError(403, "FORBIDDEN", "Not allowed to access this card's channel");
  }
  const action = (meta.action ?? null) as ActionCardAction | null;
  if (!action) {
    throw new ActionCardError(400, "MALFORMED_ACTION", "Card metadata missing action");
  }
  const [cardRow] = await db
    .select({ id: actionCards.id })
    .from(actionCards)
    .where(eq(actionCards.messageId, args.messageId));
  if (!cardRow) {
    throw new ActionCardError(404, "NOT_FOUND", "Action card row not found");
  }
  return {
    cardId: cardRow.id,
    actionType: action.type,
    state: meta.state ?? "prepared",
  };
}

async function assertActionCardVisibleToUser(args: {
  messageId: string;
  serverId: string;
  userId: string;
}): Promise<void> {
  const db = getDb();
  const [row] = await db.select({ channelId: messages.channelId }).from(messages).where(eq(messages.id, args.messageId));
  if (!row) {
    throw new ActionCardError(404, "NOT_FOUND", "Card message not found");
  }
  const channel = await channelService.getChannel(row.channelId);
  if (!channel || channel.serverId !== args.serverId) {
    throw new ActionCardError(404, "NOT_FOUND", "Card message not found");
  }
  const canAccess = await channelService.canUserAccessChannel(row.channelId, args.userId, args.serverId);
  if (!canAccess) {
    throw new ActionCardError(404, "NOT_FOUND", "Card message not found");
  }
}

export async function executeActionCard(args: ExecuteActionCardArgs): Promise<{
  messageId: string;
  metadata: ActionCardMetadata;
}> {
  await assertActionCardVisibleToUser(args);
  const db = getDb();

  // Preflight: validate this is a real action card the caller can access.
  // Validation failures (404 / 400 / 403) are NOT recorded in the funnel —
  // those are pre-funnel signals (route abuse, stale clients) and belong
  // in security/API metrics, not in `product_events`.
  const preflight = await preflightExecuteActionCard(args, db);

  // Idempotent stale double-click: state already executed. Inner method
  // will return the existing record as a no-op. Don't emit any funnel
  // event — it's not a new attempt.
  if (preflight.state === "executed") {
    return await executeActionCardInner(args, db, preflight);
  }

  // Funnel hook: record the attempt now that we've proven this is a real
  // card. Best-effort; failures swallowed inside the helper.
  await productEventsService.recordActionCardEvent({
    cardId: preflight.cardId,
    eventType: "action_card.execute_attempt",
    actor: { type: "human", id: args.userId },
    source: "server",
    metadata: { action_type: preflight.actionType },
  });

  try {
    return await executeActionCardInner(args, db, preflight);
  } catch (err) {
    // Funnel hook: classify + record failure with low-cardinality bucket.
    // `action_type` is derived from the validated card metadata (server-
    // side source of truth), not from anything client-supplied.
    await productEventsService.recordActionCardEvent({
      cardId: preflight.cardId,
      eventType: "action_card.execute_fail",
      actor: { type: "human", id: args.userId },
      source: "server",
      metadata: {
        action_type: preflight.actionType,
        ...productEventsService.classifyExecuteError(err),
      },
    });
    throw err;
  }
}

async function executeActionCardInner(
  args: ExecuteActionCardArgs,
  db: ReturnType<typeof getDb>,
  preflight: ExecutePreflight,
): Promise<{ messageId: string; metadata: ActionCardMetadata }> {
  // Atomic read + transition: re-read inside the transaction so two
  // simultaneous clicks don't both succeed.
  const result = await db.transaction(async (tx) => {
    const [row] = await tx.select().from(messages).where(eq(messages.id, args.messageId));
    if (!row) {
      throw new ActionCardError(404, "NOT_FOUND", "Card message not found");
    }
    const meta = (row.actionMetadata ?? null) as Partial<ActionCardMetadata> | null;
    if (!meta || meta.kind !== "action-card") {
      throw new ActionCardError(400, "NOT_OPERATION_CARD", "Message is not an operation card");
    }
    if (args.expectedState && meta.state !== args.expectedState) {
      throw new ActionCardError(409, "STATE_MISMATCH", `Card is ${meta.state}, expected ${args.expectedState}`);
    }
    if (meta.state === "executed") {
      // Idempotency: same shape, no re-execute.
      return { row, metadata: meta as ActionCardMetadata, executed: false };
    }
    if (meta.state !== "prepared") {
      throw new ActionCardError(409, "BAD_STATE", `Card is ${meta.state}; cannot execute`);
    }

    // Authorize + execute under user identity. v1 has no field-level
    // overrides (agent:create's runtime/model/computer moved to the
    // dialog flow; channel actions are fully prefilled by the agent).
    const baseAction = (meta.action ?? null) as ActionCardAction | null;
    if (!baseAction) {
      throw new ActionCardError(400, "MALFORMED_ACTION", "Card metadata missing action");
    }
    const reparsed = actionCardActionSchema.safeParse(baseAction);
    if (!reparsed.success) {
      throw new ActionCardError(400, "INVALID_PAYLOAD", reparsed.error.message);
    }
    const finalAction = reparsed.data as ActionCardAction;
    const executionResult = await performAction(args.serverId, args.userId, finalAction, args.io ?? null);

    // Mutate metadata in-place to executed. We persist the *merged* action
    // so the audit trail reflects what was actually committed (not just
    // what the agent originally prepared).
    const userName = await loadUserDisplayName(args.userId);
    const nextMeta: ActionCardMetadata = {
      kind: "action-card",
      action: finalAction,
      state: "executed",
      executedAt: new Date().toISOString(),
      executedByUserId: args.userId,
      executedByUserName: userName,
      result: executionResult,
    };
    // Update both the canonical action_cards row and the message metadata
    // cache atomically. Card row is the source of truth for state +
    // executor + result; metadata cache is what MessageItem reads at render
    // time.
    await tx
      .update(actionCards)
      .set({
        payload: finalAction,
        state: "executed",
        executedAt: new Date(),
        executedByUserId: args.userId,
        result: executionResult as unknown as object,
        updatedAt: new Date(),
      })
      .where(eq(actionCards.messageId, args.messageId));
    const [updated] = await tx
      .update(messages)
      .set({ actionMetadata: nextMeta, updatedAt: new Date() })
      .where(eq(messages.id, args.messageId))
      .returning();
    return { row: updated, metadata: nextMeta, executed: true };
  });

  if (args.io && result.executed && result.row) {
    args.io
      .to(`channel:${result.row.channelId}`)
      .emit("message:updated", { ...result.row, senderName: "System" });
  }

  // Funnel hook: record success. Skip if `executed=false` (idempotent
  // re-call where the card was already executed) — that's not a new
  // success in product terms. `action_type` is derived from the
  // server-validated preflight, not from anything client-supplied.
  if (result.executed) {
    await productEventsService.recordActionCardEvent({
      cardId: preflight.cardId,
      eventType: "action_card.execute_success",
      actor: { type: "human", id: args.userId },
      source: "server",
      metadata: {
        action_type: preflight.actionType,
      },
    });
  }

  return { messageId: args.messageId, metadata: result.metadata };
}

// `mergeOverrides` removed — overrides were only relevant for agent:create's
// inline runtime/model/machineId dropdowns, which moved to the create
// dialog flow. v1 has no other action types that take overrides; revisit if
// new shapes need partial human edits at commit time.

export interface MarkExecutedArgs {
  messageId: string;
  serverId: string;
  userId: string;
  /**
   * Result reference produced by the user-facing API the dialog called.
   * For agent:create this comes from the post-dialog createAgent response.
   */
  result: ActionCardResult;
  io?: SocketServer | null;
  /**
   * Agent orchestrator — used to push a wake to the requesting agent so it
   * knows the action card was committed and what resource resulted (per
   * stdrc 2026-05-10 #proj-approval msg=9081c5f5: "Agent 应该收到一个推送
   * ... 这个推送里得包含最终实际创建的那个东西的一些信息").
   */
  orchestrator?: AgentOrchestrator | null;
}

function expectedResultKindForAction(action: ActionCardAction): ActionCardResult["kind"] {
  switch (action.type) {
    case "channel:create":
      return "channel";
    case "agent:create":
      return "agent";
    case "channel:add_member":
      return "channel-members";
  }
}

function assertActionResultKindMatches(action: ActionCardAction, result: ActionCardResult): void {
  const expectedKind = expectedResultKindForAction(action);
  if (result.kind !== expectedKind) {
    throw new ActionCardError(
      400,
      "ACTION_RESULT_KIND_MISMATCH",
      `${action.type} action cards must be marked executed with a ${expectedKind} result`,
    );
  }
}

/**
 * Mark an action card as executed without performing the underlying action
 * — used by the dialog-driven flow (agent:create). The frontend opens the
 * regular CreateAgentDialog with prefilled name/description, the user picks
 * computer/runtime/model and clicks Create, the existing createAgent API
 * runs, and then the frontend calls this endpoint to mark the card consumed
 * + record the result reference (so the card flips to Done with a
 * "→ @scout" link).
 *
 * Idempotent: if state is already executed, returns the existing record.
 */
export async function markActionCardExecuted(args: MarkExecutedArgs): Promise<{
  messageId: string;
  metadata: ActionCardMetadata;
}> {
  await assertActionCardVisibleToUser(args);
  const db = getDb();
  const userName = await loadUserDisplayName(args.userId);
  const result = await db.transaction(async (tx) => {
    const [row] = await tx.select().from(messages).where(eq(messages.id, args.messageId));
    if (!row) {
      throw new ActionCardError(404, "NOT_FOUND", "Card message not found");
    }
    const meta = (row.actionMetadata ?? null) as Partial<ActionCardMetadata> | null;
    if (!meta || meta.kind !== "action-card") {
      throw new ActionCardError(400, "NOT_ACTION_CARD", "Message is not an action card");
    }
    if (meta.state === "executed") {
      return { row, metadata: meta as ActionCardMetadata, executed: false };
    }
    if (meta.state !== "prepared") {
      throw new ActionCardError(409, "BAD_STATE", `Card is ${meta.state}; cannot mark executed`);
    }
    const action = meta.action as ActionCardAction;
    assertActionResultKindMatches(action, args.result);
    if (
      action.type === "agent:create"
      && action.requiredComputer
      && args.result.kind === "agent"
    ) {
      const [createdAgent] = await tx
        .select({
          id: agents.id,
          serverId: agents.serverId,
          machineId: agents.machineId,
        })
        .from(agents)
        .where(eq(agents.id, args.result.id));
      if (!createdAgent || createdAgent.serverId !== args.serverId) {
        throw new ActionCardError(404, "AGENT_NOT_FOUND", "Created agent not found in this server");
      }
      if (createdAgent.machineId !== action.requiredComputer) {
        throw new ActionCardError(
          409,
          "REQUIRED_COMPUTER_MISMATCH",
          "Created agent does not match the action card's required computer",
        );
      }
    }
    const nextMeta: ActionCardMetadata = {
      kind: "action-card",
      action,
      state: "executed",
      executedAt: new Date().toISOString(),
      executedByUserId: args.userId,
      executedByUserName: userName,
      result: args.result,
    };
    await tx
      .update(actionCards)
      .set({
        state: "executed",
        executedAt: new Date(),
        executedByUserId: args.userId,
        result: args.result as unknown as object,
        updatedAt: new Date(),
      })
      .where(eq(actionCards.messageId, args.messageId));
    const [updated] = await tx
      .update(messages)
      .set({ actionMetadata: nextMeta, updatedAt: new Date() })
      .where(eq(messages.id, args.messageId))
      .returning();
    return { row: updated, metadata: nextMeta, executed: true };
  });

  if (args.io && result.executed && result.row) {
    args.io
      .to(`channel:${result.row.channelId}`)
      .emit("message:updated", { ...result.row, senderName: "System" });
  }

  // Wake the requesting agent so it knows the card was committed and what
  // resource was produced. Per stdrc 2026-05-10 #proj-approval msg=9081c5f5:
  // include the *actual* created resource info (since the user may have
  // edited the agent's prefill before submitting the dialog).
  if (result.executed && result.row && args.orchestrator) {
    await wakeRequesterOnExecuted(
      args.orchestrator,
      args.serverId,
      result.row,
      result.metadata,
    );
  }

  // Funnel hook: dialog-driven success. The frontend already committed the
  // underlying create via the regular API; mark-executed records it. We
  // emit `execute_success` here for the same reason as the inline path —
  // funnel queries don't need to know which path was taken. Skipped on
  // idempotent no-op re-call. `subject_id` is the canonical
  // `action_cards.id` (Dozy + meichen 2026-05-13 msg=174ba78c) and
  // `action_type` is derived server-side from the validated card metadata.
  //
  // Dialog-driven `execute_attempt` and `execute_fail` are emitted by the
  // client (`POST /api/actions/:id/event`) since failures happen during
  // the regular create dialog before mark-executed is reached. The
  // `/event` route validates the card + access before recording, and
  // re-derives `action_type` server-side, so client emit doesn't open a
  // spoofing path. `execute_success` stays server-only per Dozy
  // msg=a1dbc464.
  if (result.executed) {
    const [cardRow] = await db
      .select({ id: actionCards.id })
      .from(actionCards)
      .where(eq(actionCards.messageId, args.messageId));
    if (cardRow) {
      await productEventsService.recordActionCardEvent({
        cardId: cardRow.id,
        eventType: "action_card.execute_success",
        actor: { type: "human", id: args.userId },
        source: "server",
        metadata: {
          action_type: result.metadata.action.type,
        },
      });
    }
  }

  return { messageId: args.messageId, metadata: result.metadata };
}

async function wakeRequesterOnExecuted(
  orchestrator: AgentOrchestrator,
  serverId: string,
  carrierMessageRow: { id: string; channelId: string; senderId: string },
  metadata: ActionCardMetadata,
): Promise<void> {
  // The carrier message's senderId IS the requesting agent's id (we set it
  // that way at prepare time). No extra DB lookup needed.
  const requesterAgentId = carrierMessageRow.senderId;
  const result = metadata.result;
  if (!result) return;

  const action = metadata.action;
  const executor = metadata.executedByUserName ?? "a human";
  const summary = (() => {
    if (result.kind === "channel") {
      const visibilityNote = action.type === "channel:create" && action.visibility === "private" ? " (private)" : "";
      return `${executor} committed your action card and created channel #${result.name}${visibilityNote} (id ${result.id.slice(0, 8)}). The channel is live now — proceed with whatever you planned next.`;
    }
    if (result.kind === "agent") {
      return `${executor} committed your action card and created agent @${result.name} (id ${result.id.slice(0, 8)}). The agent is set up — proceed with whatever you planned next (e.g. introducing them, posting starter context, etc.).`;
    }
    return `${executor} committed your action card.`;
  })();

  try {
    await messageService.deliverSystemNoticeToAgent(orchestrator, requesterAgentId, {
      serverId,
      channel_id: "action-cards",
      channel_name: "action-cards",
      channel_type: "channel",
      content: summary,
    }, { transient: true });
  } catch (err) {
    console.error("[actionCards] failed to wake requester on executed:", err);
  }
}

async function loadUserDisplayName(userId: string): Promise<string | null> {
  const db = getDb();
  const { users } = await import("../db/schema.js");
  const [u] = await db
    .select({ name: users.name, displayName: users.displayName })
    .from(users)
    .where(eq(users.id, userId));
  return u?.displayName ?? u?.name ?? null;
}

async function performAction(
  serverId: string,
  userId: string,
  action: ActionCardAction,
  io: SocketServer | null | undefined = null,
): Promise<ActionCardResult> {
  // Authorization: each action checks the caller is allowed to perform it as
  // a regular user in this server. We deliberately don't require admin role
  // here — the *operations* a card can prepare are the same things the user
  // could do via UI without special elevation. If we later add operations
  // gated to admin (e.g. delete channel), enforce via `requireServerRole`
  // before performing.
  const isMember = await serverService.isMember(serverId, userId);
  if (!isMember) {
    throw new ActionCardError(403, "NOT_A_MEMBER", "You are not a member of this server");
  }

  switch (action.type) {
    case "channel:create": {
      const channelType = action.visibility === "private" ? "private" : "channel";
      const channel = await channelService.createChannel(
        serverId,
        action.name,
        action.description,
        channelType,
      );
      // Apply initial members + the creator (creator = the human clicking).
      await channelService.addHuman(channel.id, userId);
      for (const uid of action.initialHumans ?? []) {
        if (uid === userId) continue;
        try {
          await channelService.addHuman(channel.id, uid);
        } catch {
          // Skip users that aren't server members — not blocking for the channel.
        }
      }
      for (const aid of action.initialAgents ?? []) {
        try {
          await channelService.addAgent(channel.id, aid);
        } catch {
          // Skip invalid agent ids.
        }
      }
      // Mirror the broadcasts that POST /api/channels emits, per stdrc
      // contract: "the click path should be identical to filling the form
      // and submitting" (#proj-approval msg=2cff5887).
      if (channel.type === "private") {
        io?.to(`channel:${channel.id}`).emit("channel:updated", { channel: { ...channel, joined: true } });
        for (const uid of action.initialHumans ?? []) {
          io?.to(`user:${uid}`).emit("channel:updated", { channel: { ...channel, joined: true } });
        }
        io?.to(`user:${userId}`).emit("channel:updated", { channel: { ...channel, joined: true } });
      } else {
        io?.to(`server:${serverId}`).emit("channel:updated", { channel: { ...channel, joined: true } });
      }
      return { kind: "channel", id: channel.id, name: channel.name };
    }
    case "agent:create": {
      // agent:create is NOT one-click executable: the agent only proposes
      // semantic intent (name + description); technical fields (computer /
      // runtime / model) are user prerogatives and must be picked in the
      // CreateAgentDialog. The frontend opens that dialog when the user
      // clicks "Create Agent" on the card; after dialog success, the
      // frontend calls `/api/actions/:msgId/mark-executed` to mark the
      // card consumed. Per stdrc 2026-05-10 #proj-approval msg=cf3ba1b7:
      // "对于 Create agent 这种需要进一步让用户自己决策的，应该是点了
      // 按钮之后弹窗，让用户继续填".
      void io;
      throw new ActionCardError(
        409,
        "DIALOG_REQUIRED",
        "agent:create requires the create-agent dialog to pick computer/runtime/model; frontend should open the dialog and call mark-executed after success.",
      );
    }
    case "channel:add_member": {
      // channel:add_member follows the same dialog-driven contract as
      // agent:create — the agent only proposes a list, the human reviews
      // and confirms in `<AddMembersDialog>`, and the frontend calls
      // /api/actions/:msgId/mark-executed after the existing channel
      // /members endpoints succeed. Server-side execute is never called
      // for this action type.
      void io;
      throw new ActionCardError(
        409,
        "DIALOG_REQUIRED",
        "channel:add_member requires the add-members dialog so the human can review the prefilled list; frontend should open the dialog and call mark-executed after the add-members API succeeds.",
      );
    }
  }
}

function summarize(action: ActionCardAction): string {
  switch (action.type) {
    case "channel:create": {
      const vis = action.visibility === "private" ? " (private)" : "";
      return `Operation: create channel #${action.name}${vis}`;
    }
    case "agent:create":
      return `Operation: create agent @${action.name}`;
    case "channel:add_member": {
      const humanCount = action.humans?.length ?? 0;
      const agentCount = action.agents?.length ?? 0;
      const parts: string[] = [];
      if (humanCount > 0) parts.push(`${humanCount} human${humanCount === 1 ? "" : "s"}`);
      if (agentCount > 0) parts.push(`${agentCount} agent${agentCount === 1 ? "" : "s"}`);
      return `Operation: add ${parts.join(" + ") || "members"} to a channel`;
    }
  }
}
