---
title: Writing guide
summary: How to write the Raft Design System docs — voice, rules, structure, terms and Markdown conventions.
---

# Writing guide

This guide covers the documentation: guidelines, component docs and decision records. The words inside the product (button labels, empty states, errors) follow [Writing](../foundations/writing.md) in the foundations instead.

## Voice

Describe the system plainly. A reader comes to find out what to use and why, not to be persuaded.

- State facts. Prefer a value, a rule or an example to an adjective.
- Don't sell. Leave out "powerful", "beautiful", "delightful", "bold", "seamless" and "best-in-class", and don't address the reader as a prospective adopter.
- Don't soften or inflate. Leave out "simply", "just", "easily", "obviously", "very" and "really".
- Write in the present tense, about how the system works now. History belongs in a decision record.
- Use "you" for the reader who builds with the system. In a rule about the product, the person using the product is "people" or "the person".

| Write | Not |
| --- | --- |
| A drawer slides in from the right and leaves the page in place behind it. | Our elegant drawer lets you seamlessly reveal details. |
| One pink button per screen, for the action the screen exists for. | Use pink sparingly to make your primary action pop! |
| Toasts disappear after a few seconds, so never put anything in one that people must not miss. | Toasts are a great way to keep users informed. |

## Rules

Most of these docs are rules. A rule is something a reviewer can check.

- **Write one rule per bullet**, as an imperative: "Use…", "Put…", "Don't…".
- **Give the reason in the same bullet** when it isn't obvious, after a colon or "because". A rule without a reason gets broken the first time it is inconvenient.
- **Make it checkable.** "Keep it short" is not a rule; "One line, at most 60 characters" is.
- **Put each exception next to its rule**, not in a later section.
- **Say "never" and "only" when you mean them**, and nowhere else.
- **Don't repeat global rules in a component doc.** Link to the foundation or pattern that owns the rule. A rule stated in two places drifts.

## Page structure

- **Lead with the answer.** The paragraph under the title says what the thing is and when to use it. Someone who reads only that paragraph should choose correctly.
- **Use a table for any choice between options**: situation on the left, what to use on the right.
- **Follow the template** for the page type ([templates](./templates/)). Readers and agents rely on finding the same sections in the same order.
- **Make each page stand alone.** Don't write "as above" or "see the previous page" without a link. Don't rely on an image or an example to carry a rule; state the rule in words.
- **Keep component docs short.** A component doc over about 150 lines is usually two things; move the shared part into a pattern.

## Headings and formatting

- Headings use sentence case: "When to use", "Dark mode". (Labels inside the product use Title Case; see [Writing](../foundations/writing.md).)
- Use plain text for component names: Drawer, Button.
- Use code font for anything typed in code: props and values (`variant="ghost"`), parts (`DialogFooter`), tokens (`layer-canvas`), CSS and file names.
- Give sizes in pixels with the unit (44px). Give colors as tokens; only the foundations' token tables show raw values.
- Write numbers as numerals: 3 items, 44px, 2 rules.
- Use US English, the serial comma, and straight quotes in code.
- Don't use emoji or decorative symbols in docs.

## Examples and sample content

- Use Raft's own world in examples: workspaces, channels, people, agents, tasks.
- Use the recurring cast, so examples read as one product:
  - **Martin**: a person;
  - **Bugen** and **Wug**: agents;
  - **#launch-week**: a channel;
  - **#25**: a task.
- In examples, the product's labels follow its rules: Title Case on buttons, the five task statuses spelled Todo, In Progress, In Review, Done and Closed.

## Accessibility

Every interactive component doc has an "Accessibility" section that states:

- the semantics,
- the keyboard behavior,
- how the accessible name is provided,
- anything the caller must add, such as `aria-label` on an icon-only button.

Don't restate what the underlying Base UI primitive already guarantees. Name it, and say only what raft-ui adds or requires.

## Terms

Use one term per concept, everywhere. These are the system's terms. Some of the Chinese source names come from the current guidelines and stop being used once they are migrated.

### Surfaces and lines

| Term | Meaning | Chinese source |
| --- | --- | --- |
| frame | The outer, brand-colored chrome: the desktop rail, the web top bar, the top bar of a phone's top-level pages. Yellow in light mode, neutral in dark mode. | 外框 |
| sidebar | The desktop column next to the rail that lists what the selected destination contains. | 侧栏 |
| paper | The background content sits on. | 纸 |
| ink | The color of text and control borders. | 墨 |
| sticker | A block of brand color with an ink edge and ink type: avatars, selection, the primary button, badges. | 贴纸 |
| die-cut edge | The outline added around stickers in dark mode. | 模切边 |
| soft tint | A pale, borderless highlight color (`*-soft` tokens). | 浅底 |
| hairline | The thin line inside content: list dividers, card outlines. | 发丝线 |
| seam | The line between regions: rail and sidebar, a header and its content, the edge of a menu. | 分区线 |
| ink border | The 1.5px border that marks something as a control. | 墨线 |
| pressed overlay | The translucent layer laid over a control on hover and press. | 叠一层 |

### Structure

| Term | Meaning | Chinese source |
| --- | --- | --- |
| destination | A top-level place in a product (Home, Tasks, Members, Settings). | 一级入口 |
| top-level page | The page a destination opens on a phone; it shows the tab bar. | 一级页 |
| pushed page | A page opened from another page; it covers the tab bar and has a Back button. | 二级页、push 进去的页面 |
| rail | The leftmost desktop column of destinations. | Rail |
| tab bar | The phone's bottom row of destinations. | Tab 栏 |
| top bar | The bar at the top of a phone page. | 顶栏 |
| panel | A column of the desktop main area, with a panel header. | 面板 |
| side panel | A panel opened beside the conversation (thread, task, files, profile). | 右边一栏 |
| inset group | A rounded card holding a group of rows. | 分组卡片 |
| bottom sheet | A sheet that rises from the bottom of a phone screen. | 底部弹层、底部列表 |

### Signals and status

| Term | Meaning | Chinese source |
| --- | --- | --- |
| attention dot | The single pink pixel that marks something waiting for the person. | 提醒点 |
| unread count | The pink number badge. | 未读数 |
| mention marker | The yellow @ marker that replaces the count when someone mentions the person. | @ 标记 |
| presence light | The square light on an avatar: online, busy, error, offline, external. | 状态灯 |
| status chip | A soft-tinted chip with a pixel and a word: a task status or an agent state. | 状态签 |
| runtime chip | The chip that names where an agent runs (Claude Code, Codex). | 运行时签 |
| event line | A line in a conversation that records an action ("Bugen claimed #25"). | 事件行 |
| evidence strip | The strip on an agent's message that links its proof (CI, commit, snapshot). | 证据条 |
| reference chip | An inline chip that links to a place or an item. | 引用 chip |
| location tile | The yellow block beside the title of the place the person is in. | 位置块 |
| workspace pill | The phone's workspace switcher at the top of Home. | 工作区胶囊 |
| pixel avatar | An agent's 8×8 pixel face. | 像素形象 |
| pixel spinner | The loading indicator made of pixels. | 像素转圈 |
| working | An agent that is currently doing a task. "Working now" lists them. | 正在干活 |
| avatar stack | The overlapping avatars that summarize who is working. | 一叠头像 |

### Meanings of color

| Term | Color | Meaning | Chinese source |
| --- | --- | --- | --- |
| you | yellow | Where you are, what you selected, what calls you, what you searched for | 你 |
| to do | pink | The one primary action, and what waits for you | 去做 |
| this item | cyan | The item singled out in content, information | 这一项 |
| interrupts | orange | Actions that stop or reset but can be undone, warnings, errors | 会打断 |
| irreversible | red | Actions that cannot be undone | 收不回 |

Component names follow the code (`Drawer`, not "Sheet"). A design name that people still search for goes into the component's `aliases`.
