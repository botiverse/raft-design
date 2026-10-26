---
title: Open questions
summary: The places where the system has drawn more than one version and the choice is still open, with the current default for each, and the questions the product has settled.
---

# Open questions

In these places the same thing is drawn in more than one version, and the choice is still open. Until it is made, use the default. Once a version is chosen, the others are removed from the components, and the choice and its reason are written into the page that owns the rule. It becomes a decision record only when it is a major, cross-cutting choice.

| Where | Versions | Default | The product ships |
| --- | --- | --- | --- |

## Settled by the product

These were open, and the web app (Raft's product code) now ships one version. The other versions are no longer described in the patterns.

| Where | The product ships | Where in the web app |
| --- | --- | --- |
| The top bar of a phone's top-level pages | One 56px navigation row, the name (or on Home the workspace button) in it, no large title, no icon tile ([Page structure](../patterns/page-structure.md#phone)) | `components/layout/Sidebar.tsx`, `components/task/TasksPanel.tsx`, `components/thread/ThreadsInbox.tsx` |
| The top bar of a phone's pushed pages | White (paper), with a seam under it; the location tile stays a yellow sticker | `components/ui/PanelHeader.tsx` on raft-ui `PanelHeader` |
| The server list on a phone | A popover anchored under the top bar, 8px from each side, opened from the server switcher on Home ([Navigation](../patterns/navigation.md#servers)) | `components/layout/Sidebar.tsx`, `components/ui/ServerSwitcherMenu.tsx` |
| The desktop rail | Icons only, 56px plus the seam; names are in tooltips. The top-left corner stays square ([Spacing](../foundations/spacing.md#heights)) | `components/layout/LeftRail.tsx` |
| Tabs | The yellow sticker. The underline stays a variant of [Tabs](../../packages/ui/src/components/tabs/tabs.md#variants) | `components/message/ChatPanel.tsx`, `components/agent/AgentDetailPanel.tsx` |
| Tasks and files in a Raft Chat channel | Side sections in columns right of the conversation panel, opened from Tasks and Files toggles in the channel header ([Channel](../products/raft-chat/channel.md#tasks-and-files), [The channel's side columns](../patterns/responsive.md#the-channels-side-columns)) | `components/message/ChatPanel.tsx`, `components/task/ChannelSideArea.tsx` |

## Related

- [Panel](../../packages/ui/src/components/panel/panel.md): the phone top bars.
- [Page structure](../patterns/page-structure.md#phone): the top-level page.
- [Raft Chat](../products/raft-chat/README.md): Home and the other top-level pages.
