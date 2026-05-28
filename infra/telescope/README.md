# Self-hosted Telescope on Fly.io (production)

OTLP collector + ScopeDB writer for the production Slock server. The
production Slock app exports OpenTelemetry traces to `slock-telescope`
over Fly's private network; downstream querying happens against ScopeDB.

The app is **internal-only**. There is no `[[services]]` block in
`fly.toml`; OTLP (4317/4318), the HTTP API (8080), and the health server
(13133) are reachable only via Fly private networking
(`slock-telescope.internal:<port>`) or `flyctl proxy`. Do not add a public
service to this config without an explicit owner-level decision.

This Fly app was previously deployed by hand from an untracked local
draft. This directory is now the operational source-of-truth for the
production Telescope app: deploys go through
`flyctl deploy --config infra/telescope/fly.toml`, and any configuration
change must be reviewed in a PR before it touches the live app.

The Telescope binary itself is built upstream from
[`scopedb/telescope`](https://github.com/scopedb/telescope); only this
Slock-specific Fly config lives here.

## Topology

Per the slock server configs in this repo:

- `slock-server` (`fly.toml`) → OTLP → `slock-telescope.internal:4318`
  (managed by this directory).
- `slock-server-staging` (`fly.staging.toml`) → OTLP →
  `slock-telescope-staging.internal:4318` — a separate Fly app whose
  config is **not** managed here. Git-izing the staging Telescope is a
  follow-up.

There is also a `slock-telescope-prod` Fly app placeholder with no
machines; it is not used.

## Health check

`fly.toml` declares a `[checks.healthz]` HTTP probe against
`TELESCOPE_HEALTH_ADDR` (port 13133, path `/healthz`). The check uses
`restart_limit = 5` because the queue directory lives on a Fly volume and
restart storms are expensive.

To verify reachability locally:

```bash
flyctl proxy 13133:13133 -a slock-telescope
curl -i http://127.0.0.1:13133/healthz
```

A healthy response is HTTP 200 with a body like
`{"status":"Server available", ...}`.

## Secrets

Managed via `flyctl secrets set`, never committed:

- `TELESCOPE_SCOPEDB_ENDPOINT`
- `TELESCOPE_SCOPEDB_API_KEY`

If these are lost, ask whoever currently holds them. `flyctl secrets list`
shows digests but not values.

## Updating

All commands run from the **project root directory**.

```bash
# 1. Validate the config locally before deploying.
fly config validate --config infra/telescope/fly.toml

# 2. Deploy.
fly deploy --config infra/telescope/fly.toml -a slock-telescope

# 3. Verify the rollout.
fly status -a slock-telescope
fly config show -a slock-telescope    # confirm checks.healthz is present
fly proxy 13133:13133 -a slock-telescope &
curl -i http://127.0.0.1:13133/healthz
```

Telescope is a stable collector and is not redeployed often. Most days
nothing here changes. When it is redeployed, traces buffered to the
volume queue should drain after the new machine becomes healthy.
