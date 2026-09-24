import { defineTopic } from "./topic-model.ts";
import type { PlaygroundTopic } from "./topic-model.ts";

/** Joins Markdown lines so topic bodies stay readable without template indentation. */
const md = (...lines: readonly string[]) => lines.join("\n");

const announcements = [
  defineTopic({
    id: "how-we-use-topics",
    channelId: "announcements",
    title: "How we use Topics (and when to stay in chat)",
    by: "cuvii",
    at: "08-31 09:00",
    pinned: true,
    body: md(
      "Chat is still where quick back-and-forth happens. Open a topic when something **needs a decision, has an owner, or will be looked up later**.",
      "",
      "- Proposals that need sign-off → #proposals",
      "- Weekly priorities → one topic per week in #weekly-updates",
      "- Anything on fire → #incidents (Incident Triage opens these automatically)",
      "- Release and launch milestones → #releases",
      "",
      "Every topic lives in exactly one channel. If it is in the wrong place, close it and repost — we do not tag or cross-file.",
    ),
    replies: [
      ["avery", "08-31 09:20", "Does the launch checklist live in #releases or #weekly-updates?"],
      [
        "cuvii",
        "08-31 09:26",
        "#releases. Weekly updates link to it instead of copying the checklist.",
      ],
      [
        "atlas",
        "08-31 10:02",
        "I will stop posting migration checkpoints in chat and summarize them in the weekly topic instead.",
      ],
    ],
  }),
  defineTopic({
    id: "public-launch-date",
    channelId: "announcements",
    title: "Public launch is October 8",
    by: "cuvii",
    at: "09-21 17:00",
    body: md(
      "We are launching publicly on **Thursday, October 8**. Northstar goes first on the Friday before as our partner rollout.",
      "",
      "What this means for the next two weeks:",
      "",
      "1. No new features into v2.4 after Friday.",
      "2. The webhook retry fix is the only open P1 — Mateo owns it.",
      "3. Pricing copy and the support handoff are the two remaining launch items. Track them in #releases.",
    ),
    replies: [
      ["avery", "09-21 17:20", "Pricing copy lands Wednesday, legal has the draft."],
      [
        "mateo",
        "09-21 17:45",
        "Retry fix is in review. I will post the rollout plan under the incident.",
      ],
      [
        "supportGuide",
        "09-22 09:10",
        "Support macros for the launch FAQ are drafted, need a product review.",
      ],
      ["avery", "09-22 09:30", "I will review the macros tomorrow morning."],
    ],
    unread: 2,
  }),
  defineTopic({
    id: "incident-topics-automatic",
    channelId: "announcements",
    title: "Incident Triage now opens incident topics automatically",
    by: "cuvii",
    at: "09-15 10:00",
    body: md(
      "When an alert pages on-call, Incident Triage opens a topic in #incidents with the alert, the first timeline entry and the owning team.",
      "",
      "Please keep the timeline in that topic instead of a new chat room. The topic is marked resolved after the postmortem is attached.",
    ),
    replies: [
      [
        "incidentTriage",
        "09-15 10:05",
        "I will also link the deploy that preceded the alert when Deploy Watch has one.",
      ],
      [
        "mateo",
        "09-15 10:40",
        "Nice. This replaces the per-incident rooms we kept forgetting to archive.",
      ],
    ],
  }),
];

const weeklyUpdates = [
  defineTopic({
    id: "week-of-sep-21",
    channelId: "weekly-updates",
    title: "Week of Sep 21 — launch week minus one",
    by: "developer",
    at: "09-21 08:30",
    pinned: true,
    body: md(
      "Decisions that need owners by Tuesday are in bold.",
      "",
      "- **Webhook retry fix merged and rolled to 100%** — Mateo",
      "- Launch checklist from 86% to done — Avery",
      "- raft-ui migration: task #21 (message/thread ownership) — Atlas",
      "- **v2.4 changelog owner review** — Release Scribe collects sign-offs",
      "- Q3 operating review commentary on retention and support load — Cuvii",
      "",
      "Reply with a one-line status when yours moves.",
    ),
    replies: [
      ["mateo", "09-21 11:00", "Retry fix: in review, canary tomorrow."],
      ["atlas", "09-22 09:15", "#21: proposal posted in #proposals, waiting on review."],
      ["avery", "09-22 16:40", "Launch checklist: 91%. Pricing copy is the last content item."],
      ["releaseScribe", "09-22 17:00", "Changelog: 4 of 6 owners signed off."],
      ["mateo", "09-23 09:05", "Retry fix: canary at 10%, error rate back under 0.1%."],
      ["avery", "09-23 11:15", "Pricing copy approved by legal. Checklist at 94%."],
    ],
    unread: 2,
  }),
  defineTopic({
    id: "week-of-sep-14",
    channelId: "weekly-updates",
    title: "Week of Sep 14 — release candidate",
    by: "developer",
    at: "09-14 08:30",
    body: md(
      "- Cut the v2.4 release candidate — Release Scribe",
      "- 10% rollout with media evidence — QA Sentinel",
      "- Sidebar state audit decision — Cindy",
      "- Interview loop for the senior frontend role — Ada",
    ),
    replies: [
      ["releaseScribe", "09-15 16:00", "RC cut and signed."],
      ["cindy", "09-18 15:00", "Sidebar states decided, see #proposals."],
      ["qaSentinel", "09-19 18:10", "10% rollout clean, evidence attached to the release topic."],
      ["ada", "09-19 18:30", "Loop scheduled for Thursday next week."],
    ],
  }),
  defineTopic({
    id: "week-of-sep-7",
    channelId: "weekly-updates",
    title: "Week of Sep 7 — migration push",
    by: "developer",
    at: "09-07 08:30",
    body: md(
      "- Finish TaskBoard and TaskList migration to raft-ui — Atlas",
      "- Store migration proposal — Developer",
      "- Acme security questionnaire answers — Samira",
    ),
    replies: [
      ["atlas", "09-10 17:00", "TaskBoard and TaskList migrated, board fixtures are denser now."],
      ["samira", "09-11 12:00", "Questionnaire sent, one open item on regional backups."],
    ],
  }),
];

const proposals = [
  defineTopic({
    id: "store-jotai",
    channelId: "proposals",
    title: "Move the playground store from Zustand to Jotai",
    by: "developer",
    at: "09-16 10:00",
    resolved: true,
    body: md(
      "## Context",
      "The playground store mixes server-shaped mock data with UI state. Every selector change re-renders the whole sidebar.",
      "",
      "## Proposal",
      "Move local UI state to Jotai atoms and keep mock entities in plain modules.",
      "",
      "## Open questions",
      "- Do we need atom families for per-channel drafts?",
      "- What happens to the devtools we rely on?",
    ),
    replies: [
      [
        "atlas",
        "09-16 10:30",
        "The atom model is a better fit only if we keep server state out of the local store. Otherwise we just move the problem.",
      ],
      [
        "developer",
        "09-16 10:45",
        "Agreed — mock entities stay in modules, atoms only for UI state.",
      ],
      ["elliot", "09-16 13:20", "Jotai devtools cover what we use. No blocker from DX."],
      [
        "codePilot",
        "09-17 09:00",
        "Prototyped drafts as an atom family, 40 lines, no re-render storm.",
      ],
      ["cindy", "09-17 11:10", "No design impact as long as drafts survive channel switches."],
      [
        "developer",
        "09-18 09:30",
        "**Decision:** go. I will document the ownership boundary before changing the store.",
      ],
    ],
  }),
  defineTopic({
    id: "message-thread-ownership",
    channelId: "proposals",
    title: "One ownership model for messages and threads (task #21)",
    by: "atlas",
    at: "09-22 09:00",
    body: md(
      "Chat, Tasks and Files each keep their own copy of a message today, so a reply in a thread does not update the task card.",
      "",
      "**Proposal:** messages and threads live in one indexed collection keyed by message ID. Views read by ID and never copy.",
      "",
      "- Threads reference their parent by ID",
      "- Task cards reference their source message by ID",
      "- Files reference the message that carried them",
      "",
      "Migration is mechanical except for task threads, which currently fabricate a parent message.",
    ),
    replies: [
      [
        "developer",
        "09-22 10:15",
        "Yes. The fabricated task parent is the part that keeps breaking deep links.",
      ],
      ["olivia", "09-22 11:00", "Can we keep the old IDs stable? QA scripts use them."],
      ["atlas", "09-22 11:20", "IDs stay the same, only ownership moves."],
      [
        "cindy",
        "09-23 09:40",
        "From design: the task badge on the thread parent must stay in sync, that is the visible bug.",
      ],
      [
        "atlas",
        "09-23 10:05",
        "It will — the badge reads the task by message ID after this change.",
      ],
    ],
    unread: 3,
  }),
  defineTopic({
    id: "sidebar-row-states",
    channelId: "proposals",
    title: "Sidebar row states: empty, muted, unread, mention",
    by: "cindy",
    at: "09-15 14:00",
    resolved: true,
    body: md(
      "We have four row states and they combine in ways nobody designed. Proposed precedence:",
      "",
      "1. Mention wins over everything",
      "2. Unread count shows unless muted",
      "3. Muted rows keep mentions but drop counts",
      "4. Empty rows never show indicators",
    ),
    replies: [
      ["noah", "09-15 15:00", "Muted + mention should still be visible, agreed."],
      [
        "atlas",
        "09-16 09:30",
        "Reviewed every combination in the playground, all match this table.",
      ],
      [
        "samira",
        "09-16 10:00",
        "Screen readers need the muted state announced, not just the icon.",
      ],
      [
        "cindy",
        "09-18 14:30",
        "**Decided** with Samira's addition. Shipping in the sidebar recipe.",
      ],
    ],
  }),
  defineTopic({
    id: "rows-change-context",
    channelId: "proposals",
    title: "Playground IA: every row must change context",
    by: "mira",
    at: "09-09 11:00",
    resolved: true,
    body: md(
      "In critique, three reviewers lost trust when clicking a sidebar row did not change the main panel.",
      "",
      "**Proposal:** every row either navigates, opens an overlay, or is visibly disabled. No decorative rows.",
    ),
    replies: [
      ["cindy", "09-09 11:40", "Strong agree. The saved row was the worst offender."],
      [
        "developer",
        "09-09 13:00",
        "This matches the playground interaction rule, we just never enforced it.",
      ],
      ["qaSentinel", "09-10 09:00", "Added a check that flags enabled controls without a handler."],
      ["mira", "09-11 10:00", "Decided. Critique notes attached for the next round."],
    ],
  }),
  defineTopic({
    id: "invite-rate-limit",
    channelId: "proposals",
    title: "Rate-limit invite link lookups",
    by: "atlas",
    at: "09-18 08:20",
    resolved: true,
    body: md(
      "The invite link lookup returns different errors for expired and unknown codes. Someone could enumerate valid invites.",
      "",
      "Proposal: a workspace-scoped attempt budget, generic error copy, and logging of rejected probes.",
    ),
    replies: [
      [
        "samira",
        "09-18 08:40",
        "Use a workspace-scoped budget and log rejected code probes. 20 attempts per hour is enough.",
      ],
      [
        "developer",
        "09-18 09:10",
        "I will add the throttle before the invite lookup and keep the error copy generic.",
      ],
      ["samira", "09-19 15:00", "Reviewed the PR. Decided and shipped behind a flag."],
    ],
  }),
  defineTopic({
    id: "virtualization-docs",
    channelId: "proposals",
    title: "Document virtualization as consumer-owned",
    by: "specWriter",
    at: "09-23 10:30",
    body: md(
      "TaskBoard and TaskList docs imply the components virtualize for you. They do not.",
      "",
      "Proposal: show `ScrollAreaViewport` + `useVirtualizer` in the docs and remove the virtualization wording from the TaskBoard API page.",
    ),
    unread: "new",
  }),
];

const engineeringHelp = [
  defineTopic({
    id: "selector-rerender",
    channelId: "engineering-help",
    title: "Channel selector re-renders on every keystroke",
    by: "codePilot",
    at: "09-22 14:00",
    resolved: true,
    body: md(
      "Typing in the composer re-renders the channel selector in the sidebar. Profiler shows the selector subscribing to the whole draft map.",
      "",
      "```ts",
      "const drafts = useStore((state) => state.drafts);",
      "```",
    ),
    replies: [
      ["elliot", "09-22 14:20", "Is the selector memoized?"],
      [
        "developer",
        "09-22 14:35",
        "Select only the boolean you need: `useStore((s) => Boolean(s.drafts[channelId]))`. The map identity changes on every keystroke.",
      ],
      ["codePilot", "09-22 15:00", "That fixed it, 0 sidebar renders while typing."],
    ],
  }),
  defineTopic({
    id: "closed-drop",
    channelId: "engineering-help",
    title: "Should Closed accept drops in TaskDnd?",
    by: "ada",
    at: "09-10 16:00",
    resolved: true,
    body: "Dragging a card onto Closed is blocked. Is that intentional or a bug from the board migration?",
    replies: [
      [
        "atlas",
        "09-10 16:10",
        "Intentional: Closed stays drop-blocked, closing goes through the status menu so the reason is recorded.",
      ],
      ["ada", "09-10 16:30", "Thanks — I will keep the fixtures that way."],
    ],
  }),
  defineTopic({
    id: "brutal-status-label",
    channelId: "engineering-help",
    title: "Brutal status label feels heavy next to the icon",
    by: "cindy",
    at: "09-17 09:30",
    resolved: true,
    body: "The label and icon compete. I tried `text-[10px]` with a `size-2.5` icon — is that allowed in a recipe or do we need a token?",
    replies: [
      ["noah", "09-17 09:50", "Arbitrary values are fine once, but check the other badges first."],
      [
        "developer",
        "09-17 10:20",
        "Badges already use `text-[10px]`. Reuse the same class in the status recipe and it stays consistent — no token needed.",
      ],
    ],
  }),
  defineTopic({
    id: "translation-silent-failure",
    channelId: "engineering-help",
    title: "Translation fails silently on long messages",
    by: "samira",
    at: "09-23 09:40",
    body: "Messages over ~2k characters show the translate action, then nothing happens. No error state, no retry.",
    replies: [
      [
        "claudeAssistant",
        "09-23 10:10",
        "The request probably exceeds the provider limit. Do we chunk before sending?",
      ],
    ],
    unread: "new",
  }),
  defineTopic({
    id: "retry-budget-location",
    channelId: "engineering-help",
    title: "Where should the webhook retry budget live?",
    by: "mateo",
    at: "09-20 11:00",
    body: "Per endpoint or per workspace? The incident shows one noisy endpoint starving everyone else.",
    replies: [
      ["developer", "09-20 11:30", "Per endpoint with a workspace ceiling."],
      [
        "samira",
        "09-20 12:00",
        "Per endpoint also keeps a malicious receiver from burning the shared budget.",
      ],
    ],
  }),
  defineTopic({
    id: "nested-scroll-area",
    channelId: "engineering-help",
    title: "One ScrollArea per task column?",
    by: "elliot",
    at: "09-04 13:00",
    resolved: true,
    body: "Board columns scroll independently. Should each column get its own ScrollArea?",
    replies: [
      [
        "atlas",
        "09-04 13:20",
        "Use one shared viewport for the board; do not invent a second scroll container per column. Virtualize inside tall columns instead.",
      ],
    ],
  }),
];

const releases = [
  defineTopic({
    id: "public-launch-readiness",
    channelId: "releases",
    title: "Public launch readiness",
    by: "releaseScribe",
    at: "09-18 09:00",
    pinned: true,
    body: md(
      "Tracking the October 8 launch. Owners update their line in replies; I keep this checklist current.",
      "",
      "- [x] Status page and incident comms",
      "- [x] Northstar partner rollout plan",
      "- [x] Support macros drafted",
      "- [ ] Pricing copy — Avery",
      "- [ ] Support handoff review — Support Guide",
    ),
    replies: [
      ["avery", "09-19 10:00", "Pricing copy with legal."],
      ["supportGuide", "09-22 09:15", "Handoff doc ready for review."],
      ["releaseScribe", "09-22 17:05", "Checklist at 91%."],
      ["avery", "09-23 11:15", "Pricing copy approved."],
      [
        "releaseScribe",
        "09-23 11:20",
        "Checklist at 94%. Only the support handoff review remains.",
      ],
    ],
    unread: 2,
  }),
  defineTopic({
    id: "v2-4-changelog",
    channelId: "releases",
    title: "v2.4 — changelog for owner review",
    by: "releaseScribe",
    at: "09-22 16:00",
    body: md(
      "Grouped by what users notice. Owners, reply **signed off** or with changes.",
      "",
      "### Messaging",
      "- Threads and task cards stay in sync (#21)",
      "- Translation shows an error when it fails",
      "",
      "### Reliability",
      "- Webhook retries are budgeted per endpoint",
      "",
      "### Security",
      "- Invite links are rate-limited",
    ),
    replies: [
      ["atlas", "09-22 16:20", "Signed off for messaging."],
      ["samira", "09-22 16:30", "Signed off for security."],
      ["mateo", "09-22 16:45", "Retries: signed off once the canary reaches 100%."],
      [
        "samira",
        "09-23 10:30",
        "Translation entry: only if the error state actually ships, see #engineering-help.",
      ],
    ],
    unread: 1,
  }),
  defineTopic({
    id: "v2-4-rc-rollout",
    channelId: "releases",
    title: "v2.4 release candidate — 10% rollout",
    by: "releaseScribe",
    at: "09-15 16:00",
    body: "The release candidate is signed. Rollout decisions and media evidence go in this topic until we pass 10%.",
    replies: [
      ["deployWatch", "09-16 09:00", "Canary at 1%, no new errors."],
      ["qaSentinel", "09-17 14:00", "Screen-reader pass on the release dashboard recorded."],
      ["deployWatch", "09-19 18:00", "At 10%, error budget untouched."],
    ],
  }),
  defineTopic({
    id: "v2-3-2-hotfix",
    channelId: "releases",
    title: "v2.3.2 hotfix",
    by: "releaseScribe",
    at: "09-03 12:00",
    body: "Fixes the expired staging certificate that blocked deploys. No user-facing changes.",
    replies: [["mateo", "09-03 12:10", "Confirmed deploys are flowing again."]],
  }),
];

const incidents = [
  defineTopic({
    id: "webhook-retry-incident",
    channelId: "incidents",
    title: "Webhook deliveries degraded — retries queued",
    by: "incidentTriage",
    at: "09-22 07:10",
    body: md(
      "**Status:** mitigating · **Owner:** Infrastructure (Mateo)",
      "",
      "Webhook delivery is degraded. Retries are queued while we isolate the failed worker batch.",
      "",
      "Preceding deploy: worker pool resize at 06:52.",
    ),
    replies: [
      ["mateo", "09-22 07:25", "Rolled back the pool resize. Queue is draining."],
      ["deployWatch", "09-22 07:40", "Rollback complete across all regions."],
      [
        "mateo",
        "09-22 09:00",
        "One endpoint is retrying 40× per event and starving the shared budget.",
      ],
      ["samira", "09-22 09:30", "Is that endpoint ours or a customer's?"],
      ["mateo", "09-22 09:45", "Customer's. Budgeting per endpoint, see #engineering-help."],
      [
        "incidentTriage",
        "09-23 08:00",
        "Retry fix at 10% canary. Delivery latency back to baseline.",
      ],
      ["mateo", "09-23 10:40", "Canary clean. Going to 100% after the Northstar checkpoint."],
    ],
    unread: 3,
  }),
  defineTopic({
    id: "search-stale-index",
    channelId: "incidents",
    title: "Search results stale after index deploy",
    by: "incidentTriage",
    at: "09-11 15:00",
    resolved: true,
    body: "Search returns results up to 40 minutes old. Started after the index schema deploy at 14:30.",
    replies: [
      [
        "searchScout",
        "09-11 15:20",
        "The new schema skipped the incremental updater. Reindexing now.",
      ],
      ["searchScout", "09-11 16:10", "Reindex complete, freshness under 30 seconds."],
      [
        "incidentTriage",
        "09-12 10:00",
        "Postmortem attached. Action: schema deploys run the updater check.",
      ],
    ],
  }),
  defineTopic({
    id: "staging-cert",
    channelId: "incidents",
    title: "Staging deploys blocked by an expired certificate",
    by: "deployWatch",
    at: "09-02 09:00",
    resolved: true,
    body: "All staging deploys fail TLS verification since 08:00.",
    replies: [
      [
        "mateo",
        "09-02 09:30",
        "Renewal job was disabled during the cluster move. Renewed manually.",
      ],
      ["deployWatch", "09-02 09:45", "Deploys green. Hotfix release to follow."],
    ],
  }),
];

const northstar = [
  defineTopic({
    id: "northstar-handoff",
    channelId: "northstar",
    title: "Launch handoff runbook — remaining owners",
    by: "relay",
    at: "09-20 10:00",
    pinned: true,
    body: md(
      "Northstar confirmed the handoff window. The shared runbook is linked in the channel description.",
      "",
      "Still missing an owner:",
      "- Rollback decision on the Northstar side",
      "- Support escalation path during the first 48 hours",
    ),
    replies: [
      ["avery", "09-20 10:30", "Support escalation: Support Guide first, then me."],
      ["relay", "09-21 09:00", "Northstar named their on-call lead for rollback decisions."],
    ],
  }),
  defineTopic({
    id: "friday-rollout",
    channelId: "northstar",
    title: "Friday partner rollout — go/no-go at 14:00",
    by: "mateo",
    at: "09-23 09:00",
    body: "The partner environment is ready. We start after the 14:00 checkpoint if the webhook canary stays clean.",
    replies: [
      ["relay", "09-23 09:20", "Northstar is ready on their side."],
      ["olivia", "09-23 10:50", "The member picker regression must be fixed or waived before go."],
    ],
    unread: "new",
  }),
  defineTopic({
    id: "member-picker-regression",
    channelId: "northstar",
    title: "Partner acceptance: keyboard regression in the member picker",
    by: "olivia",
    at: "09-21 15:00",
    body: "Desktop passed. On mobile, the member picker traps focus after selecting the second person.",
    replies: [
      ["qaSentinel", "09-21 15:30", "Reproduced on iOS and Android."],
      ["codePilot", "09-22 11:00", "Fix up for review — the chips re-render and steal focus."],
      ["olivia", "09-23 10:45", "Fix verified on iOS, waiting on Android."],
    ],
  }),
  defineTopic({
    id: "q3-roadmap",
    channelId: "northstar",
    title: "Q3 joint roadmap — sequencing conflicts",
    by: "noah",
    at: "09-08 11:00",
    body: "I merged both roadmap drafts and marked the milestones where sequencing still conflicts: shared channels and the partner analytics export.",
    replies: [
      ["relay", "09-08 14:00", "Northstar can move analytics export to October."],
      [
        "dataWeaver",
        "09-09 10:00",
        "The export depends on the event schema we freeze next week, so October works.",
      ],
    ],
  }),
];

const acmeCloud = [
  defineTopic({
    id: "acme-retention",
    channelId: "acme-cloud",
    title: "Data-retention answers — regional backup policy open",
    by: "samira",
    at: "09-17 13:00",
    body: "Acme sent updated data-retention answers. Everything is resolved except the regional backup policy for EU tenants.",
    replies: [
      [
        "nyx",
        "09-17 15:00",
        "Acme's backups replicate to one US region by default. EU pinning is available on their enterprise tier.",
      ],
      ["samira", "09-18 09:00", "We need EU pinning. Asking procurement to include it."],
    ],
  }),
  defineTopic({
    id: "acme-dpa",
    resolved: true,
    channelId: "acme-cloud",
    title: "DPA redlines",
    by: "cuvii",
    at: "09-09 10:00",
    body: "Our redlines on the data processing agreement are attached. Main change: subprocessor notice period from 14 to 30 days.",
    replies: [["nyx", "09-10 16:00", "Acme accepted 30 days."]],
  }),
];

const maintainers = [
  defineTopic({
    id: "compact-nav-feedback",
    channelId: "maintainers",
    title: "Compact navigation prototype — feedback round 2",
    by: "mira",
    at: "09-16 10:00",
    body: md(
      "Round 1 takeaways: maintainers prefer compact navigation, but asked for clearer ownership on shared drafts.",
      "",
      "Round 2 adds an owner chip on every shared draft. Try it in the prototype and reply with what still feels ambiguous.",
    ),
    replies: [
      ["relay", "09-16 12:00", "Shared with the maintainer group."],
      [
        "nyx",
        "09-17 09:30",
        "Two maintainers still could not tell who can edit a draft vs comment.",
      ],
      ["mira", "09-17 10:00", "Adding the permission to the chip tooltip."],
      [
        "cindy",
        "09-18 11:00",
        "Tooltip is not enough on touch. Can the chip show 'can edit' inline?",
      ],
      ["mira", "09-18 11:20", "Yes, testing that in round 3."],
    ],
  }),
];

const research = [
  defineTopic({
    id: "shared-vs-internal",
    channelId: "research",
    title: "Interviews: shared channels vs internal rooms",
    by: "researchLark",
    at: "09-18 14:00",
    body: md(
      "Three teams asked for clearer separation between shared channels and internal project rooms.",
      "",
      "**What we heard**",
      "- People are afraid of posting internal notes where a partner can read them",
      "- A banner is not enough; they want the composer itself to look different",
      "- Nobody wanted per-message visibility",
      "",
      "Recordings and notes are linked for each team.",
    ),
    replies: [
      ["noah", "09-18 15:00", "This matches churn interviews from growth."],
      ["cindy", "09-19 10:00", "Composer treatment is a good lead. I will sketch it."],
      ["searchScout", "09-19 10:30", "Found 12 support tickets mentioning the same fear."],
    ],
  }),
  defineTopic({
    id: "retention-sweep-expectations",
    channelId: "research",
    title: "What admins expect from channel retention sweeps",
    by: "ada",
    at: "09-10 11:00",
    body: "Our sweep flagged nine inactive channels. Before automating it, I talked to five admins about what they expect to happen.",
    replies: [
      [
        "dataWeaver",
        "09-10 15:00",
        "Inactive channels hold 3% of messages but 20% of the search index.",
      ],
    ],
  }),
];

const hiring = [
  defineTopic({
    id: "senior-frontend-debrief",
    channelId: "hiring",
    title: "Senior frontend loop — debrief Thursday",
    by: "ada",
    at: "09-22 10:00",
    body: "The final interview loop is scheduled. Please add scorecards before Thursday's debrief — no discussion before scorecards are in.",
    replies: [
      ["developer", "09-22 18:00", "Scorecard in."],
      ["cindy", "09-23 09:00", "Scorecard in."],
    ],
    unread: 1,
  }),
  defineTopic({
    id: "agent-ops-rubric",
    channelId: "hiring",
    title: "Interview rubric for the agent operations role",
    by: "cindy",
    at: "09-05 14:00",
    body: "Draft rubric focused on supervising agents: triage, escalation judgement and writing clear handoffs.",
    replies: [["cuvii", "09-06 10:00", "Add a signal for knowing when to stop an agent."]],
  }),
];

const leadership = [
  defineTopic({
    id: "q3-operating-review",
    channelId: "leadership",
    title: "Q3 operating review — draft",
    by: "cuvii",
    at: "09-19 17:00",
    body: md(
      "The draft is ready. Two sections need updated commentary:",
      "",
      "- **Retention** — dipped in August, recovered in September",
      "- **Support load** — up 18% with the partner pilots",
    ),
    replies: [
      [
        "dataWeaver",
        "09-20 10:00",
        "Retention dip is entirely the two pilots that churned in August.",
      ],
      [
        "supportGuide",
        "09-20 11:00",
        "Support load: 60% of new tickets are shared-channel permissions.",
      ],
      ["avery", "09-21 09:00", "That supports prioritizing the shared-channel composer work."],
    ],
  }),
  defineTopic({
    id: "q4-headcount",
    channelId: "leadership",
    title: "Q4 headcount plan",
    by: "cuvii",
    at: "09-11 16:00",
    body: "Proposal: one senior frontend hire and one agent operations hire. No new managers.",
  }),
];

const lounge = [
  defineTopic({
    id: "friday-demos",
    channelId: "lounge",
    title: "Friday demos — sign up here",
    by: "olivia",
    at: "09-23 10:00",
    body: "Five minutes each, anything goes. Reply with what you are showing.",
    replies: [
      ["codePilot", "09-23 10:20", "Zero-render typing in the sidebar."],
      ["mira", "09-23 10:40", "Compact navigation round 2."],
      ["noah", "09-23 11:30", "And a playlist for the break, as usual."],
    ],
    unread: "new",
  }),
];

export const PLAYGROUND_TOPICS: readonly PlaygroundTopic[] = [
  ...announcements,
  ...weeklyUpdates,
  ...proposals,
  ...engineeringHelp,
  ...releases,
  ...incidents,
  ...northstar,
  ...acmeCloud,
  ...maintainers,
  ...research,
  ...hiring,
  ...leadership,
  ...lounge,
];
