---
name: overview
description: "What rUI is, what it provides, and where to start for each task."
---

# Overview

## Build something bold with rUI

rUI is a UI system with expressive visuals and playful interactions, shaped by Raft and made for whatever you build next. Use it to build products with rUI's visual and interaction style, from chat and collaboration to dashboards and new product surfaces.

Raft is a source of real product experience, not a prerequisite for using rUI. You bring the content, structure, and product logic; rUI provides the components and design language. The React package is named `raft-ui`.

## Start with your agent

Give this prompt to your coding agent along with the UI you want to build. It introduces rUI and points to the guides for your task. No skill installation is required.

```text
Help me use rUI in this project.

rUI is a UI system with expressive visuals and playful interactions, shaped by Raft and made for whatever we build next. Its React package, raft-ui, includes components and compound parts, Brutal and Elegant themes, design tokens, typography, and interaction behavior. Use it to build a product with rUI's style while keeping product data, permissions, and workflows in the app.

Start with https://rui.botiverse.build/guides/overview to understand the system and choose a path for the task. Inspect this repository's framework, package manager, existing UI, and installed raft-ui version before making changes.

Read only the relevant guides:
- New app or first integration: https://rui.botiverse.build/guides/setup
- Existing app: setup plus https://rui.botiverse.build/guides/styling; scope changes to the requested surface and check global styles, theme ownership, and portals.
- Chat or collaboration: https://rui.botiverse.build/guides/conversation
- Dashboard or workspace: https://rui.botiverse.build/guides/layout, https://rui.botiverse.build/guides/forms, and https://rui.botiverse.build/guides/feedback.
- Custom composition: https://rui.botiverse.build/guides/composition and https://rui.botiverse.build/guides/styling.
- Exact APIs: https://rui.botiverse.build/guides/lookup and the relevant component pages linked from those guides or the component catalog at https://rui.botiverse.build/components.

For a fresh setup, install raft-ui in the target app using the existing package manager, configure its styles and typography, choose a theme, and render a first component. Add providers only when needed. For an existing integration, reuse its setup and implement the requested UI. Preserve rUI's design language through its components and semantic tokens.

Verify APIs against node_modules/raft-ui/dist/index.d.mts rather than guessing. If the website differs from the installed version or is unavailable, read the version-matched Markdown files in node_modules/raft-ui/skills/raft-ui-guide/rules/. No skill loader is required. Skill installation and agent configuration changes are optional; do not make them unless requested. Use raft-ui/wip only when explicitly requested.

Validate with the project's existing checks. Summarize the result, setup or UI changes, and any verification gaps.
```

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
