---
title: Writing
summary: The rules for the words inside Raft products — casing, voice, names, and what a button, its dialog and its confirmation say.
redirectFrom: [foundations/writing, decisions/0038-button-names-its-dialog]
---

# Writing

These rules are for the words inside the product: labels, titles, messages, empty states and errors. How Raft sounds, and why, is in [Voice and tone](./voice-and-tone.md); which word to use for each thing is in [Terminology](./terminology.md). Writing the documentation follows the [writing guide](../authoring/writing.md) instead.

## Principles

- **Short and direct.** Say the fact or the action, in as few words as it takes. Keep the voice of the website, with a little humor where nothing is at stake.
  - Short never cuts the line beside the sign-up or sign-in action on a page a signed-out visitor sees: a public Artifact page, an invite landing, a public channel page. Keep one plain line there that says what Raft is and why to sign up ("Get started in minutes. Sign up and build with your AI agents on Raft."). The visitor doesn't know Raft yet, and a button alone tells them nothing (xxchan, 2026-11-10, #proj-workspace:45dbc16f). The prompt's layout is in [Banner](../../packages/ui/src/components/banner/banner.md#the-sign-up-prompt-on-a-public-page).
- **What can't be done isn't explained.** When an action isn't available here (this platform, this version, a feature turned off, a check Raft hasn't run on this setup), don't show its control, and don't add a line saying why: the reason is about how Raft is built, and the reader can do nothing with it. "Needs a Linux Computer and a Claude Code version Raft has tested" names three internals and no next step. When there is something the reader can do, show only that step, in the place they would act ("Update this Computer to reset limits here"), and drop the reason around it. When hiding the control would leave the reader looking for it (a menu item people already know, a button they used yesterday), keep it disabled with a tooltip that says the same one step (xxchan, 2026-11-12, #proj-runtime:0c91cbf2). Who can do it is not an internal reason: "Only an owner or admin can archive this channel" tells the reader whom to ask, which is a step they can take, so it stays (as in [Tasks](../patterns/tasks.md) and a disabled button's tooltip, [Button](../../packages/ui/src/components/button/button.md#accessibility)). Two cases it doesn't cover:
  - **Not loaded yet.** What will work once its data arrives (Forward while the conversation loads) stays where it is, disabled, with no line about why, and works as soon as it can. Hiding it would make the menu jump when it comes back, and "Loading" beside a control says nothing the reader can act on. If loading fails, that is an error and is reported like one ([Feedback](../patterns/feedback.md)), never a control left disabled for good.
  - **Rare failures.** A failure almost nobody meets (a browser that can't draw a chart for export) can keep a plain error rather than a designed path, as long as the failure is reported to Raft's tracing, so it is counted and can be fixed (xxchan, 2026-11-12, #proj-raft-ui:#245).
- **Agents are teammates.** Name them, and use the verbs you would use for a person; see [Writing about agents](../people-and-agents/writing-about-agents.md).
- **One action says one thing.** The button and the dialog it opens use the same words, and the button that confirms it uses the same verb.
- **A heading carries no hint that restates its name.** Give a section heading, a group heading or a label a hint (a description, a line beside it or under it) only when the hint tells the reader something the name doesn't: a consequence ("Also archives it for every other server"), a scope that isn't obvious ("Saved on this device"), a limit ("Up to 30"). Channel settings needs no "Same for everyone here", and Your preferences no "Only for you": the names already say it, and a hint that repeats them is one more line to read for nothing, which teaches people to skip the hints that do matter (stdrc, 2026-11-10, #proj-raft-ui:dae8db07). The same holds for a setting's description, which states the result rather than repeating the title ([Forms](../patterns/forms.md#fields)).

## Casing

- Use sentence case for everything people can click or that names an action: buttons, menu items, tabs and tab bar items, segmented controls, text links, and the tooltips and accessible names (`aria-label`) of icon buttons. Capitalize only the first word and names: Create task, Mark all read, Create task from message, View in channel, Sign out, Add reaction. A link inside a sentence takes the sentence's case.
- Use sentence case for titles, group headings, descriptions and empty states too. A dialog or sheet title that repeats the label of the button that opened it repeats it exactly: Create channel opens Create channel. A row in an item's own menu leaves the item out, and the title names it: Rename opens Rename Artifact; see [Actions and their dialogs](#actions-and-their-dialogs).
- Give a word a capital inside a label exactly when it has one in the middle of a sentence. Names do: Raft and its products, plans and features named as proper names (Agent Lounge, Stamp, Porthole, Raft Computer, Artifact, Pro), people, agents, servers, channels, third-party names (GitHub, Slack, Google) and acronyms: Continue with Google, Open in Stamp, Edit Release Bot, Save as Artifact, Upgrade to Pro.
- Treat as names only the destinations and views that [Terminology](./terminology.md#places) lists (Home, Activity, Saved, Settings, Members, Tasks, Computers, and Activity's views Active, Saved and Done) and the task statuses, wherever they name the place or the status: Back to Home, Remove from Saved, Restore to Active, Mark as Done, Move to Backlog, Collapse Backlog. A status or an agent state of more than one word is itself in sentence case: In progress, In review.
- Write every other group heading, section and settings page in sentence case, though it names a place: Direct messages, Joint channels, Plan & billing, IM bridges, MCP servers, AI providers, Release notes, Language & region, Server profile, Server settings, and a channel's Tasks and Files sections inside a label (Close tasks, Open files).
- Write roles, states and every other noun in lowercase inside a label, as in a sentence ("only an owner or admin can…"): Invite members, Visible to guests, Make admin, Add computer, Create tasks. Read and unread are states, not views, so Mark as unread sits beside Mark as Done. A permission's name is a label too: Create agents. A label of a single word starts with a capital as any first word does: Settings, Members, Owner, Admin.
- Quote another label as it is written: Opens Create channel.
- Never end a label with an ellipsis, in any language: Decline, not Decline…, and the same in every translation. A button that opens a dialog says the action it leads to, and the dialog asks the rest. A trailing "…" reads as text that was cut off, most of all in Chinese, where no label convention gives it another meaning (Artea, 2026-11-08, #proj-stamp:06e723e1). Progress text may keep it: Loading…, Saving…. So may a field's placeholder (Search members…), and an item in a menu the operating system draws (the macOS menu bar, the Dock and tray menus), which follows the platform's own convention: there every app marks an item that opens a window with "…", Settings… among them, so it reads as the platform's, not as cut-off text (Artea, 2026-11-08, #proj-raft-ui:9649adf4). A label is never cut either: it wraps, or the layout makes room ([Typography](../foundations/typography.md)).
- Spell the task statuses Backlog, Todo, In progress, Done and Closed, the same in a label, a chip and a sentence.
- Long labels, such as menu items, read awkwardly in Title Case, and one casing for every piece of text is simpler to write, translate and check, with no list of short words to keep lowercase ([0044](../decisions/0044-sentence-case-for-labels.md)).
- Write product nouns in lowercase inside a sentence and a label: "Move to another computer", "Leave this server", Add computer. They take capitals only as a name: Raft Computer.
- Never use all caps. Typeface and casing rules are in [Typography](../foundations/typography.md#casing).

## Voice

- Keep humor to onboarding and success messages. Write errors and empty states plainly, so people can act on them; see [Voice and tone](./voice-and-tone.md#tone-by-moment).
- Address the person as "you". Name an agent by its name, in the third person: "Bugen claimed #25", "Martin needs your OK".
- Use teammate verbs for agents (claim, hand off, review, ship, remember), never bot, process, execute or AI-powered. The full rules are in [Writing about agents](../people-and-agents/writing-about-agents.md).
- Use display names, not handles.
- Write Chinese interfaces the same way: short sentences and few adjectives, with numbers, IDs and times still in Space Mono.

## Actions and their dialogs

- Make a button's label the title of the dialog or sheet it opens: Register app opens Register app, Create channel opens Create channel. What people click is what opens: a dialog with other words looks like the wrong one opened.
- Title an edit with Edit and the item's name: Edit Release Bot.
- Label the button that does what the dialog is for with the action it performs, without its object. Usually that is the title's verb: Create channel → Create, Register app → Register, Invite human → Invite, Stop Wug? → Stop. An Edit title's button is Save: Edit Release Bot → Save, because what the button does is save the changes. The title is right above it and names the object already; a button that says it again reads as an echo, and on a phone sheet the two sit side by side in one row.
- Keep the whole verb, with the words that belong to it: Sign out, Start over, Turn on, Make public, Reset session & restart. Never cut them to Sign, Make or Reset: Public alone isn't an action.
- Add the object only when the verb alone would leave people guessing:
  - The title doesn't name it, or isn't an action: Unsaved changes → Discard changes; See your whole chat history → Upgrade to Pro.
  - The button does something other than the title says, or says where or how far it goes: Add computer inside Create agent, Continue to Stripe, Move to the cloud, Disconnect for all agents.
  - It counts what it acts on: Add 3 members, Create 3 tasks. "Add 3" doesn't read.
  - Its verb is Cancel: Cancel subscription, so it can't be mistaken for closing the dialog.
  - It appears away from its title and has to say on its own which action it is: the confirm button of an action card in a conversation says Create channel, because several cards can be on screen at once and each is read from its button ([MessageActionCard](../../packages/ui/src/components/message-action-card/message-action-card.md)).
- Keep the object on a confirmation that can't be undone, the red one: Delete channel, Delete server. It's the one moment that has to be exact, and people read the button, not the title, when they press it.
- Label the button that closes without acting Cancel. Only when the action is itself a cancel or a stop does Cancel read as the action; then say what stays instead: Keep subscription beside Cancel subscription, Keep migrating beside Cancel migration.
- Done, OK, Got it and Close aren't actions. Use them only when what the dialog is for has already happened and the button only closes it: the last step of Add computer says Done, because the computer has connected by itself.
- Read the button after the title to check it: Create channel, Create reads right; Create channel, Create channel is an echo. If the verb alone no longer says what happens, or the button is red, put the object back.
- Name the actions in an item's own menu (its ⋯ menu, its context menu) without the item: Rename, Delete, Unfollow, Copy link, Download. The menu opens from the item, so the item is already named; repeating it makes every row longer and the verbs harder to scan. Keep one form in a menu: Rename Artifact beside Unfollow reads as two different objects (xxchan, 2026-11-09, #proj-workspace:dc3c9fc9). Add an object only where the row acts on something other than the item: Copy link to this version, Send to conversation. The red confirmation the row opens keeps its object (Delete Artifact), as above. The dialog a row opens still names the item in its title: Rename opens Rename Artifact, Delete asks Delete this Artifact?.

## Signing in and out

- Say Sign in and Sign out, the words of the sign-in page, never Log in, Log out or Login as a verb. One pair everywhere, in the account menu, Settings, a runtime on a computer and an app's connection, so people learn it once. Sign in and sign out are also what Apple, Google, Microsoft, GitHub and Slack say.
- Write signed in, signed out and sign back in in running text; sign-in as a noun: "The sign-in window was closed."
- In Chinese, write *dēnglù* and *tuìchū dēnglù* in Simplified, *dēngrù* and *dēngchū* in Traditional, for every one of these.
- Login keeps its form only inside a name: the Login with Raft and Agent Login features, and the CLI command `raft integration login`. It is never the verb.

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
- Say how much of a limit or a capacity is used, with the word, and keep its reset time beside it: "62% used · resets in 3h". Never a bare "62%", which could mean used or left, and never what is left in its place; an amount free may go in a tooltip: "378 GB free of 994 GB" ([Meter](../../packages/ui/src/components/meter/meter.md#content)).
- Where each kind of problem is shown (inline, banner, toast or notification center) is in [Feedback](../patterns/feedback.md).

## Times

- Show a clock time in the person's own 12-hour or 24-hour choice wherever they read it as part of a conversation or a list: message times, the hover time beside a merged message, the hover time of an older Activity row, tooltips. Showing 18:35 under a header that says 6:30 PM makes one screen disagree with itself.
- In a list grouped by day, such as Activity, write the times of today's rows, and of any row less than 1 hour old, short and relative instead: now, 3m, 2h. The day heading already says Today, and the gap is what people read there ([Times in list rows](../patterns/lists.md#times-in-list-rows)).
- Use 24-hour time only in records that are compared and copied rather than read in passing: logs, event lines, audit metadata, exports. There a fixed format matters more than the person's habit.
- Where only the hour and minute fit (the 35px time beside a merged message), leave out AM and PM: 6:35, 18:35. That time only places the message within its group; the group's header time and the tooltip carry the full time.

## Do and don't

| Use | Not |
| --- | --- |
| No tasks match these filters | No data available |
| Bugen is on it · 12m | Processing… |
| Martin needs your OK | Pending approval |
| Use lowercase and dashes: launch-week | Invalid input |
| Bring an agent | Add AI assistant |
| Channels | CHANNELS |

## Related

- [Voice and tone](./voice-and-tone.md): how Raft sounds in each moment.
- [Terminology](./terminology.md): the product's words and the ones to avoid.
- [Typography](../foundations/typography.md): Space Grotesk and Space Mono.
- [Forms](../patterns/forms.md): labels, help text and validation messages.
- [Feedback](../patterns/feedback.md): how errors are worded and where they go.
