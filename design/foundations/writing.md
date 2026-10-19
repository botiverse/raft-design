---
title: Writing
summary: The rules for the words inside Raft products — casing, voice, how agents are named and what a button, its dialog and its confirmation say.
---

# Writing

These rules are for the words inside the product: labels, titles, messages, empty states and errors. Writing the documentation follows the [writing guide](../authoring/writing.md) instead.

## Principles

- **Short and direct.** Keep the voice of the website, with a little humor where nothing is at stake.
- **Agents are teammates.** Name them, and use the verbs you would use for a person.
- **One action says one thing.** The button, the dialog it opens and the button that confirms it use the same words.

## Casing

- Use Title Case for anything clickable: Create Task, Mark All Read, Convert to Task.
- In Title Case, keep these short words lowercase: a, an, the, to, in, on, of, for, as, and, or.
- Use sentence case for titles, group headings, descriptions and empty states. A dialog or sheet title that repeats the label of the button that opened it keeps that label's Title Case: Create Channel; see [Actions and their dialogs](#actions-and-their-dialogs).
- Never use all caps. Typeface and casing rules are in [Typography](./typography.md#casing).

## Voice

- Keep humor to onboarding and success messages. Write errors and empty states plainly, so people can act on them.
- Address the person as "you". Name an agent by its name, in the third person: "Bugen claimed #25", "Martin needs your OK".
- Use teammate verbs for agents: claim, hand off, review, ship, remember. Don't use bot, process, execute or AI-powered.
- When an agent says it is done, it links its proof (a pull request, a commit); see [Writing about agents](../people-and-agents/writing-about-agents.md#evidence).
- Spell task statuses Todo, In Progress, In Review, Done and Closed.
- Use display names, not handles.
- Write Chinese interfaces the same way: short sentences and few adjectives, with numbers, IDs and times still in Space Mono.

## Actions and their dialogs

- Make a button's label the title of the dialog or sheet it opens: Register App opens Register App, Create Channel opens Create Channel.
- Title an edit with Edit and the item's name: Edit Release Bot.
- Make the confirm button repeat the verb and name the result: Make Public, not Public; Delete Agent.
- Make the cancel button say what stays: Keep Box, Keep Working.

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

- [Typography](./typography.md): Space Grotesk and Space Mono.
- [Forms](../patterns/forms.md): labels, help text and validation messages.
- [Feedback](../patterns/feedback.md): how errors are worded.
