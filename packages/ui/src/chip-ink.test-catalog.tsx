import type { ReactNode } from "react";
import {
  Bookmark,
  ChevronDown,
  CircleOff,
  FileText,
  Hash,
  Info,
  Link,
  MessagesSquare,
} from "lucide-react";
import { Badge } from "./components/badge";
import { Combobox, ComboboxChip, ComboboxChipRemove, ComboboxChips } from "./components/combobox";
import { ComboboxSelect } from "./components/combobox-select";
import { InlineCode } from "./components/inline-code/inline-code";
import {
  MessageItemBadge,
  MessageItemBadgeSeparator,
  MessageItemContent,
  MessageItemSavedIndicator,
  MessageReactionChip,
  MessageReactionCount,
  MessageReactionGlyph,
  MessageReferenceChip,
  MessageReferenceLabel,
  MessageReferencePending,
  MessageReferenceSuffix,
  MessageReferenceText,
  MessageReferenceUnavailable,
} from "./components/message-item";
import {
  MessageForwardedBundleAttachment,
  MessageForwardedBundleAttachmentMeta,
  MessageForwardedBundleAttachmentName,
} from "./components/message-forwarded-bundle";
import { MessageQuotedPreviewAttachment } from "./components/message-quoted-preview";
import { MessageListHistoryLimited } from "./components/message-list";
import { Spinner } from "./components/spinner";
import { Status } from "./components/status";
import { TaskCardStatus } from "./components/task-card";
import { TaskChip, TaskDoneIcon, TaskStatusBadge, TaskTodoIcon } from "./components/tasks";

// Every chip that draws a fill around a short run of ink (a reference in a
// message, a badge, a tag in a field), as it is written in the product. Shared
// by the chip-ink browser test and the before/after renders.

/** An app's own icon, drawn to the edge of its box (no inner whitespace). */
export function AppIcon() {
  return (
    <svg viewBox="0 0 16 16" aria-hidden data-app-icon="">
      <rect width="16" height="16" rx="3.5" fill="oklch(0.26 0.01 270)" />
      <path d="M5 4.5v7M5 8h6M11 4.5v7" stroke="white" strokeWidth="1.8" strokeLinecap="round" />
    </svg>
  );
}

export type ChipCase = {
  kind: string;
  caption: string;
  before: string;
  after: string;
  chip: ReactNode;
};

/** In a message, the chips sit in a sentence. */
export const MESSAGE_CHIPS: ChipCase[] = [
  {
    kind: "ref-message",
    caption: "Message link",
    before: "Pinned in",
    after: "yesterday.",
    chip: (
      <MessageReferenceChip variant="link" render={<a href="#m" />}>
        <Link />
        <MessageReferenceLabel>#proj-chat</MessageReferenceLabel>
        <MessageReferenceSuffix>msg</MessageReferenceSuffix>
      </MessageReferenceChip>
    ),
  },
  {
    kind: "ref-app",
    caption: "App link (mock)",
    before: "Merged",
    after: "this morning.",
    chip: (
      <MessageReferenceChip variant="link" render={<a href="#pr" />}>
        <AppIcon />
        <MessageReferenceLabel>raft-design#686 · Button sizes</MessageReferenceLabel>
      </MessageReferenceChip>
    ),
  },
  {
    kind: "ref-channel",
    caption: "Channel",
    before: "Posted in",
    after: "for everyone.",
    chip: (
      <MessageReferenceChip variant="accent" render={<a href="#c" />}>
        <Hash />
        <MessageReferenceLabel>release-notes</MessageReferenceLabel>
      </MessageReferenceChip>
    ),
  },
  {
    kind: "ref-thread",
    caption: "Thread",
    before: "Continued in",
    after: "after lunch.",
    chip: (
      <MessageReferenceChip variant="info" render={<a href="#t" />}>
        <MessagesSquare />
        <MessageReferenceLabel>#state-model:29a90e07</MessageReferenceLabel>
      </MessageReferenceChip>
    ),
  },
  {
    kind: "ref-text",
    caption: "Reference, no icon",
    before: "Ask in",
    after: "first.",
    chip: (
      <MessageReferenceChip variant="accent" render={<a href="#g" />}>
        #general
      </MessageReferenceChip>
    ),
  },
  {
    kind: "ref-pending",
    caption: "Loading reference",
    before: "Still resolving",
    after: "now.",
    chip: (
      <MessageReferencePending>
        <Spinner size="xs" />
        migration-notes
      </MessageReferencePending>
    ),
  },
  {
    kind: "ref-unavailable",
    caption: "Unavailable reference",
    before: "The earlier",
    after: "was removed.",
    chip: (
      <MessageReferenceUnavailable>
        <CircleOff />
        legacy-brief
      </MessageReferenceUnavailable>
    ),
  },
  {
    kind: "mention-self",
    caption: "Mention of you",
    before: "Thanks",
    after: "for the review.",
    chip: <MessageReferenceText variant="primary">@Ada</MessageReferenceText>,
  },
  {
    kind: "task-inline",
    caption: "Task in a message",
    before: "Please triage",
    after: "today.",
    chip: (
      <TaskChip variant="inline" status="todo" render={<a href="#21" />}>
        <TaskTodoIcon />
        <span>#21</span>
        <span>@Ada</span>
      </TaskChip>
    ),
  },
  {
    kind: "code",
    caption: "Inline code",
    before: "Then run",
    after: "again.",
    chip: <InlineCode appearance="message">pnpm test</InlineCode>,
  },
];

/** Chips outside running text: badges, tags in a field, footer chips. */
export const ROW_CHIPS: ChipCase[] = [
  {
    kind: "badge-count",
    caption: "Badge, count",
    before: "Unread",
    after: "",
    chip: <Badge variant="primary">12</Badge>,
  },
  {
    kind: "badge-text",
    caption: "Badge, text",
    before: "Status",
    after: "",
    chip: <Badge>New</Badge>,
  },
  {
    kind: "badge-mono",
    caption: "Badge, machine type",
    before: "Version",
    after: "",
    chip: <Badge variant="accent">BETA</Badge>,
  },
  {
    kind: "badge-icon",
    caption: "Badge with icon",
    before: "Sync",
    after: "",
    chip: (
      <Badge appearance="soft" variant="information">
        <Info />
        Synced
      </Badge>
    ),
  },
  {
    kind: "badge-status",
    caption: "Badge with status light",
    before: "Agent",
    after: "",
    chip: (
      <Badge appearance="soft" variant="success">
        <Status variant="success" />
        Online
      </Badge>
    ),
  },
  {
    kind: "badge-outline",
    caption: "Outline badge",
    before: "Release",
    after: "",
    chip: <Badge appearance="outline">v0.20.0</Badge>,
  },
  {
    kind: "task-status",
    caption: "Task status",
    before: "Status",
    after: "",
    chip: <TaskStatusBadge status="in-progress">In progress</TaskStatusBadge>,
  },
  {
    kind: "task-chip",
    caption: "Task chip",
    before: "Task",
    after: "",
    chip: (
      <TaskChip status="todo">
        <TaskTodoIcon />
        #21
      </TaskChip>
    ),
  },
  {
    kind: "task-chip-sm",
    caption: "Small task chip",
    before: "Task",
    after: "",
    chip: (
      <TaskChip status="todo" size="sm">
        <TaskTodoIcon />
        #21
      </TaskChip>
    ),
  },
  {
    kind: "task-card-status",
    caption: "Status on a task card",
    before: "Card",
    after: "",
    chip: (
      <TaskCardStatus status="done">
        <TaskDoneIcon />
        <span data-slot="task-card-status-label">Done</span>
        <ChevronDown />
      </TaskCardStatus>
    ),
  },
  {
    kind: "reaction",
    caption: "Reaction",
    before: "Reacted",
    after: "",
    chip: (
      <MessageReactionChip aria-label="thumbs up, 3">
        <MessageReactionGlyph>
          <span aria-hidden className="block size-[15px] rounded-[3px] bg-warning" />
        </MessageReactionGlyph>
        <MessageReactionCount>3</MessageReactionCount>
      </MessageReactionChip>
    ),
  },
  {
    kind: "saved",
    caption: "Saved marker",
    before: "Footer",
    after: "",
    chip: (
      <MessageItemSavedIndicator>
        <Bookmark />
        Saved
      </MessageItemSavedIndicator>
    ),
  },
  {
    kind: "replies",
    caption: "Replies",
    before: "Footer",
    after: "",
    chip: (
      <MessageItemBadge status="unread">
        <MessagesSquare />6 replies
        <MessageItemBadgeSeparator>·</MessageItemBadgeSeparator>3 new
      </MessageItemBadge>
    ),
  },
  {
    kind: "forwarded-file",
    caption: "Forwarded file",
    before: "File",
    after: "",
    chip: (
      <MessageForwardedBundleAttachment>
        <FileText />
        <MessageForwardedBundleAttachmentName>checklist.md</MessageForwardedBundleAttachmentName>
        <MessageForwardedBundleAttachmentMeta>· markdown</MessageForwardedBundleAttachmentMeta>
      </MessageForwardedBundleAttachment>
    ),
  },
  {
    kind: "quoted-files",
    caption: "Quoted files",
    before: "Quote",
    after: "",
    chip: <MessageQuotedPreviewAttachment>2 files</MessageQuotedPreviewAttachment>,
  },
  {
    kind: "history-limited",
    caption: "History limit",
    before: "List",
    after: "",
    chip: <MessageListHistoryLimited>older messages hidden</MessageListHistoryLimited>,
  },
];

/** Tags in a field end in a remove button. */
const FIELD_ITEMS = ["Design", "Agents"];
const FIELD_OPTIONS = [
  { value: "a", label: "Design" },
  { value: "b", label: "Agents" },
];
const FIELD_VALUE = ["a", "b"];

export function FieldChips() {
  return (
    <div className="flex w-full max-w-[420px] flex-col gap-3">
      <Combobox<string, true> multiple items={FIELD_ITEMS} defaultValue={FIELD_ITEMS}>
        <ComboboxChips>
          {FIELD_ITEMS.map((item) => (
            <ComboboxChip key={item} data-chip="combobox-chip">
              <span>{item}</span>
              <ComboboxChipRemove />
            </ComboboxChip>
          ))}
        </ComboboxChips>
      </Combobox>
      <ComboboxSelect multiple options={FIELD_OPTIONS} defaultValue={FIELD_VALUE} />
    </div>
  );
}

export function MessageChipSentences({ only }: { only?: string[] }) {
  return (
    <MessageItemContent>
      {MESSAGE_CHIPS.filter((c) => !only || only.includes(c.kind)).map((c) => (
        <p key={c.kind} data-case={c.kind}>
          {c.before}{" "}
          <span data-chip={c.kind} className="contents">
            {c.chip}
          </span>{" "}
          {c.after}
        </p>
      ))}
    </MessageItemContent>
  );
}

export function RowChips({ only }: { only?: string[] }) {
  return (
    <div className="flex flex-col gap-2 text-callout text-foreground-muted">
      {ROW_CHIPS.filter((c) => !only || only.includes(c.kind)).map((c) => (
        <div key={c.kind} data-case={c.kind} className="flex items-center gap-2">
          <span>{c.before}</span>
          <span data-chip={c.kind} className="contents">
            {c.chip}
          </span>
        </div>
      ))}
    </div>
  );
}

// ---- Ink measurement ------------------------------------------------------

const ctx = () => {
  const c = document.createElement("canvas").getContext("2d");
  if (!c) throw new Error("no 2d context");
  return c;
};

function hidden(el: Element) {
  const cs = getComputedStyle(el);
  if (cs.visibility === "hidden" || cs.opacity === "0" || cs.display === "none") return true;
  const r = el.getBoundingClientRect();
  return r.width <= 1 && r.height <= 1;
}

type Span = { left: number; right: number };

function charRect(node: Text, index: number) {
  const range = document.createRange();
  range.setStart(node, index);
  range.setEnd(node, index + 1);
  return range.getBoundingClientRect();
}

// The ink of a run of text, from the first and the last glyph: where each one
// starts on the page, plus how far its ink reaches from there. Measured glyph by
// glyph, because the page may round advances that canvas keeps fractional.
function textInk(node: Text, c: CanvasRenderingContext2D): Span | null {
  const text = node.textContent ?? "";
  const first = text.search(/\S/);
  if (first < 0) return null;
  const lastIndex = text.trimEnd().length - 1;
  const a = charRect(node, first);
  const b = charRect(node, lastIndex);
  if (!a.width || !b.width) return null;
  const cs = getComputedStyle(node.parentElement!);
  const k = parseFloat(cs.fontSize) / 1000;
  // Measure at 1000px and scale down: canvas rounds glyph bounds to pixels.
  c.font = `${cs.fontStyle} ${cs.fontWeight} 1000px ${cs.fontFamily}`;
  const ma = c.measureText(text[first]);
  const mb = c.measureText(text[lastIndex]);
  return {
    left: a.left - ma.actualBoundingBoxLeft * k,
    right: b.left + mb.actualBoundingBoxRight * k,
  };
}

function svgInk(svg: SVGSVGElement): Span | null {
  let left = Infinity;
  let right = -Infinity;
  const shapes = svg.querySelectorAll<SVGGraphicsElement>(
    "path, circle, rect, line, polyline, polygon, ellipse",
  );
  for (const shape of shapes) {
    const box = shape.getBBox();
    const m = shape.getScreenCTM();
    if (!m) continue;
    const cs = getComputedStyle(shape);
    const stroked = cs.stroke !== "none" && parseFloat(cs.strokeWidth) > 0;
    const half = stroked ? (parseFloat(cs.strokeWidth) / 2) * Math.hypot(m.a, m.b) : 0;
    for (const [x, y] of [
      [box.x, box.y],
      [box.x + box.width, box.y],
      [box.x, box.y + box.height],
      [box.x + box.width, box.y + box.height],
    ]) {
      const px = m.a * x + m.c * y + m.e;
      left = Math.min(left, px - half);
      right = Math.max(right, px + half);
    }
  }
  return Number.isFinite(left) ? { left, right } : null;
}

/** Where the first and last visible ink in a chip lies, in client pixels. */
export function inkSpan(chip: Element): Span {
  const c = ctx();
  let left = Infinity;
  let right = -Infinity;
  const add = (s: Span | null) => {
    if (!s) return;
    left = Math.min(left, s.left);
    right = Math.max(right, s.right);
  };
  const walk = (el: Element) => {
    if (hidden(el)) return;
    if (el instanceof SVGSVGElement) return add(svgInk(el));
    if (
      el instanceof HTMLImageElement ||
      el.matches("[data-slot=spinner], [data-slot=status]") ||
      (el !== chip &&
        getComputedStyle(el).backgroundColor.match(/oklch|rgb/) &&
        !/(\/ 0\)|, 0\)|transparent)/.test(getComputedStyle(el).backgroundColor) &&
        el.closest("[data-slot=combobox-chip-remove], .r-combobox-select__remove") === null)
    ) {
      const r = el.getBoundingClientRect();
      return add({ left: r.left, right: r.right });
    }
    for (const child of el.childNodes) {
      if (child.nodeType === Node.TEXT_NODE) add(textInk(child as Text, c));
      else if (child instanceof Element) walk(child);
    }
  };
  walk(chip);
  return { left, right };
}

/** The visible space from the chip's edge to its first and last ink. */
export function inkGaps(chip: Element) {
  const box = chip.getBoundingClientRect();
  const ink = inkSpan(chip);
  return { left: ink.left - box.left, right: box.right - ink.right };
}

/** The chip element a case wraps (`data-chip` is a display:contents marker). */
export function chipOf(marker: Element) {
  return (
    marker.matches("[data-chip]") && getComputedStyle(marker).display === "contents"
      ? marker.firstElementChild
      : marker
  ) as HTMLElement;
}
