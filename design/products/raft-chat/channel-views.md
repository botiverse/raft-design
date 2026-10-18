---
title: Raft Chat — Channel views
summary: The four versions of switching between a channel's chat, tasks and files, what each is for, and how version D works on narrow screens and phones.
---

# Raft Chat — Channel views

A channel holds three kinds of content: chat, tasks and files. Four versions of switching between them are drawn, and the choice is [still open](../../decisions/open-questions.md). A, B and C show one kind at a time; D keeps tasks and chat on screen together.

## Structure

| Version | Structure | Suits | Gains | Costs |
| --- | --- | --- | --- | --- |
| A: sticker tabs (default) | A row of tabs under the panel header; the selected tab is a yellow sticker. The three kinds take turns filling the main area | All three kinds matter equally | The same "you are here" as the sidebar and segmented controls; the current view is obvious | An extra row; tasks and chat can't be seen together |
| B: underline tabs | The same row, text only; the selected tab is ink text with a 2px ink line (the current product) | Less color in the tabs | Matches the product; less color | The selection is less obvious than A |
| C: segmented control in the top bar | A segmented control at the right of the panel header, before the overflow button | Short screens, where chat needs every row | Saves a row: 44px more for the main area | A crowded header. Falls back to A when the channel name is long or a phone has no room |
| D: tasks in the side panel | Chat stays in the main area. Tasks (with a count) and Files at the right of the panel header are toggle buttons; the open one is a yellow sticker and stays on the right (380px) beside the chat | Chatting while watching tasks | Tasks can be watched and dragged without leaving the chat | A narrower main area; one panel at a time |

```example
tabs/compositions/placement
```

```example
conversation-panel/compositions/conversation-panel-header
```

## Rules

- Use one version for every channel. Don't mix versions in the product.
- Write counts (Tasks 5) in Space Mono after the word, the same way in every version.
- In version D, make Tasks and Files header buttons with `aria-pressed`: the open one is a yellow sticker, and pressing it again closes the panel. The Tasks side panel's header is Tasks, with "5 open" as its subtitle, a small Create Task button and ×.
- Keep threads out of these views: a thread is always in the side panel, or a pushed page on a phone ([Channel](./channel.md#threads)).

### Version D on narrow screens and phones

- Show one side panel at a time: tasks, files, the thread and profiles replace each other.
- When the desktop main area is narrower than 680px, let the side panel cover the chat; × closes it and returns to the chat.
- On a phone there is no side panel. Put a Tasks icon button and the overflow button at the right of the channel's top bar; files are in the channel details that the overflow button opens, so the top bar has at most two icon buttons.
- Selecting Tasks pushes the channel's task page, titled Tasks, with the channel name and the number of open tasks as its subtitle and + at the top right to create one. Back returns to the chat.
