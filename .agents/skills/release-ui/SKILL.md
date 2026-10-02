---
name: release-ui
description: Plan, review, and publish raft-ui releases from the actual stable package diff. Use when the user says "release", asks for a release dry run, requests a version recommendation or changelog, or explicitly asks to publish a raft-ui release. Generates English-only curated changelogs with PR or commit links, excludes WIP and docs-only work from public notes, and applies releases only after explicit publish authorization.
---

# Release UI

Treat the package's stable public surface as the source of truth. Use commits and pull requests only for traceability.

## Interpret the Request

- Treat `release` and `dry run` as read-only. Do not edit files, commit, tag, push, or publish.
- Treat an imperative `发布`, `publish this release now`, or an explicit apply request as authorization to apply the reviewed release. Questions about publishing are not authorization.
- Re-run the complete dry run immediately before applying a release. Stop if its result differs materially from the reviewed plan.

## Build the Release Inventory

1. Resolve the latest `v*` tag and inspect its range through `HEAD`.
2. Inventory every changed stable surface before reading commit titles:
   - `packages/ui/src/index.ts` and every transitively exported implementation
   - `packages/ui/src/styles.css`, `foundation.css`, and `fonts.css` (the public CSS and token contract), plus the `raft-ui/cn` entry
   - stable package entry points, exports, peer dependencies, and runtime requirements
3. Inspect public types, existing variant semantics, runtime behavior, rendered structure, styles, and accessibility behavior. An unchanged export list does not make an implementation change internal.
4. Inventory `packages/ui/src/wip.ts` separately. WIP ships with the package but never appears in the public changelog and never determines the semantic version.
5. Ignore docs, Playground, `packages/ui/skills`, tests, tooling, release commits, and other non-package work unless they alter the stable package output.
6. Assign every changed stable surface exactly one outcome: `Breaking Changes`, `Added`, `Changed`, `Fixed`, or `No Changelog`, with a concrete reason. Do not finish while a stable surface remains unclassified.

## Choose the Version

The package is pre-1.0:

- Use a minor bump for any stable breaking change.
- Use a patch bump for compatible stable additions, changes, or fixes.
- Use a patch bump for a WIP-only transport release, but do not add a changelog section.
- Recommend no release when neither stable nor WIP package output changed.

Treat removed or renamed exports, removed CSS tokens, incompatible type changes, changed meanings of existing variants, required DOM changes, and incompatible runtime requirements as breaking. Do not classify a change from its Conventional Commit prefix.

## Write the Changelog

- Write all headings and entries in English.
- Use only these sections, omitting empty ones: `Breaking Changes`, `Added`, `Changed`, `Fixed`.
- Describe consumer impact and migration steps, not implementation activity.
- Prefer a merged PR link. Add a commit link when no PR exists or when the PR does not cover the complete statement.
- Consolidate related implementation commits into one consumer-facing entry.
- Never mention WIP, docs-only changes, Playground work, source references, release chores, or internal refactors without stable consumer impact.

## Present a Dry Run

Return:

1. Compared tag and commit range.
2. Recommended version and the exact reason for its bump level.
3. The complete English changelog draft.
4. A stable-surface coverage table showing the classification or exclusion reason for every changed stable component, token contract, and package contract.
5. A separate statement that WIP will ship but is intentionally absent from the changelog, when applicable.

## Apply a Release

Require a clean worktree, an attached branch, and an up-to-date remote before mutation.

1. Update `packages/ui/package.json` to the reviewed version.
2. Prepend the reviewed entry to `packages/ui/CHANGELOG.md`. For WIP-only releases, leave the changelog unchanged.
3. Run `vp check --fix`, `git diff --check`, `vp run raft-ui#build`, and `vp pm pack --filter raft-ui` as the archive smoke check.
4. Review the final diff and verify that the package version, changelog version, and tag agree.
5. Commit only the release files with `chore(release): v<version>`.
6. Create the `v<version>` tag and push the commit and tag. The tag-triggered workflow performs npm publication and creates the GitHub Release from the curated changelog.

Never generate the changelog from commit messages or `git log`.
