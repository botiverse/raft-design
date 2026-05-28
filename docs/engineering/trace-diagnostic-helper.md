# Trace Diagnostic Helper

Use `scripts/trace-diagnostic.py` when a report includes **Slock Diagnostic Info** and you need a repeatable first-pass ScopeDB trace lookup.

The helper does not fix runtime bugs. It turns the diagnostic block into bounded ScopeDB queries and prints a report that can be pasted back into the incident thread.

## Input

Paste a diagnostic block with at least `reportedAtUtc`.

Useful fields:

- `serverId`
- `agentId`
- `machineId`
- `runtime`
- `model`
- `daemonVersion`
- `agentStatus`
- `activity`
- `activityKind`
- `lastActivityAtUtc`

## Setup

Set ScopeDB credentials in the environment:

```bash
export SCOPEDB_ENDPOINT=...
export SCOPEDB_API_KEY=...
```

For local operator machines, you can also keep them in `.env.scopedb` at the repo root. The repo ignores `.env.scopedb`; do not commit credentials.

## Run

```bash
cat > /tmp/diagnostic.txt <<'EOF'
Slock Diagnostic Info
reportedAtUtc: 2026-05-18T07:44:03.737Z
serverId: adda35f7-b663-408e-8401-4dfcca7169b7
agentId: b46b3ba5-4012-42c3-86c5-3f41f73277bf
machineId: 31f88154-3171-40d6-af98-67dee4951901
runtime: claude
model: opus
daemonVersion: 0.48.1
agentStatus: active
activity: error
activityKind: error
lastActivityAtUtc: 2026-05-18T07:39:22.140Z
EOF

python3 scripts/trace-diagnostic.py \
  --input /tmp/diagnostic.txt \
  --env production \
  --window-minutes 10
```

If you are not sure which environment produced the diagnostic, omit `--env` first, then rerun with the matching env to reduce scan cost.

## Output

The markdown report includes:

- the exact time window and identity filters used;
- span counts grouped by environment, service, span name, status, and HTTP code;
- error / suspicious spans such as runtime errors and HTTP 5xx;
- recent matching spans in chronological order;
- next checks when no spans or only partial spans are found.

Use `--json` if you need machine-readable output, and `--print-sql` if you want to inspect the generated ScopeQL before running it.

## Notes

- The helper searches diagnostic IDs inside `record['attributes']` because many Slock-specific trace attributes are intentionally not promoted to top-level ScopeDB columns.
- It bounds every query by `reportedAtUtc ± --window-minutes`. Widen the window only when the first report shows no matching spans.
- It treats trace rows as diagnostics, not source-of-truth product state. When behavior matters, confirm against the relevant server tables or product surface after using this report to find the likely trace window.
