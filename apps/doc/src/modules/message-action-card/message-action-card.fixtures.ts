export type ActionCardFixture = {
  type:
    | "channel:create"
    | "agent:create"
    | "channel:add_member"
    | "integration:approve_agent_login"
    | "integration:register_app"
    | "integration:update_app_registration"
    | "integration:recover_app_owner";
  title: string;
  details: readonly { label: string; value: string }[];
  hint: string;
  verb: string;
  result: string;
};

export const ACTION_CARD_FIXTURES: readonly ActionCardFixture[] = [
  {
    type: "channel:create",
    title: "Create private channel #release-review",
    details: [
      { label: "Description", value: "Coordinate the final release review." },
      { label: "Humans", value: "Ada, Will" },
      { label: "Agents", value: "Atlas" },
    ],
    hint: "Suggested after the launch checklist was approved.",
    verb: "Create Channel",
    result: "→ #release-review",
  },
  {
    type: "agent:create",
    title: "Create Agent @release-scout",
    details: [
      { label: "Description", value: "Track the release cut and verification gates." },
      { label: "Required computer", value: "Build Mac" },
    ],
    hint: "Prepared for a computer-bound release workflow.",
    verb: "Create Agent",
    result: "→ @release-scout",
  },
  {
    type: "channel:add_member",
    title: "Add 2 members to #release-review",
    details: [
      { label: "Channel", value: "#release-review" },
      { label: "Humans", value: "Ada" },
      { label: "Agents", value: "Atlas" },
    ],
    hint: "The human can edit this prefilled member list before commit.",
    verb: "Add Members",
    result: "→ 2 added to #release-review",
  },
  {
    type: "integration:approve_agent_login",
    title: "Approve GitHub for @atlas",
    details: [
      { label: "Service", value: "GitHub" },
      { label: "Agent", value: "@atlas" },
      { label: "Scopes", value: "repo:read, pull_request:write" },
    ],
    hint: "Review the requested scopes before granting the agent login.",
    verb: "Approve Login",
    result: "→ GitHub approved for @atlas",
  },
  {
    type: "integration:register_app",
    title: "Register app Release Bot",
    details: [
      { label: "Client key", value: "Auto-generated on commit" },
      { label: "Redirect URL", value: "https://release.example.com/oauth/callback" },
      { label: "Scopes", value: "messages:read, messages:write" },
    ],
    hint: "The requesting agent becomes the initial app owner.",
    verb: "Register App",
    result: "→ Release Bot registered (release-bot)",
  },
  {
    type: "integration:update_app_registration",
    title: "Update app release-bot",
    details: [
      { label: "Client key", value: "release-bot" },
      { label: "Name", value: "Release Bot" },
      { label: "Redirect URL", value: "https://release.example.com/oauth/v2/callback" },
      { label: "Scopes", value: "messages:read, messages:write" },
    ],
    hint: "Only the listed registration fields are changed.",
    verb: "Update App",
    result: "→ Release Bot updated (release-bot)",
  },
  {
    type: "integration:recover_app_owner",
    title: "Recover release-bot for @atlas",
    details: [
      { label: "Client key", value: "release-bot" },
      { label: "Recovery owner", value: "@atlas" },
      { label: "Guardrail", value: "Rejected while the app has an active owner." },
    ],
    hint: "Admin recovery changes the owner of a server-local Connected App.",
    verb: "Recover Owner",
    result: "→ Release Bot ownership recovered to @atlas",
  },
] as const;

export type SimulatedActionCardState = "prepared" | "busy" | "failed" | "executed";
