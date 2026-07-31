import { defineStandardRoom } from "./conversation-model.ts";

export const PLAYGROUND_JOINT_CONVERSATIONS = [
  defineStandardRoom({
    id: "partner-ops",
    name: "northstar-launch-handoff",
    navigation: { pinned: true },
    kind: "joint",
    subtitle: "Launch readiness with Northstar",
    memberCount: 8,
    memberIds: ["avery", "atlas"],
    story: {
      opening: {
        senderId: "avery",
        content:
          "Northstar confirmed the handoff window. I added the remaining owners to the shared runbook.",
      },
      reply: {
        senderId: "atlas",
        content:
          "I checked the dependencies and flagged the two items that still need partner approval.",
      },
      updates: [
        {
          senderId: "avery",
          createdAt: "09:27 AM",
          unread: true,
          content: "Northstar confirmed the data-import owner and added the handoff contact.",
        },
        {
          senderId: "atlas",
          createdAt: "09:31 AM",
          unread: true,
          content:
            "The rollback path now names both the decision owner and the partner escalation route.",
        },
        {
          senderId: "avery",
          createdAt: "09:35 AM",
          unread: true,
          content:
            "I moved the remaining approval into the shared launch checklist for tomorrow's checkpoint.",
        },
      ],
      thread: {
        replies: [
          {
            senderId: "avery",
            content:
              "Northstar still needs to confirm the data-import owner and the rollback contact.",
          },
          {
            senderId: "atlas",
            content: "Both approvals are now assigned in the runbook ahead of the handoff window.",
          },
        ],
      },
    },
  }),
  defineStandardRoom({
    id: "vendor-review",
    name: "acme-security-review",
    kind: "joint",
    subtitle: "Security and procurement with Acme Cloud",
    memberCount: 6,
    memberIds: ["samira", "atlas"],
    story: {
      opening: {
        senderId: "samira",
        content:
          "The vendor sent updated data-retention answers. Only the regional backup policy is unresolved.",
      },
      reply: {
        senderId: "atlas",
        savedAt: "Today, 09:52 AM",
        savedAtDateTime: "2026-07-27T09:52:00Z",
        content:
          "I compared this revision with the previous questionnaire and summarized the changed controls.",
      },
      thread: {
        replies: [
          {
            senderId: "samira",
            content:
              "The regional backup answer needs a retention period and deletion SLA before Security can sign off.",
          },
          {
            senderId: "atlas",
            content:
              "I asked Acme Cloud for both details and linked the request to the procurement review.",
          },
        ],
      },
    },
  }),
  defineStandardRoom({
    id: "community-lab",
    name: "maintainer-prototype-lab",
    navigation: { muted: true },
    kind: "joint",
    subtitle: "Prototype feedback with community maintainers",
    memberCount: 12,
    memberIds: ["cindy", "mira"],
    story: {
      opening: {
        senderId: "cindy",
        content:
          "The maintainers prefer compact navigation, but asked for clearer ownership on shared drafts.",
      },
      reply: {
        senderId: "mira",
        content:
          "I grouped the notes by workflow and linked each request to the corresponding prototype state.",
      },
      thread: {
        replies: [
          {
            senderId: "cindy",
            content:
              "The strongest request is a visible owner on drafts shared across multiple maintainer teams.",
          },
          {
            senderId: "mira",
            content:
              "I added that state to the next prototype pass without expanding the navigation density.",
          },
        ],
      },
    },
  }),
  defineStandardRoom({
    id: "shared-roadmap",
    name: "raft-northstar-q3",
    navigation: { mention: true, muted: true },
    kind: "joint",
    subtitle: "Quarterly planning across Raft and Northstar",
    memberCount: 15,
    memberIds: ["avery", "specWriter"],
    story: {
      opening: {
        senderId: "avery",
        content:
          "I merged both roadmap drafts and marked the milestones where sequencing still conflicts.",
      },
      reply: {
        senderId: "specWriter",
        savedAt: "Today, 09:26 AM",
        savedAtDateTime: "2026-07-27T09:26:00Z",
        content:
          "The brief now includes owners, confidence, and the decision date for every milestone.",
      },
      updates: [
        {
          senderId: "specWriter",
          createdAt: "09:28 AM",
          unread: true,
          content:
            "The Tuesday checkpoint now includes a decision note for the provisioning dependency.",
        },
      ],
      thread: {
        replies: [
          {
            senderId: "avery",
            content:
              "The remaining sequencing conflict is Northstar provisioning landing after Raft onboarding starts.",
          },
          {
            senderId: "specWriter",
            content:
              "I moved the joint decision to Tuesday and added both platform owners to the checkpoint.",
          },
        ],
      },
    },
  }),
  defineStandardRoom({
    id: "cross-team-qa",
    name: "partner-release-acceptance",
    navigation: { draft: true },
    kind: "joint",
    subtitle: "End-to-end verification with partner QA",
    memberCount: 9,
    memberIds: ["olivia", "qaSentinel"],
    story: {
      opening: {
        senderId: "olivia",
        content:
          "Desktop passed. Mobile still has one keyboard-navigation regression in the member picker.",
      },
      reply: {
        senderId: "qaSentinel",
        content:
          "I reproduced it on the shared fixture and attached the exact focus sequence to the QA note.",
      },
      thread: {
        replies: [
          {
            senderId: "olivia",
            content:
              "The focus skips the selected member only after the picker wraps onto two lines.",
          },
          {
            senderId: "qaSentinel",
            content: "Partner QA confirmed the reduced-width fixture reproduces it consistently.",
          },
        ],
      },
    },
  }),
  defineStandardRoom({
    id: "partner-launch",
    name: "friday-partner-rollout",
    kind: "joint",
    subtitle: "Coordinating Friday's partner rollout",
    memberCount: 18,
    memberIds: ["mateo", "deployWatch"],
    story: {
      opening: {
        senderId: "mateo",
        content: "The partner environment is ready. We can start after the 14:00 checkpoint.",
      },
      reply: {
        senderId: "deployWatch",
        content:
          "I am watching both deployment regions and will post here if configuration drift appears.",
      },
      updates: [
        {
          senderId: "mateo",
          createdAt: "09:28 AM",
          unread: true,
          content: "The first partner health probe is green in both regions.",
        },
        {
          senderId: "deployWatch",
          createdAt: "09:32 AM",
          unread: true,
          content: "Configuration hashes match the approved release candidate.",
        },
        {
          senderId: "mateo",
          createdAt: "09:36 AM",
          unread: true,
          content: "Northstar posted the final approval for the staged rollout.",
        },
        {
          senderId: "deployWatch",
          createdAt: "09:40 AM",
          unread: true,
          content: "The first traffic slice completed without retry growth or latency drift.",
        },
        {
          senderId: "mateo",
          createdAt: "09:44 AM",
          unread: true,
          content: "I expanded the rollout to the second cohort and recorded the checkpoint.",
        },
        {
          senderId: "deployWatch",
          createdAt: "09:48 AM",
          unread: true,
          content: "Both regions remain within the expected error budget after expansion.",
        },
        {
          senderId: "mateo",
          createdAt: "09:52 AM",
          unread: true,
          content: "The rollout is complete; I linked the partner handoff summary for review.",
        },
      ],
      thread: {
        replies: [
          {
            senderId: "mateo",
            content: "The 14:00 checkpoint now includes health probes from both partner regions.",
          },
          {
            senderId: "deployWatch",
            content:
              "No drift detected; the rollout can proceed once Northstar posts final approval.",
          },
        ],
      },
    },
  }),
] as const;
