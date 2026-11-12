---
title: Status
summary: One model for the state of computers, runtimes and agents everywhere it shows — the questions a surface answers, the chain that finds one verdict, the four verdicts and their colors, one word for each state, what "needs attention" counts, and what each Computer-side surface shows.
---

# Status

The same computer, runtime or agent shows its state in many places: the sidebar, the Computers page, a computer's detail, an agent's profile and hover card, the desktop tray, the phone. Each place used to work the state out for itself and name it in its own words, so one computer restarting for an update looked six ways on six surfaces, "needs attention" was counted four ways, and a used-up limit had six phrasings. Every surface now reads one verdict from one source and says it with one word (xxchan, 2026-11-12, #triage:45a94e57; inventory by Scout, Kirby and Lagoon; the model is Otter's readiness).

The agent side (presence lights, the profile's status chip, the hover card, the DM header, the composer) is in [Identity and presence](../people-and-agents/identity-and-presence.md).

## The questions

A surface answers one or more of these. Decide which before deciding what to draw.

| Question | Who asks it |
| --- | --- |
| Is this computer there? | Whoever looks after the machine |
| Can this agent, or this runtime, work now? | Whoever uses the agent |
| How much usage is left? | Whoever hands out work |

## One chain, one verdict

Server, computer, runtime, sign-in, usage window, model, agent: the first link in this chain that has a problem is the verdict, and what goes wrong further down follows from it, so it isn't raised again. The server works the verdict out (one shared function) and sends it with the computer and agent data, trimmed to what the person looking may see; no surface works it out again.

| Verdict | Meaning | What it says | Color |
| --- | --- | --- | --- |
| Ready | Nothing is wrong | Nothing, or the usage | The `online` light; ordinary text |
| In progress | Something is changing and will finish by itself: an update, a restart, a cloud runtime starting, an agent at work | What is happening: "Updating…", "Working…" | Yellow, and yellow means only this |
| Waiting | It will come back by itself, after a while | When it comes back: "Back in 3h" | Stone, except an agent stopped by a used-up limit, which takes the orange light (below) |
| Needs action | It stays wrong until someone acts | The step: "Sign in", "Update" | Orange |

Stone is also offline and stopped; the words after the light tell them apart. Cyan is only for an agent from another server (External): an update reconnecting is in progress, yellow, never cyan.

An agent stopped because its usage ran out takes the orange light, as an error does, and says when it comes back ("Back in 6d"), not Error: a used-up limit reads as something gone wrong (xxchan). It is still waiting, so it doesn't count as needing attention.

- **Say the step, not the reason.** "Sign in", not "Login expired"; "Update required", not "Computer version too old for this runtime". The reason is in the detail one click away ([Writing](../content/writing.md#principles)).
- **Name who can act.** Each problem belongs to someone: a server admin, the computer's owner or the agent's owner. Someone who can't act sees who can, by name, never a button they can't use. Someone who may also see the reason gets the step in it ("Tao can sign in"); anyone else gets words that don't give a person's account away: "Olive can fix it", or "Olive can update this computer" for a step that is the computer's own (Tenny's security review, 2026-11-12; [Identity and presence](../people-and-agents/identity-and-presence.md#an-agent-that-cant-work-now)).
- **One state, one word, one color, everywhere.** A small place says less (only the light), never something else.

## One word for each state

| State | The only wording | Not |
| --- | --- | --- |
| The computer is connected to this server | Online | Connected, Running, computer v1.2 |
| It isn't | Offline, or "Offline · last seen 2h ago" | Disconnected, computer offline, (offline) |
| An agent isn't running because its computer is offline | Computer offline, linking to the computer | Offline |
| The computer is updating | Updating…; its agents say Computer updating | Upgrading…, Offline |
| The computer is restarting as planned | Restarting…; its agents say Computer restarting. Offline after 5 minutes without coming back | Offline |
| The version line while it updates | v1.0.49 · Updating to v1.0.50 | — |
| A newer version is out | Update available | Upgrade soon, → v1.0.50 |
| The version is too old to run | Update required | Needs upgrade, Needs reinstall, (update to v1.2 or newer) |
| An agent can't run because its computer is too old | Computer update required, linking to the computer | Its Computer is too old…, Update required |
| Raft Desktop itself must update | Update Raft Desktop | Update required |
| The Raft Computer service on this machine (This device and the desktop tray only) | Running / Stopped | — |
| Not installed | Not set up | — |
| Installed, but not on this server | Not on {server} | Not set up |
| Its status can't be read | —, and "Can't read its status" in the detail | Not set up |
| A runtime's account must be verified | Verification required; the step is Verify | Login expired, needs verification |
| A runtime isn't signed in | Signed out; the step is Sign in | (not signed in), Not signed in, requires sign-in |
| Usage used up, reset known | "Back in 3h" in a cell; a model's line drops "Back in" to fit the 96px cell ("Fable · 6d"); "Used up · back in 3h" in a sentence | Resets 3h, limit reached, usage limit reached, rate limited |
| Usage used up, no reset time | Used up | — |
| Low on disk | Low disk | — |

Running and Stopped say whether the service is on, which only This device and the tray care about; Online and Offline say whether the server sees the computer, everywhere. This device shows both, each in its own place. The computer detail's runtime chips keep their own wording ("Claude Code (not signed in)"), below.

Update available and Update required look the same: both orange, both counted as needing attention, told apart by their words (xxchan).

## Needs attention

One count, worked out on the server and sent with the computers, feeds every place that asks: the rail's dot on Computers, the phone's tab and notification, the Computers page's Needs attention filter and its summary line, the desktop tray and its notification. It counts what someone has to act on:

- a managed computer offline;
- Update required or Update available;
- a runtime signed out, or its account needing verification, while an agent on that computer uses it (a runtime nobody here uses can stay signed out; xxchan);
- Low disk: less than 20 GB free and less than 10% free, both at once (`isMachineDiskLow`);
- an agent that failed to start, or whose credentials stopped working.

Used-up usage isn't counted: it comes back by itself. The page's summary line counts it on its own ("4 agents waiting · back in 6d"), so the filter only ever shows things someone can do. The same kind of notification is sent at most once a day for the same sign-in and reason.

## Computer-side surfaces

| Surface | Answers | Shows | Opens |
| --- | --- | --- | --- |
| Sidebar computer row | Is it there | The light (lime, stone, yellow while updating, orange when it needs action) and, beside the name, the step when there is one, otherwise the version | The computer's detail |
| Computers list row and card | Is it there, how much is left | The same light and line; the usage cells ([Computers](../products/raft-chat/computers.md#a-runtimes-usage-cell)). An updating computer stays in place, its usage grey; an offline one folds into the Offline group | The detail; a usage cell opens the usage card |
| Computers page header and filter | How many need me | "15 computers · 13 online · 2 need attention"; the Needs attention filter uses the count above | — |
| Computer detail head | Is it there | The light and Online, Offline, Updating… or Restarting…; with Update required, a banner under it with the step | — |
| Computer detail version | Is it current | "v1.2 · Up to date", "v1.2 · Update available", "Update required" | — |
| Computer detail runtime chips | What can it run | Today's chips with their own small dot: the `online` light (lime) when usage is fine, orange when it needs a look; a signed-out runtime is the orange chip "Claude Code (not signed in)". No usage bar beside a chip: it reads as part of the chip (xxchan) | The usage card |
| Usage card | How much is left | One bar per window, "60% used · resets in 6 days" or "Used up · back in 6d"; per account Signed in or Signed out, with no dot | — |
| Choosing a computer (Create agent, Move agent) | Is it there, how much is left | Suffixes Offline, Update required, Signed out; an option that can't be chosen stays in its place, dimmed | — |
| Desktop tray and Dock | Is this machine's service there | This device's words (Running, Stopped, Updating…, Not set up, Not on {server}), the step when it needs action; Restart asks first when an agent is mid-turn, as on the web; in the account's language once signed in | This device |
| System notifications | Did something need me while I was away | Only what needs attention and used-up usage, in the sentences above, once a day per kind | The computer |

## On a phone

The phone app follows the same tables, and in particular:

- A presence light never blinks or pulses ([Identity and presence](../people-and-agents/identity-and-presence.md)).
- Offline is stone, the one grey.
- It has every state above, including Computer offline with its link, Computer update required, Updating… and Restarting…, and Paused.
- "Working…" and "Thinking…" end in an ellipsis, as on the web.
- The Android home widget draws square lights, follows the account's language and reads the live state.
