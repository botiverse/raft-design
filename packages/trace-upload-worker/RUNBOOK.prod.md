# Prod trace-upload deployment runbook

> **Pairs with** repo-root `fly.trace-upload.prod.toml`. Modelled on the staging bring-up (2026-05-08); see `fly.trace-upload.staging.toml` for comparison.
>
> **Scope:** stand up `slock-trace-upload` Fly app in prod and activate it behind a canary daemon. Merging this file and the adjacent prod toml is **ship-config only** — it does not create the app, the R2 bucket, any secret, or flip any daemon env.

---

## Two deploy gates — don't conflate

Per @Leiysky 2026-05-08 (`04ae694f`), acknowledging @Eric's (Y) path:

1. **Ship config** (PR merge only). `fly.trace-upload.prod.toml` + this runbook PR base-`staging`. Merge + `staging → production` cut = text lands in repo + trace pipeline commits reach `production` branch. **No Fly app, no R2 bucket, no secrets, no daemon env changes.** Prod stays dormant.
2. **Activate** (build app + create R2 bucket + stage secrets + deploy + canary daemon). **All of these are gated on #99 phase 2 narrative green.** Not just the canary flip — app creation itself waits. This is strictly stricter than the original "dormant deploy early" idea and is the binding Leiysky gate.

Rolling them together is what caused the (X)/(Y) debate with @tygg 2026-05-08. Keep them separate in PR title and description.

---

## Pre-activation gates (before ANY of: create app / create R2 bucket / stage secrets / deploy / canary)

All must be green. No exceptions — per @Leiysky gate (`04ae694f`), the Fly app itself does not come up early.

- [ ] PR with `fly.trace-upload.prod.toml` + this runbook merged into `staging`
- [ ] `staging → production` cut complete; `origin/production` contains:
  - [ ] `f286ab84` (#1434 trace upload service on Fly, dual-runtime worker)
  - [ ] `819e76c2` (#1436 S3 adapter raw gzip readback fix)
  - [ ] `7c2399e3` (#1432 server OTLP relay)
  - [ ] `de6ad0eb` (#1410 worker daemon trace bundle ingest)
  - [ ] `ad5ecb3a` (daemon local trace bundle upload)
  - [ ] `9c002fda` (daemon trace upload worker scaffolding)
- [ ] `slock-server` (prod) rolling deploy green on the above
- [ ] **#99 phase 2 narrative green** — @Jianwei signs off server/daemon trace join E2E on staging. This is the binding Leiysky gate. Until this flips green, prod stays in "config shipped, path not built" state.

---

## One-time resources to create (manual, before first deploy)

Owner: @tygg (has R2 + Fly prod org creds).

1. **R2 bucket:** `slock-daemon-trace-bundles-prod` (independent from staging bucket). Region: same CF account.
2. **R2 S3 token:** new CF R2 token, scope = **Object Read & Write** on `slock-daemon-trace-bundles-prod` only. Do NOT reuse staging token. Record:
   - `R2_ACCESS_KEY_ID` (32 hex)
   - `R2_SECRET_ACCESS_KEY` (64 hex)
   - `R2_ENDPOINT` = `https://<account>.r2.cloudflarestorage.com` (same account as staging)
3. **Fly app:** `slock-trace-upload` (org: the Fly org that owns `slock-server` / `slock-telescope` in prod). Region `sin`.
4. **Attestation secret:** read live prod value from `slock-server`:
   ```bash
   flyctl ssh console --app slock-server --machine <any-machine-id> -C "printenv SCOPE_ATTESTATION_SECRET"
   ```
   **Do not rotate.** `packages/server/src/lib/scopeAttestation.ts` is single-secret, no primary+secondary / no grace window. Any rotation needs a separate coordinated change.

---

## Deploy steps

Run from the **repo root** on a checkout of `origin/production` after the gates above.

```bash
# 1. Create app (one time)
flyctl apps create slock-trace-upload --org <slock-prod-org>

# 2. Stage secrets (all four, atomic)
flyctl secrets set --stage --app slock-trace-upload \
  R2_ACCESS_KEY_ID="<value>" \
  R2_SECRET_ACCESS_KEY="<value>" \
  R2_ENDPOINT="https://<account>.r2.cloudflarestorage.com" \
  SCOPE_ATTESTATION_SECRET="<value-copied-from-slock-server>"

# 3. Sanity: list staged secrets (no values printed)
flyctl secrets list --app slock-trace-upload

# 4. Deploy
flyctl deploy --app slock-trace-upload --config fly.trace-upload.prod.toml --local-only

# 5. Confirm machines
flyctl status --app slock-trace-upload       # expect 2 machines, both started, in sin
```

---

## Post-deploy smoke (reuse staging 4-step, adapted)

All smoke runs go against `https://slock-trace-upload.fly.dev`. Same scripts as staging — just change `baseUrl` and `DEPLOYMENT_ENV`. No daemon traffic yet.

| # | Step | What it checks |
|---|------|----------------|
| 1 | `GET /healthz` → 200 | App up, `/healthz` wired |
| 2 | `POST /api/trace-bundles` with valid scope-attestation → 200 signed URL; `PUT` object to signed URL → 2xx | Attestation verify + S3 signed URL path |
| 3 | `aws s3api head-object --bucket slock-daemon-trace-bundles-prod --key trace-bundles/<serverId>/<machineId>/<uploadId>.jsonl.gz` → `ContentEncoding=gzip`, `ContentType=application/x-ndjson`, custom metadata present. Use the exact `objectKey` returned in the attestation response (format: `trace-bundles/<serverId>/<machineId>/<uploadId>.jsonl.gz`). | Raw gzip preserved end-to-end (PR #1436) |
| 4 | Send daemon-local-span-record NDJSON (format per `ac18fdce`, NOT OTLP envelope) → no `[TraceUploadWorker] trace bundle ingest failed` in `flyctl logs` within 30s | OTLP forward to `slock-telescope.internal` working |

Smoke script: reuse the staging-bringup smoke (same shape as staging E2E). Parameterize `baseUrl` → `https://slock-trace-upload.fly.dev`, `deploymentEnvironment: 'production'`, and re-read `SCOPE_ATTESTATION_SECRET` from the prod `slock-server` machine. Keep the daemon-local-span-record NDJSON shape; do not send an OTLP `ExportTraceServiceRequest` envelope — the worker rejects that at ingest.

---

## Activation (canary daemon) — separate decision

**Requires #99 phase 2 narrative green first** per Leiysky gate.

Options for pointing daemons at prod worker (owner: @tygg to pick):

- **(a) Daemon-baked default** — bake `https://slock-trace-upload.fly.dev` as default in `packages/daemon/src/core.ts`, ship as minor version bump. Activates for every daemon on upgrade. Needs explicit off-switch. Recommended for post-canary rollout, not canary.
- **(b) User-exported env** — pick 1 cooperating operator / machine, set `SLOCK_DAEMON_TRACE_UPLOAD_URL=https://slock-trace-upload.fly.dev` in daemon env, restart. Recommended for canary.
- **(c) Server-pushed config** — add server → machine config push over existing WS. More infrastructure, post-canary.

**Canary (option b):**
1. Pick one non-critical machine — @tygg decision, see the *Decisions required before activation* section.
2. Set env + restart daemon.
3. Run small E2E: real daemon trace → R2 object written → ledger shows `r2_status=success`, `scopedb_status=success`, `spans_ingested > 0`, `batches_sent > 0` (shape matches staging: `{ "upload_id": "...", "bundle_id": "...", "bundle_sha256": "...", "bundle_size_bytes": <int>, "r2_status": "success", "scopedb_status": "success", "spans_ingested": <int>, "batches_sent": <int> }`).
4. Watch for 30 min: Fly logs clean, no `exceeds ingest decompressed byte limit`, no `Invalid trace span record`, Telescope dashboards show prod spans.
5. Green → ping @Leiysky + @tygg for rollout decision (option a or c).

---

## Rollback

Three levels, from cheapest to heaviest:

1. **Activation rollback (fast, ~30s):** unset `SLOCK_DAEMON_TRACE_UPLOAD_URL` on canary daemon + restart. Daemon returns to local-JSONL-only. Zero prod Fly app change.
2. **Dormant rollback (minutes):** `flyctl machines stop --app slock-trace-upload`. App stays but stops accepting traffic. Daemon calls fail, daemon uploader logs error and moves on (no trace dependency in daemon critical path).
3. **Full rollback (slow):** `flyctl apps destroy slock-trace-upload` + revoke R2 token. Only if the above don't help. Requires re-creating the app.

Daemon release rollback is a **separate** path and handled by @Eric (npm unpublish / deprecate). Not needed unless daemon code itself is the problem.

---

## Post-cutover cleanup

- [ ] Remove any local copies of prod R2 credentials (`R2_ACCESS_KEY_ID`, `R2_SECRET_ACCESS_KEY`, `R2_ENDPOINT`) and `SCOPE_ATTESTATION_SECRET` from the operator machine used for activation.
- [ ] Delete any local draft copies of this runbook or the prod toml — canonical versions live in this repo.
- [ ] Scrub daemon env used for canary if the canary machine is retired or re-purposed.

---

## Decisions required before activation

1. **App name:** `slock-trace-upload` (matches `slock-server` / `slock-telescope` no-suffix prod style) vs `slock-trace-upload-prod` (symmetric with staging). Config in this repo uses no suffix; change here if @tygg prefers the suffixed form.
2. **Fly org:** the Fly org that owns `slock-server` / `slock-telescope` in prod. @tygg to confirm at `flyctl apps create` time.
3. **Canary machine:** which daemon gets env flipped first. @tygg picks.
4. **Daemon-baked default rollout strategy (option a):** after canary green, bundle a default `SLOCK_DAEMON_TRACE_UPLOAD_URL` in the next daemon minor, or push via server-config? Defer to post-canary, re-visit with @Leiysky + @Eric.
