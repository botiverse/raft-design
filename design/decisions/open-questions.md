---
title: Open questions
summary: The places where the system has drawn more than one version and the choice is still open, with the current default for each, and the questions the product has settled.
---

# Open questions

In these places the same thing is drawn in more than one version, and the choice is still open. Until it is made, use the default. Once a version is chosen, the others are removed from the components and the choice becomes a decision record.

| Where | Versions | Default | The product ships |
| --- | --- | --- | --- |
| The top bar of a phone's top-level pages | With the page name as a large title, or with one 56px navigation row (Home shows only the workspace pill; Tasks, Members and Settings put their name in the row in `text-headline`) | With the page name as a large title ([0004](./0004-title-on-every-top-level-page.md)) | The navigation row (`Sidebar.tsx`, `TasksPanel.tsx` in the web app) |

## Settled by the product

These were open, and the web app (Raft's product code) now ships one version. The other versions are no longer described in the patterns.

| Where | The product ships | Where in the web app |
| --- | --- | --- |
| The top bar of a phone's pushed pages | White (paper), with a seam under it; the location tile stays a yellow sticker | `components/ui/PanelHeader.tsx` on raft-ui `PanelHeader` |
| The desktop rail | Icons only, 56px plus the seam; names are in tooltips. The top-left corner stays square ([0005](./0005-56px-headers-and-rail.md)) | `components/layout/LeftRail.tsx` |
| Tabs | The yellow sticker ([0013](./0013-sticker-tabs.md)). The underline stays a variant of [Tabs](../../packages/ui/src/components/tabs/tabs.md) | `components/message/ChatPanel.tsx`, `components/agent/AgentDetailPanel.tsx` |
| Chat, tasks and files in a Raft Chat channel | One row of sticker tabs under the panel header, which people can reorder ([Channel](../products/raft-chat/channel.md)) | `components/message/ChatPanel.tsx` |

## Related

- [Panel](../../packages/ui/src/components/panel/panel.md): the phone top bars.
- [Page structure](../patterns/page-structure.md#phone): the top-level page and the large title.
- [Raft Chat](../products/raft-chat/README.md): Home and the other top-level pages.
