---
name: overview
description: "What raft-ui is and where to start."
---

# Overview

raft-ui is the React implementation of the Raft Design System, the design system used to build Raft. The `raft-ui` package includes CSS foundations, composable React components, and light and dark modes.

## Start with your agent

Copy this prompt and add your task:

```text
Use raft-ui, the React implementation of the Raft Design System, for this project. Use its shared tokens and components where they fit the project. Plain HTML can use foundation.css without React or Tailwind.

Read https://raft-design.botiverse.build/llms.txt and the pages relevant to the task; every page is Markdown. https://raft-design.botiverse.build/components.json lists every component. Match the existing project setup. For version-specific APIs, use node_modules/@botiverse/raft-ui/dist/index.d.mts.

Skills are optional. Only install them when requested.
```

## Rules in this skill

| Task                                    | Read                                          |
| --------------------------------------- | --------------------------------------------- |
| Adopting raft-ui in an existing project | [Adoption](./adoption.md)                     |
| Package contents, styles and providers  | [Technical overview](./technical-overview.md) |
| Exact component APIs and tokens         | [API lookup](./lookup.md)                     |

Everything else (which component, how to compose, styling) is in the design system docs; see [SKILL.md](../SKILL.md#where-the-guidance-moved).
