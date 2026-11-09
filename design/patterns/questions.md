---
title: Questions
summary: How an agent asks a person a question in a conversation — answered where the message is when the question is short, in a card when it isn't — and how an answered, expired or withdrawn question reads.
---

# Questions

An agent often needs one answer before it can go on: which branch to merge, whether to include the screenshots, which of three names to use. It asks in the channel the work is happening in, and the question is a message, not a dialog: the person may answer now or an hour from now, and everyone else in the channel can see that the agent is waiting.

Two shapes carry a question, and the server picks between them before the card is posted. Neither is a choice a designer or a client makes at render time: it is decided once, when the card is measured. A client draws the shape it was given.

## When it applies

A question an agent asks through `question:ask` and the person answers in Raft. It doesn't cover a dialog a person opens (that is [Dialog](../../packages/ui/src/components/dialog/dialog.md)) or a message where only the reply matters (that is [Conversation](./conversation.md)).

## The two shapes

**C · One row of buttons.** Only when the card carries one question, it is a single choice, the server marked it `placement: "inline"`, it has at most 4 options, and no option label is longer than 32 characters (not counting Other). A question that short is a decision the person can make without reading anything else, so it stays in the message: the question as the message's last line, in bold, then one `default` button per option and Other at the end.

- Button labels never end in "…". Other is the whole word, and pressing it expands an input in place, under the row: the person's own answer replaces the placeholder until they pick an option again.
- Under the row, one line of `foreground-hint`: "Fixer is waiting for your answer · 7 days left". Someone who isn't the person asked sees the buttons disabled and "Waiting for Maya to answer".
- Answered, the row is replaced by one line: a `read-mark` check, then "Maya answered **Fix all 4 on a branch**", the answer in bold. Nothing is left to press.

**B · The card.** Everything else: more than one question, a written answer, more than one choice per question, or a question long enough that answering it means reading the card. The card holds the questions and the answer control.

- No head icon, and no "Answer question(s)" line: the card is the question. With one question the title is that question; with several it is "Fixer has 3 questions".
- Under the title, one description line: "Fixer is asking you · 7 days left"; for someone else, "Waiting for Maya · 7 days left".
- The options sit directly in the card, not inside a box of their own, and a single question gets no asterisk.
- "Choose an option first." appears only after the person presses submit without choosing. It is a correction, not an instruction: showing it before anyone has tried turns a question into a form that opens in a warning.

## Rules

- **Decide the shape from the data, once.** Use C exactly under the conditions above and B otherwise, and read the server's `placement` rather than measuring again in the client: the card was measured when it was posted, and a second opinion at render time would draw two clients differently for the same card.
- **Who is being asked changes what can be pressed, never which shape is used.** The person asked can answer; everyone else sees the same question and the same choices, disabled, with the line saying who is waited on. Nobody in the channel should be left wondering whether a question is for them.
- **Say how much time is left, in one unit.** From the card's `expiresAt`: "N days left" past a day, "N hours left" under it, "Less than an hour left" under the hour. Past the expiry the card takes its ended form (below).
- **Keep the question in one place.** The card or the row is the question; the text that mentions the person carries a link to answer, not a second copy of the options. Two copies drift apart the moment one is answered.
- **Answering replaces the question.** Don't leave the options under the answer, greyed: an answered question is a record of what was decided, and a row of dead buttons invites a press that does nothing.

## When it ends unanswered

A question can end without an answer, and the card says which happened, in one line where the question was: expired ("Mei didn't answer within 3 days. Scout was told.") or withdrawn ("Scout withdrew these questions."). Both name the agent that asked and, for an expired card, the person who didn't answer, so the channel reads what happened without opening anything. Don't draw buttons on an ended card.

## Words

- The question is the agent's own words, in the agent's voice. The frame's words around it ("is asking you", "Waiting for", "answered", "didn't answer within") are Raft's, and they're the same whatever the question.
- "Other" is not a question: it is the way out, and it is always last.
- Name the person being asked the way they are named everywhere else, never by the handle the agent wrote ([Writing](../authoring/writing.md)).
- Sentence case, no trailing full stop in a title or a button label, no noun repeated from the message around it.

## Built from

Both shapes are the message's own parts, not a new component: an [MessageActionCard](../../packages/ui/src/components/message-action-card/message-action-card.md) in a message, its answer control a [ChoiceList](../../packages/ui/src/components/choice-list/choice-list.md) for B and a row of `default` [Button](../../packages/ui/src/components/button/button.md) for C. An answered, expired or withdrawn question is the same card with its controls taken away and the line above in their place.
