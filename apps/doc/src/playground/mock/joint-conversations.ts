import { defineStandardRoom } from "./conversation-model.ts";

export const PLAYGROUND_JOINT_CHANNELS = [
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
        authorId: "avery",
        body: "Northstar confirmed the handoff window. I added the remaining owners to the shared runbook.",
      },
      reply: {
        authorId: "atlas",
        body: "I checked the dependencies and flagged the two items that still need partner approval.",
      },
      updates: [
        {
          authorId: "avery",
          time: "09:27 AM",
          unread: true,
          body: "Northstar confirmed the data-import owner and added the handoff contact.",
        },
        {
          authorId: "atlas",
          time: "09:31 AM",
          unread: true,
          body: "The rollback path now names both the decision owner and the partner escalation route.",
        },
        {
          authorId: "avery",
          time: "09:35 AM",
          unread: true,
          body: "I moved the remaining approval into the shared launch checklist for tomorrow's checkpoint.",
        },
      ],
      thread: {
        replies: [
          {
            authorId: "avery",
            body: "Northstar still needs to confirm the data-import owner and the rollback contact.",
          },
          {
            authorId: "atlas",
            body: "Both approvals are now assigned in the runbook ahead of the handoff window.",
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
        authorId: "samira",
        body: "The vendor sent updated data-retention answers. Only the regional backup policy is unresolved.",
      },
      reply: {
        authorId: "atlas",
        body: "I compared this revision with the previous questionnaire and summarized the changed controls.",
      },
      thread: {
        replies: [
          {
            authorId: "samira",
            body: "The regional backup answer needs a retention period and deletion SLA before Security can sign off.",
          },
          {
            authorId: "atlas",
            body: "I asked Acme Cloud for both details and linked the request to the procurement review.",
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
        authorId: "cindy",
        body: "The maintainers prefer compact navigation, but asked for clearer ownership on shared drafts.",
      },
      reply: {
        authorId: "mira",
        body: "I grouped the notes by workflow and linked each request to the corresponding prototype state.",
      },
      thread: {
        replies: [
          {
            authorId: "cindy",
            body: "The strongest request is a visible owner on drafts shared across multiple maintainer teams.",
          },
          {
            authorId: "mira",
            body: "I added that state to the next prototype pass without expanding the navigation density.",
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
        authorId: "avery",
        body: "I merged both roadmap drafts and marked the milestones where sequencing still conflicts.",
      },
      reply: {
        authorId: "specWriter",
        body: "The brief now includes owners, confidence, and the decision date for every milestone.",
      },
      updates: [
        {
          authorId: "specWriter",
          time: "09:28 AM",
          unread: true,
          body: "The Tuesday checkpoint now includes a decision note for the provisioning dependency.",
        },
      ],
      thread: {
        replies: [
          {
            authorId: "avery",
            body: "The remaining sequencing conflict is Northstar provisioning landing after Raft onboarding starts.",
          },
          {
            authorId: "specWriter",
            body: "I moved the joint decision to Tuesday and added both platform owners to the checkpoint.",
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
        authorId: "olivia",
        body: "Desktop passed. Mobile still has one keyboard-navigation regression in the member picker.",
      },
      reply: {
        authorId: "qaSentinel",
        body: "I reproduced it on the shared fixture and attached the exact focus sequence to the QA note.",
      },
      thread: {
        replies: [
          {
            authorId: "olivia",
            body: "The focus skips the selected member only after the picker wraps onto two lines.",
          },
          {
            authorId: "qaSentinel",
            body: "Partner QA confirmed the reduced-width fixture reproduces it consistently.",
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
        authorId: "mateo",
        body: "The partner environment is ready. We can start after the 14:00 checkpoint.",
      },
      reply: {
        authorId: "deployWatch",
        body: "I am watching both deployment regions and will post here if configuration drift appears.",
      },
      updates: [
        {
          authorId: "mateo",
          time: "09:28 AM",
          unread: true,
          body: "The first partner health probe is green in both regions.",
        },
        {
          authorId: "deployWatch",
          time: "09:32 AM",
          unread: true,
          body: "Configuration hashes match the approved release candidate.",
        },
        {
          authorId: "mateo",
          time: "09:36 AM",
          unread: true,
          body: "Northstar posted the final approval for the staged rollout.",
        },
        {
          authorId: "deployWatch",
          time: "09:40 AM",
          unread: true,
          body: "The first traffic slice completed without retry growth or latency drift.",
        },
        {
          authorId: "mateo",
          time: "09:44 AM",
          unread: true,
          body: "I expanded the rollout to the second cohort and recorded the checkpoint.",
        },
        {
          authorId: "deployWatch",
          time: "09:48 AM",
          unread: true,
          body: "Both regions remain within the expected error budget after expansion.",
        },
        {
          authorId: "mateo",
          time: "09:52 AM",
          unread: true,
          body: "The rollout is complete; I linked the partner handoff summary for review.",
        },
      ],
      thread: {
        replies: [
          {
            authorId: "mateo",
            body: "The 14:00 checkpoint now includes health probes from both partner regions.",
          },
          {
            authorId: "deployWatch",
            body: "No drift detected; the rollout can proceed once Northstar posts final approval.",
          },
        ],
      },
    },
  }),
] as const;
