---
title: Icons
summary: The icons raft-ui draws itself — the four conversation icons and ComputerIcon; every other icon comes from Lucide.
status: stable
aliases:
  [
    MessageIcon,
    ChatIcon,
    DirectMessageIcon,
    ThreadIcon,
    Conversation icons,
    ComputerIcon,
    Computer icon,
  ]
layer: core
category: identity
related: [sidebar, message-quoted-preview, tasks, icon-tile]
---

# Icons

raft-ui exports four icons of its own for kinds of conversation, `MessageIcon`, `ChatIcon`, `DirectMessageIcon` and `ThreadIcon`, and `ComputerIcon` for a Computer. Every other icon in Raft comes from Lucide. The rules for all icons (the set, the stroke, the color and the size by context) are in [Iconography](../../../../../design/foundations/iconography.md).

```example
icons/compositions/icons
```

## When to use

| Situation                                                   | Use                                                                                                       |
| ----------------------------------------------------------- | --------------------------------------------------------------------------------------------------------- |
| A message, a chat, a direct message or a thread, as an icon | `MessageIcon`, `ChatIcon`, `DirectMessageIcon`, `ThreadIcon`                                              |
| A Computer, by the machine it runs on                       | `ComputerIcon`                                                                                            |
| A task's status                                             | `TaskStatusIcon` ([Tasks](../tasks/tasks.md))                                                             |
| Any other icon                                              | The Lucide icon of that name ([Iconography](../../../../../design/foundations/iconography.md#principles)) |
| An agent                                                    | Its pixel avatar ([Avatar](../avatar/avatar.md)), never an icon                                           |
| A channel or another place beside its name                  | A channel tile ([IconTile](../icon-tile/icon-tile.md))                                                    |

## Anatomy

- `MessageIcon`: a speech bubble.
- `ChatIcon`: a speech bubble with three dots.
- `DirectMessageIcon`: a speech bubble with a person.
- `ThreadIcon`: two overlapping speech bubbles, the front one filled.

- `ComputerIcon`: the shape of the device a Computer runs on, with its platform as a mark in the bottom-right corner (see [Computer](#computer)).

Each one is an 18px `svg` drawn in `currentColor`, so it takes the color of the text around it. Size it with a class, by the context it is in ([Iconography](../../../../../design/foundations/iconography.md#sizes)).

## Computer

`ComputerIcon` draws the device a Computer runs on (`device`) and marks its platform (`platform`: macOS, Linux or Windows) in the bottom-right corner, cut out of the shape so it reads at 14px. The caller maps its machine data onto these two props; raft-ui does not parse OS strings. `device` takes the same values as the Server's `DeviceClass`.

```example
icons/compositions/computer-icon
```

| `device`    | Shape                                                                 |
| ----------- | --------------------------------------------------------------------- |
| `laptop`    | An open laptop                                                        |
| `mini`      | A low, wide box on a line                                             |
| `studio`    | A tall rounded box with a slot                                        |
| `imac`      | An all-in-one screen with a chin and a stand                          |
| `desktop`   | A tower                                                               |
| `server`    | Two stacked rack units with lights                                    |
| `vm`        | A monitor with a prompt                                               |
| `container` | A shipping container: a wide box with three vertical ribs             |
| missing     | A monitor: an unknown or missing device, or a value outside this list |

`cloud` draws a cloud in place of the device, marked with the platform like every other shape. Without a platform, or with one outside the three, there is no mark, on the cloud as on the others.

Which shape a Computer gets:

1. In a cloud, `cloud`: the Computer is hosted by Raft, or the Server recognized its cloud provider (its `hostProvider` is one of the Server's known providers). A provider id the caller does not recognize does not set `cloud`.
2. Otherwise its `DeviceClass` as `device`: a VM on a provider nobody recognized is `vm`, a Computer in Docker or Podman is `container`.
3. No `DeviceClass`, or one this version does not know: the monitor.

The caller decides `cloud`; raft-ui takes the boolean and does not read provider ids.

### Linux distributions

On `platform="linux"`, `distro` draws the distribution's mark in place of Tux. `computerDistro(osId, osIdLike)` gives it from the machine's `/etc/os-release` `ID` and `ID_LIKE`: `ID` first; when that is not one of ours, the `ID_LIKE` entries left to right (Rocky Linux, `rocky` with `rhel centos fedora`, gets `rhel`); nothing recognized gives `null` and Tux. Any `opensuse-*` is `opensuse`. The display name (`osRelease`, "Ubuntu 26.04") is never parsed.

| `distro`   | os-release `ID`                                     |
| ---------- | --------------------------------------------------- |
| `ubuntu`   | `ubuntu`                                            |
| `debian`   | `debian`                                            |
| `fedora`   | `fedora`                                            |
| `arch`     | `arch`                                              |
| `alpine`   | `alpine`                                            |
| `centos`   | `centos`                                            |
| `rhel`     | `rhel` (the Red Hat mark)                           |
| `nixos`    | `nixos`                                             |
| `opensuse` | `opensuse`, `opensuse-leap`, any other `opensuse-*` |

The marks are the Simple Icons glyphs (CC0), in one color like the other marks. Below 18px the icon draws Tux even when it has a distro: at 16px the mark is under 7px wide and a distro glyph turns into a blot, while Tux still reads by its outline. The icon is its own size container, so the switch follows the size it is drawn at, with no script.

```example
icons/compositions/computer-icon-distros
```

Until a Computer release that reports `ID` / `ID_LIKE` and a Server deploy that stores them, both fields are null, so Linux machines show Tux (and a VM the `vm` shape). That is expected.

The container is a box with ribs, not a stack of boxes, because a stack reads as the server's rack units at 14px. Its ribs sit 5 units apart, so they stay apart at the smallest size, and the left two stay whole when the platform mark is cut out.

Every shape is drawn on the 24-unit grid at a stroke of 2 with round caps and joins, as Lucide is, and keeps a unit clear at the edges. Shown at the sizes it is used at:

```example
icons/compositions/computer-icon-sizes
```

## Accessibility

- The icons are hidden from assistive technology (`aria-hidden`) and can't take focus. The text or the `aria-label` of the control around them names what they stand for.
- To use one as the only content of a button, give the button an `aria-label`: Open Thread.

## Rules

- Don't add drawn icons. New icons come from Lucide ([Iconography](../../../../../design/foundations/iconography.md#principles)); the four conversation icons and `ComputerIcon` are the only drawn ones.
- A new device shape for `ComputerIcon` follows a new `DeviceClass` value on the Server, and is drawn on the same grid and stroke as the others.
