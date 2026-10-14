// Fixtures for the MessageActionCard doc page (slock task #752). Every card a
// Raft agent can prepare today, grouped by the two patterns:
//   review  — the action opens the regular dialog prefilled; the person can
//             change anything before it is created (primary button "Review").
//   approve — the action runs in one click (primary button names the action).

export type ActionCardKind =
  | "channel"
  | "agent"
  | "members"
  | "login"
  | "install"
  | "register"
  | "update"
  | "recover";

export type ActionCardPattern = "review" | "approve";

export type ActionCardState =
  | "pending"
  | "paused"
  | "confirm-again"
  | "done"
  | "declined"
  | "view-only";

export interface ActionCardScopeFixture {
  name: string;
  description: string;
}

export interface ActionCardFixture {
  kind: ActionCardKind;
  pattern: ActionCardPattern;
  title: string;
  properties: ReadonlyArray<{ label: string; value: string; code?: boolean }>;
  scopes?: readonly ActionCardScopeFixture[];
  /** The agent's reason for preparing the card. */
  hint?: string;
  /** At most one standing notice, always neutral. */
  notice?: string;
  /** Primary label for the approve pattern ("Review" for the review pattern). */
  verb: string;
  /** What the completion line says once done. */
  result: string;
}

const SCOPES: Record<string, ActionCardScopeFixture> = {
  openid: {
    name: "openid",
    description: "Signs you in with Raft and issues a stable identity token. Authentication only.",
  },
  profile: {
    name: "profile",
    description: "Reads your basic profile fields. No access to messages, files, or agents.",
  },
  agentRead: {
    name: "agent:read",
    description:
      "Reads the IDs, handles, names and avatars of agents in the Server you authorize. Cannot send messages.",
  },
  agentEventWrite: {
    name: "agent:event:write",
    description: "Sends structured event messages to the one agent you authorize.",
  },
  email: {
    name: "email",
    description:
      "Reads your verified Raft account email address. No access to messages, files, or agents.",
  },
};

export const ACTION_CARD_FIXTURES: Record<ActionCardKind, ActionCardFixture> = {
  channel: {
    kind: "channel",
    pattern: "review",
    title: "Create private channel #release-review",
    properties: [
      { label: "Description", value: "Coordinate the final release review." },
      { label: "People", value: "Ada, Will" },
      { label: "Agents", value: "Atlas" },
    ],
    hint: "You asked for a private space for the release review.",
    verb: "Create Channel",
    result: "Created by Ada → #release-review",
  },
  agent: {
    kind: "agent",
    pattern: "review",
    title: "Create agent @release-bot",
    properties: [
      { label: "Description", value: "Drafts release notes from merged pull requests." },
      { label: "Suggested computer", value: "build-mac-01" },
    ],
    hint: "You asked for someone to write release notes every Friday.",
    verb: "Create Agent",
    result: "Created by Ada → @release-bot",
  },
  members: {
    kind: "members",
    pattern: "review",
    title: "Add 3 members to #general",
    properties: [
      { label: "People", value: "Ada, Will" },
      { label: "Agents", value: "Lumen" },
    ],
    verb: "Add Members",
    result: "Added by Ada → 3 members in #general",
  },
  login: {
    kind: "login",
    pattern: "approve",
    title: "Approve Linear for @lumen",
    properties: [
      { label: "App", value: "Linear" },
      { label: "Agent", value: "@lumen" },
    ],
    scopes: [SCOPES.openid!, SCOPES.profile!, SCOPES.agentRead!, SCOPES.agentEventWrite!],
    hint: "I need to file the issues you listed in this morning's triage.",
    notice:
      "Sends to @lumen only. Cannot send chat as you, speak as the agent, read messages, or take actions.",
    verb: "Approve Login",
    result: "Approved by Ada → Linear can sign in as @lumen",
  },
  install: {
    kind: "install",
    pattern: "approve",
    title: "Install Lens for @lumen",
    properties: [
      { label: "App", value: "Lens" },
      { label: "Agent", value: "@lumen" },
    ],
    scopes: [SCOPES.openid!, SCOPES.profile!],
    notice: "Installs the app for this whole Server. Only an owner or admin can do this.",
    verb: "Install App",
    result: "Installed by Ada → Lens",
  },
  register: {
    kind: "register",
    pattern: "approve",
    title: "Register app Release Notes",
    properties: [
      { label: "Client key", value: "release-notes", code: true },
      { label: "Redirect URL", value: "https://notes.example.com/oauth/callback", code: true },
    ],
    scopes: [SCOPES.openid!, SCOPES.email!],
    notice: "The requesting agent becomes the app's owner and can rotate, update or transfer it.",
    verb: "Register App",
    result: "Registered by Ada → Release Notes",
  },
  update: {
    kind: "update",
    pattern: "approve",
    title: "Update app release-notes",
    properties: [
      { label: "Client key", value: "release-notes", code: true },
      { label: "New name", value: "Release Notes v2" },
    ],
    verb: "Update App",
    result: "Updated by Ada → Release Notes v2",
  },
  recover: {
    kind: "recover",
    pattern: "approve",
    title: "Recover release-notes for @atlas",
    properties: [
      { label: "Client key", value: "release-notes", code: true },
      { label: "New owner", value: "@atlas" },
    ],
    notice: "Admin recovery. It is refused while the app still has an active owner.",
    verb: "Recover Owner",
    result: "Recovered by Ada → @atlas owns release-notes",
  },
};

export const REVIEW_KINDS: readonly ActionCardKind[] = ["channel", "agent", "members"];
export const APPROVE_KINDS: readonly ActionCardKind[] = [
  "login",
  "install",
  "register",
  "update",
  "recover",
];

export const ACTION_CARD_STATES: ReadonlyArray<{ value: ActionCardState; label: string }> = [
  { value: "pending", label: "Pending" },
  { value: "paused", label: "Paused" },
  { value: "confirm-again", label: "Confirm again" },
  { value: "done", label: "Done" },
  { value: "declined", label: "Declined" },
  { value: "view-only", label: "View only" },
];

/** Resolved and view-only cards fold to their header by default. */
export function foldsByDefault(state: ActionCardState): boolean {
  return state === "done" || state === "declined" || state === "view-only";
}
