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

Use one term per concept, everywhere. These are the system's terms.

### Surfaces and lines

| Term | Meaning |
| --- | --- |
| frame | The outer, brand-colored chrome: the desktop rail, the web top bar, the top bar of a phone's top-level pages. Yellow in light mode, neutral in dark mode. |
| sidebar | The desktop column next to the rail that lists what the selected destination contains. |
| paper | The background content sits on. |
| ink | The color of text and control borders. |
| sticker | A block of brand color with an ink edge and ink type: avatars, selection, the primary button, badges. |
| die-cut edge | The outline added around stickers in dark mode. |
| soft tint | A pale, borderless highlight color (`*-soft` tokens). |
| hairline | The thin line inside content: list dividers, card outlines. |
| seam | The line between regions: rail and sidebar, a header and its content, the edge of a menu. |
| ink border | The 1.5px border that marks something as a control. |
| pressed overlay | The translucent layer laid over a control on hover and press. |

### Structure

| Term | Meaning |
| --- | --- |
| destination | A top-level place in a product (Home, Tasks, Members, Settings). |
| top-level page | The page a destination opens on a phone; it shows the tab bar. |
| pushed page | A page opened from another page; it covers the tab bar and has a Back button. |
| rail | The leftmost desktop column of destinations. |
| tab bar | The phone's bottom row of destinations. |
| top bar | The bar at the top of a phone page. |
| panel | A column of the desktop main area, with a panel header. |
| side panel | A panel opened beside the conversation (thread, task, files, profile). |
| inset group | A rounded card holding a group of rows. |
| bottom sheet | A sheet that rises from the bottom of a phone screen. |

### Signals and status

| Term | Meaning |
| --- | --- |
| attention dot | The single pink pixel that marks something waiting for the person. |
| unread count | The pink number badge. |
| mention marker | The yellow @ marker that replaces the count when someone mentions the person. |
| presence light | The square light on an avatar: online, busy, error, offline, external. |
| status chip | A soft-tinted chip with a pixel and a word: a task status or an agent state. |
| runtime chip | The chip that names where an agent runs (Claude Code, Codex). |
| event line | A line in a conversation that records an action ("Bugen claimed #25"). |
| evidence strip | The strip on an agent's message that links its proof (CI, commit, snapshot). |
| reference chip | An inline chip that links to a place or an item. |
| location tile | The yellow block beside the title of the place the person is in. |
| workspace pill | The phone's workspace switcher at the top of Home. |
| pixel avatar | An agent's 8×8 pixel face. |
| pixel spinner | The loading indicator made of pixels. |
| working | An agent that is currently doing a task. "Working now" lists them. |
| avatar stack | The overlapping avatars that summarize who is working. |

### Meanings of color

| Term | Color | Meaning |
| --- | --- | --- |
| you | yellow | Where you are, what you selected, what calls you, what you searched for |
| to do | pink | The one primary action, and what waits for you |
| this item | cyan | The item singled out in content, information |
| interrupts | orange | Actions that stop or reset but can be undone, warnings, errors |
| irreversible | red | Actions that cannot be undone |

Component names follow the code (`Drawer`, not "Sheet"). A design name that people still search for goes into the component's `aliases`.
