---
title: Switch
summary: A round on/off control for a setting that applies the moment it is flipped.
status: stable
aliases: []
layer: core
category: inputs
related: [checkbox, radio-group, list-row, field]
redirectFrom: [decisions/0025-pill-switch]
---

# Switch

A switch turns a setting on or off, and the change applies at once. On, it is a yellow sticker with its knob slid to the right. Switches and radios are the only round controls in the system.

```example
list-row/compositions/settings
```

## When to use

| Situation                                       | Use                                         |
| ----------------------------------------------- | ------------------------------------------- |
| A setting row that applies when flipped         | Switch                                      |
| A yes or no that applies when the form is saved | [Checkbox](../checkbox/checkbox.md)         |
| One of several answers                          | [RadioGroup](../radio-group/radio-group.md) |

Which controls apply at once and which are saved is in [Forms](../../../../../design/patterns/forms.md).

## Anatomy

- `Switch`: the 50 × 30px track, the same on a phone and a desktop. Required. Beside a label, put it in a `FieldItem` or at the end of a `ListRow variant="plain"`: it centers on the label's or title's first line and is never squeezed, so a one-line row is at least 30px (54px for a settings row on a phone), with its text centered on the switch. Don't add a `margin-top` ([Alignment](../../../../../design/foundations/alignment.md#a-control-and-its-label)).
- `SwitchThumb`: the round knob. `Switch` renders it by default.

## States

- **Off:** a `fill-muted` track with an ink border, and a white knob on the left.
- **On:** a `brand` sticker with an ink edge, and a white knob on the right. It looks the same in dark mode, where it gains the die-cut edge ([Dark mode](../../../../../design/foundations/dark-mode.md#the-die-cut-edge)).
- **Disabled:** the shared disabled look, on or off ([States](../../../../../design/foundations/states.md)).

## Behavior

- Slide the knob over 220ms with `ease-slide` ([Motion](../../../../../design/foundations/motion.md)).
- Put the switch at the end of a settings row ([ListRow](../list-row/list-row.md) with `interactive={false}`). The row itself is not a button and doesn't react to hover or press; focus goes only to the switch.

## Content

- Make the description say what follows from the setting, without repeating the title: for Agents can merge to main, "Off: a person approves every merge."

## Accessibility

Switch wraps Base UI Switch: an element with `role="switch"` whose `aria-checked` says whether it is on, with a hidden native input for forms.

- Name it with `aria-labelledby` pointing at the row's title.
- Set `disabled` when the setting can't be changed.

## Rules

- Keep the switch a pill, though everything else is square: people recognize a switch by its round shape, and a square switch isn't read as one ([Shape](../../../../../design/foundations/shape.md#principles)).
- Never color a switch green or blue: green means done and online, and an on switch is yellow.
