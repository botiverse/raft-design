---
name: overview
description: "What rUI is, what it provides, and where to start for each task."
---

# Overview

## Build something bold with rUI

rUI is a UI system with expressive visuals and playful interactions, shaped by Raft and made for whatever you build next. Use it to build products with rUI's visual and interaction style, from chat and collaboration to dashboards and new product surfaces.

Raft is a source of real product experience, not a prerequisite for using rUI. You bring the content, structure, and product logic; rUI provides the components and design language. The React package is named `raft-ui`.

## What's included

- **Components and compound parts:** controls, forms, overlays, feedback, navigation, and product surfaces such as conversations, composers, tasks, and search.
- **Themes:** Brutal and Elegant share component APIs. Elegant also supports dark mode. Choose a family through `ThemeProvider`; components resolve their appearance together.
- **Design foundations:** semantic colors, typography, spacing, and shadows keep new compositions consistent with existing ones.
- **Interaction behavior:** focus, keyboard navigation, overlays, and component feedback, with Base UI providing the underlying behavior where applicable.
- **Executable examples and focused guides:** learn a component's real API and compose it into your product. Optional agent skills package these same guides for tools that support skill discovery.

## Start with your task

| Your task                      | Read                                                                                    | Approach                                                                                                                                    |
| ------------------------------ | --------------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------- |
| Start a new product            | [Setup](./setup.md), then [Composition](./composition.md)                               | Inspect the framework and package manager, install `raft-ui`, load styles and typography, choose a theme, and render a first component.     |
| Add rUI to an existing product | [Setup](./setup.md), [Styling](./styling.md), and the relevant component docs           | Start with the requested surface. Check global CSS, theme ownership, and portal placement before expanding adoption.                        |
| Build chat or collaboration    | [Conversation](./conversation.md)                                                       | Start with the existing message, composer, sidebar, and conversation parts; keep data and workflow decisions in the app.                    |
| Build a dashboard or workspace | [Layout](./layout.md), [Forms](./forms.md), and [Feedback](./feedback.md)               | Compose panels, navigation, controls, and feedback around the information and actions your product needs.                                   |
| Create a new composition       | [Composition](./composition.md), [Styling](./styling.md), and [API lookup](./lookup.md) | Reuse parts and semantic tokens. Preserve rUI's visual language while adapting content and structure.                                       |
| Work with an agent             | This overview, then the guides for the task                                             | Give the agent your goal and constraints. It can read these pages directly; installing a skill or changing agent configuration is optional. |

For focused work on dialogs, menus, popovers, and tooltips, read [Overlays](./overlays.md). For typography, avatars, code, and file presentation, read [Display](./display.md).

## Use the documentation for your installed version

The website follows the current documentation. For an existing installation, verify props and exports in `node_modules/raft-ui/dist/index.d.mts`. The package also includes version-matched guides under `node_modules/raft-ui/skills/raft-ui-guide/rules/`; these are ordinary Markdown files and can be read without a skill loader.

Use the stable `raft-ui` exports. The `raft-ui/wip` entry is experimental and should only be used when the task explicitly calls for it.
