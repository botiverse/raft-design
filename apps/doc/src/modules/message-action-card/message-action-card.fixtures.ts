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

export const ACTION_CARD_FIXTURE: ActionCardFixture = {
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
};
