import { createFileRoute, redirect } from "@tanstack/react-router";

const SKILL_RULES =
  "https://github.com/botiverse/raft-design/blob/main/packages/ui/skills/raft-ui-guide/rules";

// The raft-ui-guide rules were published here. The guideline ones are now
// pages of the design system; the code-specific ones stay in the skill
// (apps/doc/DESIGN.md §11, 4).
const MOVED: Record<string, string> = {
  overview: "/",
  composition: "/patterns/composites",
  conversation: "/patterns/conversation",
  display: "/foundations/typography",
  feedback: "/patterns/feedback",
  forms: "/patterns/forms",
  layout: "/patterns/page-structure",
  overlays: "/patterns/choosing-components#overlays",
  styling: "/foundations/color",
  adoption: `${SKILL_RULES}/adoption.md`,
  lookup: `${SKILL_RULES}/lookup.md`,
  "technical-overview": `${SKILL_RULES}/technical-overview.md`,
};

export const Route = createFileRoute("/guides/$name")({
  beforeLoad: ({ params }) => {
    throw redirect({ href: MOVED[params.name] ?? "/", statusCode: 301 });
  },
});
