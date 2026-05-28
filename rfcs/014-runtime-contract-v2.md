# RFC-014: Runtime Contract V2

**Status:** Draft
**Date:** 2026-05-02

## Context

Slock now ships several built-in runtimes: Claude, Codex, Kimi, Cursor,
Gemini, Copilot, and OpenCode. They differ in lifecycle, steering, prompt
placement, session persistence, model discovery, and communication transport.

The current `RuntimeDriver` interface grew by accretion and encodes these
differences through independent booleans such as `supportsStdinNotification`,
`busyDeliveryMode`, `terminateProcessOnTurnEnd`, and
`usesSlockCliForCommunication`. Those flags work, but they do not state the
runtime contract directly.

This RFC describes the cleanup direction for built-in drivers. It is not an
extension loader design. Future user extensions should be informed by this
contract shape, but this version keeps built-in drivers as TypeScript classes.

## First Principles

A runtime is an agent host adapter, not just a model provider. It must satisfy
these Slock invariants:

1. The agent receives Slock work in the right conversation context.
2. The agent has a deterministic visible Slock communication path.
3. The daemon can tell whether a turn is active, idle, complete, failed, or
   recoverable.
4. Native runtime session state has an explicit recovery policy.
5. Model/provider detection matches launch behavior, or is marked as a
   suggestion only.

## Proposed Built-In Contract Shape

```ts
interface RuntimeDriverV2 {
  id: string;
  lifecycle: RuntimeLifecycleContract;
  communication: RuntimeCommunicationContract;
  session: RuntimeSessionContract;
  model: RuntimeModelContract;

  // Existing imperative adapters remain built-in implementation details.
  probe?(): RuntimeProbeResult;
  spawn(ctx: SpawnContext): SpawnResult;
  parseLine(line: string): ParsedEvent[];
  encodeStdinMessage(...): string | null;
  buildSystemPrompt(...): string;
  detectModels?(): Promise<RuntimeModelSet | null>;
}
```

### Lifecycle

```ts
type RuntimeLifecycleContract =
  | {
      kind: "persistent";
      stdin: "direct" | "gated" | "notification";
      inFlightWake: "queue" | "steer";
    }
  | {
      kind: "per_turn";
      start: "immediate" | "defer_until_concrete_message";
      exit: "natural" | "terminate_on_turn_end";
      inFlightWake: "spawn_new" | "coalesce_into_pending";
    };
```

This makes runtime lifecycle a single policy object instead of a cross-product
of flags. It covers the current families:

- Claude: persistent, gated stdin, queued in-flight wake.
- Codex/Kimi: persistent, direct stdin, steer in-flight wake.
- Cursor/Gemini/Copilot: per-turn, immediate start, natural exit.
- OpenCode: per-turn, defer until concrete message, terminate after turn end,
  coalesce pending non-concrete wake.

### Communication

```ts
type RuntimeCommunicationContract = {
  chat: "slock_cli" | "mcp_chat_bridge";
  runtimeControl: "mcp_runtime_actions" | "none";
};
```

Visible Slock communication is product-level behavior and must be explicit:

- `slock_cli`: daemon injects the local `slock` wrapper and dynamic prompts
  instruct the runtime to use `slock message send/read/check`.
- `mcp_chat_bridge`: daemon exposes chat tools through the MCP bridge and
  dynamic prompts use that tool surface.

All current built-in drivers also expose `mcp_runtime_actions` for runtime
control. For `mcp_chat_bridge` drivers this is the same bridge process; for
`slock_cli` drivers it is a scoped runtime-actions-only bridge used for
non-chat control such as Runtime Profile migration acknowledgment.

Do not call the MCP path `legacy` in the formal type. It describes a current
mechanism, even if the product direction is CLI-first.

### Session Recovery

```ts
type RuntimeSessionContract = {
  recovery: "fresh" | "resume_or_fresh";
};
```

If a runtime supports native resume, the daemon still needs to know what to do
when that native session is missing. OpenCode's #1237 -> #1249 state-root
migration and #1256/#1260 missing-session fixes are the concrete example:
resume failure must cold-start and preserve the triggering wake context.

All current built-in drivers use `resume_or_fresh`. The `fresh` value is
reserved for future explicitly ephemeral runtimes or no-resume modes where the
daemon should never attempt native resume.

### Model Verification

```ts
type RuntimeModelVerification = "launchable" | "suggestion_only";

interface RuntimeModelInfo {
  id: string;
  label: string;
  verified?: RuntimeModelVerification;
}

interface RuntimeModelContract {
  detectedModelsVerifiedAs: RuntimeModelVerification;
  toLaunchSpec?(
    modelId: string,
    ctx?: SpawnContext,
    opts?: { home?: string },
  ): RuntimeModelLaunchSpec;
}
```

Models should be marked `launchable` when the driver has a deterministic launch
path for the model id. Official CLI catalogs can be `launchable` when launch is
just a direct model-id argument. Driver-detected custom provider models should
be `launchable` only when the driver can derive the full launch surface from
the same source used by `spawn()`: args, env, config content, and any config
files. `suggestion_only` is for entries that may require missing user provider
config; the UI may show them, but should warn that the model has not been
verified with the current machine config. OpenCode's custom-provider regression
enforces this by comparing `toLaunchSpec()` against the actual spawn launch
builder.

## Current Runtime Matrix

| Runtime | Lifecycle | Communication | Session | Model verification |
| --- | --- | --- | --- | --- |
| Claude | persistent/gated/queue | slock_cli + runtime-actions MCP | resume_or_fresh | launchable |
| Codex | persistent/direct/steer | slock_cli + runtime-actions MCP | resume_or_fresh | launchable |
| Kimi | persistent/direct/steer | mcp_chat_bridge | resume_or_fresh | launchable |
| Cursor | per_turn/immediate/natural | mcp_chat_bridge | resume_or_fresh | launchable |
| Gemini | per_turn/immediate/natural | mcp_chat_bridge | resume_or_fresh | launchable |
| Copilot | per_turn/immediate/natural | mcp_chat_bridge | resume_or_fresh | launchable |
| OpenCode | per_turn/defer/terminate | slock_cli + runtime-actions MCP | resume_or_fresh | launchable |

## Cleanup Plan

1. Introduce structured contracts while preserving behavior.
2. Add baseline tests for every lifecycle family and communication mode in the
   same PR that introduces the contract.
3. Replace daemon branching over loose booleans with contract accessors.
4. Extract shared launch helpers for Slock CLI, runtime-actions MCP, full chat
   MCP, prompt files, and config files.
5. Migrate Kimi to the shared CLI transport path separately if the diff is too
   large for the first contract PR.
6. Expand lifecycle-family acceptance tests, including model detect/launch
   round-trip tests for `launchable` models.

Because this is release-freeze season, these cleanup PRs are not quick fixes.
They should not merge to staging without explicit @stdrc or @tygg approval.

## Future Extension Sketch

A future extension API should not expose the built-in TypeScript class shape.
The likely direction is manifest plus normalized event protocol:

- manifest: runtime id, display name, binary/probe command, lifecycle,
  communication, prompt placement, model detection, required env/config files
- launch adapter: argv/env/config templates using Slock-provided variables
- event protocol: runtime emits Slock-normalized NDJSON `ParsedEvent` records,
  or declares a built-in parser adapter
- model detection: static manifest list or command output schema

Slock should continue to render canonical prompt text from declared
capabilities; extensions should not fork Slock's task/chat/reminder workflow
prompt.
