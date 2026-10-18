---
title: Migration map
summary: How the current Chinese guidelines move into the English structure, which names they take, and which token names the docs use.
---

# Migration map

The current guidelines are in Chinese, in `design/*.md` and `design/components/<Name>/`. This map says where each part goes in the [new structure](./README.md#where-things-live), which component and token names the English docs use, and in what order the work lands. Delete this file once the migration is done.

## Order

1. **Authoring guide.** This folder, including this map.
2. **Token names.** Rename and merge the tokens as in the [token map](#tokens), with deprecated aliases kept until the next major version, and add the single source `tokens/tokens.json`. The English docs name tokens by their new names, so this lands before them.
3. **Content.** Rewrite the pages and component docs in English, one pull request per area: foundations, patterns, components by category, Raft Chat, decisions. This starts after the open pull requests that change `design/` (#469, #470, #471) are merged.
4. **Old files.** Remove `design/1-foundations.md` … `4-decisions.md`, `design/components/`, `tokens.css`, `tokens.json` and `bundle.css` once nothing links to them. A screen's `preview.html` goes when its page has a composition to show instead.

Every rule in the Chinese pages ends up in exactly one English page or in a decision record. Translate the meaning, not the sentence. Where the Chinese explains with an example, keep the rule and turn the example into an `example` block or a short table.

## Pages

| Current | New | Notes |
| --- | --- | --- |
| `README.md`: intro, three materials, seven rules, six questions | `README.md` | The component index and file table are generated, so they are not copied |
| `README.md`: how to use (`rf-` classes, previews) | — | Dropped with `bundle.css` |
| `1-foundations.md` › 颜色 | `foundations/color.md` | Includes the meanings of color and contrast |
| › 字 | `foundations/typography.md` | |
| › 间距和尺寸 | `foundations/spacing.md` | Spacing, hit targets, control heights, layout widths |
| › 对齐 | `foundations/alignment.md` | |
| › 形状 | `foundations/shape.md` | Radii and the two stroke widths |
| › 层级和阴影 | `foundations/elevation.md` | Shadows, popups, focus ring |
| › 动效 | `foundations/motion.md` | |
| › 交互状态 | `foundations/states.md` | |
| › 图标 | `foundations/iconography.md` | The `rf-i` icon list is dropped; icons come from lucide-react |
| › 表情回应, › Logo | `foundations/brand.md` | Together with "how much brand" from the patterns |
| › 文案 | `foundations/writing.md` | Words in the product, not the docs |
| `2-components.md` › 有什么 | — | Generated from component front matter |
| › 选哪个 | `patterns/choosing-components.md` | |
| › 没有单独做的 | `patterns/composites.md` | Built from existing parts |
| `3-patterns.md` › 页面骨架 | `patterns/page-structure.md` | |
| › 导航 | `patterns/navigation.md` | |
| › agent | `patterns/agents.md` | Includes "working" and the AgentActivity rules |
| › 任务 | `patterns/tasks.md` | |
| › 对话 | `patterns/conversation.md` | |
| › 表单和设置 | `patterns/forms.md` | |
| › 反馈 | `patterns/feedback.md` | |
| › 暗色模式 | `foundations/dark-mode.md` | |
| › 品牌元素用多少 | `foundations/brand.md` | |
| › 宽和窄 | `patterns/responsive.md` | |
| `3b-raft-chat.md` | `products/raft-chat/README.md` | Split by area if it outgrows one page |
| `4-decisions.md` › 还没定的 | `decisions/open-questions.md` | |
| › each row of 和产品代码有意不同的地方 | `decisions/NNNN-*.md` | One record per row, numbered in table order |
| `archived/` | — | Kept in git history; any reasoning that still holds becomes a decision record |

## Components

Each DS component card moves into the doc of the code component that implements it. Its former name becomes an alias. A card that covers several code components is split, and each part goes to the component it describes.

| DS card | Component doc(s) | Alias | Notes |
| --- | --- | --- | --- |
| Button | `button` | — | |
| IconButton | `button` | IconButton | A section of the Button doc: the icon sizes |
| TextField | `input`, `field`, `input-group`, `textarea` | TextField on `input` | Label, help and error rules go in `field` |
| Select | `select`, `combobox`, `combobox-select` | — | Filters go in `patterns/choosing-components.md` |
| Checkbox | `checkbox` | — | |
| Radio | `radio-group` | Radio | |
| Switch | `switch` | — | |
| Composer | `composer` | — | |
| NavBar | `panel` (`PanelHeader`) | NavBar | Raft Chat variants go in `products/raft-chat` |
| TabBar | `mobile-nav` | TabBar | |
| Rail | `app-rail` | Rail | |
| Sidebar | `sidebar` | — | |
| Panel | `panel`, `conversation-panel`, `thread-panel` | — | |
| SegmentedControl | `segmented-control` | — | |
| Tabs | `tabs` | — | |
| Steps | `steps` | — | |
| Avatar | `avatar` | — | |
| ChannelIcon | `icon-tile` | ChannelIcon | `IconTile` arrives with #470 |
| Badge | `badge` | — | |
| StatusChip | `status`, `tasks` (`TaskChip`, `TaskStatusBadge`) | StatusChip on `status` | |
| Message | `message-item`, `system-message`, `message-replies` | — | |
| ListRow | `list-row` | — | `ListRow` arrives with #469 |
| TaskCard | `task-card`, `task-board`, `task-list` | — | |
| Attachment | `message-attachment`, `file-preview` | Attachment on `message-attachment` | |
| Code | `inline-code`, `copyable-code`, `code-block` | — | |
| PropertyList | `description-list` | PropertyList | |
| Timeline | `timeline` | — | |
| Search | `search` | — | |
| Inbox | `inbox-item`, `activity-inbox`, `notification-center` | Inbox on `inbox-item` | |
| AgentActivity | `patterns/agents.md` | — | Not a component; the DS rejects the live activity bar |
| ActionCard | `message-action-card` | ActionCard | |
| Menu | `dropdown-menu`, `context-menu` | Menu on `dropdown-menu` | |
| Dialog | `dialog`, `alert-dialog`, `form-section` | — | The wide form dialog uses `form-section` |
| Sheet | `drawer` | Sheet, BottomSheet | |
| Popover | `popover`, `preview-card` | — | |
| Tooltip | `tooltip` | — | |
| Banner | `banner`, `panel` (`PanelNotice`) | — | |
| Toast | `toast` | — | |
| Loading | `skeleton`, `spinner`, `progress` | Loading on `spinner` | The choice between them goes in `patterns/feedback.md` |
| EmptyState | `empty-state` | — | |
| ScreenHome, ScreenChannel, ScreenChannelViews, ScreenTasks, ScreenAgent, ScreenSettings, ScreenOnboarding, ScreenDesktop | `products/raft-chat/*.md` | — | One page per screen; compositions replace `preview.html` |
| Cover | — | — | The site's home page replaces it |

These components have no DS card yet. Each gets a doc written from its code and compositions, unless the clean-up of unused components removes it first:

- **With guidance in `patterns/composites.md`:** `lightbox`, `message-embed`, `message-forwarded-bundle`, `message-quoted-preview`, `message-translation`, `resizable`, `table`, `toggle-group`.
- **Without guidance yet:** `announcement-dialog`, `app-shell`, `card`, `files`, `float-button`, `icons`, `kbd`, `label`, `logo`, `markdown`, `message-list`, `picker-trigger-button`, `profile-panel`, `scroll-area`, `separator`, `text`.
- **Candidates for removal:** `legacy-task-panel` and `task-dnd`, which no consumer uses; `live-agent-activity-bar`, whose pattern the DS rejects.

## Tokens

The English docs use the names in the **Token** column. Most keep the code's role-first naming (`layer-*`, `foreground-*`, `line-*`, `fill-*`). A token is renamed or merged in three cases: two names hold the same value, a name contradicts the guidelines, or a name is left over from the removed theme families. Each renamed token keeps its old name as a deprecated alias until the next major version.

### Surfaces

| Concept | Token | Current code token | Change |
| --- | --- | --- | --- |
| frame | `layer-frame` | `layer-frame` | — |
| frame, selected item | `layer-frame-active` | `layer-frame-active` | — |
| sidebar | `layer-sidebar` | `layer-canvas-muted` | Rename: "canvas-muted" doesn't say where it is used |
| paper | `layer-canvas` | `layer-canvas`, `layer-panel` | Merge: same value in both modes |
| surface (cards, inputs, inset groups) | `layer-card` | `layer-card` | — |
| popover | `layer-popover` | `layer-popover` | — |
| sunken fill | `fill-muted` | `fill-muted`, `layer-inset` | Merge: same value |
| code block | `layer-code` | `layer-code` | — |
| HUD (toast, tooltip) | `layer-hud` | `layer-hud` | — |
| scrim | `layer-backdrop` | `layer-backdrop` | — |

### Text and icons

| Concept | Token | Current code token | Change |
| --- | --- | --- | --- |
| ink | `foreground` | `foreground`, `foreground-strong` | Merge: same value in both modes |
| secondary text | `foreground-muted` | `foreground-muted`, `foreground-icon` | Merge: same value |
| tertiary text, placeholder | `foreground-hint` | `foreground-hint`, `foreground-placeholder` | Merge: same value |
| disabled | `foreground-disabled` | `foreground-disabled` | — |
| on the frame | `foreground-on-frame`, `-muted`, `-active` | same | — |
| on the HUD | `foreground-on-hud`, `foreground-on-hud-muted` | `layer-hud-foreground` | Rename into the foreground group, and add the muted step the guidelines use |
| link | `foreground-link` | `foreground-link` | — |
| error text | `danger-strong` | `danger-strong` | — |

### Lines

| Concept | Token | Current code token | Change |
| --- | --- | --- | --- |
| hairline (15% ink) | `line-hairline` | `line-muted`, `line-hairline` | Merge into the explicit name |
| seam (45% ink) | `line-seam` | `line`, `line-seam` | Merge. A bare `line` is the seam in code but the hairline in the guidelines, so the bare name goes |
| ink border | `line-strong` | `line-strong` | — |

`line` and `line-muted` are used widely in slock (about 250 and 150 class names). The rename comes with a codemod.

### Color roles

| Concept | Token family | Current code family | Change |
| --- | --- | --- | --- |
| yellow: you, selection, the frame | `brand` | `primary` | Rename: `primary` is yellow while the primary button is pink, which misleads every reader |
| pink: to do, the primary action, unread | `attention` | `accent` | Rename to the meaning the guidelines give it |
| cyan: this item, information | `info` | `info` | — |
| lime: success, done | `success` | `success` | — |
| orange: interrupts, warning | `warning` | `warning` | — |
| red: irreversible | `danger` | `danger` | — |
| stone: closed, offline | `inactive` | `inactive` | — |
| task statuses | `task-status-*` | `task-status-*` | — |
| presence lights | `presence-*` | `presence-*` | — |
| stickers | `sticker-*` | `sticker-*` | — |
| pressed overlays | `fill-pressed`, `sticker-pressed`, `fill-frame-pressed` | same | — |

Each family keeps the steps components use (`*-soft`, `*-strong`, `*-hover`, `*-active`, `*-foreground`). The 50–950 ramps keep only the steps something uses.

### Palette, shadows and the rest

| Concept | Token | Current code token | Change |
| --- | --- | --- | --- |
| palette | `color-yellow-*`, `color-pink-*`, `color-cyan-*`, `color-lime-*`, `color-orange-*`, `color-red-*`, `color-lavender-*`, `color-stone-*`, `color-cream-*` | `color-brutal-*`, with `purple` for lavender | Drop the `brutal-` prefix, a theme name that no longer exists; use the guidelines' color names |
| floating shadow | `shadow-float` | `theme-shadow-float`, `theme-shadow-lg`, `theme-shadow-xl` | Merge: same value. Drop the `theme-` prefix |
| sticker shadow | `shadow-sticker` | `theme-shadow-sticker` | Drop the `theme-` prefix |
| no shadow | — | `theme-shadow-xs`, `-sm`, `-md` | Remove: all three are `none` |
| focus ring | `focus-ring` | `theme-focus-ring` | Drop the `theme-` prefix |
| radii | `radius-sticker`, `radius-chip`, `radius-control`, `radius-container`, `radius-dialog` | same | — (role names; the guidelines' `radius-xs`…`xl` are not used) |
| type scale | `text-hero` … `text-label`, `text-mono-meta`, `text-mono-code` | same | `text-label` is 11/13 in code and 10/12 in the guidelines; settle it in step 2 |
| spacing | Tailwind's 4px scale | same | — |
