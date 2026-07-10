import { getPlaygroundActor, type PlaygroundActor, type PlaygroundActorId } from "./actors.ts";

export type PlaygroundRoomKind = "channel" | "joint" | "private";
export type PlaygroundChannelKind = PlaygroundRoomKind | "dm";
export type PlaygroundShowcaseId = "rich" | "incident" | "release" | "matrix";
export type PlaygroundMessageId = `${string}:${string}`;

export type PlaygroundSidebarState = {
  badge?: string;
  unread?: boolean;
  muted?: boolean;
  mention?: boolean;
  draft?: boolean;
  messageIcon?: boolean;
  pinned?: boolean;
};

export type PlaygroundMessage = {
  id: PlaygroundMessageId;
  authorId: PlaygroundActorId;
  time: string;
  body: string;
};

export type PlaygroundThread = {
  parent: PlaygroundMessage;
  replies: readonly PlaygroundMessage[];
  unreadCount?: number;
};

type PlaygroundChannelContent =
  | { kind: "messages"; messages: readonly PlaygroundMessage[] }
  | { kind: "showcase"; showcase: PlaygroundShowcaseId }
  | { kind: "empty" };

type PlaygroundChannelBase = {
  id: string;
  name: string;
  kind: PlaygroundChannelKind;
  subtitle: string;
  topic: string;
  memberCount: number;
  memberIds: readonly [PlaygroundActorId, ...PlaygroundActorId[]];
  sidebar: PlaygroundSidebarState;
  archived: boolean;
  content: PlaygroundChannelContent;
  threads: readonly PlaygroundThread[];
};

export type PlaygroundRoomChannel = PlaygroundChannelBase & {
  kind: PlaygroundRoomKind;
};

export type PlaygroundDirectMessage = PlaygroundChannelBase & {
  kind: "dm";
  otherActorId: PlaygroundActorId;
};

export type PlaygroundChannel = PlaygroundRoomChannel | PlaygroundDirectMessage;

type StandardRoomInput<TId extends string> = {
  id: TId;
  kind?: PlaygroundRoomKind;
  subtitle: string;
  topic: string;
  memberCount: number;
  memberIds: readonly [PlaygroundActorId, PlaygroundActorId, ...PlaygroundActorId[]];
  opening: string;
  reply: string;
  sidebar?: PlaygroundSidebarState;
  archived?: boolean;
};

type StandardDmInput<TId extends string> = {
  id: TId;
  otherActorId: PlaygroundActorId;
  subtitle: string;
  topic: string;
  opening: string;
  reply: string;
  sidebar?: PlaygroundSidebarState;
};

function createStandardThread<TId extends string>(
  id: TId,
  topic: string,
  firstAuthorId: PlaygroundActorId,
  secondAuthorId: PlaygroundActorId,
  parent: PlaygroundMessage,
): PlaygroundThread {
  return {
    parent,
    replies: [
      {
        id: `${id}:thread-reply-1`,
        authorId: firstAuthorId,
        time: "09:31 AM",
        body: `Let's keep the follow-up focused on ${topic}. I added the remaining decision to the conversation summary.`,
      },
      {
        id: `${id}:thread-reply-2`,
        authorId: secondAuthorId,
        time: "09:34 AM",
        body: "Done. The owner and next checkpoint now match the main conversation.",
      },
    ],
  };
}

function defineStandardRoom<const TId extends string>(
  input: StandardRoomInput<TId>,
): PlaygroundRoomChannel & { id: TId } {
  const [firstAuthorId, secondAuthorId] = input.memberIds;
  const opening: PlaygroundMessage = {
    id: `${input.id}:opening`,
    authorId: firstAuthorId,
    time: "09:18 AM",
    body: input.opening,
  };
  const reply: PlaygroundMessage = {
    id: `${input.id}:reply`,
    authorId: secondAuthorId,
    time: "09:24 AM",
    body: input.reply,
  };

  return {
    id: input.id,
    name: input.id,
    kind: input.kind ?? "channel",
    subtitle: input.subtitle,
    topic: input.topic,
    memberCount: input.memberCount,
    memberIds: input.memberIds,
    sidebar: input.sidebar ?? {},
    archived: input.archived ?? false,
    content: { kind: "messages", messages: [opening, reply] },
    threads: [createStandardThread(input.id, input.topic, firstAuthorId, secondAuthorId, reply)],
  };
}

function defineStandardDm<const TId extends string>(
  input: StandardDmInput<TId>,
): PlaygroundDirectMessage & { id: TId } {
  const actor = getPlaygroundActor(input.otherActorId);
  const room = defineStandardRoom({
    id: input.id,
    subtitle: input.subtitle,
    topic: input.topic,
    memberCount: 2,
    memberIds: [input.otherActorId, "cuvii"],
    opening: input.opening,
    reply: input.reply,
    sidebar: input.sidebar,
  });

  return {
    ...room,
    name: actor.name,
    kind: "dm",
    otherActorId: input.otherActorId,
  };
}

function defineShowcaseRoom<const TId extends string>(input: {
  id: TId;
  subtitle: string;
  topic: string;
  memberCount: number;
  memberIds: readonly [PlaygroundActorId, ...PlaygroundActorId[]];
  showcase: PlaygroundShowcaseId;
  threads?: readonly PlaygroundThread[];
  sidebar?: PlaygroundSidebarState;
}): PlaygroundRoomChannel & { id: TId } {
  return {
    id: input.id,
    name: input.id,
    kind: "channel",
    subtitle: input.subtitle,
    topic: input.topic,
    memberCount: input.memberCount,
    memberIds: input.memberIds,
    sidebar: input.sidebar ?? {},
    archived: false,
    content: { kind: "showcase", showcase: input.showcase },
    threads: input.threads ?? [],
  };
}

function defineEmptyRoom<const TId extends string>(input: {
  id: TId;
  subtitle: string;
  topic: string;
  memberCount: number;
  memberIds: readonly [PlaygroundActorId, ...PlaygroundActorId[]];
  sidebar?: PlaygroundSidebarState;
}): PlaygroundRoomChannel & { id: TId } {
  return {
    id: input.id,
    name: input.id,
    kind: "channel",
    subtitle: input.subtitle,
    topic: input.topic,
    memberCount: input.memberCount,
    memberIds: input.memberIds,
    sidebar: input.sidebar ?? {},
    archived: false,
    content: { kind: "empty" },
    threads: [],
  };
}

function message(
  id: PlaygroundMessageId,
  authorId: PlaygroundActorId,
  time: string,
  body: string,
): PlaygroundMessage {
  return { id, authorId, time, body };
}

function thread(
  parent: PlaygroundMessage,
  replies: readonly PlaygroundMessage[],
  unreadCount?: number,
): PlaygroundThread {
  return { parent, replies, unreadCount };
}

export const ALL_SHOWCASE_THREAD_IDS = {
  stateModel: "all:state-model",
  inviteSecurity: "all:invite-security",
  selectorPerformance: "all:selector-performance",
  apiDocs: "all:api-docs",
} as const satisfies Record<string, PlaygroundMessageId>;

const allThreads = [
  thread(
    message(
      ALL_SHOWCASE_THREAD_IDS.stateModel,
      "developer",
      "08:17 AM",
      "Should we migrate from Zustand to Jotai? Jotai's atom model might be better for our store structure.",
    ),
    [
      message(
        "all:state-model-reply-1",
        "atlas",
        "08:20 AM",
        "The atom model is a better fit only if we keep server state out of the local store.",
      ),
      message(
        "all:state-model-reply-2",
        "developer",
        "08:23 AM",
        "Agreed. I will document the ownership boundary before changing the store.",
      ),
    ],
  ),
  thread(
    message(
      ALL_SHOWCASE_THREAD_IDS.inviteSecurity,
      "atlas",
      "08:22 AM",
      "The invite link system needs rate limiting. Someone could enumerate valid invite codes.",
    ),
    [
      message(
        "all:invite-security-reply-1",
        "samira",
        "08:24 AM",
        "Use a workspace-scoped attempt budget and log rejected code probes.",
      ),
      message(
        "all:invite-security-reply-2",
        "developer",
        "08:26 AM",
        "I will add the throttle before the invite lookup and preserve generic error copy.",
      ),
      message(
        "all:invite-security-reply-3",
        "atlas",
        "08:28 AM",
        "That closes both enumeration signals without exposing whether a code exists.",
      ),
    ],
  ),
  thread(
    message(
      ALL_SHOWCASE_THREAD_IDS.selectorPerformance,
      "developer",
      "08:27 AM",
      "Performance: the message list re-renders when any agent activity changes. Need to fix selectors.",
    ),
    [
      message(
        "all:selector-performance-reply-1",
        "atlas",
        "08:30 AM",
        "Narrow the subscription to the visible conversation and keep presence in its own store slice.",
      ),
    ],
    1,
  ),
  thread(
    message(
      ALL_SHOWCASE_THREAD_IDS.apiDocs,
      "atlas",
      "08:32 AM",
      "Documentation: we should auto-generate API docs from the route definitions. Maybe use Swagger.",
    ),
    [
      message(
        "all:api-docs-reply-1",
        "cuvii",
        "08:35 AM",
        "Keep the route schema canonical and generate the reference from that boundary.",
      ),
      message(
        "all:api-docs-reply-2",
        "atlas",
        "08:37 AM",
        "I will compare the generated output with the current handwritten examples.",
      ),
    ],
  ),
] as const satisfies readonly PlaygroundThread[];

export const PLAYGROUND_JOINT_CHANNELS = [
  defineStandardRoom({
    id: "partner-ops",
    kind: "joint",
    subtitle: "Launch readiness with Northstar",
    topic: "the shared launch runbook and handoff owners",
    memberCount: 8,
    memberIds: ["avery", "atlas"],
    sidebar: { badge: "3", pinned: true },
    opening:
      "Northstar confirmed the handoff window. I added the remaining owners to the shared runbook.",
    reply: "I checked the dependencies and flagged the two items that still need partner approval.",
  }),
  defineStandardRoom({
    id: "vendor-review",
    kind: "joint",
    subtitle: "Security and procurement with Acme Cloud",
    topic: "the Acme Cloud security questionnaire",
    memberCount: 6,
    memberIds: ["samira", "atlas"],
    opening:
      "The vendor sent updated data-retention answers. Only the regional backup policy is unresolved.",
    reply:
      "I compared this revision with the previous questionnaire and summarized the changed controls.",
  }),
  defineStandardRoom({
    id: "community-lab",
    kind: "joint",
    subtitle: "Prototype feedback with community maintainers",
    topic: "feedback from the community prototype cohort",
    memberCount: 12,
    memberIds: ["cindy", "mira"],
    sidebar: { muted: true },
    opening:
      "The maintainers prefer compact navigation, but asked for clearer ownership on shared drafts.",
    reply:
      "I grouped the notes by workflow and linked each request to the corresponding prototype state.",
  }),
  defineStandardRoom({
    id: "shared-roadmap",
    kind: "joint",
    subtitle: "Quarterly planning across Raft and Northstar",
    topic: "the cross-company Q3 roadmap",
    memberCount: 15,
    memberIds: ["avery", "specWriter"],
    sidebar: { mention: true, badge: "1" },
    opening:
      "I merged both roadmap drafts and marked the milestones where sequencing still conflicts.",
    reply: "The brief now includes owners, confidence, and the decision date for every milestone.",
  }),
  defineStandardRoom({
    id: "cross-team-qa",
    kind: "joint",
    subtitle: "End-to-end verification with partner QA",
    topic: "the shared release acceptance pass",
    memberCount: 9,
    memberIds: ["olivia", "qaSentinel"],
    sidebar: { draft: true },
    opening:
      "Desktop passed. Mobile still has one keyboard-navigation regression in the member picker.",
    reply:
      "I reproduced it on the shared fixture and attached the exact focus sequence to the QA note.",
  }),
  defineStandardRoom({
    id: "partner-launch",
    kind: "joint",
    subtitle: "Coordinating Friday's partner rollout",
    topic: "Friday's coordinated partner rollout",
    memberCount: 18,
    memberIds: ["mateo", "deployWatch"],
    sidebar: { badge: "7", unread: true },
    opening: "The partner environment is ready. We can start after the 14:00 checkpoint.",
    reply:
      "I am watching both deployment regions and will post here if configuration drift appears.",
  }),
] as const;

export const PLAYGROUND_ROOM_CHANNELS = [
  defineShowcaseRoom({
    id: "all",
    subtitle: "Company-wide announcements and shared updates",
    topic: "the design-system migration",
    memberCount: 42,
    memberIds: ["developer", "atlas", "ada", "cindy", "cuvii", "samira"],
    showcase: "rich",
    threads: allThreads,
  }),
  defineStandardRoom({
    id: "general",
    subtitle: "Team-wide product and engineering discussion",
    topic: "this week's product and engineering priorities",
    memberCount: 31,
    memberIds: ["avery", "cuvii"],
    opening:
      "I posted the weekly priorities and called out the decisions that need owners by tomorrow.",
    reply: "I claimed the playground data pass and added the dependency notes to the planning doc.",
  }),
  defineStandardRoom({
    id: "design",
    subtitle: "Interaction design and system patterns",
    topic: "the next interaction-pattern review",
    memberCount: 11,
    memberIds: ["cindy", "mira"],
    sidebar: { badge: "1", pinned: true },
    opening:
      "The sidebar states are aligned. I still want a pass on empty, muted, and unread combinations.",
    reply: "I prepared a coverage matrix and highlighted states without realistic content.",
  }),
  defineShowcaseRoom({
    id: "incidents",
    subtitle: "Delivery degraded — retries queued",
    topic: "the current delivery degradation",
    memberCount: 14,
    memberIds: ["deployBot", "mxChen", "ada", "mateo", "incidentTriage"],
    showcase: "incident",
    sidebar: { badge: "12", unread: true, mention: true },
  }),
  defineStandardRoom({
    id: "launch",
    subtitle: "Launch checklist, messaging, and rollout status",
    topic: "the public launch checklist",
    memberCount: 17,
    memberIds: ["avery", "releaseScribe"],
    sidebar: { badge: "2" },
    opening: "The launch checklist is at 86%. Pricing copy and the support handoff remain.",
    reply: "I updated the launch brief and drafted the handoff note for Support to review.",
  }),
  defineShowcaseRoom({
    id: "frontend",
    subtitle: "Components, application shell, and client architecture",
    topic: "the component behavior matrix",
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
    showcase: "matrix",
    sidebar: { badge: "4" },
  }),
  defineStandardRoom({
    id: "customer-notes",
    subtitle: "Interview notes and customer follow-ups",
    topic: "this week's customer research synthesis",
    memberCount: 10,
    memberIds: ["noah", "researchLark"],
    sidebar: { badge: "2" },
    opening:
      "Three teams asked for clearer separation between shared channels and internal project rooms.",
    reply: "I clustered the interviews and added supporting quotes to the navigation findings.",
  }),
  defineStandardRoom({
    id: "hiring",
    kind: "private",
    subtitle: "Private recruiting coordination",
    topic: "the current engineering interview loop",
    memberCount: 5,
    memberIds: ["avery", "cuvii"],
    opening:
      "The final interview loop is scheduled. Please add scorecards before tomorrow's debrief.",
    reply: "I added my notes and separated evidence from the hiring recommendation.",
  }),
  defineStandardRoom({
    id: "exec",
    kind: "private",
    subtitle: "Private leadership planning and decisions",
    topic: "the Q3 operating review",
    memberCount: 4,
    memberIds: ["avery", "dataWeaver"],
    sidebar: { badge: "5", unread: true },
    opening: "The Q3 review draft is ready. Retention and support load need updated commentary.",
    reply: "I refreshed the charts from the weekly dataset and annotated the two largest changes.",
  }),
  defineShowcaseRoom({
    id: "release-notes",
    subtitle: "Release coordination and changelog drafting",
    topic: "the next release cut",
    memberCount: 12,
    memberIds: ["ada", "atlas", "developer", "cuvii", "releaseScribe"],
    showcase: "release",
    sidebar: { muted: true },
  }),
  defineStandardRoom({
    id: "random",
    subtitle: "Off-topic conversation and team miscellany",
    topic: "the team's Friday demo playlist",
    memberCount: 27,
    memberIds: ["cindy", "elliot"],
    sidebar: { muted: true, draft: true },
    opening: "I made a playlist for Friday's demo session. Add anything that keeps the energy up.",
    reply: "Added two instrumental tracks and moved the louder ones to the post-demo section.",
  }),
  defineStandardRoom({
    id: "design-crit",
    subtitle: "Structured critique for in-progress product work",
    topic: "the playground information hierarchy critique",
    memberCount: 9,
    memberIds: ["cindy", "mira"],
    sidebar: { mention: true },
    opening: "The shell works, but mock hierarchy breaks trust when rows do not change context.",
    reply: "The fix is one conversation registry shared by navigation, routes, and panels.",
  }),
  defineEmptyRoom({
    id: "standup",
    subtitle: "A newly created channel for async updates",
    topic: "daily async team updates",
    memberCount: 7,
    memberIds: ["cuvii", "atlas"],
    sidebar: { draft: true },
  }),
  defineStandardRoom({
    id: "archive-ops",
    subtitle: "Channel retention and archive operations",
    topic: "the quarterly channel-retention sweep",
    memberCount: 6,
    memberIds: ["samira", "atlas"],
    archived: true,
    opening:
      "The retention sweep found nine inactive channels. Owners have one week to review them.",
    reply: "I generated a list with last activity, owner, and linked project for every channel.",
  }),
] as const;

export const PLAYGROUND_DIRECT_MESSAGES = [
  defineStandardDm({
    id: "dm-noah",
    otherActorId: "noah",
    subtitle: "Growth experiments and activation metrics.",
    topic: "the activation experiment readout",
    sidebar: { badge: "12" },
    opening: "The shorter setup flow improved activation by six points in the small-team cohort.",
    reply:
      "That matches the interviews. Keep detailed configuration available after first success.",
  }),
  defineStandardDm({
    id: "dm-samira",
    otherActorId: "samira",
    subtitle: "Security review and access policy.",
    topic: "the workspace access-policy review",
    opening:
      "The role matrix is sound. Revoked guest access should remain visible in the audit log.",
    reply: "Agreed. I will add the expected audit event to the acceptance criteria.",
  }),
  defineStandardDm({
    id: "dm-elliot",
    otherActorId: "elliot",
    subtitle: "Developer experience and local tooling.",
    topic: "the local development bootstrap",
    sidebar: { badge: "1" },
    opening: "Fresh setup is down to four minutes. The first docs install is the remaining delay.",
    reply: "Nice. I will document the cached path separately so the baseline stays honest.",
  }),
  defineStandardDm({
    id: "dm-claude",
    otherActorId: "claudeAssistant",
    subtitle: "Planning on the primary online machine.",
    topic: "the source-parity fixture audit",
    sidebar: { badge: "1", unread: true, pinned: true },
    opening: "The fixture audit is complete. Two component states drifted from source behavior.",
    reply: "Send me the exact files and I will re-sync them before the release cut.",
  }),
  defineStandardDm({
    id: "dm-olivia",
    otherActorId: "olivia",
    subtitle: "QA lead for desktop and mobile.",
    topic: "the mobile regression pass",
    sidebar: { badge: "1" },
    opening: "Mobile is clean except for the thread close target at the smallest supported width.",
    reply: "I will check the composed button size and keep the fix local to responsive chrome.",
  }),
  defineStandardDm({
    id: "dm-mateo",
    otherActorId: "mateo",
    subtitle: "Infrastructure and staging deploys.",
    topic: "the staging environment refresh",
    sidebar: { badge: "1" },
    opening: "Staging is refreshed with today's schema. The worker is finishing its replay now.",
    reply: "Perfect. I will wait for the checkpoint before starting product verification.",
  }),
  defineStandardDm({
    id: "dm-search",
    otherActorId: "searchScout",
    subtitle: "Idle — ready for a new research query.",
    topic: "the component-source discovery pass",
    sidebar: { messageIcon: true },
    opening: "I indexed the source component callsites and grouped them by product capability.",
    reply: "Keep the result handy. We will use it for the next migration batch.",
  }),
  defineStandardDm({
    id: "dm-release",
    otherActorId: "releaseScribe",
    subtitle: "Drafting release notes and changelogs.",
    topic: "the next public changelog",
    sidebar: { badge: "1" },
    opening: "The changelog draft separates user-visible improvements from maintenance.",
    reply: "Tighten the first item around workflow improvement, not implementation detail.",
  }),
  defineStandardDm({
    id: "dm-code-pilot",
    otherActorId: "codePilot",
    subtitle: "Active — refactoring the auth module.",
    topic: "the auth-module refactor",
    sidebar: { badge: "3", unread: true },
    opening: "Session validation no longer leaks into presentation components.",
    reply: "Verify redirect behavior for expired and revoked sessions separately.",
  }),
  defineStandardDm({
    id: "dm-incident-triage",
    otherActorId: "incidentTriage",
    subtitle: "Offline — last incident run two hours ago.",
    topic: "the latest incident summary",
    opening: "The incident is resolved. Queue depth returned to baseline after the retry change.",
    reply: "Add the detection gap and follow-up alert owner to the final summary.",
  }),
  defineStandardDm({
    id: "dm-qa-sentinel",
    otherActorId: "qaSentinel",
    subtitle: "Regression checks and focused test plans.",
    topic: "the app-shell regression plan",
    sidebar: { badge: "5" },
    opening: "I prepared the app-shell plan across route, theme, resize, and thread states.",
    reply: "Prioritize route ownership and data consistency; visual coverage can follow.",
  }),
  defineStandardDm({
    id: "dm-deploy-watch",
    otherActorId: "deployWatch",
    subtitle: "Working — staging drift detected in us-east.",
    topic: "the staging configuration drift",
    sidebar: { unread: true, mention: true },
    opening: "Staging in us-east is missing the message-retention variable. Production is aligned.",
    reply: "Patch staging only and post the environment diff before restarting the worker.",
  }),
  defineStandardDm({
    id: "dm-research-lark",
    otherActorId: "researchLark",
    subtitle: "Idle — market research summaries available.",
    topic: "the collaboration-tools research summary",
    sidebar: { muted: true },
    opening: "The research summary separates findings by team size and collaboration model.",
    reply: "Keep source links attached so we can validate the strongest claims quickly.",
  }),
  defineStandardDm({
    id: "dm-spec-writer",
    otherActorId: "specWriter",
    subtitle: "Idle — product requirement drafts available.",
    topic: "the playground mock-data specification",
    sidebar: { draft: true },
    opening: "Every sidebar entity now resolves to one canonical conversation record.",
    reply: "Thread content and DM presence should resolve from those same records.",
  }),
  defineStandardDm({
    id: "dm-data-weaver",
    otherActorId: "dataWeaver",
    subtitle: "Working — synthesizing weekly metrics.",
    topic: "the weekly product metrics synthesis",
    opening:
      "Weekly metrics are reconciled. Activation improved while support contacts stayed flat.",
    reply: "Break out the new-workspace cohort to see whether setup changes drove the lift.",
  }),
  defineStandardDm({
    id: "dm-support-guide",
    otherActorId: "supportGuide",
    subtitle: "Idle — customer support playbooks available.",
    topic: "the launch support handoff",
    sidebar: { badge: "2" },
    opening: "The launch playbook covers access, migration, and notification questions.",
    reply: "Add diagnostics for customers whose shared channels do not appear after joining.",
  }),
] as const;

export const PLAYGROUND_CHANNELS = [
  ...PLAYGROUND_JOINT_CHANNELS,
  ...PLAYGROUND_ROOM_CHANNELS,
  ...PLAYGROUND_DIRECT_MESSAGES,
] as const;

export const PLAYGROUND_PINNED_CHANNELS = PLAYGROUND_CHANNELS.filter(
  (channel) => channel.sidebar.pinned,
);

export type PlaygroundChannelId = (typeof PLAYGROUND_CHANNELS)[number]["id"];
export type PlaygroundThreadId = PlaygroundMessageId;
export type PlaygroundChannelRecord = PlaygroundChannel & { id: PlaygroundChannelId };

export const DEFAULT_CHANNEL_ID: PlaygroundChannelId = "all";

const channelsById = new Map<PlaygroundChannelId, PlaygroundChannelRecord>();
const channelIds = new Set<string>();
for (const channel of PLAYGROUND_CHANNELS) {
  if (channelIds.has(channel.id)) {
    throw new Error(`Duplicate playground channel: ${channel.id}`);
  }
  channelIds.add(channel.id);
  channelsById.set(channel.id, channel);
}

export type PlaygroundThreadContext = {
  channel: PlaygroundChannelRecord;
  channelId: PlaygroundChannelId;
  thread: PlaygroundThread;
};

const threadContexts = new Map<string, PlaygroundThreadContext>();
for (const channel of PLAYGROUND_CHANNELS) {
  for (const channelThread of channel.threads) {
    if (threadContexts.has(channelThread.parent.id)) {
      throw new Error(`Duplicate playground thread: ${channelThread.parent.id}`);
    }
    threadContexts.set(channelThread.parent.id, {
      channel,
      channelId: channel.id,
      thread: channelThread,
    });
  }
}

export function isPlaygroundChannelId(value: string): value is PlaygroundChannelId {
  return channelIds.has(value);
}

export function getPlaygroundChannel(id: PlaygroundChannelId): PlaygroundChannelRecord {
  const channel = channelsById.get(id);
  if (!channel) throw new Error(`Unknown playground channel: ${id}`);
  return channel;
}

export function isPlaygroundThreadId(value: string): value is PlaygroundThreadId {
  return threadContexts.has(value);
}

export function getPlaygroundThread(id: PlaygroundThreadId): PlaygroundThreadContext | undefined {
  return threadContexts.get(id);
}

export function requirePlaygroundThread(id: PlaygroundThreadId): PlaygroundThreadContext {
  const context = getPlaygroundThread(id);
  if (!context) throw new Error(`Unknown playground thread: ${id}`);
  return context;
}

export function getPlaygroundMembers(channel: PlaygroundChannel): PlaygroundActor[] {
  return channel.memberIds.map(getPlaygroundActor);
}

export function getPlaygroundDmActor(channel: PlaygroundDirectMessage): PlaygroundActor {
  return getPlaygroundActor(channel.otherActorId);
}
