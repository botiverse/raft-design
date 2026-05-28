# Perf Route Cluster Lookup

Lane 3 consumer lookup for `route_pattern -> commit_hypothesis`.

This table is append-only. If a later investigation needs a new mapping, add a
new row instead of rewriting the prior one so the attribution trail stays
auditable.

## v0

| Route cluster | Hypothesis |
| --- | --- |
| `/api/servers/:id/members/:memberId/profile` | `#734` / `53cd4906` |
| `/api/servers/:id/members/:memberId/role` | `#740` / `40bbb2e5` |
| same-minute resonance of the two rows above | `#734 × #740` compound |
| `/internal/agent/:id/*` | `#741` / `a3c22b4b` + `3745a9cf` |
| `/api/messages/channel/:channelId?before=*` | `02ded56c` / visibilitychange-history refetch hypothesis |
| `POST /api/auth/login` | authLimiter config-layer hypothesis |

## Source semantics

- `prod`: fly-metrics authority, no route labels
- `staging`: fly + scenario-driven logs
- `ci`: app-side instrumentation only

`ci` is a behavior source, not a production traffic subset. Do not compare its
absolute counts to production volume; only compare relative route / limiter /
caller-context shape.
