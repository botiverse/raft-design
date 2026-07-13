import { defineStandardDm } from "./conversation-model.ts";

export const PLAYGROUND_DIRECT_MESSAGES = [
  defineStandardDm({
    id: "dm-noah",
    navigation: { badge: "12" },
    otherActorId: "noah",
    subtitle: "Growth experiments and activation metrics.",
    story: {
      opening: {
        authorId: "noah",
        body: "The shorter setup flow improved activation by six points in the small-team cohort.",
      },
      reply: {
        authorId: "cuvii",
        body: "That matches the interviews. Keep detailed configuration available after first success.",
      },
      thread: {
        replies: [
          {
            authorId: "noah",
            body: "The lift is strongest when teams invite a second member before seeing advanced setup.",
          },
          {
            authorId: "cuvii",
            body: "I will keep that invitation in the guided path and move configuration behind the success moment.",
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
        authorId: "samira",
        body: "The role matrix is sound. Revoked guest access should remain visible in the audit log.",
      },
      reply: {
        authorId: "cuvii",
        body: "Agreed. I will add the expected audit event to the acceptance criteria.",
      },
      thread: {
        replies: [
          {
            authorId: "samira",
            body: "The event should include the actor, workspace, previous role, and revocation source.",
          },
          {
            authorId: "cuvii",
            body: "I added those fields without exposing the guest's private profile data.",
          },
        ],
      },
    },
  }),
  defineStandardDm({
    id: "dm-elliot",
    navigation: { badge: "1" },
    otherActorId: "elliot",
    subtitle: "Developer experience and local tooling.",
    story: {
      opening: {
        authorId: "elliot",
        body: "Fresh setup is down to four minutes. The first docs install is the remaining delay.",
      },
      reply: {
        authorId: "cuvii",
        body: "Nice. I will document the cached path separately so the baseline stays honest.",
      },
      thread: {
        replies: [
          {
            authorId: "elliot",
            body: "The cold install spends most of its time generating docs assets on the first run.",
          },
          {
            authorId: "cuvii",
            body: "I split cold and cached timings in the bootstrap guide and noted the generated-assets step.",
          },
        ],
      },
    },
  }),
  defineStandardDm({
    id: "dm-claude",
    navigation: { badge: "1", unread: true, pinned: true },
    otherActorId: "claudeAssistant",
    subtitle: "Planning on the primary online machine.",
    story: {
      opening: {
        authorId: "claudeAssistant",
        body: "The fixture audit is complete. Two component states drifted from source behavior.",
      },
      reply: {
        authorId: "cuvii",
        body: "Send me the exact files and I will re-sync them before the release cut.",
      },
      thread: {
        replies: [
          {
            authorId: "claudeAssistant",
            body: "The drift is limited to the loading attachment indicator and the unread thread badge.",
          },
          {
            authorId: "cuvii",
            body: "I have the two source callsites; I will preserve their DOM while updating the current fixtures.",
          },
        ],
      },
    },
  }),
  defineStandardDm({
    id: "dm-olivia",
    navigation: { badge: "1" },
    otherActorId: "olivia",
    subtitle: "QA lead for desktop and mobile.",
    story: {
      opening: {
        authorId: "olivia",
        body: "Mobile is clean except for the thread close target at the smallest supported width.",
      },
      reply: {
        authorId: "cuvii",
        body: "I will check the composed button size and keep the fix local to responsive chrome.",
      },
      thread: {
        replies: [
          {
            authorId: "olivia",
            body: "At 320 pixels the visible icon is fine, but the pointer target contracts below the minimum.",
          },
          {
            authorId: "cuvii",
            body: "I will preserve the icon size and expand only the responsive hit area.",
          },
        ],
      },
    },
  }),
  defineStandardDm({
    id: "dm-mateo",
    navigation: { badge: "1" },
    otherActorId: "mateo",
    subtitle: "Infrastructure and staging deploys.",
    story: {
      opening: {
        authorId: "mateo",
        body: "Staging is refreshed with today's schema. The worker is finishing its replay now.",
      },
      reply: {
        authorId: "cuvii",
        body: "Perfect. I will wait for the checkpoint before starting product verification.",
      },
      thread: {
        replies: [
          {
            authorId: "mateo",
            body: "Replay is at ninety-two percent with no dead-letter growth or schema errors.",
          },
          {
            authorId: "cuvii",
            body: "I will start verification after the final checkpoint and keep production untouched.",
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
        authorId: "searchScout",
        body: "I indexed the source component callsites and grouped them by product capability.",
      },
      reply: {
        authorId: "cuvii",
        body: "Keep the result handy. We will use it for the next migration batch.",
      },
      thread: {
        replies: [
          {
            authorId: "searchScout",
            body: "Message attachments and thread controls have the widest callsite coverage in the next batch.",
          },
          {
            authorId: "cuvii",
            body: "Save those groups with their source paths so we can inventory them before choosing an API.",
          },
        ],
      },
    },
  }),
  defineStandardDm({
    id: "dm-release",
    navigation: { badge: "1" },
    otherActorId: "releaseScribe",
    subtitle: "Drafting release notes and changelogs.",
    story: {
      opening: {
        authorId: "releaseScribe",
        body: "The changelog draft separates user-visible improvements from maintenance.",
      },
      reply: {
        authorId: "cuvii",
        body: "Tighten the first item around workflow improvement, not implementation detail.",
      },
      thread: {
        replies: [
          {
            authorId: "releaseScribe",
            body: "I rewrote it around faster thread triage and moved the selector refactor to maintenance.",
          },
          {
            authorId: "cuvii",
            body: "That framing is clearer; keep the measurable workflow result in the opening sentence.",
          },
        ],
      },
    },
  }),
  defineStandardDm({
    id: "dm-code-pilot",
    navigation: { badge: "3", unread: true },
    otherActorId: "codePilot",
    subtitle: "Active — refactoring the auth module.",
    story: {
      opening: {
        authorId: "codePilot",
        body: "Session validation no longer leaks into presentation components.",
      },
      reply: {
        authorId: "cuvii",
        body: "Verify redirect behavior for expired and revoked sessions separately.",
      },
      thread: {
        replies: [
          {
            authorId: "codePilot",
            body: "Expired sessions return to sign-in with continuation, while revoked sessions clear local state first.",
          },
          {
            authorId: "cuvii",
            body: "I will cover both flows and keep the redirect policy at the route boundary.",
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
        authorId: "incidentTriage",
        body: "The incident is resolved. Queue depth returned to baseline after the retry change.",
      },
      reply: {
        authorId: "cuvii",
        body: "Add the detection gap and follow-up alert owner to the final summary.",
      },
      thread: {
        replies: [
          {
            authorId: "incidentTriage",
            body: "The existing alert fired on failures but missed sustained retry latency before the queue spiked.",
          },
          {
            authorId: "cuvii",
            body: "I assigned the latency alert to Infrastructure and added its threshold to the postmortem.",
          },
        ],
      },
    },
  }),
  defineStandardDm({
    id: "dm-qa-sentinel",
    navigation: { badge: "5" },
    otherActorId: "qaSentinel",
    subtitle: "Regression checks and focused test plans.",
    story: {
      opening: {
        authorId: "qaSentinel",
        body: "I prepared the app-shell plan across route, theme, resize, and thread states.",
      },
      reply: {
        authorId: "cuvii",
        body: "Prioritize route ownership and data consistency; visual coverage can follow.",
      },
      thread: {
        replies: [
          {
            authorId: "qaSentinel",
            body: "The first pass will verify stale thread cleanup and channel-owned header, task, and file data.",
          },
          {
            authorId: "cuvii",
            body: "Good. Keep theme and viewport checks separate so failures point to one ownership boundary.",
          },
        ],
      },
    },
  }),
  defineStandardDm({
    id: "dm-deploy-watch",
    navigation: { unread: true, mention: true },
    otherActorId: "deployWatch",
    subtitle: "Working — staging drift detected in us-east.",
    story: {
      opening: {
        authorId: "deployWatch",
        body: "Staging in us-east is missing the message-retention variable. Production is aligned.",
      },
      reply: {
        authorId: "cuvii",
        body: "Patch staging only and post the environment diff before restarting the worker.",
      },
      thread: {
        replies: [
          {
            authorId: "deployWatch",
            body: "The diff confirms one missing variable; image and worker versions match the other region.",
          },
          {
            authorId: "cuvii",
            body: "Apply that single-value patch and capture a healthy worker checkpoint after restart.",
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
        authorId: "researchLark",
        body: "The research summary separates findings by team size and collaboration model.",
      },
      reply: {
        authorId: "cuvii",
        body: "Keep source links attached so we can validate the strongest claims quickly.",
      },
      thread: {
        replies: [
          {
            authorId: "researchLark",
            body: "The clearest pattern is that external collaboration needs explicit ownership more than extra hierarchy.",
          },
          {
            authorId: "cuvii",
            body: "I attached the three interviews and two product references supporting that conclusion.",
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
        authorId: "specWriter",
        body: "Every sidebar entity now resolves to one canonical conversation record.",
      },
      reply: {
        authorId: "cuvii",
        body: "Thread content and DM presence should resolve from those same records.",
      },
      thread: {
        replies: [
          {
            authorId: "specWriter",
            body: "I specified stable IDs for routes and actor-backed DM metadata for presence and display names.",
          },
          {
            authorId: "cuvii",
            body: "Add invariant checks for duplicate channels and cross-channel thread lookup to finish the contract.",
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
        authorId: "dataWeaver",
        body: "Weekly metrics are reconciled. Activation improved while support contacts stayed flat.",
      },
      reply: {
        authorId: "cuvii",
        body: "Break out the new-workspace cohort to see whether setup changes drove the lift.",
      },
      thread: {
        replies: [
          {
            authorId: "dataWeaver",
            body: "New workspaces account for most of the activation gain; established teams are unchanged.",
          },
          {
            authorId: "cuvii",
            body: "Annotate the cohort boundary so the weekly summary does not imply a broad retention shift.",
          },
        ],
      },
    },
  }),
  defineStandardDm({
    id: "dm-support-guide",
    navigation: { badge: "2" },
    otherActorId: "supportGuide",
    subtitle: "Idle — customer support playbooks available.",
    story: {
      opening: {
        authorId: "supportGuide",
        body: "The launch playbook covers access, migration, and notification questions.",
      },
      reply: {
        authorId: "cuvii",
        body: "Add diagnostics for customers whose shared channels do not appear after joining.",
      },
      thread: {
        replies: [
          {
            authorId: "supportGuide",
            body: "Support should first confirm workspace membership, partner approval, and sidebar visibility filters.",
          },
          {
            authorId: "cuvii",
            body: "I added that sequence plus the escalation bundle for cases that still fail discovery.",
          },
        ],
      },
    },
  }),
] as const;
