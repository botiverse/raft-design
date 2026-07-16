import { defineEmptyRoom, defineShowcaseRoom, defineStandardRoom } from "./conversation-model.ts";
import { ALL_SHOWCASE_THREADS } from "./showcase-threads.ts";
export const PLAYGROUND_ROOM_CHANNELS = [
  defineShowcaseRoom({
    id: "all",
    name: "raft-ui-migration",
    preset: "rich",
    subtitle: "Company-wide announcements and shared updates",
    memberCount: 42,
    memberIds: ["developer", "atlas", "ada", "cindy", "cuvii", "samira"],
    threads: ALL_SHOWCASE_THREADS,
  }),
  defineStandardRoom({
    id: "general",
    name: "weekly-priorities",
    subtitle: "Team-wide product and engineering discussion",
    memberCount: 31,
    memberIds: ["avery", "cuvii"],
    story: {
      opening: {
        authorId: "avery",
        body: "I posted the weekly priorities and called out the decisions that need owners by tomorrow.",
      },
      reply: {
        authorId: "cuvii",
        body: "I claimed the playground data pass and added the dependency notes to the planning doc.",
        reactions: [
          { emoji: "👍", count: 1, reactorIds: ["avery"] },
          { emoji: "👀", count: 1, reactorIds: ["avery"] },
        ],
      },
      thread: {
        replies: [
          {
            authorId: "avery",
            body: "The data pass blocks sidebar sign-off, so I moved it ahead of the notification polish.",
          },
          {
            authorId: "cuvii",
            body: "That ordering is reflected in the weekly plan and tomorrow's owner check-in.",
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
        authorId: "cindy",
        body: "The sidebar states are aligned. I still want a pass on empty, muted, and unread combinations.",
      },
      reply: {
        authorId: "mira",
        body: "I prepared a coverage matrix and highlighted states without realistic content.",
      },
      updates: [
        {
          authorId: "mira",
          time: "09:29 AM",
          unread: true,
          body: "The revised matrix now ties every visible badge to an actual message or thread state.",
        },
      ],
      thread: {
        replies: [
          {
            authorId: "cindy",
            body: "Muted plus unread is the only combination whose hierarchy still feels ambiguous.",
          },
          {
            authorId: "mira",
            body: "I added realistic copy for that row and kept the unread count visible but quiet.",
          },
        ],
      },
    },
  }),
  defineShowcaseRoom({
    id: "incidents",
    name: "webhook-retry-incident",
    preset: "incident",
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
  }),
  defineStandardRoom({
    id: "launch",
    name: "public-launch-readiness",
    subtitle: "Launch checklist, messaging, and rollout status",
    memberCount: 17,
    memberIds: ["avery", "releaseScribe"],
    story: {
      opening: {
        authorId: "avery",
        body: "The launch checklist is at 86%. Pricing copy and the support handoff remain.",
      },
      reply: {
        authorId: "releaseScribe",
        body: "I updated the launch brief and drafted the handoff note for Support to review.",
      },
      updates: [
        {
          authorId: "releaseScribe",
          time: "09:28 AM",
          unread: true,
          body: "Support approved the migration fallback wording and assigned launch-day coverage.",
        },
        {
          authorId: "releaseScribe",
          time: "09:32 AM",
          unread: true,
          body: "The remaining pricing review is scheduled before the public announcement window.",
        },
      ],
      thread: {
        replies: [
          {
            authorId: "avery",
            body: "Support needs the migration fallback and the billing escalation path before approving the handoff.",
          },
          {
            authorId: "releaseScribe",
            body: "Both paths are in the draft now, with owners for launch day coverage.",
          },
        ],
      },
    },
  }),
  defineShowcaseRoom({
    id: "frontend",
    name: "message-state-lab",
    preset: "matrix",
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
  }),
  defineStandardRoom({
    id: "customer-notes",
    name: "shared-channel-research",
    subtitle: "Interview notes and customer follow-ups",
    memberCount: 10,
    memberIds: ["noah", "researchLark"],
    story: {
      opening: {
        authorId: "noah",
        body: "Three teams asked for clearer separation between shared channels and internal project rooms.",
      },
      reply: {
        authorId: "researchLark",
        body: "I clustered the interviews and added supporting quotes to the navigation findings.",
      },
      updates: [
        {
          authorId: "researchLark",
          time: "09:27 AM",
          unread: true,
          body: "The new-member interviews consistently ask who owns a shared room before they ask about permissions.",
        },
        {
          authorId: "researchLark",
          time: "09:31 AM",
          unread: true,
          body: "I added that wording to the onboarding recommendation with the supporting excerpts.",
        },
      ],
      thread: {
        replies: [
          {
            authorId: "noah",
            body: "Admins understand the distinction, but new members confuse partner rooms with internal projects.",
          },
          {
            authorId: "researchLark",
            body: "I added onboarding language that explains ownership before the first shared channel is joined.",
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
        authorId: "avery",
        body: "The final interview loop is scheduled. Please add scorecards before tomorrow's debrief.",
      },
      reply: {
        authorId: "cuvii",
        body: "I added my notes and separated evidence from the hiring recommendation.",
      },
      thread: {
        replies: [
          {
            authorId: "avery",
            body: "The systems exercise showed strong tradeoff reasoning; the collaboration signal needs more evidence.",
          },
          {
            authorId: "cuvii",
            body: "I linked the relevant interview notes so the debrief can discuss each signal separately.",
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
        authorId: "avery",
        body: "The Q3 review draft is ready. Retention and support load need updated commentary.",
      },
      reply: {
        authorId: "dataWeaver",
        body: "I refreshed the charts from the weekly dataset and annotated the two largest changes.",
      },
      updates: [
        {
          authorId: "dataWeaver",
          time: "09:27 AM",
          unread: true,
          body: "The retention movement is concentrated in the new-workspace cohort, not the installed base.",
        },
        {
          authorId: "dataWeaver",
          time: "09:31 AM",
          unread: true,
          body: "Support load rose around migration questions but stayed flat for standard onboarding.",
        },
        {
          authorId: "dataWeaver",
          time: "09:35 AM",
          unread: true,
          body: "I separated launch-week volume from the recurring weekly trend in the appendix.",
        },
        {
          authorId: "dataWeaver",
          time: "09:39 AM",
          unread: true,
          body: "The revised chart includes the confidence range requested in the leadership review.",
        },
        {
          authorId: "dataWeaver",
          time: "09:43 AM",
          unread: true,
          body: "The operating note is ready for sign-off with the cohort caveat called out.",
        },
      ],
      thread: {
        replies: [
          {
            authorId: "avery",
            body: "Retention improved in small teams, while support load shifted toward migration questions.",
          },
          {
            authorId: "dataWeaver",
            body: "The operating note now separates durable product movement from launch-week volume.",
          },
        ],
      },
    },
  }),
  defineShowcaseRoom({
    id: "release-notes",
    name: "v2-4-release-control",
    preset: "release",
    navigation: { muted: true },
    subtitle: "Release coordination and changelog drafting",
    memberCount: 12,
    memberIds: ["ada", "atlas", "developer", "cuvii", "releaseScribe"],
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
        authorId: "cindy",
        body: "I made a playlist for Friday's demo session. Add anything that keeps the energy up.",
      },
      reply: {
        authorId: "elliot",
        body: "Added two instrumental tracks and moved the louder ones to the post-demo section.",
      },
      thread: {
        replies: [
          {
            authorId: "cindy",
            body: "The opening track should stay low-key while people join and set up their demos.",
          },
          {
            authorId: "elliot",
            body: "I reordered the list so the higher-energy section starts after the final presentation.",
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
        authorId: "cindy",
        body: "The shell works, but mock hierarchy breaks trust when rows do not change context.",
      },
      reply: {
        authorId: "mira",
        body: "The fix is one conversation registry shared by navigation, routes, and panels.",
      },
      thread: {
        replies: [
          {
            authorId: "cindy",
            body: "Changing channels must update the title, members, timeline, tasks, files, and open thread together.",
          },
          {
            authorId: "mira",
            body: "I documented those regions as one consistency check for the next critique pass.",
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
        authorId: "samira",
        body: "The retention sweep found nine inactive channels. Owners have one week to review them.",
      },
      reply: {
        authorId: "atlas",
        body: "I generated a list with last activity, owner, and linked project for every channel.",
      },
      thread: {
        replies: [
          {
            authorId: "samira",
            body: "Three channels have active linked projects and should be exempt from this sweep.",
          },
          {
            authorId: "atlas",
            body: "I marked the exemptions and left the remaining six ready for owner review.",
          },
        ],
      },
    },
  }),
] as const;
