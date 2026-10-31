---
title: Designing a new feature
summary: The questions to ask before you build something new, the process from the closest pattern to the components, a self-review checklist, and when to change the system itself.
order: 3
---

# Designing a new feature

Start every new screen, panel or flow from what the system already has: answer six questions, find the closest pattern, compose it from raft-ui components, and decide which part belongs to one product and which to every product. Check the result against the list at the end of this page. Change the system itself only when the work shows that a rule is missing or wrong, and then change the guideline in the same pull request.

## The questions to ask

Answer these before you draw or write anything. Each answer decides something specific.

1. **Does every product need this, or only one?** Something every product needs follows the [patterns](../patterns/) and, if it is new, becomes one. Something only one product needs goes on that product's page under [Products](../products/). Either way, look first at how the product already does it: the shipped product is the reference for structure.
2. **Is it content, a region or a control?** That decides its surface and its line: content sits on paper and is divided by hairlines; a region is separated from its neighbors by one seam; a control has an ink border ([Principles](./principles.md#2-three-lines-three-meanings)).
3. **Which is the screen's primary action?** Only that one is pink, and a screen may have none. If more than one action could be the primary one, the hierarchy is wrong: decide which action the screen exists for ([Button](../../packages/ui/src/components/button/button.md)).
4. **What does each color mean?** Every color is an identity, a status, a signal (you, to do, this item) or a consequence (interrupts, irreversible). If a color is none of these, remove it ([Color](../foundations/color.md#meanings-of-color)).
5. **Does it work in dark mode, at 320px wide, and with the keyboard alone?** Design for 390px and make everything fit at 320px ([Responsive layout](../patterns/responsive.md)). Every element people can reach with the keyboard shows the focus ring ([Elevation](../foundations/elevation.md#focus-ring)). Every new component is checked in both modes ([Dark mode](../foundations/dark-mode.md)).
6. **Will it tire someone who looks at it for hours?** If so, remove color first, then lines, then motion. Nothing that shows status may loop or blink ([Motion](../foundations/motion.md)).

## The process

### 1. Find the closest pattern

Most new work is a variation of something the system already describes. Before designing anything, find it:

| You are building | Start from |
| --- | --- |
| A new screen, panel or destination | [Page structure](../patterns/page-structure.md), [Navigation](../patterns/navigation.md) and [Responsive layout](../patterns/responsive.md) |
| Anything an agent does or shows | [Agents](../people-and-agents/README.md) and [People and agents](../people-and-agents/README.md) |
| Messages, threads, the composer | [Conversation](../patterns/conversation.md) |
| Tasks and their statuses | [Tasks](../patterns/tasks.md) |
| A form or a settings page | [Forms](../patterns/forms.md) |
| A result, an error, a loading or empty state | [Feedback](../patterns/feedback.md) |
| Something built from several existing parts | [Composites](../components/overview.md) |

Then read the product's own page for the area you are working in (for Raft Chat, [Raft Chat](../products/raft-chat/README.md)) to see what it already puts there.

### 2. Choose the components

Compose the feature from raft-ui. The [components overview](../components/overview.md) lists what exists, and [Choosing a component](../components/overview.md) picks one where several look right: which control for which choice, which feedback for which message, which overlay for which job.

- Use the raft-ui component wherever one fits, including for small pieces such as badges, chips, separators and fields. A hand-built copy drifts from the original the first time either changes.
- Read the component's doc before using it: its "When to use" table, its rules and its accessibility section.
- If nothing fits, check [Composites](../components/overview.md) for a combination of existing parts. Build markup by hand only where raft-ui has no fit, say so in the pull request, and propose the missing piece to raft-ui instead of keeping a local copy.
- Use semantic tokens for every value. Don't use Tailwind's default palette or raw colors.

How to install and set up raft-ui is in [Use raft-ui](../about/use-raft-ui.md).

### 3. Decide what is shared and what is product-specific

Write each new rule where it belongs, so that the next product inherits what it should and nothing more:

| If the rule is about | It goes in |
| --- | --- |
| A value or a rule every component follows | A foundation |
| One component | That component's doc |
| How components combine, in any product | A pattern |
| One product's destinations, screens and what goes where | That product's page |

A rule that holds only for Raft Chat ("which four destinations the phone tab bar shows") is a product rule. A rule that would be the same in Tasks or Calendar ("a problem in one panel is a notice under its header") is shared. When in doubt, ask whether a second product would have to make the same choice for the same reason; if it would, the rule is shared.

### 4. Write the words

Labels, titles, empty states and errors follow [Writing](../content/writing.md): Title Case for what people click, sentence case for everything else, agents named with teammate verbs, and a button's label repeated as the title of the dialog it opens.

## Self-review checklist

Go through this list before you ask for review. Each item is something a reviewer will check.

- [ ] Yellow is only on the frame and on things that mean "you": the selected item in navigation, an on switch, a mention of you, search hits.
- [ ] At most one pink button on the screen, for the action the screen exists for.
- [ ] Every color on screen is an identity, a status, a signal or a consequence. Red appears only for what cannot be undone.
- [ ] Each line is a hairline inside content, a seam between regions or an ink border on a control, and two regions share exactly one line.
- [ ] Every block of brand color has an ink edge and ink type; soft tints have no edge; no control or card has a shadow.
- [ ] Identities and dots are square; only switches and radios are round.
- [ ] No text is in all caps. Clickable text is Title Case; IDs, times, counts and event lines are in Space Mono.
- [ ] Nothing that shows status loops or blinks, and every animation stops with `prefers-reduced-motion`.
- [ ] Agents and people use the same rows, messages and avatars, and what an agent is doing is shown where it already appears.
- [ ] The screen works in dark mode, with stickers unchanged and their die-cut edge.
- [ ] Everything fits at 320px wide, and touch targets are at least 44px.
- [ ] Everything works with the keyboard alone and shows the focus ring. Anything clickable is a `<button>` or an `<a>` with an `href`, and every icon-only button has an `aria-label`.
- [ ] Every piece that raft-ui has comes from raft-ui; anything hand-built is named in the pull request.
- [ ] Which existing screen does this behave like? It opens, selects and closes the same way ([Principles](./principles.md#8-familiar-over-new-the-same-job-the-same-form-a-different-meaning-a-different-form)).
- [ ] Every form reused here (a color, a light, an icon) means here what it means everywhere else; a new meaning has a form of its own.
- [ ] Am I adding a component or pattern the system doesn't have? Then its rule, saying why the existing ones don't fit, comes first ([Principles](./principles.md#9-existing-parts-and-patterns-first)).
- [ ] Every value is a semantic token.
- [ ] Every new rule is written in the foundation, pattern, component doc or product page where it belongs.

## Changing the system

The system is meant to change when new work shows that a rule is missing or wrong. Change it in the open, in the same pull request as the work:

- **Update the guideline in the same pull request.** A change to how something looks or behaves updates the rule it follows, in code and docs together. Where the system has no rule for what you build, write one where it belongs (see [step 3](#3-decide-what-is-shared-and-what-is-product-specific)). When raft-ui and a guideline disagree, fix one of them; never leave them apart.
- **Add a decision record only for a major, cross-cutting choice**: one that changes a principle, a material or the meaning of a color, applies across products, or overrides an earlier record. Mark an overridden record `superseded`. Smaller changes update the guideline and need no record. The template is in [Authoring](../authoring/templates/decision.md).
- **Record a choice you can't make yet** in [Open questions](../decisions/open-questions.md), with the default to use until it is made.

How the docs are organized and written is in [Authoring](../authoring/README.md); what a pull request needs is in [CONTRIBUTING.md](../../CONTRIBUTING.md).

## Related

- [Principles](./principles.md): the rules the questions and the checklist come from.
- [Why Raft looks this way](./why-raft-looks-this-way.md): the reasoning behind them.
- [Choosing a component](../components/overview.md): one component per situation.
- [Decisions](../decisions/): the major choices already made, and the alternatives they were weighed against.
