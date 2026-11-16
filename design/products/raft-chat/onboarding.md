---
title: Raft Chat — Onboarding
summary: The first run — onboarding v3's one question, sign-up and setup as split pages whose preview grows into the first channel, the first agent and the tour; and the five-step setup dialog that ships until v3 does.
---

# Raft Chat — Onboarding

The person arrives with something they want done. Onboarding v3 asks for it first, signs them up, puts a computer to work and starts Cindy, the setup agent, who proposes one agent and one channel for it. Every page up to that point is a split page: what to do on the left, on the right a preview of the first channel that fills in as things become real. Creating the agent opens the server for the first time, with only two things in it, and the tour runs while the agent works. Onboarding ends as a trio: the person, Cindy and one agent (stdrc, 2026-11-14).

v3 ships behind its feature flag. Until it ships, the product's first run is the five-step setup dialog ([The shipped setup dialog](#the-shipped-setup-dialog-shipped-flow-only)). Sections marked v3 describe the new flow; the others hold for both.

## Structure

### The flow (v3)

| Step | Desktop app | Web | Phone |
| --- | --- | --- | --- |
| What to work on | [The first screen](#the-first-screen-v3) | The same, at `/signup` | The same, one column |
| Sign up | The sign-up form, as a split page | The same | One column; email, password, terms and Continue together, then "or", then the social buttons |
| Confirm identity | The handle first (the person chooses it; it can't change later), display name, picture, and an optional How did you hear about Raft? Everyone passes it, social sign-up and invited people too | The same | One column |
| Put a computer to work | "Your agent team will work on this Mac" ("this PC" on Windows, "this computer" on Linux): the computer, Cindy's model, Keep Raft running in the background, Start. The server is already created at sign-up, so there is no create-server step | First Get the Raft app (or install Raft Computer yourself), then Open Raft, which continues in the app at this step | Open raft.build/go on a computer and type the code it shows into the phone (Continue); the computer signs in, then Start there. A text link, Email me the link, sends a plain email pointing to raft.build/go |
| Cindy | The same page: the computer is added, Cindy starts | In the app | Follows the computer's progress |
| Talk to Cindy | A split page: the DM with Cindy on the left (real messages). She restates the request, looks at the computer reading only, and proposes an agent and a channel in a create-agent card | In the app | Cindy's DM, full screen, with no tab bar |
| Create the agent | The Create agent dialog, with one more field, New channel | The same | The same form in a bottom sheet ([Drawer](../../../packages/ui/src/components/drawer/drawer.md)) |
| The server | Cindy's DM and the new channel; the [tour](#the-tour-v3) runs over the agent at work | The same | Home, with a 3-stop tour; Done opens the channel |
| First result | Cindy says in her DM that it arrived and how to answer it | The same | The same |

Invited people take a short line: sign up, confirm identity, then land where they were invited. They don't get the first question, a computer or Cindy's setup: they came to join someone else's work.

### The first screen (v3)

- Ask one question, as the title: "What should your agent team work on?". The answer comes first: the text box, focused on open, empty, with Continue disabled until it has words (stdrc, 2026-11-14).
- Put the examples under the box, as `outline` buttons; one fills the box, and the person can edit it. The last is "Not sure yet, show me what you can do", which Cindy answers with three things that role often does.
- Put the role on the examples' own line, at its start: "Examples for" and a small [Select](../../../packages/ui/src/components/select/select.md), "Any kind of work" by default. Changing it changes the examples. It is optional, so it is a way to change the examples, not a question of its own; it is the field the old survey's role question filled, and Cindy reads it.
- Continue is the pink button, full width. The line under it is "Already have an account? Sign in".

### Split pages

Every page before the person is in the server has one layout: in v3 from the first screen to Create agent, in the shipped flow signing up, the account's identity and creating a server. They follow [Brand](../../foundations/brand.md#how-much-brand): from 1024px a brand pane beside the form, below 1024px a frame bar above it. The pages keep the same frame from one to the next, so they read as one flow (stdrc, 2026-11-11, #wg-onboarding-v3:011ae21f).

- From 1024px, give the left column 2 parts of 5 and the pane 3 parts, on every page; a form is at most 448px wide. The left is what the person does, so it comes first in reading order; the pane only shows the result. A page with the pane on the other side reads as a different flow.
- In v3, start the left column's title 96px below the window's title bar on every page, whatever the page holds, and pin the preview's top edge at the same height. A column centered vertically moves the title from page to page, and a centered card jumps up as it grows; pinned, the card grows downward only.
- The pane shows what the page creates: in v3 [the preview card](#the-preview-card-v3) on every page. In the shipped flow, on the account's identity a message and a profile card with the person's name, handle and picture as they type them; on creating a server, the server with its name and address. The preview is tilted −1° with the hard sticker shadow.
- In the shipped flow, a page that creates nothing visible yet (sign-up) holds a collage of agents' pixel faces and the composable widgets a designer drew for Raft, saying nothing in particular (stdrc, 2026-11-11, #wg-onboarding-v3:1628f68a). Until those widgets are in raft-ui, the pane there is halftone alone. v3 has no such page: the card is there from the first screen.
- Under the form, a line says who is signed in, with Sign out ("Signed in as martin@acme.dev. Sign out"), on every page after sign-up. Before there is an account, the line is "Already have an account? Sign in".
- In v3, the conversation with Cindy is a split page too: her DM in the left column (at least 360px), the preview in the pane.
- Give the split pages no Search and no conversation Settings: before the server opens there is nothing to search and nothing to set. Their only header control is the person's avatar, opening a menu with "Signed in as" and the email, and Sign out, so someone signed in to the wrong account has a way out (stdrc, 2026-11-14).

### The preview card (v3)

One thing grows: the card is the first channel before it exists, and it fills in as the flow makes each part real (stdrc, 2026-11-14).

- Show only what exists, and add each row when it becomes real. Never draw a placeholder row for something still to come: a gray "The first agent" promises a step instead of showing a result.
- Make the card's title the person's own sentence: on the first screen it follows what they type (an example in `foreground-hint` while the box is empty), and every later page shows what they typed, never a canned sentence. On Cindy's plan the channel's name goes above it, and the sentence becomes the channel's topic.
- Fill Members in order: You (an empty avatar until the account exists, then the person's picture and name); Cindy, when she starts; the agent, on Cindy's plan, with "joins when you create it". Cindy is a member of the channel from the start ([Entering the server](#entering-the-server-v3)).
- Add Works on, with the computer, once there is one: "this Mac" on the Start page, online once it is added. The web page that gets the app has no computer row yet.
- Don't add a Tasks row: Cindy creates no tasks, the agent does, in the channel.
- Never remove a row. What has appeared stays, through errors too: a page that failed keeps the card as it was before the error.
- Draw the card on cream paper in both themes: give it the `light` class and `bg-layer-sidebar`, so it takes the `light` theme's cream and inks whatever the page's theme is. Products don't use raw `palette-*` classes, and `sticker-paper` is white. Make it 440px wide, with 24px padding and 20px between rows; each row's label is Space Mono `text-mono-meta`, `foreground-muted`.
- Show invited people the same card: the server and who is in it for a server invite, the channel for a channel invite. A channel invite opened signed out shows placeholders only until the invite is known to be the person's, because the link may have been forwarded.

### Phone (v3)

Every phone page before the server is one skeleton, so nothing moves between steps (stdrc, 2026-11-14):

- The status bar and a 56px frame bar with the logo ([Brand](../../foundations/brand.md#how-much-brand)).
- The title and its one-line hint at the top, never centered, so the keyboard doesn't move them. The page's content scrolls under them.
- The one primary button pinned at the bottom, in thumb reach, at the same height on every page.
- Exactly one line under the button, in the same place on every page: "Signed in as … Sign out" after sign-up, "Already have an account? Sign in" before. Other links belong to the page's content.
- Sign-up is the one exception: its Continue sits in the form, after email, password and terms, so it doesn't read as one of the social buttons. The line under it stays in its place.
- No preview pane. Give text links a 44px tall hit area; the text stays as it is.
- Pair the computer with a typed code, not a QR code. The app has no scanner, the phone's camera opens a browser that isn't signed in, and a code put inside a link could sign someone in from a phished link. So a pairing code is only ever typed; that rule is decided here, not quoted from an existing device sign-in document (Ferry and Lagoon, 2026-11-15).
- Show only states Raft can observe: the computer signed in, the computer added, Cindy starting. Nothing tells the phone that the computer is downloading the app, so the page doesn't say so; a guessed step that turns out wrong makes the person stop trusting the page.
- Start is pressed on the computer, which adds itself to the server; the phone says "Press Start on your computer." Try again, after Cindy couldn't start, works from either: it restarts her on the server. Cindy starting and Cindy couldn't start use the desktop text in one column.
- Keep the rest inside onboarding: after Cindy's first words the phone shows her DM full screen, and Create agent opens as the dialog's bottom sheet.

### Signing in from somewhere already signed in (v3)

Two pages let a place where the person is already signed in approve a sign-in somewhere else: the phone approving the computer that showed a code at raft.build/go, and the browser approving Raft Desktop's "Continue with your browser". They are one page, so a person who has seen one recognizes the other (Ferry and Jasper, 2026-11-15, slock #15081, #15086):

- The title asks the question: "Sign in to Raft in Chrome on macOS?", "Sign in to Raft Desktop?". It is a pure confirmation, with nothing to fill in, so the button answers it with the title's verb, Sign in ([Writing](../../content/writing.md#actions-and-their-dialogs)).
- One line under it says when to sign in and when not: "Sign in only if this is your computer, in front of you." It names the situation, not another page's button, so it stays true when that label changes.
- The details that let the person check: the account it signs in as, the code, when it was asked and from where ("1 minute ago · Berlin, DE").
- One pink Sign in, pinned at the bottom on a phone. Refusing ("This isn't my computer", Cancel) and switching ("Use another account") are text links in the content under the details: three stacked buttons made refusing look as weighty as signing in.

On Raft Desktop's sign-in page, "Continue with your browser" is a button, first among the provider buttons and drawn like them: it is a way of signing in like Google or GitHub, and the quickest one for someone already signed in on the web, who would miss it as a small link. While it waits, "Waiting for your browser… Cancel" sits under the buttons.

### Entering the server (v3)

- Bring the person into the server only once it holds something of the person's: the first agent being created (stdrc, 2026-11-14). Until then every step is a split page.
- Hand over two things: the DM with Cindy, the conversation that built the agent, and one channel for the job. No #main.
- Make the onboarding a trio: the person, Cindy and one agent. Don't suggest a reviewer or other roles; Cindy creates another agent only when the kind or scope of the work grows.
- Make Cindy a member of the channel, quiet unless someone mentions her. She is in its members and the server's from the moment she starts.
- Let Cindy triage only: she says what she saw and hands the request, with what she found, to the agent. The agent decides how to work and creates the tasks itself.
- Keep the Create agent dialog after Cindy's card, filled in from it, with New channel in place of Channels: the person should feel the agent being created, not click it into being from a card (stdrc, 2026-11-14). Create makes the agent and the channel together, or neither.
- The agent starts working as it arrives, so the tour covers the time it works.

### The tour (v3)

The [coach marks](../../patterns/coach-marks.md) over the server while the agent works, once:

| Desktop, 6 stops | Phone, 3 stops on Home |
| --- | --- |
| Cindy's DM; the channel ("you, Ada, and Cindy, who stays quiet unless you mention her"); the agent at work (its line in the channel); the channel's settings, where its members are; "You can leave", on the bell, with Turn on notifications; the composer | Cindy's DM; the channel; "You can leave", on the bell |

- Point the members stop at the channel's settings in its header, not at Members in the rail: the person's question at that moment is who is in this job, not who is in the server, and the channel's members are already in its settings (stdrc, 2026-11-14, on prototype v74). Its text says what the place is for ("See who's in this channel, and add people or agents."), not the members again: the channel stop has just named them.
- After the tour, no scripted guidance: the first result, tasks, threads and files are explained by Cindy or the agent when they first appear.
- Ask nothing else in the first session. Choose your display style, which the shipped setup asks as a step, opens once the next time the person opens Raft (a new session: the app launched again, or a new tab, not the same tab reloaded), on a device with no coach mark and no other dialog open. Right after Done it would be a second interruption in a row, for a preference that has a default, just as the person turns to watch the agent work (Ferry/Jasper, 2026-11-16, end-to-end run).

### Coming back (v3)

- Record the step on the server, so the person resumes where they stopped, on any device, any time later.
- Make every split page work as a landing page: its title and the preview say where the person is without the page before it.
- Don't put Open Raft on the Cindy page: coming back resumes there, so there is no empty server to go out to (stdrc, 2026-11-14).

### When something fails (v3)

Until Cindy is online, the page speaks; once she is, she speaks in her DM. Only Cindy's own failure returns to a page.

- On a page that speaks, put on the left what happened, what the person can do, and one recovery button. Freeze the preview as it was before the error. Never clear what the person filled in.
- Move on by itself once the cause is gone: no Continue to press again.
- Say what happened and what to do, with no error code ([Writing](../../content/writing.md#errors-and-empty-states)).

| Before Cindy is online: the page | What it shows |
| --- | --- |
| The Mac couldn't be added | The reason, Try again; the line under it Use another computer |
| No usable runtime yet | The recommended runtimes and their install commands; it notices the install and goes back by itself |
| A runtime installed but not signed in, and nothing else on the list works | The computer's row says so, with Sign in; Start is disabled until then |
| Web: the app didn't open | The primary button becomes Download again; open again, or install Raft Computer yourself |
| Web: a sign-in or setup link expired | That it expired and nothing is lost, and one button that continues from the same step |
| A pairing code expired | The page replaces the code by itself; no button |
| Phone: the email wasn't sent | Try again; typing the code stays on the page |
| The computer went offline mid-setup | The page says so and how to bring it back, with no terminal command; it returns to its step once the computer is back |
| Cindy couldn't start | Only after every usable model failed (one failure moves to the next by itself, and the Start page says what changed): each reason, Try again, or change Cindy's model |
| Cindy hasn't responded | Two minutes after she starts, or when she stops mid-conversation: Restart Cindy; the line under it Report issue |

| Once Cindy is online | What it shows |
| --- | --- |
| The computer goes offline while she looks | A `PanelNotice` under her header ([Feedback](../../patterns/feedback.md#errors-by-scope)); the conversation and the preview stay; it goes when the computer is back, and she goes on |
| Create agent fails on the server | An orange Banner in the dialog, the confirm button becomes Try again, the form is kept |
| Create agent while the computer is offline | An info Banner with a spinner (waiting, not failing); Create disabled until the computer is back |
| The agent fails to start | Cindy says in her DM, in a sentence or two, what happened and what she did, or the one thing the person has to do |

### Naming (v3)

- Name the channel after the job: the object and the kind of work, 2 or 3 words, in the person's own words and language, lowercase with hyphens, at most 20 characters (#acme-issues for "Fix the easy issues in acme-web"). Never main, general, team or the agent's name. Cindy proposes it; the person can change it in Create agent. A name already taken, archived channels included, is replaced by another without an error.
- Give the agent a human name that fits the kind of work (Ada for code, Paige for writing), not a tool's name such as Fixer, and not one already in the server.

### The shipped setup dialog (shipped flow only)

The shipped flow, until v3 ships behind its flag. Until the new server has a computer and its first agent, the app shows its setup as a dialog over the server's pages, with a scrim. The dialog can't be dismissed: Esc doesn't close it and it has no ×. The native apps show the same steps as a full page instead.

The steps, in order:

1. **Connect a computer** (960px wide): what a computer is, the command to run, and a log that follows the connection. When the server already has computers that are offline, the step becomes Start your computer, with the command that brings one back.
2. **Create the first agent** ("Meet Cindy"), with the same form as Create agent.
3. **Tell the agent about you**: a short survey of option grids.
4. **Choose your display style**.
5. **The handoff**: the agent takes it from here.

Steps 3 to 5 share one frame, 720px wide and about 520px high, so the dialog doesn't change size between them. It is the showcase frame, which only these steps, the Upgrade to Pro dialog and Pro's Add seats dialog use, outside the four Dialog sizes ([Dialog](../../../packages/ui/src/components/dialog/dialog.md#variants)). Every step has:

- **A header**: the step label "Set up your server" in Space Mono, the title in `text-title` and one line of explanation.
- **A body** that scrolls inside the frame.
- **A footer** with muted text links ([TextLink](../../../packages/ui/src/components/text-link/text-link.md)) on the left (Switch server, and on the first two steps Server settings) and the pink button on the right (Next, Continue, Let's Go). On a narrow screen the pink button spans the width.

```example
dialog/compositions/server-setup-step
```

## Rules

- In the shipped setup dialog, use the brand only on the handoff step ([Brand](../../foundations/brand.md#how-much-brand)): the agent's 99px avatar hops once, and two square marks pop beside it and fade ([Motion](../../foundations/motion.md#usage)). The other steps are plain dialogs on paper.
- Don't add a Skip button or step dots to the setup, in the dialog or on the split pages: each step is needed to reach the first agent. The way out of the shipped setup is Switch server; of the split pages, the account menu. The tour is not setup: its coach marks count their stops and have Skip ([Coach marks](../../patterns/coach-marks.md)).
- Write the step label in sentence case. [0002](../../decisions/0002-no-all-caps.md) allows one all-caps step label on an onboarding screen; the product doesn't use it.

## Related

- [Coach marks](../../patterns/coach-marks.md): the tour's bubbles.
- [Brand](../../foundations/brand.md#how-much-brand): how much brand the split pages use.
- [Feedback](../../patterns/feedback.md#errors-by-scope): where each kind of error goes.
