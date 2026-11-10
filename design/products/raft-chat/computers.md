---
title: Raft Chat — Computers
summary: The Computers destination — its header, the toolbar of search and filters, grouping by name prefix or provider, sorting by a runtime's remaining usage, offline computers folded at the end, and its rows on a phone.
---

# Raft Chat — Computers

Computers is the server's list of the machines its agents run on. People come to it to see which computers are up, which need something (an upgrade, a sign-in, a restart), and which still have room to take more work: today that is mostly how much of a runtime's usage limit is left, Claude Code's above all, and later it may be something else (Artea, 2026-11-09, #proj-raft-ui:c1fde219). A computer opens in the side panel beside the list.

## Structure

From top to bottom:

1. **The header:** the title Computers and its count in Space Mono ("25 computers · 11 online · 47 agents"), and at the right end the Cards / List view switch and Add computer (`primary`).
2. **The toolbar:** the search field, then the filters Status, Runtime, Group and Sort, then Clear all while the search, Status or Runtime differs from its default (Group and Sort don't bring it, as it doesn't reset them). It stays above the list while the list scrolls.
3. **The computers:** cards or list rows, in groups when a grouping is chosen, and the offline computers in one folded group at the end.

## The toolbar

The filters are buttons that show their value ([Select › Filters](../../../packages/ui/src/components/select/select.md#filters)): outlined at their default, filled `info-soft` once changed, each opening a Select list. Don't make any of them segments ([SegmentedControl](../../../packages/ui/src/components/segmented-control/segmented-control.md)).

| Filter | Values | Default |
| --- | --- | --- |
| Status | All statuses, Online, Offline, Needs attention | All statuses |
| Runtime | The runtimes on the server's computers, any number at once | None (every runtime) |
| Group | No grouping, Name prefix, Provider | No grouping |
| Sort | Name; one "remaining" item per runtime that reports usage; Disk used, Memory used; and the direction after a separator | Name, A to Z |

- Search matches a computer's name, its host name and its owner.
- Clear all resets Status and Runtime and the search; it leaves Group and Sort, which are how people like to see the list, not what they are looking for.
- Remember Group, Sort and the view on the device, as the other view choices are.

## Grouping

- Group by nothing by default. Most computers don't report a provider: on staging 1 of a server's 36 did, so grouping by it would put almost every computer in one group (InNOut, 2026-11-09).
- Name prefix groups a computer by the longest start of its name it shares with at least one other computer, cut at `-`, `_` or `.`: `hetzner-ex63-3`, `-4` and `-6` are hetzner-ex63; `armbian-1`, `armbian-jojo` and `armbian-jzm` are armbian; `artin-fluence-claude` and `-root` are artin-fluence. No group holds one computer: a computer that would be alone moves up to the next shorter prefix it shares, and the computers under that prefix join it there (with `artin-hostinger-root` beside the two artin-fluence computers, all three are artin). Only a computer that shares no start with any other goes in Other, last. Trimming a trailing number alone left 23 of a server's 26 computers in Other: hand-named computers share a word, not a number (xxchan, 2026-11-10, #triage:9d93272b).
- Provider groups by what the computer reports (Hetzner Cloud, AWS, Google Cloud…); computers that report none go in Personal computers, last.
- A group's header is its name and how many computers it holds, in Space Mono. Nothing else: a summary of usage in every header repeats what the rows already show.
- This device (the computer the Raft Desktop app runs on, or the offer to connect it) stays first, above any group: it is where people start, whatever the grouping or the sort.

## Sorting by what is left

Only the runtimes that report their account's usage get a sort item: Claude Code, Codex, Kimi and Grok today, read through OAR (Otter, 2026-11-09). Each reports its own windows, with their own names and number, so the page never names a window (not "5 hours", not "week") and never adds windows of different runtimes together.

- A computer's remaining amount for a runtime is its tightest window: 1 minus the highest used share among the windows that report one (`ok` or `limit_reached`). A window at its limit with no share counts as fully used.
- An account that is rate limited has nothing left. An account that needs signing in again, is unsupported or errors has no value.
- When a runtime's usage is used up, its cell says when it comes back, not that it is used up: the full orange bar already says that, and the time is what people need to plan (xxchan, 2026-11-10, #triage:3cf4951e). Write "Resets 3h" in English: "Resets in 47h" and "Back in 47h" don't fit the column's 80px (95.5px and 80.8px against 73.5px), and the full sentence is in the accessible name and the tooltip (Scout, 2026-11-10); minutes under an hour ("45m"), hours under two days ("47h") and days after that ("Resets 3d"), never a weekday or a date: windows reset within a week, so one short relative form covers them all (xxchan, 2026-11-10), the number in Space Mono as the cell's percentages are. When several windows are used up, give the latest reset: the account can't be used until the last one comes back, so the earliest would mislead (Scout, 2026-11-10). With no reset time, say used up. The cell's accessible name says both ("Used up, resets in 3 hours"), so the state never rests on the color; its tooltip gives the full date and time.
- A computer with no value, offline or without that runtime among them, sorts last in either direction: an empty value is not the most or the least of anything.
- The directions are Most remaining first (the default, to find a computer to give work to) and Least remaining first. For Name they are A to Z and Z to A.
- When a grouping is on, groups follow the sort too: the group whose best computer comes first comes first. Under Name, groups go A to Z.
- In List view a runtime's column heading sorts by that runtime's remaining amount, and it is the same choice as the Sort filter: changing one changes the other. In Cards view the sorted runtime's line moves to the top of each card's meters, in bold.

## Offline computers

Whatever the grouping and the sort, offline computers go in one group at the end, Offline with its count, folded. This device is the exception: it stays first even while offline, since it is the one computer people can bring back from where they are. Most of a long-lived server's computers can be offline for months; folded, they no longer push the computers that can work out of sight. With Status set to Offline they are the list itself, with no group around them.

## On a phone

- The toolbar takes two lines: the search field with Sort and Clear all as icon buttons (their words stay their accessible names), then Status, Runtime and Group with their values, scrolling sideways when they don't fit ([Select › Filters](../../../packages/ui/src/components/select/select.md#filters)).
- Each filter opens the same Select list as on a desktop. Don't gather the filters into a sheet of their own.
- Each computer is one block, as in the list of places ([Lists](../../patterns/lists.md)).
