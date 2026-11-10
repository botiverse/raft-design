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
import { fitToolbar } from "./fit-toolbar.recipe";

/**
 * The ways an item gives way, each one step:
 * - `label`: its label hides and its icon stays (the label stays its accessible name);
 * - `more`: it moves into More;
 * - `group`: a group shows its one button instead of its items (a Filter button for its filters);
 * - `plus`: a primary action shows as + alone;
 * - `wrap`: a group moves to a line of its own, only in a toolbar that allows it.
 */
export type FitStep = "label" | "more" | "group" | "plus" | "wrap";

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
const STEPS: readonly FitStep[] = ["label", "more", "group", "plus", "wrap"];
const ID = "data-fit-id";
const DECLARED = "data-fit-steps";
const MORE_TRIGGER = "data-fit-more-trigger";
const SHOWN = "data-fit-shown";
const WRAPPING = "data-fit-wrapping";
const ROW = "data-fit-row";
const NO_WRAP = "data-fit-first-line";

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

/** Nothing pokes out of the toolbar or out of any of its rows. */
function fits(root: HTMLElement) {
  const rows = [root, ...root.querySelectorAll<HTMLElement>(`[${ROW}]`)];
  return rows.every((row) => {
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
  }
  for (const trigger of triggers) trigger.removeAttribute(SHOWN);
  root.removeAttribute(WRAPPING);

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
  let wrapping = false;
  for (const { element, step } of queue) {
    if (fits(root)) break;
    const steps = taken.get(element) ?? new Set<FitStep>();
    // An item in More has nothing left to give.
    if (steps.has("more")) continue;
    steps.add(step);
    taken.set(element, steps);
    element.setAttribute(stepAttribute(step), "");
    if (step === "more") for (const trigger of triggers) trigger.setAttribute(SHOWN, "");
    if (step === "wrap") {
      wrapping = true;
      root.setAttribute(WRAPPING, "");
    }
  }

  const items = new Map<string, ReadonlySet<FitStep>>();
  const more: string[] = [];
  for (const element of elements) {
    const steps = taken.get(element);
    if (!steps) continue;
    const id = element.getAttribute(ID)!;
    items.set(id, steps);
    if (steps.has("more")) more.push(id);
  }
  return { items, more, wrapping };
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
  const [setRef] = useMergedRef<HTMLDivElement>(rootRef, ref);
  const [applied, setApplied] = useState<Applied>(NONE);
  const [store] = useState(createMoreItemStore);

  const update = useCallback(() => {
    const element = rootRef.current;
    if (!element) return;
    const next = measure(element, wrap);
    setApplied((previous) => (keyOf(previous) === keyOf(next) ? previous : next));
  }, [wrap]);

  // After every render (an item came, went or changed its label), and when
  // its region changes width or a font arrives.
  useLayoutEffect(update);
  useLayoutEffect(() => {
    const region = rootRef.current?.parentElement;
    if (!region) return;
    const resize = typeof ResizeObserver === "undefined" ? null : new ResizeObserver(update);
    resize?.observe(region);
    const fonts = typeof document === "undefined" ? undefined : document.fonts;
    fonts?.addEventListener?.("loadingdone", update);
    return () => {
      resize?.disconnect();
      fonts?.removeEventListener?.("loadingdone", update);
    };
  }, [update]);

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
  /** When it shows `collapsed` instead of its items (the `group` step). */
  collapseOrder?: number;
  /** The group as one button (a Filter button for its filters), shown once it collapses. */
  collapsed?: ReactNode;
};

/**
 * A group of items in one row, a fixed gap apart. A toolbar wraps only
 * between groups; each group that wraps takes a line of its own, the last
 * first.
 */
export function FitToolbarGroup({
  className,
  wrapOrder = 0,
  firstLine = false,
  collapseOrder,
  collapsed,
  children,
  ...props
}: FitToolbarGroupProps) {
  const { group, full, short } = fitToolbar();
  const item = useFitItem({
    wrap: wrapOrder,
    group: collapsed === undefined ? undefined : (collapseOrder ?? 0),
  });

  return (
    <BaseToolbar.Group
      data-slot="fit-toolbar-group"
      data-fit-row=""
      data-fit-first-line={firstLine ? "" : undefined}
      className={group({ className })}
      {...item.props}
      {...props}
    >
      {collapsed === undefined ? (
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
