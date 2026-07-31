import { defineStandardDm } from "./conversation-model.ts";

export const PLAYGROUND_DIRECT_MESSAGE_CONVERSATIONS = [
  defineStandardDm({
    id: "dm-noah",
    otherActorId: "noah",
    subtitle: "Growth experiments and activation metrics.",
    story: {
      opening: {
        senderId: "noah",
        content:
          "The shorter setup flow improved activation by six points in the small-team cohort.",
      },
      reply: {
        senderId: "cuvii",
        content:
          "That matches the interviews. Keep detailed configuration available after first success.",
      },
      updates: [
        {
          senderId: "noah",
          createdAt: "09:27 AM",
          unread: true,
          content: "The invite prompt is now the highest-converting step after workspace creation.",
        },
        {
          senderId: "noah",
          createdAt: "09:31 AM",
          unread: true,
          content:
            "Teams that skip it still reach activation, but they take an extra session to get there.",
        },
        {
          senderId: "noah",
          createdAt: "09:36 AM",
          unread: true,
          content:
            "I separated the effect from campaign traffic so it is not a source-mix artifact.",
        },
        {
          senderId: "noah",
          createdAt: "09:40 AM",
          unread: true,
          content: "The strongest cohort is new workspaces with two to five members.",
        },
        {
          senderId: "noah",
          createdAt: "09:44 AM",
          unread: true,
          content:
            "Larger teams respond better when an owner completes setup before sending invitations.",
        },
        {
          senderId: "noah",
          createdAt: "09:48 AM",
          unread: true,
          content: "I added the breakdown to the experiment note with confidence intervals.",
        },
        {
          senderId: "noah",
          createdAt: "09:53 AM",
          unread: true,
          content: "There is no retention regression in the early-access cohort so far.",
        },
        {
          senderId: "noah",
          createdAt: "09:57 AM",
          unread: true,
          content: "One caveat: mobile completion is still below desktop after the first invite.",
        },
        {
          senderId: "noah",
          createdAt: "10:01 AM",
          unread: true,
          content: "I opened a follow-up for the smaller-screen invitation layout.",
        },
        {
          senderId: "noah",
          createdAt: "10:05 AM",
          unread: true,
          content:
            "The next readout will include day-seven activation, not just first-session success.",
        },
        {
          senderId: "noah",
          createdAt: "10:09 AM",
          unread: true,
          content:
            "I tagged the customers who mentioned configuration anxiety in their interviews.",
        },
        {
          senderId: "noah",
          createdAt: "10:13 AM",
          unread: true,
          content:
            "Those notes support keeping advanced settings available without putting them in the critical path.",
        },
      ],
      thread: {
        replies: [
          {
            senderId: "noah",
            content:
              "The lift is strongest when teams invite a second member before seeing advanced setup.",
          },
          {
            senderId: "cuvii",
            content:
              "I will keep that invitation in the guided path and move configuration behind the success moment.",
          },
        ],
      },
    },
  }),
  defineStandardDm({
    id: "dm-samira",
    otherActorId: "samira",
    subtitle: "Security review and access policy.",
    story: {
      opening: {
        senderId: "samira",
        content:
          "The role matrix is sound. Revoked guest access should remain visible in the audit log.",
      },
      reply: {
        senderId: "cuvii",
        content: "Agreed. I will add the expected audit event to the acceptance criteria.",
      },
      thread: {
        replies: [
          {
            senderId: "samira",
            content:
              "The event should include the actor, workspace, previous role, and revocation source.",
          },
          {
            senderId: "cuvii",
            content: "I added those fields without exposing the guest's private profile data.",
          },
        ],
      },
    },
  }),
  defineStandardDm({
    id: "dm-elliot",
    otherActorId: "elliot",
    subtitle: "Developer experience and local tooling.",
    story: {
      opening: {
        senderId: "elliot",
        content:
          "Fresh setup is down to four minutes. The first docs install is the remaining delay.",
      },
      reply: {
        senderId: "cuvii",
        content: "Nice. I will document the cached path separately so the baseline stays honest.",
      },
      updates: [
        {
          senderId: "elliot",
          createdAt: "09:29 AM",
          unread: true,
          content:
            "I added a cold-start trace so the generated-assets step is visible in the setup report.",
        },
        {
          senderId: "cuvii",
          createdAt: "09:32 AM",
          content: "I added the cold-start trace to the bootstrap guide and sent it for review.",
          readReceipt: { kind: "read", readAt: "09:34 AM" },
          savedAt: "Today, 09:35 AM",
          savedAtDateTime: "2026-07-27T09:35:00Z",
        },
      ],
      thread: {
        replies: [
          {
            senderId: "elliot",
            content:
              "The cold install spends most of its time generating docs assets on the first run.",
          },
          {
            senderId: "cuvii",
            content:
              "I split cold and cached timings in the bootstrap guide and noted the generated-assets step.",
          },
        ],
      },
    },
  }),
  defineStandardDm({
    id: "dm-claude",
    navigation: { pinned: true },
    otherActorId: "claudeAssistant",
    subtitle: "Planning on the primary online machine.",
    story: {
      opening: {
        senderId: "claudeAssistant",
        content:
          "The fixture audit is complete. Two component states drifted from source behavior.",
      },
      reply: {
        senderId: "cuvii",
        content: "Send me the exact files and I will re-sync them before the release cut.",
      },
      updates: [
        {
          senderId: "claudeAssistant",
          createdAt: "09:30 AM",
          unread: true,
          content:
            "I posted both source paths and the expected DOM snapshots in the fixture audit.",
        },
      ],
      thread: {
        replies: [
          {
            senderId: "claudeAssistant",
            content:
              "The drift is limited to the loading attachment indicator and the unread thread badge.",
          },
          {
            senderId: "cuvii",
            content:
              "I have the two source callsites; I will preserve their DOM while updating the current fixtures.",
          },
        ],
      },
    },
  }),
  defineStandardDm({
    id: "dm-olivia",
    otherActorId: "olivia",
    subtitle: "QA lead for desktop and mobile.",
    story: {
      opening: {
        senderId: "olivia",
        content:
          "Mobile is clean except for the thread close target at the smallest supported width.",
      },
      reply: {
        senderId: "cuvii",
        content:
          "I will check the composed button size and keep the fix local to responsive chrome.",
      },
      updates: [
        {
          senderId: "olivia",
          createdAt: "09:31 AM",
          unread: true,
          content:
            "I attached the 320px reproduction and the keyboard sequence that makes the close target fail.",
        },
      ],
      thread: {
        replies: [
          {
            senderId: "olivia",
            content:
              "At 320 pixels the visible icon is fine, but the pointer target contracts below the minimum.",
          },
          {
            senderId: "cuvii",
            content: "I will preserve the icon size and expand only the responsive hit area.",
          },
        ],
      },
    },
  }),
  defineStandardDm({
    id: "dm-mateo",
    otherActorId: "mateo",
    subtitle: "Infrastructure and staging deploys.",
    story: {
      opening: {
        senderId: "mateo",
        content:
          "Staging is refreshed with today's schema. The worker is finishing its replay now.",
      },
      reply: {
        senderId: "cuvii",
        content: "Perfect. I will wait for the checkpoint before starting product verification.",
      },
      updates: [
        {
          senderId: "mateo",
          createdAt: "09:32 AM",
          unread: true,
          content:
            "The replay finished cleanly; the checkpoint and worker health summary are ready.",
        },
      ],
      thread: {
        replies: [
          {
            senderId: "mateo",
            content: "Replay is at ninety-two percent with no dead-letter growth or schema errors.",
          },
          {
            senderId: "cuvii",
            content:
              "I will start verification after the final checkpoint and keep production untouched.",
          },
        ],
      },
    },
  }),
  defineStandardDm({
    id: "dm-search",
    otherActorId: "searchScout",
    subtitle: "Idle — ready for a new research query.",
    story: {
      opening: {
        senderId: "searchScout",
        content: "I indexed the source component callsites and grouped them by product capability.",
      },
      reply: {
        senderId: "cuvii",
        content: "Keep the result handy. We will use it for the next migration batch.",
      },
      thread: {
        replies: [
          {
            senderId: "searchScout",
            content:
              "Message attachments and thread controls have the widest callsite coverage in the next batch.",
          },
          {
            senderId: "cuvii",
            content:
              "Save those groups with their source paths so we can inventory them before choosing an API.",
          },
        ],
      },
    },
  }),
  defineStandardDm({
    id: "dm-release",
    otherActorId: "releaseScribe",
    subtitle: "Drafting release notes and changelogs.",
    story: {
      opening: {
        senderId: "releaseScribe",
        content: "The changelog draft separates user-visible improvements from maintenance.",
      },
      reply: {
        senderId: "cuvii",
        content: "Tighten the first item around workflow improvement, not implementation detail.",
      },
      updates: [
        {
          senderId: "releaseScribe",
          createdAt: "09:33 AM",
          unread: true,
          content:
            "Updated — the opening now leads with faster thread triage and cites the measurable outcome.",
        },
      ],
      thread: {
        replies: [
          {
            senderId: "releaseScribe",
            content:
              "I rewrote it around faster thread triage and moved the selector refactor to maintenance.",
          },
          {
            senderId: "cuvii",
            content:
              "That framing is clearer; keep the measurable workflow result in the opening sentence.",
          },
        ],
      },
    },
  }),
  defineStandardDm({
    id: "dm-code-pilot",
    otherActorId: "codePilot",
    subtitle: "Active — refactoring the auth module.",
    story: {
      opening: {
        senderId: "codePilot",
        content: "Session validation no longer leaks into presentation components.",
      },
      reply: {
        senderId: "cuvii",
        content: "Verify redirect behavior for expired and revoked sessions separately.",
      },
      updates: [
        {
          senderId: "codePilot",
          createdAt: "09:29 AM",
          unread: true,
          content: "Expired sessions now preserve the intended destination after sign-in.",
        },
        {
          senderId: "codePilot",
          createdAt: "09:33 AM",
          unread: true,
          content: "Revoked sessions clear cached permissions before the redirect runs.",
        },
        {
          senderId: "codePilot",
          createdAt: "09:37 AM",
          unread: true,
          content: "I added route-level coverage for both paths and the stale-token boundary.",
        },
      ],
      thread: {
        replies: [
          {
            senderId: "codePilot",
            content:
              "Expired sessions return to sign-in with continuation, while revoked sessions clear local state first.",
          },
          {
            senderId: "cuvii",
            content: "I will cover both flows and keep the redirect policy at the route boundary.",
          },
        ],
      },
    },
  }),
  defineStandardDm({
    id: "dm-incident-triage",
    otherActorId: "incidentTriage",
    subtitle: "Offline — last incident run two hours ago.",
    story: {
      opening: {
        senderId: "incidentTriage",
        content:
          "The incident is resolved. Queue depth returned to baseline after the retry change.",
      },
      reply: {
        senderId: "cuvii",
        content: "Add the detection gap and follow-up alert owner to the final summary.",
      },
      thread: {
        replies: [
          {
            senderId: "incidentTriage",
            content:
              "The existing alert fired on failures but missed sustained retry latency before the queue spiked.",
          },
          {
            senderId: "cuvii",
            content:
              "I assigned the latency alert to Infrastructure and added its threshold to the postmortem.",
          },
        ],
      },
    },
  }),
  defineStandardDm({
    id: "dm-qa-sentinel",
    otherActorId: "qaSentinel",
    subtitle: "Regression checks and focused test plans.",
    story: {
      opening: {
        senderId: "qaSentinel",
        content: "I prepared the app-shell plan across route, theme, resize, and thread states.",
      },
      reply: {
        senderId: "cuvii",
        content: "Prioritize route ownership and data consistency; visual coverage can follow.",
      },
      updates: [
        {
          senderId: "qaSentinel",
          createdAt: "09:28 AM",
          unread: true,
          content:
            "The route matrix now covers direct links, invalid thread IDs, and channel changes.",
        },
        {
          senderId: "qaSentinel",
          createdAt: "09:32 AM",
          unread: true,
          content:
            "Header, task, and file fixtures are checked against the active conversation ID.",
        },
        {
          senderId: "qaSentinel",
          createdAt: "09:36 AM",
          unread: true,
          content:
            "I separated desktop resize coverage from keyboard navigation to keep failures attributable.",
        },
        {
          senderId: "qaSentinel",
          createdAt: "09:40 AM",
          unread: true,
          content: "The first run found no cross-channel thread fallback after route cleanup.",
        },
        {
          senderId: "qaSentinel",
          createdAt: "09:44 AM",
          unread: true,
          content:
            "I queued the visual pass after the data assertions so it can focus on layout only.",
        },
      ],
      thread: {
        replies: [
          {
            senderId: "qaSentinel",
            content:
              "The first pass will verify stale thread cleanup and channel-owned header, task, and file data.",
          },
          {
            senderId: "cuvii",
            content:
              "Good. Keep theme and viewport checks separate so failures point to one ownership boundary.",
          },
        ],
      },
    },
  }),
  defineStandardDm({
    id: "dm-deploy-watch",
    navigation: { mention: true },
    otherActorId: "deployWatch",
    subtitle: "Working — staging drift detected in us-east.",
    story: {
      opening: {
        senderId: "deployWatch",
        content:
          "Staging in us-east is missing the message-retention variable. Production is aligned.",
      },
      reply: {
        senderId: "cuvii",
        content: "Patch staging only and post the environment diff before restarting the worker.",
      },
      updates: [
        {
          senderId: "deployWatch",
          createdAt: "09:30 AM",
          unread: true,
          content:
            "The missing variable is restored in staging and the worker restarted with a healthy checkpoint.",
        },
      ],
      thread: {
        replies: [
          {
            senderId: "deployWatch",
            content:
              "The diff confirms one missing variable; image and worker versions match the other region.",
          },
          {
            senderId: "cuvii",
            content:
              "Apply that single-value patch and capture a healthy worker checkpoint after restart.",
          },
        ],
      },
    },
  }),
  defineStandardDm({
    id: "dm-research-lark",
    navigation: { muted: true },
    otherActorId: "researchLark",
    subtitle: "Idle — market research summaries available.",
    story: {
      opening: {
        senderId: "researchLark",
        content: "The research summary separates findings by team size and collaboration model.",
      },
      reply: {
        senderId: "cuvii",
        content: "Keep source links attached so we can validate the strongest claims quickly.",
      },
      thread: {
        replies: [
          {
            senderId: "researchLark",
            content:
              "The clearest pattern is that external collaboration needs explicit ownership more than extra hierarchy.",
          },
          {
            senderId: "cuvii",
            content:
              "I attached the three interviews and two product references supporting that conclusion.",
          },
        ],
      },
    },
  }),
  defineStandardDm({
    id: "dm-spec-writer",
    navigation: { draft: true },
    otherActorId: "specWriter",
    subtitle: "Idle — product requirement drafts available.",
    story: {
      opening: {
        senderId: "specWriter",
        content: "Every sidebar entity now resolves to one canonical conversation record.",
      },
      reply: {
        senderId: "cuvii",
        content: "Thread content and DM presence should resolve from those same records.",
      },
      thread: {
        replies: [
          {
            senderId: "specWriter",
            content:
              "I specified stable IDs for routes and actor-backed DM metadata for presence and display names.",
          },
          {
            senderId: "cuvii",
            content:
              "Add invariant checks for duplicate channels and cross-channel thread lookup to finish the contract.",
          },
        ],
      },
    },
  }),
  defineStandardDm({
    id: "dm-data-weaver",
    otherActorId: "dataWeaver",
    subtitle: "Working — synthesizing weekly metrics.",
    story: {
      opening: {
        senderId: "dataWeaver",
        content:
          "Weekly metrics are reconciled. Activation improved while support contacts stayed flat.",
      },
      reply: {
        senderId: "cuvii",
        content: "Break out the new-workspace cohort to see whether setup changes drove the lift.",
      },
      thread: {
        replies: [
          {
            senderId: "dataWeaver",
            content:
              "New workspaces account for most of the activation gain; established teams are unchanged.",
          },
          {
            senderId: "cuvii",
            content:
              "Annotate the cohort boundary so the weekly summary does not imply a broad retention shift.",
          },
        ],
      },
    },
  }),
  defineStandardDm({
    id: "dm-support-guide",
    otherActorId: "supportGuide",
    subtitle: "Idle — customer support playbooks available.",
    story: {
      opening: {
        senderId: "supportGuide",
        content: "The launch playbook covers access, migration, and notification questions.",
      },
      reply: {
        senderId: "cuvii",
        content: "Add diagnostics for customers whose shared channels do not appear after joining.",
      },
      updates: [
        {
          senderId: "supportGuide",
          createdAt: "09:34 AM",
          unread: true,
          content:
            "The revised playbook now links the escalation bundle directly from the discovery checklist.",
        },
        {
          senderId: "supportGuide",
          createdAt: "09:38 AM",
          unread: true,
          content:
            "I added an example for a partner approval that is pending but not visibly blocked.",
        },
      ],
      thread: {
        replies: [
          {
            senderId: "supportGuide",
            content:
              "Support should first confirm workspace membership, partner approval, and sidebar visibility filters.",
          },
          {
            senderId: "cuvii",
            content:
              "I added that sequence plus the escalation bundle for cases that still fail discovery.",
          },
        ],
      },
    },
  }),
] as const;
