# Stability Baseline: 2026-04

This document captures the stable conclusions from the 2026-04 stability line.
It is the durable baseline for future work in this area.

## 1. Project Summary

This line had three phases:

1. Bug-first correctness work
2. High-risk contract hardening on orchestrator/delivery/activity paths
3. Retrospective correction of low-leverage splits

The highest-value user-visible outcomes were:

- receive replay-safe / at-least-once semantics
- send retry-safe / idempotent semantics
- thread realtime-delivery gap-heal
- reconnect self-heal and bounded responsiveness
- clarified feedback/export semantics

The highest-value contract-proof outcomes were:

- send retry integration proof
- `getActivity()` resolution-order integration proof

The line also produced one explicit corrective cleanup:

- revert low-leverage activity tail splits that did not add enough bug-finding or contract-locking leverage

## 2. Retrospective Bar

### 2.1 What makes a change worth doing

A change is worth doing only if it materially increases one of:

- user-visible correctness confidence
- integration-level contract confidence
- protection against drift on a genuinely high-risk mixed path

If a change does not increase one of those, it should not exist.

### 2.2 Why `plan/apply` split exists

`plan/apply` split is justified only when it lowers the cost of validating a high-risk contract by separating:

- decision correctness: what the system should do
- effect correctness: how the system executes that decision

It is not justified for style, helper extraction, or low-density truth-table coverage.

### 2.3 When to split `plan/apply`

Split only when decision complexity and execution complexity carry meaningfully independent risk.

Typical reasons include:

- async lookup boundaries
- cross-replica ownership / routing
- source-of-truth competition
- replay / reconnect / idempotency boundaries
- expensive or dangerous side effects

Do not split when:

- the decision is trivial
- the apply path is trivial
- reviewer confidence still depends on reading both halves together
- the split does not create new bug-finding or review leverage

### 2.4 When to split into two PRs

Default rule:

- one seam should normally land in one PR

Only split `plan` and `apply` into separate PRs when each half creates independent review or bug-finding leverage.

If the reviewer still has to reason about both halves together to decide whether the change is safe, they should be in one PR.

### 2.5 Cleanup decisions

For retrospective cleanup, use only these three actions:

- `revert`
- `keep code, drop tests`
- `keep both`

Apply them with this rule:

- if the split itself was not worth existing, revert it
- if the seam is worth keeping but some tests have no independent contract coverage, keep code and drop tests
- otherwise keep both

## 3. Reopen Criteria / Watch Mode

The default state after this line is watch mode, not continuous rollout.

Reopen this project line only for one of:

- a new confirmed user-visible symptom
- an obviously missing high-signal integration proof
- a retrospective cleanup with strong consensus and clear leverage

Do not reopen just to preserve momentum or continue helper extraction.

## 4. Practical Use

When future work touches the same area, start here before debating approach.

Use this document to answer:

- what risks were already locked
- what kinds of splits are considered justified
- what kinds of splits were judged low-leverage and reverted
- what evidence is required before reopening the line
