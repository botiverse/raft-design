---
title: LiveAgentActivityBar
summary: A live strip of working agents above the tab bar or at the bottom of the sidebar; deprecated, because working agents are shown where they already appear.
status: deprecated
aliases: [Live bar, Activity bar, Live activity]
layer: collaboration
category: agents
related: [avatar, status, sidebar, list-row, panel, message-item, drawer]
---

# LiveAgentActivityBar

LiveAgentActivityBar is a strip of avatars, a status light and a line of text that says what agents are doing, placed above the phone tab bar or at the bottom of the desktop sidebar. It is deprecated and removed in raft-ui 1.0, and there is no single component that replaces it. The strip took the spot on the screen people reach most, changed all the time and was usually about something other than the page being read ([0006](../../../../../design/decisions/0006-working-agents-in-place.md)). What it showed now goes back to the places where agents already appear, listed in [Working agents](../../../../../design/people-and-agents/working-agents.md#where-working-shows).

## When to use

| To show                                       | Use                                                                                                                                                                                        |
| --------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ |
| Whether anyone is working, and who            | The summary line: an avatar stack (`AvatarGroup`, [Avatar](../avatar/avatar.md)) and a count, in the web top bar, in a phone's Home bar, or in the sidebar header when there is no top bar |
| What one agent is doing                       | The right side of its own row: the [Sidebar](../sidebar/sidebar.md) row, on desktop and on a phone                                                                                         |
| Who is working in a place                     | The `PanelMeta` line of its header ([Panel](../panel/panel.md#content))                                                                                                                    |
| That an agent is working, in the conversation | The still yellow light on its avatar ([MessageItem](../message-item/message-item.md))                                                                                                      |
| Every working agent                           | Working now: a list opened from the summary in a [Popover](../popover/popover.md), on a phone too                                                                                          |
