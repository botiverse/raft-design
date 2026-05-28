# Runtime Configuration Contract v1

Runtime configuration is a structured, versioned JSON value persisted on the
agent row as `agents.runtime_config`. Legacy `runtime`, `model`,
`reasoning_effort`, and `env_vars` remain launch mirrors for backward
compatibility, but runtime instantiation should derive from the hydrated
`RuntimeConfig` value.

## Shape

```ts
type RuntimeConfig = {
  version: 1;
  runtime: string;
  provider?: { kind: "default" } | { kind: "custom"; apiUrl: string };
  model: { kind: "preset"; id: string } | { kind: "custom"; name: string };
  mode: { kind: "default" } | { kind: "fast" };
  reasoningEffort?: ReasoningEffort | null;
  envVars?: Record<string, string> | null;
};
```

The server hydrates old rows into this shape at read and launch time. Renames
or legacy fields should be handled by the hydrator before the daemon sees the
config.

## Product Surfaces

The same contract must be editable in both surfaces:

- Create Agent dialog
- Agent profile Runtime Configuration editor

Those surfaces must not expose a setting that the selected runtime cannot
actually honor at launch time.

## Runtime Mappings

### Claude Code

- API URL: supported.
- Contract field: `provider.kind = "custom"` and `provider.apiUrl`.
- Launch mapping: `ANTHROPIC_BASE_URL=<apiUrl>`.
- Custom Model Name: supported.
- Contract field: `model.kind = "custom"` and `model.name`.
- Launch mapping: runtime model argument plus
  `ANTHROPIC_CUSTOM_MODEL_OPTION=<model.name>`.
- Reasoning Effort: supported.
- Contract field: `reasoningEffort = "low" | "medium" | "high" | "xhigh"`.
- Launch mapping: `claude --effort <reasoningEffort>`.
- Fast Mode: supported.
- Contract field: `mode.kind = "fast"`.
- Launch mapping: `claude --bare`.

`--bare` is Claude Code's minimal mode. It sets the launch to Claude Code's
fast/simple path and does not read OAuth or keychain credentials, so deployments
using Fast Mode must ensure the runtime has a compatible non-interactive auth
path available.

### Codex

- Preset Model: supported.
- Contract field: `model.kind = "preset"` and `model.id`.
- Launch mapping: Codex app-server thread request `model = <model.id>`.
- Custom Model Name: supported.
- Contract field: `model.kind = "custom"` and `model.name`.
- Launch mapping: Codex app-server thread request `model = <model.name>`.
- Reasoning Effort: supported.
- Contract field: `reasoningEffort = "low" | "medium" | "high" | "xhigh"`.
- Launch mapping: Codex app-server thread request
  `config.model_reasoning_effort = <reasoningEffort>`.
- Fast Mode: supported.
- Contract field: `mode.kind = "fast"`.
- Launch mapping: Codex app-server thread request `serviceTier = "priority"`.

### Cursor CLI

- Custom Model Name: supported.
- Contract field: `model.kind = "custom"` and `model.name`.
- Launch mapping: `cursor-agent --model <model.name>`.
- API URL: not supported by the current Cursor Agent CLI contract.
- Reasoning Effort: not supported.
- Fast Mode: not supported.

Verified locally against `cursor-agent --help` /
`cursor-agent --version = 2026.05.01-eea359f`: the CLI exposes `--model`,
`--api-key`, and `--header`, but no per-agent API/base URL flag or documented
environment variable. Slock must therefore show the API URL axis as unsupported
for Cursor rather than persist a false no-op. If Cursor adds an explicit launch
mapping later, add it as a `RuntimeConfig` hydrator/launch mapping change and
update the web copy in the same PR.

## Environment Ownership

Runtime-owned env keys must not be user-owned env vars. For Claude Code,
`ANTHROPIC_BASE_URL` and `ANTHROPIC_CUSTOM_MODEL_OPTION` are generated from
`RuntimeConfig`, stripped from user env var storage, and reintroduced only in
launch fields.

## Acceptance

- Create Agent can create a Claude Code agent with custom API URL and custom
  model name; the stored config and launch mirrors match.
- Agent profile can edit the same fields and restart/reset behavior still uses
  the existing runtime-change confirmation path.
- Cursor CLI shows Custom Model Name but marks API URL unsupported.
- Server rejects config axes for runtimes without a launch contract, including
  provider API URL, reasoning effort, and fast mode, instead of silently
  dropping them.
- Daemon launch proof can be checked from process args/env for argv/env-backed
  runtimes. Codex uses app-server request params, so `model`,
  `config.model_reasoning_effort`, and `serviceTier` are verified by driver
  request tests rather than process argv.
