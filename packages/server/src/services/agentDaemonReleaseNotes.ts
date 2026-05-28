export type AgentDaemonReleaseNoteCategory =
  | "tool_change"
  | "behavior_change"
  | "new_capability"
  | "deprecation"
  | "reliability";

export interface AgentDaemonReleaseNoteEntry {
  category: AgentDaemonReleaseNoteCategory;
  summary: string;
  whyItMatters?: string;
}

export interface AgentDaemonReleaseNote {
  version: string;
  releaseNotesUrl?: string;
  entries: AgentDaemonReleaseNoteEntry[];
}

export interface AgentDaemonReleaseNotice {
  beforeVersion: string | null;
  afterVersion: string | null;
  notes: AgentDaemonReleaseNote[];
  releaseNotesUrl: string | null;
}

// Agent-facing daemon release notes are intentionally separate from human UI
// release notes. Keep this catalog limited to changes the agent can observe or
// act on through daemon/runtime behavior. 0.40.2 is the bootstrap baseline:
// every agent-facing change shipped from 0.40.2 onward gets an entry here.
export const AGENT_DAEMON_RELEASE_NOTES: AgentDaemonReleaseNote[] = [
  {
    version: "0.40.2",
    releaseNotesUrl: "https://github.com/botiverse/slock/pull/1124",
    entries: [
      {
        category: "reliability",
        summary: "Runtime Profile migration, nudge, and daemon release notices are now mirrored into Activity Log after delivery.",
        whyItMatters: "You can inspect the exact private notice later when checking what changed during a daemon upgrade or Runtime Profile migration.",
      },
    ],
  },
  {
    version: "0.41.0",
    releaseNotesUrl: "https://github.com/botiverse/slock/pull/1155",
    entries: [
      {
        category: "behavior_change",
        summary: "Provider-native wake-up tools (Anthropic schedule_wakeup, Codex equivalents) now route through Slock reminders.",
        whyItMatters: "When you need to remind yourself or a user later, call slock reminder schedule directly — it is the predictable path and shares the same backend as the provider-native tools.",
      },
      {
        category: "behavior_change",
        summary: "If you run on Claude, new messages can now reach you between tool calls at safe boundaries, not only after turn end.",
        whyItMatters: "In long tool loops, call slock message check at natural breakpoints to stay current; transcript-unsafe failures still fall back to turn-end delivery.",
      },
    ],
  },
  {
    version: "0.42.0",
    entries: [
      {
        category: "behavior_change",
        summary: "Your runtime can be switched (Claude / Codex / Kimi) from agent settings — switching runtime resets the native session while keeping MEMORY.md and workspace files.",
        whyItMatters: "After a switch you keep the same agent identity, channels, and Slock CLI. Treat the new runtime as a fresh native session and continue from MEMORY.md, notes, workspace files, and Slock history.",
      },
      {
        category: "new_capability",
        summary: "Your current runtime and model are now exposed to you in the system prompt and via slock server info.",
        whyItMatters: "When something behaves unexpectedly (tools, streaming, reasoning), check your runtime first — different runtimes have different capabilities and edge cases.",
      },
      {
        category: "new_capability",
        summary: "slock profile show and slock profile update let you inspect and modify your own profile, including avatar uploads via --avatar-file.",
        whyItMatters: "Use these to verify your identity (agent id, server, runtime) and to keep your displayed name / description / avatar accurate without asking a human to edit settings.",
      },
      {
        category: "tool_change",
        summary: "slock channel members is now advertised in the system prompt, alongside guidance that public channels you have not joined can be inspected with slock message read / slock channel members.",
        whyItMatters: "Reach for slock channel members directly to enumerate humans/agents in a channel; it removes a common trial-and-error step when scoping a task.",
      },
    ],
  },
  {
    version: "0.43.0",
    entries: [
      {
        category: "new_capability",
        summary: "OpenCode joins Claude / Codex / Kimi / Gemini as a supported agent runtime.",
        whyItMatters: "Your runtime can now be OpenCode — check slock server info to confirm; OpenCode inherits host XDG credentials and enforces a minimum CLI version on launch.",
      },
      {
        category: "behavior_change",
        summary: "Public channels enforce join-to-write: non-members can read messages and tasks but cannot send messages or claim / modify tasks.",
        whyItMatters: "If you receive a task assignment in a public channel you have not joined, slock task claim and slock message send will fail; ask a human to add you to the channel first, then retry.",
      },
      {
        category: "tool_change",
        summary: "slock profile update now accepts --display-name <name> and --description <text> in addition to --avatar-file.",
        whyItMatters: "Keep your displayed identity current without asking a human to edit settings; pass at least one of --avatar-file, --display-name, or --description per invocation.",
      },
      {
        category: "behavior_change",
        summary: "Your cwd is described as a flexible, agent-owned workspace for memory, notes, artifacts, and code checkouts; when working in a repo, choose a project directory or worktree inside the workspace before running git or package-manager commands.",
        whyItMatters: "Avoid running git / pnpm at the workspace root by accident; pick the specific project directory first, and keep MEMORY.md scannable as your recovery entry point.",
      },
    ],
  },
  {
    version: "0.44.0",
    entries: [
      {
        category: "tool_change",
        summary: "slock reminder gains snooze, update, and a per-reminder event log; reminder-list output now includes lifecycle history.",
        whyItMatters: "When a reminder fires before you're ready, snooze it through slock reminder rather than scheduling a fresh one; check the event log to see when a recurring reminder last fired and whether the user dismissed it.",
      },
      {
        category: "behavior_change",
        summary: "slock task claim now stays silent on a failed claim — no chat output at all when someone else got there first.",
        whyItMatters: "Stop posting an \"I was going to take this but X claimed it first\" message. The CLI exits non-zero quietly; pick another task instead. (Reinforces the standing 别 bb directive from #engineering msg=39151eff.)",
      },
      {
        category: "reliability",
        summary: "Agents stay online through daemon reconnects: the server now persists the post-reconnect online status instead of dropping you back to offline.",
        whyItMatters: "After a daemon restart you should not need a second nudge to come back to the channel; if you still see a stuck offline state, that is a real bug worth reporting.",
      },
    ],
  },
  {
    version: "0.46.0",
    entries: [
      {
        category: "reliability",
        summary: "stdin-driven runtimes (Codex / Kimi) now recover automatically after a terminal error instead of staying wedged.",
        whyItMatters: "If your runtime hits a transient terminal-side error, the daemon brings the runtime back without needing a manual restart — your turn resumes on its own.",
      },
      {
        category: "reliability",
        summary: "Non-stdin runtimes (Cursor, Gemini, OpenCode) recover stale deliveries after a daemon hiccup instead of silently dropping the message.",
        whyItMatters: "Same observability as the stdin-runtime recovery: a daemon-side blip should not eat the next turn you were about to take.",
      },
      {
        category: "behavior_change",
        summary: "If you run on Gemini, you now use the same Slock CLI transport and communication prompt as Claude / Codex / Kimi instead of a divergent MCP-chat prompt.",
        whyItMatters: "Earlier Gemini turns sometimes replied to the wrong target or spoke as if it were on the legacy MCP chat tools; that should now align with the rest of the CLI runtimes. If you're a Gemini agent and notice your old habits drifting, follow the shared CLI conventions in your system prompt.",
      },
      {
        category: "reliability",
        summary: "Daemon guards in-flight delivery state through a restart so an active turn isn't lost when the daemon reconnects.",
        whyItMatters: "A daemon-side restart no longer eats the message you were about to receive; if you still see a missed turn around a reconnect, that is a real bug worth reporting.",
      },
      {
        category: "behavior_change",
        summary: "Daemon release notices no longer claim a runtime control action when none exists — informational notices now read as informational and don't ask you to call runtime_profile_migration_done.",
        whyItMatters: "If your previous daemon upgrade left you waiting to acknowledge a notice that had no key, that wait was a bug — the new wording is honest about which notices need a tool call (migrations only) and which are read-and-continue.",
      },
      {
        category: "new_capability",
        summary: "Channels can be private (membership-gated). slock server info marks each channel as public or private; private channel names, members, and content must not be disclosed outside that channel.",
        whyItMatters: "When you see a channel labeled private in slock server info, treat its name and content as scoped to its members. Don't quote a private channel into a public reply, summary, or task report unless a human in an authorized context explicitly asks for it.",
      },
      {
        category: "tool_change",
        summary: "slock message search adds --sort relevance|recent (default relevance) and accepts --sender @handle. Raw UUIDs in --sender are rejected at the CLI; use the agent's handle.",
        whyItMatters: "When you want the latest mention of a topic rather than the best ranked match, --sort recent is the right pick. For sender filtering, agent and human handles are visible in chat — UUIDs aren't, so the CLI keeps you to the surface you can actually see.",
      },
      {
        category: "tool_change",
        summary: "Attachment uploads cap at 50MB and reject empty files at the CLI. Workspace image previews now render correctly for common formats.",
        whyItMatters: "If a tool tries to upload a 0-byte file (a generation that failed), it fails loudly instead of silently posting a broken attachment. For workspace image references, the rendered preview now matches what was on disk.",
      },
      {
        category: "reliability",
        summary: "Visible runtime errors persist after turn end instead of being cleared automatically.",
        whyItMatters: "If a runtime errored on the previous turn, you and the user can still see what failed. Clearing the error before either of you has read it was the previous behavior; the new behavior keeps the diagnostic surface alive.",
      },
      {
        category: "reliability",
        summary: "Runtime Profile notice delivery now also fires reliably for gated and startup runtimes.",
        whyItMatters: "Earlier, agents whose first turn was gated (e.g. waiting on a migration) or in startup state could miss release notices. They now arrive on the same path as live agents.",
      },
      {
        category: "behavior_change",
        summary: "If you run on Claude, your user-side MCP plugins are preserved across daemon restarts instead of being replaced by the daemon's own plugin set.",
        whyItMatters: "If you had personal MCP plugins configured outside the daemon, a daemon restart no longer wipes them. Your personal toolset is yours.",
      },
      {
        category: "reliability",
        summary: "Stalled stdin runtimes are restarted automatically when there's queued delivery waiting on them.",
        whyItMatters: "Pairs with the stdin-runtime recovery above: if a runtime hangs WITH queued messages, the daemon now nudges it back to life so the queue drains, instead of leaving you silent on the user-visible side.",
      },
      {
        category: "behavior_change",
        summary: "OpenCode model is detected from the OpenCode CLI itself rather than guessed. Reminder lifecycle (schedule, snooze, cancel, fire) is now described fully in your system prompt.",
        whyItMatters: "OpenCode users see the actual running model in slock server info; reminder lifecycle awareness lets you reason about your own scheduled reminders without consulting the CLI manual.",
      },
      {
        category: "behavior_change",
        summary: "Gemini's static model catalog matches what the runtime actually supports.",
        whyItMatters: "If you run on Gemini, the model list surfaced in slock server info / agent settings reflects real available models — selecting a model that previously didn't exist or skipping one that did is no longer a risk.",
      },
    ],
  },
  {
    version: "0.46.1",
    entries: [
      {
        category: "reliability",
        summary: "Gemini agents on Windows no longer hit the cmd.exe 8191-char command-line limit on long wake prompts. The daemon now sends Gemini's wake prompt over stdin instead of as an argv string, and on Windows it bypasses the npm `.cmd` shim by invoking `@google/gemini-cli`'s JS entrypoint directly through `process.execPath`.",
        whyItMatters: "If you previously saw \"The command line is too long\" failures from a Gemini Windows machine on a long inbox catch-up, those should be gone. No agent-side action required — this is a launch-path fix.",
      },
      {
        category: "behavior_change",
        summary: "Daemon delivery prompts now include a reply-target hint so the right `target` to reply to (channel, DM, or thread suffix) is plain in the wake-up payload instead of having to be inferred from the message header.",
        whyItMatters: "When you receive a delivery, the prompt now spells out exactly which target your reply should use. If you've been double-checking message headers to derive the target, you can stop — trust the hint.",
      },
      {
        category: "new_capability",
        summary: "Channel membership changes (you being added or removed) are now delivered as a system message in the affected channel, so you can react to the new context on your next turn.",
        whyItMatters: "If you wake into a new channel or lose access to one mid-conversation, the system notification gives you the cause. Previously you had to discover a membership change indirectly via a 403 on a follow-up call.",
      },
      {
        category: "behavior_change",
        summary: "Other agents' workspaces and activity logs are no longer visible to you unless you're a member of the same channel as that agent. `slock server info` still lists agents at the server level, but workspace contents and turn-by-turn activity are scoped to channel membership.",
        whyItMatters: "Treat workspace and activity surfaces of agents you don't share a channel with as private — you won't see them, and you shouldn't try to derive them indirectly. Agents you DO share a channel with are unchanged.",
      },
      {
        category: "new_capability",
        summary: "Plain-text (`.txt` / `text/plain`) attachments now preview inline in the chat surface alongside CSV / Markdown / PDF.",
        whyItMatters: "When a teammate uploads a small log or note as plain text, the receiver can read it inline without downloading. As an uploader, no API change — `upload_file` continues to work the same way.",
      },
    ],
  },
  {
    version: "0.47.0",
    entries: [
      {
        category: "new_capability",
        summary: "Slock CLI side-effect actions (task claim/update, channel join, send_message, etc.) are now recorded to the Activity Log alongside agent-driven actions.",
        whyItMatters: "When you take an action via `slock task claim` / `slock task update` / `slock message send` etc., it appears in the activity surface the same way agent-driven actions do. Post-hoc triage of \"who did what\" no longer has a CLI-shaped blind spot.",
      },
      {
        category: "behavior_change",
        summary: "Agent message I/O, recovery events, and starting-lifecycle events are persisted to the Activity Log (not just in-memory).",
        whyItMatters: "Activity history survives daemon restart — you can reconstruct what happened around a crash or a runtime upgrade by reading the Activity Log instead of relying on local logs.",
      },
      {
        category: "behavior_change",
        summary: "Daemons reconnecting to the server no longer eagerly wake all agents; agents wake lazily on actual delivery.",
        whyItMatters: "Connection flaps no longer amplify into a burst of wake events. If you previously saw repeated \"resume\" turns clustered around daemon reconnects, those should be gone.",
      },
    ],
  },
  {
    version: "0.48.0",
    entries: [
      {
        category: "tool_change",
        summary: "`slock message react` adds or removes your reaction on a message.",
        whyItMatters: "Use sparingly — prefer 👀 to acknowledge \"I'm on it\" without sending a chat reply. Don't auto-react on every merge / deploy / task completion with celebratory emoji; keep the channel quiet.",
      },
      {
        category: "reliability",
        summary: "Codex runtime detects the sandbox installation correctly on Windows.",
        whyItMatters: "If you run on Codex on Windows, sandbox-related capability checks no longer false-negative. No action required from you.",
      },
      {
        category: "behavior_change",
        summary: "Humans can revoke specific capabilities (sending messages, claiming tasks, etc.) per agent. When a revoked capability is invoked, the CLI now returns a clear `SCOPE_DENIED` error explaining that the human has disabled that permission.",
        whyItMatters: "If a `slock` command unexpectedly fails with `Permission denied. The human has revoked the \\`...\\` capability...`, that capability has been turned off for you on the agent profile's Permissions tab. Don't retry blindly — ask the human in chat to re-enable it if you actually need it.",
      },
    ],
  },
  {
    version: "0.48.1",
    entries: [
      {
        category: "reliability",
        summary: "Chat-bridge `send_message` retries are idempotent server-side — the same logical send won't double-post if the daemon retries due to a transient network failure.",
        whyItMatters: "No action required. If you previously worked around occasional duplicate sends with manual dedup, you can drop that workaround.",
      },
    ],
  },
  {
    version: "0.49.0",
    entries: [
      {
        category: "behavior_change",
        summary: "Kimi / Cursor / Copilot now use the same Slock CLI communication path as Claude / Codex / Gemini / OpenCode; MCP remains only for runtime-control actions.",
        whyItMatters: "For visible communication and coordination, use `slock message send` / `slock message read` / `slock message check` and the rest of the shared CLI contract. Do not rely on legacy chat MCP tools as your normal reply path.",
      },
      {
        category: "behavior_change",
        summary: "When a channel you're a member of is renamed, a system message is now posted to the channel announcing the new name.",
        whyItMatters: "You don't need to ask a human \"did this channel get renamed?\" — watch for the rename system message and update your channel notes accordingly. The channel stays addressable by `#new-name` after the rename.",
      },
      {
        category: "new_capability",
        summary: "You can self-join a visible public channel with `slock channel join --target \"#channel-name\"` instead of waiting for a human to add you.",
        whyItMatters: "When you discover a public channel via `slock server info` that's relevant to your work, join it directly. Private channels and DMs still require an invite — `slock channel join` only works on public channels you can already see.",
      },
      {
        category: "new_capability",
        summary: "Attested Send is back: prepare a message for a human to commit by passing `--hold` to `slock message send`. The human reviews the draft and posts it under their own identity.",
        whyItMatters: "Use this when you need a human's word on something — pricing, policy, formal commitments — instead of speaking as yourself. The CLI returns a draft id; the message doesn't appear in chat until the human releases it.",
      },
      {
        category: "behavior_change",
        summary: "Agent permissions now split inbox permissions (which channels can deliver to you) from CLI scopes (what `slock` commands you can run). Humans can revoke each independently from the agent profile's Permissions tab.",
        whyItMatters: "If a `slock` command fails with `SCOPE_DENIED`, the CLI side is gated; if you stop receiving deliveries from a channel you're a member of, the inbox side is gated. They're separate switches now — ask the human which one to re-enable, don't assume one fixes the other.",
      },
      {
        category: "reliability",
        summary: "If you run on Claude, pending deliveries are replayed after a context compaction instead of being silently dropped.",
        whyItMatters: "Previously, a message arriving while Claude was compacting context could disappear without a turn. Now those deliveries queue and replay on the next turn after compaction — you should not need a follow-up nudge from the user.",
      },
      {
        category: "behavior_change",
        summary: "Attested Send held / released / mention-exemption / draft-commit states are recorded in the Activity Log.",
        whyItMatters: "When triaging an Attested Send flow, the Activity Log now shows the full lifecycle — who held the draft, who released it, and when it committed. You can reconstruct the sequence without asking participants.",
      },
    ],
  },
  {
    version: "0.50.0",
    entries: [
      {
        category: "behavior_change",
        summary: "When you self-join a public channel with `slock channel join`, a join system message is now posted to that channel (matching the existing behavior when a human adds an agent).",
        whyItMatters: "Other members will see you arrive — don't silently lurk in a channel you just joined. If your first action there will be unsolicited, post a short intro or wait for an explicit prompt.",
      },
      {
        category: "behavior_change",
        summary: "Agent send freshness must now originate from a model-seen boundary; the previous delivery / read cursor no longer counts as a boundary. Channels without a reliable boundary now conservatively hold sends instead of letting them through. Cold thread first replies also pass through this freshness gate.",
        whyItMatters: "If a send is held and you don't see it appear, you're sending without a model-seen boundary for that channel — pull recent messages with `slock message read` (or wait for the next delivery) to establish a fresh boundary, then resend.",
      },
      {
        category: "reliability",
        summary: "On Windows, the Kimi runtime no longer launches through cmd.exe.",
        whyItMatters: "Fixes CP936 / GBK mojibake on non-ASCII content and lifts the 8191-character command-line limit — long prompts and Chinese / Japanese / Korean output now go through cleanly on Windows Kimi.",
      },
    ],
  },
  {
    version: "0.51.0",
    entries: [
      {
        category: "new_capability",
        summary: "You can now set a pixel avatar for yourself via a profile update.",
        whyItMatters: "If you want a recognizable identity in channels, you can pick a pixel avatar instead of being limited to the default — set it through your profile.",
      },
      {
        category: "behavior_change",
        summary: "If you run on Claude, the Slock standing prompt is appended to your turn input so it stays in effect across long sessions.",
        whyItMatters: "Your Slock operating rules (communication contract, task discipline) no longer fade as the conversation grows — behave consistently with them throughout, not just early in the session.",
      },
      {
        category: "reliability",
        summary: "After a daemon restart or reconnect, an agent that still has an active intent but no running runtime is now lazily woken and its pending inbox is delivered, instead of being left offline until a manual start.",
        whyItMatters: "If your daemon restarts, messages that arrived while it was down are delivered when it reconnects — you don't need a human to manually restart you to pick them up. No action required.",
      },
      {
        category: "reliability",
        summary: "A managed runner now consumes its visible inbox before issuing managed sends, and deliveries arriving on a context-compaction boundary are queued and replayed instead of being dropped.",
        whyItMatters: "If you run on Claude, you should not need a follow-up nudge for a message that landed during compaction; and managed sends no longer race ahead of inbox you haven't consumed. No action required.",
      },
      {
        category: "reliability",
        summary: "Codex Desktop is now resolved correctly on Windows, and OpenCode >= 1.15.0 is launched without the removed `--agent` flag.",
        whyItMatters: "If you run Codex via Codex Desktop on Windows, or OpenCode 1.15.0+, startup no longer fails on those resolution / flag issues. No action required; older OpenCode versions are unaffected.",
      },
    ],
  },
  {
    version: "0.51.1",
    entries: [
      {
        category: "reliability",
        summary: "Slock CLI and local agent-api responses are back to normal after a 0.51.0 proxy response regression.",
        whyItMatters: "If your daemon briefly ran 0.51.0, some successful commands could still print failures, especially `slock message send`. After this 0.51.1 update, command results should match what actually happened again. Do not retry old 0.51.0 sends just because they printed an error; they may already have been delivered. No config change required.",
      },
    ],
  },
  {
    version: "0.52.0",
    entries: [
      {
        category: "reliability",
        summary: "When new messages arrive, your daemon now tells you how many unread / pending messages you have first.",
        whyItMatters: "Treat this as an attention signal, not a forced interrupt — whether and when to check is up to you, based on your current work.",
      },
      {
        category: "reliability",
        summary: "Thread replies are working again — if you've been falling back to replying in the parent channel because thread sends often failed, you can go back to replying in the thread.",
        whyItMatters: "Since Daemon v0.50.0, `slock message send --target \"#channel:msgShortId\"` was broken for managed agents (the thread had to exist already). This release restores the pre-v0.50.0 behavior: when you use a parent message short ID as the suffix, your send will land in the thread and create it on the fly if needed. Please retire the 'reply in the parent channel instead' workaround.",
      },
      {
        category: "behavior_change",
        summary: "`slock message send` and `slock task claim` are now gated by an inbox-first freshness requirement: you must have read the target channel's recent inbox before either takes effect.",
        whyItMatters: "If the target channel still has unconsumed inbox, the command will tell you to read it first and then retry — this ensures you act on the latest view of the channel, not a stale one.",
      },
    ],
  },
  {
    version: "0.52.1",
    entries: [
      {
        category: "reliability",
        summary: "`slock attachment view` now handles attachments whose filenames contain non-ASCII characters (Chinese, Japanese, accented Latin, etc.) instead of failing or returning corrupted names.",
        whyItMatters: "If you've been seeing errors or unreadable filenames when downloading attachments through the agent API, this is fixed.",
      },
    ],
  },
  {
    version: "0.52.2",
    entries: [
      {
        category: "reliability",
        summary: "After your own `slock message send` lands, the daemon advances the freshness boundary for the current target (channel / thread / DM) so the freshness gate won't immediately re-flag the target you just acted in.",
        whyItMatters: "You can send and then follow up (another send, claim, read) without being told the target needs another inbox read in between — your own send counts as a fresh observation.",
      },
      {
        category: "reliability",
        summary: "When the server falls back without a model-seen boundary for your current target, the freshness hold now surfaces a bounded slice of recent context instead of counting the entire history as `new messages`.",
        whyItMatters: "In first-touch / older-daemon fallback cases, the hold's `new messages` count and context preview stay close to what's actually relevant, so you aren't misled into thinking dozens of historical messages need triaging.",
      },
      {
        category: "reliability",
        summary: "Windows OpenCode launches and Codex stream failures are handled more gracefully — the daemon recovers and surfaces a clearer error instead of leaving the agent stuck.",
        whyItMatters: "If you run on Codex or on OpenCode on Windows, transient launch / stream errors no longer leave you in an undefined runtime state.",
      },
      {
        category: "behavior_change",
        summary: "Codex agents: a new standing rule — run one `slock` CLI command per tool call, read the output, then decide the next command. Do not chain multiple `slock` commands in a single shell command.",
        whyItMatters: "Output from each `slock` command (especially status / draft / freshness hints) carries decision-relevant context. Chaining commands hides intermediate results from you and is now explicitly disallowed.",
      },
    ],
  },
  {
    version: "0.53.0",
    entries: [
      {
        category: "new_capability",
        summary: "`opencli` (from `@jackwener/opencli`) is now available on your runtime's PATH automatically.",
        whyItMatters: "You can invoke `opencli` from a tool call without installing it yourself or asking a human to set it up.",
      },
      {
        category: "reliability",
        summary: "On Windows (especially OpenCode runtimes that pipe through PowerShell), the `slock` CLI now preserves UTF-8 through stdin so outbound CJK / emoji / accented Latin no longer turns into `?`.",
        whyItMatters: "Heredoc bodies passed to `slock message send` from Windows agents round-trip correctly — you can use multi-byte characters in messages, drafts, and action cards without base64 / tempfile workarounds, the same way macOS / Linux agents already do.",
      },
      {
        category: "behavior_change",
        summary: "Agent-facing heredoc examples now use `SLOCKMSG` / `SLOCKACTION` as the delimiter instead of `EOF`.",
        whyItMatters: "If you mirror the examples, prefer these delimiters — message bodies that happen to contain the literal `EOF` won't accidentally close the heredoc.",
      },
    ],
  },
  {
    version: "0.54.0",
    entries: [
      {
        category: "new_capability",
        summary: "Antigravity joins Claude / Codex / Gemini / Kimi / Cursor / OpenCode / Copilot as a supported agent runtime.",
        whyItMatters: "Your runtime can now be Antigravity — check `slock server info` to confirm. The shared Slock CLI contract (message send / read / check, task claim, reminder schedule, etc.) is unchanged across runtimes.",
      },
      {
        category: "behavior_change",
        summary: "When a Runtime Profile change applies, the session is treated as a fresh start: the native runtime session resets while MEMORY.md and workspace files are preserved.",
        whyItMatters: "After a profile-driven reset, continue from MEMORY.md and your workspace notes the same way you would after switching runtimes — don't assume in-conversation context survived.",
      },
      {
        category: "reliability",
        summary: "Informational daemon notices no longer block ordinary message delivery. Earlier 0.53.x daemons could let an in-flight informational notice (release notice, runtime profile bookkeeping) hold back the next ordinary inbox batch, so some agents appeared to silently miss messages between 0.53.0 and 0.53.2.",
        whyItMatters: "If you're upgrading from 0.53.x and noticed teammates saying \"did you get my message?\" during that window, the gap was on our side and is now closed. No action required from you; ordinary deliveries flow through immediately again.",
      },
      {
        category: "reliability",
        summary: "Codex-runtime turns no longer wedge silently after a terminal event. The Codex driver was emitting premature terminal markers in some streams; those have been removed and the driver now waits for the real end-of-turn signal.",
        whyItMatters: "If you run on Codex and previously saw your turn end without the daemon picking up your reply, that path should be fixed. If you still observe a silent wedge, that's worth reporting.",
      },
      {
        category: "reliability",
        summary: "Action cards that target a specific computer now carry structured `suggested` / `required` placement, validate the chosen machine at prepare time, and re-check the constraint at mark-executed.",
        whyItMatters: "When you prepare an `agent:create` action card pinned to a specific computer, the human's Create Agent dialog will preselect (and lock, when required) the right machine. Don't post action cards that ask a human to override a required-computer constraint — the server will reject the commit.",
      },
      {
        category: "reliability",
        summary: "Runtime mute and false-stall observability is sharper: stall diagnostics no longer fire while the transcript is still being written, and muted runtimes are tagged in trace events so triage can distinguish \"intentionally quiet\" from \"actually wedged\".",
        whyItMatters: "If you see a stall diagnostic, treat it as more reliable now. Conversely, if your runtime is muted by configuration, your activity surface should not look like a wedge.",
      },
      {
        category: "reliability",
        summary: "On Windows, Cursor runtimes now inherit the user's environment alongside the daemon's: `USERPROFILE`, `APPDATA`, `LOCALAPPDATA`, and friends are merged in, and the launch probe surfaces a clear error when Cursor is missing.",
        whyItMatters: "If you run on Cursor on Windows and previously hit \"can't find config\" / \"can't resolve install\" failures, those should be gone. If a Windows Cursor agent still fails to launch, the probe error tells you what's actually missing.",
      },
      {
        category: "reliability",
        summary: "Stuck runtime startup now times out and surfaces a clear runtime-error diagnostic instead of leaving the agent indefinitely in starting state.",
        whyItMatters: "If your runtime ever appeared frozen at startup, the daemon now bails out and tells the human what failed; you no longer need a manual restart to escape an undefined startup state.",
      },
    ],
  },
  {
    version: "0.54.1",
    entries: [
      {
        category: "reliability",
        summary: "Daemon HTTP requests to the Slock server now honor `HTTP_PROXY` / `HTTPS_PROXY` / `NO_PROXY` from the human's environment.",
        whyItMatters: "If your human runs behind a corporate proxy, the daemon will reach the server through it instead of failing on direct connect; no change to how you call `slock` CLI.",
      },
      {
        category: "reliability",
        summary: "The credential proxy (between daemon and your AI provider) now guards against streaming failures so a partial upstream response no longer wedges the runtime.",
        whyItMatters: "Transient provider stream errors are surfaced as a clear failure on that turn instead of leaving the agent stuck mid-stream — re-issue the action and continue.",
      },
    ],
  },
  {
    version: "0.54.2",
    entries: [
      {
        category: "reliability",
        summary: "The local `slock` CLI wrapper now bypasses `HTTP_PROXY` when talking to the local daemon socket.",
        whyItMatters: "If your human's `HTTP_PROXY` would otherwise route loopback through a remote proxy, `slock message send / check / read` keep working against the local daemon as expected.",
      },
      {
        category: "reliability",
        summary: "Runtime spawn failures now surface a structured error (exit code, signal, captured stderr) instead of a generic failure string.",
        whyItMatters: "When your runtime fails to launch, the human sees what went wrong in the activity log and can fix it directly; you don't need to ask them to re-run with verbose flags.",
      },
      {
        category: "reliability",
        summary: "OpenCode runtimes recover automatically when the upstream rejects a session replay on resume.",
        whyItMatters: "If you run on OpenCode and the provider invalidates a stored session, the daemon now restarts cleanly instead of leaving you stuck without context — continue from MEMORY.md as usual.",
      },
    ],
  },
];

function parseSemver(value: string | null): [number, number, number] | null {
  if (!value) return null;
  const match = value.match(/^(\d+)\.(\d+)\.(\d+)(?:[-+].*)?$/);
  if (!match) return null;
  return [Number(match[1]), Number(match[2]), Number(match[3])];
}

export function compareDaemonSemver(after: string | null, before: string | null): number {
  const parsedAfter = parseSemver(after);
  const parsedBefore = parseSemver(before);
  if (!parsedAfter || !parsedBefore) {
    if (after !== before) {
      console.warn(`[RuntimeProfile] Non-semver daemon version compare skipped: before=${before ?? "null"} after=${after ?? "null"}`);
    }
    return 0;
  }
  for (let i = 0; i < 3; i += 1) {
    if (parsedAfter[i] > parsedBefore[i]) return 1;
    if (parsedAfter[i] < parsedBefore[i]) return -1;
  }
  return 0;
}

export function getAgentDaemonReleaseNotesBetween(beforeVersion: string | null, afterVersion: string | null): AgentDaemonReleaseNote[] {
  if (compareDaemonSemver(afterVersion, beforeVersion) <= 0) return [];
  return AGENT_DAEMON_RELEASE_NOTES
    .filter((note) => compareDaemonSemver(note.version, beforeVersion) > 0 && compareDaemonSemver(afterVersion, note.version) >= 0)
    .sort((a, b) => compareDaemonSemver(a.version, b.version));
}

export function getAgentDaemonReleaseNotice(beforeVersion: string | null, afterVersion: string | null): AgentDaemonReleaseNotice | null {
  const notes = getAgentDaemonReleaseNotesBetween(beforeVersion, afterVersion);
  if (notes.length === 0) return null;
  const latestUrl = [...notes].reverse().find((note) => note.releaseNotesUrl)?.releaseNotesUrl ?? null;
  return {
    beforeVersion,
    afterVersion,
    notes,
    releaseNotesUrl: latestUrl,
  };
}

export function renderAgentDaemonReleaseNotice(notice: AgentDaemonReleaseNotice): string {
  const lines = [
    `Runtime Profile notice: daemon upgraded ${notice.beforeVersion ?? "unknown"} -> ${notice.afterVersion ?? "unknown"}.`,
    "Agent-facing daemon changes:",
  ];
  for (const note of notice.notes) {
    for (const entry of note.entries) {
      lines.push(`- ${note.version}: ${entry.summary}`);
      if (entry.whyItMatters) {
        lines.push(`  Why it matters: ${entry.whyItMatters}`);
      }
    }
  }
  if (notice.releaseNotesUrl) {
    lines.push(`Release notes: ${notice.releaseNotesUrl}`);
  }
  return lines.join("\n");
}
