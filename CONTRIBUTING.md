# Contributing

This repository holds the Raft Design System guidelines, raft-ui and its documentation site. This page covers how to set up the workspace and what a pull request needs.

Issues and pull requests are open to the repository's collaborators. If you are not one, start a thread in [Discussions](https://github.com/botiverse/raft-design/discussions) for a question, a bug or a proposal; a maintainer turns it into an issue when there is work to do.

## Setup

The workspace uses [Vite+](https://viteplus.dev) (`vp`) and pnpm. The required Node.js versions are listed under `engines` in the root `package.json`.

```bash
vp install   # install dependencies
pnpm dev     # run the documentation site locally
```

The documentation site reads raft-ui from source, so changes in `packages/ui` show up without a separate build. `vp run @botiverse/raft-ui#build` builds the package itself.

## Checks

Run these before opening a pull request. CI runs the same checks.

```bash
vp check        # format, lint and type-check (vp check --fix applies fixes)
vp run -r test  # tests in every package
```

## Where things live

| Path                               | What it holds                                                                                 |
| ---------------------------------- | --------------------------------------------------------------------------------------------- |
| `design/`                          | The guidelines: foundations, components, patterns and recorded decisions.                     |
| `packages/ui`                      | raft-ui: tokens, CSS foundations and the React components.                                    |
| `apps/doc/src/modules/<component>` | Each component's executable examples (`compositions/`), its preview, fixtures and constants.  |
| `apps/doc/src/routes`              | Documentation pages. A component page arranges its module's examples; it holds no other code. |

Dependencies point one way: `packages/ui` never imports from `apps/doc`. [`AGENTS.md`](./AGENTS.md) and [`apps/doc/AGENTS.md`](./apps/doc/AGENTS.md) describe the component architecture, the styling conventions and the rules for documentation code in more detail.

## Guidelines and code change together

`design/` is the source for how things look. A change that alters how something looks updates the guideline it follows in the same pull request. A change that overrides a decision record also adds a new record in `design/decisions/` and marks the earlier one superseded; a change to a smaller rule updates the rule and its reason where they are written. When raft-ui and a guideline disagree, fix one of them.

[`design/authoring/README.md`](./design/authoring/README.md) describes where each documentation page lives, which page types exist and how to write them.

## Commits and pull requests

Commit messages follow [Conventional Commits](https://www.conventionalcommits.org): `type(scope): description`, for example `fix(ui): keep the dialog title on one line`.

A pull request describes the change, names the guideline it updated or says why none was needed, and lists the checks that were run.

## Releases

Maintainers cut raft-ui releases and write the changelog. Contributors do not need to change the version or `packages/ui/CHANGELOG.md`.

raft-ui is published to npm as `@botiverse/raft-ui`. Pushing a `v<version>` tag runs `.github/workflows/publish.yml`, which publishes through npm trusted publishing and creates the GitHub Release; `scripts/publish-by-hand.sh` covers the case the workflow can't, the first release of a package name.

## License

Contributions are licensed under the MIT License, as described in [`LICENSE`](./LICENSE). Fonts and brand assets are covered separately in [`NOTICE.md`](./NOTICE.md).
