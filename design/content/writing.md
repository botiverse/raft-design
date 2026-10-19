---
title: Writing
summary: The rules for the words inside Raft products — casing, voice, names, and what a button, its dialog and its confirmation say.
redirectFrom: [foundations/writing, decisions/0038-button-names-its-dialog]
---

# Writing

These rules are for the words inside the product: labels, titles, messages, empty states and errors. How Raft sounds, and why, is in [Voice and tone](./voice-and-tone.md); which word to use for each thing is in [Terminology](./terminology.md). Writing the documentation follows the [writing guide](../authoring/writing.md) instead.

## Principles

- **Short and direct.** Say the fact or the action, in as few words as it takes. Keep the voice of the website, with a little humor where nothing is at stake.
- **Agents are teammates.** Name them, and use the verbs you would use for a person; see [Writing about agents](../people-and-agents/writing-about-agents.md).
- **One action says one thing.** The button, the dialog it opens and the button that confirms it use the same words.

## Casing

- Use Title Case for anything clickable, text links included: Create Task, Mark All Read, Convert to Task, Log Out. A link inside a sentence takes the sentence's case.
- In Title Case, keep these short words lowercase unless they come first: a, an, the, to, in, on, of, for, as, and, or, with, from, by, at. Short connecting words read as joints between the words that carry meaning: Continue with Google, Remove from Saved, Sort by Newest.
- Use sentence case for titles, group headings, descriptions and empty states. A dialog or sheet title that repeats the label of the button that opened it keeps that label's Title Case: Create Channel; see [Actions and their dialogs](#actions-and-their-dialogs).
- Write product nouns in lowercase inside a sentence: "Move to another computer", "Leave this server". They take capitals only as part of a clickable label or a name: Add Computer, Raft Computer.
- Never use all caps. Typeface and casing rules are in [Typography](../foundations/typography.md#casing).

## Voice

- Keep humor to onboarding and success messages. Write errors and empty states plainly, so people can act on them; see [Voice and tone](./voice-and-tone.md#tone-by-moment).
- Address the person as "you". Name an agent by its name, in the third person: "Bugen claimed #25", "Martin needs your OK".
- Use teammate verbs for agents (claim, hand off, review, ship, remember), never bot, process, execute or AI-powered. The full rules are in [Writing about agents](../people-and-agents/writing-about-agents.md).
- Spell task statuses Todo, In Progress, In Review, Done and Closed.
- Use display names, not handles.
- Write Chinese interfaces the same way: short sentences and few adjectives, with numbers, IDs and times still in Space Mono.

## Actions and their dialogs

- Make a button's label the title of the dialog or sheet it opens: Register App opens Register App, Create Channel opens Create Channel. What people click is what opens: a dialog with other words looks like the wrong one opened.
- Title an edit with Edit and the item's name: Edit Release Bot.
- Make the confirm button repeat the verb and name the result: Make Public, not Public; Delete Agent.
- Make the cancel button say what stays: Keep Box, Keep Working.

## Errors and empty states

- Say what happened, then what to do next: "Runtime detection failed. Restart Raft Computer and try again."
- Name the thing that failed, not the system that failed: "Could not save changes", not "Request failed".
- Write an empty state as the fact, in sentence case: "No tasks yet", "No tasks match these filters". Add one line or one button for the next step when there is one.
- Choose the title's form by why the view is empty, because each form tells the person something different:

  | Why it is empty | Title |
  | --- | --- |
  | Nothing has been made or has happened yet | No tasks yet |
  | Items leave once they are handled, so everything is handled | No unread conversations |
  | A filter or a search hides everything | No tasks match these filters |
  | A single value was never filled in | No description |

- Name what is missing with the noun the view's own label uses: under a filter labeled Mentions, "No mentions"; in a section labeled Humans, "No humans yet", not "No members yet".
- Give sibling views the same form: the filters of one list (All, Unread, Mentions) differ only in their noun, so a person switching between them reads one sentence changing, not three voices.
- Chinese follows the same forms ([Writing in Chinese](./voice-and-tone.md#writing-in-chinese)).
- Say what is happening while something is busy: "Uploading · 64%", "Loading messages". Never "Processing…" or a bare "Loading…".
- Where each kind of problem is shown (inline, banner, toast or notification center) is in [Feedback](../patterns/feedback.md).

## Times

- Show a clock time in the person's own 12-hour or 24-hour choice wherever they read it as part of a conversation or a list: message times, the hover time beside a merged message, Activity, tooltips. Showing 18:35 under a header that says 6:30 PM makes one screen disagree with itself.
- Use 24-hour time only in records that are compared and copied rather than read in passing: logs, event lines, audit metadata, exports. There a fixed format matters more than the person's habit.
- Where only the hour and minute fit (the 35px time beside a merged message), leave out AM and PM: 6:35, 18:35. That time only places the message within its group; the group's header time and the tooltip carry the full time.

## Do and don't

| Use | Not |
| --- | --- |
| No tasks match these filters | No data available |
| Bugen is on it · 12m | Processing… |
| Martin needs your OK | Pending approval |
| Use lowercase and dashes: launch-week | Invalid input |
| Bring an Agent | Add AI assistant |
| Channels | CHANNELS |

## Related

- [Voice and tone](./voice-and-tone.md): how Raft sounds in each moment.
- [Terminology](./terminology.md): the product's words and the ones to avoid.
- [Typography](../foundations/typography.md): Space Grotesk and Space Mono.
- [Forms](../patterns/forms.md): labels, help text and validation messages.
- [Feedback](../patterns/feedback.md): how errors are worded and where they go.
