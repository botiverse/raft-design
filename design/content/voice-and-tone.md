---
title: Voice and tone
summary: How Raft sounds — short, direct and plain, with light humor only in onboarding and success — and how the tone changes from setup to errors to destructive actions.
---

# Voice and tone

Raft sounds like a capable teammate at the next desk: short, direct and plain. The voice is the same in every product and on every screen. The tone shifts with what is at stake: a little warmth when someone sets up a server or finishes something, plain words when something goes wrong, exact words when an action can't be undone. The rules for the words themselves are in [Writing](./writing.md).

## Principles

- **Say it once, briefly.** People read Raft between other work and alongside agents that write a lot. Every extra word competes with a message someone needs to read.
- **Plain beats clever.** Use the product's nouns ([Terminology](./terminology.md)) and everyday verbs. A label people have to decode has failed, however good it sounds.
- **Calm, like the screen.** The interface stays still and keeps color for meaning ([Color](../foundations/color.md), [Motion](../foundations/motion.md)). Words do the same: no shouting, no hype, no alarm unless something is really at risk.
- **Agents are teammates, not features.** Write about agents the way you would write about a colleague, by name and with the verbs you use for people; see [Writing about agents](../people-and-agents/writing-about-agents.md).
- **Help people act.** A message that reports a problem says what to do next. A message that only expresses a feeling ("Oops!") gives people nothing to do.

## How Raft sounds

| Raft is | So it | Not |
| --- | --- | --- |
| Short | Says the fact or the action in one line where it can | Opens with "Please note that…" or closes with "Let us know if you need anything else" |
| Direct | Uses the imperative for steps: "Restart Raft Computer and try again" | "You may want to consider restarting…" |
| Plain | Uses product nouns and common words: server, channel, agent, computer | "Messaging surface", "AI-powered workspace", "compute node" |
| Specific | Names the thing: "Could not save changes" | "Something went wrong" |
| Warm where it costs nothing | Allows a light line in setup and on success | Jokes in an error, a warning or a confirmation |
| Honest | Says what Raft does today | Promises, hedges ("It looks like…"), apologies that replace an explanation |

## Tone by moment

| Moment | Tone | Example |
| --- | --- | --- |
| Onboarding and setup | Warm and encouraging; a little humor is fine. Say what happens next, so people don't wait in doubt | "Your computer shows up here on its own. No need to refresh." |
| Success | Brief, and light if you like. Name what was done | "Computer connected", "Bugen shipped #25" |
| Progress | Factual: who is doing what, and for how long | "Bugen is on it · 12m", "Uploading · 64%" |
| Empty states | The fact, then the next step if there is one | "No tasks match these filters" |
| Errors | Plain: what happened, then what to do. No humor, no blame | "Runtime detection failed. Restart Raft Computer and try again." |
| Warnings | Plain and specific about the consequence | "Apps using this token will lose access. Other tokens will stay active." |
| Destructive confirmations | Exact. Repeat the verb, name the result, say what stays | Delete Agent / Keep Working |
| Notices (toasts, tooltips) | One line, an aside; never the only place for something people must act on | "Link copied." |

- Keep humor to onboarding and success messages. People read an error when something is already in their way.
- Leave out exclamation marks, except in a success or setup line where the warmth is the point. Never in an error.
- Don't apologize instead of explaining. If Raft is at fault, say what failed and what to do, plainly.

## Why the voice is like this

- Raft is open all day, so its words have to wear well. A joke reads once; an error people see every week has to stay useful.
- People and agents share the same channels. A plain, specific voice makes it easy to tell what the product says from what a teammate says, and keeps the product from sounding like a chatbot.
- The visual system gives each color one meaning and keeps notices neutral ([Color](../foundations/color.md#principles)). The voice follows the same rule: emphasis is saved for what matters, so it still works when it is used.
- What people click is what opens ([Writing](./writing.md#actions-and-their-dialogs)), and nothing is set in all caps ([0002](../decisions/0002-no-all-caps.md)). Both rules come from the same idea: the interface never makes people wonder whether they read it right.

## Writing in Chinese

- Follow the same principles: short sentences, few adjectives, the imperative for steps.
- Keep numbers, IDs, times and runtime names in Space Mono ([Typography](../foundations/typography.md)).
- Translate a term the same way everywhere, following the product's catalog; see [Terminology](./terminology.md).
- Write an empty state with *hái méiyǒu* ("not yet") or *méiyǒu* ("none"), in the same forms as the English ([Writing](./writing.md#errors-and-empty-states)). Don't write *zànwú* ("temporarily none"), which reads as an official notice, or *wéi kōng* ("is empty"), which describes the container instead of what is missing.

## Related

- [Writing](./writing.md): casing, labels, dialogs, errors and empty states.
- [Terminology](./terminology.md): the product's words and the ones to avoid.
- [Writing about agents](../people-and-agents/writing-about-agents.md): names, verbs and status for agents.
- [Feedback](../patterns/feedback.md): where each kind of message is shown.
