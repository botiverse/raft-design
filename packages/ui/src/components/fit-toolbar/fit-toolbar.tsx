import { Toolbar as BaseToolbar } from "@base-ui/react/toolbar";
import {
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
import type { ReactNode, Ref } from "react";
import type { StyledProps } from "../../lib/styled-props";
import { useMergedRef } from "../../lib/use-merged-ref";
import { Button } from "../button/button";
import type { ButtonProps } from "../button/button";
import { ScrollArea } from "../scroll-area/scroll-area";
import { Tooltip, TooltipContent, TooltipTrigger } from "../tooltip/tooltip";
import { fitToolbar } from "./fit-toolbar.recipe";

/**
 * The ways an item gives way, each one step:
 * - `label`: its label hides and its icon stays (the label stays its accessible name);
 * - `more`: it moves into More;
 * - `collapse`: a group shows its one button instead of its items (a Filter button for its filters);
 * - `wrap`: a group moves to a line of its own, only in a toolbar that allows it.
 */
export type FitStep = "label" | "more" | "collapse" | "wrap";

/** When each of an item's steps comes: lower gives way first; at the same number, the last item first. */
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
const STEPS: readonly FitStep[] = ["label", "more", "collapse", "wrap"];
const ID = "data-fit-id";
const DECLARED = "data-fit-steps";
const MORE_TRIGGER = "data-fit-more-trigger";
const SHOWN = "data-fit-shown";
const WRAPPING = "data-fit-wrapping";
const ROW = "data-fit-row";
const NO_WRAP = "data-fit-first-line";
const WRAP_LINE = "data-fit-wrap-line";
const BREAK = "data-fit-break";

const stepAttribute = (step: FitStep) => `data-fit-${step}`;

function declare(steps: FitSteps) {
  return STEPS.filter((step) => steps[step] !== undefined)
    .map((step) => `${step}:${steps[step]}`)
    .join(" ");
}

/** What a row holds, looking through `display: contents` wrappers. */
function boxes(element: Element): Element[] {
  return Array.from(element.children).flatMap((child) =>
    getComputedStyle(child).display === "contents" ? boxes(child) : [child],
  );
}

/**
 * Nothing pokes out of the toolbar or out of any of its rows, and no line has
 * broken by itself: while groups wrap, each line (one `order`) stays one line.
 */
function fits(root: HTMLElement) {
  const rows = [root, ...root.querySelectorAll<HTMLElement>(`[${ROW}]`)];
  const inside = rows.every((row) => {
    if (row.getClientRects().length === 0) return true;
    const style = getComputedStyle(row);
    const end =
      row.getBoundingClientRect().right -
      parseFloat(style.borderRightWidth) -
      parseFloat(style.paddingRight);
    return boxes(row).every(
      (box) => box.getClientRects().length === 0 || box.getBoundingClientRect().right <= end + 0.5,
    );
  });
  if (!inside) return false;
  // A scrolling group gives way by scrolling, but shows one item whole at least.
  for (const scroller of root.querySelectorAll<HTMLElement>("[data-fit-scroll]")) {
    if (scroller.getClientRects().length === 0) continue;
    const content = scroller.querySelector("[data-slot=scroll-area-content]") ?? scroller;
    const first = boxes(content).find((box) => box.getClientRects().length > 0);
    if (first && scroller.clientWidth + 0.5 < first.getBoundingClientRect().width) return false;
  }
  if (!root.hasAttribute(WRAPPING)) return true;
  const tops = new Map<string, number>();
  for (const child of Array.from(root.children)) {
    if (child.hasAttribute(BREAK) || child.getClientRects().length === 0) continue;
    const line = getComputedStyle(child).order;
    const top = child.getBoundingClientRect().top;
    const first = tops.get(line);
    if (first === undefined) tops.set(line, top);
    else if (Math.abs(first - top) > 0.5) return false;
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
        if (step === "wrap") return allowWrap && !item.hasAttribute(NO_WRAP);
        return true;
      }),
  );
  queue.sort((a, b) => a.order - b.order || b.index - a.index);

  const taken = new Map<HTMLElement, Set<FitStep>>();
  const history: { element: HTMLElement; step: FitStep }[] = [];
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

  for (const { element, step } of queue) {
    if (fits(root)) break;
    // An item in More has nothing left to give.
    if (taken.get(element)?.has("more")) continue;
    take(element, step);
    history.push({ element, step });
  }

  // A group that wrapped has room again on its new line: give back, last
  // first, what its items gave before it wrapped, wherever the toolbar still
  // fits without it. Taken from nothing on every measure, so a width always
  // gives the same result, narrowing or widening.
  for (let index = history.length - 1; index >= 0; index -= 1) {
    const { element, step } = history[index]!;
    if (step === "wrap") continue;
    const group = element.closest<HTMLElement>(`[${stepAttribute("wrap")}]`);
    if (!group || !root.contains(group)) continue;
    const wrappedAt = history.findIndex(
      (entry) => entry.element === group && entry.step === "wrap",
    );
    if (wrappedAt < index) continue;
    undo(element, step);
    if (!fits(root)) take(element, step);
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
export function FitToolbar({ className, wrap = false, ref, ...props }: FitToolbarProps) {
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

  const context = useMemo(() => ({ applied, store }), [applied, store]);

  return (
    <FitToolbarContext.Provider value={context}>
      <BaseToolbar.Root
        ref={setRef}
        data-slot="fit-toolbar"
        data-fit-wrapping={applied.wrapping ? "" : undefined}
        className={root({ className })}
        {...props}
      />
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
      edges();
    };
    const revealActive = () => {
      const active = group.querySelectorAll("[data-active]");
      // The last first, so the first one active wins the view.
      for (const item of Array.from(active).reverse()) reveal(item);
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
    group.addEventListener("scroll", edges, { passive: true });
    group.addEventListener("wheel", onWheel, { passive: false });
    group.addEventListener("focusin", onFocus);
    const resize =
      typeof ResizeObserver === "undefined"
        ? null
        : new ResizeObserver(() => {
            revealActive();
            edges();
          });
    resize?.observe(group);
    const changes = new MutationObserver((records) => {
      if (
        records.some(
          (record) => record.type !== "attributes" || record.attributeName === "data-active",
        )
      ) {
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
      group.removeEventListener("scroll", edges);
      group.removeEventListener("wheel", onWheel);
      group.removeEventListener("focusin", onFocus);
      resize?.disconnect();
      changes.disconnect();
    };
  }, [group]);
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
  overflow,
  children,
  ref,
  ...props
}: FitToolbarGroupProps & { ref?: Ref<HTMLDivElement> }) {
  const { group, full, short, scroller, scrollContent } = fitToolbar({
    scroll: overflow === "scroll",
  });
  const [scrollerElement, setScroller] = useState<HTMLDivElement | null>(null);
  useScrollGroup(overflow === "scroll" ? scrollerElement : null);
  const item = useFitItem({
    wrap: wrapOrder,
    collapse: collapsed === undefined ? undefined : (collapseOrder ?? 0),
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
        // The filters' own row, a horizontal ScrollArea as slock web's
        // FilterStrip: a small scrollbar only while it scrolls, no tab stop of
        // its own (each item is one); its padding is the items' hit area.
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
  /** Its icon, which stays when its label gives way. */
  icon: ReactNode;
  /** Its label: its accessible name and, once it has given way, its tooltip. */
  children: ReactNode;
  /** When its label gives way (the `label` step). */
  labelOrder?: number;
  /** When it moves into More (the `more` step). */
  moreOrder?: number;
  /** What it is in More's menu. */
  moreItem?: ReactNode;
};

/**
 * A toolbar button that can give way: an `md` Button (ghost unless you say)
 * with an icon and a label, an icon square with its label as a tooltip from
 * `labelOrder` on, and hidden from `moreOrder` on.
 */
export function FitToolbarButton({
  icon,
  children,
  labelOrder,
  moreOrder,
  moreItem,
  variant = "ghost",
  className,
  ...props
}: FitToolbarButtonProps) {
  const { button, label } = fitToolbar();
  const item = useFitItem({ label: labelOrder, more: moreOrder, moreItem });

  return (
    <Tooltip disabled={!item.taken("label")}>
      <TooltipTrigger
        data-slot="button"
        render={
          <BaseToolbar.Button
            render={
              <Button
                variant={variant}
                size="md"
                className={button({ className })}
                {...item.props}
                {...props}
              />
            }
          />
        }
      >
        {icon}
        <span data-slot="fit-toolbar-button-label" className={label()}>
          {children}
        </span>
      </TooltipTrigger>
      <TooltipContent>{children}</TooltipContent>
    </Tooltip>
  );
}
