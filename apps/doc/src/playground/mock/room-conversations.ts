import { defineEmptyRoom, defineStandardRoom } from "./conversation-model.ts";
import { RAFT_UI_MIGRATION_THREADS } from "./raft-ui-migration-threads.ts";
export const PLAYGROUND_ROOM_CONVERSATIONS = [
  defineStandardRoom({
    id: "all",
    name: "raft-ui-migration",
    subtitle: "Component migration working channel",
    memberCount: 42,
    memberIds: [
      "developer",
      "atlas",
      "ada",
      "cindy",
      "cuvii",
      "samira",
      "mira",
      "olivia",
      "elliot",
      "qaSentinel",
      "specWriter",
      "avery",
      "releaseScribe",
      "noah",
      "mateo",
      "claudeAssistant",
    ],
    threads: RAFT_UI_MIGRATION_THREADS,
    story: {
      opening: {
        senderId: "developer",
        createdAt: "09:18 AM",
        content:
          "Morning checkpoint for #raft-ui-migration — keep message/thread ownership coherent for @Atlas, and park follow-ups on task #21.",
      },
      reply: {
        senderId: "cuvii",
        createdAt: "09:24 AM",
        content:
          "Reviewing the mock conversation flow with @Atlas now so Chat, Tasks, and Files all read the same seed — including markdown refs and consecutive compact rows.",
        mentionReadStates: { atlas: "read" },
        reactions: [
          { emoji: "👍", count: 2, reactorIds: ["ada", "atlas"] },
          { emoji: "👀", count: 1, reactorIds: ["cindy"] },
        ],
      },
      updates: [
        {
          senderId: "ada",
          createdAt: "09:27 AM",
          content:
            "Board density looks thin on Todo. I am seeding more fixtures so ScrollArea / virtualization demos have something real to scroll.",
        },
        {
          senderId: "ada",
          createdAt: "09:28 AM",
          content: "Keeping assignees mixed across @Cuvii @Samira @Atlas so filters are not empty.",
        },
        {
          senderId: "atlas",
          createdAt: "09:31 AM",
          content:
            "Before we grow the board further — confirm Closed stays drop-blocked in TaskDnd. Do not invent a second scroll container per column.",
          translation: {
            translatedContent:
              "在继续扩展看板前，请确认 TaskDnd 中 Closed 仍然禁止放入。不要为每一列再创建一层滚动容器。",
          },
          reactions: [{ emoji: "✅", count: 1, reactorIds: ["developer"] }],
        },
        {
          senderId: "cindy",
          createdAt: "09:34 AM",
          content:
            "Brutal status labels still feel heavy next to the icon. I will try `text-[10px]` + `size-2.5` on the badge path and post a screenshot.",
          translation: {
            display: "bilingual",
            translatedContent:
              "Brutal 状态标签放在图标旁边仍然显得偏重。我会在徽标路径上尝试 `text-[10px]` 与 `size-2.5`，然后发一张截图。",
          },
        },
        {
          senderId: "samira",
          createdAt: "09:38 AM",
          content:
            "Invite security thread is ready for threshold review — see replies under the morning parent. Security needs the final probe budget before sign-off.",
          translation: { outcome: "failure" },
        },
        {
          senderId: "developer",
          createdAt: "09:41 AM",
          content:
            "Selector perf note: presence updates were still invalidating the whole list. Narrowed the subscription in the branch linked from task #22.",
          presentation: "action-card",
        },
        {
          senderId: "cuvii",
          createdAt: "09:44 AM",
          content:
            "Virtualization stays consumer-owned. Docs should show `ScrollAreaViewport` + `useVirtualizer`, not a TaskBoard API.",
          presentation: "forwarded-bundle",
        },
        {
          senderId: "cuvii",
          createdAt: "09:45 AM",
          content:
            "```ts\nconst virtualizer = useVirtualizer({\n  count: items.length,\n  getScrollElement: () => viewportRef.current,\n  overscan: 6,\n  scrollMargin,\n})\n```",
          presentation: "quoted-preview",
        },
        {
          senderId: "mira",
          createdAt: "09:49 AM",
          content:
            "Elegant TaskCard hover was washing through the column color. Opaque `color-mix` against `layer-panel` reads cleaner — please try both themes.",
        },
        {
          senderId: "atlas",
          createdAt: "09:52 AM",
          content:
            "@Mira that matches the token guidance — do not swap ink washes onto solid panel fills without checking the backdrop.",
        },
        {
          senderId: "olivia",
          createdAt: "09:56 AM",
          content:
            "Create-task sheet still writes into local playground state only. Fine for demos; call that out so nobody mistakes it for a server mutation.",
        },
        {
          senderId: "elliot",
          createdAt: "10:01 AM",
          content: "Keyboard status transitions can wait until the dual-trigger control lands.",
        },
        {
          senderId: "developer",
          createdAt: "10:04 AM",
          content:
            "Dual trigger is in: elegant keeps the icon control; brutal shows the label badge. Ghost more-menu stays composition-owned.",
          reactions: [{ emoji: "🔥", count: 2, reactorIds: ["cindy", "ada"] }],
        },
        {
          senderId: "cindy",
          createdAt: "10:07 AM",
          content:
            "Checking label + icon sizing on brutal now. Will close #46 if it matches source.",
        },
        {
          senderId: "samira",
          createdAt: "10:11 AM",
          content:
            "QA coverage matrix for empty columns: idle / allowed / blocked. Closed stays special-cased — see TaskDnd docs.",
        },
        {
          senderId: "qaSentinel",
          createdAt: "10:14 AM",
          content:
            "Collapsed columns still accept drops via the column host. Added that to the acceptance checklist under #37.",
        },
        {
          senderId: "atlas",
          createdAt: "10:18 AM",
          content:
            "API docs thread needs one more pass against canonical compositions — do not let generated Swagger become the source of truth.",
        },
        {
          senderId: "specWriter",
          createdAt: "10:22 AM",
          content:
            "Rewrote virtualization usage copy without product-repo branding. Lives under Usage, not a separate section.",
        },
        {
          senderId: "avery",
          createdAt: "10:26 AM",
          content:
            "Release note draft: ScrollArea graduated, TaskBoard/List docs include shared-viewport guidance. Ping @ReleaseScribe when the checklist is green.",
        },
        {
          senderId: "releaseScribe",
          createdAt: "10:29 AM",
          content: "Noted. Waiting on #51 review before I cut the changelog entry.",
        },
        {
          senderId: "noah",
          createdAt: "10:33 AM",
          content:
            "Tasks-tab unread counts should follow the active channel filter, not the global task registry. Tracking in #38.",
        },
        {
          senderId: "mateo",
          createdAt: "10:36 AM",
          content:
            "I can take the deep-link path from board cards → thread parents once #57 is unblocked.",
        },
        {
          senderId: "ada",
          createdAt: "10:40 AM",
          content:
            "Assignee fallbacks in playground cards were showing empty glyphs for unassigned todos. Patching fixtures.",
        },
        {
          senderId: "cindy",
          createdAt: "10:44 AM",
          content:
            "Brutal badge pass looks good on Todo / In Progress. In Review still needs the warmer icon color — @Developer can you cherry-pick?",
        },
        {
          senderId: "developer",
          createdAt: "10:46 AM",
          content:
            "Already on `oklch(0.72 0.16 58)` for elegant in-review. Brutal inherits the icon now.",
          reactions: [{ emoji: "🙌", count: 1, reactorIds: ["cindy"] }],
        },
        {
          senderId: "claudeAssistant",
          createdAt: "10:51 AM",
          content:
            "Synced agent activity chips with in-progress tasks in the playground shell. Progress strings stay mock-owned.",
        },
        {
          senderId: "cuvii",
          createdAt: "10:55 AM",
          content:
            "Reminder: `packages/ui` stays business-agnostic. Product icons (ellipsis ghost button) stay in compositions / playground.",
        },
        {
          senderId: "atlas",
          createdAt: "11:02 AM",
          content:
            "Midday status: Chat should feel as dense as the board. If Tasks outpace conversation, seed the timeline — do not invent fake product APIs.",
        },
        {
          senderId: "samira",
          createdAt: "11:06 AM",
          content:
            "Filter smoke: assignee = @Ada, status = in-progress. Expect a short list after the seed lands.",
        },
        {
          senderId: "ada",
          createdAt: "11:09 AM",
          content:
            "Confirmed on my side. Also checking Done/Closed so archive filters are not empty shells.",
        },
        {
          senderId: "olivia",
          createdAt: "11:13 AM",
          content:
            "Composer still has no pending uploads in this channel. Incidents owns the attachment demo — keep it there.",
        },
        {
          senderId: "developer",
          createdAt: "11:18 AM",
          unread: true,
          content:
            "Pushing denser `#raft-ui-migration` chat + board seeds. Reload Playground if you still see the two-message timeline.",
        },
        {
          senderId: "cindy",
          createdAt: "11:21 AM",
          unread: true,
          content:
            "@Cuvii once this is up, can you spot-check compact consecutive rows from me earlier this morning?",
        },
        {
          senderId: "cuvii",
          createdAt: "11:22 AM",
          unread: true,
          content: "On it — will reply here after the Chat tab scroll + Tasks board parity check.",
        },
      ],
      thread: { replies: [] },
    },
  }),
  defineStandardRoom({
    id: "general",
    name: "weekly-priorities",
    subtitle: "Team-wide product and engineering discussion",
    memberCount: 31,
    memberIds: ["avery", "cuvii"],
    story: {
      opening: {
        senderId: "avery",
        content:
          "I posted the weekly priorities and called out the decisions that need owners by tomorrow.",
      },
      reply: {
        senderId: "cuvii",
        content:
          "I claimed the playground data pass and added the dependency notes to the planning doc.",
        reactions: [
          { emoji: "👍", count: 1, reactorIds: ["avery"] },
          { emoji: "👀", count: 1, reactorIds: ["avery"] },
        ],
      },
      thread: {
        replies: [
          {
            senderId: "avery",
            content:
              "The data pass blocks sidebar sign-off, so I moved it ahead of the notification polish.",
          },
          {
            senderId: "cuvii",
            content: "That ordering is reflected in the weekly plan and tomorrow's owner check-in.",
          },
        ],
      },
    },
  }),
  defineStandardRoom({
    id: "design",
    name: "sidebar-state-audit",
    navigation: { pinned: true },
    subtitle: "Interaction design and system patterns",
    memberCount: 11,
    memberIds: ["cindy", "mira"],
    story: {
      opening: {
        senderId: "cindy",
        content:
          "The sidebar states are aligned. Ask @Atlas to review empty, muted, and unread combinations in #sidebar-state-audit before #weekly-priorities.",
      },
      reply: {
        senderId: "mira",
        content:
          "Coverage matrix is ready — `layer-panel` badges, mentions, and task #18 stay caller-owned.\n\n- Keep body content in MessageItemBody\n- Prefer semantic markdown + reference parts",
      },
      updates: [
        {
          senderId: "mira",
          createdAt: "09:29 AM",
          unread: true,
          content:
            "@Cindy tracked #18 in #weekly-priorities and linked #sidebar-state-audit:reply for the hierarchy pass.",
        },
        {
          senderId: "mira",
          createdAt: "09:31 AM",
          unread: true,
          content:
            "Final note for @Cuvii:\n\n```\n<MessageItem compact>\n  <MessageItemGutter />\n</MessageItem>\n```",
        },
      ],
      thread: {
        replies: [
          {
            senderId: "cindy",
            content:
              "Muted plus unread is the only combination whose hierarchy still feels ambiguous — see #sidebar-state-audit:reply.",
          },
          {
            senderId: "cindy",
            content:
              "Also flag @Mira if the unread count still competes with the muted badge in `brutal`.",
          },
          {
            senderId: "mira",
            content:
              "I added realistic copy for that row and kept the unread count visible but quiet.",
          },
        ],
      },
    },
  }),
  defineStandardRoom({
    id: "incidents",
    name: "webhook-retry-incident",
    initialComposer: {
      attachments: [
        {
          name: "webhook-retry-sample.json",
          mediaType: "application/json",
          state: { kind: "ready" },
        },
        {
          name: "failed-delivery-headers.txt",
          mediaType: "text/plain",
          state: { kind: "uploading", progress: 64 },
        },
        {
          name: "worker-trace.ndjson",
          mediaType: "application/x-ndjson",
          state: { kind: "failed" },
        },
      ],
    },
    navigation: { mention: true, muted: true },
    subtitle: "Delivery degraded — retries queued",
    memberCount: 14,
    memberIds: ["deployBot", "mxChen", "ada", "mateo", "incidentTriage"],
    story: {
      opening: {
        senderId: "deployBot",
        content:
          "Webhook delivery is degraded. Retries are queued while we isolate the failed worker batch.",
      },
      reply: {
        senderId: "incidentTriage",
        content:
          "I opened the incident channel and assigned the retry sample to the investigation owner.",
      },
      updates: [
        {
          senderId: "mateo",
          createdAt: "09:31 AM",
          unread: true,
          content:
            "The retry queue is draining normally after the worker restart; we are monitoring the remaining delayed deliveries.",
        },
      ],
      thread: {
        replies: [
          {
            senderId: "ada",
            content:
              "The failed batch is limited to the old retry worker. The replacement is accepting new deliveries.",
          },
        ],
      },
    },
  }),
  defineStandardRoom({
    id: "launch",
    name: "public-launch-readiness",
    subtitle: "Launch checklist, messaging, and rollout status",
    memberCount: 17,
    memberIds: ["avery", "releaseScribe"],
    story: {
      opening: {
        senderId: "avery",
        content: "The launch checklist is at 86%. Pricing copy and the support handoff remain.",
      },
      reply: {
        senderId: "releaseScribe",
        content: "I updated the launch brief and drafted the handoff note for Support to review.",
      },
      updates: [
        {
          senderId: "releaseScribe",
          createdAt: "09:28 AM",
          unread: true,
          content:
            "Support approved the migration fallback wording and assigned launch-day coverage.",
        },
        {
          senderId: "releaseScribe",
          createdAt: "09:32 AM",
          unread: true,
          content:
            "The remaining pricing review is scheduled before the public announcement window.",
        },
      ],
      thread: {
        replies: [
          {
            senderId: "avery",
            content:
              "Support needs the migration fallback and the billing escalation path before approving the handoff.",
          },
          {
            senderId: "releaseScribe",
            content: "Both paths are in the draft now, with owners for launch day coverage.",
          },
        ],
      },
    },
  }),
  defineStandardRoom({
    id: "frontend",
    name: "message-state-lab",
    subtitle: "Components, application shell, and client architecture",
    memberCount: 13,
    memberIds: [
      "ada",
      "atlas",
      "developer",
      "deployBot",
      "nyx",
      "relay",
      "legacyBot",
      "mxChen",
      "elliot",
      "codePilot",
    ],
    story: {
      opening: {
        senderId: "ada",
        content:
          "The message states are now represented by normal conversation data instead of a channel-specific render branch.",
      },
      reply: {
        senderId: "codePilot",
        content:
          "The timeline can render one message shape for channels, DMs, and threads. Visual coverage belongs in the message docs.",
      },
      updates: [
        {
          senderId: "developer",
          createdAt: "09:30 AM",
          content:
            "I linked the state examples to the component compositions and kept this channel as a real team conversation.",
        },
      ],
      thread: {
        replies: [
          {
            senderId: "atlas",
            content:
              "That keeps the product shell data-driven while preserving focused component coverage outside it.",
          },
        ],
      },
    },
  }),
  defineStandardRoom({
    id: "customer-notes",
    name: "shared-channel-research",
    subtitle: "Interview notes and customer follow-ups",
    memberCount: 10,
    memberIds: ["noah", "researchLark"],
    story: {
      opening: {
        senderId: "noah",
        content:
          "Three teams asked for clearer separation between shared channels and internal project rooms.",
      },
      reply: {
        senderId: "researchLark",
        content:
          "I clustered the interviews and added supporting quotes to the navigation findings.",
      },
      updates: [
        {
          senderId: "researchLark",
          createdAt: "09:27 AM",
          unread: true,
          content:
            "The new-member interviews consistently ask who owns a shared room before they ask about permissions.",
        },
        {
          senderId: "researchLark",
          createdAt: "09:31 AM",
          unread: true,
          content:
            "I added that wording to the onboarding recommendation with the supporting excerpts.",
        },
      ],
      thread: {
        replies: [
          {
            senderId: "noah",
            content:
              "Admins understand the distinction, but new members confuse partner rooms with internal projects.",
          },
          {
            senderId: "researchLark",
            content:
              "I added onboarding language that explains ownership before the first shared channel is joined.",
          },
        ],
      },
    },
  }),
  defineStandardRoom({
    id: "hiring",
    name: "interview-debrief",
    kind: "private",
    subtitle: "Private recruiting coordination",
    memberCount: 5,
    memberIds: ["avery", "cuvii"],
    story: {
      opening: {
        senderId: "avery",
        content:
          "The final interview loop is scheduled. Please add scorecards before tomorrow's debrief.",
      },
      reply: {
        senderId: "cuvii",
        content: "I added my notes and separated evidence from the hiring recommendation.",
      },
      thread: {
        replies: [
          {
            senderId: "avery",
            content:
              "The systems exercise showed strong tradeoff reasoning; the collaboration signal needs more evidence.",
          },
          {
            senderId: "cuvii",
            content:
              "I linked the relevant interview notes so the debrief can discuss each signal separately.",
          },
        ],
      },
    },
  }),
  defineStandardRoom({
    id: "exec",
    name: "q3-operating-review",
    kind: "private",
    subtitle: "Private leadership planning and decisions",
    memberCount: 4,
    memberIds: ["avery", "dataWeaver"],
    story: {
      opening: {
        senderId: "avery",
        content:
          "The Q3 review draft is ready. Retention and support load need updated commentary.",
      },
      reply: {
        senderId: "dataWeaver",
        content:
          "I refreshed the charts from the weekly dataset and annotated the two largest changes.",
      },
      updates: [
        {
          senderId: "dataWeaver",
          createdAt: "09:27 AM",
          unread: true,
          content:
            "The retention movement is concentrated in the new-workspace cohort, not the installed base.",
        },
        {
          senderId: "dataWeaver",
          createdAt: "09:31 AM",
          unread: true,
          content:
            "Support load rose around migration questions but stayed flat for standard onboarding.",
        },
        {
          senderId: "dataWeaver",
          createdAt: "09:35 AM",
          unread: true,
          content:
            "I separated launch-week volume from the recurring weekly trend in the appendix.",
        },
        {
          senderId: "dataWeaver",
          createdAt: "09:39 AM",
          unread: true,
          content:
            "The revised chart includes the confidence range requested in the leadership review.",
        },
        {
          senderId: "dataWeaver",
          createdAt: "09:43 AM",
          unread: true,
          content: "The operating note is ready for sign-off with the cohort caveat called out.",
        },
      ],
      thread: {
        replies: [
          {
            senderId: "avery",
            content:
              "Retention improved in small teams, while support load shifted toward migration questions.",
          },
          {
            senderId: "dataWeaver",
            content:
              "The operating note now separates durable product movement from launch-week volume.",
          },
        ],
      },
    },
  }),
  defineStandardRoom({
    id: "release-notes",
    name: "v2-4-release-control",
    navigation: { muted: true },
    subtitle: "Release coordination and changelog drafting",
    memberCount: 12,
    memberIds: ["ada", "atlas", "developer", "cuvii", "releaseScribe"],
    story: {
      opening: {
        senderId: "releaseScribe",
        content:
          "The v2.4 changelog draft is ready for final owner review. I grouped each entry by the user-visible outcome.",
      },
      reply: {
        senderId: "ada",
        content:
          "I verified the migration notes and added the fallback behavior to the release checklist.",
      },
      updates: [
        {
          senderId: "releaseScribe",
          createdAt: "09:33 AM",
          content:
            "The release branch is tagged for the final smoke test once the owner approvals land.",
        },
      ],
      thread: {
        replies: [
          {
            senderId: "cuvii",
            content:
              "Please keep the changelog examples concrete and avoid exposing internal component state names.",
          },
        ],
      },
    },
  }),
  defineStandardRoom({
    id: "random",
    name: "friday-demo-playlist",
    navigation: { muted: true, draft: true },
    subtitle: "Off-topic conversation and team miscellany",
    memberCount: 27,
    memberIds: ["cindy", "elliot"],
    story: {
      opening: {
        senderId: "cindy",
        content:
          "I made a playlist for Friday's demo session. Add anything that keeps the energy up.",
      },
      reply: {
        senderId: "elliot",
        content:
          "Added two instrumental tracks and moved the louder ones to the post-demo section.",
      },
      thread: {
        replies: [
          {
            senderId: "cindy",
            content:
              "The opening track should stay low-key while people join and set up their demos.",
          },
          {
            senderId: "elliot",
            content:
              "I reordered the list so the higher-energy section starts after the final presentation.",
          },
        ],
      },
    },
  }),
  defineStandardRoom({
    id: "design-crit",
    name: "playground-ia-critique",
    navigation: { mention: true },
    subtitle: "Structured critique for in-progress product work",
    memberCount: 9,
    memberIds: ["cindy", "mira"],
    story: {
      opening: {
        senderId: "cindy",
        content:
          "The shell works, but mock hierarchy breaks trust when rows do not change context.",
      },
      reply: {
        senderId: "mira",
        content: "The fix is one conversation registry shared by navigation, routes, and panels.",
      },
      thread: {
        replies: [
          {
            senderId: "cindy",
            content:
              "Changing channels must update the title, members, timeline, tasks, files, and open thread together.",
          },
          {
            senderId: "mira",
            content:
              "I documented those regions as one consistency check for the next critique pass.",
          },
        ],
      },
    },
  }),
  defineEmptyRoom({
    id: "standup",
    name: "async-standup-kickoff",
    navigation: { draft: true },
    subtitle: "A newly created channel for async updates",
    memberCount: 7,
    memberIds: ["cuvii", "atlas"],
  }),
  defineStandardRoom({
    id: "archive-ops",
    name: "channel-retention-sweep",
    subtitle: "Channel retention and archive operations",
    memberCount: 6,
    memberIds: ["samira", "atlas"],
    archived: true,
    story: {
      opening: {
        senderId: "samira",
        content:
          "The retention sweep found nine inactive channels. Owners have one week to review them.",
      },
      reply: {
        senderId: "atlas",
        content:
          "I generated a list with last activity, owner, and linked project for every channel.",
      },
      thread: {
        replies: [
          {
            senderId: "samira",
            content:
              "Three channels have active linked projects and should be exempt from this sweep.",
          },
          {
            senderId: "atlas",
            content: "I marked the exemptions and left the remaining six ready for owner review.",
          },
        ],
      },
    },
  }),
] as const;
