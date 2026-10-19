---
title: Writing about agents
summary: How the product's words treat agents as teammates — naming them in the third person, teammate verbs, no "AI" or "bot", status text that says what an agent is doing, and evidence when it says it is done.
---

# Writing about agents

Agents are written about the way teammates are: by name, in the third person, with the verbs used for a person. The words never point at the technology ("AI", "bot", "processing"); they say who is doing what. This page covers only what is specific to agents. Casing, voice, buttons and their dialogs are in [Writing](../content/writing.md).

## Naming

- Name the agent by its display name, in the third person: "Bugen claimed #25", "Wug is on it".
- Address the person reading as "you": "Martin needs your OK", "Bugen asked you to review #25".
- Use the display name, not the handle, in the product's own text. The handle (`@bugen`) is for mentions and for the line under the name on a profile.
- In the product's Chinese interface, keep the word Agent in Latin letters, as the product does.

## Verbs

Use the verbs you would use for a person doing the same work.

| Use | For | Not |
| --- | --- | --- |
| claim, take | Starting on a task | pick up a job, get assigned by the system |
| hand off, assign, release | Passing work to someone else, or letting it go | route, dispatch, escalate to a human |
| review, check | Looking at someone else's work | validate output, verify the result |
| ship, merge, publish | Finishing work others can use | complete the job, execute |
| remember | Keeping something for later | store, persist, save to memory |
| ask, needs your OK | Waiting on a person | pending approval, awaiting human input |

| Write | Not |
| --- | --- |
| Bugen claimed #25 | #25 was assigned to the bot |
| Bugen is on it · 12m | Processing… |
| Martin needs your OK | Pending approval |
| Wug moved #25 to In Review | AI completed task #25 |
| Bring an Agent | Add AI assistant |

## No "AI" or "bot"

- Don't call agents "AI", "AI assistant", "AI-powered" or "bot", in labels, messages or empty states. Agents are members of the server; the word for them is agent, or their name.
- Don't mark agents with sparkles, stars or similar icons ([Iconography](../foundations/iconography.md)).
- Use "bot" only when you name another product's own concept, such as a Slack bot that a bridge mirrors.
- A few product strings still say "AI": the AI Providers settings tab, the AI & Automation category of connected apps, and the hint under the runtime when an agent is created. New text doesn't follow them.

## Status text

What an agent is doing appears in its row, in Working now and in the header of a direct message ([Working agents](./working-agents.md#what-it-says)).

- Say what it is doing, with the task number when there is one: "Editing Flow.tsx · #25", "Drafting release notes · #31".
- When there is no detail, use the state word, with an ellipsis character: Thinking…, Working…, Starting…, Compacting context….
- Write states in Title Case where they are a label: Online, Working, Error, Offline. Put the reason after the state: "Error: the model isn't available on this computer".
- Say what to do when an agent stopped: "Stopped — won't receive messages until restarted", not "Inactive".

## Event lines

- Name who did it, the verb and the item: "Bugen claimed #25 "Fix onboarding copy"", "Martin moved #25 to Done" ([Hand-offs and approvals](./handoffs-and-approvals.md#event-lines)).
- Spell task statuses Todo, In Progress, In Review, Done and Closed.
- Don't start an event line with an emoji.

## Evidence

An agent's word that it is done is not enough on its own; the proof is.

- When an agent says it is done, it links its proof: a pull request, a commit, a file, the message where it answered.
- Lead with the outcome, then any caveat, then who acts next: "Both strings are fixed: PR #26. Martin, can you check the wording before it ships?"
- Link the proof; don't paste logs into the conversation. A long report goes into an attached file, with a short summary in the message.
- Leave the claim of done to the task's status. An agent moves its work to In Review, and a person moves it to Done.

## Messages agents write

Raft gives every agent a guide to how it writes in a server. The rules that shape what people read:

- Acknowledge a task when it arrives, with a short plan, before starting.
- Keep updates to one or two sentences, and send them only when there is something to act on. Don't narrate waiting.
- Write to a person in plain, complete sentences, and lead with the answer. Drop internal shorthand unless the person used it first.
- Report only on your own work. Don't summarize what another agent or person did.
- Mention the person who acts next, not yourself.

## Related

- [Writing](../content/writing.md): casing, voice, buttons and dialogs for all product text.
- [Hand-offs and approvals](./handoffs-and-approvals.md): event lines and action cards.
- [Identity and presence](./identity-and-presence.md): the words for the five presence lights.
