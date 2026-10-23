---
title: Authoring the docs
summary: How the Raft Design System documentation is organized, what is written by hand and what is generated, and how pages are linked.
---

# Authoring the Raft Design System docs

This folder describes how the design system's documentation is organized and written. It applies to everything under `design/` and to the component docs in `packages/ui`. Read it before you add, move or rewrite a page.

- [Writing guide](./writing.md): voice, rules, terms and Markdown conventions.
- [Templates](./templates/): one per page type.

## Readers

Three kinds of readers use these docs, and every page is written for all three:

- **Product engineers** who need the right component, its rules and working code.
- **Designers** who need the reasoning behind a rule and the values it uses.
- **Agents** that fetch a single page as Markdown (from the site's `llms.txt` or straight from the repository) and act on it without reading anything else.

The third group is why each page has to stand on its own: an agent that reads only `drawer.md` must still learn when to use a drawer, what it is made of and what it must not do.

## Where things live

```text
design/
  README.md               The home page: what the system is for and where to start
  principles/             Why Raft looks the way it does, the principles with their reasons,
                          and how to design a new feature
  people-and-agents/      How people and agents share a server: identity, presence,
                          working agents, handoffs and approvals, writing about agents
  foundations/            Values and the rules for using them: color, typography, spacing,
                          alignment, comfort, shape, elevation, motion, states, iconography, brand,
                          dark mode, accessibility, tokens
  content/                Voice and tone, UI writing, terminology
  patterns/               How components combine into screens, for every Raft product:
                          page structure, navigation, tasks, conversation, forms, feedback,
                          responsive layout
  components/overview.md  The two layers, how to choose a component, built from existing parts
  products/<product>/     Structure that belongs to one product only (raft-chat first)
  decisions/              Records of the major decisions, one file each, plus open questions
  about/                  Using raft-ui
  authoring/              This guide
  assets/  fonts/         Logos, pixel avatars, reactions and font files

packages/ui/src/components/<component>/<component>.md
                          One doc per component, next to its code
packages/ui/src/tokens.json
                          The single source for token values (DTCG format), published as
                          @botiverse/raft-ui/tokens.json; foundation.css is generated from it
```

Component docs sit next to the code so that a change to a component and a change to its rules land in the same pull request. The rest of the guidelines stay in `design/` because they are about more than one component.

A page belongs to exactly one place:

| If the page is about | It goes in |
| --- | --- |
| Why the system is the way it is, or how to approach new work | `principles/` |
| How people and agents work together, in any product | `people-and-agents/` |
| A value or a rule that every component follows | `foundations/` |
| How the product sounds, what it calls things | `content/` |
| One exported component (and its parts) | `packages/ui/src/components/<component>/<component>.md` |
| How several components work together, in any product | `patterns/` |
| The structure of one product: its destinations, its screens, what goes where | `products/<product>/` |
| A major, cross-cutting choice and the options it was weighed against | `decisions/` |

Put the reason for a rule next to the rule, in the page that owns it. A decision record is only for a choice big enough to need its alternatives written down.

## What is written and what is generated

Write only what cannot be derived from code. The site builds the rest:

| Content | Source |
| --- | --- |
| Rules, reasoning, when to use what | Markdown in this repository |
| Token values and their tables | `packages/ui/src/tokens.json` |
| Props, parts and their types | The component's TypeScript |
| Live examples and their source | Compositions in `apps/doc/src/modules/<component>/compositions` |
| Component index, `llms.txt`, `components.json` | Front matter of the component docs |

Never copy a value, a prop list or an example into prose. If the prose needs to name a value, name the token.

## Front matter

Every page starts with YAML front matter. The site and the agent indexes read it.

```yaml
---
title: Drawer                 # The page title; for a component, the exported name
summary: A panel that slides in from the edge for details and settings, with the page still behind it.
                              # One sentence, no line breaks. Used in indexes and llms.txt.
---
```

Component docs add:

```yaml
status: stable                # experimental | stable | deprecated
aliases: [Sheet]              # Other names people search for, including former design names
layer: core                   # core: usable in any app | collaboration: carries Raft's
                              # collaboration concepts (messages, tasks, agents, inbox…)
category: overlays            # core: actions | inputs | navigation | overlays | feedback |
                              # layout | data-display | identity
                              # collaboration: messages | tasks | agents | inbox | search | files
related: [dialog, popover]    # Other component docs, by folder name
replacedBy: drawer            # Only when status is deprecated
```

`status` follows the export, not an opinion:

| Status | Exported from | Meaning |
| --- | --- | --- |
| `experimental` | `@botiverse/raft-ui/wip` | The API can change in any release. |
| `stable` | `raft-ui` | Breaking changes follow the package's versioning policy. |
| `deprecated` | `raft-ui`, with `@deprecated` in its JSDoc | Still works. `replacedBy` names what to use instead. It is removed in the next major version. |

Any page may also carry:

```yaml
order: 2                      # Its place in the section, lowest first; pages without it follow, by title
redirectFrom: [patterns/agents]
                              # Former site paths of this page; each one redirects here (its .md twin too)
```

A section's introduction is its `README.md`, shown at `/<section>`; for Components it is `design/components/overview.md`.

Decision records add `number`, `status` (`accepted`, `superseded`) and `date`. See the [decision template](./templates/decision.md).

## Embedding examples and tokens

Examples and token tables are fenced blocks with a special info string. They render live on the site, become source code in the Markdown twin, and stay readable on GitHub.

````md
```example
drawer/compositions/settings
```
````

The path is relative to `apps/doc/src/modules/`, without the extension. On the site it renders the composition with its source. In the `.md` twin and in `llms.txt` it is replaced by the composition's source code.

````md
```tokens
layer
```
````

The block names a token group from `packages/ui/src/tokens.json`. It renders a table of the tokens in that group, with their light and dark values and their descriptions.

## Links

Link with relative Markdown paths, so links work on GitHub and the site can rewrite them:

- From a guideline to a component: `[Drawer](../../packages/ui/src/components/drawer/drawer.md)`
- From a component to a guideline: `[Elevation](../../../../../design/foundations/elevation.md)`
- Between components: `[Dialog](../dialog/dialog.md)`

Link to a section with its heading anchor (`color.md#dark-mode`). Headings are stable addresses: rename one only together with the links to it.

## Changing the system

- A change to how something looks or behaves updates the rule it follows in the same pull request, in code and docs together.
- A choice that overrides a decision record adds a new record and marks the earlier one `superseded`. A choice that changes a smaller rule updates that rule and its reason in the page that owns it.
- When raft-ui and the docs disagree, one of them is wrong. Fix the code or the rule; never leave them apart.
- Write in English. Translations live in `i18n/<language>/`, mirroring these paths, and are kept up to date separately: a pull request that changes or adds an English page doesn't touch them ([i18n/README.md](../../i18n/README.md)).
