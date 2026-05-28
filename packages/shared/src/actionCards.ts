// Operation cards (B-mode) — agents prepare a privileged action and post it
// inline as a chat message; a human admin clicks the action button to commit
// it under their own identity. The card is the entire body of the system
// message that carries it (`actionMetadata.kind === "action-card"`).
//
// Contrast with approval (A-mode) where the *agent* is the actor and the
// human merely gates: in B-mode, the *human* is the actor, the agent is
// just preparing the form. Button label is the action verb, not "Approve".
//
// v1 supported action types: `channel:create`, `agent:create`,
// `channel:add_member`. `channel:join` (A-mode, agent acting on itself)
// stays deferred for the approval surface.

import { z } from "zod";

const uuidSchema = z.uuid();

/**
 * `idOrHandleSchema` — schema for fields that accept either a Slock UUID
 * (e.g. `c29682ed-...`) or an agent-facing handle reference:
 *   - `@alice` / `alice` for humans (server resolves via `resolveUserByName`)
 *   - `@scout` / `scout` for agents (server resolves via `resolveAgentByName`)
 *   - `#general` / `general` for channels (server resolves via
 *     `resolveChannelByName`)
 *
 * The AX invariant (per xxchan #engineering msg=f629320c, 2026-05-11):
 * agents never see UUIDs. Action-card payloads from agents always carry
 * handles; `actionCardsService.prepareActionCard` resolves them to UUIDs
 * before persisting, so the stored card metadata is UUID-only. Existing
 * UUID callers (server-internal, tests, future flows that already have
 * IDs) continue to work because a UUID literal is also a valid handle
 * (it just resolves to itself).
 *
 * Validation only checks "non-empty string"; type-specific resolution and
 * not-found errors live in the server's prepare step.
 */
const idOrHandleSchema = z.string().min(1).max(120);

export const APPROVAL_RUNTIMES = ["claude", "codex", "kimi", "gemini", "opencode"] as const;
export type ActionCardAgentRuntime = (typeof APPROVAL_RUNTIMES)[number];

const draftHintSchema = z
  .string()
  .trim()
  .max(2_000)
  .optional()
  .describe(
    "Why the agent prepared this for you. Shows below the form on the card; not the action itself.",
  );

export const channelCreateOperationSchema = z.object({
  type: z.literal("channel:create"),
  name: z.string().trim().min(1).max(80),
  visibility: z.enum(["public", "private"]).default("public"),
  description: z.string().trim().max(500).optional(),
  /**
   * Humans to add to the channel on creation. Each entry is a handle
   * (`@alice` or bare `alice`) or a UUID. Server resolves via
   * `resolveUserByName` at prepare time; resolved UUIDs are stored.
   */
  initialHumans: z.array(idOrHandleSchema).max(64).optional(),
  /**
   * Agents to add to the channel on creation. Each entry is a handle
   * (`@scout` or bare `scout`) or a UUID. Server resolves via
   * `resolveAgentByName` at prepare time; resolved UUIDs are stored.
   */
  initialAgents: z.array(idOrHandleSchema).max(64).optional(),
  draftHint: draftHintSchema,
});

export const agentCreateOperationSchema = z.object({
  type: z.literal("agent:create"),
  name: z.string().trim().min(1).max(60),
  description: z.string().trim().max(500).optional(),
  /**
   * Optional computer placement contract. Agents may only set this when the
   * human request is explicitly computer-bound; server prepare resolves the
   * name/UUID and stores the UUID-only form. `suggestedComputer` preselects
   * the dialog when available; `requiredComputer` prevents silent fallback to
   * any other computer.
   *
   * Runtime / model / reasoning effort remain human-picked technical fields.
   */
  suggestedComputer: idOrHandleSchema.optional(),
  requiredComputer: idOrHandleSchema.optional(),
  draftHint: draftHintSchema,
});

/**
 * `channel:add_member` — agent prepares a list of humans and/or agents to add
 * to an existing channel. The human clicks "Add Members" on the card, an
 * `<AddMembersDialog>` opens prefilled with the agent's list (editable, the
 * human can deselect / add more), and submission calls the existing
 * `POST /api/channels/:id/members` add endpoints under the human's identity.
 *
 * Per stdrc 2026-05-11 #proj-permission msg=670d903f: the dialog UI mirrors
 * the channel members panel so the experience is familiar; the human keeps
 * final say over who actually gets added.
 *
 * `humans` and `agents` are independently optional but at least one of
 * them must be non-empty — preparing an add-member card with no candidates
 * is meaningless and would render an empty dialog. The non-empty check is
 * enforced by `validateActionCardAction()` rather than inside this schema:
 * zod's `discriminatedUnion` requires plain `ZodObject` options (no
 * `ZodEffects` from `.refine`), so cross-field constraints live in the
 * post-parse validator.
 *
 * Field naming (per xxchan #engineering msg=d22fb886, 2026-05-11): these
 * fields used to be `*Id` / `*Ids` when the schema required UUIDs. Now
 * that they accept handles too, the `Id` suffix is misleading. The
 * field names mirror `channelCreateOperationSchema.initialHumans` /
 * `initialAgents` for symmetry.
 */
export const channelAddMemberOperationSchema = z.object({
  type: z.literal("channel:add_member"),
  /**
   * Target channel. Handle (`#general` or bare `general`) or UUID.
   * Server resolves via `resolveChannelByName` at prepare time; the
   * resolved UUID is stored in the card metadata.
   */
  channel: idOrHandleSchema,
  /** Same resolution rule as `channelCreateOperationSchema.initialHumans`. */
  humans: z.array(idOrHandleSchema).max(64).optional(),
  /** Same resolution rule as `channelCreateOperationSchema.initialAgents`. */
  agents: z.array(idOrHandleSchema).max(64).optional(),
  draftHint: draftHintSchema,
});

export const actionCardActionSchema = z.discriminatedUnion("type", [
  channelCreateOperationSchema,
  agentCreateOperationSchema,
  channelAddMemberOperationSchema,
]);

export type ActionCardAction = z.infer<typeof actionCardActionSchema>;
export type ActionCardActionType = ActionCardAction["type"];

export const ACTION_CARD_ACTION_TYPES: readonly ActionCardActionType[] = [
  "channel:create",
  "agent:create",
  "channel:add_member",
] as const;

/**
 * UUID v1-v8 / nil / max — same shape the agent-facing handle resolvers use
 * to short-circuit and pass UUIDs through verbatim. Mirrors zod's
 * `z.uuid()` accept set so action-card resolution and other zod validation
 * stay consistent on what counts as a UUID literal vs a handle.
 */
const UUID_PATTERN =
  /^([0-9a-fA-F]{8}-[0-9a-fA-F]{4}-[1-8][0-9a-fA-F]{3}-[89abAB][0-9a-fA-F]{3}-[0-9a-fA-F]{12}|00000000-0000-0000-0000-000000000000|ffffffff-ffff-ffff-ffff-ffffffffffff)$/;

export function looksLikeUuid(value: string): boolean {
  return UUID_PATTERN.test(value);
}

/**
 * Strip a leading sigil (`@` for humans/agents, `#` for channels) so the
 * remaining handle can be fed straight into `resolveUserByName` /
 * `resolveAgentByName` / `resolveChannelByName`. Agents are free to use
 * either form (`@alice` or `alice`); we normalize before resolution.
 */
export function extractHandleName(raw: string, sigil: "@" | "#"): string {
  const trimmed = raw.trim();
  return trimmed.startsWith(sigil) ? trimmed.slice(1) : trimmed;
}

/**
 * Post-schema cross-field validation. The discriminated union catches type
 * structure issues; this catches semantic constraints that don't fit a pure
 * schema (e.g. `channel:add_member` requires at least one member).
 *
 * Returns null when the action is valid, or an error message describing the
 * first failure. Call this AFTER `actionCardActionSchema.parse()`.
 */
export function validateActionCardAction(action: ActionCardAction): string | null {
  if (action.type === "agent:create") {
    if (action.suggestedComputer && action.requiredComputer) {
      return "agent:create must include only one of suggestedComputer or requiredComputer";
    }
  }
  if (action.type === "channel:add_member") {
    const total = (action.humans?.length ?? 0) + (action.agents?.length ?? 0);
    if (total === 0) {
      return "channel:add_member must include at least one human or agent";
    }
  }
  return null;
}

// ── Card state on the carrier message ───────────────────────────────────────
//
// State lives on `messages.action_metadata` (jsonb) — no separate table. The
// state machine is intentionally tiny:
//
//   prepared → executed   (admin clicked the action button, action succeeded)
//   prepared → failed     (admin clicked, action failed; card shows error and
//                          stays "prepared" so click can be retried —
//                          `failed` is a UI hint, the canonical state stays
//                          `prepared` for retry)
//
// The action is idempotent at the server level: a click while state is
// already `executed` is rejected.

export type ActionCardState = "prepared" | "executed";

export interface ActionCardMetadata {
  kind: "action-card";
  /** Frozen at prepare time. */
  action: ActionCardAction;
  state: ActionCardState;
  /** Set when state = executed. */
  executedAt?: string | null;
  executedByUserId?: string | null;
  executedByUserName?: string | null;
  /** Resource produced by the execute step (e.g. created channel id). */
  result?: ActionCardResult | null;
}

export type ActionCardResult =
  | { kind: "channel"; id: string; name: string }
  | { kind: "agent"; id: string; name: string }
  | {
      kind: "channel-members";
      /** Channel the members were added to. */
      channelId: string;
      channelName: string;
      /** UUIDs of humans the dialog actually submitted. The agent's
       *  prefilled list is just a suggestion — the human may have
       *  deselected entries or added different ones, so we record the
       *  effective add list (the actual API submission). */
      addedHumanIds: string[];
      /** UUIDs of agents actually added. Same semantics as
       *  `addedHumanIds`. */
      addedAgentIds: string[];
    };

// Body shape for POST /api/actions/:messageId/execute
export interface ExecuteActionRequestBody {
  /** Optimistic-concurrency guard against double-execute. */
  expectedState?: ActionCardState;
}

// Body shape for POST /api/actions/:messageId/mark-executed (dialog flow)
export interface MarkActionExecutedRequestBody {
  result: ActionCardResult;
}
