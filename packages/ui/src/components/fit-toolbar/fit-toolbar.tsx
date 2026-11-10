import { Toolbar as BaseToolbar } from "@base-ui/react/toolbar";
import {
  cloneElement,
  createContext,
  Fragment,
  useCallback,
  useContext,
  useId,
  useLayoutEffect,
  useMemo,
  useRef,
  useState,
  useSyncExternalStore,
} from "react";
import { ChevronDown, MoreHorizontal, Plus, Search, X } from "lucide-react";
import type {
  CSSProperties,
  FocusEvent as ReactFocusEvent,
  ReactElement,
  ReactNode,
  Ref,
} from "react";
import { laidOutChildren } from "../../lib/laid-out-children";
import { useAttachCount } from "../../lib/use-attach-count";
import type { StyledProps } from "../../lib/styled-props";
import { useMergedRef } from "../../lib/use-merged-ref";
import { Button } from "../button/button";
import type { ButtonProps } from "../button/button";
import { ButtonSplit, ButtonSplitMain, ButtonSplitMenu } from "../button/button-split";
import type { ButtonSplitMainProps } from "../button/button-split";
import { InputGroup, InputGroupAddon, InputGroupInput } from "../input-group/input-group";
import type { InputGroupInputProps } from "../input-group/input-group";
import { PickerTriggerButton } from "../picker-trigger-button/picker-trigger-button";
import type { PickerTriggerButtonProps } from "../picker-trigger-button/picker-trigger-button";
import { ScrollArea } from "../scroll-area/scroll-area";
import { Tooltip, TooltipContent, TooltipTrigger } from "../tooltip/tooltip";
import { fitToolbar } from "./fit-toolbar.recipe";

/**
 * The ways an item gives way, each one step:
 * - `label`: its label hides and its icon stays (the label stays its accessible name);
 * - `more`: it moves into More;
 * - `collapse`: a group shows its one button instead of its items (a Filter button for its filters);
 * - `wrap`: a group moves to a line of its own, only in a toolbar that allows it;
 * - `plus`: a primary action shows as + alone (the label stays its accessible name).
 */
export type FitStep = "label" | "more" | "collapse" | "wrap" | "plus";

/**
 * When each of an item's steps comes, one order for the whole toolbar: lower
 * gives way first; at the same number, the last item first, and one item's
 * steps in the order of `FitStep`.
 */
export type FitSteps = Partial<Record<FitStep, number>>;

type Applied = {
  /** The steps taken by each item, by its id. */
  items: ReadonlyMap<string, ReadonlySet<FitStep>>;
  /** The items in More, in their order. */
  more: readonly string[];
  /** A group has moved to a line of its own. */
  wrapping: boolean;
};

const NONE: Applied = { items: new Map(), more: [], wrapping: false };
const STEPS: readonly FitStep[] = ["label", "more", "collapse", "wrap", "plus"];
const ID = "data-fit-id";
const DECLARED = "data-fit-steps";
const MORE_TRIGGER = "data-fit-more-trigger";
const SHOWN = "data-fit-shown";
const WRAPPING = "data-fit-wrapping";
const ROW = "data-fit-row";
const NO_WRAP = "data-fit-first-line";
const WRAP_LINE = "data-fit-wrap-line";
const BREAK = "data-fit-break";

const NEEDS_ICON = "data-fit-needs-icon";
const PINNED_END = "[data-slot=fit-toolbar-group-end]";

const stepAttribute = (step: FitStep) => `data-fit-${step}`;

const hasIcon = (item: Element) => item.querySelector("svg, img") !== null;

/** The group has a `wrap` step it may take: the toolbar wraps and the page lets it. */
function canWrap(group: HTMLElement, allowWrap: boolean) {
  return (
    allowWrap &&
    !group.hasAttribute(NO_WRAP) &&
    / wrap:/.test(` ${group.getAttribute(DECLARED) ?? ""}`)
  );
}

function declare(steps: FitSteps) {
  return STEPS.filter((step) => steps[step] !== undefined)
    .map((step) => `${step}:${steps[step]}`)
    .join(" ");
}

/**
 * Nothing pokes out of the toolbar or out of any of its rows, and no line has
 * broken by itself: while groups wrap, each line (one `order`) stays one line.
 */
function fits(root: HTMLElement, allowWrap: boolean) {
  const rows = [root, ...root.querySelectorAll<HTMLElement>(`[${ROW}]`)];
  const inside = rows.every((row) => {
    if (row.getClientRects().length === 0) return true;
    const style = getComputedStyle(row);
    const end =
      row.getBoundingClientRect().right -
      parseFloat(style.borderRightWidth) -
      parseFloat(style.paddingRight);
    return laidOutChildren(row).every((box) => box.getBoundingClientRect().right <= end + 0.5);
  });
  if (!inside) return false;
  // A scrolling group gives way by scrolling, but shows one item whole at least.
  // Scrolling is its last state: while it can still wrap and hasn't, its
  // content must fit whole, so the labels and the wrap come first and only a
  // group on a line of its own scrolls (sindresorhus, 780px, 2026-11-10).
  for (const group of root.querySelectorAll<HTMLElement>("[data-fit-scroll]")) {
    if (group.getClientRects().length === 0) continue;
    const content = group.querySelector("[data-slot=scroll-area-content]") ?? group;
    const scroller = group.querySelector<HTMLElement>("[data-fit-scroller]") ?? group;
    const [first] = laidOutChildren(content);
    if (first && scroller.clientWidth + 0.5 < first.getBoundingClientRect().width) return false;
    if (canWrap(group, allowWrap) && !group.hasAttribute(stepAttribute("wrap"))) {
      if (scroller.scrollWidth > scroller.clientWidth + 0.5) return false;
    }
  }
  if (!root.hasAttribute(WRAPPING)) return true;
  // Items of different heights centered on one line start at different tops:
  // a line has broken only where an item sits wholly below or above its first.
  const lines = new Map<string, DOMRect>();
  for (const child of laidOutChildren(root)) {
    if (child.hasAttribute(BREAK)) continue;
    const line = getComputedStyle(child).order;
    const rect = child.getBoundingClientRect();
    const first = lines.get(line);
    if (first === undefined) lines.set(line, rect);
    else if (rect.top >= first.bottom - 0.5 || rect.bottom <= first.top + 0.5) return false;
  }
  return true;
}

/**
 * Takes the steps one at a time, in their order, until the toolbar fits its
 * region; writes each on the DOM as it goes (React renders the same after)
 * and returns them. It starts from nothing taken every time, so the outcome
 * depends on the width alone.
 */
function measure(root: HTMLElement, allowWrap: boolean): Applied {
  const elements = Array.from(root.querySelectorAll<HTMLElement>(`[${ID}]`));
  // Taking the steps from nothing squeezes a scrolling group (to 0px on a full
  // first line), which loses where the person scrolled it: keep it.
  const scrolled = Array.from(
    root.querySelectorAll<HTMLElement>("[data-fit-scroller]"),
    (scroller) => [scroller, scroller.scrollLeft] as const,
  );
  const triggers = Array.from(root.querySelectorAll<HTMLElement>(`[${MORE_TRIGGER}]`));
  for (const element of elements) {
    for (const step of STEPS) element.removeAttribute(stepAttribute(step));
    element.style.removeProperty("order");
  }
  for (const trigger of triggers) trigger.removeAttribute(SHOWN);
  root.removeAttribute(WRAPPING);
  for (const line of Array.from(root.querySelectorAll(`:scope > [${BREAK}]`))) line.remove();
  root.style.setProperty("--fit-gap", getComputedStyle(root).columnGap);

  const queue = elements.flatMap((element, index) =>
    (element.getAttribute(DECLARED) ?? "")
      .split(" ")
      .filter(Boolean)
      .map((entry) => {
        const [step, order] = entry.split(":") as [FitStep, string];
        return { element, step, order: Number(order), index };
      })
      .filter(({ step, element: item }) => {
        if (step === "more") return triggers.length > 0;
        if (step === "wrap") return canWrap(item, allowWrap);
        // An item with no icon to show refuses its `label` step: a SegmentedControl
        // of text alone (Mine and All) keeps its labels and counts.
        if (step === "label") return !item.hasAttribute(NEEDS_ICON) || hasIcon(item);
        return true;
      }),
  );
  queue.sort((a, b) => a.order - b.order || b.index - a.index);

  // Items of the same kind in one group change form at the same time: the
  // same form step (`label`, `plus`) at the same number in one group is one
  // step for all of them. A group already says its items are one kind, and a
  // row of filters half icons and half labels reads as broken (sindresorhus,
  // Tasks at 780px; Jasper, 2026-11-10).
  const batches: { members: HTMLElement[]; step: FitStep }[] = [];
  const byKind = new Map<string, { members: HTMLElement[]; step: FitStep }>();
  for (const { element, step, order } of queue) {
    const group =
      step === "label" || step === "plus"
        ? element.parentElement?.closest<HTMLElement>("[data-slot=fit-toolbar-group]")
        : null;
    const kind = group ? `${group.getAttribute(ID)}|${step}|${order}` : undefined;
    const existing = kind === undefined ? undefined : byKind.get(kind);
    if (existing) {
      existing.members.push(element);
      continue;
    }
    const batch = { members: [element], step };
    batches.push(batch);
    if (kind !== undefined) byKind.set(kind, batch);
  }

  const taken = new Map<HTMLElement, Set<FitStep>>();
  const history: { members: HTMLElement[]; step: FitStep }[] = [];
  const showMore = () => {
    const shown = Array.from(taken.values()).some((steps) => steps.has("more"));
    for (const trigger of triggers) trigger.toggleAttribute(SHOWN, shown);
  };
  const take = (element: HTMLElement, step: FitStep) => {
    const steps = taken.get(element) ?? new Set<FitStep>();
    steps.add(step);
    taken.set(element, steps);
    element.setAttribute(stepAttribute(step), "");
    if (step === "more") showMore();
    if (step === "wrap") layOutLines(root, elements);
  };
  const undo = (element: HTMLElement, step: FitStep) => {
    taken.get(element)?.delete(step);
    element.removeAttribute(stepAttribute(step));
    if (step === "more") showMore();
  };

  for (const { members, step } of batches) {
    if (fits(root, allowWrap)) break;
    // An item in More, or in a group in More, has nothing left to give.
    const giving = members.filter(
      (element) =>
        !taken.get(element)?.has("more") &&
        element.parentElement?.closest(`[${stepAttribute("more")}]`) == null,
    );
    if (giving.length === 0) continue;
    for (const element of giving) take(element, step);
    history.push({ members: giving, step });
  }

  // A group that wrapped has room again on its new line: give back, last
  // first, what its items gave before it wrapped, wherever the toolbar still
  // fits without it. Taken from nothing on every measure, so a width always
  // gives the same result, narrowing or widening.
  for (let index = history.length - 1; index >= 0; index -= 1) {
    const { members, step } = history[index]!;
    if (step === "wrap") continue;
    const group = members[0]!.closest<HTMLElement>(`[${stepAttribute("wrap")}]`);
    if (!group || !root.contains(group)) continue;
    const wrappedAt = history.findIndex(
      (entry) => entry.members.includes(group) && entry.step === "wrap",
    );
    if (wrappedAt < index) continue;
    // What is pinned at a scrolling group's end keeps the form it took: Clear
    // all stays × on the filters' line while the filters get their labels back.
    const back = members.filter((element) => element.closest(PINNED_END) === null);
    if (back.length === 0) continue;
    for (const element of back) undo(element, step);
    if (!fits(root, allowWrap)) for (const element of back) take(element, step);
  }

  const items = new Map<string, ReadonlySet<FitStep>>();
  const more: string[] = [];
  let wrapping = false;
  for (const element of elements) {
    const steps = taken.get(element);
    if (!steps || steps.size === 0) continue;
    const id = element.getAttribute(ID)!;
    items.set(id, steps);
    if (steps.has("more")) more.push(id);
    if (steps.has("wrap")) wrapping = true;
  }
  for (const [scroller, left] of scrolled) scroller.scrollLeft = left;
  return { items, more, wrapping };
}

/**
 * Puts the wrapped groups on the lines after the first: groups with the same
 * `wrapLine` share a line, in their order; any other takes one of its own.
 * A zero-height break before each line ends the one before it.
 */
function layOutLines(root: HTMLElement, elements: readonly HTMLElement[]) {
  root.setAttribute(WRAPPING, "");
  for (const line of Array.from(root.querySelectorAll(`:scope > [${BREAK}]`))) line.remove();
  const lines: string[] = [];
  for (const group of elements) {
    if (!group.hasAttribute(stepAttribute("wrap"))) continue;
    const line = group.getAttribute(WRAP_LINE) ?? `#${group.getAttribute(ID)}`;
    let number = lines.indexOf(line);
    if (number < 0) {
      number = lines.push(line) - 1;
      const lineBreak = document.createElement("span");
      lineBreak.setAttribute(BREAK, "");
      lineBreak.setAttribute("aria-hidden", "true");
      lineBreak.style.cssText = `flex-basis: 100%; height: 0; order: ${2 * number + 1}`;
      root.append(lineBreak);
    }
    group.style.order = String(2 * number + 2);
  }
}

/** What the arrow keys stop on: every control a person can reach, a segment each. */
const STOP = [
  "button",
  "a[href]",
  "input",
  "select",
  "textarea",
  "[role=button]",
  "[role=radio]",
  "[role=checkbox]",
  "[role=switch]",
  "[role=combobox]",
].join(", ");

/** The line an element is on: the CSS `order` of the toolbar's flex item that holds it. */
function lineOf(element: HTMLElement, root: HTMLElement) {
  const chain: HTMLElement[] = [];
  for (let node: HTMLElement | null = element; node && node !== root; node = node.parentElement) {
    chain.unshift(node);
  }
  const item = chain.find((node) => getComputedStyle(node).display !== "contents") ?? element;
  return Number(getComputedStyle(item).order) || 0;
}

/**
 * The toolbar's controls in reading order: line by line as they show, in the
 * order of the DOM on each line. Wrapped groups move with CSS `order`, which
 * neither the browser's focus order nor Base UI's list follows (WCAG 2.4.3).
 * Leaves out what isn't shown (in More, a collapsed group's items), what is
 * disabled natively, hidden from assistive technology or `inert` (the first
 * line under an open search), or a popup's focus guard.
 */
function readingOrder(root: HTMLElement): HTMLElement[] {
  const controls = Array.from(root.querySelectorAll<HTMLElement>(STOP)).filter(
    (control) =>
      !control.matches(":disabled") &&
      control.closest("[aria-hidden=true], [inert]") === null &&
      !control.hasAttribute("data-base-ui-focus-guard") &&
      control.getClientRects().length > 0,
  );
  const lines = new Map(controls.map((control) => [control, lineOf(control, root)]));
  // A stable sort: the DOM's order on each line.
  return controls.sort((a, b) => lines.get(a)! - lines.get(b)!);
}

/**
 * A text field keeps the arrow keys while its caret has somewhere to go, as
 * in Base UI's composite: only at its start or end does an arrow leave it.
 */
function keepsArrow(target: HTMLElement, forward: boolean) {
  if (!(target instanceof HTMLInputElement || target instanceof HTMLTextAreaElement)) return false;
  let start: number | null;
  try {
    start = target.selectionStart;
  } catch {
    return false;
  }
  if (start === null) return false;
  if (start !== target.selectionEnd) return true;
  return forward ? start < target.value.length : start > 0;
}

const keyOf = (applied: Applied) =>
  `${applied.wrapping}|${Array.from(applied.items, ([id, steps]) => `${id}:${[...steps].join(",")}`).join(";")}`;

/**
 * What each item shows in More while it is there, outside React state: the
 * items write it on every render, and only `FitToolbarMoreItems` (in an open
 * menu) reads it.
 */
function createMoreItemStore() {
  const items = new Map<string, ReactNode>();
  const listeners = new Set<() => void>();
  let version = 0;
  const notify = () => {
    version += 1;
    for (const listener of listeners) listener();
  };
  return {
    set(id: string, item: ReactNode) {
      items.set(id, item);
      notify();
    },
    delete(id: string) {
      if (items.delete(id)) notify();
    },
    get: (id: string) => items.get(id),
    subscribe: (listener: () => void) => {
      listeners.add(listener);
      return () => {
        listeners.delete(listener);
      };
    },
    version: () => version,
  };
}

type FitToolbarContextValue = {
  applied: Applied;
  store: ReturnType<typeof createMoreItemStore>;
};

const FitToolbarContext = createContext<FitToolbarContextValue | null>(null);

export type FitToolbarProps = StyledProps<BaseToolbar.Root.Props> & {
  ref?: Ref<HTMLDivElement>;
  /**
   * Groups may move to a line of their own (the `wrap` step) when the row
   * runs out of room. Off for a toolbar that floats over content: a second
   * line would cover it, so its last step is into More.
   */
  wrap?: boolean;
};

/**
 * A toolbar whose items give way, in named steps and an order the items
 * declare, as the region it sits in narrows: it measures its content in its
 * own width, never the window's. The steps are written on each item as
 * `data-fit-<step>` for its styles. A Base UI Toolbar: one Tab stop, the
 * arrow keys inside.
 */
export function FitToolbar({ className, wrap = false, ref, children, ...props }: FitToolbarProps) {
  const { root } = fitToolbar();
  const rootRef = useRef<HTMLDivElement | null>(null);
  // The element as state too, so the observers follow a swapped element and
  // its region, not the first one an effect read.
  const [element, setElement] = useState<HTMLDivElement | null>(null);
  const [setRef] = useMergedRef<HTMLDivElement>(rootRef, setElement, ref);
  const [applied, setApplied] = useState<Applied>(NONE);
  const [store] = useState(createMoreItemStore);

  const update = useCallback(() => {
    const current = rootRef.current;
    if (!current) return;
    const next = measure(current, wrap);
    setApplied((previous) => (keyOf(previous) === keyOf(next) ? previous : next));
  }, [wrap]);

  // After every render (an item came, went or changed its label); when its
  // region changes width; when its content changes on its own (a label that
  // becomes "Copied", a count, an item that comes or goes inside a child that
  // rendered alone); and when a font arrives.
  useLayoutEffect(update);
  useLayoutEffect(() => {
    if (!element) return;
    const region = element.parentElement;
    const resize = typeof ResizeObserver === "undefined" ? null : new ResizeObserver(update);
    if (region) resize?.observe(region);
    const content =
      typeof MutationObserver === "undefined"
        ? null
        : new MutationObserver((records) => {
            // The line breaks it inserts itself are not a change of content.
            const own = (node: Node) => node instanceof Element && node.hasAttribute(BREAK);
            const changed = records.some(
              (record) =>
                record.type === "characterData" ||
                ![...record.addedNodes, ...record.removedNodes].every(own),
            );
            if (changed) update();
          });
    content?.observe(element, { childList: true, subtree: true, characterData: true });
    const fonts = typeof document === "undefined" ? undefined : document.fonts;
    fonts?.addEventListener?.("loadingdone", update);
    return () => {
      resize?.disconnect();
      content?.disconnect();
      fonts?.removeEventListener?.("loadingdone", update);
    };
  }, [element, update]);

  // Focus follows the reading order (WCAG 2.4.3), not the DOM's: a wrapped
  // group sits later on screen than where it is in the DOM. The arrow keys go
  // through the controls line by line, and Tab first enters at the first
  // control on screen, then wherever the person last was.
  const tabbing = useRef(false);
  const entered = useRef(false);
  useLayoutEffect(() => {
    const onKey = (event: KeyboardEvent) => {
      tabbing.current = event.key === "Tab";
    };
    const off = () => {
      tabbing.current = false;
    };
    document.addEventListener("keydown", onKey, true);
    document.addEventListener("keyup", off, true);
    document.addEventListener("pointerdown", off, true);
    return () => {
      document.removeEventListener("keydown", onKey, true);
      document.removeEventListener("keyup", off, true);
      document.removeEventListener("pointerdown", off, true);
    };
  }, []);

  const horizontal = (props.orientation ?? "horizontal") === "horizontal";
  const { onKeyDownCapture, onFocus, loopFocus = true } = props;
  const handleKeyDown = useCallback(
    (event: Parameters<NonNullable<BaseToolbar.Root.Props["onKeyDownCapture"]>>[0]) => {
      onKeyDownCapture?.(event);
      const current = rootRef.current;
      if (!current || !horizontal || event.defaultPrevented) return;
      if (event.altKey || event.ctrlKey || event.metaKey || event.shiftKey) return;
      const target = event.target as HTMLElement;
      // Up and Down do nothing in a horizontal toolbar, a SegmentedControl's
      // segments too: its radio group would choose the next segment as it
      // moved, while Left and Right only move between the toolbar's items.
      if (event.key === "ArrowUp" || event.key === "ArrowDown") {
        if (target.closest("[role=radiogroup]") && current.contains(target)) {
          event.preventDefault();
          event.stopPropagation();
        }
        return;
      }
      if (event.key !== "ArrowLeft" && event.key !== "ArrowRight") return;
      const rtl = getComputedStyle(current).direction === "rtl";
      const forward = (event.key === "ArrowRight") !== rtl;
      if (keepsArrow(target, forward)) return;
      const order = readingOrder(current);
      const index = order.findIndex((control) => control === target || control.contains(target));
      if (index < 0) return;
      let next = index + (forward ? 1 : -1);
      if (next < 0 || next >= order.length) {
        if (!loopFocus) return;
        next = (next + order.length) % order.length;
      }
      // Ours alone: neither Base UI's toolbar (the DOM's order) nor a
      // SegmentedControl's radio group (which would choose as it moves).
      event.preventDefault();
      event.stopPropagation();
      if (next !== index) order[next]!.focus();
    },
    [horizontal, loopFocus, onKeyDownCapture],
  );
  const handleFocus = useCallback(
    (event: Parameters<NonNullable<BaseToolbar.Root.Props["onFocus"]>>[0]) => {
      onFocus?.(event);
      const current = rootRef.current;
      if (!current) return;
      const from = event.relatedTarget;
      const fromOutside = !(from instanceof Node && current.contains(from));
      if (fromOutside && tabbing.current && !entered.current) {
        entered.current = true;
        const [first] = readingOrder(current);
        if (first && first !== event.target) {
          first.focus();
          return;
        }
      }
      entered.current = true;
    },
    [onFocus],
  );

  // The focused item moving into More (or hidden by any other step) would
  // drop focus to the page: it goes to More instead, where the item now is.
  const lastFocused = useRef<HTMLElement | null>(null);
  useLayoutEffect(() => {
    if (!element) return;
    const onFocusIn = (event: FocusEvent) => {
      lastFocused.current = event.target as HTMLElement;
    };
    const onFocusOut = (event: FocusEvent) => {
      // Still shown as it blurs: the person moved focus away themselves.
      if ((event.target as HTMLElement).getClientRects().length > 0) lastFocused.current = null;
    };
    element.addEventListener("focusin", onFocusIn);
    element.addEventListener("focusout", onFocusOut);
    return () => {
      element.removeEventListener("focusin", onFocusIn);
      element.removeEventListener("focusout", onFocusOut);
    };
  }, [element]);
  useLayoutEffect(() => {
    const current = rootRef.current;
    const last = lastFocused.current;
    if (!current || !last || last.getClientRects().length > 0) return;
    const active = document.activeElement;
    if (active !== last && active !== document.body && active !== null) return;
    const more = Array.from(current.querySelectorAll<HTMLElement>(`[${MORE_TRIGGER}]`)).find(
      (trigger) => trigger.getClientRects().length > 0,
    );
    lastFocused.current = null;
    more?.focus();
  }, [applied]);

  // Rendered before it was in the document, its items registered while
  // detached, and Base UI's list numbered none of them: no item held the Tab
  // stop. Once attached, an item mounted then (hidden, never a stop) makes
  // the list number them all again, the person's state kept (no remount).
  const attached = useAttachCount(element);

  const context = useMemo(() => ({ applied, store }), [applied, store]);

  return (
    <FitToolbarContext.Provider value={context}>
      <BaseToolbar.Root
        ref={setRef}
        data-slot="fit-toolbar"
        data-fit-wrapping={applied.wrapping ? "" : undefined}
        className={root({ className })}
        {...props}
        onKeyDownCapture={handleKeyDown}
        onFocus={handleFocus}
      >
        {children}
        {attached === 0 ? null : (
          <BaseToolbar.Link key={attached} render={<span hidden data-fit-renumber="" />} />
        )}
      </BaseToolbar.Root>
    </FitToolbarContext.Provider>
  );
}

/**
 * Inside a FitToolbar: a control that would measure its own fit (a
 * SegmentedControl's `iconsOnlyBelow`) leaves it to the toolbar's steps.
 */
export function useInFitToolbar() {
  return useContext(FitToolbarContext) !== null;
}

export type FitItemOptions = FitSteps & {
  /** What the item is in More's menu while it is there (`FitToolbarMoreItems`). */
  moreItem?: ReactNode;
};

/**
 * Makes an element an item of the nearest FitToolbar: spread `props` on it.
 * Says which steps it has taken, for what it renders (a tooltip once its
 * label is gone, say).
 */
export function useFitItem({ moreItem, ...steps }: FitItemOptions = {}) {
  const id = useId();
  const context = useContext(FitToolbarContext);
  const taken = context?.applied.items.get(id);
  const store = context?.store;
  const declared = declare(steps);

  useLayoutEffect(() => {
    if (moreItem !== undefined) store?.set(id, moreItem);
  });
  useLayoutEffect(() => () => store?.delete(id), [store, id]);

  const props: Record<string, string | undefined> = {
    [ID]: id,
    [DECLARED]: declared || undefined,
  };
  for (const step of STEPS) props[stepAttribute(step)] = taken?.has(step) ? "" : undefined;

  return {
    id,
    props,
    /** Steps it has taken. */
    taken: (step: FitStep) => taken?.has(step) ?? false,
  };
}

/**
 * Makes an element the toolbar's More: spread `props` on it. It shows only
 * while an item is in More (`data-fit-shown`); hide it otherwise.
 */
export function useFitMore() {
  const shown = (useContext(FitToolbarContext)?.applied.more.length ?? 0) > 0;
  return {
    shown,
    props: { [MORE_TRIGGER]: "", [SHOWN]: shown ? "" : undefined } as Record<
      string,
      string | undefined
    >,
  };
}

/** The items in More, in their order, each as its `moreItem`: put it in More's menu. */
export function FitToolbarMoreItems() {
  const context = useContext(FitToolbarContext);
  const store = context?.store;
  useSyncExternalStore(
    store?.subscribe ?? noSubscription,
    store?.version ?? noVersion,
    store?.version ?? noVersion,
  );
  if (!context) return null;
  return context.applied.more.map((id) => <Fragment key={id}>{context.store.get(id)}</Fragment>);
}

export type FitToolbarMoreProps = Omit<
  ButtonProps,
  "children" | "size" | "variant" | "render" | "loading" | "loadingLabel"
> & {
  /**
   * Its menu's trigger, which opens the menu holding `FitToolbarMoreItems`:
   * `<DropdownMenuTrigger />`. It renders it as a toolbar button.
   */
  trigger: ReactElement<{ render?: unknown }>;
  /** Its accessible name and tooltip, in the page's language: "More" by default, in English. */
  "aria-label"?: string;
  /** Its icon: ⋯ by default. */
  children?: ReactNode;
};

/**
 * The toolbar's More as one toolbar item: a ghost ⋯ icon button, shown only
 * while an item is in More, its name as a tooltip. Put it where the items it
 * holds were: on a list's toolbar, before the primary action.
 */
export function FitToolbarMore({
  trigger,
  "aria-label": label = "More",
  children,
  className,
  ...props
}: FitToolbarMoreProps) {
  const { more } = fitToolbar();
  const fit = useFitMore();
  const ownTrigger = cloneElement(trigger, {
    render: (
      <Button
        variant="ghost"
        size="icon-md"
        aria-label={label}
        className={more({ className })}
        {...fit.props}
        {...props}
      />
    ),
  });
  return (
    <Tooltip>
      <TooltipTrigger data-slot="button" render={<BaseToolbar.Button render={ownTrigger} />}>
        {children ?? <MoreHorizontal />}
      </TooltipTrigger>
      <TooltipContent>{label}</TooltipContent>
    </Tooltip>
  );
}

const noSubscription = () => () => {};
const noVersion = () => 0;

export type FitToolbarGroupProps = StyledProps<BaseToolbar.Group.Props> & {
  /** When it moves to a line of its own (the `wrap` step), in a toolbar that allows it. */
  wrapOrder?: number;
  /** Stays on the first line: it never wraps. The page decides which groups do. */
  firstLine?: boolean;
  /**
   * Groups with the same `wrapLine` wrap onto the same line, in their order, a
   * fixed gap apart; a group without one takes a line of its own.
   */
  wrapLine?: string;
  /** When it shows `collapsed` instead of its items (the `collapse` step). */
  collapseOrder?: number;
  /**
   * When the whole group moves into More (the `more` step), its items
   * together: the sort, the grouping and the view switch of a list's toolbar,
   * folded into one menu. Give the group a `moreItem` for More's menu.
   */
  moreOrder?: number;
  /** What the group is in More's menu while it is there (`FitToolbarMoreItems`). */
  moreItem?: ReactNode;
  /**
   * Pinned at the group's end, outside its scroll, with `overflow="scroll"`:
   * Clear all, as ×, at the end of the filters' line. It changes form with
   * the group's items and keeps the form it took once the group wraps, while
   * the items get theirs back.
   */
  end?: ReactNode;
  /** The group as one button (a Filter button for its filters), shown once it collapses. */
  collapsed?: ReactNode;
  /**
   * `scroll`: the group takes the rest of its line and scrolls sideways
   * instead of giving way, its items whole, the side that hides more fading.
   * Mark an applied or chosen item `data-active`: it is kept in view.
   */
  overflow?: "scroll";
};

/**
 * A scrolling group: which side hides more (`data-overflow`, for
 * `mask-fade-x`), a vertical wheel scrolling it, and its `data-active` items
 * and the focused one kept in view, clear of the fade, with no animation.
 * The same as slock web's FilterStrip, so the two behave alike.
 */
function useScrollGroup(group: HTMLElement | null) {
  useLayoutEffect(() => {
    if (!group) return;
    const edges = () => {
      const max = group.scrollWidth - group.clientWidth;
      const start = group.scrollLeft > 1;
      const end = max > 1 && group.scrollLeft < max - 1;
      const next = start && end ? "both" : start ? "start" : end ? "end" : null;
      if (next) group.setAttribute("data-overflow", next);
      else group.removeAttribute("data-overflow");
    };
    // Where it last scrolled itself: a scroll anywhere else is the person's,
    // and from then on a resize leaves it there.
    let placed = group.scrollLeft;
    let scrolledByPerson = false;
    const onScroll = () => {
      if (Math.abs(group.scrollLeft - placed) > 1) scrolledByPerson = true;
      edges();
    };
    const reveal = (item: Element | null) => {
      if (!(item instanceof HTMLElement) || !group.contains(item)) return;
      const fade = parseFloat(getComputedStyle(group).getPropertyValue("--fade-edge")) || 24;
      const left = item.getBoundingClientRect().left - group.getBoundingClientRect().left;
      const start = left + group.scrollLeft;
      const end = start + item.offsetWidth;
      if (start - fade < group.scrollLeft) group.scrollLeft = Math.max(0, start - fade);
      else if (end + fade > group.scrollLeft + group.clientWidth) {
        group.scrollLeft = end + fade - group.clientWidth;
      }
      placed = group.scrollLeft;
      edges();
    };
    // The item to keep in view: the one that last became active (on mount
    // the first active), never every active one, so a filter just applied
    // comes into view even when another is active before it.
    let target: Element | null = group.querySelector("[data-active]");
    const revealActive = () => {
      if (!target || !group.contains(target) || !target.hasAttribute("data-active")) {
        target = group.querySelector("[data-active]");
      }
      reveal(target);
    };
    const onWheel = (event: WheelEvent) => {
      if (group.scrollWidth <= group.clientWidth) return;
      if (Math.abs(event.deltaY) <= Math.abs(event.deltaX)) return;
      const before = group.scrollLeft;
      group.scrollLeft += event.deltaY;
      if (group.scrollLeft !== before) event.preventDefault();
    };
    const onFocus = (event: FocusEvent) => reveal(event.target as Element);
    revealActive();
    edges();
    group.addEventListener("scroll", onScroll, { passive: true });
    group.addEventListener("wheel", onWheel, { passive: false });
    group.addEventListener("focusin", onFocus);
    const resize =
      typeof ResizeObserver === "undefined"
        ? null
        : new ResizeObserver(() => {
            // Its first layouts (the toolbar measuring, the group wrapping)
            // keep the active item in view, until the person scrolls it.
            if (!scrolledByPerson) revealActive();
            edges();
          });
    resize?.observe(group);
    // Only an item becoming active brings it back into view: a count or a
    // label changing inside the group leaves where the person scrolled it.
    const activated = (node: Node) =>
      node instanceof Element
        ? node.hasAttribute("data-active")
          ? node
          : node.querySelector("[data-active]")
        : null;
    const changes = new MutationObserver((records) => {
      const newly = records
        .flatMap((record) =>
          record.type === "attributes"
            ? [
                record.target instanceof Element && record.target.hasAttribute("data-active")
                  ? record.target
                  : null,
              ]
            : Array.from(record.addedNodes, activated),
        )
        .filter((node): node is Element => node !== null)
        .at(-1);
      if (newly) {
        target = newly;
        scrolledByPerson = false;
        revealActive();
      }
      edges();
    });
    changes.observe(group, {
      childList: true,
      subtree: true,
      characterData: true,
      attributes: true,
      attributeFilter: ["data-active"],
    });
    return () => {
      group.removeEventListener("scroll", onScroll);
      group.removeEventListener("wheel", onWheel);
      group.removeEventListener("focusin", onFocus);
      resize?.disconnect();
      changes.disconnect();
    };
  }, [group]);
}

let warnedEndWithoutScroll = false;
function warnEndWithoutScroll() {
  if (warnedEndWithoutScroll) return;
  warnedEndWithoutScroll = true;
  console.warn(
    'raft-ui: a FitToolbarGroup has `end` without `overflow="scroll"`; it is not rendered. Pin an item at the end of a scrolling group only, or put it among the group\'s children.',
  );
}

/**
 * A group of items in one row, a fixed gap apart. A toolbar wraps only
 * between groups, the last first; groups with the same `wrapLine` share a
 * line, any other takes one of its own.
 */
export function FitToolbarGroup({
  className,
  wrapOrder = 0,
  firstLine = false,
  wrapLine,
  collapseOrder,
  collapsed,
  moreOrder,
  moreItem,
  overflow,
  end,
  children,
  ref,
  ...props
}: FitToolbarGroupProps & { ref?: Ref<HTMLDivElement> }) {
  const pinned = overflow === "scroll" && end !== undefined && end !== null;
  if (process.env.NODE_ENV !== "production" && !pinned && end !== undefined && end !== null) {
    warnEndWithoutScroll();
  }
  const {
    group,
    full,
    short,
    scroller,
    scrollContent,
    end: endSlot,
  } = fitToolbar({
    scroll: overflow === "scroll",
    pinned,
  });
  const [scrollerElement, setScroller] = useState<HTMLDivElement | null>(null);
  useScrollGroup(overflow === "scroll" ? scrollerElement : null);
  const item = useFitItem({
    wrap: wrapOrder,
    collapse: collapsed === undefined ? undefined : (collapseOrder ?? 0),
    more: moreOrder,
    moreItem,
  });

  return (
    <BaseToolbar.Group
      ref={ref}
      data-slot="fit-toolbar-group"
      data-fit-row={overflow === "scroll" ? undefined : ""}
      data-fit-scroll={overflow === "scroll" ? "" : undefined}
      data-fit-first-line={firstLine ? "" : undefined}
      data-fit-wrap-line={wrapLine}
      className={group({ className })}
      {...item.props}
      {...props}
    >
      {overflow === "scroll" ? (
        <>
          {/* The filters' own row, a horizontal ScrollArea as slock web's
              FilterStrip: a small scrollbar only while it scrolls, no tab stop
              of its own (each item is one); its padding is the items' hit area. */}
          <ScrollArea
            ref={setScroller}
            orientation="horizontal"
            overscroll="contain"
            size="small"
            trigger="scroll"
            tabIndex={-1}
            data-fit-scroller=""
            className={scroller()}
            contentClassName={scrollContent()}
          >
            {children}
          </ScrollArea>
          {pinned ? (
            <span data-slot="fit-toolbar-group-end" className={endSlot()}>
              {end}
            </span>
          ) : null}
        </>
      ) : collapsed === undefined ? (
        children
      ) : (
        <>
          <span data-slot="fit-toolbar-group-items" className={full()}>
            {children}
          </span>
          <span data-slot="fit-toolbar-group-collapsed" className={short()}>
            {collapsed}
          </span>
        </>
      )}
    </BaseToolbar.Group>
  );
}

export type FitToolbarButtonProps = Omit<ButtonProps, "children" | "size"> & {
  /** Its icon, which stays when its label gives way. A button with a `label` step needs one (or a `collapsedIcon`). */
  icon?: ReactNode;
  /**
   * An icon shown only once its label has given way (the `label` step), in
   * place of `icon`: a button that reads as text while it has room ("Clear
   * filters") and as an icon (×) once it hasn't.
   */
  collapsedIcon?: ReactNode;
  /** Its label: its accessible name and, once it has given way, its tooltip. */
  children: ReactNode;
  /** When its label gives way (the `label` step). */
  labelOrder?: number;
  /**
   * When it shows as + alone, its icon and label gone (the `plus` step): for
   * the primary action, after the groups have wrapped.
   */
  plusOrder?: number;
  /** When it moves into More (the `more` step). */
  moreOrder?: number;
  /** What it is in More's menu. */
  moreItem?: ReactNode;
};

/**
 * A toolbar button that can give way: an `md` Button (ghost unless you say)
 * with an icon and a label, an icon square with its label as a tooltip from
 * `labelOrder` on, a + square with its label as a tooltip from `plusOrder`
 * on, and hidden from `moreOrder` on.
 */
export function FitToolbarButton({
  icon,
  collapsedIcon,
  children,
  labelOrder,
  plusOrder,
  moreOrder,
  moreItem,
  variant = "ghost",
  className,
  ...props
}: FitToolbarButtonProps) {
  const {
    button,
    label,
    icon: iconSlot,
    plus,
    fullIcon,
    collapsedIcon: collapsedSlot,
  } = fitToolbar();
  const item = useFitItem({ label: labelOrder, more: moreOrder, plus: plusOrder, moreItem });
  const icons =
    collapsedIcon === undefined ? (
      icon
    ) : (
      <>
        {icon === undefined ? null : (
          <span data-slot="fit-toolbar-button-full-icon" className={fullIcon()}>
            {icon}
          </span>
        )}
        <span data-slot="fit-toolbar-button-collapsed-icon" className={collapsedSlot()}>
          {collapsedIcon}
        </span>
      </>
    );

  return (
    <Tooltip disabled={!item.taken("label") && !item.taken("plus")}>
      <TooltipTrigger
        data-slot="button"
        render={
          <BaseToolbar.Button
            render={
              <Button
                variant={variant}
                size="md"
                className={button({ className })}
                data-fit-needs-icon=""
                {...item.props}
                {...props}
              />
            }
          />
        }
      >
        {plusOrder === undefined ? (
          icons
        ) : (
          <>
            <span data-slot="fit-toolbar-button-icon" className={iconSlot()}>
              {icons}
            </span>
            <Plus data-slot="fit-toolbar-button-plus" aria-hidden className={plus()} />
          </>
        )}
        <span data-slot="fit-toolbar-button-label" className={label()}>
          {children}
        </span>
      </TooltipTrigger>
      <TooltipContent>{children}</TooltipContent>
    </Tooltip>
  );
}

export type FitToolbarSplitButtonProps = Omit<ButtonSplitMainProps, "children" | "size"> & {
  /** Its icon, which stays when its label gives way (the `label` step). */
  icon?: ReactNode;
  /** The main part's label: its accessible name and, once it has given way, its tooltip. */
  children: ReactNode;
  /**
   * The name of the pair, a `role="group"`, in the page's language ("New
   * agent"): not the main part's name ([Button › Split buttons](../button/button.md#split-buttons)).
   */
  groupLabel: string;
  /** The menu part's accessible name and tooltip ("More ways to create an agent"). */
  menuLabel: string;
  /**
   * The menu's trigger, which opens the menu of the other ways:
   * `<DropdownMenuTrigger />`. It renders it as the split's ▾, a toolbar button.
   */
  menuTrigger: ReactElement<{ render?: unknown }>;
  /** When the main part shows its icon alone (the `label` step); needs an `icon`. */
  labelOrder?: number;
  /**
   * When the main part shows as + alone, its icon and label gone (the `plus`
   * step): for the primary action, after the groups have wrapped. The ▾ stays.
   */
  plusOrder?: number;
  /** Disables both parts, as on `ButtonSplit`. */
  disabled?: boolean;
};

/**
 * A split button (Button › Split buttons) as one toolbar item: the main
 * action and its ▾, which opens a menu of other ways to the same result
 * (Create agent and its ▾). The pair takes its steps as a whole: from
 * `labelOrder` on the main part shows its icon alone, from `plusOrder` on +
 * alone, its label kept as its accessible name and tooltip, while the ▾
 * stays beside it. It never moves into More: a menu item can't hold a menu of
 * its own, and the primary action stays on the toolbar. Both parts are
 * toolbar buttons: one Tab stop for the toolbar, the arrow keys reaching the
 * main part, then the ▾. Props other than these go on the main part.
 */
export function FitToolbarSplitButton({
  icon,
  children,
  groupLabel,
  menuLabel,
  menuTrigger,
  labelOrder,
  plusOrder,
  disabled = false,
  variant = "default",
  className,
  ...props
}: FitToolbarSplitButtonProps) {
  const { split, splitMain, label, icon: iconSlot, plus } = fitToolbar();
  // With no icon there is nothing to show once the label is gone: the pair
  // refuses its `label` step (its ▾ is no icon of the action).
  const item = useFitItem({
    label: icon === undefined ? undefined : labelOrder,
    plus: plusOrder,
  });
  const ownTrigger = cloneElement(menuTrigger, {
    render: <ButtonSplitMenu variant={variant} size="md" aria-label={menuLabel} />,
  });

  return (
    <ButtonSplit
      aria-label={groupLabel}
      disabled={disabled}
      data-fit-split=""
      className={split()}
      {...item.props}
    >
      <Tooltip disabled={!item.taken("label") && !item.taken("plus")}>
        <TooltipTrigger
          data-slot="button"
          render={
            <BaseToolbar.Button
              render={
                <ButtonSplitMain
                  variant={variant}
                  size="md"
                  className={splitMain({ className })}
                  {...props}
                />
              }
            />
          }
        >
          {plusOrder === undefined ? (
            icon
          ) : (
            <>
              <span data-slot="fit-toolbar-button-icon" className={iconSlot()}>
                {icon}
              </span>
              <Plus data-slot="fit-toolbar-button-plus" aria-hidden className={plus()} />
            </>
          )}
          <span data-slot="fit-toolbar-button-label" className={label()}>
            {children}
          </span>
        </TooltipTrigger>
        <TooltipContent>{children}</TooltipContent>
      </Tooltip>
      <Tooltip>
        <TooltipTrigger data-slot="button" render={<BaseToolbar.Button render={ownTrigger} />} />
        <TooltipContent>{menuLabel}</TooltipContent>
      </Tooltip>
    </ButtonSplit>
  );
}

export type FitToolbarPickerProps = Omit<PickerTriggerButtonProps, "children" | "render"> & {
  /**
   * The picker's trigger, which opens its popup: `<PopoverTrigger />`,
   * `<DropdownMenuTrigger />` or a Base UI `Menu.Trigger`. The picker renders
   * it as a toolbar button, so the page nests nothing itself.
   */
  trigger: ReactElement<{ render?: unknown }>;
  /** Its icon, which stays when its label gives way. */
  icon: ReactNode;
  /** Its label ("Assignee"): part of its accessible name and, once it has given way, its tooltip. */
  children: ReactNode;
  /**
   * What is chosen: the value ("In progress", "Kirby") or a count (`1`). It
   * stays in view when the label gives way, and follows the label in the
   * accessible name. A count (a number, or a string of digits) is set in Space
   * Mono, as machine-written text; any other value keeps the label's font.
   */
  value?: ReactNode;
  /** When its label gives way (the `label` step). */
  labelOrder?: number;
  /** When it moves into More (the `more` step). */
  moreOrder?: number;
  /** What it is in More's menu. */
  moreItem?: ReactNode;
};

/** A count: a number, or a string of digits. Space Mono is for machine-written text only. */
const isCount = (node: ReactNode) =>
  typeof node === "number" || (typeof node === "string" && /^\d+$/.test(node.trim()));

const text = (node: ReactNode) =>
  typeof node === "string" || typeof node === "number" ? String(node) : undefined;

/**
 * A picker's trigger as one toolbar item (a filter: Assignee, Channel): a
 * PickerTriggerButton with an icon, a label, what is chosen and a chevron,
 * filled `info-soft` once a value is chosen, as an applied filter is
 * (Select › Filters). From `labelOrder` on its label gives way, while its
 * icon, what is chosen and the chevron stay ("# ⌄", "👤 1 ⌄"); its label
 * stays its accessible name, read before the value ("Assignee 1"), and shows
 * as its tooltip.
 */
export function FitToolbarPicker({
  trigger,
  icon,
  children,
  value,
  labelOrder,
  moreOrder,
  moreItem,
  className,
  ...props
}: FitToolbarPickerProps) {
  const { picker, label, pickerValue, chevron } = fitToolbar({ count: isCount(value) });
  const item = useFitItem({ label: labelOrder, more: moreOrder, moreItem });
  const hasValue = value !== undefined && value !== null && value !== false && value !== "";
  // The name says what the picker is, then what is chosen. Given whole when
  // both are text, so it never depends on how the spans are read together.
  const name =
    text(children) !== undefined && (!hasValue || text(value) !== undefined)
      ? [text(children), hasValue ? text(value) : undefined].filter(Boolean).join(" ")
      : undefined;
  const ownTrigger = cloneElement(trigger, {
    render: (
      <PickerTriggerButton
        className={picker({ className })}
        aria-label={name}
        data-has-value={hasValue ? "" : undefined}
        data-fit-needs-icon=""
        {...item.props}
        {...props}
      />
    ),
  });

  return (
    <Tooltip disabled={!item.taken("label")}>
      <TooltipTrigger data-slot="button" render={<BaseToolbar.Button render={ownTrigger} />}>
        {icon}
        <span data-slot="fit-toolbar-picker-label" className={label()}>
          {children}
          {hasValue && name === undefined ? " " : null}
        </span>
        {hasValue ? (
          <span data-slot="fit-toolbar-picker-value" className={pickerValue()}>
            {value}
          </span>
        ) : null}
        <span
          data-slot="fit-toolbar-picker-chevron"
          data-picker-trigger-indicator=""
          aria-hidden
          className={chevron()}
        >
          <ChevronDown />
        </span>
      </TooltipTrigger>
      <TooltipContent>{children}</TooltipContent>
    </Tooltip>
  );
}

const COVERED = "data-fit-search-covered";

/** How many FitToolbarSearch fields each toolbar root holds (`data-fit-search`). */
const searchesByRoot = new WeakMap<HTMLElement, number>();

/**
 * While a collapsed search is open in the scope's place, the first line's
 * items before it (the scope) are under it: hidden (their room kept, so the
 * toolbar measures the same) and `inert`, so neither the pointer, the arrow
 * keys nor assistive technology reach what can't be seen. The items after it
 * (More, the primary action) and the wrapped lines stay as they are.
 */
function coverScope(root: HTMLElement, search: HTMLElement) {
  const covered: HTMLElement[] = [];
  for (const child of Array.from(root.children)) {
    if (!(child instanceof HTMLElement)) continue;
    if (child === search || child.contains(search)) break;
    if (child.hasAttribute(BREAK)) continue;
    if ((Number(getComputedStyle(child).order) || 0) > 0) continue;
    if (child.hasAttribute("inert")) continue;
    child.setAttribute(COVERED, "");
    child.setAttribute("inert", "");
    child.style.visibility = "hidden";
    covered.push(child);
  }
  return () => {
    for (const child of covered) {
      if (!child.hasAttribute(COVERED)) continue;
      child.removeAttribute(COVERED);
      child.removeAttribute("inert");
      child.style.removeProperty("visibility");
    }
  };
}

type SearchKeyEvent = Parameters<NonNullable<InputGroupInputProps["onKeyDown"]>>[0];

export type FitToolbarSearchProps = Omit<
  InputGroupInputProps,
  "className" | "value" | "defaultValue" | "onValueChange" | "aria-label" | "render"
> & {
  /** Its accessible name ("Search tasks"): the field's and, once it is an icon, the button's, and the button's tooltip. */
  "aria-label": string;
  /** The text, when the page holds it. */
  value?: string;
  /** The text it starts with, when it holds its own. */
  defaultValue?: string;
  /** Called with the new text as the person types, clears it or presses Esc. */
  onValueChange?: (value: string) => void;
  /**
   * The least it may be, in px, before the toolbar gives way. By default it
   * is measured: what its search icon and its whole placeholder (or, with
   * none, its `aria-label`) take, in the field's own font, so the empty field
   * always shows what it is for.
   */
  minWidth?: number;
  /**
   * When it shows as a search icon button at the start of its line instead
   * of the field (the `collapse` step): the toolbar's last step. Without it,
   * it never collapses.
   */
  collapseOrder?: number;
  /** The icon at the field's start and on the button: a search icon by default. */
  icon?: ReactNode;
  /** The clear button's accessible name ("Clear search"): with it, the field has one at its end once it has text. */
  clearLabel?: string;
  /** For the field's box (the InputGroup). */
  className?: string;
  style?: CSSProperties;
};

/**
 * The search field of a list's toolbar: it fills the rest of its line and
 * keeps at least the room its icon and its whole placeholder take (measured,
 * or `minWidth`), so the toolbar's other steps come before
 * it is squeezed. From `collapseOrder` on it is a search icon button at the
 * start of the line, which opens the field in the scope's place, More and the
 * primary action kept at the line's end; the
 * field closes once it is empty and loses focus, or on Esc. A search with
 * text stays open. Put it straight in the FitToolbar, between its groups.
 */
export function FitToolbarSearch({
  "aria-label": label,
  value,
  defaultValue = "",
  onValueChange,
  minWidth,
  collapseOrder,
  icon = <Search />,
  clearLabel,
  className,
  style,
  onKeyDown,
  disabled,
  ref,
  ...props
}: FitToolbarSearchProps) {
  const { search, searchButton, searchSpacer, searchField, searchInput, searchSizer } =
    fitToolbar();
  const item = useFitItem({ collapse: collapseOrder });
  const collapsed = item.taken("collapse");
  const [own, setOwn] = useState(defaultValue);
  const text = value ?? own;
  // Open while the person opened it or focus is in the field, and always
  // while it has text. Focus on its button alone doesn't open it: the button
  // goes inert once the field is open, which would blur it before its click.
  const [opened, setOpened] = useState(false);
  const open = collapsed && (opened || text !== "");

  const wrapper = useRef<HTMLDivElement | null>(null);
  const field = useRef<HTMLDivElement | null>(null);
  const spacer = useRef<HTMLSpanElement | null>(null);
  const input = useRef<HTMLInputElement | null>(null);
  const button = useRef<HTMLButtonElement | null>(null);
  const [setInput] = useMergedRef<HTMLInputElement>(input, ref);
  const sizer = useRef<HTMLDivElement | null>(null);
  const sizerText = useRef<HTMLSpanElement | null>(null);
  const focusOnOpen = useRef(false);
  const focusButtonOnClose = useRef(false);

  // The toolbar holds a search: its scrolling group keeps its items' width
  // beside it (`data-fit-search` on the root, which styles what is inside it).
  useLayoutEffect(() => {
    const root = wrapper.current?.closest<HTMLElement>("[data-slot=fit-toolbar]");
    if (!root) return;
    // Counted, not queried: when React runs this cleanup the field's own
    // node is still in the DOM, so a query would always find it.
    const count = (searchesByRoot.get(root) ?? 0) + 1;
    searchesByRoot.set(root, count);
    root.setAttribute("data-fit-search", "");
    return () => {
      const left = (searchesByRoot.get(root) ?? 1) - 1;
      if (left > 0) {
        searchesByRoot.set(root, left);
      } else {
        searchesByRoot.delete(root);
        root.removeAttribute("data-fit-search");
      }
    };
  }, []);

  // The least the empty field needs to show what it is for: its icon and
  // its whole placeholder, measured in the input's own font by a hidden copy
  // of the field, never guessed from a count of characters. Kept in state and
  // measured again only when the copy changes size: a font arriving, the
  // placeholder changing with the language. A width measured once is a fixed
  // threshold, so the field and its button never flip back and forth.
  const [measured, setMeasured] = useState<number | null>(null);
  const placeholder = typeof props.placeholder === "string" ? props.placeholder : label;
  useLayoutEffect(() => {
    const copy = sizer.current;
    const words = sizerText.current;
    const real = input.current;
    if (!copy || !words || !real || minWidth !== undefined) return;
    const read = () => {
      const style = getComputedStyle(real);
      words.style.font = style.font;
      words.style.letterSpacing = style.letterSpacing;
      words.style.paddingInlineEnd = style.paddingInlineEnd;
      const width = Math.ceil(copy.getBoundingClientRect().width);
      if (width <= 0) return;
      wrapper.current?.style.setProperty("--fit-search-min", `${width}px`);
      setMeasured(width);
    };
    read();
    const resize = typeof ResizeObserver === "undefined" ? null : new ResizeObserver(read);
    resize?.observe(copy);
    const fonts = typeof document === "undefined" ? undefined : document.fonts;
    fonts?.addEventListener?.("loadingdone", read);
    return () => {
      resize?.disconnect();
      fonts?.removeEventListener?.("loadingdone", read);
    };
  }, [minWidth, placeholder, icon]);
  const least = minWidth ?? measured;

  const change = useCallback(
    (next: string) => {
      setOwn(next);
      onValueChange?.(next);
    },
    [onValueChange],
  );

  // Open: in the scope's place, from the toolbar's start to the end of its
  // spacer, so More and the primary action stay at the line's end, reachable
  // (Jasper, 2026-11-10, #1159); centered on the line the button and its
  // spacer hold; out of the row's flow, so the toolbar measures the same open
  // or closed.
  useLayoutEffect(() => {
    const box = field.current;
    const line = spacer.current;
    const root = wrapper.current?.closest<HTMLElement>("[data-slot=fit-toolbar]");
    if (!box || !line || !root || !open) return;
    const place = () => {
      const style = getComputedStyle(root);
      const edge = root.getBoundingClientRect();
      const slot = line.getBoundingClientRect();
      const end =
        style.direction === "rtl"
          ? slot.left - edge.left - parseFloat(style.borderLeftWidth)
          : edge.right - parseFloat(style.borderRightWidth) - slot.right;
      box.style.insetInlineStart = style.paddingInlineStart;
      box.style.insetInlineEnd = `${end}px`;
      box.style.top = `${line.offsetTop + (line.offsetHeight - box.offsetHeight) / 2}px`;
    };
    place();
    const uncover = coverScope(root, wrapper.current!);
    const resize = typeof ResizeObserver === "undefined" ? null : new ResizeObserver(place);
    resize?.observe(root);
    resize?.observe(line);
    if (focusOnOpen.current) {
      focusOnOpen.current = false;
      input.current?.focus();
    }
    return () => {
      resize?.disconnect();
      uncover();
      for (const side of ["inset-inline-start", "inset-inline-end", "top"]) {
        box.style.removeProperty(side);
      }
    };
  }, [open]);

  // Back to its button once it has closed: the button is inert while the
  // field is open, so it can take focus only after the field has gone.
  useLayoutEffect(() => {
    if (open || !focusButtonOnClose.current) return;
    focusButtonOnClose.current = false;
    if (collapsed) button.current?.focus();
  });

  const close = useCallback(() => {
    setOpened(false);
    focusOnOpen.current = false;
  }, []);

  const handleFocus = useCallback(() => setOpened(true), []);
  // Leaving the field closes it; one with text stays open all the same.
  const handleBlur = useCallback(
    (event: ReactFocusEvent<HTMLDivElement>) => {
      const to = event.relatedTarget;
      if (to instanceof Node && field.current?.contains(to)) return;
      close();
    },
    [close],
  );

  const handleKeyDown = useCallback(
    (event: SearchKeyEvent) => {
      onKeyDown?.(event);
      if (event.defaultPrevented || event.key !== "Escape") return;
      // Esc while an input method composes (Chinese, Japanese) ends the
      // composition: it is the IME's, not the field's.
      if (event.nativeEvent.isComposing) return;
      // Esc empties the field first, focus kept in it; a second Esc closes an
      // open field back to its button. A field that isn't collapsed lets the
      // second Esc go on to the page.
      if (text === "" && !collapsed) return;
      event.preventDefault();
      event.stopPropagation();
      if (text !== "") {
        change("");
        return;
      }
      focusButtonOnClose.current = true;
      close();
    },
    [change, close, collapsed, onKeyDown, text],
  );

  const clear = useCallback(() => {
    change("");
    input.current?.focus();
  }, [change]);

  const openField = useCallback(() => {
    focusOnOpen.current = true;
    setOpened(true);
  }, []);

  return (
    <div
      ref={wrapper}
      data-slot="fit-toolbar-search"
      className={search()}
      style={least === null ? undefined : ({ "--fit-search-min": `${least}px` } as CSSProperties)}
      {...item.props}
    >
      <div aria-hidden inert data-slot="fit-toolbar-search-sizer" className={searchSizer()}>
        <InputGroup ref={sizer} size="md" className="w-max">
          <InputGroupAddon>{icon}</InputGroupAddon>
          <span ref={sizerText} className="whitespace-pre">
            {placeholder}
          </span>
        </InputGroup>
      </div>
      <Tooltip disabled={!collapsed || open}>
        <TooltipTrigger
          data-slot="button"
          render={
            <BaseToolbar.Button
              ref={button}
              disabled={disabled}
              render={
                <Button
                  variant="ghost"
                  size="icon-md"
                  aria-label={label}
                  data-fit-search-button=""
                  inert={open || undefined}
                  className={searchButton()}
                  onClick={openField}
                />
              }
            />
          }
        >
          {icon}
        </TooltipTrigger>
        <TooltipContent>{label}</TooltipContent>
      </Tooltip>
      <span
        ref={spacer}
        aria-hidden
        data-slot="fit-toolbar-search-spacer"
        className={searchSpacer()}
      />
      <InputGroup
        ref={field}
        size="md"
        data-fit-search-field=""
        data-open={open ? "" : undefined}
        className={searchField({ className })}
        style={style}
        onFocus={handleFocus}
        onBlur={handleBlur}
      >
        <InputGroupAddon>{icon}</InputGroupAddon>
        <BaseToolbar.Input
          render={
            <InputGroupInput
              ref={setInput}
              type="search"
              aria-label={label}
              className={searchInput()}
              disabled={disabled}
              {...props}
              value={text}
              onValueChange={change}
              onKeyDown={handleKeyDown}
            />
          }
        />
        {clearLabel !== undefined && text !== "" ? (
          <InputGroupAddon align="inline-end">
            <BaseToolbar.Button
              render={
                <Button variant="ghost" size="icon-md" aria-label={clearLabel} onClick={clear}>
                  <X />
                </Button>
              }
            />
          </InputGroupAddon>
        ) : null}
      </InputGroup>
    </div>
  );
}
