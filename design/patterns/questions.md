---
title: Questions
summary: How an agent asks a person a question in a conversation — answered where the message is when the question is short, in a card when it isn't — and how an answered, expired or withdrawn question reads.
---

# Questions

An agent often needs one answer before it can go on: which branch to merge, whether to include the screenshots, which of three names to use. It asks in the channel the work is happening in, and the question is a message, not a dialog: the person may answer now or an hour from now, and everyone else in the channel can see that the agent is waiting.

Two shapes carry a question, and the card's own data picks between them: the form's `placement`, how many questions there are, whether each is a choice, how many options it has and how long their labels are. Every client computes the same answer from the same numbers, so one card is drawn one way everywhere. A client reads those values; it never measures anything it rendered to decide a shape, because a narrow window would then change what a question is.

## When it applies

A question an agent asks through `question:ask` and the person answers in Raft. It doesn't cover a dialog a person opens (that is [Dialog](../../packages/ui/src/components/dialog/dialog.md)) or a message where only the reply matters (that is [Conversation](./conversation.md)).

## The two shapes

**C · One row of buttons.** Only when the card carries one question, it is a single choice, the server marked it `placement: "inline"`, it has no `pages`, it has at most 4 options, and no option label is wider than 32 columns, where a CJK or full-width character counts as 2 (not counting Other). These are the server's own inline limits (`questionAskPlacement`), so C never draws a question the server would have put in a sheet. A question that short is a decision the person can make without reading anything else, so it stays in the message: the question as the message's last line, in bold, then one `default` button per option and Other at the end.

- Button labels never end in "…". Other is the whole word, and pressing it expands an input in place, under the row. Other is answered from a `default` Send button at the input's end, and from Enter. While its input is open the option buttons stay pressable: pressing one answers with that option and closes the input.
- Under the row, one line of `foreground-hint`: "Fixer is waiting for your answer · 7 days left". Someone who isn't the person asked sees the buttons disabled and "Waiting for Maya to answer".
- Answered, the row is replaced by one line: a `read-mark` check, then "Maya answered **Fix all 4 on a branch**", the answer in bold. Nothing is left to press.

**A confirm.** A question with one option asks the person to confirm one thing, not to choose: "Deploy to production?" with one option, "Deploy". It is not a list of one row. It is one bordered button with the option's label (`outline`, `md`, as the card's own submit), and it offers no Other: a way out of one option is not answering, which the person can already do by leaving it. In a card with other questions it is a choice like any other: pressing it chooses it, and until the card is sent it shows as pressed, a check before the label (pressed again, an optional one is taken back). When it is the card's only question it sits in the card's actions row and pressing it sends the answer. Either way, once the answer is sent the question is replaced like any other, "Maya answered **Deploy**", and no button is left ([Rules](#rules)). An agent asks for it with one option (`raft action prepare --help` has the example); `other` is refused on it (#proj-apps:#65, slock #14497).

**B · The card.** Everything else: more than one question, a written answer, more than one choice per question, or a question long enough that answering it means reading the card. The card holds the questions and the answer control.

- No head icon, and no "Answer question(s)" line: the card is the question. With one question the title is that question; with several it is "Fixer has 3 questions".
- Under the title, one description line: "Fixer is asking you · 7 days left"; for someone else, "Waiting for Maya · 7 days left".
- The options sit directly in the card, not inside a box of their own, and no question gets an asterisk: a question that may be left unanswered says "(optional)", as an optional field does ([Forms](./forms.md#fields)).
- "Choose an option first." appears only after the person presses submit without choosing. It is a correction, not an instruction: showing it before anyone has tried turns a question into a form that opens in a warning.

## Rules

- **Decide the shape from the card's data, once.** Use C exactly under the conditions above and B otherwise: the form's `placement`, the question count, the kinds, the option count and the label lengths are all in the card, so every client reaches the same answer without measuring the screen it happens to have. Counting a label's columns is reading data; measuring a rendered width is not. A card that has been answered, has expired or was withdrawn no longer carries its form (the server drops it), so there is no `placement` to read: run the server's placement on the stored question (`questionAskPlacement`, which reads its `pages` and label widths too) and apply the remaining C conditions to it, so its shape stays the one it was asked in. Don't write a second copy of the placement rule in a client: a copy that counts characters instead of columns, or forgets `pages`, draws an answered card as C that was asked as B.
- **Who is being asked changes what can be pressed, never which shape is used.** The person asked can answer; everyone else sees the same question and the same choices, disabled, with the line saying who is waited on. Nobody in the channel should be left wondering whether a question is for them.
- **Say how much time is left, in one unit.** From the card's `expiresAt`: "N days left" past a day, "N hours left" under it, "Less than an hour left" under the hour. Past the expiry the card takes its ended form (below).
- **Answer in one place.** The card or the row is the question; nothing else restates its options. Two copies drift apart the moment one is answered.
- **Answering replaces the question.** Don't leave the options under the answer, greyed: an answered question is a record of what was decided, and a row of dead buttons invites a press that does nothing.

## When it ends unanswered

A question can end without an answer, and the card says which happened, in one line where the question was: expired ("Mei didn't answer within 3 days. Scout was told.") or withdrawn ("Scout withdrew these questions."). Both name the agent that asked and, for an expired card, the person who didn't answer, so the channel reads what happened without opening anything. Don't draw buttons on an ended card.

## Words

- The question is the agent's own words, in the agent's voice. The frame's words around it ("is asking you", "Waiting for", "answered", "didn't answer within") are Raft's, and they're the same whatever the question.
- "Other" is not a question: it is the way out, and it is always last. A confirm has none.
- Name the person being asked the way they are named everywhere else, never by the handle the agent wrote ([Writing](../content/writing.md)).
- Sentence case, no trailing full stop in a title or a button label, no noun repeated from the message around it.

## Built from

Both shapes are the message's own parts, not a new component: a [MessageActionCard](../../packages/ui/src/components/message-action-card/message-action-card.md) in a message, its answer control a [ChoiceList](../../packages/ui/src/components/choice-list/choice-list.md) for B and a row of `default` [Button](../../packages/ui/src/components/button/button.md) for C. An answered, expired or withdrawn question is the same card with its controls taken away and the line above in their place.
