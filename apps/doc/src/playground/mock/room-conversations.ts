import { defineEmptyRoom, defineStandardRoom } from "./conversation-model.ts";
import { RAFT_UI_MIGRATION_THREADS } from "./raft-ui-migration-threads.ts";
export const PLAYGROUND_ROOM_CONVERSATIONS = [
  defineStandardRoom({
    id: "all",
    name: "raft-ui-migration",
    subtitle: "Company-wide announcements and shared updates",
    memberCount: 42,
    memberIds: ["developer", "atlas", "ada", "cindy", "cuvii", "samira"],
    threads: RAFT_UI_MIGRATION_THREADS,
    story: {
      opening: {
        senderId: "developer",
        content:
          "The migration plan is ready for review in #raft-ui-migration. Remaining work: keep the message and thread data model coherent for @Atlas and task #21.",
      },
      reply: {
        senderId: "cuvii",
        content:
          "I am reviewing the mock conversation flow now so every panel reads the same data — including markdown refs and consecutive compact rows.",
      },
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
