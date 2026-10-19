---
title: ProfilePanel
summary: The side panel for one person or agent — a panel header with their avatar and name, then sections of who they are, what they do and what you can do with them.
status: stable
aliases: [Profile, Member detail, Agent profile]
category: layout
related: [panel, avatar, description-list, list-row, skeleton, preview-card]
---

# ProfilePanel

ProfilePanel shows the profile of one person or one agent beside the conversation: a [Panel](../panel/panel.md) whose header names them, then a large avatar and sections of details. People and agents get the same panel at the same size ([Identity and presence](../../../../../design/people-and-agents/identity-and-presence.md#the-same-as-people)).

```example
profile-panel/compositions/member-detail
```

## When to use

| Situation                                                  | Use                                                             |
| ---------------------------------------------------------- | --------------------------------------------------------------- |
| Everything about one person or agent, read beside the chat | ProfilePanel                                                    |
| Who someone is, on hover over their name or avatar         | A profile card ([PreviewCard](../preview-card/preview-card.md)) |
| A list of members or agents                                | [ListRow](../list-row/list-row.md) rows                         |
| Any other side panel: tasks, files                         | [Panel](../panel/panel.md)                                      |

What an agent's profile holds in Raft Chat (its header actions, its tabs, the hero, its details and its actions) is in [Raft Chat: Agent profile](../../../../../design/products/raft-chat/agent-profile.md).

## Anatomy

- `ProfilePanel`: the panel, on `layer-canvas`, filling the height of its column.
- `ProfilePanelHeader`: the 56px panel header ([Panel](../panel/panel.md#anatomy)), with their avatar first.
  - `ProfilePanelHeaderContent`: the name in `PanelTitle` and one line in `PanelMeta`, such as the handle or role.
  - `PanelActions`: icon buttons such as Message.
- `ProfilePanelBody`: the content under the header, on the same surface as the conversation panel's content. It holds `PanelScrollViewport` and `PanelScrollContent`.
- `ProfilePanelSection`: one block of the profile, with a `line-hairline` above it. In order:
  - who they are: the `xl` [Avatar](../avatar/avatar.md), the name and the handle;
  - the details, in a [DescriptionList](../description-list/description-list.md): description, role, email, when they joined;
  - the agents or people that belong to them, as [ListRow](../list-row/list-row.md) rows in an inset group;
  - the actions, last.

## Variants

| Variant                    | Use for                                                                                      |
| -------------------------- | -------------------------------------------------------------------------------------------- |
| A member of this workspace | The sections above                                                                           |
| An agent                   | The same sections, with the agent's state as a [Status](../status/status.md) beside its name |
| From another workspace     | A first section with a From row that names their workspace, before who they are              |

```example
profile-panel/compositions/agent-profile
```

```example
profile-panel/compositions/remote-human
```

## States

| State   | Look                                                                                                     |
| ------- | -------------------------------------------------------------------------------------------------------- |
| Loading | The header and the sections as [Skeleton](../skeleton/skeleton.md) shapes, with `aria-busy` on the panel |

```example
profile-panel/compositions/skeleton
```

## Behavior

- A profile opened from a thread sits beside the thread; opened from the conversation, it replaces the thread ([Page structure](../../../../../design/patterns/page-structure.md#sidebar-and-side-panel)).
- Its width, and when it sits beside the conversation or covers it, are in [Spacing](../../../../../design/foundations/spacing.md#layout-widths) and [Raft Chat](../../../../../design/products/raft-chat/README.md).
- On a phone the profile covers the page with Back, like a pushed page ([Responsive layout](../../../../../design/patterns/responsive.md)). An agent's own page (from Working now or Members) fills the main area instead.
- The header stays put; only the body scrolls.

## Content

- Put their display name in `PanelTitle` and again under the large avatar, and the handle in Space Mono under it: `@martin`.
- Keep the Description section when there is none, and say "No description" in `foreground-hint`.
- Write section titles in sentence case: "Created agents".

## Accessibility

- `ProfilePanel` renders a `section`. Name it after the person or agent: `aria-label="Martin"`.
- Render the name under the large avatar as a heading (`h2`), below the panel's title.
- Give the avatar images an empty `alt`: the name beside them says who it is.
- While loading, set `aria-busy="true"` and `aria-label="Loading profile"` on the panel.
- Give every icon-only `PanelAction` an `aria-label`: "Message", "Close Profile".

## Rules

- Use the `xl` avatar, 99px, for people and agents alike ([0040](../../../../../design/decisions/0040-profile-avatar-size.md)).
- Show an agent at work as a still yellow light and a word ([Status](../status/status.md)), never an animation.
- Put an irreversible action, such as Remove Member, last, in its own section.
- Give the panel `edge="attached"` when it sits beside a conversation, so it draws the one line between the two ([Panel](../panel/panel.md#rules)). `ProfilePanel` defaults to `edge="inset"`.
