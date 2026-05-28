# Testing SOP

This SOP defines how agents and humans should think about testing when changing Slock.

It is intentionally practical.
It should help answer:
- what must be tested
- who owns which testing work
- which test layer to choose
- what must be stated in the PR if coverage is missing

## Hard Rule

If a change is user-visible, the PR must clearly answer:

**Which automated check prevents this behavior from silently regressing?**

If the answer is "none in this PR", the PR must explicitly say why, what the risk is, and who owns the follow-up.

## Ownership

### Feature Owner
- Owns the first automated regression guard for the behavior they changed.
- Should choose the cheapest layer that can reliably lock the behavior:
  - unit
  - contract
  - integration
  - Playwright / e2e
- Must not treat "screenshot looks fine" as the default completion state for user-visible work.

### QA
- Owns higher-level user-story completeness and release confidence.
- Focuses on:
  - end-to-end user paths
  - cross-surface consistency
  - permission and negative cases
  - identifying automation gaps
  - validating that the chosen layer is appropriate
- Does **not** replace the feature owner as the default author of the first regression guard.

### Reviewer
- Must review the testing delta, not only the feature diff.
- Should ask:
  - what new behavior changed?
  - what failure mode matters most?
  - what automated layer covers it?
  - if no automated layer covers it yet, is the gap explicit and justified?

## When Testing Is Mandatory

Testing is mandatory when the change is any of the following:
- a new feature
- a user-visible behavior change
- a bug fix with a clear repro path
- a permission or visibility change
- a state-consistency change
  - examples: thread, DM, unread, navigation, message delivery
- a high-risk regression area
  - examples: auth, messaging, thread, channel membership, agent collaboration, mobile web

## Decision Tree

Use this flow before merging a change.

1. Is the change user-visible?
- No:
  - say why no user-visible behavior changed
  - still add lower-level tests if you changed logic with meaningful regression risk
- Yes:
  - continue

2. Does existing automated coverage already lock this behavior?
- Yes:
  - point to the exact test or check
  - explain why it still covers the new behavior
- No:
  - continue

3. What is the cheapest layer that can lock the behavior?
- unit:
  - pure logic or isolated helper/store behavior
- contract:
  - seam behavior, state transitions, adapter rules, parser/formatter logic
- integration:
  - multiple components or services interacting, but still below full user flow
- Playwright / e2e:
  - main user path
  - permission boundary
  - cross-surface state coherence
  - browser/runtime interaction that lower layers cannot meaningfully prove

4. If no automated test is added in this PR, is the gap explicit?
- Must include:
  - why not now
  - what risk remains
  - who owns the follow-up
  - where the follow-up lives
    - task link, PR link, or other concrete tracking artifact

If this cannot be answered clearly, the change is not ready to merge.

## Test Layer Guidance

### Unit / Contract / Integration

These layers should usually be split and routed as narrowly as possible.

Goals:
- fast feedback
- clean signal
- minimal unrelated red failures

Typical rule:
- choose the cheapest layer that proves the intended behavior without dragging in unrelated infra

Important maintenance rule:
- if implementation adds a new dependency to a previously isolated seam, update the seam too
- do not silently convert a light unit test into a hidden real-DB or real-service test by accident

Example:
- if a previously injected service path now directly calls database-backed logic, either:
  - inject the new dependency too
  - or move the new dependency into its own lower-level integration test
- do **not** break an existing unit-test layer without intentionally redesigning it

### E2E / Playwright

E2E is different.

Do **not** think about e2e as "frontend tests" versus "backend tests".
E2E exists to verify complete user stories and cross-system behavior.

That means:
- e2e should keep an end-to-end mental model
- e2e is chosen by user path and release risk, not only by file path
- many core e2e paths are inherently cross-frontend/backend
  - auth
  - channel messaging
  - thread reply
  - DM
  - agent collaboration

So:
- lower-level checks can be path-aware
- e2e should remain user-story-aware

## CI and Merge Gates

### Goal Principle

CI should make the red signal as relevant as possible to the changed surface.

The goal is **not** just to save machines.
The goal is to reduce unrelated failures so reviewers can tell whether this PR actually broke the thing being changed.

### Current Reality

The repository may not yet be perfectly split by surface/path.
Do not assume the ideal state already exists.

If the current CI layout still runs unrelated checks together, the PR must say:
- which checks actually ran
- which e2e coverage actually ran
- which unrelated failures exist, if any
- what blind spots remain

### v1 Suggested Layering

This is a **v1 suggested split**, not a permanent law.
It should evolve as repo layout, ownership, and test structure evolve.

Suggested approach:
- path-aware routing mainly applies to:
  - typecheck
  - unit
  - contract
  - integration
- e2e remains driven by user story and release risk

Current v1 suggestion:
- `packages/web/**`
  - default to web-focused typecheck/unit/contract checks
- `packages/server/**`
  - default to server-focused typecheck/unit/contract checks
- `packages/shared/**`
  - default to checks on both sides
- obvious cross-surface changes
  - run broader validation
- e2e
  - keep full end-to-end user-path thinking
  - do not redefine e2e as isolated front-end-only or back-end-only checks

## When CI Fails for an Unrelated Reason

When a PR is red, first classify the failing check as one of:
- caused by this PR
- unrelated baseline failure
- not yet determined

If the failure is caused by this PR:
- fix it in this PR
- do not merge until the regression is understood and closed

If the failure is unrelated:
- create a separate task or fix PR immediately
- assign a clear owner
- do **not** silently fold that unrelated fix into the current feature PR
- record the tracking link in the PR or thread

Then make the merge decision explicitly:
- if the unrelated failure is a global release blocker, QA or the release owner may block merge even though the red check is not caused by this PR
- if it is not a release blocker, the PR should not be treated as if it broke its own behavior

Every such case should explicitly record:
- the failing check
- whether it is related, unrelated, or still undetermined
- the tracking link for the independent fix
- the current merge decision
  - block
  - wait for independent fix
  - allow with explicit exception

The goal is to avoid two bad outcomes:
- unrelated red checks silently blocking unrelated work forever
- unrelated fixes being mixed back into a feature PR and making ownership unclear

## PR Requirements

Every user-visible PR should include a short testing section that answers:

- Change summary
- User-visible or not
- Risk surface
- What automated coverage exists for this change
- Who owns automated coverage for this change
- If owned by someone else:
  - handoff thread or task
  - expected completion date
  - follow-up owner
- If no automated test change:
  - why not now
  - what regression risk this introduces
  - what the follow-up plan is
- Reviewer can still answer which automated check prevents silent regression

## QA Workflow Guidance

When validating a change, QA should distinguish between these outcomes:
- feature behavior conclusion
- environment blocker
- test-seam / CI design issue
- validation still missing on another layer

Examples:
- "code-level root cause looks right, but real-device verification is still pending"
- "local validation is blocked by environment drift, not by feature behavior itself"
- "this PR is blocked by unrelated CI noise, not by its own changed behavior"

Do not collapse all of these into a single vague pass/fail statement.

## Current Repo Facts

These are examples of current repo facts that should be re-verified as the repo evolves:
- repo-level agent entry file is `AGENTS.md` -> `CLAUDE.md`
- current CI test workflow is `.github/workflows/test.yml`
- web package exposes:
  - `typecheck`
  - `test`
  - `test:e2e`
- server package exposes:
  - `typecheck`
  - `test`
  - `test:api`
- web Playwright suite currently lives under `packages/web/tests/e2e/tests`

If any of these change, update this SOP.

## Summary Principle

Feature owner owns the first regression guard.
QA owns higher-level user-story and cross-surface confidence.
Reviewers own checking that the testing story is explicit and credible.
