---
title: FloatButton
summary: Deprecated. A button that floats over the page content; actions belong in the page's header or toolbar instead.
status: deprecated
replacedBy: panel
aliases: [FAB, Floating action button, FloatButtonGroup]
layer: core
category: actions
related: [panel, button]
---

# FloatButton

FloatButton and FloatButtonGroup are deprecated and are removed in raft-ui 1.0. They are not part of the Raft Design System: in Raft, controls sit flat in the layout, and only menus, popups, dialogs and toasts float above the page ([Elevation](../../../../../design/foundations/elevation.md)). Put the action in the page's header or toolbar instead: on desktop and on a phone's pushed page, that is `PanelActions` in the panel header ([Panel](../panel/panel.md)).

The one kind of control that floats over content is the jump pill of a conversation, which takes the person somewhere in the message list instead of doing an action, and it is a Button without a shadow, not a FloatButton ([Elevation](../../../../../design/foundations/elevation.md#floating-controls)).

## When to use

| Situation                                                     | Use                                                                               |
| ------------------------------------------------------------- | --------------------------------------------------------------------------------- |
| An action for the whole page or panel                         | A `PanelAction` in the panel header ([Panel](../panel/panel.md))                  |
| An action in a toolbar, such as New Task over a list of tasks | The toolbar's own button ([Tasks](../tasks/tasks.md))                             |
| Any other action                                              | [Button](../button/button.md), in the layout                                      |
| Back to Bottom, new messages, the next unread thread          | The jump controls of [MessageList](../message-list/message-list.md#jump-controls) |
